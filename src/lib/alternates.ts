import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { albums, allPages, albumHref, pageHref } from "@/lib/content/pages";
import { getAllOffers, getPublishedNews } from "@/lib/data";
import { offerHref, newsHref } from "@/lib/hrefs";

/** Map of every known path in `locale` to its counterpart in the other language. */
export async function getAlternateMap(locale: Locale): Promise<Record<string, string>> {
  const other: Locale = locale === "hu" ? "en" : "hu";
  const map: Record<string, string> = {};
  for (const p of allPages()) {
    const a = pageHref(p.id, locale);
    if (!a) continue;
    // Pages without a translation fall back to the parent's translation, then home.
    let b = pageHref(p.id, other);
    let cur = p;
    while (!b && cur.parent) {
      const parent = allPages().find((x) => x.id === cur.parent);
      if (!parent) break;
      b = pageHref(parent.id, other);
      cur = parent;
    }
    map[a] = b ?? `/${other}`;
  }
  for (const al of albums) map[albumHref(al, locale)] = albumHref(al, other);
  for (const o of await getAllOffers()) map[offerHref(o, locale)] = offerHref(o, other);
  for (const n of await getPublishedNews()) map[newsHref(n, locale)] = newsHref(n, other);
  return map;
}
