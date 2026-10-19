import { getVoices } from "@/lib/server/tts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const voices = await getVoices();
    return Response.json({ ok: true, voices });
  } catch (err) {
    const message = err instanceof Error ? err.message : "failed to load voices";
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
