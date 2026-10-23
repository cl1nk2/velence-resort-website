import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllOffers } from "@/lib/data";
import { deleteOffer, toggleOffer } from "@/lib/actions/admin";
import { getImage, variantUrl } from "@/lib/images";

export default async function OffersAdmin() {
  const offers = await getAllOffers();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-navy-700">Offers</h1>
        <Link href="/admin/offers/new" className="inline-flex items-center gap-2 rounded-full bg-spa-500 px-5 py-2.5 font-extrabold text-white hover:bg-spa-600">
          <Plus className="size-4" aria-hidden="true" /> New offer
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-lake-50 text-navy-700">
            <tr>
              <th className="p-3" scope="col">
                <span className="sr-only">Image</span>
              </th>
              <th className="p-3" scope="col">Title</th>
              <th className="p-3" scope="col">Validity</th>
              <th className="p-3" scope="col">From</th>
              <th className="p-3" scope="col">Status</th>
              <th className="p-3" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => {
              const e = getImage(o.image);
              return (
                <tr key={o.id} className="border-t border-navy-100">
                  <td className="p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {e && <img src={variantUrl(e, e.widths[0])} alt="" className="h-14 w-11 rounded-lg object-cover" />}
                  </td>
                  <td className="p-3 font-bold">
                    <Link href={`/admin/offers/${o.id}`} className="text-navy-700 hover:underline">
                      {o.hu.title}
                    </Link>
                    <span className="block text-xs font-normal text-navy-800/60">{o.en.title}</span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {o.validFrom} – {o.validTo}
                  </td>
                  <td className="whitespace-nowrap p-3">{o.priceFrom?.toLocaleString("hu-HU")} Ft</td>
                  <td className="p-3">
                    <form action={toggleOffer}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="published" value={String(o.published)} />
                      <button className={`rounded-full px-3 py-1 text-xs font-extrabold ${o.published ? "bg-emerald-100 text-emerald-800" : "bg-navy-100 text-navy-700"}`}>
                        {o.published ? "Published" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-right">
                    <form action={deleteOffer}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="text-xs font-bold text-spa-600 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
