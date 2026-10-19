import type { MoodKey } from "@/lib/mood";

export type MusicSource = "generated" | "upload" | "none";
export type OutputFormat = "mp3" | "wav";
export type MoodChoice = "auto" | MoodKey;

export type PipelineStep =
  | "idle"
  | "tts"
  | "mix"
  | "encode"
  | "done"
  | "error";

export interface VoiceInfo {
  shortName: string;
  name: string;
  gender: string;
  locale: string;
  localeName: string;
}

export interface LocaleGroup {
  code: string;
  label: string;
  count: number;
  voices: VoiceInfo[];
}

export interface HistoryItem {
  id: string;
  excerpt: string;
  voice: string;
  voiceName: string;
  locale: string;
  mood: string;
  musicSource: string;
  format: string;
  duration: number;
  sizeBytes: number;
  createdAt: string;
  url: string;
}

export interface ResultData {
  url: string;
  format: OutputFormat;
  fileName: string;
  duration: number;
  sizeBytes: number;
  peaks: number[];
  voiceName: string;
  locale: string;
  moodLabel: string;
  blob: Blob;
}
