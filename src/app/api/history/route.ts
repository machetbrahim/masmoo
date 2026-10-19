import { db } from "@/db";
import { generations } from "@/db/schema";
import { filePathFor } from "@/lib/server/storage";
import { desc, eq } from "drizzle-orm";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(generations)
      .orderBy(desc(generations.createdAt))
      .limit(30);
    return Response.json({
      ok: true,
      items: rows.map((r) => ({
        id: r.id,
        excerpt: r.excerpt,
        voice: r.voice,
        voiceName: r.voiceName,
        locale: r.locale,
        mood: r.mood,
        musicSource: r.musicSource,
        format: r.format,
        duration: r.duration,
        sizeBytes: r.sizeBytes,
        createdAt: r.createdAt,
        url: `/api/audio/${r.id}`,
      })),
    });
  } catch {
    // History is a convenience — never break the studio if the DB hiccups.
    return Response.json({ ok: false, items: [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json().catch(() => ({}))) as { id?: string };
    if (!id) {
      return Response.json({ ok: false, error: "المعرّف مفقود" }, { status: 400 });
    }
    const rows = await db
      .select({ format: generations.format })
      .from(generations)
      .where(eq(generations.id, id))
      .limit(1);
    await db.delete(generations).where(eq(generations.id, id));
    const abs = rows[0] ? filePathFor(id, rows[0].format) : null;
    if (abs) await fs.rm(abs, { force: true }).catch(() => {});
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "تعذر الحذف";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
