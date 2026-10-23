import { cacheLife, cacheTag } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import offersSeed from "@/content/offers.json";
import newsSeed from "@/content/news.json";
import pricesSeed from "@/content/prices.json";
import type { Locale } from "@/lib/i18n/config";
import type { NewsItem, Offer, Prices } from "@/lib/content/types";

export type Announcement = { active: boolean; tone: "info" | "warning"; hu: string; en: string; href?: string };

const seedOffers = offersSeed as unknown as Offer[];
const seedNews = newsSeed as unknown as NewsItem[];
const seedPrices = pricesSeed as unknown as Prices;

/** All offers (including unpublished), DB first, bundled seed as fallback. */
export async function getAllOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("offers");
  if (!db) return seedOffers;
  try {
    const rows = await db.select().from(schema.offers).orderBy(asc(schema.offers.sort));
    if (!rows.length) return seedOffers;
    return rows.map((r) => ({
      id: r.id,
      sort: r.sort,
      published: r.published,
      categories: r.categories,
      image: r.image,
      heroImage: r.heroImage,
      validFrom: r.validFrom,
      validTo: r.validTo,
      priceFrom: r.priceFrom,
      minNights: r.minNights,
      hu: r.hu,
      en: r.en,
    }));
  } catch (e) {
    console.error("getAllOffers failed, using seed", e);
    return seedOffers;
  }
}

/** Published offers that have not expired yet, soonest first. */
export async function getActiveOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("offers");
  const today = new Date().toISOString().slice(0, 10);
  const all = await getAllOffers();
  // Dated events first (soonest first), then evergreen packages valid for months.
  const evergreen = (o: Offer) => !o.validFrom || !o.validTo || (Date.parse(o.validTo) - Date.parse(o.validFrom)) / 86400000 > 120;
  return all
    .filter((o) => o.published && (!o.validTo || o.validTo >= today))
    .sort((a, b) => Number(evergreen(a)) - Number(evergreen(b)) || (a.validFrom ?? "").localeCompare(b.validFrom ?? "") || a.sort - b.sort);
}

export async function getOfferBySlug(locale: Locale, slug: string): Promise<Offer | undefined> {
  const all = await getAllOffers();
  return all.find((o) => o[locale].slug === slug && o.published);
}

export async function getAllNews(): Promise<NewsItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  if (!db) return seedNews;
  try {
    const rows = await db.select().from(schema.news).orderBy(desc(schema.news.date));
    if (!rows.length) return seedNews;
    return rows.map((r) => ({
      id: r.id,
      category: r.category as NewsItem["category"],
      date: r.date,
      published: r.published,
      image: r.image,
      gallery: r.gallery,
      hu: r.hu as NewsItem["hu"],
      en: (r.en ?? undefined) as NewsItem["en"],
    }));
  } catch (e) {
    console.error("getAllNews failed, using seed", e);
    return seedNews;
  }
}

export async function getPublishedNews(): Promise<NewsItem[]> {
  return (await getAllNews()).filter((n) => n.published);
}

export async function getNewsBySlug(locale: Locale, slug: string): Promise<NewsItem | undefined> {
  const all = await getPublishedNews();
  return all.find((n) => (n[locale]?.slug ?? n.hu.slug) === slug);
}

async function getSetting<T>(key: string): Promise<T | null> {
  if (!db) return null;
  try {
    const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key)).limit(1);
    return (row?.value as T) ?? null;
  } catch (e) {
    console.error(`getSetting(${key}) failed`, e);
    return null;
  }
}

export async function getPrices(): Promise<Prices> {
  "use cache";
  cacheLife("hours");
  cacheTag("prices");
  return (await getSetting<Prices>("prices")) ?? seedPrices;
}

export async function getAnnouncement(): Promise<Announcement | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("announcement");
  const a = await getSetting<Announcement>("announcement");
  return a?.active ? a : null;
}

export { seedOffers, seedNews, seedPrices };
