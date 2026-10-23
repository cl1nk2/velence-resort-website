import type { Locale } from "@/lib/i18n/config";
import type { NewsItem, Offer } from "@/lib/content/types";
import { hrefOrFallback } from "@/lib/content/pages";

export function offerHref(o: Offer, locale: Locale) {
  return `${hrefOrFallback("offers", locale)}/${o[locale].slug}`;
}

export function newsHref(n: NewsItem, locale: Locale) {
  return `${hrefOrFallback("news", locale)}/${n[locale]?.slug ?? n.hu.slug}`;
}

/** News content in the requested language, falling back to Hungarian. */
export function newsLocale(n: NewsItem, locale: Locale) {
  return { data: n[locale] ?? n.hu, translated: !!n[locale] || locale === "hu" };
}
