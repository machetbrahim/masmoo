/** Central UI dictionaries for Arabic (default), English and French. */
import type { MoodKey } from "./mood";

export type Lang = "ar" | "en" | "fr";

export const LANGS: Lang[] = ["ar", "fr", "en"];

export const LANG_LABELS: Record<Lang, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export const DIR: Record<Lang, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  fr: "ltr",
};

const AR = {
  "brand.name": "مسموع",
  "brand.sub": "استوديو تحويل النص إلى صوت — تعليق صوتي، موسيقى، وتحميل فوري",

  "stats.voicesCount": "{n} صوت عصبي",
  "stats.voicesLoading": "الأصوات قيد التحميل",
  "stats.locales": "{n} لغة ولهجة",
  "stats.localesFallback": "أكثر من 100 لغة",
  "stats.unlimited": "بلا حدود للاستخدام",
  "stats.formats": "MP3 / WAV",
  "stats.ready": "جاهز للتوليد",

  "text.title": "النص",
  "text.sub": "اكتب أو الصق أي محتوى لتحويله إلى كلام مسموع",
  "text.clear": "مسح",
  "text.placeholder":
    "ابدأ الكتابة هنا… جرّب: مقالاً إخبارياً، مقدمة بودكاست، حكاية، أو إعلاناً ترويجياً.",
  "text.moodDetected": "المزاج المكتشف: {m}",
  "text.moodIdle": "يكتشف مزاج النص تلقائياً أثناء الكتابة",

  "voice.title": "الصوت",
  "voice.sub": "اختر اللغة ثم المتحدث واضبط السرعة والطبقة",
  "voice.listen": "استماع للعينة",
  "voice.error": "تعذر تحميل قائمة الأصوات — تحقق من الاتصال بالخادم.",
  "voice.retry": "إعادة المحاولة",
  "voice.language": "اللغة / اللهجة",
  "voice.loading": "قيد التحميل…",
  "voice.filter": "تصفية المتحدثين",
  "filter.all": "الكل",
  "filter.male": "رجال",
  "filter.female": "نساء",
  "voice.maleChip": "صوت رجالي",
  "voice.femaleChip": "صوت نسائي",
  "voice.neural": "عصبي",
  "voice.empty": "لا توجد أصوات بهذه التصفية",
  "voice.rate": "سرعة الكلام",
  "voice.pitch": "طبقة الصوت",
  "unit.semitone": "نغمة",

  "music.title": "الموسيقى التصويرية",
  "music.sub": "موسيقى تولَّد آلياً حسب المحتوى، أو أرفق ملفك الصوتي",
  "src.generated": "توليد تلقائي",
  "src.upload": "إرفاق ملف",
  "src.none": "بدون",
  "auto.title": "تلقائي حسب المحتوى",
  "auto.matched": "المكتشف الآن: {m}",
  "auto.unmatched": "حلّل النص لاختيار الموسيقى الأنسب",
  "upload.idle": "اسحب ملفك الصوتي هنا أو انقر للاختيار",
  "upload.busy": "جارٍ قراءة الملف…",
  "upload.sub": "MP3 / WAV / OGG — حتى 60 ميغابايت",
  "upload.loopNote": "سيُكرَّر المقطع ليغطي كامل مدة الكلام",
  "upload.remove": "إزالة الملف",
  "none.note": "تعليق صوتي نقي بدون أي خلفية موسيقية — مثالي للمونتاج الخارجي.",
  "music.level": "مستوى الموسيقى",
  "duck.label": "خفض ذكي تحت الكلام",
  "duck.hint": "تنخفض الموسيقى تلقائياً أثناء الكلام وترتفع في المواقف الصامتة",
  "fade.label": "تلاشي ختامي ناعم",
  "fade.hint": "امتداد موسيقي قصير بعد انتهاء الكلام مع خفوت تدريجي",
  "mood.noneLabel": "بدون موسيقى",

  "output.title": "التوليد والتحميل",
  "output.sub": "مزج فوري داخل المتصفح وتحميل مباشر للملف النهائي",
  "cta.generate": "توليد الملف الصوتي",
  "cta.regen": "توليد نسخة جديدة",
  "cta.tts": "جارٍ كتابة الصوت… {i}/{n}",
  "cta.mix": "مزج الموسيقى مع الكلام…",
  "cta.encode": "ترميز الملف النهائي…",
  "hint.text": "اكتب نصاً أو اختر عينة جاهزة لتفعيل التوليد",
  "hint.voice": "اختر صوتاً أولاً",
  "hint.upload": "أرفق ملفاً صوتياً أو بدّل مصدر الموسيقى",
  "step.speech": "الكلام",
  "step.mix": "المزج",
  "step.encode": "الترميز",
  "step.ready": "جاهز",
  "save.saving": "يُحفظ في السجل…",
  "save.saved": "محفوظ في السجل",
  "save.failed": "تعذر الأرشفة — التحميل متاح",
  "result.download": "تحميل الملف النهائي ({fmt})",
  "btn.play": "تشغيل",
  "btn.pause": "إيقاف مؤقت",

  "history.title": "سجل التحويلات",
  "history.sub": "{n} ملفاً محفوظاً — إعادة تشغيل وتحميل في أي وقت",
  "history.subEmpty": "كل ما تولّده الاستوديو يُحفظ هنا تلقائياً",
  "history.empty": "لا تحويلات بعد — ولّد أول ملف صوتي وسيظهر هنا فوراً.",
  "history.refresh": "تحديث السجل",
  "history.download": "تحميل",
  "history.delete": "حذف",
  "history.confirm": "تأكيد؟",
  "history.now": "الآن",
  "histSrc.generated": "موسيقى مولدة",
  "histSrc.upload": "ملف موسيقى مرفق",
  "histSrc.none": "صوت فقط",

  "toast.deleted": "حُذف الملف من السجل",
  "toast.deleteFail": "تعذر حذف الملف",
  "toast.previewFail": "تعذر توليد العينة — {e}",
  "toast.progress": "اكتمل {i} من {n} أجزاء",
  "toast.done": "اكتمل التوليد — جاهز للتحميل",

  "unit.byte": "{n} بايت",
  "unit.kb": "{n} ك.ب",
  "unit.mb": "{n} م.ب",

  "footer.a": "مسموع — توليد كلام عصبي، تأليف موسيقي إجرائي، ومزج ذكي بالكامل داخل متصفحك",
  "footer.b": "الملفات الناتجة ملك لك بالكامل",
} as const;

