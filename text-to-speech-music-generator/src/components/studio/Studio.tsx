"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Backdrop from "./Backdrop";
import Header from "./Header";
import TextPanel from "./TextPanel";
import VoicePanel, { voiceDisplayName } from "./VoicePanel";
import MusicPanel, { type UploadMeta } from "./MusicPanel";
import OutputPanel from "./OutputPanel";
import HistoryPanel from "./HistoryPanel";
import type {
  HistoryItem,
  LocaleGroup,
  MoodChoice,
  MusicSource,
  OutputFormat,
  PipelineStep,
  ResultData,
  VoiceInfo,
} from "./types";
import { detectMood, type MoodGuess, type MoodKey } from "@/lib/mood";
import {
  bufferToMp3,
  bufferToWav,
  computePeaks,
  decodeAudio,
  decodeFile,
  renderMix,
} from "@/lib/audio";
import { estimateSpeechSeconds, previewSentenceFor, splitForTts } from "@/lib/text";
import { DICT, DIR, makeT, moodStrings, type Lang } from "@/lib/i18n";
import { AlertTriangle, Check, Info } from "lucide-react";

const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "حدث خطأ غير متوقع";

const nextFrame = () => new Promise((r) => setTimeout(r, 40));

export default function Studio() {
  /* ------------------------------- i18n ------------------------------- */
  const [lang, setLang] = useState<Lang>("ar");

  // restore saved language after hydration (SSR always renders "ar")
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("masmoo-lang");
      if (saved === "ar" || saved === "en" || saved === "fr") setLang(saved);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = DIR[lang];
    document.documentElement.lang = lang;
    document.title = `${DICT[lang]["brand.name"]} — ${DICT[lang]["brand.sub"]}`;
    try {
      window.localStorage.setItem("masmoo-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useMemo(() => makeT(lang), [lang]);

  /* ------------------------------ voices ------------------------------ */
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [locale, setLocale] = useState("ar-SA");
  const [voice, setVoice] = useState("");

  const loadVoices = useCallback(async () => {
    setVoicesLoading(true);
    setVoicesError(null);
    try {
      const res = await fetch("/api/voices", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "تعذّر جلب الأصوات");
      setVoices(json.voices as VoiceInfo[]);
    } catch (e) {
      setVoicesError(errMsg(e));
    } finally {
      setVoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVoices();
  }, [loadVoices]);

  const groups = useMemo<LocaleGroup[]>(() => {
    try {
      const byLocale = new Map<string, VoiceInfo[]>();
      for (const v of voices) {
        if (!v?.locale || !v.shortName) continue;
        const g = byLocale.get(v.locale) ?? [];
        g.push(v);
        byLocale.set(v.locale, g);
      }
      let names: Intl.DisplayNames | null = null;
      let regions: Intl.DisplayNames | null = null;
      try {
        names = new Intl.DisplayNames([lang], { type: "language" });
        regions = new Intl.DisplayNames([lang], { type: "region" });
      } catch {
        names = null;
        regions = null;
      }
      const safeOf = (dn: Intl.DisplayNames | null, code: string): string | null => {
        if (!dn || !code) return null;
        try {
          return dn.of(code) ?? null;
        } catch {
          return null;
        }
      };
      const labelOf = (code: string) => {
        try {
          const [lang, region] = code.split("-");
          const l = safeOf(names, lang) ?? lang;
          const regionCode = /^[A-Za-z]{2}$|^\d{3}$/.test(region ?? "") ? region : "";
          const r = regionCode ? (safeOf(regions, regionCode) ?? regionCode) : "";
          return r ? `${l} (${r})` : l;
        } catch {
          return code;
        }
      };
      return Array.from(byLocale.entries())
        .map(([code, list]) => ({
          code,
          label: labelOf(code),
          count: list.length,
          voices: [...list].sort((a, b) => a.shortName.localeCompare(b.shortName)),
        }))
        .sort((a, b) => {
          const rank = (c: string) =>
            c.startsWith("ar") ? 0 : c.startsWith("en") ? 1 : 2;
          return rank(a.code) - rank(b.code) || a.label.localeCompare(b.label, "ar");
        });
    } catch {
      return [];
    }
  }, [voices, lang]);

  /* static fallback so the studio stays usable even if the voice list
     fails to load entirely (offline server, blocked endpoint, …) */
  const groupsView = useMemo<LocaleGroup[]>(() => {
    if (groups.length) return groups;
    const fallback: VoiceInfo[] = [
      {
        shortName: "ar-SA-HamedNeural",
        name: "Hamed",
        gender: "Male",
        locale: "ar-SA",
        localeName: "Arabic (Saudi Arabia)",
      },
      {
        shortName: "ar-SA-ZariyahNeural",
        name: "Zariyah",
        gender: "Female",
        locale: "ar-SA",
        localeName: "Arabic (Saudi Arabia)",
      },
    ];
    return [
      { code: "ar-SA", label: "العربية (السعودية)", count: 2, voices: fallback },
    ];
  }, [groups]);

  useEffect(() => {
    if (voice || !groupsView.length) return;
    const g = groupsView.find((x) => x.code === "ar-SA") ?? groupsView[0];
    setLocale(g.code);
    const pref =
      g.voices.find((v) => /Hamed|Zariyah|Aria|Guy/i.test(v.shortName)) ?? g.voices[0];
    if (pref) setVoice(pref.shortName);
  }, [groupsView, voice]);

  const voicesForLocale = useMemo(
    () => groupsView.find((g) => g.code === locale)?.voices ?? [],
    [groupsView, locale],
  );

  useEffect(() => {
    if (voicesForLocale.length && !voicesForLocale.some((v) => v.shortName === voice)) {
      setVoice(voicesForLocale[0].shortName);
    }
  }, [voicesForLocale, voice]);

  /* ------------------------------- text ------------------------------- */
  const [text, setText] = useState("");
  const [guess, setGuess] = useState<MoodGuess | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setGuess(text.trim().length > 3 ? detectMood(text) : null);
    }, 250);
    return () => clearTimeout(id);
  }, [text]);

  /* ----------------------------- settings ----------------------------- */
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [source, setSource] = useState<MusicSource>("generated");
  const [mood, setMood] = useState<MoodChoice>("auto");
  const [volume, setVolume] = useState(0.28);
  const [duck, setDuck] = useState(true);
  const [fade, setFade] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("mp3");

  const estimateSec = useMemo(
    () => (text.trim() ? estimateSpeechSeconds(text, rate) : 0),
    [text, rate],
  );

  /* ------------------------------ uploads ----------------------------- */
  const [uploadBuf, setUploadBuf] = useState<AudioBuffer | null>(null);
  const [fileMeta, setFileMeta] = useState<UploadMeta | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const onFile = useCallback(async (f: File) => {
    if (f.size > 60 * 1024 * 1024) {
      setFileError("الملف أكبر من 60 ميغابايت — اختر ملفاً أصغر.");
      return;
    }
    setFileBusy(true);
    setFileError(null);
    try {
      const buf = await decodeFile(f);
      setUploadBuf(buf);
      setFileMeta({ name: f.name, size: f.size, duration: buf.duration });
    } catch {
      setFileError("تعذر فك ترميز الملف — جرّب ملفاً صوتياً آخر (MP3 / WAV / OGG).");
      setUploadBuf(null);
      setFileMeta(null);
    } finally {
      setFileBusy(false);
    }
  }, []);

  /* ------------------------------ player ------------------------------ */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playId, setPlayId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ctime, setCtime] = useState(0);

  const togglePlay = useCallback(
    (id: string, url: string) => {
      const el = audioRef.current;
      if (!el) return;
      if (playId === id && !el.paused) {
        el.pause();
        return;
      }
      if (playId !== id) {
        el.src = url;
        el.currentTime = 0;
      }
      void el.play().catch(() => {});
    },
    [playId],
  );

  const seekTo = useCallback((p: number) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = p * el.duration;
  }, []);

  /* ------------------------------- toasts ------------------------------ */
  const toastId = useRef(0);
  const [toasts, setToasts] = useState<
    Array<{ id: number; msg: string; tone: "ok" | "err" | "info" }>
  >([]);
  const pushToast = useCallback((msg: string, tone: "ok" | "err" | "info" = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  /* ------------------------------ history ------------------------------ */
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      setHistory((json?.items ?? []) as HistoryItem[]);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const onDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await fetch("/api/history", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setHistory((h) => h.filter((i) => i.id !== id));
        const el = audioRef.current;
        if (playId === id && el) el.pause();
        pushToast(t("toast.deleted"));
      } catch {
        pushToast(t("toast.deleteFail"), "err");
      } finally {
        setDeletingId(null);
      }
    },
    [playId, pushToast, t],
  );

  /* ------------------------- tts request helper ------------------------ */
  const ttsRequest = useCallback(
    async (chunk: string): Promise<AudioBuffer> => {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: chunk, voice, rate, pitch }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `فشل طلب الخادم (${res.status})`);
      }
      return decodeAudio(await res.arrayBuffer());
    },
    [voice, rate, pitch],
  );

  /* ------------------------------ preview ------------------------------ */
  const previewUrlRef = useRef<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const onPreview = useCallback(async () => {
    if (!voice || previewing) return;
    setPreviewing(true);
    try {
      const buf = await ttsRequest(previewSentenceFor(locale));
      const blob = bufferToWav(buf);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      togglePlay(`preview:${voice}`, url);
    } catch (e) {
      pushToast(t("toast.previewFail", { e: errMsg(e) }), "err");
    } finally {
      setPreviewing(false);
    }
  }, [voice, locale, previewing, ttsRequest, togglePlay, pushToast, t]);

  /* ------------------------------ pipeline ----------------------------- */
  const [step, setStep] = useState<PipelineStep>("idle");
  const [progress, setProgress] = useState({ index: 0, total: 0 });
  const [pipeError, setPipeError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const busy = step === "tts" || step === "mix" || step === "encode";
  const needUpload = source === "upload" && !uploadBuf;
  const canGenerate =
    Boolean(text.trim()) && Boolean(voice) && !voicesLoading && !busy && !needUpload;
  const generateHint = !text.trim()
    ? t("hint.text")
    : !voice
      ? t("hint.voice")
      : needUpload
        ? t("hint.upload")
        : null;

  const onGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setPipeError(null);
    setSaveState("idle");
    try {
      setStep("tts");
      const chunks = splitForTts(text, 2200);
      setProgress({ index: 0, total: chunks.length });
      const buffers: AudioBuffer[] = [];
      for (let i = 0; i < chunks.length; i++) {
        let buf: AudioBuffer | null = null;
        let lastErr: unknown = new Error("فشل التوليد");
        for (let attempt = 0; attempt < 2 && !buf; attempt++) {
          try {
            buf = await ttsRequest(chunks[i]);
          } catch (e) {
            lastErr = e;
            await new Promise((r) => setTimeout(r, 400 + attempt * 600));
          }
        }
        if (!buf) throw lastErr;
        buffers.push(buf);
        setProgress({ index: i + 1, total: chunks.length });
        if (i > 0 && i % 2 === 1)
          pushToast(t("toast.progress", { i: i + 1, n: chunks.length }), "info");
      }

      setStep("mix");
      await nextFrame();
      const moodKey: MoodKey | null =
        source === "generated" ? (mood === "auto" ? (guess?.mood ?? "calm") : mood) : null;
      const mix = await renderMix({
        voiceChunks: buffers,
        gapSeconds: 0.10,
        tailSeconds: fade ? 2.4 : 0.8,
        musicBuffer: source === "upload" ? uploadBuf : null,
        moodKey,
        musicVolume: volume,
        duckAmount: duck ? 0.82 : 0,
        fadeInSeconds: 0.8,
        fadeOutSeconds: fade ? 2.4 : 0.35,
      });

      setStep("encode");
      await nextFrame();
      const blob =
        format === "mp3" ? await bufferToMp3(mix.buffer, 160) : bufferToWav(mix.buffer);
      const peaks = computePeaks(mix.buffer);
      const url = URL.createObjectURL(blob);
      if (result) URL.revokeObjectURL(result.url);
      const fileName = `masmoo-${locale}-${new Date()
        .toISOString()
        .slice(11, 19)
        .replace(/:/g, "")}.${format}`;
      setResult({
        url,
        format,
        fileName,
        duration: mix.duration,
        sizeBytes: blob.size,
        peaks,
        voiceName: voiceDisplayName(voice),
        locale,
        moodLabel: moodKey ? moodStrings(moodKey, lang).label : t("mood.noneLabel"),
        blob,
      });
      setStep("done");
      pushToast(t("toast.done"));

      /* archive (non-blocking best effort) */
      try {
        setSaveState("saving");
        const fd = new FormData();
        fd.append("file", blob, fileName);
        fd.append("text", text.slice(0, 12000));
        fd.append("voice", voice);
        fd.append("voiceName", voiceDisplayName(voice));
        fd.append("locale", locale);
        fd.append("mood", moodKey ?? "none");
        fd.append("musicSource", source);
        fd.append("format", format);
        fd.append("duration", String(mix.duration));
        const sres = await fetch("/api/save", { method: "POST", body: fd });
        const sjson = await sres.json().catch(() => null);
        if (sres.ok && sjson?.ok) {
          setSaveState("saved");
          void loadHistory();
        } else {
          setSaveState("failed");
        }
      } catch {
        setSaveState("failed");
      }
    } catch (e) {
      setStep("error");
      setPipeError(errMsg(e));
    }
  }, [
    canGenerate, text, ttsRequest, source, mood, guess, uploadBuf, volume, duck,
    fade, format, result, locale, voice, pushToast, loadHistory,
  ]);

  /* -------------------------------- view ------------------------------- */
  const panelMotion = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-100">
      <Backdrop />
      <Header
        voicesCount={voices.length}
        localesCount={groupsView.length}
        t={t}
        lang={lang}
        setLang={setLang}
      />

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <motion.div {...panelMotion} className="min-h-[420px]">
            <TextPanel
              value={text}
              onChange={setText}
              guess={guess}
              estimateSec={estimateSec}
              busy={busy}
              t={t}
              lang={lang}
            />
          </motion.div>

          <motion.div
            {...panelMotion}
            transition={{ ...panelMotion.transition, delay: 0.08 }}
            className="space-y-6"
          >
            <VoicePanel
              loading={voicesLoading}
              error={voicesError}
              onRetry={loadVoices}
              locales={groupsView}
              locale={locale}
              setLocale={setLocale}
              voices={voicesForLocale}
              voice={voice}
              setVoice={setVoice}
              rate={rate}
              setRate={setRate}
              pitch={pitch}
              setPitch={setPitch}
              onPreview={onPreview}
              previewing={previewing}
              disabled={busy}
              t={t}
            />
            <MusicPanel
              source={source}
              setSource={setSource}
              mood={mood}
              setMood={setMood}
              autoMood={guess?.mood ?? "calm"}
              autoMatched={Boolean(guess?.matched)}
              volume={volume}
              setVolume={setVolume}
              duck={duck}
              setDuck={setDuck}
              fade={fade}
              setFade={setFade}
              fileMeta={fileMeta}
              fileBusy={fileBusy}
              fileError={fileError}
              onFile={onFile}
              onClearFile={() => {
                setUploadBuf(null);
                setFileMeta(null);
                setFileError(null);
              }}
              t={t}
              lang={lang}
            />
            <OutputPanel
              format={format}
              setFormat={setFormat}
              step={step}
              progress={progress}
              canGenerate={canGenerate}
              hint={generateHint}
              onGenerate={onGenerate}
              result={result}
              isPlayingThis={playId === "result" && isPlaying}
              currentTime={playId === "result" ? ctime : 0}
              onTogglePlay={() => result && togglePlay("result", result.url)}
              onSeek={seekTo}
              saveState={saveState}
              error={pipeError}
              t={t}
            />
          </motion.div>
        </div>

        <motion.div
          {...panelMotion}
          transition={{ ...panelMotion.transition, delay: 0.14 }}
        >
          <HistoryPanel
            items={history}
            loading={historyLoading}
            playingId={playId}
            isPlaying={isPlaying}
            onToggle={(item) => togglePlay(item.id, item.url)}
            onDelete={onDelete}
            deletingId={deletingId}
            onRefresh={loadHistory}
            t={t}
            lang={lang}
          />
        </motion.div>

        <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[11px] text-slate-600">
          <span>{t("footer.a")}</span>
          <span className="hidden text-slate-700 sm:inline">•</span>
          <span>{t("footer.b")}</span>
        </footer>
      </main>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col items-stretch gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[12.5px] shadow-2xl backdrop-blur-md ${
                t.tone === "ok"
                  ? "border-emerald-300/25 bg-emerald-950/70 text-emerald-100"
                  : t.tone === "err"
                    ? "border-rose-300/25 bg-rose-950/70 text-rose-100"
                    : "border-cyan-300/25 bg-cyan-950/70 text-cyan-100"
              }`}
            >
              {t.tone === "ok" ? (
                <Check className="size-4 shrink-0" />
              ) : t.tone === "err" ? (
                <AlertTriangle className="size-4 shrink-0" />
              ) : (
                <Info className="size-4 shrink-0" />
              )}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCtime(0);
        }}
        onTimeUpdate={(e) => setCtime(e.currentTarget.currentTime)}
      />
    </div>
  );
}
