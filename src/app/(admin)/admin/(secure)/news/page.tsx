import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllNews } from "@/lib/data";
import { deleteNews, toggleNews } from "@/lib/actions/admin";

export default async function NewsAdmin() {
  const news = await getAllNews();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-navy-700">News & blog</h1>
        <Link href="/admin/news/new" className="inline-flex items-center gap-2 rounded-full bg-spa-500 px-5 py-2.5 font-extrabold text-white hover:bg-spa-600">
          <Plus className="size-4" aria-hidden="true" /> New post
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-navy-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-lake-50 text-navy-700">
            <tr>
              <th className="p-3" scope="col">Date</th>
              <th className="p-3" scope="col">Title</th>
              <th className="p-3" scope="col">Category</th>
              <th className="p-3" scope="col">EN</th>
              <th className="p-3" scope="col">Status</th>
              <th className="p-3" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => (
              <tr key={n.id} className="border-t border-navy-100">
                <td className="whitespace-nowrap p-3">{n.date}</td>
                <td className="p-3 font-bold">
                  <Link href={`/admin/news/${n.id}`} className="text-navy-700 hover:underline">
                    {n.hu.title}
                  </Link>
                </td>
                <td className="p-3">{n.category}</td>
                <td className="p-3">{n.en ? "✓" : "–"}</td>
                <td className="p-3">
                  <form action={toggleNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="published" value={String(n.published)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-extrabold ${n.published ? "bg-emerald-100 text-emerald-800" : "bg-navy-100 text-navy-700"}`}>
                      {n.published ? "Published" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-right">
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="text-xs font-bold text-spa-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
