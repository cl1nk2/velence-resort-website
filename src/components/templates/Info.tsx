import Link from "next/link";
import { CalendarClock, Clock, CreditCard, Crown, Mail, MapPin, Phone, Quote, Sparkles, Star, Ticket } from "lucide-react";
import site from "@/content/site.json";
import loyalty from "@/content/loyalty.json";
import reviews from "@/content/reviews.json";
import { crumbsFor } from "@/lib/crumbs";
import { getPage, hrefOrFallback } from "@/lib/content/pages";
import { getPrices } from "@/lib/data";
import { formatDate, formatDateRange, formatPrice } from "@/lib/i18n/format";
import type { Block } from "@/lib/content/types";
import { PageHero } from "@/components/ui/PageHero";
import { Blocks } from "@/components/blocks/Blocks";
import { Html } from "@/components/blocks/Html";
import { FaqExplorer } from "@/components/blocks/FaqExplorer";
import { FaqList } from "@/components/blocks/FaqList";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { ContactForm } from "@/components/forms/ContactForm";
import { EventForm } from "@/components/forms/EventForm";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { OpenStatus } from "@/components/sections/OpenStatus";
import { Stars } from "@/components/sections/Testimonials";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookingBand, Documents, type TemplateProps } from "./PageTemplate";

const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const privacyHref = (locale: "hu" | "en") => hrefOrFallback("privacy", locale);

export function FaqTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const groups = d.blocks.flatMap((b) => (b.type === "faq" ? b.groups : []));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) => g.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: strip(it.a) } }))),
        }}
      />
      <PageHero title={d.title} kicker={d.subtitle} image={getPage("family")?.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page max-w-4xl py-16">
        <FaqExplorer
          groups={groups}
          labels={{
            search: locale === "hu" ? "Keress a kérdések között…" : "Search the questions…",
            all: t.common.allCategories,
            results: locale === "hu" ? "{n} találat" : "{n} results",
            none: t.common.noResults,
          }}
        />
      </div>
    </>
  );
}

export function ContactTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;
  const cards = [
    { Icon: Phone, title: t.footer.hotelReception, lines: [<a key="h" href={tel(site.phones.hotel)}>{site.phones.hotel}</a>, <a key="m" href={`mailto:${site.emails.reservation}`}>{site.emails.reservation}</a>] },
    { Icon: Sparkles, title: t.footer.spaReception, lines: [<a key="s" href={tel(site.phones.spa)}>{site.phones.spa}</a>, <a key="e" href={`mailto:${site.emails.spa}`}>{site.emails.spa}</a>] },
    {
      Icon: CalendarClock,
      title: locale === "hu" ? "Értékesítés" : "Sales",
      lines: [<span key="hrs">{site.salesHours[locale]}</span>, ...site.phones.sales.map((p) => <a key={p} href={tel(p)}>{p}</a>)],
    },
    { Icon: MapPin, title: t.footer.address, lines: [<span key="a">H-{site.address.postalCode} {site.address.city}, {site.address.street}</span>, <a key="i" href={`mailto:${site.emails.info}`}>{site.emails.info}</a>] },
  ];
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} intro={strip(d.blocks.find((b) => b.type === "html")?.html.split("</p>")[0] ?? "")} image={getPage("hotel-intro")?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page relative z-10 -mt-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, title, lines }, i) => (
            <Reveal as="li" key={title} delay={i * 80} className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-navy-100">
              <span className="grid size-12 place-items-center rounded-2xl bg-lake-50 text-lake-600">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-lg text-navy-700">{title}</h2>
              <p className="mt-2 space-y-1 text-sm font-semibold text-navy-800/80 [&_a]:block [&_a]:text-navy-700 [&_a:hover]:underline [&>span]:block">{lines}</p>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="container-page grid gap-10 py-20 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-navy-100 sm:p-10">
          <h2 className="font-display text-3xl text-navy-700">{t.forms.contactTitle}</h2>
          <p className="mb-6 mt-2 text-navy-800/70">{t.forms.contactText}</p>
          <ContactForm locale={locale} t={t.forms} privacyHref={privacyHref(locale)} />
        </div>
        <MapEmbed lat={site.geo.lat} lng={site.geo.lng} title="Velence Resort & Spa" consentText={t.consent.mediaBlocked} enableLabel={t.consent.enableMedia} />
      </section>
    </>
  );
}

export function NewsletterTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={getPage("lakeside")?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page max-w-3xl py-20">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-navy-100 sm:p-10">
          <Mail className="size-10 text-lake-500" aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl text-navy-700">{t.forms.newsletterTitle}</h2>
          <p className="mb-6 mt-2 text-navy-800/70">{t.forms.newsletterText}</p>
          <NewsletterForm locale={locale} t={t.forms} privacyHref={privacyHref(locale)} />
        </div>
      </section>
    </>
  );
}

