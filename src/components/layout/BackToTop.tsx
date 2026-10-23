"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUp } from "lucide-react";

/** Scroll-progress ring that doubles as a back-to-top button (as on the original site). */
export function BackToTop({ label }: { label: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  const c = 2 * Math.PI * 22;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className={clsx(
        "fixed bottom-5 left-5 z-40 grid size-12 place-items-center rounded-full bg-white text-navy-700 shadow-soft transition-all duration-500",
        p > 0.08 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="3" />
        <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-lake-400)" strokeWidth="3" strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round" />
      </svg>
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
