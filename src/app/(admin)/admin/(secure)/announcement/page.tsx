import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { saveAnnouncement } from "@/lib/actions/admin";
import type { Announcement } from "@/lib/data";
import { AdminForm, F, inputCls } from "../ui";

export default async function AnnouncementAdmin() {
  let a: Announcement = { active: false, tone: "info", hu: "", en: "" };
  if (db) {
    try {
      const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "announcement"));
      if (row) a = row.value as Announcement;
    } catch {}
  }
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-navy-700">Site-wide banner</h1>
      <p className="mt-1 text-navy-800/70">Shown above the header on every page – e.g. maintenance closures or a flash sale.</p>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
        <AdminForm action={saveAnnouncement}>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-bold text-navy-700">
              <input type="checkbox" name="active" defaultChecked={a.active} className="size-4 accent-navy-600" /> Active
            </label>
            <F label="Tone">
              <select name="tone" defaultValue={a.tone} className={inputCls}>
                <option value="info">Info (navy)</option>
                <option value="warning">Warning (gold)</option>
              </select>
            </F>
          </div>
          <F label="Hungarian text">
            <input name="hu" defaultValue={a.hu} maxLength={300} className={inputCls} />
          </F>
          <F label="English text">
            <input name="en" defaultValue={a.en} maxLength={300} className={inputCls} />
          </F>
          <F label="Link (optional, site path)" hint="e.g. /hu/nyitvatartas-es-arak">
            <input name="href" defaultValue={a.href ?? ""} className={inputCls} />
          </F>
        </AdminForm>
      </div>
    </div>
  );
}
