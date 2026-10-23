import Link from "next/link";
import { CalendarRange, Check, Info, Moon, Sparkles, ArrowLeft } from "lucide-react";
import site from "@/content/site.json";
import type { Offer } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { hrefOrFallback } from "@/lib/content/pages";
import { crumbsFor } from "@/lib/crumbs";
import { getActiveOffers } from "@/lib/data";
import { offerHref } from "@/lib/hrefs";
import { formatDateRange, formatPrice } from "@/lib/i18n/format";
import { siteUrl } from "@/lib/site-url";
import { ogImageUrl } from "@/lib/images";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { OfferCard } from "@/components/offers/OfferCard";
import { OfferFilter } from "@/components/offers/OfferFilter";
import { OfferStatus } from "@/components/offers/OfferStatus";
import { Carousel } from "@/components/offers/OffersCarousel";
import { OpenBookingButton } from "@/components/booking/OpenBookingButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingBand, type TemplateProps } from "./PageTemplate";

export async function OffersTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const offers = await getActiveOffers();
  const count = (c: string) => offers.filter((o) => o.categories.includes(c)).length;
  const options = [
    { id: "all", label: t.offers.filterAll, count: offers.length },
    ...(["ele", "season", "family"] as const).map((c) => ({ id: c, label: t.offers.categories[c], count: count(c) })).filter((o) => o.count > 0),
  ];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: offers.map((o, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}${offerHref(o, locale)}`, name: o[locale].title })),
        }}
      />
      <PageHero title={d.title} kicker={d.subtitle} intro={locale === "hu" ? "Különleges csomagajánlataink között biztosan megtalálod a neked és szeretteidnek tökéletes kikapcsolódást – élj a lehetőséggel!" : "Discover our special packages – you're sure to find the perfect getaway for you and your loved ones."} image={offers[0]?.heroImage ?? page.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-16">
        <OfferFilter options={options} label={t.offers.title}>
          {offers.map((o, i) => (
            <li key={o.id} data-cats={o.categories.join(" ")}>
              <OfferCard offer={o} locale={locale} t={t} priority={i < 2} />
            </li>
          ))}
        </OfferFilter>
      </section>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

export async function OfferDetail({ offer, locale, t }: { offer: Offer; locale: Locale; t: Dictionary }) {
  const d = offer[locale];
  const others = (await getActiveOffers()).filter((o) => o.id !== offer.id);
  const og = ogImageUrl(offer.heroImage ?? offer.image);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Offer",
          name: d.title,
          description: d.summary,
          url: `${siteUrl}${offerHref(offer, locale)}`,
          image: og ? `${siteUrl}${og}` : undefined,
          price: offer.priceFrom ?? undefined,
          priceCurrency: "HUF",
          priceSpecification: offer.priceFrom ? { "@type": "UnitPriceSpecification", price: offer.priceFrom, priceCurrency: "HUF", unitText: "person per night" } : undefined,
          validFrom: offer.validFrom ?? undefined,
          validThrough: offer.validTo ?? undefined,
          availability: "https://schema.org/InStock",
          offeredBy: { "@id": `${siteUrl}/#resort` },
        }}
      />
      <PageHero
        title={d.title}
        kicker={t.offers.title}
        intro={d.summary}
        image={offer.heroImage ?? offer.image}
        crumbs={crumbsFor("offers", locale, [{ label: d.title, href: offerHref(offer, locale) }])}
        size="lg"
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <OfferStatus from={offer.validFrom} to={offer.validTo} labels={{ ongoing: t.offers.ongoing, upcoming: t.offers.upcoming, countdown: t.offers.countdown, days: t.offers.days }} />
        </div>
      </PageHero>
      <div className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-12">
          {d.highlights.length > 0 && (
            <Reveal>
              <h2 className="flex items-center gap-3 font-display text-3xl text-navy-700">
                <Sparkles className="size-7 text-gold-500" aria-hidden="true" /> {t.offers.special}
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {d.highlights.map((h) => (
                  <li key={h} className="rounded-2xl bg-gradient-to-br from-gold-400/15 to-white p-5 font-semibold text-navy-800 ring-1 ring-gold-400/30">
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal>
            <h2 className="font-display text-3xl text-navy-700">{t.offers.includes}</h2>
            <ul className="mt-6 space-y-3">
              {t.offers.standardIncludes.map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-navy-800">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <details className="group rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-6 py-5 font-bold text-navy-800 [&::-webkit-details-marker]:hidden">
                <Info className="size-5 text-lake-500" aria-hidden="true" />
                {t.offers.terms}
              </summary>
              <ul className="list-disc space-y-1.5 px-6 pb-6 pl-12 text-sm text-navy-800/80">
                {t.offers.termsList.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </details>
          </Reveal>
          <Link href={hrefOrFallback("offers", locale)} className="inline-flex items-center gap-2 font-bold text-navy-700 hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.common.viewAll}
          </Link>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-navy-100">
            <div className="bg-gradient-to-br from-navy-600 to-lake-500 p-6 text-white">
              {offer.priceFrom && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wider text-white/75">{t.offers.priceFrom}</p>
                  <p className="font-display text-4xl">
                    {formatPrice(offer.priceFrom, locale)}
                    {locale === "hu" && <span className="text-lg">-tól</span>}
                  </p>
                  <p className="text-sm text-white/80">{t.offers.perPersonNight}</p>
                </>
              )}
            </div>
            <dl className="space-y-4 p-6 text-sm">
              {offer.validFrom && offer.validTo && (
                <div className="flex items-start gap-3">
                  <CalendarRange className="mt-0.5 size-5 text-lake-500" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-navy-700">{t.offers.validity}</dt>
                    <dd className="text-navy-800/80">{formatDateRange(offer.validFrom, offer.validTo, locale)}</dd>
                  </div>
                </div>
              )}
              {offer.minNights && (
                <div className="flex items-start gap-3">
                  <Moon className="mt-0.5 size-5 text-lake-500" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-navy-700">{locale === "hu" ? "Minimum tartózkodás" : "Minimum stay"}</dt>
                    <dd className="text-navy-800/80">
                      {offer.minNights} {t.offers.nights}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
            <div className="space-y-3 px-6 pb-6">
              <OpenBookingButton offer={{ validFrom: offer.validFrom, minNights: offer.minNights }} className="w-full rounded-full bg-spa-500 px-6 py-3.5 font-extrabold text-white hover:bg-spa-600">
                {t.offers.bookThis}
              </OpenBookingButton>
              <a href={site.booking.quote} target="_blank" rel="noopener" className="block rounded-full border-2 border-navy-100 px-6 py-3 text-center font-bold text-navy-700 hover:border-navy-600">
                {locale === "hu" ? "Ajánlatkérés" : "Request a quote"}
                <span className="sr-only"> {t.a11y.opensInNewTab}</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
      {others.length > 0 && (
        <section className="bg-sand-100 py-20" aria-labelledby="more-offers">
          <div className="container-page">
            <h2 id="more-offers" className="font-display text-3xl text-navy-700">
              {t.offers.moreOffers}
            </h2>
            <Carousel labels={{ previous: t.a11y.previous, next: t.a11y.next }} className="mt-8">
              {others.map((o) => (
                <OfferCard key={o.id} offer={o} locale={locale} t={t} />
              ))}
            </Carousel>
          </div>
        </section>
      )}
    </>
  );
}
