"use client";

import { useDeferredValue, useMemo, useState } from "react";
import clsx from "clsx";
import { Plus, Search } from "lucide-react";

type Group = { title: string; items: { q: string; a: string }[] };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Searchable, filterable FAQ (all content is server-rendered in the initial HTML). */
export function FaqExplorer({ groups, labels }: { groups: Group[]; labels: { search: string; all: string; results: string; none: string } }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<number | null>(null);
  const dq = useDeferredValue(q);
  const filtered = useMemo(() => {
    const needle = fold(dq.trim());
    return groups
      .map((g, gi) => ({
        ...g,
        gi,
        items: g.items.filter((it) => (cat === null || cat === gi) && (!needle || fold(it.q + " " + it.a.replace(/<[^>]+>/g, " ")).includes(needle))),
      }))
      .filter((g) => g.items.length);
  }, [groups, dq, cat]);
  const count = filtered.reduce((s, g) => s + g.items.length, 0);

  return (
    <div>
      <div className="sticky top-[calc(var(--header-h)+.5rem)] z-20 rounded-3xl bg-white/90 p-4 shadow-soft ring-1 ring-navy-100 backdrop-blur">
        <label className="relative block">
          <span className="sr-only">{labels.search}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-navy-700/80" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.search}
            className="w-full rounded-2xl border border-navy-100 bg-sand-50 py-3 pl-12 pr-4 outline-none focus:border-lake-400 focus:ring-4 focus:ring-lake-100"
          />
        </label>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="group" aria-label={labels.all}>
          {[{ title: labels.all, gi: null as number | null }, ...groups.map((g, gi) => ({ title: g.title, gi }))].map((c) => (
            <button
              key={String(c.gi)}
              type="button"
              aria-pressed={cat === c.gi}
              onClick={() => setCat(c.gi)}
              className={clsx("shrink-0 rounded-full px-4 py-2 text-sm font-bold transition", cat === c.gi ? "bg-navy-600 text-white" : "bg-lake-50 text-navy-700 hover:bg-lake-100")}
            >
              {c.title}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold text-navy-800/75" aria-live="polite">
          {count ? labels.results.replace("{n}", String(count)) : labels.none}
        </p>
      </div>
      <div className="mt-8 space-y-10">
        {filtered.map((g) => (
          <section key={g.gi} aria-label={g.title}>
            <h2 className="mb-4 font-display text-2xl text-navy-700">{g.title}</h2>
            <div className="divide-y divide-navy-100 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
              {g.items.map((it) => (
                <details key={it.q} className="group" open={!!dq.trim() && count <= 3}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-bold text-navy-800 transition hover:bg-lake-50 [&::-webkit-details-marker]:hidden">
                    <span>{it.q}</span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lake-50 text-lake-600 transition-transform duration-300 group-open:rotate-45 group-open:bg-spa-500 group-open:text-white">
                      <Plus className="size-4" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="prose-resort px-6 pb-6 text-[1rem]" dangerouslySetInnerHTML={{ __html: it.a }} />
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
