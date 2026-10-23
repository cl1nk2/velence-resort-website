"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitContact, type FormState } from "@/lib/actions/forms";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { BotFields, Consent, FormStatus, Input, Textarea } from "./Field";

export function ContactForm({ locale, t, privacyHref }: { locale: Locale; t: Dictionary["forms"]; privacyHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, { status: "idle" });
  if (state.status === "success") return <FormStatus state={state} t={t} success={t.success} />;
  const bad = (f: string) => state.fields?.includes(f);
  return (
    <form action={action} className="relative space-y-4">
      <BotFields locale={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t.name} name="name" required autoComplete="name" requiredLabel={t.required} invalid={bad("name")} />
        <Input label={t.email} name="email" type="email" required autoComplete="email" requiredLabel={t.required} invalid={bad("email")} />
        <Input label={t.phone} name="phone" type="tel" autoComplete="tel" requiredLabel={t.required} invalid={bad("phone")} />
        <Input label={t.subject} name="subject" requiredLabel={t.required} invalid={bad("subject")} />
      </div>
      <Textarea label={t.message} name="message" required minLength={10} requiredLabel={t.required} invalid={bad("message")} />
      <Consent label={t.consent} href={privacyHref} invalid={bad("consent")} requiredLabel={t.required} />
      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-spa-500 px-7 py-3.5 font-extrabold text-white transition hover:bg-spa-600 disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />
        {pending ? t.sending : t.submit}
      </button>
      <FormStatus state={state} t={t} success={t.success} />
    </form>
  );
}
