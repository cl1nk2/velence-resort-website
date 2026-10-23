import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { albums, albumHref, allPages, findAlbum, findPageBySlug, hrefOrFallback, pageHref } from "@/lib/content/pages";
import type { Album, NewsItem, Offer, Page } from "@/lib/content/types";
import { getAllOffers, getOfferBySlug, getNewsBySlug, getPublishedNews } from "@/lib/data";
import { newsHref, offerHref } from "@/lib/hrefs";

export type Resolved =
  | { kind: "page"; page: Page }
  | { kind: "offer"; offer: Offer }
  | { kind: "news"; item: NewsItem }
  | { kind: "album"; album: Album };

export async function resolvePath(locale: Locale, path: string[] = []): Promise<Resolved | null> {
  if (path.length === 0) {
    const home = findPageBySlug(locale, "");
    return home ? { kind: "page", page: home } : null;
  }
  if (path.length === 1) {
    const p = findPageBySlug(locale, decodeURIComponent(path[0]));
    return p ? { kind: "page", page: p } : null;
  }
  if (path.length === 2) {
    const [parent, child] = path.map(decodeURIComponent);
    const parentPage = findPageBySlug(locale, parent);
    if (!parentPage) return null;
    if (parentPage.id === "offers") {
      const offer = await getOfferBySlug(locale, child);
      return offer ? { kind: "offer", offer } : null;
    }
    if (parentPage.id === "news") {
      const item = await getNewsBySlug(locale, child);
      return item ? { kind: "news", item } : null;
    }
    if (parentPage.id === "gallery") {
      const album = findAlbum(locale, child);
      return album ? { kind: "album", album } : null;
    }
  }
  return null;
}

/** Every prerenderable path for a locale, as catch-all segments. */
export async function allPaths(locale: Locale): Promise<string[][]> {
  const out: string[][] = [];
  for (const p of allPages()) {
    const d = p[locale];
    if (d) out.push(d.slug ? [d.slug] : []);
  }
  if (pageHref("offers", locale)) for (const o of await getAllOffers()) if (o.published) out.push(offerHref(o, locale).split("/").slice(2));
  if (pageHref("news", locale)) for (const n of await getPublishedNews()) out.push(newsHref(n, locale).split("/").slice(2));
  if (pageHref("gallery", locale)) for (const a of albums) out.push(albumHref(a, locale).split("/").slice(2));
  return out;
}

/** hreflang alternates for a resolved route. */
export function alternatesFor(r: Resolved): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of ["hu", "en"] as const) {
    if (r.kind === "page") {
      const h = pageHref(r.page.id, l);
      if (h) out[l] = h;
    } else if (r.kind === "offer") out[l] = offerHref(r.offer, l);
    else if (r.kind === "news") {
      if (l === "hu" || r.item.en) out[l] = newsHref(r.item, l);
    } else if (r.kind === "album") out[l] = albumHref(r.album, l);
  }
  return out;
}

export function sectionHome(locale: Locale, section: Page["section"]) {
  if (section === "hotel") return hrefOrFallback("hotel", locale);
  if (section === "spa") return hrefOrFallback("spa", locale);
  return `/${locale}`;
}
