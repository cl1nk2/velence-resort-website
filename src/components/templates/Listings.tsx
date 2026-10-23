import Link from "next/link";
import { ArrowRight, Building2, Clock3, Maximize2, Ruler, Thermometer, Users } from "lucide-react";
import type { Block, Facts, Page } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import { childrenOf, getPage, hrefOrFallback, pageTitle } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { toGalleryImages } from "@/lib/gallery-props";
import { PageHero } from "@/components/ui/PageHero";
import { Blocks } from "@/components/blocks/Blocks";
import { Card, Chip } from "@/components/ui/Card";
import { Gallery } from "@/components/ui/Gallery";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/Reveal";
import { OpenBookingButton } from "@/components/booking/OpenBookingButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site-url";
import { ogImageUrl } from "@/lib/images";
import { BookingBand, ChildGrid, type TemplateProps } from "./PageTemplate";

const FACT_LABELS = {
  hu: { size: "Alapterület", people: "Férőhely", building: "Elhelyezkedés", temp: "Hőmérséklet", depth: "Mélység", duration: "Időtartam" },
  en: { size: "Size", people: "Sleeps", building: "Location", temp: "Temperature", depth: "Depth", duration: "Duration" },
};
const FACT_ICONS = { size: Maximize2, people: Users, building: Building2, temp: Thermometer, depth: Ruler, duration: Clock3 };

