import { Plus } from "lucide-react";
import { Html } from "./Html";

/** Accordion built on <details>/<summary>: keyboard and screen-reader friendly with zero JS. */
export function FaqList({ groups, headingLevel = 2 }: { groups: { title: string; items: { q: string; a: string }[] }[]; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="space-y-10">
      {groups.map((g, gi) => (
        <section key={gi} aria-label={g.title || undefined}>
          {g.title && <H className="mb-4 font-display text-2xl text-navy-700">{g.title}</H>}
          <div className="divide-y divide-navy-100 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
            {g.items.map((it, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-bold text-navy-800 transition hover:bg-lake-50 [&::-webkit-details-marker]:hidden">
                  <span>{it.q}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lake-50 text-lake-600 transition-transform duration-300 group-open:rotate-45 group-open:bg-spa-500 group-open:text-white">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <Html html={it.a} className="text-[1rem]" />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
