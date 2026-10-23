import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { isAdmin } from "@/lib/auth";

const esc = (v: unknown) => {
  const s = typeof v === "string" ? v : v instanceof Date ? v.toISOString() : JSON.stringify(v ?? "");
  // Neutralise spreadsheet formula injection and quote every cell.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  if (!db) return new Response("No database", { status: 404 });
  const type = new URL(req.url).searchParams.get("type");
  let rows: string[][];
  if (type === "subscribers") {
    const data = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
    rows = [["email", "name", "locale", "created_at"], ...data.map((r) => [r.email, r.name ?? "", r.locale, r.createdAt.toISOString()])];
  } else {
    const data = await db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt));
    rows = [["id", "kind", "status", "locale", "created_at", "data"], ...data.map((r) => [String(r.id), r.kind, r.status, r.locale, r.createdAt.toISOString(), JSON.stringify(r.data)])];
  }
  const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${type === "subscribers" ? "subscribers" : "submissions"}.csv"`, "cache-control": "no-store" },
  });
}
