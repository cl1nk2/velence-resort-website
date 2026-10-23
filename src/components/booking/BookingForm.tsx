"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Minus, Plus, Search, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { fmt } from "@/lib/i18n/format";

const ENGINE = "https://book.velencespa.com/foglalas/kereses";

function iso(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

type Props = {
  t: Dictionary["booking"];
  layout?: "bar" | "stack";
  tone?: "light" | "dark";
  initial?: { arrival?: string; departure?: string; adults?: number };
  className?: string;
};

/**
 * Availability search that hands off to the resort's booking engine (same fields as its own form).
 * Opens in a new tab so the visitor can come back to the site.
 */
export function BookingForm({ t, layout = "bar", tone = "light", initial, className }: Props) {
  // Dates depend on "today", so they are filled in on the client after mount.
  const [today, setToday] = useState("");
  const [arrival, setArrival] = useState(initial?.arrival ?? "");
  const [departure, setDeparture] = useState(initial?.departure ?? "");
  useEffect(() => {
    const now = iso(new Date());
    setToday(now);
    setArrival((a) => a || addDays(now, 7));
    setDeparture((d) => d || addDays(initial?.arrival ?? addDays(now, 7), 2));
  }, [initial?.arrival]);
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [ages, setAges] = useState<number[]>([]);
  const uid = useId();
  const nights = arrival && departure ? Math.round((new Date(departure).getTime() - new Date(arrival).getTime()) / 86400000) : 0;
  const invalid = !!arrival && !!departure && !(nights > 0);

  const onArrival = (v: string) => {
    setArrival(v);
    if (!(new Date(departure) > new Date(v))) setDeparture(addDays(v, 2));
  };

  const label = clsx("block text-xs font-extrabold uppercase tracking-wider", tone === "dark" ? "text-white/80" : "text-navy-700/70");
  const field = clsx(
    "mt-1 w-full rounded-xl border px-3 py-2.5 font-bold outline-none transition focus:ring-4",
    tone === "dark" ? "border-white/30 bg-white/10 text-white focus:ring-white/20 [color-scheme:dark]" : "border-navy-100 bg-white text-navy-800 focus:border-lake-400 focus:ring-lake-100",
  );

  return (
    <form action={ENGINE} method="post" target="_blank" className={clsx("w-full", className)} onSubmit={(e) => (invalid || !arrival || !departure) && e.preventDefault()} aria-describedby={`${uid}-note`}>
      <input type="hidden" name="Reservation[room_count]" value="1" />
      <input type="hidden" name="Reservation[room_persons][0][adults]" value={adults} />
      <input type="hidden" name="Reservation[room_persons][0][children_count]" value={ages.length} />
      {ages.map((a, i) => (
        <input key={i} type="hidden" name={`Reservation[room_persons][0][children][${i}][age]`} value={a} />
      ))}
      <div className={clsx("grid gap-3", layout === "bar" ? "sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor={`${uid}-a`} className={label}>
            {t.arrival}
          </label>
          <input id={`${uid}-a`} type="date" name="Reservation[arrival]" required min={today || undefined} value={arrival} onChange={(e) => onArrival(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={`${uid}-d`} className={label}>
            {t.departure}
            {nights > 0 && <span className="ml-2 normal-case tracking-normal opacity-80">· {fmt(t.nights, { n: nights })}</span>}
          </label>
          <input
            id={`${uid}-d`}
            type="date"
            name="Reservation[departure]"
            required
            min={arrival ? addDays(arrival, 1) : undefined}
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className={field}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${uid}-err` : undefined}
          />
        </div>
        <Stepper label={t.adults} value={adults} min={1} max={6} onChange={setAdults} tone={tone} labelClass={label} />
        <Stepper
          label={t.children}
          value={ages.length}
          min={0}
          max={4}
          tone={tone}
          labelClass={label}
          onChange={(n) => setAges((prev) => (n > prev.length ? [...prev, 6] : prev.slice(0, n)))}
        />
        <button
          type="submit"
          disabled={invalid || !arrival}
          className={clsx(
            "inline-flex h-[2.9rem] items-center justify-center gap-2 rounded-xl px-6 font-extrabold shadow-soft transition active:scale-[.98] disabled:opacity-50",
            layout === "stack" && "sm:col-span-2",
            "bg-spa-500 text-white hover:bg-spa-600",
          )}
        >
          <Search className="size-5" aria-hidden="true" />
          {t.search}
        </button>
      </div>
      {ages.length > 0 && (
        <fieldset className="mt-3 flex flex-wrap gap-3">
          <legend className="sr-only">{t.children}</legend>
          {ages.map((age, i) => (
            <label key={i} className={clsx("text-sm font-bold", tone === "dark" ? "text-white/90" : "text-navy-700")}>
              {fmt(t.childAge, { n: i + 1 })}
              <select
                className={clsx(field, "mt-1 w-auto py-1.5")}
                value={age}
                onChange={(e) => setAges((prev) => prev.map((x, j) => (j === i ? Number(e.target.value) : x)))}
              >
                {Array.from({ length: 18 }, (_, n) => (
                  <option key={n} value={n}>
                    {n === 0 ? t.under1 : `${n} ${t.years}`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </fieldset>
      )}
      {invalid && (
        <p id={`${uid}-err`} role="alert" className="mt-2 text-sm font-bold text-spa-600">
          {t.invalidDates}
        </p>
      )}
      <p id={`${uid}-note`} className={clsx("mt-3 flex items-center gap-2 text-xs", tone === "dark" ? "text-white/70" : "text-navy-800/60")}>
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        {t.bestPrice} · {t.note}
      </p>
    </form>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  tone,
  labelClass,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  tone: "light" | "dark";
  labelClass: string;
}) {
  const id = useId();
  const btn = clsx(
    "grid size-9 place-items-center rounded-lg transition disabled:opacity-30",
    tone === "dark" ? "bg-white/15 text-white hover:bg-white/25" : "bg-navy-50 text-navy-700 hover:bg-navy-100",
  );
  return (
    <div role="group" aria-labelledby={id}>
      <span id={id} className={labelClass}>
        {label}
      </span>
      <div className={clsx("mt-1 flex items-center gap-2 rounded-xl border px-1.5 py-1", tone === "dark" ? "border-white/30 bg-white/10" : "border-navy-100 bg-white")}>
        <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −`}>
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <output aria-live="polite" className={clsx("w-6 text-center font-extrabold", tone === "dark" ? "text-white" : "text-navy-800")}>
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +`}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
