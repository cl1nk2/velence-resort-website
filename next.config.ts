import type { NextConfig } from "next";
import urlmap from "./src/content/urlmap.json";

/** 308 redirects from the old site's paths (now locale-prefixed) to the new slugs. */
function legacyRedirects() {
  // Never redirect a path that is a live page on the new site (e.g. the locale roots).
  const live = new Set(Object.values(urlmap as Record<string, string>));
  const seen = new Set<string>();
  const out: { source: string; destination: string; permanent: true }[] = [];
  for (const [oldUrl, target] of Object.entries(urlmap as Record<string, string>)) {
    let path: string;
    try {
      path = new URL(oldUrl).pathname.replace(/\/$/, "");
    } catch {
      continue;
    }
    const source = path.startsWith("/en/") || path === "/en" ? path : `/hu${path}`;
    if (!source || source === target || live.has(source) || seen.has(source) || /[^\w\-/]/.test(source)) continue;
    seen.add(source);
    out.push({ source, destination: target, permanent: true });
  }
  return out;
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return legacyRedirects();
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
