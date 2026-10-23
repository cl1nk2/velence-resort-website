import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getAllNews, getAllOffers } from "@/lib/data";

export default async function Dashboard() {
  const [offers, news] = await Promise.all([getAllOffers(), getAllNews()]);
  let newSubs = 0;
  let subscribers = 0;
  if (db) {
    try {
      newSubs = (await db.select({ n: count() }).from(schema.submissions).where(eq(schema.submissions.status, "new")))[0]?.n ?? 0;
      subscribers = (await db.select({ n: count() }).from(schema.subscribers))[0]?.n ?? 0;
    } catch {}
  }
  const cards = [
    { label: "Offers", value: offers.filter((o) => o.published).length, href: "/admin/offers" },
    { label: "News posts", value: news.filter((n) => n.published).length, href: "/admin/news" },
    { label: "New submissions", value: newSubs, href: "/admin/submissions" },
    { label: "Newsletter subscribers", value: subscribers, href: "/admin/submissions#subscribers" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl text-navy-700">Dashboard</h1>
      <p className="mt-1 text-navy-800/70">Manage the content that changes often. Everything else is versioned in the repository.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100 hover:ring-lake-300">
              <p className="font-display text-4xl text-navy-700">{c.value}</p>
              <p className="mt-1 text-sm font-bold text-navy-800/75">{c.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
