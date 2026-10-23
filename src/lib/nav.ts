import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n";
import { getPage, hrefOrFallback, pageHref, pageTitle } from "@/lib/content/pages";

export type NavLink = { label: string; href: string; description?: string; external?: boolean };
export type NavGroup = { id: string; label: string; href?: string; image?: string | null; intro?: string; links: NavLink[] };

const GROUPS: { id: string; labelKey: "hotel" | "spa" | "gastro" | "offers" | "experiences" | "info"; landing?: string; ids: string[] }[] = [
  { id: "hotel", labelKey: "hotel", landing: "hotel", ids: ["hotel-intro", "rooms", "family", "kids", "ele-village", "animation", "events", "loyalty", "reviews"] },
  { id: "spa", labelKey: "spa", landing: "spa", ids: ["pools", "saunas", "treatments", "massages", "lakeside", "prices", "sauna-ritual"] },
  { id: "gastro", labelKey: "gastro", landing: "gastro", ids: ["restaurants", "half-board", "kids-menu"] },
  { id: "offers", labelKey: "offers", landing: "offers", ids: [] },
  { id: "experiences", labelKey: "experiences", ids: ["sights", "news", "gallery", "videos", "playgrounds", "play-island"] },
  { id: "info", labelKey: "info", ids: ["contact", "faq", "guest-info", "newsletter", "careers", "downloads"] },
];

function link(id: string, locale: Locale): NavLink | null {
  const href = pageHref(id, locale) ?? (locale === "en" ? null : hrefOrFallback(id, locale));
  if (!href) return null;
  const p = getPage(id);
  return { label: pageTitle(id, locale), href, description: p?.[locale]?.subtitle ?? undefined };
}

export function getMainNav(locale: Locale): NavGroup[] {
  const t = getDictionarySync(locale);
  return GROUPS.map((g) => {
    const landing = g.landing ? getPage(g.landing) : undefined;
    return {
      id: g.id,
      label: t.nav[g.labelKey],
      href: g.landing ? (pageHref(g.landing, locale) ?? undefined) : undefined,
      image: landing?.image ?? (g.ids[0] ? getPage(g.ids[0])?.image : null),
      intro: landing?.[locale]?.subtitle ?? undefined,
      links: g.ids.map((id) => link(id, locale)).filter((l): l is NavLink => !!l),
    };
  });
}

export function getFooterNav(locale: Locale) {
  const ids = ["hotel", "rooms", "spa", "prices", "offers", "gastro", "events", "sights", "gallery", "faq", "contact", "careers"];
  const legal = ["imprint", "privacy", "terms", "downloads", "grants"];
  return {
    main: ids.map((id) => link(id, locale)).filter((l): l is NavLink => !!l),
    legal: legal.map((id) => link(id, locale)).filter((l): l is NavLink => !!l),
  };
}
