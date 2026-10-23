"use client";

import { useEffect, useRef, useState } from "react";

/** Number that counts up once it scrolls into view (respects reduced motion). */
export function CountUp({ to, locale, duration = 1600 }: { to: number; locale: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref} aria-label={new Intl.NumberFormat(locale).format(to)}>
      <span aria-hidden="true">{new Intl.NumberFormat(locale).format(v)}</span>
    </span>
  );
}
