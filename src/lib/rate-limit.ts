import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";

const memory = new Map<string, { count: number; start: number }>();

export async function clientKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // Hash so raw IP addresses are never stored.
  return `${scope}:${createHash("sha256").update(`${ip}|${process.env.RATE_LIMIT_SALT ?? "velence"}`).digest("hex").slice(0, 24)}`;
}

/**
 * Fixed-window limiter. Uses Postgres when available (shared across serverless instances),
 * otherwise falls back to per-instance memory.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; remaining: number }> {
  const now = Date.now();
  if (db) {
    try {
      const rows = await db
        .insert(schema.rateLimits)
        .values({ key, count: 1, windowStart: new Date(now) })
        .onConflictDoUpdate({
          target: schema.rateLimits.key,
          set: {
            count: sql`case when ${schema.rateLimits.windowStart} < now() - make_interval(secs => ${windowSec}) then 1 else ${schema.rateLimits.count} + 1 end`,
            windowStart: sql`case when ${schema.rateLimits.windowStart} < now() - make_interval(secs => ${windowSec}) then now() else ${schema.rateLimits.windowStart} end`,
          },
        })
        .returning({ count: schema.rateLimits.count });
      const count = rows[0]?.count ?? 1;
      return { ok: count <= limit, remaining: Math.max(0, limit - count) };
    } catch (e) {
      console.error("rateLimit db error, falling back to memory", e);
    }
  }
  const cur = memory.get(key);
  if (!cur || now - cur.start > windowSec * 1000) {
    memory.set(key, { count: 1, start: now });
    if (memory.size > 5000) memory.clear();
    return { ok: true, remaining: limit - 1 };
  }
  cur.count++;
  return { ok: cur.count <= limit, remaining: Math.max(0, limit - cur.count) };
}
