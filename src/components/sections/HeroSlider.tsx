"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Pause, Play } from "lucide-react";
import { openBooking } from "@/components/booking/events";

export type Slide = { src: string; srcSet: string; blur?: string; title: string; text: string; cta: string; href: string | null };

/** Full-bleed crossfading hero with Ken Burns motion, pausable for accessibility (WCAG 2.2.2). */
export function HeroSlider({
  slides,
  labels,
  kicker,
  children,
}: {
  slides: Slide[];
  labels: { pause: string; play: string; slide: string; of: string };
  kicker: string;
  children?: ReactNode;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) setPaused(true);
  }, []);

  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || hover) return;
    const id = setTimeout(() => go(i + 1), 7000);
    return () => clearTimeout(id);
  }, [i, paused, hover, go]);

  const s = slides[i];
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-navy-900 text-white"
      aria-roledescription="carousel"
      aria-label={kicker}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      {slides.map((sl, n) => (
        <div
          key={sl.src}
          aria-hidden={n !== i}
          className={clsx("absolute inset-0 -z-10 transition-opacity duration-[1400ms] ease-out", n === i ? "opacity-100" : "opacity-0")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sl.src}
            srcSet={sl.srcSet}
            sizes="100vw"
            alt=""
            className={clsx("h-full w-full object-cover", n === i && "animate-ken-burns")}
            fetchPriority={n === 0 ? "high" : "low"}
            loading={n === 0 ? "eager" : "lazy"}
            style={sl.blur ? { backgroundImage: `url(${sl.blur})`, backgroundSize: "cover" } : undefined}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/35 to-navy-950/50" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_80%,rgba(26,77,114,.55),transparent_60%)]" />

      <div className="container-page flex min-h-[100svh] flex-col justify-end pb-10 pt-[calc(var(--header-h)+2rem)]">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_22rem]">
          <div aria-live={paused ? "polite" : "off"} aria-atomic="true">
            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-lake-200">{kicker}</p>
            <h1 key={`h${i}`} className="mt-4 max-w-4xl animate-[fadeIn_.9s_ease-out] font-display text-5xl leading-[1.02] text-balance drop-shadow sm:text-6xl lg:text-7xl">
              {s.title}
            </h1>
            <p key={`p${i}`} className="mt-5 max-w-xl animate-[fadeIn_1.1s_ease-out] text-lg text-white/90 sm:text-xl">
              {s.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {s.href ? (
                <Link href={s.href} className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-extrabold text-navy-800 shadow-lift transition hover:bg-lake-50">
                  {s.cta}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ) : (
                <button type="button" onClick={() => openBooking()} className="group inline-flex items-center gap-2 rounded-full bg-spa-500 px-7 py-3.5 font-extrabold text-white shadow-lift transition hover:bg-spa-600">
                  {s.cta}
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="hidden lg:block">{children}</div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
            aria-label={paused ? labels.play : labels.pause}
          >
            {paused ? <Play className="size-4 fill-current" aria-hidden="true" /> : <Pause className="size-4 fill-current" aria-hidden="true" />}
          </button>
          <ol className="flex flex-1 gap-2">
            {slides.map((sl, n) => (
              <li key={sl.src} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(n)}
                  aria-label={`${n + 1} ${labels.of} ${slides.length}: ${sl.title}`}
                  aria-current={n === i ? "true" : undefined}
                  className="group block w-full py-3"
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-white/25">
                    <span
                      className={clsx("block h-full rounded-full bg-white", n === i && !paused && !hover ? "animate-[progress_7s_linear_forwards]" : n === i ? "w-full" : "w-0")}
                    />
                  </span>
                  <span className="mt-2 hidden truncate text-left text-xs font-bold text-white/70 group-hover:text-white md:block">{sl.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
