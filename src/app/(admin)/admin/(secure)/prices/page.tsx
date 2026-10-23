import { getPrices } from "@/lib/data";
import { savePrices } from "@/lib/actions/admin";
import { AdminForm, F, inputCls } from "../ui";

export default async function PricesAdmin() {
  const p = await getPrices();
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-navy-700">Spa opening hours & prices</h1>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-navy-100">
        <AdminForm action={savePrices}>
          <input type="hidden" name="current" value={JSON.stringify(p)} />
          <F label="Price list valid from">
            <input name="validFrom" type="date" defaultValue={p.validFrom} className={`${inputCls} max-w-xs`} />
          </F>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["hu", "en"] as const).map((l) => (
              <fieldset key={l} className="space-y-3 rounded-2xl bg-sand-100 p-4">
                <legend className="px-2 font-extrabold uppercase text-navy-700">{l}</legend>
                <F label="Spa hours">
                  <input name={`hours_${l}_spa`} defaultValue={p.hours[l].spa} className={inputCls} />
                </F>
                <F label="Ticket office hours">
                  <input name={`hours_${l}_cashier`} defaultValue={p.hours[l].cashier} className={inputCls} />
                </F>
                <F label="Notes (one per line)">
                  <textarea name={`notes_${l}`} defaultValue={p.notes[l].join("\n")} rows={6} className={inputCls} />
                </F>
              </fieldset>
            ))}
          </div>
          {p.tables.map((tbl, ti) => (
            <fieldset key={tbl.id} className="rounded-2xl ring-1 ring-navy-100">
              <legend className="ml-3 px-2 font-extrabold text-navy-700">{tbl.title.hu}</legend>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-navy-700/80">
                    <th className="p-3">Ticket</th>
                    {tbl.columns.hu.map((c) => (
                      <th key={c} className="p-3">
                        {c} (Ft)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tbl.rows.map((r, ri) => (
                    <tr key={ri} className="border-t border-navy-100">
                      <th scope="row" className="p-3 text-left font-semibold">
                        {r.label.hu}
                      </th>
                      {r.prices.map((v, pi) => (
                        <td key={pi} className="p-2">
                          <input
                            name={`p_${ti}_${ri}_${pi}`}
                            defaultValue={v === null ? "-" : String(v)}
                            inputMode="numeric"
                            aria-label={`${r.label.hu} – ${tbl.columns.hu[pi]}`}
                            className={`${inputCls} mt-0 w-32`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </fieldset>
          ))}
          <p className="text-xs text-navy-800/75">Use “-” for “not available” and 0 for “free”.</p>
        </AdminForm>
      </div>
    </div>
  );
}
