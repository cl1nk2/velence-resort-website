import { Star, Quote } from "lucide-react";
import reviews from "@/content/reviews.json";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";

type Review = { category: string; score: number; name: string; date: string; title: string; text: string };

export function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-gold-400 text-gold-400" : "text-white/30"}`} />
      ))}
    </span>
  );
}

/** Infinite marquee of real guest quotes (pauses on hover, static for reduced motion). */
export function Testimonials({ locale, label }: { locale: Locale; label: string }) {
  const list = (reviews.reviews as Review[]).map((r) => ({ ...r, title: r.title || r.text })).filter((r) => r.title.length > 20);
  const row = [...list, ...list];
  return (
    <div className="group relative overflow-hidden" role="region" aria-label={label}>
      <ul className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap">
        {row.map((r, i) => (
          <li key={i} aria-hidden={i >= list.length} className="w-[22rem] shrink-0 rounded-3xl bg-white/10 p-6 text-white ring-1 ring-white/15 backdrop-blur">
            <Quote className="size-7 text-lake-300" aria-hidden="true" />
            <p className="mt-3 line-clamp-5 leading-relaxed text-white/90">{r.title}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-bold">
                {r.name} <span className="font-normal text-white/60">· {formatDate(r.date, locale, { year: "numeric", month: "short" })}</span>
              </span>
              <span className="flex items-center gap-1">
                <Stars value={r.score} size="size-3.5" />
                <span className="sr-only">{r.score} / 5</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-navy-800 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-navy-800 to-transparent" />
    </div>
  );
}