export type TKey = keyof typeof AR;

const EN: Record<TKey, string> = {
  "brand.name": "Masmoo",
  "brand.sub": "Text-to-speech studio — narration, music, and instant download",

  "stats.voicesCount": "{n} neural voices",
  "stats.voicesLoading": "Loading voices…",
  "stats.locales": "{n} languages & accents",
  "stats.localesFallback": "100+ languages",
  "stats.unlimited": "Unlimited use",
  "stats.formats": "MP3 / WAV",
  "stats.ready": "Ready to generate",

  "text.title": "Your text",
  "text.sub": "Type or paste any content to turn it into spoken audio",
  "text.clear": "Clear",
  "text.placeholder":
    "Start typing here… try a news article, a podcast intro, a story, or a promo ad.",
  "text.moodDetected": "Detected mood: {m}",
  "text.moodIdle": "The text mood is detected automatically as you type",

  "voice.title": "Voice",
  "voice.sub": "Pick a language, choose the speaker, tune speed and pitch",
  "voice.listen": "Preview voice",
  "voice.error": "Couldn't load the voice list — check the server connection.",
  "voice.retry": "Retry",
  "voice.language": "Language / dialect",
  "voice.loading": "Loading…",
  "voice.filter": "Filter speakers",
  "filter.all": "All",
  "filter.male": "Male",
  "filter.female": "Female",
  "voice.maleChip": "Male voice",
  "voice.femaleChip": "Female voice",
  "voice.neural": "Neural",
  "voice.empty": "No voices match this filter",
  "voice.rate": "Speech rate",
  "voice.pitch": "Voice pitch",
  "unit.semitone": "semitone",

  "music.title": "Background score",
  "music.sub": "Auto-composed to fit your content, or attach your own file",
  "src.generated": "Auto-compose",
  "src.upload": "Attach file",
  "src.none": "None",
  "auto.title": "Automatic from content",
  "auto.matched": "Now detected: {m}",
  "auto.unmatched": "Analyzes your text to pick the best-fit music",
  "upload.idle": "Drag your audio file here or click to browse",
  "upload.busy": "Reading the file…",
  "upload.sub": "MP3 / WAV / OGG — up to 60 MB",
  "upload.loopNote": "The track loops to cover the full narration length",
  "upload.remove": "Remove file",
  "none.note": "A clean voice-over with no background — perfect for external editing.",
  "music.level": "Music level",
  "duck.label": "Smart ducking under speech",
  "duck.hint": "Music automatically dips during narration and rises in pauses",
  "fade.label": "Gentle fade-out ending",
  "fade.hint": "A short musical tail after the last word, fading smoothly",
  "mood.noneLabel": "No music",

  "output.title": "Generate & download",
  "output.sub": "In-browser mixing and instant download of the final file",
  "cta.generate": "Generate audio file",
  "cta.regen": "Generate a new version",
  "cta.tts": "Writing speech… {i}/{n}",
  "cta.mix": "Mixing music with narration…",
  "cta.encode": "Encoding the final file…",
  "hint.text": "Write some text or pick a sample to enable generation",
  "hint.voice": "Choose a voice first",
  "hint.upload": "Attach an audio file or change the music source",
  "step.speech": "Speech",
  "step.mix": "Mixing",
  "step.encode": "Encoding",
  "step.ready": "Ready",
  "save.saving": "Saving to history…",
  "save.saved": "Saved to history",
  "save.failed": "Archiving failed — download still works",
  "result.download": "Download final file ({fmt})",
  "btn.play": "Play",
  "btn.pause": "Pause",

  "history.title": "Generation history",
  "history.sub": "{n} saved files — replay and download anytime",
  "history.subEmpty": "Everything the studio generates is archived here automatically",
  "history.empty": "Nothing yet — generate your first audio file and it will appear here.",
  "history.refresh": "Refresh history",
  "history.download": "Download",
  "history.delete": "Delete",
  "history.confirm": "Confirm?",
  "history.now": "now",
  "histSrc.generated": "Generated music",
  "histSrc.upload": "Attached music",
  "histSrc.none": "Voice only",

  "toast.deleted": "File removed from history",
  "toast.deleteFail": "Couldn't delete the file",
  "toast.previewFail": "Couldn't generate the preview — {e}",
  "toast.progress": "Finished {i} of {n} segments",
  "toast.done": "Generation complete — ready to download",

  "unit.byte": "{n} B",
  "unit.kb": "{n} KB",
  "unit.mb": "{n} MB",

  "footer.a": "Masmoo — neural speech, procedural scoring, and smart mixing, entirely in your browser",
  "footer.b": "Everything you generate is fully yours",
};

