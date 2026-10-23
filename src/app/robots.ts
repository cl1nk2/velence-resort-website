import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.ALLOW_INDEXING === "1";
  return {
    rules: indexable ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
