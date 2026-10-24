"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { CalendarDays, ChevronDown, Menu, X, Gift, Crown, Clock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { NavGroup } from "@/lib/nav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { openBooking } from "@/components/booking/events";

type Props = {
  locale: Locale;
  nav: NavGroup[];
  alternates: Record<string, string>;
  t: Pick<Dictionary, "nav" | "a11y">;
  links: { voucher: string; loyalty: string; prices: string; home: string };
  images: Record<string, { src: string; srcSet: string } | null>;
};

export function Header({ locale, nav, alternates, t, links, images }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === `/${locale}` || pathname === "/";
  const transparent = isHome && !scrolled && !open && !mobile;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobile(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const hoverOpen = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
  }, []);
  const hoverClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 180);
  }, []);

  const other: Locale = locale === "hu" ? "en" : "hu";
  const altHref = alternates[pathname] ?? `/${other}`;

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-expo",
          transparent ? "bg-gradient-to-b from-navy-950/60 to-transparent text-white" : "bg-white/90 text-navy-800 shadow-soft backdrop-blur-xl",
        )}
      >
        <div ref={navRef} className="container-page flex h-[var(--header-h)] items-center gap-4">
          <Link href={links.home} className="shrink-0" aria-label={`${t.nav.home} – Velence Resort & Spa`}>
            <Logo className={clsx("h-11 w-auto transition-colors sm:h-12", transparent ? "text-white" : "text-lake-400")} title="Velence Resort & Spa" />
          </Link>

          <nav aria-label={t.a11y.mainNav} className="ml-4 hidden flex-1 xl:block">
            <ul className="flex items-center gap-1">
              {nav.map((g) =>
                g.links.length === 0 && g.href ? (
                  <li key={g.id}>
                    <Link
                      href={g.href}
                      className={clsx(
                        "rounded-full px-3.5 py-2 text-[0.95rem] font-bold transition-colors",
                        transparent ? "hover:bg-white/15" : "hover:bg-navy-50",
                        pathname.startsWith(g.href) && "text-lake-500",
                      )}
                    >
                      {g.label}
                    </Link>
                  </li>
                ) : (
                  <li key={g.id} onMouseEnter={() => hoverOpen(g.id)} onMouseLeave={hoverClose}>
                    <MegaMenu group={g} open={open === g.id} transparent={transparent} onToggle={() => setOpen(open === g.id ? null : g.id)} image={images[g.id]} />
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <p className={clsx("flex items-center rounded-full px-2 text-sm font-extrabold tracking-wider")}>
              <span aria-hidden="true" className="px-1">
                {locale.toUpperCase()}
              </span>
              <span aria-hidden="true" className="opacity-50">
                /
              </span>
              <a
                href={altHref}
                hrefLang={other}
                lang={other}
                aria-label={other === "en" ? "EN – English version" : "HU – magyar változat"}
                className={clsx("rounded-full px-2 py-2 underline-offset-4 hover:underline", transparent ? "hover:bg-white/15" : "hover:bg-navy-50")}
              >
                {other.toUpperCase()}
              </a>
            </p>
            <button
              type="button"
              onClick={() => openBooking()}
              className="hidden items-center gap-2 rounded-full bg-spa-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-soft transition hover:bg-spa-600 sm:inline-flex"
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              {t.nav.book}
            </button>
            <button
              type="button"
              className={clsx("inline-flex items-center gap-2 rounded-full px-3 py-2 font-bold xl:hidden", transparent ? "hover:bg-white/15" : "hover:bg-navy-50")}
              aria-expanded={mobile}
              aria-controls="mobile-menu"
              onClick={() => setMobile(true)}
            >
              <Menu className="size-6" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t.nav.menu}</span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={mobile} onClose={() => setMobile(false)} nav={nav} t={t} links={links} locale={locale} altHref={altHref} />
    </>
  );
}

