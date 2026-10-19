"use client";

import { MOOD_LIST, type MoodKey } from "@/lib/mood";
import { moodStrings, type Lang, type TFn } from "@/lib/i18n";
import type { MoodChoice, MusicSource } from "./types";
import { Card, RangeRow, Segmented, StepHeader, Toggle } from "./ui";
import { formatBytes, formatDuration } from "@/lib/audio";
import {
  Check,
  Clapperboard,
  CloudRain,
  Drama,
  Feather,
  FileAudio,
  Loader2,
  Music,
  Newspaper,
  Smile,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

const MOOD_ICONS: Record<MoodKey, typeof Feather> = {
  calm: Feather,
  epic: Clapperboard,
  happy: Smile,
  news: Newspaper,
  dramatic: Drama,
  sad: CloudRain,
};

export interface UploadMeta {
  name: string;
  size: number;
  duration: number;
}

export default function MusicPanel({
  source,
  setSource,
  mood,
  setMood,
  autoMood,
  autoMatched,
  volume,
  setVolume,
  duck,
  setDuck,
  fade,
  setFade,
  fileMeta,
  fileBusy,
  fileError,
  onFile,
  onClearFile,
  t,
  lang,
}: {
  source: MusicSource;
  setSource: (s: MusicSource) => void;
  mood: MoodChoice;
  setMood: (m: MoodChoice) => void;
  autoMood: MoodKey;
  autoMatched: boolean;
  volume: number;
  setVolume: (v: number) => void;
  duck: boolean;
  setDuck: (v: boolean) => void;
  fade: boolean;
  setFade: (v: boolean) => void;
  fileMeta: UploadMeta | null;
  fileBusy: boolean;
  fileError: string | null;
  onFile: (f: File) => void;
  onClearFile: () => void;
  t: TFn;
  lang: Lang;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Card className="p-5">
      <StepHeader
        index={3}
        icon={Music}
        title={t("music.title")}
        sub={t("music.sub")}
      />

      <Segmented<MusicSource>
        value={source}
        onChange={setSource}
        options={[
          { value: "generated", label: t("src.generated"), icon: Wand2 },
          { value: "upload", label: t("src.upload"), icon: Upload },
          { value: "none", label: t("src.none"), icon: VolumeX },
        ]}
      />

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {source === "generated" ? (
            <motion.div
              key="generated"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setMood("auto")}
                className={`mb-3 flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition ${
                  mood === "auto"
                    ? "border-violet-300/50 bg-violet-400/[0.1] shadow-[0_10px_30px_-14px_rgba(139,92,246,0.6)]"
                    : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15]"
                }`}
              >
                <span className="grid size-9 place-items-center rounded-lg bg-violet-400/20 text-violet-200">
                  <Wand2 className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[13.5px] font-800 text-white">
                    {t("auto.title")}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {autoMatched
                      ? t("auto.matched", { m: moodStrings(autoMood, lang).label })
                      : t("auto.unmatched")}
                  </span>
                </span>
                {mood === "auto" ? (
                  <Check className="size-4 shrink-0 text-violet-300" />
                ) : null}
              </button>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MOOD_LIST.map((m) => {
                  const Icon = MOOD_ICONS[m.key];
                  const active = mood === m.key;
                  const strings = moodStrings(m.key, lang);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMood(m.key)}
                      className={`group relative overflow-hidden rounded-xl border p-3 text-start transition-all duration-200 ${
                        active
                          ? "border-white/[0.22] bg-white/[0.07] shadow-lg"
                          : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.15]"
                      }`}
                    >
                      <span
                        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l ${m.gradient} ${active ? "opacity-100" : "opacity-40"}`}
                      />
                      <span
                        className={`mb-2 grid size-8 place-items-center rounded-lg bg-gradient-to-br ${m.gradient} text-white shadow`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="block font-display text-[12.5px] font-800 leading-snug text-slate-100">
                        {strings.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
                        {strings.hint}
                      </span>
                      {active ? (
                        <Check className="absolute end-2 top-2.5 size-4 text-cyan-300" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : source === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                  e.target.value = "";
                }}
              />
              {fileMeta ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-300/25 bg-emerald-400/[0.07] px-3.5 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200">
                    <FileAudio className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-700 text-slate-100">
                      {fileMeta.name}
                    </span>
                    <span className="block font-mono text-[10.5px] text-slate-400 tabular-nums" dir="ltr">
                      {formatDuration(fileMeta.duration)} · {formatBytes(fileMeta.size, t)}
                    </span>
                    <span className="block text-[10.5px] text-slate-500">
                      {t("upload.loopNote")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onClearFile}
                    className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-rose-300/40 hover:text-rose-200"
                    aria-label={t("upload.remove")}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) onFile(f);
                  }}
                  disabled={fileBusy}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] px-4 py-8 text-center transition hover:border-cyan-300/40 hover:bg-cyan-400/[0.05] disabled:opacity-50"
                >
                  {fileBusy ? (
                    <Loader2 className="size-6 animate-spin text-cyan-300" />
                  ) : (
                    <Upload className="size-6 text-cyan-300" />
                  )}
                  <span className="text-[13px] font-700 text-slate-200">
                    {fileBusy ? t("upload.busy") : t("upload.idle")}
                  </span>
                  <span className="text-[11px] text-slate-500">{t("upload.sub")}</span>
                </button>
              )}
              {fileError ? (
                <p className="mt-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3 py-2 text-[11.5px] text-rose-200">
                  {fileError}
                </p>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-[12.5px] text-slate-500"
            >
              {t("none.note")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {source !== "none" ? (
        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
          <RangeRow
            label={t("music.level")}
            icon={Volume2}
            value={volume}
            min={0.04}
            max={0.7}
            step={0.01}
            display={`${Math.round((volume / 0.7) * 100)}%`}
            onChange={setVolume}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle
              checked={duck}
              onChange={setDuck}
              label={t("duck.label")}
              hint={t("duck.hint")}
            />
            <Toggle
              checked={fade}
              onChange={setFade}
              label={t("fade.label")}
              hint={t("fade.hint")}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
