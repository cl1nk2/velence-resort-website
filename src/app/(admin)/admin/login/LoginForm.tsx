"use client";

import { useActionState } from "react";
import { login, type AdminState } from "@/lib/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-bold text-navy-700">
        Password
        <input name="password" type="password" required autoComplete="current-password" autoFocus className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-3 outline-none focus:border-lake-400 focus:ring-4 focus:ring-lake-100" />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-spa-50 p-3 text-sm font-bold text-spa-700">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="w-full rounded-full bg-navy-600 py-3 font-extrabold text-white hover:bg-navy-700 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
