import type { MetadataRoute } from "next";
import { allPages, albums, albumHref, pageHref } from "@/lib/content/pages";
import { getAllOffers, getPublishedNews } from "@/lib/data";
import { offerHref, newsHref } from "@/lib/hrefs";
import { siteUrl } from "@/lib/site-url";
import { getImage, largestUrl } from "@/lib/images";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  const img = (src?: string | null) => {
    const e = getImage(src);
    return e ? [`${siteUrl}${largestUrl(e)}`] : undefined;
  };
  for (const p of allPages()) {
    const hu = pageHref(p.id, "hu");
    const en = pageHref(p.id, "en");
    const languages = { ...(hu ? { hu: `${siteUrl}${hu}` } : {}), ...(en ? { en: `${siteUrl}${en}` } : {}) };
    for (const h of [hu, en]) {
      if (!h) continue;
      out.push({
        url: `${siteUrl}${h}`,
        changeFrequency: p.template === "home" || p.template === "offers" || p.template === "prices" ? "daily" : "monthly",
        priority: p.template === "home" ? 1 : p.parent ? 0.6 : 0.8,
        alternates: { languages },
        images: img(p.image),
      });
    }
  }
  for (const o of await getAllOffers()) {
    if (!o.published) continue;
    const languages = { hu: `${siteUrl}${offerHref(o, "hu")}`, en: `${siteUrl}${offerHref(o, "en")}` };
    for (const l of ["hu", "en"] as const) out.push({ url: `${siteUrl}${offerHref(o, l)}`, changeFrequency: "weekly", priority: 0.7, alternates: { languages }, images: img(o.image) });
  }
  for (const n of await getPublishedNews()) {
    out.push({ url: `${siteUrl}${newsHref(n, "hu")}`, lastModified: n.date, changeFrequency: "yearly", priority: 0.4, images: img(n.image) });
    if (n.en) out.push({ url: `${siteUrl}${newsHref(n, "en")}`, lastModified: n.date, changeFrequency: "yearly", priority: 0.4 });
  }
  for (const a of albums) for (const l of ["hu", "en"] as const) out.push({ url: `${siteUrl}${albumHref(a, l)}`, changeFrequency: "monthly", priority: 0.3 });
  return out;
}
