"use client";

import { moodStrings, SAMPLES, type Lang, type TFn } from "@/lib/i18n";
import type { MoodGuess } from "@/lib/mood";
import { Card, StepHeader } from "./ui";
import { Eraser, Sparkles, Timer, Type } from "lucide-react";
import { formatDuration } from "@/lib/audio";

const MAX_CHARS = 9000;

export default function TextPanel({
  value,
  onChange,
  guess,
  estimateSec,
  busy,
  t,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  guess: MoodGuess | null;
  estimateSec: number;
  busy: boolean;
  t: TFn;
  lang: Lang;
}) {
  const samples = SAMPLES[lang] ?? SAMPLES.ar;

  return (
    <Card className="flex h-full flex-col p-5">
      <StepHeader
        index={1}
        icon={Type}
        title={t("text.title")}
        sub={t("text.sub")}
        right={
          value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-slate-400 transition hover:border-rose-300/30 hover:text-rose-200"
            >
              <Eraser className="size-3.5" />
              {t("text.clear")}
            </button>
          ) : undefined
        }
      />

      <div className="relative flex-1">
        <textarea
          value={value}
          disabled={busy}
          maxLength={MAX_CHARS}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("text.placeholder")}
          className="thin-scroll h-full min-h-[300px] w-full resize-none rounded-2xl border border-white/[0.07] bg-black/35 p-4 font-sans text-[15px] leading-[2] text-slate-100 placeholder:text-slate-600 focus:border-cyan-300/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/[0.07] disabled:opacity-50"
        />
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2" dir="ltr">
          <span className="rounded-md bg-black/60 px-2 py-1 font-mono text-[10.5px] text-slate-500 backdrop-blur tabular-nums">
            {value.length.toLocaleString("en")} / {MAX_CHARS.toLocaleString("en")}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 font-mono text-[10.5px] text-slate-500 backdrop-blur tabular-nums">
            <Timer className="size-3" />≈ {formatDuration(estimateSec)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {guess ? (
          <span className="flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-400/[0.1] px-3 py-1.5 text-[11.5px] text-violet-200">
            <Sparkles className="size-3.5" />
            {t("text.moodDetected", { m: moodStrings(guess.mood, lang).label })}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-slate-500">
            <Sparkles className="size-3.5" />
            {t("text.moodIdle")}
          </span>
        )}
        <span className="ms-auto" />
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={busy}
            onClick={() => onChange(s.text)}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-400/[0.08] hover:text-cyan-100 disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
