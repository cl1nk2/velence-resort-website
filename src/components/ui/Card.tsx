import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Img } from "./Img";

export function Card({
  href,
  image,
  title,
  text,
  meta,
  badge,
  aspect = "aspect-[4/3]",
  cta,
  className,
  headingLevel = 3,
}: {
  href: string;
  image?: string | null;
  title: string;
  text?: string | null;
  meta?: ReactNode;
  badge?: ReactNode;
  aspect?: string;
  cta?: string;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={clsx("group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-navy-100/60 transition duration-500 ease-out-expo hover:-translate-y-1.5 hover:shadow-lift", className)}>
      <div className={clsx("relative overflow-hidden bg-navy-100", aspect)}>
        {image && <Img src={image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="transition duration-[1.2s] ease-out-expo group-hover:scale-110" />}
        {badge && <div className="absolute left-4 top-4 flex flex-wrap gap-2">{badge}</div>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <H className="font-display text-xl leading-snug text-navy-700">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </H>
        {meta && <div className="mt-3 flex flex-wrap gap-2 text-sm">{meta}</div>}
        {text && <p className="mt-3 line-clamp-3 text-[0.97rem] leading-relaxed text-navy-800/75">{text}</p>}
        {cta && (
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-extrabold text-lake-600">
            {cta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        )}
      </div>
    </article>
  );
}

export function Chip({ children, tone = "lake" }: { children: ReactNode; tone?: "lake" | "spa" | "gold" | "white" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
        tone === "lake" && "bg-lake-50 text-navy-700",
        tone === "spa" && "bg-spa-500 text-white",
        tone === "gold" && "bg-gold-400 text-navy-900",
        tone === "white" && "bg-white/90 text-navy-800 backdrop-blur",
      )}
    >
      {children}
    </span>
  );
}
