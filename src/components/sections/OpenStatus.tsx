"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/** "Open now / closed" badge computed in the resort's timezone, refreshed every minute. */
export function OpenStatus({ open, close, labels }: { open: string; close: string; labels: { openNow: string; closedNow: string; opensAt: string; closesAt: string } }) {
  const [state, setState] = useState<{ isOpen: boolean; text: string } | null>(null);
  useEffect(() => {
    const calc = () => {
      const now = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
      const isOpen = now >= open && now < close;
      setState({ isOpen, text: (isOpen ? labels.closesAt : labels.opensAt).replace("{time}", isOpen ? close : open) });
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [open, close, labels]);
  if (!state) return <span className="inline-block h-7 w-48 animate-pulse rounded-full bg-navy-100/60" aria-hidden="true" />;
  return (
    <span className={clsx("inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-extrabold", state.isOpen ? "bg-emerald-500/15 text-emerald-700" : "bg-spa-500/10 text-spa-600")} role="status">
      <span className="relative flex size-2.5">
        {state.isOpen && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />}
        <span className={clsx("relative inline-flex size-2.5 rounded-full", state.isOpen ? "bg-emerald-500" : "bg-spa-500")} />
      </span>
      {state.isOpen ? labels.openNow : labels.closedNow} · <span className="font-semibold">{state.text}</span>
    </span>
  );
}
