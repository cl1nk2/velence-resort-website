import Link from "next/link";
import { ArrowRight, BedDouble, Baby, UtensilsCrossed, PartyPopper, Crown, Users, Clock, Ticket, Flower2, Flame, Gift } from "lucide-react";
import home from "@/content/home.json";
import site from "@/content/site.json";
import { childrenOf, getPage, hrefOrFallback, pageTitle, videos } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { getActiveOffers, getPublishedNews } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { Card, Chip } from "@/components/ui/Card";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { YouTube } from "@/components/ui/YouTube";
import { OpenStatus } from "@/components/sections/OpenStatus";
import { OfferCard } from "@/components/offers/OfferCard";
import { Carousel } from "@/components/offers/OffersCarousel";
import { NewsCard } from "@/components/news/NewsCard";
import { BookingBand, type TemplateProps } from "./PageTemplate";
import { FacilityFacts } from "./Listings";

export async function HotelTemplate({ page, locale, t }: TemplateProps) {
  const rooms = childrenOf("rooms");
  const offers = await getActiveOffers();
  const quick = [
    { id: "rooms", Icon: BedDouble },
    { id: "family", Icon: Users },
    { id: "kids", Icon: Baby },
    { id: "gastro", Icon: UtensilsCrossed },
    { id: "events", Icon: PartyPopper },
    { id: "loyalty", Icon: Crown },
  ];
  const v = videos[0];
  const intro = getPage("hotel-intro")?.[locale];
  return (
    <>
      <PageHero
        title={t.home.hotelCardTitle === "Hotel" ? "Velence Resort & Spa Hotel" : t.home.hotelCardTitle}
        kicker={t.home.heroKicker}
        intro={t.home.hotelCardText}
        image={home.slides[2].image}
        crumbs={crumbsFor(page.id, locale)}
        size="lg"
      />
      <section className="container-page relative z-10 -mt-10">
        <ul className="grid grid-cols-2 gap-3 rounded-[2rem] bg-white p-3 shadow-lift ring-1 ring-navy-100 sm:grid-cols-3 lg:grid-cols-6">
          {quick.map(({ id, Icon }) => (
            <li key={id}>
              <Link href={hrefOrFallback(id, locale)} className="group flex h-full flex-col items-center gap-2 rounded-2xl p-4 text-center font-bold text-navy-700 transition hover:bg-lake-50">
                <span className="grid size-12 place-items-center rounded-2xl bg-lake-50 text-lake-600 transition group-hover:scale-110 group-hover:bg-white">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="text-sm leading-tight">{pageTitle(id, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page py-24" aria-labelledby="rooms-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="rooms-h" kicker={t.rooms.title} title={getPage("rooms")?.[locale]?.subtitle ?? t.rooms.title} />
          <ButtonLink href={hrefOrFallback("rooms", locale)} variant="outline">
            {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <Carousel labels={{ previous: t.a11y.previous, next: t.a11y.next }} className="mt-10">
          {rooms.map((r) => {
            const d = r[locale] ?? r.hu!;
            return (
              <Card
                key={r.id}
                href={hrefOrFallback(r.id, locale)}
                image={r.cardImage ?? r.image}
                title={d.title}
                text={d.excerpt}
                cta={t.common.readMore}
                meta={
                  <>
                    {d.facts?.size && <Chip>{d.facts.size}</Chip>}
                    {d.facts?.people && <Chip>{d.facts.people}</Chip>}
                  </>
                }
              />
            );
          })}
        </Carousel>
      </section>

      <section className="bg-sand-100 py-24" aria-labelledby="hotel-intro-h">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="hotel-intro-h" kicker={t.common.discover} title={t.home.whyTitle} text={<p>{t.home.whyText}</p>} />
            {intro && (
              <ButtonLink href={hrefOrFallback("hotel-intro", locale)} variant="primary" className="mt-8">
                {intro.title} <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            )}
          </div>
          {v && (
            <Reveal>
              <YouTube id={v.id} title={v[locale]} thumb={v.thumb} playLabel={t.a11y.playVideo} consentText={t.consent.mediaBlocked} enableLabel={t.consent.enableMedia} />
            </Reveal>
          )}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-page py-24" aria-labelledby="hotel-offers-h">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="hotel-offers-h" kicker={t.home.offersKicker} title={t.home.offersTitle} />
            <ButtonLink href={hrefOrFallback("offers", locale)} variant="outline">
              {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <Carousel labels={{ previous: t.a11y.previous, next: t.a11y.next }} className="mt-10">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} locale={locale} t={t} />
            ))}
          </Carousel>
        </section>
      )}

      <section className="container-page pb-8" aria-label={t.common.discover}>
        <ul className="grid gap-6 md:grid-cols-3">
          {home.why.map((w, i) => (
            <Reveal as="li" key={w.link} delay={i * 100}>
              <Card href={hrefOrFallback(w.link, locale)} image={w.image} title={w[locale].title} text={w[locale].text} cta={t.common.readMore} aspect="aspect-[5/4]" />
            </Reveal>
          ))}
        </ul>
      </section>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

export async function SpaTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const pools = childrenOf("pools");
  const saunas = childrenOf("saunas");
  const news = (await getPublishedNews()).filter((n) => n.category === "spa").slice(0, 3);
  const cards = [
    { id: "prices", Icon: Clock, title: t.spa.hoursTitle, text: `${site.spaHours.open} – ${site.spaHours.close}` },
    { id: "prices", Icon: Ticket, title: t.spa.ticketsTitle, text: t.spa.ticketsFrom },
    { id: "treatments", Icon: Flower2, title: t.spa.treatmentsTitle, text: t.spa.treatmentsText },
    { id: "saunas", Icon: Flame, title: t.spa.saunaTitle, text: t.spa.saunaText },
  ];
  const intro = d.blocks.find((b) => b.type === "split");
  return (
    <>
      <PageHero title="Velence Spa" kicker={t.common.discover} intro={home.spaIntro[locale]} image={home.slides[4].image} crumbs={crumbsFor(page.id, locale)} tone="spa" size="lg">
        <div className="mt-6 flex h-9 items-center">
          <span className="inline-flex h-9 items-center rounded-full bg-white/90 px-1">
            <OpenStatus open={site.spaHours.open} close={site.spaHours.close} labels={{ openNow: t.common.openNow, closedNow: t.common.closedNow, opensAt: t.common.opensAt, closesAt: t.common.closesAt }} />
          </span>
        </div>
      </PageHero>
      <section className="container-page relative z-10 -mt-10">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ id, Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 80}>
              <Link href={hrefOrFallback(id, locale)} className="group flex h-full items-start gap-4 rounded-3xl bg-white p-5 shadow-lift ring-1 ring-navy-100 transition hover:-translate-y-1">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-spa-50 text-spa-500 transition group-hover:bg-spa-500 group-hover:text-white">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-lg text-navy-700">{title}</span>
                  <span className="text-sm text-navy-800/70">{text}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {intro && intro.type === "split" && (
        <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-lift">
            <Img src={intro.images[0]?.src} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" />
          </Reveal>
          <Reveal>
            <div className="prose-resort mt-2" dangerouslySetInnerHTML={{ __html: intro.blocks.map((b) => (b.type === "html" ? b.html : "")).join("") }} />
            <ButtonLink href={hrefOrFallback("prices", locale)} variant="spa" className="mt-8">
              {t.nav.openingHours}
            </ButtonLink>
          </Reveal>
        </section>
      )}

      {[
        { id: "pools", list: pools },
        { id: "saunas", list: saunas },
      ].map(({ id, list }) => (
        <section key={id} className="bg-sand-100 py-20 odd:bg-transparent" aria-labelledby={`${id}-h`}>
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id={`${id}-h`} kicker={pageTitle(id, locale)} title={getPage(id)?.[locale]?.subtitle ?? pageTitle(id, locale)} />
              <ButtonLink href={hrefOrFallback(id, locale)} variant="outline">
                {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
            <Carousel labels={{ previous: t.a11y.previous, next: t.a11y.next }} className="mt-10">
              {list.map((f) => {
                const fd = f[locale] ?? f.hu!;
                return <Card key={f.id} href={hrefOrFallback(f.id, locale)} image={f.cardImage ?? f.image} title={fd.title} text={fd.excerpt} cta={t.common.readMore} meta={<FacilityFacts facts={fd.facts} locale={locale} />} />;
              })}
            </Carousel>
          </div>
        </section>
      ))}

      <section className="container-page grid gap-6 py-24 md:grid-cols-2">
        {(["treatments", "lakeside"] as const).map((id) => {
          const p = getPage(id)!;
          const pd = p[locale] ?? p.hu!;
          return (
            <Reveal key={id}>
              <Link href={hrefOrFallback(id, locale)} className="group relative isolate flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-[2.5rem] p-8 text-white shadow-soft">
                <Img src={p.image} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="-z-10 transition duration-[1.4s] group-hover:scale-110" />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-spa-700/85 to-transparent" />
                <span className="font-display text-3xl">{pd.title}</span>
                <span className="mt-1 max-w-md text-white/85 line-clamp-2">{pd.description}</span>
              </Link>
            </Reveal>
          );
        })}
      </section>

      <section className="container-page pb-12">
        <Reveal className="flex flex-col items-start gap-6 rounded-[2.5rem] bg-spa-50 p-8 ring-1 ring-spa-100 sm:flex-row sm:items-center sm:p-12">
          <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-spa-500 text-white">
            <Gift className="size-8" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-2xl text-navy-700">{home.voucher[locale].title}</h2>
            <p className="mt-1 text-navy-800/75">{home.voucher[locale].text}</p>
          </div>
          <ButtonLink href={site.booking.voucher} variant="spa">
            {home.voucher[locale].cta}
          </ButtonLink>
        </Reveal>
      </section>

      {news.length > 0 && (
        <section className="container-page py-16" aria-labelledby="spa-news-h">
          <SectionHeading id="spa-news-h" kicker={t.home.newsKicker} title={t.home.newsTitle} />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {news.map((n) => (
              <li key={n.id}>
                <NewsCard item={n} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <BookingBand t={t} section="spa" />
    </>
  );
}
