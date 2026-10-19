import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

/**
 * Server-side speech synthesis built on the Microsoft Edge Read-Aloud
 * endpoint (no API key required).
 */

export interface NormalizedVoice {
  shortName: string;
  name: string;
  gender: string;
  locale: string;
  localeName: string;
}

let voicesCache: Promise<NormalizedVoice[]> | null = null;

// Raw voice payloads changed shape across versions -> normalize defensively.
function normalizeVoice(raw: unknown): NormalizedVoice | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const shortName = String(v.ShortName ?? v.shortName ?? "");
  if (!shortName) return null;
  const name = String(
    v.FriendlyName ?? v.friendlyName ?? v.DisplayName ?? v.Name ?? shortName,
  );
  return {
    shortName,
    name: name.replace(/^Microsoft\s+/, "").replace(/\s+-\s+/, " "),
    gender: String(v.Gender ?? v.gender ?? "Unknown"),
    locale: String(v.Locale ?? v.locale ?? shortName.split("-").slice(0, 2).join("-")),
    localeName: String(v.LocaleName ?? v.localeName ?? v.Locale ?? ""),
  };
}

export async function getVoices(): Promise<NormalizedVoice[]> {
  if (!voicesCache) {
    voicesCache = (async () => {
      const tts = new MsEdgeTTS();
      const raw = (await tts.getVoices()) as unknown[];
      const list = raw
        .map(normalizeVoice)
        .filter((v): v is NormalizedVoice => v !== null);
      if (!list.length) throw new Error("empty voices list");
      return list;
    })().catch((err) => {
      voicesCache = null;
      throw err;
    });
  }
  return voicesCache;
}

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export interface SynthOptions {
  rate?: number; // 0.5 - 2.0 relative speed
  pitch?: number; // semitone offset -4..+4
}

export async function synthesizeSpeech(
  text: string,
  voice: string,
  options: SynthOptions = {},
): Promise<Buffer> {
  const allowList = await getVoices();
  if (!allowList.some((v) => v.shortName === voice)) {
    throw new Error(`Unknown voice: ${voice}`);
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "masmoo-tts-"));
  try {
    const pitch = options.pitch ?? 0;
    const rate = options.rate ?? 1;
    const { audioFilePath, metadataFilePath } = await tts.toFile(
      dir,
      xmlEscape(text.trim()),
      {
        rate,
        pitch: `${pitch >= 0 ? "+" : ""}${pitch}st`,
      },
    );
    let filePath = audioFilePath;
    if (!filePath) {
      const found = (await fs.readdir(dir)).find((f) => f.endsWith(".mp3"));
      if (!found) throw new Error("synthesis did not write a file");
      filePath = path.join(dir, found);
    }
    const buf = await fs.readFile(filePath);
    if (metadataFilePath) await fs.rm(metadataFilePath, { force: true }).catch(() => {});
    if (!buf.length) throw new Error("synthesis produced an empty file");
    return buf;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
