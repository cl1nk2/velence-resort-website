"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { subscribeNewsletter, type FormState } from "@/lib/actions/forms";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { BotFields, Consent, FormStatus, Input } from "./Field";

export function NewsletterForm({ locale, t, compact, privacyHref }: { locale: Locale; t: Dictionary["forms"]; compact?: boolean; privacyHref?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, { status: "idle" });
  if (state.status === "success") return <FormStatus state={state} t={t} success={t.newsletterSuccess} />;
  const bad = (f: string) => state.fields?.includes(f);
  return (
    <form action={action} className="relative space-y-4" noValidate={false}>
      <BotFields locale={locale} />
      <div className={compact ? "grid gap-3 sm:grid-cols-[1fr_1.4fr]" : "grid gap-4 sm:grid-cols-2"}>
        <Input label={t.name} name="name" autoComplete="name" requiredLabel={t.required} invalid={bad("name")} />
        <Input label={t.email} name="email" type="email" required autoComplete="email" requiredLabel={t.required} invalid={bad("email")} />
      </div>
      <Consent label={t.consent} href={privacyHref ?? (locale === "hu" ? "/hu/adatkezelesi-tajekoztato" : "/en/privacy-policy")} invalid={bad("consent")} requiredLabel={t.required} />
      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-navy-600 px-6 py-3 font-extrabold text-white transition hover:bg-navy-700 disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />
        {pending ? t.sending : t.subscribe}
      </button>
      <FormStatus state={state} t={t} success={t.newsletterSuccess} />
    </form>
  );
}
