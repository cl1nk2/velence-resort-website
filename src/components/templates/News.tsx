import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Languages } from "lucide-react";
import type { NewsItem } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { hrefOrFallback } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { getPublishedNews } from "@/lib/data";
import { newsHref, newsLocale } from "@/lib/hrefs";
import { formatDate } from "@/lib/i18n/format";
import { toGalleryImages } from "@/lib/gallery-props";
import { siteUrl } from "@/lib/site-url";
import { ogImageUrl } from "@/lib/images";
import { PageHero } from "@/components/ui/PageHero";
import { Blocks } from "@/components/blocks/Blocks";
import { Gallery } from "@/components/ui/Gallery";
import { Reveal } from "@/components/ui/Reveal";
import { NewsCard } from "@/components/news/NewsCard";
import { OfferFilter } from "@/components/offers/OfferFilter";
import { JsonLd } from "@/components/seo/JsonLd";
import type { TemplateProps } from "./PageTemplate";

export async function NewsTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const news = await getPublishedNews();
  const options = [
    { id: "all", label: t.common.allCategories, count: news.length },
    { id: "ele-village", label: "Ele-Falva blog", count: news.filter((n) => n.category === "ele-village").length },
    { id: "spa", label: "Spa", count: news.filter((n) => n.category === "spa").length },
  ];
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={news[0]?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-16">
        {locale === "en" && (
          <p className="mb-6 flex items-center gap-2 rounded-2xl bg-gold-400/15 p-4 text-sm font-semibold text-navy-800">
            <Languages className="size-5 shrink-0" aria-hidden="true" />
            Posts marked “HU” are currently available in Hungarian only.
          </p>
        )}
        <OfferFilter options={options} label={d.title}>
          {news.map((n) => (
            <li key={n.id} data-cats={n.category}>
              <NewsCard item={n} locale={locale} t={t} />
            </li>
          ))}
        </OfferFilter>
      </section>
    </>
  );
}

export async function NewsDetail({ item, locale, t }: { item: NewsItem; locale: Locale; t: Dictionary }) {
  const { data, translated } = newsLocale(item, locale);
  const all = await getPublishedNews();
  const idx = all.findIndex((n) => n.id === item.id);
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const related = all.filter((n) => n.id !== item.id && n.category === item.category).slice(0, 3);
  const gallery = toGalleryImages(item.gallery.map((src) => ({ src })), data.title);
  const og = ogImageUrl(item.image);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: data.title,
          description: data.excerpt,
          datePublished: item.date,
          inLanguage: translated ? locale : "hu",
          image: og ? `${siteUrl}${og}` : undefined,
          mainEntityOfPage: `${siteUrl}${newsHref(item, locale)}`,
          publisher: { "@id": `${siteUrl}/#organization` },
          author: { "@type": "Organization", name: item.category === "spa" ? "Velence Spa" : "Ele-Falva" },
        }}
      />
      <PageHero title={data.title} kicker={item.category === "spa" ? "Velence Spa" : "Ele-Falva blog"} image={item.image} crumbs={crumbsFor("news", locale, [{ label: data.title, href: newsHref(item, locale) }])}>
        <p className="mt-5 flex items-center gap-2 text-white/85">
          <CalendarDays className="size-5" aria-hidden="true" />
          <time dateTime={item.date}>{formatDate(item.date, locale)}</time>
        </p>
      </PageHero>
      <article className="container-page py-16" lang={translated ? locale : "hu"}>
        {!translated && (
          <p className="mx-auto mb-10 flex max-w-3xl items-center gap-2 rounded-2xl bg-gold-400/15 p-4 text-sm font-semibold text-navy-800" lang="en">
            <Languages className="size-5 shrink-0" aria-hidden="true" />
            This post is currently available in Hungarian only.
          </p>
        )}
        <Blocks blocks={data.blocks} t={t} locale={locale} title={data.title} />
        {gallery.length > 0 && (
          <Reveal className="mx-auto mt-14 max-w-5xl">
            <Gallery images={gallery} openLabel={t.common.photos} />
          </Reveal>
        )}
      </article>
      <nav className="container-page flex flex-wrap justify-between gap-4 pb-12" aria-label={t.a11y.breadcrumb}>
        {older ? (
          <Link href={newsHref(older, locale)} className="group inline-flex max-w-sm items-center gap-3 rounded-2xl bg-white p-4 font-bold text-navy-700 shadow-soft ring-1 ring-navy-100">
            <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>
              <span className="block text-xs uppercase tracking-wider text-navy-800/75">{t.a11y.previous}</span>
              {newsLocale(older, locale).data.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={newsHref(newer, locale)} className="group inline-flex max-w-sm items-center gap-3 rounded-2xl bg-white p-4 text-right font-bold text-navy-700 shadow-soft ring-1 ring-navy-100">
            <span>
              <span className="block text-xs uppercase tracking-wider text-navy-800/75">{t.a11y.next}</span>
              {newsLocale(newer, locale).data.title}
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        )}
      </nav>
      {related.length > 0 && (
        <section className="bg-sand-100 py-16" aria-labelledby="related-h">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 id="related-h" className="font-display text-3xl text-navy-700">
                {t.home.newsTitle}
              </h2>
              <Link href={hrefOrFallback("news", locale)} className="font-bold text-lake-600 hover:underline">
                {t.common.viewAll}
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((n) => (
                <li key={n.id}>
                  <NewsCard item={n} locale={locale} t={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
