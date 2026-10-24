import clsx from "clsx";
import type { ReactNode } from "react";
import { Img } from "./Img";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHero({
  title,
  kicker,
  intro,
  image,
  crumbs,
  tone = "hotel",
  children,
  size = "md",
}: {
  title: string;
  kicker?: string | null;
  intro?: ReactNode;
  image?: string | null;
  crumbs: Crumb[];
  tone?: "hotel" | "spa" | "resort";
  children?: ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <section className={clsx("relative isolate overflow-hidden text-white", size === "lg" ? "min-h-[78svh]" : "min-h-[58svh]")}>
      <div className="absolute inset-0 -z-10 bg-navy-800">
        {image && (
          <div className="absolute inset-0 animate-ken-burns">
            <Img src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
        <div
          className={clsx(
            "absolute inset-0",
            tone === "spa" ? "bg-gradient-to-t from-spa-700/85 via-navy-900/45 to-navy-900/30" : "bg-gradient-to-t from-navy-950/85 via-navy-900/40 to-navy-900/30",
          )}
        />
      </div>
      <div className={clsx("container-page flex flex-col justify-end pb-14 pt-[calc(var(--header-h)+3rem)]", size === "lg" ? "min-h-[78svh]" : "min-h-[58svh]")}>
        <Breadcrumbs crumbs={crumbs} tone="light" />
        {kicker && <p className="mt-6 font-script text-3xl leading-none text-lake-200 sm:text-4xl">{kicker}</p>}
        <h1 className="mt-2 max-w-4xl font-display text-[clamp(1.75rem,10vw,2.25rem)] leading-[1.08] text-balance hyphens-auto drop-shadow-sm sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">{intro}</div>}
        {children}
      </div>
    </section>
  );
}
