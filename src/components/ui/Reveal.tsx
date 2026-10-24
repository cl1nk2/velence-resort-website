"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import { useClientValue } from "@/lib/use-client-value";

/** Fades/slides children in when scrolled into view. Content is visible without JS. */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const observable = useClientValue(() => "IntersectionObserver" in window, true);
  const visible = seen || !observable;
  useEffect(() => {
    const el = ref.current;
    if (!el || !observable) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [observable]);
  return (
    <Tag ref={ref} className={clsx("reveal", visible && "is-visible", className)} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
