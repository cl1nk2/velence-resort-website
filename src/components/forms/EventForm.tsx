"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { submitEvent, type FormState } from "@/lib/actions/forms";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { BotFields, Consent, FormStatus, Input, Select, Textarea } from "./Field";

export function EventForm({ locale, t, privacyHref }: { locale: Locale; t: Dictionary["forms"]; privacyHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitEvent, { status: "idle" });
  if (state.status === "success") return <FormStatus state={state} t={t} success={t.success} />;
  const bad = (f: string) => state.fields?.includes(f);
  return (
    <form action={action} className="relative space-y-4">
      <BotFields locale={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t.name} name="name" required autoComplete="name" requiredLabel={t.required} invalid={bad("name")} />
        <Input label={t.company} name="company" autoComplete="organization" requiredLabel={t.required} invalid={bad("company")} />
        <Input label={t.email} name="email" type="email" required autoComplete="email" requiredLabel={t.required} invalid={bad("email")} />
        <Input label={t.phone} name="phone" type="tel" autoComplete="tel" requiredLabel={t.required} invalid={bad("phone")} />
        <Select label={t.eventType} name="eventType" required requiredLabel={t.required} invalid={bad("eventType")} defaultValue={t.eventTypes[0]}>
          {t.eventTypes.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
        <Input label={t.guests} name="guests" type="number" min={1} max={2000} required inputMode="numeric" requiredLabel={t.required} invalid={bad("guests")} />
        <Input label={t.eventDate} name="eventDate" type="date" requiredLabel={t.required} invalid={bad("eventDate")} />
      </div>
      <Textarea label={t.message} name="message" requiredLabel={t.required} invalid={bad("message")} />
      <Consent label={t.consent} href={privacyHref} invalid={bad("consent")} requiredLabel={t.required} />
      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-spa-500 px-7 py-3.5 font-extrabold text-white transition hover:bg-spa-600 disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />
        {pending ? t.sending : t.submit}
      </button>
      <FormStatus state={state} t={t} success={t.success} />
    </form>
  );
}
