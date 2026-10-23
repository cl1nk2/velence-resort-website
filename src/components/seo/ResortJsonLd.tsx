import site from "@/content/site.json";
import reviews from "@/content/reviews.json";
import type { Locale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import { ogImageUrl } from "@/lib/images";
import home from "@/content/home.json";
import { JsonLd } from "./JsonLd";

/** Rich Resort/Hotel entity for search engines and AI answer engines (GEO). */
export function ResortJsonLd({ locale }: { locale: Locale }) {
  const t = getDictionarySync(locale);
  const img = home.slides.map((s) => ogImageUrl(s.image)).filter(Boolean).map((u) => `${siteUrl}${u}`);
  const amenity = (name: string) => ({ "@type": "LocationFeatureSpecification", name, value: true });
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["Resort", "Hotel"],
        "@id": `${siteUrl}/#resort`,
        name: site.name,
        description: t.meta.defaultDescription,
        url: `${siteUrl}/${locale}`,
        image: img,
        logo: `${siteUrl}/icon.png`,
        telephone: site.phones.hotel,
        email: site.emails.info,
        priceRange: "$$",
        currenciesAccepted: "HUF",
        paymentAccepted: "Credit card, SZÉP card",
        starRating: { "@type": "Rating", ratingValue: site.stars },
        checkinTime: site.checkIn,
        checkoutTime: site.checkOut,
        petsAllowed: false,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.postalCode,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${site.geo.lat},${site.geo.lng}`,
        sameAs: Object.values(site.social),
        aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average, reviewCount: reviews.count, bestRating: 5, worstRating: 1 },
        amenityFeature: (locale === "hu"
          ? ["Élményfürdő", "Gyógyvizes medence", "Szaunapark", "Saját strand", "Gyermekfelügyelet", "Animációs programok", "Étterem", "Ingyenes Wi-Fi", "Parkoló"]
          : ["Adventure pool", "Medicinal water pool", "Sauna park", "Private beach", "Childcare", "Kids' entertainment", "Restaurant", "Free Wi-Fi", "Parking"]
        ).map(amenity),
        containsPlace: { "@type": "PublicSwimmingPool", name: "Velence Spa", openingHours: `Mo-Su ${site.spaHours.open}-${site.spaHours.close}`, telephone: site.phones.spa },
        potentialAction: { "@type": "ReserveAction", target: site.booking.search },
      }}
    />
  );
}
