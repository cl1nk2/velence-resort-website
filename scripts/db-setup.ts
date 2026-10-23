// Creates tables (idempotent) and seeds editable content when the DB is empty.
// Runs before `next build`; does nothing when no DATABASE_URL is configured.
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import offers from "../src/content/offers.json";
import news from "../src/content/news.json";
import prices from "../src/content/prices.json";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const DDL = [
  `create table if not exists offers (
    id text primary key, sort integer not null default 0, published boolean not null default true,
    categories jsonb not null default '[]', image text, hero_image text, valid_from date, valid_to date,
    price_from integer, min_nights integer, hu jsonb not null, en jsonb not null,
    updated_at timestamptz not null default now())`,
  `create table if not exists news (
    id text primary key, category text not null default 'resort', date date not null,
    published boolean not null default true, image text, gallery jsonb not null default '[]',
    hu jsonb not null, en jsonb, updated_at timestamptz not null default now())`,
  `create index if not exists news_date_idx on news (date)`,
  `create table if not exists settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now())`,
  `create table if not exists submissions (
    id serial primary key, kind text not null, locale text not null, data jsonb not null,
    status text not null default 'new', created_at timestamptz not null default now())`,
  `create index if not exists submissions_created_idx on submissions (created_at)`,
  `create table if not exists subscribers (
    id serial primary key, email text not null, name text, locale text not null, created_at timestamptz not null default now())`,
  `create unique index if not exists subscribers_email_idx on subscribers (email)`,
  `create table if not exists rate_limits (key text primary key, count integer not null default 0, window_start timestamptz not null default now())`,
];

async function main() {
  if (!url) {
    console.log("[db-setup] no DATABASE_URL – skipping (site uses bundled content)");
    return;
  }
  const pool = /neon\.tech|neon\.build/.test(url) ? null : new Pool({ connectionString: url });
  const db = pool ? drizzlePg(pool, { schema }) : drizzleNeon(neon(url), { schema });
  for (const stmt of DDL) await db.execute(sql.raw(stmt));
  const [{ n: offerCount }] = (await db.execute(sql`select count(*)::int as n from offers`)).rows as { n: number }[];
  if (offerCount === 0) {
    for (const o of offers as any[]) {
      await db.insert(schema.offers).values({
        id: o.id, sort: o.sort, published: o.published, categories: o.categories, image: o.image, heroImage: o.heroImage,
        validFrom: o.validFrom, validTo: o.validTo, priceFrom: o.priceFrom, minNights: o.minNights, hu: o.hu, en: o.en,
      });
    }
    console.log(`[db-setup] seeded ${offers.length} offers`);
  }
  const [{ n: newsCount }] = (await db.execute(sql`select count(*)::int as n from news`)).rows as { n: number }[];
  if (newsCount === 0) {
    for (const n of news as any[]) {
      await db.insert(schema.news).values({ id: n.id, category: n.category, date: n.date, published: n.published, image: n.image, gallery: n.gallery, hu: n.hu, en: n.en ?? null });
    }
    console.log(`[db-setup] seeded ${news.length} news items`);
  }
  await db.insert(schema.settings).values({ key: "prices", value: prices }).onConflictDoNothing();
  // Clean up expired rate-limit windows.
  await db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`);
  await pool?.end();
  console.log("[db-setup] done");
}

main().catch((e) => {
  // Never fail the build because of the database; the site falls back to bundled content.
  console.error("[db-setup] failed:", e instanceof Error ? e.message : e);
});
