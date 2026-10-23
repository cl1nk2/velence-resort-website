import { CalendarDays, Languages } from "lucide-react";
import { Card, Chip } from "@/components/ui/Card";
import type { NewsItem } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { formatDate } from "@/lib/i18n/format";
import { newsHref, newsLocale } from "@/lib/hrefs";

export function NewsCard({ item, locale, t }: { item: NewsItem; locale: Locale; t: Dictionary }) {
  const { data, translated } = newsLocale(item, locale);
  return (
    <Card
      href={newsHref(item, locale)}
      image={item.image ?? item.gallery[0]}
      title={data.title}
      text={data.excerpt}
      cta={t.common.readMore}
      badge={
        <>
          <Chip tone="white">{item.category === "spa" ? "Spa" : "Ele-Falva"}</Chip>
          {!translated && (
            <Chip tone="gold">
              <Languages className="size-3" aria-hidden="true" /> HU
            </Chip>
          )}
        </>
      }
      meta={
        <span className="inline-flex items-center gap-1.5 font-semibold text-navy-800/75">
          <CalendarDays className="size-4" aria-hidden="true" />
          <time dateTime={item.date}>{formatDate(item.date, locale)}</time>
        </span>
      }
    />
  );
}
