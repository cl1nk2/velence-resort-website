import Link from "next/link";
import { Suspense } from "react";
import { BadgePercent, Bell, Euro, Inbox, LayoutDashboard, LogOut, Newspaper, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/admin";
import { hasDb } from "@/lib/db/client";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/offers", label: "Offers", Icon: BadgePercent },
  { href: "/admin/news", label: "News", Icon: Newspaper },
  { href: "/admin/prices", label: "Spa prices", Icon: Euro },
  { href: "/admin/announcement", label: "Banner", Icon: Bell },
  { href: "/admin/submissions", label: "Submissions", Icon: Inbox },
];

async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-navy-800 text-white md:w-64">
        <div className="p-5">
          <Logo className="h-10 w-auto text-white" />
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-lake-200">Admin</p>
        </div>
        <nav aria-label="Admin" className="flex-1 px-3">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-bold text-white/85 hover:bg-white/10 hover:text-white">
                  <Icon className="size-4" aria-hidden="true" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 p-4 text-sm">
          {!hasDb && <p className="rounded-xl bg-gold-400 p-3 font-bold text-navy-900">No database connected – read-only demo content.</p>}
          <a href="/hu" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold hover:bg-white/10">
            <ExternalLink className="size-4" aria-hidden="true" /> View site
          </a>
          <form action={logout}>
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-bold hover:bg-white/10">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-10">
        <Suspense fallback={<p className="animate-pulse text-navy-700">Loading…</p>}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </div>
  );
}