const FR: Record<TKey, string> = {
  "brand.name": "Masmoo",
  "brand.sub": "Studio de synthèse vocale — voix off, musique et téléchargement immédiat",

  "stats.voicesCount": "{n} voix neuronales",
  "stats.voicesLoading": "Chargement des voix…",
  "stats.locales": "{n} langues et accents",
  "stats.localesFallback": "Plus de 100 langues",
  "stats.unlimited": "Utilisation illimitée",
  "stats.formats": "MP3 / WAV",
  "stats.ready": "Prêt à générer",

  "text.title": "Votre texte",
  "text.sub": "Saisissez ou collez n'importe quel contenu pour le convertir en audio",
  "text.clear": "Effacer",
  "text.placeholder":
    "Commencez ici… essayez un article de presse, une intro de podcast, un récit ou une publicité.",
  "text.moodDetected": "Ambiance détectée : {m}",
  "text.moodIdle": "L'ambiance du texte est détectée automatiquement pendant la saisie",

  "voice.title": "Voix",
  "voice.sub": "Choisissez la langue, la voix, puis réglez vitesse et hauteur",
  "voice.listen": "Écouter un extrait",
  "voice.error": "Impossible de charger la liste des voix — vérifiez la connexion au serveur.",
  "voice.retry": "Réessayer",
  "voice.language": "Langue / dialecte",
  "voice.loading": "Chargement…",
  "voice.filter": "Filtrer les voix",
  "filter.all": "Toutes",
  "filter.male": "Hommes",
  "filter.female": "Femmes",
  "voice.maleChip": "Voix masculine",
  "voice.femaleChip": "Voix féminine",
  "voice.neural": "Neuronale",
  "voice.empty": "Aucune voix pour ce filtre",
  "voice.rate": "Vitesse d'élocution",
  "voice.pitch": "Hauteur de la voix",
  "unit.semitone": "demi-ton",

  "music.title": "Musique de fond",
  "music.sub": "Générée automatiquement selon le contenu, ou joignez votre fichier",
  "src.generated": "Génération auto",
  "src.upload": "Joindre un fichier",
  "src.none": "Aucune",
  "auto.title": "Automatique selon le contenu",
  "auto.matched": "Détecté actuellement : {m}",
  "auto.unmatched": "Analyse votre texte pour choisir la musique idéale",
  "upload.idle": "Glissez votre fichier audio ici ou cliquez pour choisir",
  "upload.busy": "Lecture du fichier…",
  "upload.sub": "MP3 / WAV / OGG — jusqu'à 60 Mo",
  "upload.loopNote": "Le morceau boucle pour couvrir toute la durée de la narration",
  "upload.remove": "Retirer le fichier",
  "none.note": "Une voix off pure sans fond musical — idéale pour un montage externe.",
  "music.level": "Volume de la musique",
  "duck.label": "Atténuation smart sous la voix",
  "duck.hint": "La musique baisse pendant la narration et remonte dans les silences",
  "fade.label": "Fondu de sortie doux",
  "fade.hint": "Une courte queue musicale après le dernier mot, en fondu progressif",
  "mood.noneLabel": "Sans musique",

  "output.title": "Génération et téléchargement",
  "output.sub": "Mixage dans le navigateur et téléchargement direct du fichier final",
  "cta.generate": "Générer le fichier audio",
  "cta.regen": "Générer une nouvelle version",
  "cta.tts": "Écriture de la voix… {i}/{n}",
  "cta.mix": "Mixage de la musique et de la voix…",
  "cta.encode": "Encodage du fichier final…",
  "hint.text": "Écrivez un texte ou choisissez un exemple pour lancer la génération",
  "hint.voice": "Choisissez d'abord une voix",
  "hint.upload": "Joignez un fichier audio ou changez la source musicale",
  "step.speech": "Voix",
  "step.mix": "Mixage",
  "step.encode": "Encodage",
  "step.ready": "Prêt",
  "save.saving": "Sauvegarde dans l'historique…",
  "save.saved": "Enregistré dans l'historique",
  "save.failed": "Archivage impossible — le téléchargement reste disponible",
  "result.download": "Télécharger le fichier final ({fmt})",
  "btn.play": "Lecture",
  "btn.pause": "Pause",

  "history.title": "Historique des générations",
  "history.sub": "{n} fichiers enregistrés — réécoute et téléchargement à tout moment",
  "history.subEmpty": "Tout ce que le studio génère est archivé ici automatiquement",
  "history.empty": "Rien pour le moment — générez votre premier fichier audio et il apparaîtra ici.",
  "history.refresh": "Actualiser l'historique",
  "history.download": "Télécharger",
  "history.delete": "Supprimer",
  "history.confirm": "Confirmer ?",
  "history.now": "à l'instant",
  "histSrc.generated": "Musique générée",
  "histSrc.upload": "Musique jointe",
  "histSrc.none": "Voix seule",

  "toast.deleted": "Fichier supprimé de l'historique",
  "toast.deleteFail": "Suppression impossible",
  "toast.previewFail": "Impossible de générer l'extrait — {e}",
  "toast.progress": "{i} segments sur {n} terminés",
  "toast.done": "Génération terminée — prêt à télécharger",

  "unit.byte": "{n} o",
  "unit.kb": "{n} Ko",
  "unit.mb": "{n} Mo",

  "footer.a": "Masmoo — voix neuronales, composition procédurale et mixage intelligent, entièrement dans votre navigateur",
  "footer.b": "Tout ce que vous générez vous appartient",
};

