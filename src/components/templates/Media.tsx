import Link from "next/link";
import { ArrowLeft, Images, PlayCircle } from "lucide-react";
import type { Album } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { albumHref, albums, hrefOrFallback, pageTitle, videos } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { toGalleryImages } from "@/lib/gallery-props";
import { PageHero } from "@/components/ui/PageHero";
import { Gallery } from "@/components/ui/Gallery";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/Reveal";
import { YouTube } from "@/components/ui/YouTube";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site-url";
import { ogImageUrl } from "@/lib/images";
import type { TemplateProps } from "./PageTemplate";

export function GalleryTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <PageHero title={d.title} kicker={t.gallery.albums} image={albums[0]?.cover} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-20">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a, i) => (
            <Reveal as="li" key={a.id} delay={(i % 3) * 80}>
              <Link href={albumHref(a, locale)} className="group relative isolate block aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft">
                <Img src={a.cover} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="-z-10 transition duration-[1.2s] ease-out-expo group-hover:scale-110" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />
                <span className="absolute inset-x-6 bottom-5 text-white">
                  <span className="block font-display text-2xl">{a[locale].title}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-white/80">
                    <Images className="size-4" aria-hidden="true" /> {a.images.length} {t.common.photos}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal as="li">
            <Link href={hrefOrFallback("videos", locale)} className="group relative isolate grid aspect-[4/3] place-items-center overflow-hidden rounded-[2rem] bg-navy-700 text-white shadow-soft">
              <Img src={videos[0]?.thumb} alt="" fill sizes="33vw" className="-z-10 opacity-40 transition duration-700 group-hover:scale-110" />
              <span className="text-center">
                <PlayCircle className="mx-auto size-14 text-lake-200 transition group-hover:scale-110" aria-hidden="true" />
                <span className="mt-2 block font-display text-2xl">{pageTitle("videos", locale)}</span>
              </span>
            </Link>
          </Reveal>
        </ul>
      </section>
    </>
  );
}

export function AlbumDetail({ album, locale, t }: { album: Album; locale: Locale; t: Dictionary }) {
  const title = album[locale].title;
  const images = toGalleryImages(album.images.map((src) => ({ src })), title);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: title,
          image: images.slice(0, 12).map((i) => `${siteUrl}${i.src}`),
          thumbnailUrl: ogImageUrl(album.cover) ? `${siteUrl}${ogImageUrl(album.cover)}` : undefined,
        }}
      />
      <PageHero title={title} kicker={t.gallery.title} image={album.cover} crumbs={crumbsFor("gallery", locale, [{ label: title, href: albumHref(album, locale) }])} />
      <section className="container-page py-16">
        <Link href={hrefOrFallback("gallery", locale)} className="mb-8 inline-flex items-center gap-2 font-bold text-navy-700 hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> {t.gallery.backToAlbums}
        </Link>
        <Gallery images={images} openLabel={t.common.photos} />
        <nav aria-label={t.gallery.albums} className="mt-16">
          <h2 className="font-display text-2xl text-navy-700">{t.gallery.albums}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {albums
              .filter((a) => a.id !== album.id)
              .map((a) => (
                <li key={a.id}>
                  <Link href={albumHref(a, locale)} className="inline-block rounded-full bg-lake-50 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-lake-100">
                    {a[locale].title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </section>
    </>
  );
}

export function VideosTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <JsonLd
        data={videos.map((v) => ({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: v[locale],
          thumbnailUrl: `${siteUrl}${v.thumb}`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
          uploadDate: "2024-01-01",
        }))}
      />
      <PageHero title={d.title} kicker={t.gallery.title} image={albums[1]?.cover} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-20">
        <p className="mb-8 max-w-2xl text-sm text-navy-800/70">{t.gallery.loadVideo}</p>
        <ul className="grid gap-8 md:grid-cols-2">
          {videos.map((v, i) => (
            <Reveal as="li" key={v.id} delay={(i % 2) * 100}>
              <YouTube id={v.id} title={v[locale]} thumb={v.thumb} playLabel={t.a11y.playVideo} consentText={t.consent.mediaBlocked} enableLabel={t.consent.enableMedia} />
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
