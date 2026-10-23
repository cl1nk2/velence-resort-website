"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";

/** Category chips that filter a server-rendered list via a data attribute (no re-render of cards). */
export function OfferFilter({ options, children, label }: { options: { id: string; label: string; count: number }[]; children: ReactNode; label: string }) {
  const [active, setActive] = useState("all");
  return (
    <div>
      <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={active === o.id}
            onClick={() => setActive(o.id)}
            className={clsx(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition",
              active === o.id ? "bg-navy-600 text-white shadow-soft" : "bg-white text-navy-700 ring-1 ring-navy-100 hover:bg-lake-50",
            )}
          >
            {o.label} <span className="ml-1 opacity-80">{o.count}</span>
          </button>
        ))}
      </div>
      <ul data-filter={active} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </ul>
    </div>
  );
}
