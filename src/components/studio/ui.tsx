"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative rounded-3xl border border-white/[0.07] bg-white/[0.028] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md ${className}`}
    >
      {children}
    </section>
  );
}

export function StepHeader({
  index,
  icon: Icon,
  title,
  sub,
  right,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  sub: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-violet-500/25 font-display text-sm font-800 text-cyan-200 ring-1 ring-cyan-300/30">
        {index}
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-slate-300">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-800 leading-tight text-white">
          {title}
        </h2>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
      <div className="ms-auto flex shrink-0 items-center gap-2">{right}</div>
    </header>
  );
}

export function RangeRow({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  display,
  onChange,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-400">
        <Icon className="size-3.5 text-slate-500" />
        <span>{label}</span>
        <span className="ms-auto rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-cyan-200 tabular-nums">
          {display}
        </span>
      </div>
      <input
        type="range"
        className="studio-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-start transition hover:border-white/[0.12]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-slate-200">{label}</span>
        {hint ? (
          <span className="block text-[11px] text-slate-500">{hint}</span>
        ) : null}
      </span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300 ${
          checked
            ? "bg-gradient-to-l from-cyan-400 to-violet-500"
            : "bg-white/12"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all duration-300 ${
            checked ? "left-5" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: Array<{ value: T; label: string; icon?: LucideIcon }>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex overflow-hidden rounded-xl border border-white/[0.08] bg-black/30 p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const IconC = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12.5px] transition-all duration-300 ${
              active
                ? "bg-gradient-to-l from-cyan-400/90 to-violet-500/90 font-700 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {IconC ? <IconC className="size-3.5" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
