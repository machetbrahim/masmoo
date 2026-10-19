/** Text helpers: sentence-aware chunking for the TTS service + estimates. */

const SENTENCE_END = /(?<=[.!?؟…،؛:\n])\s+/u;

export function splitForTts(text: string, maxLen = 2200): string[] {
  const cleaned = text.replace(/\r/g, "").trim();
  if (!cleaned) return [];
  const sentences = cleaned.split(SENTENCE_END).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      // hard-split very long sentences on words
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      let line = "";
      for (const word of sentence.split(/\s+/)) {
        if (`${line} ${word}`.length > maxLen) {
          chunks.push(line.trim());
          line = word;
        } else {
          line = `${line} ${word}`.trim();
        }
      }
      if (line) current = `${line} `;
      continue;
    }
    if (current.length + sentence.length + 1 > maxLen) {
      chunks.push(current.trim());
      current = `${sentence} `;
    } else {
      current += `${sentence} `;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Rough speech length estimate in seconds (Arabic ≈ 2.4 words / second). */
export function estimateSpeechSeconds(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const pauses = (text.match(/[.!?؟…\n]/g) ?? []).length * 0.35;
  return Math.max(1.5, (words / 2.4 + pauses) / Math.max(0.4, rate));
}

export const SAMPLE_TEXTS: Array<{ id: string; label: string; text: string }> = [
  {
    id: "news",
    label: "خبر عاجل",
    text: "عاجل: أعلنت الوكالة الفضائية الدولية صباح اليوم عن نجاح إطلاق المركبة الجديدة نحو محطة الفضاء، وذلك في إنجاز تاريخي يفتح الباب أمام رحلات مأهولة أطول وأكثر أماناً. وأكد المهندسون في التقرير الرسمي أن جميع الأنظمة تعمل بكفاءة كاملة، وأن الطاقم سيصل إلى وجهته خلال اثنتي عشرة ساعة.",
  },
  {
    id: "story",
    label: "حكاية ملحمية",
    text: "في قلب المدينة القديمة، حيث تنام الأزقة تحت ظلال الأسوار، ولدت أسطورة الفارس الأخير. خاض معركة عظيمة وحيداً في وجه العاصفة، حتى غنّى له النصر وذكره التاريخ بأحرف من نور. كانت القوة في صوته، والحماس في قلبه، والمجد ينتظره عند كل فجر.",
  },
  {
    id: "calm",
    label: "تأمل صباحي",
    text: "خذ نفساً عميقاً واستمع لصوت البحر. الهدوء يملأ الصباح، والطبيعة تهمس بسلام. دع أفكارك تنساب كالموج، وامنح قلبك لحظة من السكينة. مع كل شهيق يقترب السلام، ومع كل زفير يبتعد الضجيج.",
  },
  {
    id: "joy",
    label: "إعلان مبهج",
    text: "احتفلوا معنا! النجاح له طعم آخر اليوم. فوز جديد ومفاجأة رائعة في انتظاركم مع عروض الفرحة الكبرى. اضحكوا، غنّوا، وشاركوا الفرح مع من تحبون — لأن أجمل اللحظات هي التي نعيشها معاً.",
  },
];

export const PREVIEW_SENTENCES: Record<string, string> = {
  ar: "مرحباً بك في مسموع، هذا مثال على صوتي وأتمنى أن ينال إعجابك.",
  en: "Hello, this is a preview of my voice. I hope you like how it sounds.",
  fr: "Bonjour, voici un aperçu de ma voix, j'espère qu'elle vous plaira.",
  es: "Hola, esta es una muestra de mi voz, espero que te guste.",
  de: "Hallo, das ist eine Hörprobe meiner Stimme. Ich hoffe, sie gefällt Ihnen.",
  tr: "Merhaba, bu benim sesimin bir önizlemesi, umarım beğenirsiniz.",
  ru: "Здравствуйте, это пример моего голоса, надеюсь он вам понравится.",
  hi: "नमस्ते, यह मेरी आवाज़ का एक नमूना है, आशा है आपको पसंद आएगा।",
  zh: "你好，这是我声音的示例，希望你会喜欢。",
  ja: "こんにちは。これは私の声のサンプルです。",
  pt: "Olá, esta é uma amostra da minha voz, espero que goste.",
  it: "Ciao, questa è un'anteprima della mia voce, spero ti piaccia.",
};

export function previewSentenceFor(locale: string): string {
  const lang = locale.split("-")[0].toLowerCase();
  return PREVIEW_SENTENCES[lang] ?? `This is a voice preview for ${locale}.`;
}
