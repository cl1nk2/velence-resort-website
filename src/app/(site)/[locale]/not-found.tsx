import Link from "next/link";
import { Waves } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import { hrefOrFallback } from "@/lib/content/pages";

export default async function NotFound() {
  const { locale, t } = await getDictionary();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-navy-800 to-navy-600 pb-24 pt-[calc(var(--header-h)+6rem)] text-white">
      <div className="container-page max-w-2xl text-center">
        <Waves className="mx-auto size-16 animate-float text-lake-300" aria-hidden="true" />
        <p className="mt-6 font-display text-8xl text-white/20">404</p>
        <h1 className="mt-2 font-display text-4xl">{t.notFound.title}</h1>
        <p className="mt-4 text-lg text-white/80">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}`} className="rounded-full bg-white px-6 py-3 font-extrabold text-navy-800 hover:bg-lake-50">
            {t.notFound.cta}
          </Link>
          <Link href={hrefOrFallback("offers", locale)} className="rounded-full border-2 border-white/70 px-6 py-3 font-extrabold hover:bg-white hover:text-navy-800">
            {t.nav.offers}
          </Link>
        </div>
      </div>
    </section>
  );
}
