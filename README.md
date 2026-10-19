<div dir="rtl">

# مسموع — استوديو تحويل النص إلى صوت

استوديو ويب متكامل يحوّل أي نص إلى ملف صوتي احترافي قابل للتحميل، مع مئات الأصوات العصبية بأكثر من 100 لغة ولهجة، موسيقى تولَّد تلقائياً حسب مزاج المحتوى أو تُرفق من جهازك، مزج ذكي (خفض تلقائي تحت الكلام)، وتصدير مباشر بصيغتي **MP3** و **WAV**.

واجهة ثلاثية اللغات: **العربية · Français · English** (مع دعم كامل لـ RTL/LTR).

## المزايا

- **أصوات عصبية** عبر Microsoft Edge Read-Aloud (بلا مفاتيح API) مع تحكم بالسرعة والطبقة
- **مؤلف موسيقي إجرائي**: 6 مزاجات (هادئ، ملحمي، مبهج، إخباري، درامي، حزين) تُختار تلقائياً بتحليل النص
- **إرفاق ملف صوتي** يُكرَّر تلقائياً ليغطي كامل مدة الكلام
- **مزج فوري داخل المتصفح**: Web Audio — خفض ذكي، تلاشي ختامي، ضاغط ديناميكي
- **سجل دائم** للتحويلات (PostgreSQL + Drizzle) مع إعادة تشغيل وتحميل لاحق

</div>

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Framer Motion, Lucide |
| TTS | `msedge-tts` (Edge Read-Aloud neural voices, no API key) |
| Mixing / encoding | Web Audio API (OfflineAudioContext) + `@breezystack/lamejs` |
| Persistence | PostgreSQL via Drizzle ORM + local `storage/audio` files |

## Getting started

```bash
npm install                 # install dependencies
cp .env.example .env        # configure DATABASE_URL
npx drizzle-kit push        # create the generations table
npm run dev                 # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Pushing this repo to GitHub

The repository is already initialised locally with a clean history. From any
machine that has your GitHub credentials:

```bash
git remote add origin git@github.com:<you>/masmoo.git   # or the HTTPS URL
git push -u origin main
```

Or with GitHub CLI: `gh repo create masmoo --public --source=. --push`.

> **Security note:** never commit `.env` — it is git-ignored on purpose. Use
> `.env.example` as the documented template.

## Project layout

```
src/
├─ app/
│  ├─ page.tsx               # studio shell (client)
│  └─ api/
│     ├─ voices/             # list Edge neural voices
│     ├─ tts/                # text → MP3 chunk (rate/pitch)
│     ├─ save/               # archive rendered file + metadata
│     ├─ audio/[id]/         # stream / download archived files
│     └─ history/            # list & delete archived generations
├─ components/studio/        # panels: text, voice, music, output, history…
├─ lib/
│  ├─ i18n.ts                # ar / fr / en dictionaries + mood strings + samples
│  ├─ mood.ts                # mood metadata + text analyser (ar/en keywords)
│  ├─ music.ts               # procedural score composer (pads, bass, arp, drums)
│  ├─ audio.ts               # decode, duck envelope, offline mix, MP3/WAV encoders
│  └─ server/                # msedge-tts wrapper, voice cache, disk storage
└─ db/                       # drizzle pool + generations table
```