export const DICT: Record<Lang, Record<TKey, string>> = { ar: AR, en: EN, fr: FR };

export type TFn = (key: TKey, vars?: Record<string, string | number>) => string;

export function makeT(lang: Lang): TFn {
  return (key, vars) => {
    let s: string = DICT[lang][key] ?? AR[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.split(`{${k}}`).join(String(v));
      }
    }
    return s;
  };
}

/* ------------------------------ mood strings ----------------------------- */

export const MOOD_I18N: Record<Lang, Record<MoodKey, { label: string; hint: string }>> = {
  ar: {
    calm: { label: "هادئ وتأملي", hint: "وسادات ناعمة وإيقاع بطيء يناسب التأمل والقصص" },
    epic: { label: "ملحمي وسينمائي", hint: "خماسيات ضخمة وطبول مدوية لمقدمات الأفلام" },
    happy: { label: "مبهج ومشرق", hint: "نقرات لامعة وإيقاع راقص للمحتوى الإيجابي" },
    news: { label: "إخباري رصين", hint: "نبض ثابت وتوازن مهني أسفل التقارير والأخبار" },
    dramatic: { label: "درامي ومتوتر", hint: "طبقات داكنة ونبض منخفض للغموض والتشويق" },
    sad: { label: "حزين وشجي", hint: "تقدّم سلمي بطيء مليء بالحميمية والحنين" },
  },
  en: {
    calm: { label: "Calm & meditative", hint: "Soft pads at a gentle tempo for meditation and stories" },
    epic: { label: "Epic & cinematic", hint: "Huge power chords and booming drums for film intros" },
    happy: { label: "Bright & joyful", hint: "Sparkling plucks with a danceable beat for positive content" },
    news: { label: "Newsroom ready", hint: "A steady professional pulse beneath reports" },
    dramatic: { label: "Dramatic & tense", hint: "Dark layers with a low pulse for mystery" },
    sad: { label: "Sad & tender", hint: "A slow minor progression full of longing" },
  },
  fr: {
    calm: { label: "Calme et méditatif", hint: "Nappes douces et tempo paisible pour la méditation et les récits" },
    epic: { label: "Épique et cinématique", hint: "Accords puissants et tambours imposants pour des ouvertures de film" },
    happy: { label: "Joyeux et lumineux", hint: "Notes étincelantes et rythme enjoué pour un contenu positif" },
    news: { label: "Journalistique et posé", hint: "Une pulsation professionnelle régulière sous les reportages" },
    dramatic: { label: "Dramatique et tendu", hint: "Couches sombres et pulsation grave pour le mystère" },
    sad: { label: "Triste et nostalgique", hint: "Progression mineure lente empreinte de mélancolie" },
  },
};

