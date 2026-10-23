# Velence Resort & Spa – modernised website (showcase)

A modern, bilingual (HU/EN) rebuild of [velencespa.com](https://velencespa.com), unifying the portal,
the hotel (`hotel.velencespa.com`) and the spa (`furdo.velencespa.com`) into one fast site.

> Showcase build – not the official website. Search indexing is disabled unless `ALLOW_INDEXING=1`.

## Stack

- **Next.js 16** (App Router, Cache Components, Partial Prerendering, `proxy.ts`) on Vercel Hobby
- **Tailwind CSS v4** design tokens (hotel navy, lake blue, spa magenta), Nunito / Varela Round / brand script font
- **Neon Postgres + Drizzle** (optional): offers, news, spa prices, announcement banner, form submissions, rate limits
- **BFF only** – server actions and two route handlers (`/api/chat`, `/llms.txt`); no separate backend
- Pre-optimised responsive WebP images (`public/img`, manifest in `src/content/images.json`) – no runtime image quota

## Features

- Unified IA with mega menu, localised slugs, hreflang alternates and 308 redirects from the old URLs
- Booking widget (dates, guests, children's ages) handing off to the resort's booking engine
- Offers & news from the database (falls back to bundled seed content when no DB is configured)
- Live spa "open now" status, lake weather (Open-Meteo), animated stats, carousels, lightbox galleries
- Rooms comparison, pool/sauna facts, searchable FAQ, reviews with rating breakdown, loyalty tiers
- Forms (contact, event RFQ, newsletter) with validation, honeypot, timing trap and Postgres-backed rate limiting
- FAQ assistant: keyword (BM25) retrieval over the site's own content – no LLM costs
- Own cookie consent (analytics + embedded media), Vercel Analytics/Speed Insights only after consent
- SEO/GEO: JSON-LD (Resort/Hotel, HotelRoom, Offer, FAQPage, BlogPosting, Breadcrumbs, …), sitemap with
  image + language alternates, `llms.txt`, OpenGraph
- Accessibility: skip link, landmarks, focus styles, reduced-motion support, pausable slideshow,
  keyboard-operable menus/dialogs, `<details>` accordions, labelled forms
- `/admin` (single password): edit offers, news, prices, banner; view submissions and subscribers

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string (added automatically by the Vercel ↔ Neon integration). Without it the site serves the bundled content read-only. Any non-Neon Postgres URL works too (TCP driver). |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | ≥32 random characters used to sign the admin session |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (optional, defaults to the Vercel production URL) |
| `ALLOW_INDEXING` | Set to `1` to allow search engines |

## Scripts

```bash
npm run dev          # local dev
npm run build        # prebuild creates tables + seeds the DB if DATABASE_URL is set, then builds
npm run db:setup     # same schema/seed step on its own (idempotent)
npm run images -- <download-dir>   # regenerate responsive WebP variants + manifest
```

Content was migrated from the original sites (with permission) by a throttled crawler; the
extraction/cleanup scripts live outside the repo, the image pipeline is `scripts/process-images.mjs`.

## Quality checks (local, production build)

- axe-core (WCAG 2.2 AA rules): 0 violations on 20 sampled HU/EN pages
- Lighthouse desktop: performance 95–98, accessibility 100, best practices 100
- Lighthouse mobile (simulated slow 4G): performance ~72–85, accessibility 100
- SEO category reports 69 only because indexing is intentionally disabled (`noindex` + `robots.txt`) for the showcase
