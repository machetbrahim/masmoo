/**
 * Client-side audio pipeline:
 * decode → mix voice + (generated | uploaded) music with sidechain-style
 * ducking → offline render → encode to MP3 or WAV.
 */
import { MOODS, type MoodKey } from "./mood";
import { scheduleMusic } from "./music";

const TARGET_SR = 44100;

let decodeCtx: OfflineAudioContext | null = null;

export async function decodeAudio(data: ArrayBuffer): Promise<AudioBuffer> {
  if (!decodeCtx) decodeCtx = new OfflineAudioContext(1, 1, TARGET_SR);
  // decodeAudioData detaches the buffer, so pass a copy
  const copy = data.slice(0);
  try {
    return await decodeCtx.decodeAudioData(copy);
  } catch {
    return await new Promise<AudioBuffer>((resolve, reject) => {
      decodeCtx!.decodeAudioData(copy.slice(0), resolve, reject);
    });
  }
}

export async function decodeFile(file: File | Blob): Promise<AudioBuffer> {
  return decodeAudio(await file.arrayBuffer());
}

/* ------------------------- ducking envelope ------------------------- */

const ENV_HZ = 20; // envelope resolution (points per second)
const ENV_WINDOW = 0.05; // 50ms RMS windows

/**
 * Loudness envelope (0..1) of sequential voice chunks, smoothed with a fast
 * attack / slow release so the music breathes with the narration.
 */
export function computeVoiceEnvelope(
  chunks: AudioBuffer[],
  gap: number,
  tail: number,
): Float32Array {
  let total = tail;
  chunks.forEach((c, i) => {
    total += c.duration + (i ? gap : 0);
  });
  const len = Math.max(1, Math.ceil(total * ENV_HZ));
  const env = new Float32Array(len);
  let offset = 0;
  for (const chunk of chunks) {
    const sr = chunk.sampleRate;
    const frames = chunk.length;
    const win = Math.max(64, Math.floor(sr * ENV_WINDOW));
    const chans = [
      chunk.getChannelData(0),
      chunk.getChannelData(Math.min(1, chunk.numberOfChannels - 1)),
    ];
    const base = Math.floor(offset * ENV_HZ);
    const step = Math.max(1, Math.floor(win / 2));
    for (let s = 0; s < frames; s += step) {
      let sum = 0;
      let n = 0;
      const end = Math.min(frames, s + win);
      for (let j = s; j < end; j += 4) {
        const a = chans[0][j];
        const b = chans[1][j];
        sum += a * a + b * b;
        n += 2;
      }
      const rms = Math.sqrt(sum / Math.max(1, n));
      const idx = base + Math.floor((s / sr) * ENV_HZ);
      if (idx < len && rms > env[idx]) env[idx] = rms;
    }
    offset += chunk.duration + gap;
  }
  // normalize by 95th percentile so typical narration maps to ~1
  const sorted = Array.from(env).filter((v) => v > 0.001).sort((a, b) => a - b);
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 1;
  const scale = p95 > 0 ? 1 / p95 : 0;
  for (let i = 0; i < len; i++) env[i] = Math.min(1, env[i] * scale);
  // smooth: fast attack, slow release
  const attack = Math.max(1, Math.floor(ENV_HZ * 0.04));
  const release = Math.max(1, Math.floor(ENV_HZ * 0.35));
  const smooth = new Float32Array(len);
  let current = 0;
  for (let i = 0; i < len; i++) {
    const target = env[i];
    const k = target > current ? 1 / attack : 1 / release;
    current += (target - current) * k;
    smooth[i] = current;
  }
  return smooth;
}

/* ------------------------------ mixing ------------------------------ */

export interface MixOptions {
  voiceChunks: AudioBuffer[];
  gapSeconds?: number;
  tailSeconds?: number;
  musicBuffer?: AudioBuffer | null;
  moodKey?: MoodKey | null;
  musicVolume: number; // 0..1
  duckAmount: number; // 0..1 (0 = no ducking)
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
}

export interface MixResult {
  buffer: AudioBuffer;
  duration: number;
}

