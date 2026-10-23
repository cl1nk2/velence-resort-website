import type { Locale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n";
import { hrefOrFallback, pageTitle, trail } from "@/lib/content/pages";
import type { Crumb } from "@/components/ui/Breadcrumbs";

export function crumbsFor(id: string, locale: Locale, extra: Crumb[] = []): Crumb[] {
  const t = getDictionarySync(locale);
  const out: Crumb[] = [{ label: t.nav.home, href: `/${locale}` }];
  for (const p of trail(id)) {
    if (p.template === "home") continue;
    out.push({ label: pageTitle(p.id, locale), href: hrefOrFallback(p.id, locale) });
  }
  return [...out, ...extra];
}
