"use client";

import clsx from "clsx";
import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { FormState } from "@/lib/actions/forms";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";

const control = "mt-1.5 w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-navy-800 outline-none transition placeholder:text-navy-800/40 focus:border-lake-400 focus:ring-4 focus:ring-lake-100 aria-[invalid=true]:border-spa-500 aria-[invalid=true]:ring-spa-100";

type Common = { label: string; name: string; required?: boolean; invalid?: boolean; requiredLabel: string; hint?: string };

function Label({ id, label, required, requiredLabel }: { id: string; label: string; required?: boolean; requiredLabel: string }) {
  return (
    <label htmlFor={id} className="text-sm font-bold text-navy-700">
      {label}
      {required && (
        <span className="text-spa-500" aria-hidden="true">
          {" "}
          *
        </span>
      )}
      {required && <span className="sr-only"> ({requiredLabel})</span>}
    </label>
  );
}

export function Input({ label, name, required, invalid, requiredLabel, hint, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <Label id={id} label={label} required={required} requiredLabel={requiredLabel} />
      <input id={id} name={name} required={required} aria-invalid={invalid || undefined} className={control} {...rest} />
      {hint && <p className="mt-1 text-xs text-navy-800/60">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, name, required, invalid, requiredLabel, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div>
      <Label id={id} label={label} required={required} requiredLabel={requiredLabel} />
      <textarea id={id} name={name} required={required} aria-invalid={invalid || undefined} rows={5} className={control} {...rest} />
    </div>
  );
}

export function Select({ label, name, required, invalid, requiredLabel, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  return (
    <div>
      <Label id={id} label={label} required={required} requiredLabel={requiredLabel} />
      <select id={id} name={name} required={required} aria-invalid={invalid || undefined} className={control} {...rest}>
        {children}
      </select>
    </div>
  );
}

export function Consent({ label, href, invalid, requiredLabel }: { label: string; href: string; invalid?: boolean; requiredLabel: string }) {
  return (
    <label className={clsx("flex gap-3 text-sm text-navy-800/80", invalid && "text-spa-600")}>
      <input type="checkbox" name="consent" required aria-invalid={invalid || undefined} className="mt-0.5 size-5 shrink-0 accent-navy-600" />
      <span>
        <a href={href} className="font-bold underline underline-offset-2" target="_blank" rel="noopener">
          {label}
        </a>{" "}
        <span className="sr-only">({requiredLabel})</span>
      </span>
    </label>
  );
}

/** Honeypot + render timestamp used by the server actions' bot checks. */
export function BotFields({ locale }: { locale: string }) {
  const [ts, setTs] = useState("");
  useEffect(() => setTs(String(Date.now())), []);
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="ts" value={ts} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}

export function FormStatus({ state, t, success }: { state: FormState; t: Dictionary["forms"]; success: string }) {
  if (state.status === "idle") return null;
  const ok = state.status === "success";
  const msg = ok ? success : state.code === "rate" ? t.rateLimited : state.code === "invalid" ? t.invalid : t.error;
  return (
    <div role={ok ? "status" : "alert"} className={clsx("flex items-start gap-3 rounded-2xl p-4 text-sm font-bold", ok ? "bg-emerald-50 text-emerald-800" : "bg-spa-50 text-spa-700")}>
      {ok ? <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="size-5 shrink-0" aria-hidden="true" />}
      <span>
        {msg}
        {ok && state.demo && <span className="mt-1 block font-normal opacity-80">{t.demoNote}</span>}
      </span>
    </div>
  );
}
