"use client";

import { useMemo, useState } from "react";
import type { LocaleGroup, VoiceInfo } from "./types";
import type { TFn } from "@/lib/i18n";
import { Card, RangeRow, StepHeader } from "./ui";
import {
  AudioWaveform,
  Check,
  ChevronDown,
  Gauge,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";

type GenderFilter = "all" | "Male" | "Female";

export function voiceDisplayName(shortName: string): string {
  const tail = shortName.split("-").slice(2).join("-");
  return tail.replace(/Multilingual$/i, "").replace(/Neural$/i, "") || shortName;
}

export default function VoicePanel({
  loading,
  error,
  onRetry,
  locales,
  locale,
  setLocale,
  voices,
  voice,
  setVoice,
  rate,
  setRate,
  pitch,
  setPitch,
  onPreview,
  previewing,
  disabled,
  t,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  locales: LocaleGroup[];
  locale: string;
  setLocale: (c: string) => void;
  voices: VoiceInfo[];
  voice: string;
  setVoice: (v: string) => void;
  rate: number;
  setRate: (v: number) => void;
  pitch: number;
  setPitch: (v: number) => void;
  onPreview: () => void;
  previewing: boolean;
  disabled: boolean;
  t: TFn;
}) {
  const [gender, setGender] = useState<GenderFilter>("all");

  const filtered = useMemo(
    () =>
      voices.filter((v) =>
        gender === "all" ? true : v.gender.toLowerCase().startsWith(gender.toLowerCase().slice(0, 4)),
      ),
    [voices, gender],
  );

  return (
    <Card className="p-5">
      <StepHeader
        index={2}
        icon={Mic}
        title={t("voice.title")}
        sub={t("voice.sub")}
        right={
          <button
            type="button"
            onClick={onPreview}
            disabled={disabled || previewing || !voice}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-cyan-400/15 to-violet-500/15 px-3 py-1.5 text-[11.5px] font-700 text-cyan-100 ring-1 ring-cyan-300/30 transition hover:from-cyan-400/25 hover:to-violet-500/25 disabled:opacity-40"
          >
            {previewing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {t("voice.listen")}
          </button>
        }
      />

      {error ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-400/25 bg-rose-500/[0.08] px-3.5 py-3 text-[12.5px] text-rose-200">
          <span>{t("voice.error")}</span>
          <button
            type="button"
            onClick={onRetry}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300/30 px-2.5 py-1.5 text-[11px] transition hover:bg-rose-400/10"
          >
            <RefreshCw className="size-3.5" />
            {t("voice.retry")}
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">{t("voice.language")}</label>
          <div className="relative">
            <select
              value={locale}
              disabled={disabled || loading || !locales.length}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 pe-9 text-[13px] text-slate-100 focus:border-cyan-300/50 focus:outline-none disabled:opacity-50"
            >
              {!locales.length ? <option>{t("voice.loading")}</option> : null}
              {locales.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0c0f1a]">
                  {l.label} ({l.count})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">{t("voice.filter")}</label>
          <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 p-1">
            {(
              [
                { v: "all" as GenderFilter, labelKey: "filter.all", icon: Users },
                { v: "Male" as GenderFilter, labelKey: "filter.male", icon: UserRound },
                { v: "Female" as GenderFilter, labelKey: "filter.female", icon: UserRound },
              ]
            ).map((g) => (
              <button
                key={g.v}
                type="button"
                onClick={() => setGender(g.v)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] transition ${
                  gender === g.v
                    ? "bg-white/[0.1] font-700 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <g.icon className="size-3.5" />
                {t(g.labelKey as "filter.all" | "filter.male" | "filter.female")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="thin-scroll mt-3 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pe-1 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[54px] animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]"
              />
            ))
          : filtered.map((v) => {
              const active = v.shortName === voice;
              const female = v.gender.toLowerCase().startsWith("fem");
              return (
                <button
                  key={v.shortName}
                  type="button"
                  disabled={disabled}
                  onClick={() => setVoice(v.shortName)}
                  className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-start transition-all duration-200 ${
                    active
                      ? "border-cyan-300/50 bg-gradient-to-l from-cyan-400/[0.12] to-violet-500/[0.12] shadow-[0_8px_28px_-12px_rgba(34,211,238,0.45)]"
                      : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      female
                        ? "bg-rose-400/15 text-rose-200"
                        : "bg-sky-400/15 text-sky-200"
                    }`}
                  >
                    <UserRound className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[13px] font-700 text-slate-100">
                      {voiceDisplayName(v.shortName)}
                    </span>
                    <span className="block truncate text-[10.5px] text-slate-500">
                      {female ? t("voice.femaleChip") : t("voice.maleChip")} · {t("voice.neural")}
                    </span>
                  </span>
                  {active ? (
                    <Check className="ms-auto size-4 shrink-0 text-cyan-300" />
                  ) : null}
                </button>
              );
            })}
        {!loading && !filtered.length ? (
          <p className="col-span-full py-4 text-center text-xs text-slate-500">
            {t("voice.empty")}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <RangeRow
          label={t("voice.rate")}
          icon={Gauge}
          value={rate}
          min={0.5}
          max={2}
          step={0.05}
          display={`×${rate.toFixed(2)}`}
          onChange={setRate}
          disabled={disabled}
        />
        <RangeRow
          label={t("voice.pitch")}
          icon={AudioWaveform}
          value={pitch}
          min={-4}
          max={4}
          step={0.5}
          display={`${pitch > 0 ? "+" : ""}${pitch} ${t("unit.semitone")}`}
          onChange={setPitch}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