export function EventsTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={page.image} crumbs={crumbsFor(page.id, locale)} />
      <div className="container-page py-20">
        <Blocks blocks={d.blocks} t={t} locale={locale} title={d.title} />
      </div>
      <section className="container-page pb-20" id="ajanlatkeres" aria-labelledby="rfq-h">
        <div className="grid gap-10 rounded-[2.5rem] bg-white p-6 shadow-lift ring-1 ring-navy-100 sm:p-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="font-script text-4xl text-lake-500">{t.nav.events}</p>
            <h2 id="rfq-h" className="mt-2 font-display text-3xl text-navy-700">
              {t.forms.eventTitle}
            </h2>
            <p className="mt-3 text-navy-800/70">{t.forms.eventText}</p>
            <p className="mt-6 text-sm font-bold text-navy-700">
              <a href={`tel:${site.phones.sales[0].replace(/\s+/g, "")}`} className="hover:underline">
                {site.phones.sales[0]}
              </a>
              <br />
              <span className="font-normal text-navy-800/70">{site.salesHours[locale]}</span>
            </p>
          </div>
          <EventForm locale={locale} t={t.forms} privacyHref={privacyHref(locale)} />
        </div>
      </section>
    </>
  );
}

export function LoyaltyTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <PageHero title={d.title} kicker="Velence Resort & Spa Prémium Klub" intro={loyalty.intro[locale]} image={getPage("hotel-intro")?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy-700 via-navy-600 to-lake-500 p-10 text-white shadow-lift">
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-xl" />
            <Crown className="size-10 text-gold-400" aria-hidden="true" />
            <p className="mt-6 font-display text-7xl">
              {loyalty.welcomePoints.toLocaleString(locale === "hu" ? "hu-HU" : "en-GB")}
            </p>
            <p className="mt-2 text-lg text-white/85">{locale === "hu" ? "bónuszpont azonnal a regisztráció után" : "bonus points right after registration"}</p>
            <ButtonLink href={site.booking.register} variant="light" className="mt-8">
              {locale === "hu" ? "Regisztrálok" : "Sign up"}
            </ButtonLink>
          </Reveal>
          <ul className="space-y-3">
            {loyalty.benefits[locale].map((b, i) => (
              <Reveal as="li" key={b} delay={i * 70} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-100">
                <Star className="mt-0.5 size-5 shrink-0 fill-gold-400 text-gold-400" aria-hidden="true" />
                <span className="font-semibold text-navy-800">{b}</span>
              </Reveal>
            ))}
          </ul>
        </div>
        <h2 className="mt-24 text-center font-display text-4xl text-navy-700">{locale === "hu" ? "A Prémium Klub szintjei" : "Premium Club levels"}</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {loyalty.tiers.map((tier, i) => (
            <Reveal as="li" key={tier.id} delay={i * 120} className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-soft ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-lift">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2" style={{ background: tier.color }} />
              <span className="mx-auto grid size-16 place-items-center rounded-full text-white shadow-soft" style={{ background: tier.color }}>
                <Crown className="size-8" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl uppercase tracking-wide text-navy-700">{tier.name[locale]}</h3>
              <p className="mt-1 text-sm font-bold text-navy-800/60">{tier.requirement[locale]}</p>
              <p className="mt-6 font-display text-6xl text-navy-700">{tier.discount}%</p>
              <p className="text-sm text-navy-800/70">{locale === "hu" ? "kedvezmény a foglalás végösszegéből" : "off the total of your booking"}</p>
              <p className="mt-4 rounded-2xl bg-sand-100 p-3 text-sm text-navy-800/80">
                {locale === "hu" ? `Pontjaid a végösszeg ${tier.pointsCap}%-áig beválthatók · 100 Ft = 1 pont` : `Redeem points up to ${tier.pointsCap}% of the total · HUF 100 = 1 point`}
              </p>
            </Reveal>
          ))}
        </ol>
      </section>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

const ASPECTS: { i: number; hu: string; en: string }[] = [
  { i: 0, hu: "Foglalás egyszerűsége", en: "Ease of booking" },
  { i: 2, hu: "Recepció", en: "Reception" },
  { i: 3, hu: "Szoba tisztasága", en: "Room cleanliness" },
  { i: 8, hu: "Reggeli választék", en: "Breakfast choice" },
  { i: 11, hu: "Vacsora minősége", en: "Dinner quality" },
  { i: 16, hu: "Wellness részleg", en: "Wellness area" },
  { i: 17, hu: "Szaunavilág", en: "Sauna world" },
  { i: 18, hu: "Masszázs, kozmetika", en: "Massage & beauty" },
  { i: 19, hu: "Animátorok kedvessége", en: "Kindness of animators" },
  { i: 21, hu: "Animációs programok", en: "Kids' programmes" },
  { i: 24, hu: "Hangulat", en: "Atmosphere" },
  { i: 25, hu: "Személyzet kedvessége", en: "Staff friendliness" },
];

export function ReviewsTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale] ?? page.hu!;
  const c = 2 * Math.PI * 54;
  return (
    <>
      <PageHero title={d.title} kicker={d.subtitle} image={getPage("family")?.image} crumbs={crumbsFor(page.id, locale)} />
      <section className="container-page grid gap-12 py-20 lg:grid-cols-[20rem_1fr]">
        <Reveal className="rounded-[2rem] bg-navy-700 p-8 text-center text-white shadow-lift lg:sticky lg:top-28 lg:self-start">
          <div className="relative mx-auto size-40">
            <svg viewBox="0 0 120 120" className="-rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-gold-400)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - reviews.average / 5)} />
            </svg>
            <p className="absolute inset-0 grid place-items-center font-display text-5xl">{reviews.average.toLocaleString(locale === "hu" ? "hu-HU" : "en-GB")}</p>
          </div>
          <div className="mt-4 flex justify-center">
            <Stars value={reviews.average} size="size-5" />
          </div>
          <p className="mt-2 text-white/80">{locale === "hu" ? `${reviews.count.toLocaleString("hu-HU")} vendégértékelés alapján` : `based on ${reviews.count.toLocaleString("en-GB")} guest reviews`}</p>
          <ul className="mt-8 space-y-3 text-left text-sm">
            {ASPECTS.map((a) => {
              const s = reviews.aspects[a.i]?.score ?? 0;
              return (
                <li key={a.i}>
                  <div className="flex justify-between font-bold">
                    <span>{a[locale]}</span>
                    <span>{s.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15" role="presentation">
                    <div className="h-full rounded-full bg-gradient-to-r from-lake-300 to-gold-400" style={{ width: `${(s / 5) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
        <div>
          <h2 className="font-display text-3xl text-navy-700">{t.home.testimonialsTitle}</h2>
          {locale === "en" && <p className="mt-2 text-sm text-navy-800/60">Reviews are shown in their original language (Hungarian).</p>}
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {reviews.reviews.map((r, i) => (
              <Reveal as="li" key={i} delay={(i % 2) * 80} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-3 py-1 text-sm font-extrabold text-navy-800">
                    <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" /> {r.score.toFixed(1)}
                    <span className="sr-only">/ 5</span>
                  </span>
                  <span className="text-xs font-bold text-navy-800/50">{r.category}</span>
                </div>
                <Quote className="mt-4 size-6 text-lake-300" aria-hidden="true" />
                <p className="mt-2 font-semibold leading-relaxed text-navy-800" lang="hu">
                  {r.title}
                </p>
                {r.text && (
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-navy-800/70" lang="hu">
                    {r.text}
                  </p>
                )}
                <p className="mt-4 text-sm font-bold text-navy-700">
                  {r.name} · <time dateTime={r.date}>{formatDate(r.date, locale)}</time>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <BookingBand t={t} section="hotel" />
    </>
  );
}

export async function PricesTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  const prices = await getPrices();
  const info = d.blocks.filter((b): b is Extract<Block, { type: "faq" }> => b.type === "faq").slice(0, 1);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PublicSwimmingPool",
          name: "Velence Spa",
          openingHours: `Mo-Su ${site.spaHours.open}-${site.spaHours.close}`,
          telephone: site.phones.spa,
          address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressCountry: "HU" },
          makesOffer: prices.tables[0].rows
            .filter((r) => r.prices[0])
            .map((r) => ({ "@type": "Offer", name: `${prices.tables[0].title[locale]} – ${r.label[locale]}`, price: r.prices[0], priceCurrency: "HUF" })),
        }}
      />
      <PageHero title={d.title} kicker={d.subtitle} image={getPage("pools")?.image} crumbs={crumbsFor(page.id, locale)} tone="spa" />
      <section className="container-page relative z-10 -mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-navy-100">
            <Clock className="size-8 text-spa-500" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl text-navy-700">{t.spa.hoursTitle}</h2>
            <p className="mt-1 font-bold text-navy-800">{prices.hours[locale].spa}</p>
            <div className="mt-3">
              <OpenStatus open={site.spaHours.open} close={site.spaHours.close} labels={{ openNow: t.common.openNow, closedNow: t.common.closedNow, opensAt: t.common.opensAt, closesAt: t.common.closesAt }} />
            </div>
          </Reveal>
          <Reveal delay={80} className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-navy-100">
            <Ticket className="size-8 text-spa-500" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl text-navy-700">{locale === "hu" ? "Pénztár" : "Ticket office"}</h2>
            <p className="mt-1 font-bold text-navy-800">{prices.hours[locale].cashier}</p>
            <p className="mt-3 text-sm text-navy-800/70">{t.spa.ticketsFrom}</p>
          </Reveal>
          <Reveal delay={160} className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-navy-100">
            <CreditCard className="size-8 text-spa-500" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl text-navy-700">{locale === "hu" ? "Kiemelt időszakok" : "Peak periods"}</h2>
            <ul className="mt-1 space-y-1 font-bold text-navy-800">
              {prices.peakPeriods.map((p) => (
                <li key={p.from}>{formatDateRange(p.from, p.to, locale)}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="container-page py-20" aria-labelledby="prices-h">
        <h2 id="prices-h" className="font-display text-4xl text-navy-700">
          {t.spa.priceListTitle}
        </h2>
        <p className="mt-2 text-navy-800/70">
          {locale === "hu" ? "Érvényes" : "Valid from"} {formatDate(prices.validFrom, locale)}
          {locale === "hu" ? "-tól visszavonásig, kivéve kiemelt időszakok." : " until further notice, except peak periods."}
        </p>
        <div className="mt-10 grid gap-8 xl:grid-cols-3">
          {prices.tables.map((tbl, i) => (
            <Reveal key={tbl.id} delay={i * 100} className="overflow-hidden rounded-[2rem] bg-white shadow-soft ring-1 ring-navy-100">
              <table className="w-full text-left text-sm">
                <caption className={`px-6 py-5 text-left font-display text-xl ${tbl.id === "peak" ? "bg-spa-500 text-white" : "bg-navy-700 text-white"}`}>{tbl.title[locale]}</caption>
                <thead className="bg-lake-50 text-xs uppercase tracking-wider text-navy-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">{locale === "hu" ? "Jegytípus" : "Ticket type"}</span>
                    </th>
                    {tbl.columns[locale].map((c) => (
                      <th key={c} scope="col" className="px-3 py-3 text-right">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tbl.rows.map((r) => (
                    <tr key={r.label.hu} className={`border-t border-navy-100 ${r.highlight ? "bg-gold-400/10" : ""}`}>
                      <th scope="row" className="px-6 py-3.5 font-semibold text-navy-800">
                        {r.label[locale]}
                      </th>
                      {r.prices.map((p, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-3.5 text-right font-extrabold text-navy-700">
                          {p === null ? "–" : p === 0 ? (locale === "hu" ? "ingyenes" : "free") : formatPrice(p, locale)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          ))}
        </div>
        <ul className="mt-10 space-y-2 rounded-3xl bg-sand-100 p-6 text-sm leading-relaxed text-navy-800/80">
          {prices.notes[locale].map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={site.booking.voucher} variant="spa">
            {t.nav.voucher}
          </ButtonLink>
          <ButtonLink href={hrefOrFallback("treatments", locale)} variant="outline">
            {t.spa.treatmentsTitle}
          </ButtonLink>
        </div>
      </section>
      {info.length > 0 && (
        <section className="container-page max-w-4xl pb-20">
          <h2 className="mb-6 font-display text-3xl text-navy-700">{locale === "hu" ? "Jó, ha tudod!" : "Good to know"}</h2>
          <FaqList groups={info[0].groups.map((g) => ({ ...g, title: "" }))} />
        </section>
      )}
    </>
  );
}

export function LegalTemplate({ page, locale, t }: TemplateProps) {
  const d = page[locale]!;
  return (
    <>
      <section className="bg-navy-800 pb-14 pt-[calc(var(--header-h)+3rem)] text-white">
        <div className="container-page max-w-4xl">
          <nav aria-label={t.a11y.breadcrumb} className="text-sm text-white/70">
            <Link href={`/${locale}`} className="hover:underline">
              {t.nav.home}
            </Link>{" "}
            / <span aria-current="page">{d.title}</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">{d.title}</h1>
        </div>
      </section>
      <div className="container-page max-w-4xl py-16">
        {d.blocks.map((b, i) => (b.type === "html" ? <Html key={i} html={b.html} /> : null))}
        {d.pdfs && d.pdfs.length > 0 && <Documents pdfs={d.pdfs} label={t.common.download} />}
      </div>
    </>
  );
}
