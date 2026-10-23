import type { Metadata, Viewport } from "next";
import { Nunito, Varela_Round } from "next/font/google";
import localFont from "next/font/local";
import "../../globals.css";
import { locales, ogLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getMainNav } from "@/lib/nav";
import { getAlternateMap } from "@/lib/alternates";
import { getPage, hrefOrFallback } from "@/lib/content/pages";
import { getImage, srcSet, variantUrl } from "@/lib/images";
import { siteUrl } from "@/lib/site-url";
import site from "@/content/site.json";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ChatWidget } from "@/components/chat/ChatWidget";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito", display: "swap" });
const varela = Varela_Round({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-varela", display: "swap" });
const script = localFont({ src: "../../../fonts/abovethesky.woff2", variable: "--font-script", display: "optional", preload: true });

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.defaultTitle, template: `%s | ${t.meta.siteName}` },
    description: t.meta.defaultDescription,
    applicationName: t.meta.siteName,
    openGraph: { siteName: t.meta.siteName, locale: ogLocales[locale], type: "website" },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
    // Showcase build: keep it out of search indexes until it replaces the live site.
    robots: process.env.ALLOW_INDEXING === "1" ? undefined : { index: false, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#1a4d72",
  colorScheme: "light",
};

export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getDictionary();
  const nav = getMainNav(locale);
  const alternates = await getAlternateMap(locale);
  const images: Record<string, { src: string; srcSet: string } | null> = {};
  for (const g of nav) {
    const e = getImage(g.image);
    images[g.id] = e ? { src: variantUrl(e, e.widths[0]), srcSet: srcSet(e) } : null;
  }
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    sameAs: Object.values(site.social),
    contactPoint: [
      { "@type": "ContactPoint", telephone: site.phones.hotel, contactType: "reservations", availableLanguage: ["hu", "en"] },
      { "@type": "ContactPoint", telephone: site.phones.spa, contactType: "customer service", areaServed: "HU" },
    ],
  };
  return (
    <html lang={locale} className={`${nunito.variable} ${varela.variable} ${script.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, "\\u003c") }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ConsentProvider>
          <a href="#main" className="sr-only z-[100] rounded-full bg-navy-700 px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            {t.a11y.skipToContent}
          </a>
          <AnnouncementBar locale={locale} />
          <Header
            locale={locale}
            nav={nav}
            alternates={alternates}
            t={{ nav: t.nav, a11y: t.a11y }}
            images={images}
            links={{
              voucher: site.booking.voucher,
              loyalty: hrefOrFallback("loyalty", locale),
              prices: hrefOrFallback("prices", locale),
              home: `/${locale}`,
            }}
          />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={locale} t={t} />
          <BookingDialog t={t.booking} closeLabel={t.a11y.close} />
          <ConsentBanner t={t.consent} privacyHref={hrefOrFallback("privacy", locale)} privacyLabel={getPage("privacy")?.[locale]?.title ?? "Privacy"} />
          <ChatWidget locale={locale} t={t.chat} closeLabel={t.a11y.close} />
          <BackToTop label={t.a11y.backToTop} />
        </ConsentProvider>
      </body>
    </html>
  );
}
