import { notFound } from "next/navigation";
import manifest from "@/content/images.json";
import { getAllOffers } from "@/lib/data";
import { saveOffer } from "@/lib/actions/admin";
import { AdminForm, F, inputCls } from "../../ui";
import type { Offer } from "@/lib/content/types";

const EMPTY: Offer = {
  id: "",
  sort: 50,
  published: true,
  categories: [],
  image: null,
  heroImage: null,
  validFrom: null,
  validTo: null,
  priceFrom: null,
  minNights: 2,
  hu: { slug: "", title: "", summary: "", highlights: [] },
  en: { slug: "", title: "", summary: "", highlights: [] },
};

export default async function EditOffer({ params }: PageProps<"/admin/offers/[id]">) {
  const { id } = await params;
  const o = id === "new" ? EMPTY : (await getAllOffers()).find((x) => x.id === id);
  if (!o) notFound();
  const images = Object.keys(manifest);
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-navy-700">{id === "new" ? "New offer" : o.hu.title}</h1>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
        <AdminForm action={saveOffer}>
          <datalist id="images">
            {images.map((src) => (
              <option key={src} value={src} />
            ))}
          </datalist>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="ID (slug)" hint="Lowercase, dashes; cannot be changed later">
              <input name="id" defaultValue={o.id} readOnly={id !== "new"} required className={inputCls} />
            </F>
            <F label="Sort order">
              <input name="sort" type="number" defaultValue={o.sort} className={inputCls} />
            </F>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-bold text-navy-700">
              <input type="checkbox" name="published" defaultChecked={o.published} className="size-4 accent-navy-600" /> Published
            </label>
          </div>
          <fieldset className="flex flex-wrap gap-4 text-sm font-bold text-navy-700">
            <legend className="mb-2">Categories</legend>
            {[
              ["ele", "Ele events"],
              ["season", "Peak seasons"],
              ["family", "For families"],
            ].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2">
                <input type="checkbox" name="categories" value={v} defaultChecked={o.categories.includes(v)} className="size-4 accent-navy-600" /> {l}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-4">
            <F label="Valid from">
              <input name="validFrom" type="date" defaultValue={o.validFrom ?? ""} className={inputCls} />
            </F>
            <F label="Valid to">
              <input name="validTo" type="date" defaultValue={o.validTo ?? ""} className={inputCls} />
            </F>
            <F label="Price from (HUF / person / night)">
              <input name="priceFrom" inputMode="numeric" defaultValue={o.priceFrom ?? ""} className={inputCls} />
            </F>
            <F label="Minimum nights">
              <input name="minNights" inputMode="numeric" defaultValue={o.minNights ?? ""} className={inputCls} />
            </F>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Card image (portrait)" hint="Pick from the media library (start typing zcms…)">
              <input name="image" list="images" defaultValue={o.image ?? ""} className={inputCls} />
            </F>
            <F label="Header image (landscape)">
              <input name="heroImage" list="images" defaultValue={o.heroImage ?? ""} className={inputCls} />
            </F>
          </div>
          {(["hu", "en"] as const).map((l) => (
            <fieldset key={l} className="space-y-4 rounded-2xl bg-sand-100 p-5">
              <legend className="px-2 font-extrabold uppercase text-navy-700">{l === "hu" ? "Magyar" : "English"}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Title">
                  <input name={`${l}Title`} defaultValue={o[l].title} required className={inputCls} />
                </F>
                <F label="URL slug">
                  <input name={`${l}Slug`} defaultValue={o[l].slug} required className={inputCls} />
                </F>
              </div>
              <F label="Summary">
                <textarea name={`${l}Summary`} defaultValue={o[l].summary} rows={3} className={inputCls} />
              </F>
              <F label="Special package content" hint="One item per line">
                <textarea name={`${l}Highlights`} defaultValue={o[l].highlights.join("\n")} rows={5} className={inputCls} />
              </F>
            </fieldset>
          ))}
        </AdminForm>
      </div>
    </div>
  );
}
