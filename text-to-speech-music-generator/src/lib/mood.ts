/**
 * Musical moods: metadata for the UI + engine parameters for the procedural
 * composer, plus a lightweight keyword-based analyzer that guesses the mood
 * of any Arabic / English text.
 */

export type MoodKey = "calm" | "epic" | "happy" | "news" | "dramatic" | "sad";

export interface MoodEngine {
  bpm: number;
  root: number; // MIDI root note
  progression: number[][]; // chords as semitone offsets from root
  padCutoff: number; // Hz
  padLevel: number; // 0..1
  bassLevel: number; // 0..1
  arp: "none" | "sparse" | "steady";
  drums: "none" | "soft" | "full";
  brightness: number; // 0..1
}

export interface MoodMeta {
  key: MoodKey;
  label: string;
  hint: string;
  gradient: string;
  engine: MoodEngine;
}

const MINOR_LOOP = [
  [0, 3, 7],
  [-4, 0, 3],
  [-2, 2, 5],
  [-7, -4, 0],
];

export const MOODS: Record<MoodKey, MoodMeta> = {
  calm: {
    key: "calm",
    label: "هادئ وتأملي",
    hint: "وسادات ناعمة وإيقاع بطيء يناسب التأمل والقصص",
    gradient: "from-sky-400/80 to-cyan-300/60",
    engine: {
      bpm: 62,
      root: 57,
      progression: MINOR_LOOP,
      padCutoff: 900,
      padLevel: 0.5,
      bassLevel: 0.32,
      arp: "sparse",
      drums: "none",
      brightness: 0.55,
    },
  },
  epic: {
    key: "epic",
    label: "ملحمي وسينمائي",
    hint: "خماسيات ضخمة وطبول مدوية لمقدمات الأفلام",
    gradient: "from-amber-400/80 to-rose-500/60",
    engine: {
      bpm: 94,
      root: 57,
      progression: [
        [0, 7, 12],
        [-4, 3, 8],
        [-2, 5, 10],
        [-7, 0, 5],
      ],
      padCutoff: 1500,
      padLevel: 0.5,
      bassLevel: 0.55,
      arp: "none",
      drums: "full",
      brightness: 0.8,
    },
  },
  happy: {
    key: "happy",
    label: "مبهج ومشرق",
    hint: "نقرات لامعة وإيقاع راقص للمحتوى الإيجابي",
    gradient: "from-lime-300/80 to-emerald-400/60",
    engine: {
      bpm: 112,
      root: 60,
      progression: [
        [0, 4, 7],
        [7, 11, 14],
        [9, 12, 16],
        [5, 9, 12],
      ],
      padCutoff: 1800,
      padLevel: 0.36,
      bassLevel: 0.34,
      arp: "steady",
      drums: "soft",
      brightness: 0.9,
    },
  },
  news: {
    key: "news",
    label: "إخباري رصين",
    hint: "نبض ثابت وتوازن مهني أسفل التقارير والأخبار",
    gradient: "from-blue-400/80 to-indigo-400/60",
    engine: {
      bpm: 100,
      root: 55,
      progression: [
        [0, 4, 7],
        [9, 12, 16],
        [5, 9, 12],
        [7, 11, 14],
      ],
      padCutoff: 1200,
      padLevel: 0.3,
      bassLevel: 0.4,
      arp: "steady",
      drums: "soft",
      brightness: 0.65,
    },
  },
  dramatic: {
    key: "dramatic",
    label: "درامي ومتوتر",
    hint: "طبقات داكنة ونبض منخفض للغموض والتشويق",
    gradient: "from-violet-400/80 to-purple-600/60",
    engine: {
      bpm: 80,
      root: 50,
      progression: [
        [0, 3, 7],
        [8, 11, 15],
        [3, 6, 10],
        [10, 13, 17],
      ],
      padCutoff: 720,
      padLevel: 0.48,
      bassLevel: 0.5,
      arp: "none",
      drums: "soft",
      brightness: 0.4,
    },
  },
  sad: {
    key: "sad",
    label: "حزين وشجي",
    hint: "تقدّم سلمي بطيء مليء بالحميمية والحنين",
    gradient: "from-slate-400/80 to-slate-600/60",
    engine: {
      bpm: 56,
      root: 50,
      progression: [
        [0, 3, 7],
        [-4, 0, 3],
        [-7, -4, 0],
        [-9, -5, -2],
      ],
      padCutoff: 640,
      padLevel: 0.55,
      bassLevel: 0.34,
      arp: "sparse",
      drums: "none",
      brightness: 0.35,
    },
  },
};

export const MOOD_LIST: MoodMeta[] = [
  MOODS.calm,
  MOODS.epic,
  MOODS.happy,
  MOODS.news,
  MOODS.dramatic,
  MOODS.sad,
];

const KEYWORDS: Record<Exclude<MoodKey, "calm">, string[]> = {
  epic: [
    "ملحمة", "بطول", "معركة", "حرب", "انتصار", "القوة", "حماس", "انطلاق",
    "عظيم", "أسطور", "epic", "war", "battle", "victory", "hero", "power",
    "rise", "conquer",
  ],
  happy: [
    "فرح", "سعيد", "سعادة", "احتفال", "نجاح", "فوز", "عيد", "مبروك", "ضحك",
    "مرح", "أطفال", "مفاجأة", "happy", "joy", "success", "celebrat", "win",
    "cheer", "fun", "kids",
  ],
  news: [
    "عاجل", "أخبار", "أعلن", "وزار", "اقتصاد", "الأسواق", "تقرير", "وفقاً",
    "وفقا", "مصادر", "بيان", "رسمي", "الحكومة", "news", "breaking", "report",
    "announced", "official", "market", "statement",
  ],
  dramatic: [
    "غموض", "سر", "خطر", "توتر", "مأساة", "جريمة", "ظلام", "خوف", "كارثة",
    "تهديد", "mystery", "danger", "crime", "dark", "tension", "threat",
    "disaster", "fear",
  ],
  sad: [
    "حزن", "وفاة", "وداع", "دموع", "رحيل", "فقد", "ذكرى", "وحيد", "ألم",
    "نعي", "sad", "death", "goodbye", "tears", "loss", "memory", "grief",
    "farewell",
  ],
};

const CALM_WORDS = [
  "هدوء", "استرخاء", "تأمل", "طبيعة", "بحر", "صباح", "سلام", "نفس عميق",
  "calm", "relax", "meditat", "nature", "sea", "breathe", "peace",
];

export interface MoodGuess {
  mood: MoodKey;
  matched: boolean;
  hits: number;
}

export function detectMood(text: string): MoodGuess {
  const t = ` ${text.toLowerCase()} `;
  const scores: Array<[MoodKey, number]> = [];
  for (const [key, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      if (t.includes(w.toLowerCase())) score += 1 + w.length / 12;
    }
    scores.push([key as MoodKey, score]);
  }
  let calm = 0;
  for (const w of CALM_WORDS) if (t.includes(w.toLowerCase())) calm += 1;
  scores.sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = scores[0];
  if (topScore <= 0) return { mood: "calm", matched: calm > 0, hits: 0 };
  return { mood: topKey, matched: true, hits: Math.round(topScore) };
}
