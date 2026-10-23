import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { allPages, pageHref } from "@/lib/content/pages";
import type { Block } from "@/lib/content/types";
import site from "@/content/site.json";
import prices from "@/content/prices.json";

export type Doc = { id: string; locale: Locale; title: string; text: string; answer: string; href: string; boost: number };

const STOP = new Set(
  "a az és es is egy van vannak lehet hogy mi mit mikor hol hogyan miért ha de vagy nem igen meg el be ki fel le the a an and or of to in on at is are be can i you we do does how what when where why for with my your our it this that there from by as".split(
    " ",
  ),
);

export function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ");
}

/** Light stemming: strip common Hungarian/English suffixes so "medencék" ~ "medence", "pools" ~ "pool". */
function stem(w: string) {
  return w.replace(/(okat|eket|oknak|eknek|aknak|ban|ben|bol|rol|tol|nak|nek|val|vel|kat|ket|ok|ek|ak|at|et|ot|on|en|ra|re|ba|be|t|s|ing|ed|es)$/, "") || w;
}

export function tokens(s: string) {
  return fold(s)
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 ? stem(w) : w));
}

const strip = (h: string) =>
  h
    .replace(/<li>/g, " • ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

function collect(blocks: Block[], out: { title: string; text: string }[], current = "") {
  for (const b of blocks) {
    if (b.type === "faq") {
      for (const g of b.groups) for (const it of g.items) out.push({ title: it.q, text: strip(it.a) });
    } else if (b.type === "html") {
      // Split long html into heading-delimited chunks
      const parts = b.html.split(/<h[23]>/);
      for (const part of parts) {
        const m = part.match(/^(.*?)<\/h[23]>([\s\S]*)$/);
        const title = m ? strip(m[1]) : current;
        const text = strip(m ? m[2] : part);
        if (text.length > 30) out.push({ title, text });
      }
    } else if (b.type === "split") collect(b.blocks, out, current);
  }
}

const cache = new Map<Locale, Doc[]>();

export function getDocs(locale: Locale): Doc[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  const docs: Doc[] = [];
  for (const p of allPages()) {
    const d = p[locale];
    const href = pageHref(p.id, locale);
    if (!d || !href || p.template === "legal" || p.template === "person") continue;
    const chunks: { title: string; text: string }[] = [];
    collect(d.blocks, chunks, d.title);
    if (d.excerpt) chunks.push({ title: d.title, text: d.excerpt });
    const boost = p.id === "faq" || p.id === "guest-info" ? 1.4 : 1;
    chunks.forEach((c, i) =>
      docs.push({ id: `${p.id}#${i}`, locale, title: c.title || d.title, text: `${d.title} ${c.title} ${c.text}`, answer: c.text, href, boost }),
    );
  }
  // Facts that are not phrased as text anywhere on the site.
  const hours = (prices as { hours: Record<Locale, { spa: string; cashier: string }> }).hours[locale];
  const extra =
    locale === "hu"
      ? [
          { t: "Fürdő nyitvatartás", a: `Élményfürdő: ${hours.spa}. Pénztár: ${hours.cashier}. Napijegy már 5 500 Ft-tól.`, h: "prices" },
          { t: "Bejelentkezés kijelentkezés check-in check-out", a: `A szobák ${site.checkIn}-tól vehetők át, elutazáskor ${site.checkOut}-ig kell elhagyni.`, h: "guest-info" },
          { t: "Telefonszám elérhetőség recepció", a: `Szálloda: ${site.phones.hotel}, fürdő: ${site.phones.spa}, e-mail: ${site.emails.info}. Cím: ${site.address.postalCode} ${site.address.city}, ${site.address.street}.`, h: "contact" },
        ]
      : [
          { t: "Spa opening hours", a: `Adventure pool: ${hours.spa}. Ticket office: ${hours.cashier}. Day tickets from HUF 5,500.`, h: "prices" },
          { t: "Check-in check-out time", a: `Rooms are available from ${site.checkIn} and must be vacated by ${site.checkOut} on departure.`, h: "guest-info" },
          { t: "Phone contact reception address", a: `Hotel: ${site.phones.hotel}, spa: ${site.phones.spa}, email: ${site.emails.info}. Address: ${site.address.postalCode} ${site.address.city}, ${site.address.street}.`, h: "contact" },
        ];
  for (const [i, e] of extra.entries()) {
    docs.push({ id: `extra#${i}`, locale, title: e.t, text: `${e.t} ${e.a}`, answer: e.a, href: pageHref(e.h, locale) ?? `/${locale}`, boost: 1.6 });
  }
  cache.set(locale, docs);
  return docs;
}

/** Simple BM25 ranking over the site's content. */
export function search(locale: Locale, query: string, limit = 3) {
  const docs = getDocs(locale);
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];
  const N = docs.length;
  const tok = docs.map((d) => tokens(d.text));
  const titleTok = docs.map((d) => new Set(tokens(d.title)));
  const avg = tok.reduce((s, t) => s + t.length, 0) / N;
  const df = new Map<string, number>();
  for (const term of q) df.set(term, tok.filter((t) => t.some((w) => w.startsWith(term))).length);
  const scored = docs.map((d, i) => {
    let s = 0;
    for (const term of q) {
      const f = tok[i].filter((w) => w.startsWith(term)).length;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
      s += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (tok[i].length / avg))));
      if ([...titleTok[i]].some((w) => w.startsWith(term))) s += idf * 0.8;
    }
    return { d, s: s * d.boost };
  });
  return scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ d, s }) => ({ title: d.title, answer: d.answer.length > 420 ? d.answer.slice(0, 420).replace(/\s\S*$/, "") + "…" : d.answer, href: d.href, score: s }));
}
