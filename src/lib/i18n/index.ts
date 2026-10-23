import { locale as localeParam } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import hu from "./dictionaries/hu";
import en from "./dictionaries/en";
import type { Dictionary } from "./dictionaries/hu";

const dictionaries: Record<Locale, Dictionary> = { hu, en };

/** Current locale from the `[locale]` root segment. Server-only. */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!isLocale(value)) notFound();
  return value;
}

export function getDictionarySync(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export type { Dictionary, Locale };
