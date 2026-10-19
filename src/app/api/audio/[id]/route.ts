import { db } from "@/db";
import { generations } from "@/db/schema";
import { filePathFor, MIME_BY_EXT } from "@/lib/server/storage";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(generations)
      .where(eq(generations.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return Response.json({ ok: false, error: "غير موجود" }, { status: 404 });
    }
    const abs = filePathFor(id, row.format);
    if (!abs) {
      return Response.json({ ok: false, error: "مسار غير صالح" }, { status: 400 });
    }
    const data = await fs.readFile(abs);
    const url = new URL(request.url);
    const download = url.searchParams.get("dl") === "1";
    const headers: Record<string, string> = {
      "content-type": MIME_BY_EXT[row.format] ?? "application/octet-stream",
      "content-length": String(data.length),
      "cache-control": "public, max-age=31536000, immutable",
    };
    if (download) {
      const pretty = `masmoo-${row.locale}-${id.slice(0, 8)}.${row.format}`;
      headers["content-disposition"] = `attachment; filename="${pretty}"`;
    }
    return new Response(new Uint8Array(data), { status: 200, headers });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT"
        ? 404
        : 500;
    return Response.json(
      { ok: false, error: code === 404 ? "الملف غير موجود على القرص" : "تعذر قراءة الملف" },
      { status: code },
    );
  }
}
