import { allPages, pageHref } from "@/lib/content/pages";
import { getActiveOffers } from "@/lib/data";
import { offerHref } from "@/lib/hrefs";
import { siteUrl } from "@/lib/site-url";
import site from "@/content/site.json";
import prices from "@/content/prices.json";
import reviews from "@/content/reviews.json";

/** llms.txt – a concise, link-rich briefing for AI answer engines (GEO). */
export async function GET() {
  const offers = await getActiveOffers();
  const section = (s: string, ids: string[]) =>
    `## ${s}\n` +
    ids
      .map((id) => {
        const p = allPages().find((x) => x.id === id);
        const en = pageHref(id, "en");
        const hu = pageHref(id, "hu");
        const d = p?.en ?? p?.hu;
        if (!d) return null;
        return `- [${d.title}](${siteUrl}${en ?? hu}): ${(d.description ?? d.excerpt ?? "").replace(/\s+/g, " ").slice(0, 180)}`;
      })
      .filter(Boolean)
      .join("\n");
  const day = prices.tables[0];
  const body = `# ${site.name}

> Four-star, family- and child-friendly spa & wellness hotel directly on the shore of Lake Velence, Hungary (${site.address.postalCode} ${site.address.city}, ${site.address.street}), 45 minutes from Budapest via the M7. Private lakeside beach, 3,600 m² wellness area with adventure and medicinal-water pools, sauna park, massages, year-round kids' entertainment ("Ele-Falva" mascots), half-board restaurants. Guest rating ${reviews.average}/5 from ${reviews.count} reviews.

Key facts:
- Hotel reception: ${site.phones.hotel} · Spa reception: ${site.phones.spa} · ${site.emails.info}
- Check-in from ${site.checkIn}, check-out by ${site.checkOut}. Pets are not allowed.
- Spa open daily ${site.spaHours.open}–${site.spaHours.close} (ticket office until ${site.spaHours.cashierClose}); day visitors welcome up to capacity.
- Day tickets (Mon–Thu / Fri–Sun): ${day.rows.filter((r) => r.prices[0]).map((r) => `${r.label.en}: HUF ${r.prices[0]} / ${r.prices[1] ?? "–"}`).join("; ")}.
- Booking: ${site.booking.search} · Gift vouchers: ${site.booking.voucher}
- Languages: Hungarian (${siteUrl}/hu) and English (${siteUrl}/en).

${section("Hotel", ["hotel-intro", "rooms", "family", "kids", "animation", "gastro", "restaurants", "half-board", "events", "loyalty"])}

${section("Spa & wellness", ["spa", "pools", "saunas", "treatments", "massages", "lakeside", "prices"])}

${section("Practical information", ["faq", "guest-info", "contact", "sights"])}

## Current offers
${offers.map((o) => `- [${o.en.title}](${siteUrl}${offerHref(o, "en")}): ${o.validFrom ?? ""}–${o.validTo ?? ""}, from HUF ${o.priceFrom ?? "?"} per person/night, min. ${o.minNights ?? 1} nights.`).join("\n")}

## Optional
- [Sitemap](${siteUrl}/sitemap.xml)
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
