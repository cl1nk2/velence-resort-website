import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["hu", "en"];

function preferredLocale(req: NextRequest) {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;
  const header = req.headers.get("accept-language") ?? "";
  const langs = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return langs.find((l) => LOCALES.includes(l.tag))?.tag ?? "hu";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Optimistic admin gate; the session is verified again server-side.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!req.cookies.get("vr_admin")) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (LOCALES.includes(first)) {
    const res = NextResponse.next();
    if (req.cookies.get("NEXT_LOCALE")?.value !== first) res.cookies.set("NEXT_LOCALE", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  // Legacy and unprefixed URLs -> localised URL (old site paths were unprefixed Hungarian).
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${preferredLocale(req)}` : `/hu${pathname}`;
  return NextResponse.redirect(url, pathname === "/" ? 307 : 308);
}

export const config = {
  matcher: ["/((?!api|_next|img|brand|fonts|favicon.ico|icon|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|llms.txt|llms-full.txt|.*\\..*).*)"],
};
