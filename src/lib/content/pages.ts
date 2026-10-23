import pagesJson from "@/content/pages.json";
import albumsJson from "@/content/gallery.json";
import videosJson from "@/content/videos.json";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import type { Album, Page, Video } from "./types";

const pages = pagesJson as unknown as Record<string, Page>;
export const albums = albumsJson as unknown as Album[];
export const videos = videosJson as unknown as Video[];

export function getPage(id: string): Page | undefined {
  return pages[id];
}

export function allPages(): Page[] {
  return Object.values(pages);
}

/** Localised URL of a static page, or null if it has no version in this locale. */
export function pageHref(id: string, locale: Locale): string | null {
  const p = pages[id]?.[locale];
  if (!p) return null;
  return p.slug ? `/${locale}/${p.slug}` : `/${locale}`;
}

/** Like pageHref, but falls back to the other locale's page (content shown in HU only). */
export function hrefOrFallback(id: string, locale: Locale): string {
  return pageHref(id, locale) ?? pageHref(id, locale === "hu" ? "en" : "hu") ?? `/${locale}`;
}

export function pageTitle(id: string, locale: Locale): string {
  const p = pages[id];
  return p?.[locale]?.title ?? p?.hu?.title ?? p?.en?.title ?? id;
}

const bySlug: Record<Locale, Map<string, Page>> = { hu: new Map(), en: new Map() };
for (const p of Object.values(pages)) {
  for (const l of locales) {
    const d = p[l];
    if (d) bySlug[l].set(d.slug, p);
  }
}

export function findPageBySlug(locale: Locale, slug: string): Page | undefined {
  return bySlug[locale].get(slug);
}

export function childrenOf(id: string): Page[] {
  return Object.values(pages)
    .filter((p) => p.parent === id)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/** Breadcrumb trail from the root to this page (excluding home). */
export function trail(id: string): Page[] {
  const out: Page[] = [];
  let cur: Page | undefined = pages[id];
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    out.unshift(cur);
    cur = cur.parent ? pages[cur.parent] : undefined;
  }
  return out;
}

export function albumHref(album: Album, locale: Locale) {
  return `${hrefOrFallback("gallery", locale)}/${album[locale].slug}`;
}

export function findAlbum(locale: Locale, slug: string) {
  return albums.find((a) => a[locale].slug === slug);
}
