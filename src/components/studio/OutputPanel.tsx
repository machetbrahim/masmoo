"use client";

import type { OutputFormat, PipelineStep, ResultData } from "./types";
import type { TFn } from "@/lib/i18n";
import { Card, Segmented, StepHeader } from "./ui";
import Waveform from "./Waveform";
import { formatBytes, formatDuration } from "@/lib/audio";
import {
  AlertTriangle,
  Check,
  CloudOff,
  CloudUpload,
  Download,
  FileAudio,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function stageIndex(step: PipelineStep): number {
  if (step === "tts") return 0;
  if (step === "mix") return 1;
  if (step === "encode") return 2;
  if (step === "done") return 3;
  return -1;
}

export default function OutputPanel({
  format,
  setFormat,
  step,
  progress,
  canGenerate,
  hint,
  onGenerate,
  result,
  isPlayingThis,
  currentTime,
  onTogglePlay,
  onSeek,
  saveState,
  error,
  t,
}: {
  format: OutputFormat;
  setFormat: (f: OutputFormat) => void;
  step: PipelineStep;
  progress: { index: number; total: number };
  canGenerate: boolean;
  hint: string | null;
  onGenerate: () => void;
  result: ResultData | null;
  isPlayingThis: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onSeek: (p: number) => void;
  saveState: "idle" | "saving" | "saved" | "failed";
  error: string | null;
  t: TFn;
}) {
  const busy = step === "tts" || step === "mix" || step === "encode";
  const stage = stageIndex(step);
  const stageLabels = [t("step.speech"), t("step.mix"), t("step.encode"), t("step.ready")];

  const ctaLabel = busy
    ? step === "tts"
      ? t("cta.tts", { i: progress.index, n: Math.max(1, progress.total) })
      : step === "mix"
        ? t("cta.mix")
        : t("cta.encode")
    : step === "done"
      ? t("cta.regen")
      : t("cta.generate");

  return (
    <Card className="p-5">
      <StepHeader
        index={4}
        icon={Sparkles}
        title={t("output.title")}
        sub={t("output.sub")}
        right={
          <Segmented<OutputFormat>
            value={format}
            onChange={setFormat}
            className="w-40"
            options={[
              { value: "mp3", label: "MP3" },
              { value: "wav", label: "WAV" },
            ]}
          />
        }
      />

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate && step !== "done" && step !== "error"}
        className={`group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl font-display text-[16px] font-800 transition-all duration-300 ${
          canGenerate || step === "done" || step === "error"
            ? "bg-gradient-to-l from-cyan-400 via-sky-500 to-violet-600 text-white shadow-[0_18px_45px_-14px_rgba(34,211,238,0.65)] hover:shadow-[0_22px_55px_-14px_rgba(139,92,246,0.7)]"
            : "cursor-not-allowed bg-white/[0.05] text-slate-500"
        }`}
      >
        {busy ? (
          <span className="cta-shimmer absolute inset-0" aria-hidden />
        ) : null}
        {busy ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Sparkles className="size-5 transition group-hover:scale-110" />
        )}
        {ctaLabel}
      </button>

      {hint && !busy ? (
        <p className="mt-2 text-center text-[11.5px] text-slate-500">{hint}</p>
      ) : null}

      <AnimatePresence>
        {stage >= 0 ? (
          <motion.div
            key="stages"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {stageLabels.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 text-[10.5px] transition-colors duration-500 ${
                    i < stage || step === "done"
                      ? "border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-200"
                      : i === stage
                        ? "border-cyan-300/30 bg-cyan-400/[0.1] text-cyan-100"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-600"
                  }`}
                >
                  {i < stage || step === "done" ? (
                    <Check className="size-3" />
                  ) : i === stage ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : null}
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-3 text-[12.5px] leading-relaxed text-rose-200"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {result && step === "done" ? (
          <motion.div
            key={result.url}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400/25 to-cyan-400/25 text-emerald-200 ring-1 ring-emerald-300/30">
                <FileAudio className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[12px] text-slate-200" dir="ltr">
                  {result.fileName}
                </span>
                <span className="block text-[10.5px] text-slate-500">
                  <span dir="ltr" className="font-mono tabular-nums">
                    {formatDuration(result.duration)} · {formatBytes(result.sizeBytes, t)}
                  </span>{" "}
                  · {result.voiceName} · {result.locale} · {result.moodLabel}
                </span>
              </span>
              <span className="ms-auto">
                {saveState === "saving" ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10.5px] text-slate-400">
                    <CloudUpload className="size-3.5 animate-pulse" />
                    {t("save.saving")}
                  </span>
                ) : saveState === "saved" ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[10.5px] text-emerald-200">
                    <Check className="size-3.5" />
                    {t("save.saved")}
                  </span>
                ) : saveState === "failed" ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/[0.08] px-2.5 py-1 text-[10.5px] text-amber-200">
                    <CloudOff className="size-3.5" />
                    {t("save.failed")}
                  </span>
                ) : null}
              </span>
            </div>

            <Waveform
              peaks={result.peaks}
              duration={result.duration}
              currentTime={currentTime}
              playing={isPlayingThis}
              onToggle={onTogglePlay}
              onSeek={onSeek}
            />

            <a
              href={result.url}
              download={result.fileName}
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-gradient-to-l from-cyan-400/[0.16] to-violet-500/[0.16] font-display text-[15px] font-800 text-cyan-100 transition hover:border-cyan-300/70 hover:from-cyan-400/[0.25] hover:to-violet-500/[0.25]"
            >
              <Download className="size-5" />
              {t("result.download", { fmt: result.format.toUpperCase() })}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