export async function renderMix(opts: MixOptions): Promise<MixResult> {
  const gap = opts.gapSeconds ?? 0.12;
  const tail = opts.tailSeconds ?? 2.2;
  let duration = tail;
  opts.voiceChunks.forEach((c, i) => {
    duration += c.duration + (i ? gap : 0);
  });

  const ctx = new OfflineAudioContext(2, Math.ceil(duration * TARGET_SR), TARGET_SR);

  /* master: gentle glue compressor + safety gain */
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 22;
  comp.ratio.value = 5;
  comp.attack.value = 0.004;
  comp.release.value = 0.28;
  const master = ctx.createGain();
  master.gain.value = 1.12;
  comp.connect(master);
  master.connect(ctx.destination);

  /* voice bus */
  const voiceBus = ctx.createGain();
  voiceBus.gain.value = 1.35; // narration up-front
  voiceBus.connect(comp);
  let offset = 0;
  for (const chunk of opts.voiceChunks) {
    const src = ctx.createBufferSource();
    src.buffer = chunk;
    src.connect(voiceBus);
    src.start(offset);
    offset += chunk.duration + gap;
  }

  /* music bus: input → ducking gain → fader → compressor */
  const mood = opts.moodKey ? MOODS[opts.moodKey] : null;
  const hasMusic = Boolean(opts.musicBuffer) || Boolean(mood);
  if (hasMusic) {
    const input = ctx.createGain();
    const duck = ctx.createGain();
    const fader = ctx.createGain();
    input.connect(duck);
    duck.connect(fader);
    fader.connect(comp);

    if (opts.musicBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = opts.musicBuffer;
      src.loop = true;
      src.loopEnd = Math.max(0.2, opts.musicBuffer.duration - 0.06);
      src.connect(input);
      src.start(0);
      src.stop(duration);
    } else if (mood) {
      scheduleMusic(ctx, input, duration, mood);
    }

    const base = Math.max(0.0001, opts.musicVolume);
    if (opts.duckAmount > 0.01) {
      const env = computeVoiceEnvelope(opts.voiceChunks, gap, tail);
      const pts = Math.max(2, Math.ceil(duration * ENV_HZ) + 1);
      const curve = new Float32Array(pts);
      for (let i = 0; i < pts; i++) {
        const e = env[Math.min(env.length - 1, i)];
        curve[i] = base * (1 - opts.duckAmount * e);
      }
      duck.gain.setValueCurveAtTime(curve, 0, duration);
    } else {
      duck.gain.setValueAtTime(base, 0);
    }

    const fadeIn = Math.min(opts.fadeInSeconds ?? 0.9, duration * 0.3);
    const fadeOut = Math.min(opts.fadeOutSeconds ?? 2.4, duration * 0.5);
    fader.gain.setValueAtTime(0.0001, 0);
    fader.gain.linearRampToValueAtTime(1, fadeIn);
    fader.gain.setValueAtTime(1, Math.max(fadeIn, duration - fadeOut));
    fader.gain.exponentialRampToValueAtTime(0.0001, duration);
  }

  const buffer = await ctx.startRendering();
  return { buffer, duration };
}

/* ----------------------------- encoders ----------------------------- */

export function bufferToWav(buffer: AudioBuffer): Blob {
  const channels = Math.min(2, buffer.numberOfChannels);
  const sr = buffer.sampleRate;
  const len = buffer.length * channels * 2;
  const out = new ArrayBuffer(44 + len);
  const view = new DataView(out);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + len, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, len, true);
  const dataL = buffer.getChannelData(0);
  const dataR = channels > 1 ? buffer.getChannelData(1) : dataL;
  let pos = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (const data of [dataL, dataR].slice(0, channels)) {
      const s = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      pos += 2;
    }
  }
  return new Blob([out], { type: "audio/wav" });
}

export async function bufferToMp3(buffer: AudioBuffer, kbps = 160): Promise<Blob> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const channels = Math.min(2, buffer.numberOfChannels) as 1 | 2;
  const sr = buffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sr, kbps);
  const to16 = (f: Float32Array) => {
    const out = new Int16Array(f.length);
    for (let i = 0; i < f.length; i++) {
      const s = Math.max(-1, Math.min(1, f[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };
  const left = to16(buffer.getChannelData(0));
  const right = channels > 1 ? to16(buffer.getChannelData(1)) : undefined;
  const parts: Uint8Array[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < left.length; i += BLOCK) {
    const l = left.subarray(i, i + BLOCK);
    const r = right ? right.subarray(i, i + BLOCK) : undefined;
    const chunk = channels > 1 ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l);
    if (chunk.length) parts.push(chunk);
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(tail);
  return new Blob(parts as unknown as BlobPart[], { type: "audio/mpeg" });
}

/* -------------------------- waveform peaks -------------------------- */

export function computePeaks(buffer: AudioBuffer, count = 220): number[] {
  const data = buffer.getChannelData(0);
  const bucket = Math.max(1, Math.floor(data.length / count));
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    let max = 0;
    const start = i * bucket;
    const end = Math.min(data.length, start + bucket);
    for (let j = start; j < end; j += 8) {
      const v = Math.abs(data[j]);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  const max = Math.max(0.12, ...peaks);
  return peaks.map((p) => p / max);
}

export function formatBytes(
  bytes: number,
  t?: (key: "unit.byte" | "unit.kb" | "unit.mb", vars: { n: string }) => string,
): string {
  if (bytes < 1024) return t ? t("unit.byte", { n: String(bytes) }) : `${bytes} بايت`;
  if (bytes < 1024 * 1024)
    return t ? t("unit.kb", { n: (bytes / 1024).toFixed(0) }) : `${(bytes / 1024).toFixed(0)} ك.ب`;
  return t
    ? t("unit.mb", { n: (bytes / (1024 * 1024)).toFixed(2) })
    : `${(bytes / (1024 * 1024)).toFixed(2)} م.ب`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
