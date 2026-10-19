"use client";

import { formatDuration } from "@/lib/audio";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Waveform({
  peaks,
  duration,
  currentTime,
  playing,
  onToggle,
  onSeek,
}: {
  peaks: number[];
  duration: number;
  currentTime: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (progress: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#22d3ee");
    grad.addColorStop(0.55, "#60a5fa");
    grad.addColorStop(1, "#a78bfa");

    const n = peaks.length;
    const gap = 2;
    const barW = Math.max(2, W / n - gap);
    const mid = H / 2;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * W;
      const h = Math.max(2.5, peaks[i] * (H - 8));
      const played = i / n <= progress;
      ctx.fillStyle = played ? grad : "rgba(148,163,184,0.22)";
      ctx.beginPath();
      const r = Math.min(barW / 2, 3);
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, mid - h / 2, barW, h, r);
      } else {
        ctx.rect(x, mid - h / 2, barW, h);
      }
      ctx.fill();
    }

    if (duration > 0) {
      const cx = progress * W;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx, mid, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [peaks, currentTime, duration, playing]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-[0_10px_30px_-8px_rgba(34,211,238,0.7)] transition hover:scale-105 active:scale-95"
        aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
      >
        {playing ? (
          <Pause className="size-5" fill="currentColor" />
        ) : (
          <Play className="size-5 translate-x-[1px]" fill="currentColor" />
        )}
      </button>
      <div
        ref={wrapRef}
        className="relative h-[72px] min-w-0 flex-1 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      </div>
      <span className="shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
    </div>
  );
}
