import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Facebook, Instagram, TikTok, Youtube } from "@/components/brand/Social";
import { Logo } from "@/components/brand/Logo";
import { ConsentSettingsButton } from "@/components/consent/ConsentBanner";
import site from "@/content/site.json";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { getFooterNav } from "@/lib/nav";
import { hrefOrFallback } from "@/lib/content/pages";

async function Year() {
  "use cache";
  return new Date().getFullYear();
}

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nav = getFooterNav(locale);
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;
  const socials = [
    { href: site.social.instagram, label: "Instagram", Icon: Instagram },
    { href: site.social.facebook, label: "Facebook", Icon: Facebook },
    { href: site.social.youtube, label: "YouTube", Icon: Youtube },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTok },
  ];
  return (
    <footer className="relative mt-24 overflow-hidden bg-navy-900 text-white/80">
      <div aria-hidden="true" className="wave-mask absolute inset-x-0 -top-px h-12 rotate-180 bg-sand-50" />
      <div className="container-page grid gap-12 pb-10 pt-24 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href={`/${locale}`} aria-label={t.nav.home}>
            <Logo className="h-14 w-auto text-white" />
          </Link>
          <p className="mt-4 font-script text-3xl text-lake-200">{t.meta.slogan}</p>
          <address className="mt-6 space-y-3 not-italic">
            <a className="flex items-start gap-3 hover:text-white" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Velence Resort & Spa, Velence, Béke u. 57")}`} target="_blank" rel="noopener">
              <MapPin className="mt-0.5 size-5 shrink-0 text-lake-300" aria-hidden="true" />
              <span>
                H-{site.address.postalCode} {site.address.city}, {site.address.street}
                <span className="sr-only"> {t.a11y.opensInNewTab}</span>
              </span>
            </a>
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-lake-300" aria-hidden="true" />
              <span>
                {t.footer.hotelReception}:{" "}
                <a className="font-bold text-white hover:underline" href={tel(site.phones.hotel)}>
                  {site.phones.hotel}
                </a>
                <br />
                {t.footer.spaReception}:{" "}
                <a className="font-bold text-white hover:underline" href={tel(site.phones.spa)}>
                  {site.phones.spa}
                </a>
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-lake-300" aria-hidden="true" />
              <a className="font-bold text-white hover:underline" href={`mailto:${site.emails.info}`}>
                {site.emails.info}
              </a>
            </p>
          </address>
          <ul className="mt-6 flex gap-2" aria-label={t.footer.follow}>
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener" className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-lake-400">
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="sr-only">
                    {label} {t.a11y.opensInNewTab}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label={t.footer.quickLinks}>
          <h2 className="font-display text-lg text-white">{t.footer.quickLinks}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-1">
            {nav.main.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <nav aria-label={t.footer.legal}>
            <h2 className="font-display text-lg text-white">{t.footer.legal}</h2>
            <ul className="mt-4 space-y-2">
              {nav.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <ConsentSettingsButton label={t.consent.manage} />
              </li>
            </ul>
          </nav>
          <Link href={hrefOrFallback("grants", locale)} className="mt-8 inline-block rounded-xl bg-white p-2" aria-label="Széchenyi 2020">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/szechenyi2020.png" alt="Széchenyi 2020 – Európai Unió, Magyarország Kormánya" width={160} height={111} loading="lazy" className="h-20 w-auto" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <Year /> Velence Resort & Spa<sup>****</sup> · {t.footer.rights}
          </p>
          <p className="font-bold text-gold-400">{t.footer.showcase}</p>
        </div>
      </div>
    </footer>
  );
}
