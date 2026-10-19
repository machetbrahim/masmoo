import { db } from "@/db";
import { generations } from "@/db/schema";
import { ensureStorage, MIME_BY_EXT, STORAGE_DIR } from "@/lib/server/storage";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SIZE = 60 * 1024 * 1024;

/**
 * Receives the rendered audio (blob) + metadata and persists it so the
 * generation appears in the user history with a permanent download URL.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      return Response.json({ ok: false, error: "ملف صوتي مفقود" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return Response.json({ ok: false, error: "الملف كبير جداً" }, { status: 400 });
    }

    const format = String(form.get("format") ?? "mp3").toLowerCase();
    if (!MIME_BY_EXT[format]) {
      return Response.json({ ok: false, error: "صيغة غير مدعومة" }, { status: 400 });
    }

    await ensureStorage();
    const id = randomUUID();
    const absPath = path.join(STORAGE_DIR, `${id}.${format}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absPath, buffer);

    const text = String(form.get("text") ?? "").slice(0, 20000);
    const excerpt =
      String(form.get("text") ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 260) || "مقطع صوتي";

    await db.insert(generations).values({
      id,
      text,
      excerpt,
      voice: String(form.get("voice") ?? "").slice(0, 120),
      voiceName: String(form.get("voiceName") ?? "").slice(0, 200),
      locale: String(form.get("locale") ?? "").slice(0, 20),
      mood: String(form.get("mood") ?? "none").slice(0, 40),
      musicSource: String(form.get("musicSource") ?? "none").slice(0, 20),
      format,
      duration: Math.max(0, Number(form.get("duration")) || 0),
      sizeBytes: buffer.length,
      filePath: `${id}.${format}`,
    });

    return Response.json({ ok: true, id, url: `/api/audio/${id}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "تعذر حفظ الملف";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
