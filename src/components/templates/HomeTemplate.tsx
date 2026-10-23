import Link from "next/link";
import { Suspense } from "react";
import { preload } from "react-dom";
import { ArrowRight, Car, Train, Waves, Sparkles, Star } from "lucide-react";
import home from "@/content/home.json";
import site from "@/content/site.json";
import reviewsData from "@/content/reviews.json";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { getImage, srcSet, largestUrl } from "@/lib/images";
import { albums, hrefOrFallback, pageHref } from "@/lib/content/pages";
import { getActiveOffers, getPublishedNews } from "@/lib/data";
import { toGalleryImages } from "@/lib/gallery-props";
import { HeroSlider, type Slide } from "@/components/sections/HeroSlider";
import { Weather } from "@/components/sections/Weather";
import { CountUp } from "@/components/sections/CountUp";
import { Testimonials, Stars } from "@/components/sections/Testimonials";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { OpenStatus } from "@/components/sections/OpenStatus";
import { BookingForm } from "@/components/booking/BookingForm";
import { OfferCard } from "@/components/offers/OfferCard";
import { Carousel } from "@/components/offers/OffersCarousel";
import { NewsCard } from "@/components/news/NewsCard";
import { Gallery } from "@/components/ui/Gallery";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ResortJsonLd } from "@/components/seo/ResortJsonLd";

