import { CalendarDays, FileText } from "lucide-react";
import type { Page } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { childrenOf, hrefOrFallback, pageHref } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Blocks } from "@/components/blocks/Blocks";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { OpenBookingButton } from "@/components/booking/OpenBookingButton";
import { HomeTemplate } from "./HomeTemplate";
import { HotelTemplate, SpaTemplate } from "./Landing";
import { RoomsTemplate, RoomTemplate, FacilitiesTemplate, FacilityTemplate, SightsTemplate, SightTemplate, HelpersTemplate, PersonTemplate } from "./Listings";
import { FaqTemplate, ContactTemplate, NewsletterTemplate, EventsTemplate, LoyaltyTemplate, ReviewsTemplate, PricesTemplate, LegalTemplate } from "./Info";
import { GalleryTemplate, VideosTemplate } from "./Media";
import { OffersTemplate } from "./Offers";
import { NewsTemplate } from "./News";

export type TemplateProps = { page: Page; locale: Locale; t: Dictionary };

export function PageTemplate(props: TemplateProps) {
  switch (props.page.template) {
    case "home":
      return <HomeTemplate locale={props.locale} t={props.t} />;
    case "hotel":
      return <HotelTemplate {...props} />;
    case "spa":
      return <SpaTemplate {...props} />;
    case "rooms":
      return <RoomsTemplate {...props} />;
    case "room":
      return <RoomTemplate {...props} />;
    case "pools":
    case "saunas":
      return <FacilitiesTemplate {...props} />;
    case "facility":
      return <FacilityTemplate {...props} />;
    case "sights":
      return <SightsTemplate {...props} />;
    case "sight":
      return <SightTemplate {...props} />;
    case "helpers":
      return <HelpersTemplate {...props} />;
    case "person":
      return <PersonTemplate {...props} />;
    case "faq":
      return <FaqTemplate {...props} />;
    case "contact":
      return <ContactTemplate {...props} />;
    case "newsletter":
      return <NewsletterTemplate {...props} />;
    case "events":
      return <EventsTemplate {...props} />;
    case "loyalty":
      return <LoyaltyTemplate {...props} />;
    case "reviews":
      return <ReviewsTemplate {...props} />;
    case "prices":
      return <PricesTemplate {...props} />;
    case "legal":
      return <LegalTemplate {...props} />;
    case "gallery":
      return <GalleryTemplate {...props} />;
    case "videos":
      return <VideosTemplate {...props} />;
    case "offers":
      return <OffersTemplate {...props} />;
    case "news":
      return <NewsTemplate {...props} />;
    default:
      return <ContentTemplate {...props} />;
  }
}

/** Default page: hero, CMS blocks, sub-pages, documents and a booking band. */
export function ContentTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const kids = childrenOf(page.id).filter((c) => c[locale] || locale === "en");
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={page.image} crumbs={crumbsFor(page.id, locale)} tone={page.section === "spa" ? "spa" : "hotel"} />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
        {d.pdfs && d.pdfs.length > 0 && <Documents pdfs={d.pdfs} label={t.common.download} />}
      </div>
      {kids.length > 0 && <ChildGrid pages={kids} locale={locale} t={t} title={t.common.discover} />}
      <BookingBand t={t} section={page.section} />
    </>
  );
}

export function ChildGrid({ pages, locale, t, title, columns = 3 }: { pages: Page[]; locale: Locale; t: Dictionary; title?: string; columns?: 2 | 3 | 4 }) {
  return (
    <section className="bg-sand-100 py-20" aria-label={title}>
      <div className="container-page">
        {title && <h2 className="font-display text-3xl text-navy-700 sm:text-4xl">{title}</h2>}
        <ul className={`mt-6 grid gap-6 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : columns === 3 ? "lg:grid-cols-3" : ""}`}>
          {pages.map((c, i) => {
            const cd = c[locale] ?? c.hu ?? c.en;
            if (!cd) return null;
            return (
              <Reveal as="li" key={c.id} delay={(i % 3) * 90}>
                <Card href={hrefOrFallback(c.id, locale)} image={c.cardImage ?? c.image} title={cd.title} text={cd.excerpt ?? cd.subtitle ?? cd.description} cta={t.common.readMore} />
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Documents({ pdfs, label }: { pdfs: string[]; label: string }) {
  return (
    <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
      {pdfs.map((u) => {
        const name = decodeURIComponent(u.split("/").pop() ?? "").replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
        return (
          <li key={u}>
            <a href={u} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl bg-white p-4 font-bold capitalize text-navy-700 shadow-soft ring-1 ring-navy-100 transition hover:-translate-y-0.5 hover:ring-lake-300">
              <span className="grid size-10 place-items-center rounded-xl bg-spa-50 text-spa-500">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <span className="flex-1">{name}</span>
              <span className="text-xs font-extrabold uppercase text-lake-600">{label} PDF</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function BookingBand({ t, section }: { t: Dictionary; section: Page["section"] }) {
  return (
    <section className="container-page py-20">
      <Reveal
        className={`relative isolate overflow-hidden rounded-[2.5rem] p-8 text-white shadow-lift sm:p-12 ${section === "spa" ? "bg-gradient-to-br from-spa-600 to-navy-700" : "bg-gradient-to-br from-navy-600 to-lake-500"}`}
      >
        <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-script text-4xl leading-none text-white/85">{t.meta.slogan}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t.booking.title}</h2>
            <p className="mt-2 text-white/80">{t.booking.bestPrice}</p>
          </div>
          <OpenBookingButton className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-navy-800 shadow-lift transition hover:bg-lake-50">
            <CalendarDays className="size-5" aria-hidden="true" />
            {t.home.heroCtaPrimary}
          </OpenBookingButton>
        </div>
      </Reveal>
    </section>
  );
}

export { pageHref };
