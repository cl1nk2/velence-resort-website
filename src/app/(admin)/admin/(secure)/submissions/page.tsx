import { desc } from "drizzle-orm";
import { Download } from "lucide-react";
import { db, schema } from "@/lib/db/client";
import { setSubmissionStatus } from "@/lib/actions/admin";

export default async function SubmissionsAdmin() {
  if (!db) return <p className="rounded-2xl bg-gold-400/20 p-6">Connect a database to collect form submissions.</p>;
  const [subs, people] = await Promise.all([
    db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt)).limit(200),
    db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt)).limit(500),
  ]);
  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-navy-700">Submissions</h1>
          <a href="/api/admin/export?type=submissions" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-navy-100">
            <Download className="size-4" aria-hidden="true" /> CSV
          </a>
        </div>
        <ul className="mt-6 space-y-3">
          {subs.length === 0 && <li className="text-navy-800/60">No submissions yet.</li>}
          {subs.map((s) => {
            const d = s.data as Record<string, string>;
            return (
              <li key={s.id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-navy-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold text-navy-700">
                    <span className="mr-2 rounded-full bg-lake-50 px-2 py-0.5 text-xs uppercase">{s.kind}</span>
                    {d.name} · <a href={`mailto:${d.email}`} className="underline">{d.email}</a> {d.phone && `· ${d.phone}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <time className="text-navy-800/60">{s.createdAt.toISOString().slice(0, 16).replace("T", " ")}</time>
                    {(["new", "done", "spam"] as const).map((st) => (
                      <form key={st} action={setSubmissionStatus}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value={st} />
                        <button aria-pressed={s.status === st} className={`rounded-full px-2.5 py-1 font-bold ${s.status === st ? "bg-navy-600 text-white" : "bg-navy-50 text-navy-700"}`}>
                          {st}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                  {Object.entries(d)
                    .filter(([k]) => !["name", "email", "phone", "message"].includes(k) && d[k])
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt className="inline font-bold">{k}: </dt>
                        <dd className="inline">{String(v)}</dd>
                      </div>
                    ))}
                </dl>
                {d.message && <p className="mt-2 whitespace-pre-line text-sm text-navy-800/80">{d.message}</p>}
              </li>
            );
          })}
        </ul>
      </section>
      <section id="subscribers">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-navy-700">Newsletter subscribers ({people.length})</h2>
          <a href="/api/admin/export?type=subscribers" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-navy-100">
            <Download className="size-4" aria-hidden="true" /> CSV
          </a>
        </div>
        <ul className="mt-4 divide-y divide-navy-100 rounded-2xl bg-white text-sm shadow-soft ring-1 ring-navy-100">
          {people.map((p) => (
            <li key={p.id} className="flex justify-between gap-4 p-3">
              <span>
                {p.email} {p.name && <span className="text-navy-800/60">({p.name})</span>}
              </span>
              <span className="text-navy-800/60">
                {p.locale.toUpperCase()} · {p.createdAt.toISOString().slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
