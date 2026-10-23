import clsx from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  text,
  align = "left",
  as: H = "h2",
  tone = "dark",
  className,
  id,
}: {
  kicker?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  tone?: "dark" | "light";
  className?: string;
  id?: string;
}) {
  return (
    <Reveal className={clsx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && (
        <p className={clsx("font-script text-3xl leading-none sm:text-4xl", tone === "light" ? "text-lake-200" : "text-lake-500")}>{kicker}</p>
      )}
      <H id={id} className={clsx("mt-2 font-display text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl", tone === "light" ? "text-white" : "text-navy-700")}>
        {title}
      </H>
      {text && <div className={clsx("mt-4 text-lg leading-relaxed", tone === "light" ? "text-white/85" : "text-navy-800/80")}>{text}</div>}
    </Reveal>
  );
}
