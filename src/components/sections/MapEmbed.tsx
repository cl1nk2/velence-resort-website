"use client";

import { MapPin } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/** OpenStreetMap embed, loaded only with media consent; a static fallback otherwise. */
export function MapEmbed({ lat, lng, title, consentText, enableLabel }: { lat: number; lng: number; title: string; consentText: string; enableLabel: string }) {
  const { consent, save } = useConsent();
  const d = 0.012;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 1.6}%2C${lat - d}%2C${lng + d * 1.6}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-lake-100 shadow-soft ring-1 ring-navy-100 lg:aspect-auto lg:h-full lg:min-h-[26rem]">
      {consent?.media ? (
        <iframe title={title} src={src} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_45%,var(--color-lake-200),var(--color-lake-100)_40%,var(--color-sand-100))] p-6 text-center">
          <div>
            <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-spa-500 text-white shadow-lift">
              <span className="absolute inset-0 animate-ripple rounded-full bg-spa-500/50" aria-hidden="true" />
              <MapPin className="size-8" aria-hidden="true" />
            </span>
            <p className="mx-auto mt-5 max-w-xs text-sm text-navy-800/80">{consentText}</p>
            <button type="button" onClick={() => save({ analytics: consent?.analytics ?? false, media: true })} className="mt-3 rounded-full bg-navy-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-700">
              {enableLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
