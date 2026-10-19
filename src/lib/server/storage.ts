import { promises as fs } from "fs";
import path from "path";

/** Local on-disk storage for rendered audio files. */
export const STORAGE_DIR = path.join(process.cwd(), "storage", "audio");

export async function ensureStorage(): Promise<void> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

const SAFE_ID = /^[a-z0-9-]{8,64}$/i;

export function filePathFor(id: string, ext: string): string | null {
  const cleanExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!SAFE_ID.test(id) || !cleanExt) return null;
  return path.join(STORAGE_DIR, `${id}.${cleanExt}`);
}

export const MIME_BY_EXT: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
};
