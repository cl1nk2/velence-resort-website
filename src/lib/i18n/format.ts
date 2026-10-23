import type { Locale } from "./config";

/** Replace `{name}` placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

const intlLocale: Record<Locale, string> = { hu: "hu-HU", en: "en-GB" };

export function formatDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }) {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "Europe/Budapest", ...opts }).format(new Date(iso));
}

export function formatDateRange(from: string, to: string, locale: Locale) {
  const f = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "Europe/Budapest", year: "numeric", month: "short", day: "numeric" });
  return f.formatRange(new Date(from), new Date(to));
}

export function formatPrice(huf: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(huf);
}

export function formatNumber(n: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale]).format(n);
}
