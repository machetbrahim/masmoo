"use client";

import { useEffect, useRef } from "react";

/** Flowing light-ribbons canvas + aurora blobs + film grain. */
export default function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ribbons = [
      { amp: 46, speed: 0.00022, y: 0.24, hue: "rgba(34,211,238,0.10)", width: 130, phase: 0 },
      { amp: 70, speed: 0.00016, y: 0.55, hue: "rgba(139,92,246,0.10)", width: 170, phase: 2.1 },
      { amp: 36, speed: 0.00028, y: 0.82, hue: "rgba(56,189,248,0.07)", width: 100, phase: 4.2 },
    ];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const r of ribbons) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 14) {
          const y =
            h * r.y +
            Math.sin(x * 0.0022 + t * r.speed + r.phase) * r.amp +
            Math.sin(x * 0.0009 + t * r.speed * 1.7 + r.phase * 2) * r.amp * 0.6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = r.hue;
        ctx.lineWidth = r.width;
        ctx.lineCap = "round";
        ctx.filter = "blur(30px)";
        ctx.stroke();
        ctx.filter = "none";
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05060b]" />
      <div className="absolute -top-40 right-[-10%] size-[46rem] rounded-full bg-violet-600/[0.13] blur-[130px]" />
      <div className="absolute bottom-[-30%] left-[-8%] size-[42rem] rounded-full bg-cyan-500/[0.11] blur-[130px]" />
      <div className="absolute top-[30%] left-[35%] size-[26rem] rounded-full bg-indigo-500/[0.08] blur-[110px]" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />
      <div
        className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,rgba(5,6,11,0.85)_100%)]" />
    </div>
  );
}
