"use client";

import type { Lang, TFn } from "@/lib/i18n";
import { LANGS, LANG_LABELS } from "@/lib/i18n";
import { AudioLines, FileAudio, Globe, Infinity as InfinityIcon, Languages } from "lucide-react";
import { motion } from "framer-motion";

export function EqBars({ className = "" }: { className?: string }) {
  return (
    <span className={`eq-bars ${className}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.13}s` }} />
      ))}
    </span>
  );
}

export default function Header({
  voicesCount,
  localesCount,
  t,
  lang,
  setLang,
}: {
  voicesCount: number;
  localesCount: number;
  t: TFn;
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const stats = [
    {
      icon: AudioLines,
      label: voicesCount
        ? t("stats.voicesCount", { n: voicesCount.toLocaleString("en") })
        : t("stats.voicesLoading"),
    },
    {
      icon: Languages,
      label: localesCount
        ? t("stats.locales", { n: localesCount.toLocaleString("en") })
        : t("stats.localesFallback"),
    },
    { icon: InfinityIcon, label: t("stats.unlimited") },
    { icon: FileAudio, label: t("stats.formats") },
  ];

  return (
    <header className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pt-8 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3.5"
        >
          <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-600 shadow-[0_10px_35px_-8px_rgba(34,211,238,0.55)]">
            <AudioLines className="size-6 text-white" />
            <span className="absolute inset-0 rounded-2xl ring-1 ring-white/25" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-900 leading-none tracking-tight text-white sm:text-4xl">
              {t("brand.name")}
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-400">{t("brand.sub")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="ms-auto flex flex-wrap items-center gap-2"
        >
          {stats.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-slate-300 backdrop-blur"
            >
              <s.icon className="size-3.5 text-cyan-300" />
              {s.label}
            </span>
          ))}
          <span className="flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/[0.08] px-3 py-1.5 text-[11.5px] text-cyan-200">
            <EqBars />
            {t("stats.ready")}
          </span>

          {/* language switcher */}
          <span className="flex items-center gap-0.5 rounded-full border border-white/[0.12] bg-white/[0.05] p-1 backdrop-blur">
            <Globe className="mx-1.5 size-3.5 shrink-0 text-slate-400" />
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                title={LANG_LABELS[l]}
                className={`rounded-full px-2.5 py-1 font-display text-[11px] font-800 transition-all duration-200 ${
                  lang === l
                    ? "bg-gradient-to-l from-cyan-400 to-violet-500 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </span>
        </motion.div>
      </div>
    </header>
  );
}