function MegaMenu({
  group,
  open,
  transparent,
  onToggle,
  image,
}: {
  group: NavGroup;
  open: boolean;
  transparent: boolean;
  onToggle: () => void;
  image: { src: string; srcSet: string } | null | undefined;
}) {
  const id = useId();
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={clsx(
          "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.95rem] font-bold transition-colors",
          transparent ? "hover:bg-white/15" : "hover:bg-navy-50",
          open && (transparent ? "bg-white/15" : "bg-navy-50"),
        )}
      >
        {group.label}
        <ChevronDown className={clsx("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
      </button>
      <div
        id={id}
        hidden={!open}
        className="fixed left-1/2 top-[calc(var(--header-h)-.25rem)] z-50 w-[min(52rem,94vw)] -translate-x-1/2 overflow-hidden rounded-3xl bg-white text-navy-800 shadow-lift ring-1 ring-navy-100"
      >
        <div className="grid grid-cols-[1fr_15rem]">
          <ul className="grid grid-cols-2 gap-1 p-4">
            {group.href && (
              <li className="col-span-2">
                <Link href={group.href} className="group flex items-center justify-between rounded-2xl bg-lake-50 px-4 py-3 font-extrabold text-navy-700 hover:bg-lake-100">
                  {group.label}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            )}
            {group.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-2xl px-4 py-2.5 hover:bg-navy-50">
                  <span className="block font-bold">{l.label}</span>
                  {l.description && <span className="mt-0.5 block text-sm leading-snug text-navy-800/75 line-clamp-1">{l.description}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="relative min-h-56 bg-navy-100">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.src} srcSet={image.srcSet} sizes="240px" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
            <p className="absolute inset-x-4 bottom-4 font-script text-3xl leading-none text-white">{group.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  nav,
  t,
  links,
  locale,
  altHref,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavGroup[];
  t: Props["t"];
  links: Props["links"];
  locale: Locale;
  altHref: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const els = ref.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trap);
      prev?.focus();
    };
  }, [open]);

  if (!open) return null;
  const other: Locale = locale === "hu" ? "en" : "hu";
  return (
    <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu} id="mobile-menu">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={ref} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <Logo className="h-10 w-auto text-lake-400" />
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-navy-50" aria-label={t.a11y.closeMenu}>
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={t.a11y.mainNav} className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {nav.map((g) => (
              <li key={g.id}>
                {g.links.length === 0 && g.href ? (
                  <Link href={g.href} className="block rounded-2xl px-4 py-3 text-lg font-extrabold text-navy-700 hover:bg-navy-50">
                    {g.label}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      aria-expanded={expanded === g.id}
                      onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-lg font-extrabold text-navy-700 hover:bg-navy-50"
                    >
                      {g.label}
                      <ChevronDown className={clsx("size-5 transition-transform", expanded === g.id && "rotate-180")} aria-hidden="true" />
                    </button>
                    {expanded === g.id && (
                      <ul className="mb-2 ml-4 border-l-2 border-lake-200 pl-2">
                        {g.href && (
                          <li>
                            <Link href={g.href} className="block rounded-xl px-3 py-2 font-bold text-lake-600 hover:bg-navy-50">
                              {g.label} →
                            </Link>
                          </li>
                        )}
                        {g.links.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} className="block rounded-xl px-3 py-2 font-semibold text-navy-800 hover:bg-navy-50">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 border-t border-navy-100 p-5">
          <button
            type="button"
            onClick={() => {
              onClose();
              openBooking();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-spa-500 px-5 py-3.5 font-extrabold text-white"
          >
            <CalendarDays className="size-5" aria-hidden="true" /> {t.nav.book}
          </button>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-navy-700 [&>a]:min-w-0 [&>a]:px-1.5 [&>a]:hyphens-auto [&>a]:[overflow-wrap:anywhere]">
            <a href={links.voucher} target="_blank" rel="noopener" className="rounded-2xl bg-sand-100 p-3 hover:bg-sand-200">
              <Gift className="mx-auto mb-1 size-5" aria-hidden="true" />
              {t.nav.voucher}
            </a>
            <Link href={links.loyalty} className="rounded-2xl bg-sand-100 p-3 hover:bg-sand-200">
              <Crown className="mx-auto mb-1 size-5" aria-hidden="true" />
              {t.nav.loyalty}
            </Link>
            <Link href={links.prices} className="rounded-2xl bg-sand-100 p-3 hover:bg-sand-200">
              <Clock className="mx-auto mb-1 size-5" aria-hidden="true" />
              {t.nav.openingHours}
            </Link>
          </div>
          <a href={altHref} hrefLang={other} className="block pt-2 text-center text-sm font-bold text-navy-600 underline underline-offset-4">
            {other === "en" ? "English version" : "Magyar változat"}
          </a>
        </div>
      </div>
    </div>
  );
}
