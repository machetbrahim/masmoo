/**
 * Procedural background-music composer for the Web Audio API.
 * Everything is scheduled inside an OfflineAudioContext so the result is
 * rendered into the final mixed file.
 */
import type { MoodMeta } from "./mood";

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Deterministic PRNG so re-rendering the same text gives the same music. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(ctx: BaseAudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 1.2);
  const buf = new AudioBuffer({ length: len, sampleRate: ctx.sampleRate });
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function kick(
  ctx: BaseAudioContext,
  bus: AudioNode,
  t: number,
  level: number,
  decay: number,
) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(135, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + Math.min(0.14, decay));
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(level, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + decay + 0.05);
}

function noiseHit(
  ctx: BaseAudioContext,
  bus: AudioNode,
  noise: AudioBuffer,
  t: number,
  opts: { type: BiquadFilterType; freq: number; level: number; decay: number },
) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.value = opts.freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(opts.level, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
  src.connect(filter);
  filter.connect(g);
  g.connect(bus);
  src.start(t, Math.random() * 0.4);
  src.stop(t + opts.decay + 0.05);
}

export function scheduleMusic(
  ctx: OfflineAudioContext,
  dest: AudioNode,
  duration: number,
  mood: MoodMeta,
): void {
  const eng = mood.engine;
  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(dest);

  const noise = makeNoise(ctx);
  const rnd = mulberry32(1234567 + Math.round(duration * 97));
  const bar = (60 / eng.bpm) * 4;
  const chords = eng.progression;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = eng.padCutoff * 0.28;
  lfo.connect(lfoDepth);
  lfo.start(0);
  lfo.stop(duration + bar);

  let t = 0;
  let barIndex = 0;
  while (t < duration) {
    const chord = chords[barIndex % chords.length];

    /* ---------- pad ---------- */
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, t);
    padGain.gain.linearRampToValueAtTime(0.9, t + bar * 0.3);
    padGain.gain.setValueAtTime(0.9, t + bar * 0.78);
    padGain.gain.exponentialRampToValueAtTime(0.0001, t + bar * 1.18);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = eng.padCutoff;
    lp.Q.value = 0.8;
    lfoDepth.connect(lp.frequency);
    lp.connect(padGain);
    padGain.connect(bus);

    const perNote = eng.padLevel / chord.length;
    for (const off of chord) {
      const f = mtof(eng.root + off);
      for (const det of [-7, 6]) {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = det;
        const oGain = ctx.createGain();
        oGain.gain.value = perNote * 0.5;
        o.connect(oGain);
        oGain.connect(lp);
        o.start(t);
        o.stop(t + bar * 1.2);
      }
    }

    /* ---------- bass ---------- */
    if (eng.bassLevel > 0) {
      const b = ctx.createOscillator();
      b.type = "sine";
      b.frequency.value = mtof(eng.root + chord[0] - 12);
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(eng.bassLevel * 0.5, t + bar * 0.12);
      bg.gain.setValueAtTime(eng.bassLevel * 0.5, t + bar * 0.8);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + bar * 1.02);
      b.connect(bg);
      bg.connect(bus);
      b.start(t);
      b.stop(t + bar * 1.05);
    }

    /* ---------- arpeggio plucks ---------- */
    if (eng.arp !== "none") {
      const eighth = bar / 8;
      const density = eng.arp === "steady" ? 0.85 : 0.34;
      for (let i = 0; i < 8; i++) {
        if (rnd() > density) continue;
        const tone = chord[Math.floor(rnd() * chord.length)];
        const octave = rnd() < 0.35 ? 24 : 12;
        const f = mtof(eng.root + tone + octave);
        const start = t + i * eighth + (rnd() < 0.2 ? eighth * 0.5 : 0);
        if (start >= duration) break;
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = f;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 420;
        const g = ctx.createGain();
        const peak = 0.045 + 0.05 * eng.brightness;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(peak, start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
        o.connect(hp);
        hp.connect(g);
        g.connect(bus);
        o.start(start);
        o.stop(start + 0.3);
      }
    }

    /* ---------- drums ---------- */
    const beat = bar / 4;
    if (eng.drums === "full") {
      for (let bI = 0; bI < 4; bI++) {
        kick(ctx, bus, t + bI * beat, bI === 0 ? 0.95 : 0.6, bI === 0 ? 0.7 : 0.3);
      }
      noiseHit(ctx, bus, noise, t + beat, {
        type: "bandpass", freq: 1700, level: 0.16, decay: 0.16,
      });
      noiseHit(ctx, bus, noise, t + 3 * beat, {
        type: "bandpass", freq: 1700, level: 0.16, decay: 0.16,
      });
      for (let h = 0; h < 8; h++) {
        noiseHit(ctx, bus, noise, t + (h / 8) * bar, {
          type: "highpass", freq: 8200, level: h % 2 ? 0.035 : 0.06, decay: 0.045,
        });
      }
      // cinematic swell at every 4th bar
      if (barIndex % 4 === 0) {
        noiseHit(ctx, bus, noise, t, {
          type: "lowpass", freq: 500, level: 0.12, decay: bar * 0.9,
        });
      }
    } else if (eng.drums === "soft") {
      kick(ctx, bus, t, 0.45, 0.5);
      kick(ctx, bus, t + 2 * beat, 0.35, 0.3);
      for (let h = 0; h < 4; h++) {
        noiseHit(ctx, bus, noise, t + h * beat + beat / 2, {
          type: "highpass", freq: 8600, level: 0.04, decay: 0.05,
        });
      }
    }

    t += bar;
    barIndex += 1;
  }
}
