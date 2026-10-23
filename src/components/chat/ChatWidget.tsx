"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { MessageCircleQuestion, Send, X, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";

type Result = { title: string; answer: string; href: string };
type Msg = { role: "bot" | "user"; text: string; results?: Result[] };

export function ChatWidget({ locale, t, closeLabel }: { locale: Locale; t: Dictionary["chat"]; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: t.greeting }]);
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: question, locale }) });
      const data = (await res.json()) as { results?: Result[] };
      const results = data.results ?? [];
      setMsgs((m) => [...m, results.length ? { role: "bot", text: results[0].answer, results } : { role: "bot", text: t.notFound }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: t.notFound }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[45] flex flex-col items-end">
      {open && (
        <section
          id={panelId}
          aria-label={t.title}
          className="mb-3 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-navy-100"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-navy-600 to-lake-500 px-5 py-4 text-white">
            <div>
              <h2 className="font-display text-lg leading-tight">{t.title}</h2>
              <p className="text-xs text-white/80">{t.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/15" aria-label={closeLabel}>
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          <ol ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-sand-50 p-4" aria-live="polite" aria-busy={busy}>
            {msgs.map((m, i) => (
              <li key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user" ? "rounded-br-md bg-navy-600 text-white" : "rounded-bl-md bg-white text-navy-800 shadow-sm ring-1 ring-navy-100",
                  )}
                >
                  <span className="sr-only">{m.role === "user" ? "›" : `${t.title}:`} </span>
                  {m.text}
                  {m.results && (
                    <ul className="mt-2 space-y-1 border-t border-navy-100 pt-2">
                      {m.results.map((r) => (
                        <li key={r.href + r.title}>
                          <Link href={r.href} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-xs font-bold text-lake-600 hover:underline">
                            <ArrowRight className="size-3" aria-hidden="true" />
                            {r.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
            {busy && (
              <li className="flex gap-1 px-2" aria-hidden="true">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-2 animate-bounce rounded-full bg-lake-400" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </li>
            )}
          </ol>
          {msgs.length < 3 && (
            <div className="flex flex-wrap gap-2 border-t border-navy-100 bg-white px-4 pt-3">
              {t.suggestions.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="rounded-full bg-lake-50 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-lake-100">
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex items-center gap-2 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <label htmlFor={`${panelId}-q`} className="sr-only">
              {t.placeholder}
            </label>
            <input
              ref={inputRef}
              id={`${panelId}-q`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder={t.placeholder}
              autoComplete="off"
              className="flex-1 rounded-full border border-navy-100 bg-sand-50 px-4 py-2.5 text-sm outline-none focus:border-lake-400 focus:ring-4 focus:ring-lake-100"
            />
            <button type="submit" disabled={busy || input.trim().length < 2} className="grid size-10 place-items-center rounded-full bg-spa-500 text-white disabled:opacity-40" aria-label={t.send}>
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
          <p className="bg-white px-4 pb-3 text-[11px] text-navy-800/50">{t.disclaimer}</p>
        </section>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group relative flex items-center gap-2 rounded-full bg-navy-600 py-3 pl-4 pr-5 font-bold text-white shadow-lift transition hover:bg-navy-700"
      >
        {!open && <span aria-hidden="true" className="absolute -inset-1 -z-10 animate-ripple rounded-full bg-lake-400/40" />}
        {open ? <X className="size-5" aria-hidden="true" /> : <MessageCircleQuestion className="size-5" aria-hidden="true" />}
        <span className="hidden text-sm sm:inline">{open ? closeLabel : t.open}</span>
        <span className="sr-only sm:hidden">{open ? closeLabel : t.open}</span>
      </button>
    </div>
  );
}
