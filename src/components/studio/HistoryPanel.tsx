"use client";

import type { HistoryItem } from "./types";
import { Card } from "./ui";
import { MOODS, type MoodKey } from "@/lib/mood";
import { moodStrings, type Lang, type TFn, type TKey } from "@/lib/i18n";
import { formatBytes, formatDuration } from "@/lib/audio";
import {
  Download,
  History,
  Loader2,
  Music,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";

function relTime(iso: string, lang: Lang, nowLabel: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  let rtf: Intl.RelativeTimeFormat | null = null;
  try {
    rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  } catch {
    rtf = null;
  }
  const min = Math.floor(diff / 60000);
  if (min < 1) return nowLabel;
  if (!rtf) return `${min}m`;
  if (min < 60) return rtf.format(-min, "minute");
  const hours = Math.floor(min / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  return rtf.format(-days, "day");
}

export default function HistoryPanel({
  items,
  loading,
  playingId,
  isPlaying,
  onToggle,
  onDelete,
  deletingId,
  onRefresh,
  t,
  lang,
}: {
  items: HistoryItem[];
  loading: boolean;
  playingId: string | null;
  isPlaying: boolean;
  onToggle: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  onRefresh: () => void;
  t: TFn;
  lang: Lang;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sourceLabel = (source: string): string => {
    const key = `histSrc.${source}` as TKey;
    return t(key) === key ? t("histSrc.none") : t(key);
  };

  return (
    <Card className="mt-6 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-slate-300">
          <History className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-800 text-white">
            {t("history.title")}
          </h2>
          <p className="text-xs text-slate-400">
            {items.length
              ? t("history.sub", { n: items.length.toLocaleString("en") })
              : t("history.subEmpty")}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="ms-auto grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
          aria-label={t("history.refresh")}
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
          ))}
        </div>
      ) : !items.length ? (
        <p className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-8 text-center text-[12.5px] text-slate-500">
          {t("history.empty")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const active = playingId === item.id;
            const moodLabel =
              item.mood && item.mood in MOODS
                ? moodStrings(item.mood as MoodKey, lang).label
                : sourceLabel(item.musicSource);
            return (
              <article
                key={item.id}
                className={`group flex flex-col rounded-xl border p-3.5 transition-colors duration-300 ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/[0.06]"
                    : "border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12]"
                }`}
              >
                <p className="mb-2.5 line-clamp-2 min-h-[2.6em] text-[12.5px] leading-relaxed text-slate-300">
                  {item.excerpt}
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-slate-400">
                    {item.voiceName}
                  </span>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-slate-400" dir="ltr">
                    {item.locale}
                  </span>
                  <span className="flex items-center gap-1 rounded-md border border-violet-300/20 bg-violet-400/[0.08] px-1.5 py-0.5 text-violet-200">
                    {item.musicSource === "none" ? (
                      <VolumeX className="size-3" />
                    ) : (
                      <Music className="size-3" />
                    )}
                    {moodLabel}
                  </span>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-slate-400 uppercase">
                    {item.format}
                  </span>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                      active
                        ? "bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/30"
                        : "border border-white/[0.12] bg-white/[0.05] text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200"
                    }`}
                    aria-label={active && isPlaying ? t("btn.pause") : t("btn.play")}
                  >
                    {active && isPlaying ? (
                      <Pause className="size-4" fill="currentColor" />
                    ) : (
                      <Play className="size-4 translate-x-[1px]" fill="currentColor" />
                    )}
                  </button>
                  <a
                    href={`${item.url}?dl=1`}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-white/[0.05] text-slate-300 transition hover:border-emerald-300/40 hover:text-emerald-200"
                    aria-label={t("history.download")}
                    download
                  >
                    <Download className="size-4" />
                  </a>
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-500 tabular-nums" dir="ltr">
                    {formatDuration(item.duration)} · {formatBytes(item.sizeBytes, t)}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {relTime(item.createdAt, lang, t("history.now"))}
                  </span>
                  {confirmId === item.id ? (
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg border border-rose-300/40 bg-rose-500/[0.12] px-2 py-1.5 text-[10.5px] font-700 text-rose-200"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        t("history.confirm")
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmId(item.id);
                        setTimeout(() => setConfirmId((c) => (c === item.id ? null : c)), 2800);
                      }}
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.03] text-slate-500 transition hover:border-rose-300/40 hover:text-rose-200"
                      aria-label={t("history.delete")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