export async function HomeTemplate({ locale, t }: { locale: Locale; t: Dictionary }) {
  const slides: Slide[] = home.slides.map((s) => {
    const e = getImage(s.image);
    const d = s[locale as "hu" | "en"];
    return {
      src: e ? largestUrl(e) : s.image,
      srcSet: e ? srcSet(e) : "",
      blur: e?.blur,
      title: d.title,
      text: d.text,
      cta: d.cta,
      href: s.link === "booking" ? null : hrefOrFallback(s.link, locale),
    };
  });
  // Let the browser start fetching the LCP hero image before hydration.
  if (slides[0]?.srcSet) preload(slides[0].src, { as: "image", imageSrcSet: slides[0].srcSet, imageSizes: "100vw", fetchPriority: "high" });
  const [offers, news] = await Promise.all([getActiveOffers(), getPublishedNews()]);
  const galleryImgs = toGalleryImages(
    [...(albums.find((a) => a.id === "adventure-pool")?.images.slice(0, 4) ?? []), ...(albums.find((a) => a.id === "kids")?.images.slice(0, 4) ?? []), ...(albums.find((a) => a.id === "beach")?.images.slice(0, 4) ?? [])].map((src) => ({ src, alt: "" })),
    t.home.galleryTitle,
  );
  const stats = [
    { n: site.stats.wellnessM2, label: t.home.statsWellness, Icon: Waves },
    { n: site.stats.pools, label: t.home.statsPools, Icon: Sparkles },
    { n: site.stats.saunas, label: t.home.statsSaunas, Icon: Sparkles },
    { n: site.stats.days, label: t.home.statsDays, Icon: Star },
  ];

  return (
    <>
      <ResortJsonLd locale={locale} />
      <HeroSlider slides={slides} kicker={t.home.heroKicker} labels={{ pause: t.a11y.pauseSlideshow, play: t.a11y.playSlideshow, slide: t.a11y.slide, of: t.a11y.of }}>
        <Suspense fallback={null}>
          <Weather locale={locale} t={t.weather} />
        </Suspense>
      </HeroSlider>

      {/* Booking bar overlapping the hero */}
      <div className="container-page relative z-10 -mt-8">
        <Reveal className="rounded-[2rem] bg-white p-5 shadow-lift ring-1 ring-navy-100 sm:p-6">
          <h2 className="mb-4 font-display text-xl text-navy-700">{t.booking.title}</h2>
          <BookingForm t={t.booking} layout="bar" />
        </Reveal>
      </div>

      {/* Intro + choose hotel / spa (the original portal's core) */}
      <section className="container-page py-24" aria-labelledby="choose-title">
        <SectionHeading
          id="choose-title"
          kicker={t.home.choose}
          title={t.meta.slogan.replace(/[„”“"]/g, "")}
          text={<p>{locale === "hu" ? "Család- és gyermekbarát, négycsillagos spa- és wellness szálloda a Velencei-tó partján, saját stranddal, gyógyvízzel, élményfürdővel. Szolgáltatásaink és programjaink kifejezetten a gyermekes családok igényeihez igazodnak – és ha csak egynapos kikapcsolódás a cél, nálunk az is lehetséges." : "A family- and child-friendly four-star spa and wellness hotel on the shores of Lake Velence, with a private beach, medicinal water and adventure pools. Our services and programmes are designed for families with children – and if you only have a day, that's possible too."}</p>}
          align="center"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {(
            [
              { key: "hotel", img: home.choose.hotel, title: t.home.hotelCardTitle, text: t.home.hotelCardText, cta: t.home.hotelCardCta, href: hrefOrFallback("hotel", locale), tone: "from-navy-900/85" },
              { key: "spa", img: home.choose.spa, title: t.home.spaCardTitle, text: t.home.spaCardText, cta: t.home.spaCardCta, href: hrefOrFallback("spa", locale), tone: "from-spa-700/85" },
            ] as const
          ).map((c, i) => (
            <Reveal key={c.key} delay={i * 120}>
              <Link href={c.href} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2.5rem] p-8 text-white shadow-soft sm:aspect-[16/11] sm:p-10">
                <Img src={c.img} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="-z-10 transition duration-[1.6s] ease-out-expo group-hover:scale-110" />
                <span className={`absolute inset-0 -z-10 bg-gradient-to-t ${c.tone} via-transparent to-transparent`} />
                <span className="font-script text-5xl leading-none text-lake-100 sm:text-6xl">{c.title}</span>
                <span className="mt-3 max-w-md text-lg text-white/90">{c.text}</span>
                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-6 py-3 font-extrabold text-navy-800 transition group-hover:bg-white">
                  {c.cta}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden bg-navy-700 py-16 text-white" aria-label="Velence Resort & Spa">
        <div aria-hidden="true" className="absolute -right-20 -top-20 size-80 rounded-full bg-lake-400/20 blur-3xl" />
        <ul className="container-page grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 100} className="text-center">
              <p className="font-display text-5xl text-white sm:text-6xl">
                <CountUp to={s.n} locale={locale} />
              </p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wider text-lake-200">{s.label}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="py-24" aria-labelledby="offers-title">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="offers-title" kicker={t.home.offersKicker} title={t.home.offersTitle} text={<p>{t.home.offersText}</p>} />
              <ButtonLink href={hrefOrFallback("offers", locale)} variant="outline">
                {t.common.viewAll}
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
            <Carousel labels={{ previous: t.a11y.previous, next: t.a11y.next }} className="mt-12">
              {offers.slice(0, 8).map((o, i) => (
                <OfferCard key={o.id} offer={o} locale={locale} t={t} priority={i === 0} />
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-sand-100 py-24" aria-labelledby="why-title">
        <div className="container-page">
          <SectionHeading id="why-title" kicker={t.common.discover} title={t.home.whyTitle} text={<p>{t.home.whyText}</p>} align="center" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {home.why.map((w, i) => (
              <Reveal key={w.link} delay={i * 120}>
                <Link href={hrefOrFallback(w.link, locale)} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] p-7 text-white shadow-soft">
                  <Img src={w.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="-z-10 transition duration-[1.4s] ease-out-expo group-hover:scale-110" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-900/20 to-transparent" />
                  <span className="font-display text-3xl">{w[locale as "hu" | "en"].title}</span>
                  <span className="mt-2 text-white/85 transition-all duration-500 group-hover:text-white">{w[locale as "hu" | "en"].text}</span>
                  <span className="mt-4 inline-flex items-center gap-2 font-extrabold text-lake-200">
                    {t.common.readMore} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Spa teaser */}
      <section className="py-24" aria-labelledby="spa-title">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div aria-hidden="true" className="absolute -inset-4 -z-10 rotate-3 rounded-[3rem] bg-spa-100" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-lift">
              <Img src={home.spaIntro.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" />
            </div>
            <div className="absolute -bottom-6 right-6 rounded-2xl bg-white p-4 shadow-lift">
              <p className="text-xs font-extrabold uppercase tracking-wider text-navy-700/80">{t.spa.hoursTitle}</p>
              <p className="font-display text-xl text-navy-700">
                {site.spaHours.open} – {site.spaHours.close}
              </p>
              <div className="mt-2">
                <OpenStatus open={site.spaHours.open} close={site.spaHours.close} labels={{ openNow: t.common.openNow, closedNow: t.common.closedNow, opensAt: t.common.opensAt, closesAt: t.common.closesAt }} />
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading id="spa-title" kicker="Wellness & Spa" title={locale === "hu" ? "A feltöltődés élménye" : "The experience of rejuvenation"} text={<p>{home.spaIntro[locale as "hu" | "en"]}</p>} />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {home.spa.map((s) => (
                <li key={s.link}>
                  <Link href={hrefOrFallback(s.link, locale)} className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-navy-100 transition hover:-translate-y-0.5 hover:ring-lake-300">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                      <Img src={s.image} alt="" fill sizes="64px" />
                    </span>
                    <span className="text-sm font-bold leading-snug text-navy-700">{s[locale as "hu" | "en"]}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={hrefOrFallback("prices", locale)} variant="spa">
                {t.nav.openingHours}
              </ButtonLink>
              <ButtonLink href={hrefOrFallback("spa", locale)} variant="outline">
                {t.home.spaCardCta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="relative overflow-hidden bg-navy-800 py-24 text-white" aria-labelledby="reviews-title">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading id="reviews-title" kicker={t.home.testimonialsTitle} title={locale === "hu" ? "Családok ezrei választanak minket újra és újra" : "Thousands of families come back again and again"} tone="light" />
          <Reveal className="flex items-center gap-5 rounded-3xl bg-white/10 p-6 ring-1 ring-white/15">
            <p className="font-display text-6xl">{reviewsData.average.toLocaleString(locale === "hu" ? "hu-HU" : "en-GB")}</p>
            <div>
              <Stars value={reviewsData.average} size="size-5" />
              <p className="mt-1 text-sm text-white/75">
                {locale === "hu" ? `${reviewsData.count.toLocaleString("hu-HU")} értékelés alapján` : `based on ${reviewsData.count.toLocaleString("en-GB")} reviews`}
              </p>
              {pageHref("reviews", locale) && (
                <Link href={pageHref("reviews", locale)!} className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold text-lake-200 hover:underline">
                  {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </Reveal>
        </div>
        <div className="mt-12">
          <Testimonials locale={locale} label={t.home.testimonialsTitle} />
        </div>
      </section>

      {/* News */}
      {news.length > 0 && (
        <section className="py-24" aria-labelledby="news-title">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="news-title" kicker={t.home.newsKicker} title={t.home.newsTitle} text={<p>{t.home.newsText}</p>} />
              <ButtonLink href={hrefOrFallback("news", locale)} variant="outline">
                {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {news.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <NewsCard item={n} locale={locale} t={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Gallery strip */}
      <section className="bg-sand-100 py-24" aria-labelledby="gallery-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading id="gallery-title" kicker={t.home.galleryKicker} title={t.home.galleryTitle} />
            <ButtonLink href={hrefOrFallback("gallery", locale)} variant="outline">
              {t.common.viewAll} <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="mt-10">
            <Gallery images={galleryImgs} layout="strip" openLabel={t.common.photos} />
          </div>
        </div>
      </section>

      {/* Voucher */}
      <section className="container-page py-24" aria-labelledby="voucher-title">
        <Reveal className="relative isolate overflow-hidden rounded-[2.5rem] bg-spa-600 p-8 text-white shadow-lift sm:p-14">
          <Img src={home.voucher.image} alt="" fill sizes="100vw" className="-z-10 opacity-40 mix-blend-luminosity" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-spa-700 via-spa-600/80 to-transparent" />
          <p className="font-script text-4xl text-spa-100">{home.voucher[locale as "hu" | "en"].kicker}</p>
          <h2 id="voucher-title" className="mt-2 max-w-xl font-display text-4xl leading-tight">
            {home.voucher[locale as "hu" | "en"].title}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-white/90">{home.voucher[locale as "hu" | "en"].text}</p>
          <ButtonLink href={site.booking.voucher} variant="light" className="mt-8">
            {home.voucher[locale as "hu" | "en"].cta}
          </ButtonLink>
        </Reveal>
      </section>

      {/* Location */}
      <section className="pb-12" aria-labelledby="location-title">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <SectionHeading id="location-title" kicker={t.common.directions} title={t.home.locationTitle} text={<p>{t.home.locationText}</p>} />
            <ul className="mt-8 space-y-4">
              <li className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lake-50 text-lake-600">
                  <Car className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-navy-700">M7 · Budapest 45 min</strong>
                  <span className="text-navy-800/70">{locale === "hu" ? "Ingyenes Wi-Fi, saját parkoló a szálloda előtt" : "Free Wi-Fi, on-site car park in front of the hotel"}</span>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lake-50 text-lake-600">
                  <Train className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-navy-700">{locale === "hu" ? "Vonattal" : "By train"}</strong>
                  <span className="text-navy-800/70">{locale === "hu" ? "Velence vasútállomás – pár perc sétára" : "Velence railway station – a short walk away"}</span>
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`} variant="primary">
                {t.common.directions}
              </ButtonLink>
              <ButtonLink href={hrefOrFallback("contact", locale)} variant="outline">
                {t.common.contactUs}
              </ButtonLink>
            </div>
          </div>
          <MapEmbed lat={site.geo.lat} lng={site.geo.lng} title={t.home.locationTitle} consentText={t.consent.mediaBlocked} enableLabel={t.consent.enableMedia} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page py-16" aria-labelledby="nl-title">
        <div className="grid items-center gap-8 rounded-[2.5rem] bg-gradient-to-br from-lake-100 via-white to-sand-100 p-8 ring-1 ring-navy-100 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 id="nl-title" className="font-display text-3xl text-navy-700">
              {t.forms.newsletterTitle}
            </h2>
            <p className="mt-3 text-navy-800/75">{t.forms.newsletterText}</p>
          </div>
          <NewsletterForm locale={locale} t={t.forms} compact />
        </div>
      </section>
    </>
  );
}
