"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminState } from "@/lib/actions/admin";

export const inputCls = "mt-1 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-lake-400 focus:ring-4 focus:ring-lake-100";

export function AdminForm({ action, children, submit = "Save" }: { action: (s: AdminState, f: FormData) => Promise<AdminState>; children: ReactNode; submit?: string }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-6">
      {children}
      {state.error && (
        <p role="alert" className="rounded-xl bg-spa-50 p-3 text-sm font-bold text-spa-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Saved – the website updates immediately.
        </p>
      )}
      <button disabled={pending} className="rounded-full bg-navy-600 px-6 py-2.5 font-extrabold text-white hover:bg-navy-700 disabled:opacity-60">
        {pending ? "Saving…" : submit}
      </button>
    </form>
  );
}

export function F({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-bold text-navy-700">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-navy-800/75">{hint}</span>}
    </label>
  );
}
