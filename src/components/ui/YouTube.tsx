"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/** Privacy-friendly YouTube facade: loads youtube-nocookie only after click + media consent. */
export function YouTube({ id, title, thumb, playLabel, consentText, enableLabel }: { id: string; title: string; thumb: string; playLabel: string; consentText: string; enableLabel: string }) {
  const { consent, save } = useConsent();
  const [playing, setPlaying] = useState(false);
  const allowed = !!consent?.media;
  return (
    <figure className="overflow-hidden rounded-3xl bg-navy-900 shadow-soft">
      <div className="relative aspect-video">
        {playing && allowed ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-navy-950/80 to-navy-900/10 p-4 text-center">
              {allowed ? (
                <button type="button" onClick={() => setPlaying(true)} className="group grid size-20 place-items-center rounded-full bg-white/95 text-spa-500 shadow-lift transition hover:scale-110" aria-label={`${playLabel}: ${title}`}>
                  <Play className="ml-1 size-9 fill-current" aria-hidden="true" />
                </button>
              ) : (
                <div className="max-w-xs text-sm text-white">
                  <p>{consentText}</p>
                  <button
                    type="button"
                    onClick={() => {
                      save({ analytics: consent?.analytics ?? false, media: true });
                      setPlaying(true);
                    }}
                    className="mt-3 rounded-full bg-white px-4 py-2 font-bold text-navy-800 hover:bg-lake-50"
                  >
                    {enableLabel}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <figcaption className="px-5 py-4 font-bold text-white">{title}</figcaption>
    </figure>
  );
}