export const moodStrings = (key: MoodKey, lang: Lang) =>
  MOOD_I18N[lang][key] ?? MOOD_I18N.ar[key];

/* ----------------------------- sample texts ------------------------------ */

export interface SampleText {
  id: string;
  label: string;
  text: string;
}

export const SAMPLES: Record<Lang, SampleText[]> = {
  ar: [
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
  ],
  en: [
    {
      id: "news",
      label: "Breaking news",
      text: "Breaking: the International Space Agency announced this morning the successful launch of its new spacecraft toward the space station, a historic achievement that paves the way for longer and safer crewed missions. Engineers confirmed in the official report that all systems are operating at full efficiency and that the crew will arrive at its destination within twelve hours.",
    },
    {
      id: "story",
      label: "Epic tale",
      text: "In the heart of the old city, where the alleys sleep beneath the shadow of ancient walls, the legend of the last knight was born. He fought a great battle alone against the storm, until victory sang his name and history wrote it in letters of light. Strength lived in his voice, passion in his heart, and glory awaited him at every dawn.",
    },
    {
      id: "calm",
      label: "Morning meditation",
      text: "Take a deep breath and listen to the sound of the sea. Calm fills the morning, and nature whispers peace. Let your thoughts drift like the waves, and grant your heart a moment of stillness. With every inhale, peace draws closer; with every exhale, the noise fades away.",
    },
    {
      id: "joy",
      label: "Cheerful promo",
      text: "Celebrate with us! Success tastes different today. A brand-new win and a wonderful surprise are waiting for you with the grand happiness sale. Laugh, sing, and share the joy with the people you love — because the most beautiful moments are the ones we live together.",
    },
  ],
  fr: [
    {
      id: "news",
      label: "Dernière minute",
      text: "Dernière minute : l'Agence spatiale internationale a annoncé ce matin le succès du lancement de son nouveau vaisseau vers la station spatiale, un accomplissement historique qui ouvre la voie à des missions habitées plus longues et plus sûres. Les ingénieurs ont confirmé dans le rapport officiel que tous les systèmes fonctionnent parfaitement et que l'équipage arrivera à destination dans douze heures.",
    },
    {
      id: "story",
      label: "Récit épique",
      text: "Au cœur de la vieille ville, là où les ruelles dorment à l'ombre des remparts, est née la légende du dernier chevalier. Il livra seul une grande bataille contre la tempête, jusqu'à ce que la victoire chante son nom et que l'histoire le grave en lettres de lumière. La force était dans sa voix, la passion dans son cœur, et la gloire l'attendait à chaque aube.",
    },
    {
      id: "calm",
      label: "Méditation matinale",
      text: "Respirez profondément et écoutez le son de la mer. Le calme remplit le matin et la nature murmure la paix. Laissez vos pensées glisser comme les vagues et offrez à votre cœur un moment de sérénité. À chaque inspiration, la paix se rapproche ; à chaque expiration, le bruit s'éloigne.",
    },
    {
      id: "joy",
      label: "Annonce joyeuse",
      text: "Célébrez avec nous ! Le succès a une saveur toute nouvelle aujourd'hui. Une nouvelle victoire et une magnifique surprise vous attendent à l'occasion de la grande fête du bonheur. Riez, chantez et partagez la joie avec ceux que vous aimez — car les plus beaux moments sont ceux que nous vivons ensemble.",
    },
  ],
};
