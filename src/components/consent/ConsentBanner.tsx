"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useConsent, type Consent } from "./ConsentProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";

type Props = { t: Dictionary["consent"]; privacyHref: string; privacyLabel: string };

export function ConsentBanner(props: Props) {
  const { open, save, consent } = useConsent();
  // Mounted fresh on every open, so the toggles start from the stored choice.
  return open ? <Banner {...props} save={save} consent={consent} /> : null;
}

function Banner({ t, privacyHref, privacyLabel, save, consent }: Props & { save: (c: Consent) => void; consent: Consent | null }) {
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? true);
  const [media, setMedia] = useState(consent?.media ?? true);
  const titleId = useId();

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-3xl bg-white p-5 text-navy-800 shadow-lift ring-1 ring-navy-100 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-lake-50 text-lake-500 sm:grid">
          <Cookie className="size-6" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 id={titleId} className="font-display text-xl text-navy-700">
            {t.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-navy-800/75">
            {t.text}{" "}
            <Link href={privacyHref} className="font-bold underline underline-offset-2">
              {privacyLabel}
            </Link>
          </p>
          {details && (
            <fieldset className="mt-4 space-y-3 rounded-2xl bg-sand-100 p-4 text-sm">
              <legend className="sr-only">{t.settings}</legend>
              <label className="flex gap-3">
                <input type="checkbox" checked disabled className="mt-1 size-4 accent-navy-600" />
                <span>
                  <strong>{t.necessary}</strong> – {t.necessaryDesc}
                </span>
              </label>
              <label className="flex gap-3">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 size-4 accent-navy-600" />
                <span>
                  <strong>{t.analytics}</strong> – {t.analyticsDesc}
                </span>
              </label>
              <label className="flex gap-3">
                <input type="checkbox" checked={media} onChange={(e) => setMedia(e.target.checked)} className="mt-1 size-4 accent-navy-600" />
                <span>
                  <strong>{t.media}</strong> – {t.mediaDesc}
                </span>
              </label>
            </fieldset>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => save({ analytics: true, media: true })} className="rounded-full bg-navy-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-navy-700">
              {t.acceptAll}
            </button>
            {details ? (
              <button type="button" onClick={() => save({ analytics, media })} className="rounded-full border-2 border-navy-600 px-5 py-2 text-sm font-extrabold text-navy-700 hover:bg-navy-50">
                {t.save}
              </button>
            ) : (
              <button type="button" onClick={() => setDetails(true)} className="rounded-full border-2 border-navy-200 px-5 py-2 text-sm font-extrabold text-navy-700 hover:bg-navy-50">
                {t.settings}
              </button>
            )}
            <button type="button" onClick={() => save({ analytics: false, media: false })} className="rounded-full px-4 py-2 text-sm font-bold text-navy-700 underline underline-offset-4 hover:bg-navy-50">
              {t.necessaryOnly}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ConsentSettingsButton({ label }: { label: string }) {
  const { reopen } = useConsent();
  return (
    <button type="button" onClick={reopen} className="hover:text-white hover:underline">
      {label}
    </button>
  );
}
