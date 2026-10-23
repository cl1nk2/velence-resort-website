export const locales = ["hu", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "hu";

export const localeNames: Record<Locale, string> = { hu: "Magyar", en: "English" };
export const ogLocales: Record<Locale, string> = { hu: "hu_HU", en: "en_GB" };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