export function FacilityFacts({ facts, locale, large }: { facts?: Facts; locale: Locale; large?: boolean }) {
  if (!facts) return null;
  const entries = (Object.keys(FACT_ICONS) as (keyof Facts)[]).filter((k) => facts[k]);
  if (!entries.length) return null;
  if (!large)
    return (
      <>
        {entries.map((k) => {
          const I = FACT_ICONS[k];
          return (
            <Chip key={k}>
              <I className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{FACT_LABELS[locale][k]}:</span> {facts[k]}
            </Chip>
          );
        })}
      </>
    );
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {entries.map((k) => {
        const I = FACT_ICONS[k];
        return (
          <div key={k} className="relative rounded-2xl bg-white/10 py-4 pl-14 pr-4 ring-1 ring-white/20 backdrop-blur">
            <dt className="text-xs font-extrabold uppercase tracking-wider text-white/75">
              <I className="absolute left-4 top-1/2 size-7 -translate-y-1/2 text-lake-200" aria-hidden="true" />
              {FACT_LABELS[locale][k]}
            </dt>
            <dd className="font-display text-lg text-white">{facts[k]}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function SiblingNav({ page, locale, label }: { page: Page; locale: Locale; label: string }) {
  if (!page.parent) return null;
  const sib = childrenOf(page.parent).filter((p) => p.id !== page.id && (p[locale] || p.hu));
  if (!sib.length) return null;
  return (
    <section className="bg-sand-100 py-16" aria-label={label}>
      <div className="container-page">
        <h2 className="font-display text-3xl text-navy-700">{label}</h2>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
          {sib.map((s) => {
            const d = s[locale] ?? s.hu!;
            return (
              <li key={s.id} className="w-64 shrink-0 snap-start">
                <Link href={hrefOrFallback(s.id, locale)} className="group block overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Img src={s.cardImage ?? s.image} alt="" fill sizes="256px" className="transition duration-700 group-hover:scale-110" />
                  </span>
                  <span className="flex items-center justify-between gap-2 p-4 font-bold text-navy-700">
                    {d.title}
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function RoomsTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const rooms = childrenOf(page.id);
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} intro={d.blocks[0]?.type === "html" ? <span dangerouslySetInnerHTML={{ __html: d.blocks[0].html.replace(/<\/?p>/g, "") }} /> : null} image={rooms[0]?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-20">
        <ul className="grid gap-8 md:grid-cols-2">
          {rooms.map((r, i) => {
            const rd = r[locale] ?? r.hu!;
            return (
              <Reveal as="li" key={r.id} delay={(i % 2) * 120}>
                <Card
                  href={hrefOrFallback(r.id, locale)}
                  image={r.cardImage ?? r.image}
                  title={rd.title}
                  text={rd.excerpt ?? rd.description}
                  aspect="aspect-[16/10]"
                  cta={t.common.readMore}
                  headingLevel={2}
                  meta={<FacilityFacts facts={rd.facts} locale={locale} />}
                />
              </Reveal>
            );
          })}
        </ul>
      </section>
      <section className="container-page pb-8" aria-labelledby="compare-h">
        <h2 id="compare-h" className="font-display text-3xl text-navy-700">
          {t.rooms.compare}
        </h2>
        <div className="table-wrap mt-6">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{t.rooms.compare}</caption>
            <thead className="bg-lake-50 text-navy-700">
              <tr>
                <th scope="col" className="p-4">
                  {t.rooms.title}
                </th>
                <th scope="col" className="p-4">
                  {t.rooms.size}
                </th>
                <th scope="col" className="p-4">
                  {t.rooms.capacity}
                </th>
                <th scope="col" className="p-4">
                  {FACT_LABELS[locale].building}
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
                const rd = r[locale] ?? r.hu!;
                return (
                  <tr key={r.id} className="border-t border-navy-100">
                    <th scope="row" className="p-4 font-bold">
                      <Link href={hrefOrFallback(r.id, locale)} className="text-navy-700 underline decoration-lake-300 underline-offset-4 hover:decoration-navy-600">
                        {rd.title}
                      </Link>
                    </th>
                    <td className="p-4">{rd.facts?.size}</td>
                    <td className="p-4">{rd.facts?.people}</td>
                    <td className="p-4">{rd.facts?.building}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

/** Drops a leading paragraph that just repeats the hero intro. */
function withoutLead(blocks: Block[], lead?: string | null): Block[] {
  if (!lead || blocks[0]?.type !== "html") return blocks;
  const norm = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const first = blocks[0].html.match(/^<p>([\s\S]*?)<\/p>/);
  if (!first || norm(first[1]) !== norm(lead)) return blocks;
  const rest = blocks[0].html.slice(first[0].length).trim();
  return rest ? [{ type: "html", html: rest }, ...blocks.slice(1)] : blocks.slice(1);
}

export function RoomTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const gallery = toGalleryImages((page.gallery ?? []).map((src) => ({ src })), d.title);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HotelRoom",
          name: d.title,
          description: d.description,
          image: ogImageUrl(page.image) ? `${siteUrl}${ogImageUrl(page.image)}` : undefined,
          floorSize: d.facts?.size ? { "@type": "QuantitativeValue", value: d.facts.size.replace(/[^\d\-x ]/g, "").trim(), unitCode: "MTK" } : undefined,
          containedInPlace: { "@id": `${siteUrl}/#resort` },
        }}
      />
      <PageHero title={d.title} kicker={t.rooms.title} intro={d.excerpt ?? undefined} image={page.image} crumbs={crumbsFor(page.id, locale)}>
        <div className="mt-8 flex flex-wrap items-end gap-6">
          <div className="flex-1">
            <FacilityFacts facts={d.facts} locale={locale} large />
          </div>
          <OpenBookingButton className="inline-flex items-center gap-2 rounded-full bg-spa-500 px-7 py-4 font-extrabold text-white shadow-lift hover:bg-spa-600">{t.rooms.book}</OpenBookingButton>
        </div>
      </PageHero>
      <div className="container-page grid gap-14 py-20 lg:grid-cols-[1fr_22rem]">
        <div>
          <Blocks blocks={withoutLead(d.blocks, d.excerpt)} t={t} locale={locale} title={d.title} />
          {gallery.length > 0 && (
            <div className="mt-14">
              <Gallery images={gallery} layout="grid" openLabel={t.common.photos} />
            </div>
          )}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
            <h2 className="font-display text-xl text-navy-700">{t.booking.title}</h2>
            <p className="mt-2 text-sm text-navy-800/70">{t.booking.bestPrice}</p>
            <OpenBookingButton className="mt-5 w-full rounded-full bg-spa-500 px-6 py-3.5 font-extrabold text-white hover:bg-spa-600">{t.rooms.book}</OpenBookingButton>
            <Link href={hrefOrFallback("offers", locale)} className="mt-3 block rounded-full border-2 border-navy-100 px-6 py-3 text-center font-bold text-navy-700 hover:border-navy-600">
              {t.nav.offers}
            </Link>
          </div>
        </aside>
      </div>
      <SiblingNav page={page} locale={locale} label={t.rooms.otherRooms} />
    </>
  );
}

export function FacilitiesTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const items = childrenOf(page.id).filter((c) => c.template === "facility");
  const extra = childrenOf(page.id).filter((c) => c.template !== "facility");
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={page.id === "saunas" ? (items[0]?.cardImage ?? items[0]?.image) : page.image} crumbs={crumbsFor(page.id, locale)} tone="spa" />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks.filter((b) => b.type === "html").slice(0, 1)} t={t} locale={locale} title={d.title} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => {
            const fd = f[locale] ?? f.hu!;
            return (
              <Reveal as="li" key={f.id} delay={(i % 3) * 80}>
                <Card href={hrefOrFallback(f.id, locale)} image={f.cardImage ?? f.image} title={fd.title} text={fd.excerpt} cta={t.common.readMore} headingLevel={2} meta={<FacilityFacts facts={fd.facts} locale={locale} />} />
              </Reveal>
            );
          })}
        </ul>
        <div className="mt-16">
          <Blocks blocks={d.blocks.filter((b, i) => !(b.type === "html" && i === d.blocks.findIndex((x) => x.type === "html")))} t={t} locale={locale} title={d.title} />
        </div>
      </div>
      {extra.length > 0 && <ChildGrid pages={extra} locale={locale} t={t} title={t.common.discover} />}
      <BookingBand t={t} section="spa" />
    </>
  );
}

export function FacilityTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const gallery = toGalleryImages((page.gallery ?? []).map((src) => ({ src })), d.title);
  const parent = page.parent ? getPage(page.parent) : undefined;
  return (
    <>
      <PageHero title={d.title} kicker={parent ? pageTitle(parent.id, locale) : null} image={page.cardImage ?? page.image} crumbs={crumbsFor(page.id, locale)} tone="spa">
        <div className="mt-8 max-w-3xl">
          <FacilityFacts facts={d.facts} locale={locale} large />
        </div>
      </PageHero>
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
        {gallery.length > 0 && (
          <div className="mx-auto mt-14 max-w-5xl">
            <Gallery images={gallery} layout="grid" openLabel={t.common.photos} />
          </div>
        )}
      </div>
      <SiblingNav page={page} locale={locale} label={parent ? pageTitle(parent.id, locale) : t.common.discover} />
      <BookingBand t={t} section="spa" />
    </>
  );
}

export function SightsTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const sights = childrenOf(page.id).filter((s) => s[locale]);
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={sights[0]?.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sights.map((s, i) => {
            const sd = s[locale]!;
            return (
              <Reveal as="li" key={s.id} delay={(i % 3) * 80}>
                <Card href={hrefOrFallback(s.id, locale)} image={s.cardImage ?? s.image} title={sd.title} text={sd.excerpt} cta={t.common.readMore} headingLevel={2} aspect="aspect-square" />
              </Reveal>
            );
          })}
        </ul>
      </div>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

export function SightTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const gallery = toGalleryImages((page.gallery ?? []).map((src) => ({ src })), d.title);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "TouristAttraction", name: d.title, description: d.excerpt ?? d.description, isAccessibleForFree: undefined, containedInPlace: { "@type": "Place", name: "Velencei-tó / Lake Velence" } }} />
      <PageHero title={d.title} kicker={pageTitle("sights", locale)} image={page.cardImage ?? page.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
        {gallery.length > 0 && (
          <div className="mx-auto mt-14 max-w-5xl">
            <Gallery images={gallery} layout="grid" openLabel={t.common.photos} />
          </div>
        )}
      </div>
      <SiblingNav page={page} locale={locale} label={pageTitle("sights", locale)} />
    </>
  );
}

