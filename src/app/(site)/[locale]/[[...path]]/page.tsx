import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { getDictionarySync } from "@/lib/i18n";
import { isLocale, ogLocales, type Locale } from "@/lib/i18n/config";
import { allPaths, alternatesFor, resolvePath, type Resolved } from "@/lib/resolve";
import { ogImageUrl } from "@/lib/images";
import { newsLocale } from "@/lib/hrefs";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { OfferDetail } from "@/components/templates/Offers";
import { NewsDetail } from "@/components/templates/News";
import { AlbumDetail } from "@/components/templates/Media";

export async function generateStaticParams() {
  const l = await localeParam();
  if (!isLocale(l)) return [];
  return (await allPaths(l)).map((path) => ({ path }));
}

async function load(params: PageProps<"/[locale]/[[...path]]">["params"]) {
  const { locale, path } = await params;
  if (!isLocale(locale)) notFound();
  const r = await resolvePath(locale, path);
  if (!r) notFound();
  return { locale, r };
}

function describe(r: Resolved, locale: Locale) {
  const t = getDictionarySync(locale);
  switch (r.kind) {
    case "page": {
      const d = r.page[locale]!;
      const isHome = r.page.template === "home";
      return {
        title: isHome ? t.meta.defaultTitle : d.metaTitle || d.title,
        description: (isHome ? t.meta.defaultDescription : d.description) ?? t.meta.defaultDescription,
        image: r.page.image ?? r.page.cardImage,
        absoluteTitle: isHome,
      };
    }
    case "offer":
      return { title: r.offer[locale].title, description: r.offer[locale].summary, image: r.offer.heroImage ?? r.offer.image };
    case "news": {
      const { data } = newsLocale(r.item, locale);
      return { title: data.title, description: data.excerpt, image: r.item.image };
    }
    case "album":
      return { title: `${r.album[locale].title} – ${t.gallery.title}`, description: `${r.album[locale].title} · ${r.album.images.length} ${t.common.photos}`, image: r.album.cover };
  }
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[[...path]]">): Promise<Metadata> {
  const { locale, r } = await load(params);
  const d = describe(r, locale);
  const alt = alternatesFor(r);
  const og = ogImageUrl(d.image);
  return {
    title: "absoluteTitle" in d && d.absoluteTitle ? { absolute: d.title } : d.title,
    description: d.description?.slice(0, 300),
    alternates: {
      canonical: alt[locale],
      languages: { ...(alt.hu ? { hu: alt.hu } : {}), ...(alt.en ? { en: alt.en } : {}), ...(alt.hu ? { "x-default": alt.hu } : {}) },
    },
    openGraph: {
      title: d.title,
      description: d.description?.slice(0, 300),
      url: alt[locale],
      locale: ogLocales[locale],
      type: r.kind === "news" ? "article" : "website",
      images: og ? [{ url: og }] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps<"/[locale]/[[...path]]">) {
  const { locale, r } = await load(params);
  const t = getDictionarySync(locale);
  switch (r.kind) {
    case "page":
      return <PageTemplate page={r.page} locale={locale} t={t} />;
    case "offer":
      return <OfferDetail offer={r.offer} locale={locale} t={t} />;
    case "news":
      return <NewsDetail item={r.item} locale={locale} t={t} />;
    case "album":
      return <AlbumDetail album={r.album} locale={locale} t={t} />;
  }
}
