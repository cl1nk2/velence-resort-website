import { notFound } from "next/navigation";
import manifest from "@/content/images.json";
import { getAllNews } from "@/lib/data";
import { saveNews } from "@/lib/actions/admin";
import type { NewsItem } from "@/lib/content/types";
import { AdminForm, F, inputCls } from "../../ui";

function bodyHtml(n?: { blocks: { type: string; html?: string }[] }) {
  return (n?.blocks ?? []).map((b) => (b.type === "html" ? (b.html ?? "") : "")).join("\n");
}

export default async function EditNews({ params }: PageProps<"/admin/news/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const n: NewsItem | undefined = isNew
    ? { id: "", category: "resort", date: "", published: true, image: null, gallery: [], hu: { slug: "", title: "", excerpt: "", blocks: [] } }
    : (await getAllNews()).find((x) => x.id === id);
  if (!n) notFound();
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-navy-700">{isNew ? "New post" : n.hu.title}</h1>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
        <AdminForm action={saveNews}>
          <datalist id="images">
            {Object.keys(manifest).map((src) => (
              <option key={src} value={src} />
            ))}
          </datalist>
          <input type="hidden" name="existingGallery" value={JSON.stringify(n.gallery)} />
          <div className="grid gap-4 sm:grid-cols-4">
            <F label="ID / slug">
              <input name="id" defaultValue={n.id} readOnly={!isNew} required className={inputCls} />
            </F>
            <F label="Date">
              <input name="date" type="date" defaultValue={n.date} required className={inputCls} />
            </F>
            <F label="Category">
              <select name="category" defaultValue={n.category} className={inputCls}>
                <option value="resort">Resort</option>
                <option value="ele-village">Ele-Falva blog</option>
                <option value="spa">Spa</option>
              </select>
            </F>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-bold text-navy-700">
              <input type="checkbox" name="published" defaultChecked={n.published} className="size-4 accent-navy-600" /> Published
            </label>
          </div>
          <F label="Cover image">
            <input name="image" list="images" defaultValue={n.image ?? ""} className={inputCls} />
          </F>
          {(["hu", "en"] as const).map((l) => (
            <fieldset key={l} className="space-y-4 rounded-2xl bg-sand-100 p-5">
              <legend className="px-2 font-extrabold uppercase text-navy-700">{l === "hu" ? "Magyar" : "English (optional)"}</legend>
              <F label="Title">
                <input name={`${l}Title`} defaultValue={n[l]?.title ?? ""} required={l === "hu"} className={inputCls} />
              </F>
              <F label="Excerpt">
                <textarea name={`${l}Excerpt`} defaultValue={n[l]?.excerpt ?? ""} rows={2} className={inputCls} />
              </F>
              <F label="Body" hint="Plain text (blank line = new paragraph) or basic HTML: p, strong, em, ul/li, h2/h3, a">
                <textarea name={`${l}Body`} defaultValue={bodyHtml(n[l])} rows={12} className={`${inputCls} font-mono text-xs`} />
              </F>
            </fieldset>
          ))}
        </AdminForm>
      </div>
    </div>
  );
}
