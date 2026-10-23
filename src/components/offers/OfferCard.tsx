import Link from "next/link";
import { CalendarRange, Moon } from "lucide-react";
import { Img } from "@/components/ui/Img";
import type { Offer } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { formatDateRange, formatPrice } from "@/lib/i18n/format";
import { offerHref } from "@/lib/hrefs";
import { OfferStatus } from "./OfferStatus";

export function OfferCard({ offer, locale, t, priority }: { offer: Offer; locale: Locale; t: Dictionary; priority?: boolean }) {
  const d = offer[locale];
  return (
    <article className="group relative isolate flex aspect-[3/4] h-full flex-col justify-end overflow-hidden rounded-[2rem] bg-navy-800 text-white shadow-soft transition duration-500 ease-out-expo hover:-translate-y-1.5 hover:shadow-lift">
      <div className="absolute inset-0 -z-10">
        <Img src={offer.image} alt="" fill priority={priority} sizes="(min-width:1280px) 25vw, (min-width:768px) 40vw, 85vw" className="transition duration-[1.4s] ease-out-expo group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />
      </div>
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <OfferStatus from={offer.validFrom} to={offer.validTo} labels={{ ongoing: t.offers.ongoing, upcoming: t.offers.upcoming, countdown: t.offers.countdown, days: t.offers.days }} />
      </div>
      <div className="p-6">
        {offer.validFrom && offer.validTo && (
          <p className="flex items-center gap-2 text-sm font-bold text-lake-200">
            <CalendarRange className="size-4" aria-hidden="true" />
            {formatDateRange(offer.validFrom, offer.validTo, locale)}
          </p>
        )}
        <h3 className="mt-2 font-display text-2xl leading-tight">
          <Link href={offerHref(offer, locale)} className="after:absolute after:inset-0">
            {d.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/80">{d.summary}</p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/20 pt-4">
          {offer.priceFrom ? (
            <p className="text-xs text-white/75">
              {locale === "en" && <span className="block">{t.offers.priceFrom}</span>}
              <span className="block whitespace-nowrap font-display text-2xl text-white">
                {formatPrice(offer.priceFrom, locale)}
                {locale === "hu" && <span className="text-base text-white/80">-tól</span>}
              </span>
              {t.offers.perPersonNight}
            </p>
          ) : (
            <span />
          )}
          {offer.minNights && (
            <p className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
              <Moon className="size-3.5" aria-hidden="true" /> min. {offer.minNights} {t.offers.nights}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
