import Link from "next/link";
import { Info, TriangleAlert } from "lucide-react";
import clsx from "clsx";
import { getAnnouncement } from "@/lib/data";
import type { Locale } from "@/lib/i18n/config";

/** Optional site-wide notice managed from /admin (e.g. maintenance closures). */
export async function AnnouncementBar({ locale }: { locale: Locale }) {
  const a = await getAnnouncement();
  if (!a || !a[locale]) return null;
  const Icon = a.tone === "warning" ? TriangleAlert : Info;
  const body = (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {a[locale]}
    </span>
  );
  return (
    <div className={clsx("relative z-[55] px-4 py-2 text-center text-sm font-bold", a.tone === "warning" ? "bg-gold-400 text-navy-900" : "bg-navy-700 text-white")} role="status">
      {a.href ? (
        <Link href={a.href} className="underline-offset-4 hover:underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}
