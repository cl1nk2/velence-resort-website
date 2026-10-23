import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "spa" | "outline" | "light" | "ghost" | "outlineLight";
const styles: Record<Variant, string> = {
  primary: "bg-navy-600 text-white hover:bg-navy-700 shadow-soft",
  spa: "bg-spa-500 text-white hover:bg-spa-600 shadow-soft",
  outline: "border-2 border-navy-600 text-navy-700 hover:bg-navy-600 hover:text-white",
  outlineLight: "border-2 border-white/80 text-white hover:bg-white hover:text-navy-800",
  light: "bg-white text-navy-800 hover:bg-lake-50 shadow-soft",
  ghost: "text-navy-700 hover:bg-navy-50",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "lg" | "sm" = "md", className?: string) {
  return clsx(
    "group inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide transition-all duration-300 ease-out-expo active:scale-[.98] disabled:opacity-60 disabled:pointer-events-none",
    size === "lg" && "px-8 py-4 text-base",
    size === "md" && "px-6 py-3 text-[0.95rem]",
    size === "sm" && "px-4 py-2 text-sm",
    styles[variant],
    className,
  );
}

type LinkProps = Omit<ComponentProps<typeof Link>, "className"> & { variant?: Variant; size?: "md" | "lg" | "sm"; className?: string; children: ReactNode; external?: boolean };

export function ButtonLink({ variant, size, className, children, external, href, ...rest }: LinkProps) {
  const cls = buttonClass(variant, size, className);
  if (external || (typeof href === "string" && /^https?:/.test(href))) {
    return (
      <a href={href as string} className={cls} target="_blank" rel="noopener" {...(rest as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
