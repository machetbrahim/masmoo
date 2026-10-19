import { synthesizeSpeech } from "@/lib/server/tts";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const MAX_CHARS = 3000;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      text?: string;
      voice?: string;
      rate?: number;
      pitch?: number;
    } | null;

    const text = body?.text?.trim() ?? "";
    const voice = body?.voice?.trim() ?? "";
    if (!text || !voice) {
      return Response.json(
        { ok: false, error: "النص والصوت مطلوبان" },
        { status: 400 },
      );
    }
    if (text.length > MAX_CHARS) {
      return Response.json(
        { ok: false, error: `الجزء يتجاوز ${MAX_CHARS} حرفاً` },
        { status: 400 },
      );
    }

    const rate = Math.min(2, Math.max(0.5, Number(body?.rate) || 1));
    const pitch = Math.min(4, Math.max(-4, Number(body?.pitch) || 0));

    const audio = await synthesizeSpeech(text, voice, { rate, pitch });

    return new Response(new Uint8Array(audio), {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "content-length": String(audio.length),
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "تعذر توليد الصوت";
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
