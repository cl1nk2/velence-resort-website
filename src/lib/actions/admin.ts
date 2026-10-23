"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { createSession, destroySession, passwordMatches, requireAdmin } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { textToHtml } from "@/lib/sanitize";
import type { Prices } from "@/lib/content/types";

export type AdminState = { ok?: boolean; error?: string };

export async function login(_: AdminState, form: FormData): Promise<AdminState> {
  const rl = await rateLimit(await clientKey("admin-login"), 5, 15 * 60);
  if (!rl.ok) return { error: "Too many attempts. Try again in 15 minutes." };
  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) return { error: "Wrong password." };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function needDb() {
  if (!db) throw new Error("No database configured. Connect Neon to enable editing.");
  return db;
}

const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");
const lines = (s: FormDataEntryValue | null) =>
  String(s ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const optDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .or(z.literal(""))
  .transform((v) => v || null);
const optInt = z
  .string()
  .regex(/^\d*$/)
  .transform((v) => (v ? Number(v) : null));

const OfferForm = z.object({
  id: slug,
  sort: z.coerce.number().int().min(0).max(9999),
  image: z.string().trim().max(500),
  heroImage: z.string().trim().max(500),
  validFrom: optDate,
  validTo: optDate,
  priceFrom: optInt,
  minNights: optInt,
  huSlug: slug,
  huTitle: z.string().trim().min(2).max(200),
  huSummary: z.string().trim().max(1000),
  enSlug: slug,
  enTitle: z.string().trim().min(2).max(200),
  enSummary: z.string().trim().max(1000),
});

export async function saveOffer(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = OfferForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; ") };
  const d = parsed.data;
  try {
    const values = {
      id: d.id,
      sort: d.sort,
      published: form.get("published") === "on",
      categories: form.getAll("categories").map(String).filter((c) => ["ele", "season", "family"].includes(c)),
      image: d.image || null,
      heroImage: d.heroImage || null,
      validFrom: d.validFrom,
      validTo: d.validTo,
      priceFrom: d.priceFrom,
      minNights: d.minNights,
      hu: { slug: d.huSlug, title: d.huTitle, summary: d.huSummary, highlights: lines(form.get("huHighlights")) },
      en: { slug: d.enSlug, title: d.enTitle, summary: d.enSummary, highlights: lines(form.get("enHighlights")) },
      updatedAt: new Date(),
    };
    await needDb()
      .insert(schema.offers)
      .values(values)
      .onConflictDoUpdate({ target: schema.offers.id, set: values });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
  updateTag("offers");
  redirect("/admin/offers?saved=1");
}

export async function toggleOffer(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const published = form.get("published") === "true";
  await needDb().update(schema.offers).set({ published: !published, updatedAt: new Date() }).where(eq(schema.offers.id, id));
  updateTag("offers");
}

export async function deleteOffer(form: FormData) {
  await requireAdmin();
  await needDb().delete(schema.offers).where(eq(schema.offers.id, String(form.get("id"))));
  updateTag("offers");
  redirect("/admin/offers");
}

const NewsForm = z.object({
  id: slug,
  category: z.enum(["spa", "ele-village", "resort"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  image: z.string().trim().max(500),
  huTitle: z.string().trim().min(2).max(200),
  huExcerpt: z.string().trim().max(600),
  huBody: z.string().max(50000),
  enTitle: z.string().trim().max(200),
  enExcerpt: z.string().trim().max(600),
  enBody: z.string().max(50000),
});

export async function saveNews(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = NewsForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; ") };
  const d = parsed.data;
  const existing = form.get("existingGallery") ? (JSON.parse(String(form.get("existingGallery"))) as string[]) : [];
  try {
    const hu = { slug: d.id, title: d.huTitle, excerpt: d.huExcerpt, blocks: [{ type: "html", html: textToHtml(d.huBody) }] };
    const en = d.enTitle ? { slug: d.id, title: d.enTitle, excerpt: d.enExcerpt, blocks: [{ type: "html", html: textToHtml(d.enBody) }] } : null;
    const values = { id: d.id, category: d.category, date: d.date, published: form.get("published") === "on", image: d.image || null, gallery: existing, hu, en, updatedAt: new Date() };
    await needDb().insert(schema.news).values(values).onConflictDoUpdate({ target: schema.news.id, set: values });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
  updateTag("news");
  redirect("/admin/news?saved=1");
}

export async function toggleNews(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const published = form.get("published") === "true";
  await needDb().update(schema.news).set({ published: !published, updatedAt: new Date() }).where(eq(schema.news.id, id));
  updateTag("news");
}

export async function deleteNews(form: FormData) {
  await requireAdmin();
  await needDb().delete(schema.news).where(eq(schema.news.id, String(form.get("id"))));
  updateTag("news");
  redirect("/admin/news");
}

export async function savePrices(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = String(form.get("current") ?? "");
  let prices: Prices;
  try {
    prices = JSON.parse(raw) as Prices;
  } catch {
    return { error: "Invalid data" };
  }
  prices.validFrom = String(form.get("validFrom") || prices.validFrom);
  for (const l of ["hu", "en"] as const) {
    prices.hours[l].spa = String(form.get(`hours_${l}_spa`) ?? prices.hours[l].spa).slice(0, 120);
    prices.hours[l].cashier = String(form.get(`hours_${l}_cashier`) ?? prices.hours[l].cashier).slice(0, 120);
    prices.notes[l] = lines(form.get(`notes_${l}`)).map((n) => n.slice(0, 600));
  }
  prices.tables.forEach((tbl, ti) =>
    tbl.rows.forEach((row, ri) =>
      row.prices.forEach((_, pi) => {
        const v = String(form.get(`p_${ti}_${ri}_${pi}`) ?? "").trim();
        row.prices[pi] = v === "" || v === "-" ? null : Math.max(0, Math.min(1_000_000, Number(v.replace(/\D/g, "")) || 0));
      }),
    ),
  );
  try {
    await needDb()
      .insert(schema.settings)
      .values({ key: "prices", value: prices })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: prices, updatedAt: new Date() } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
  updateTag("prices");
  return { ok: true };
}

export async function saveAnnouncement(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const value = {
    active: form.get("active") === "on",
    tone: form.get("tone") === "warning" ? "warning" : "info",
    hu: String(form.get("hu") ?? "").slice(0, 300),
    en: String(form.get("en") ?? "").slice(0, 300),
    href: String(form.get("href") ?? "").trim().startsWith("/") ? String(form.get("href")).trim().slice(0, 300) : undefined,
  };
  try {
    await needDb()
      .insert(schema.settings)
      .values({ key: "announcement", value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
  updateTag("announcement");
  return { ok: true };
}

export async function setSubmissionStatus(form: FormData) {
  await requireAdmin();
  const status = String(form.get("status"));
  if (!["new", "done", "spam"].includes(status)) return;
  await needDb().update(schema.submissions).set({ status }).where(eq(schema.submissions.id, Number(form.get("id"))));
}
