import Link from "next/link";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { siteUrl } from "@/lib/site-url";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ crumbs, tone = "dark", label = "Breadcrumb" }: { crumbs: Crumb[]; tone?: "dark" | "light"; label?: string }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
  };
  return (
    <nav aria-label={label}>
      <ol className={clsx("flex flex-wrap items-center gap-1 text-sm font-semibold", tone === "light" ? "text-white/75" : "text-navy-700/70")}>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
            {i === crumbs.length - 1 ? (
              <span aria-current="page" className={tone === "light" ? "text-white" : "text-navy-800"}>
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </nav>
  );
}