export function HelpersTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale] ?? page.hu!;
  const people = childrenOf(page.id);
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={getPage("ele-village")?.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
        <ul className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {people.map((p, i) => {
            const pd = p.hu!;
            return (
              <Reveal as="li" key={p.id} delay={(i % 4) * 70}>
                <Link href={hrefOrFallback(p.id, locale)} className="group block text-center">
                  <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-full ring-4 ring-white shadow-soft transition group-hover:ring-lake-300">
                    <Img src={p.cardImage ?? p.image} alt="" fill sizes="240px" className="transition duration-700 group-hover:scale-110" />
                  </span>
                  <span className="mt-4 block font-display text-lg text-navy-700">{pd.title}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export function PersonTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale] ?? page.hu!;
  return (
    <>
      <PageHero title={d.title} kicker={pageTitle("helpers", locale)} image={getPage("ele-village")?.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page grid gap-12 py-20 lg:grid-cols-[18rem_1fr]">
        <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-full shadow-lift ring-8 ring-white lg:w-full">
          <Img src={page.cardImage ?? page.image} alt={d.title} fill sizes="288px" />
        </div>
        <Blocks blocks={d.blocks.map((b) => (b.type === "gallery" ? { ...b, items: b.items.slice(0, 6) } : b))} t={t} locale={locale} title={d.title} />
      </div>
      <SiblingNav page={page} locale={locale} label={pageTitle("helpers", locale)} />
    </>
  );
}
