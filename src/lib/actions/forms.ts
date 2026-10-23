"use server";

import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export type FormState = { status: "idle" | "success" | "error"; code?: "invalid" | "rate" | "server"; fields?: string[]; demo?: boolean };

const locale = z.enum(["hu", "en"]);
const base = {
  locale,
  website: z.string().max(0).optional(), // honeypot
  ts: z.coerce.number(),
};

function botCheck(ts: number) {
  // Humans need more than ~2 seconds to fill a form; reject absurdly old or future timestamps too.
  const age = Date.now() - ts;
  return age > 2000 && age < 1000 * 60 * 60 * 6;
}

function fieldsOf(err: z.ZodError) {
  return [...new Set(err.issues.map((i) => String(i.path[0])))];
}

const Contact = z.object({
  ...base,
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal("on"),
});

const Event = z.object({
  ...base,
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  eventType: z.string().trim().max(60),
  eventDate: z.string().trim().max(20).optional().or(z.literal("")),
  guests: z.coerce.number().int().min(1).max(2000),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal("on"),
});

const Newsletter = z.object({
  ...base,
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.email().max(200),
  consent: z.literal("on"),
});

async function guard(scope: string, limit = 5, windowSec = 600): Promise<FormState | null> {
  const rl = await rateLimit(await clientKey(scope), limit, windowSec);
  return rl.ok ? null : { status: "error", code: "rate" };
}

async function store(kind: string, loc: string, data: Record<string, unknown>) {
  if (!db) return false;
  await db.insert(schema.submissions).values({ kind, locale: loc, data });
  return true;
}

export async function submitContact(_: FormState, form: FormData): Promise<FormState> {
  const parsed = Contact.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", code: "invalid", fields: fieldsOf(parsed.error) };
  if (!botCheck(parsed.data.ts)) return { status: "success" }; // silently drop bots
  const limited = await guard("contact");
  if (limited) return limited;
  try {
    const { website: _w, ts: _t, consent: _c, locale: loc, ...data } = parsed.data;
    const saved = await store("contact", loc, data);
    return { status: "success", demo: !saved };
  } catch (e) {
    console.error("submitContact", e);
    return { status: "error", code: "server" };
  }
}

export async function submitEvent(_: FormState, form: FormData): Promise<FormState> {
  const parsed = Event.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", code: "invalid", fields: fieldsOf(parsed.error) };
  if (!botCheck(parsed.data.ts)) return { status: "success" };
  const limited = await guard("event");
  if (limited) return limited;
  try {
    const { website: _w, ts: _t, consent: _c, locale: loc, ...data } = parsed.data;
    const saved = await store("event", loc, data);
    return { status: "success", demo: !saved };
  } catch (e) {
    console.error("submitEvent", e);
    return { status: "error", code: "server" };
  }
}

export async function subscribeNewsletter(_: FormState, form: FormData): Promise<FormState> {
  const parsed = Newsletter.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: "error", code: "invalid", fields: fieldsOf(parsed.error) };
  if (!botCheck(parsed.data.ts)) return { status: "success" };
  const limited = await guard("newsletter", 5, 600);
  if (limited) return limited;
  try {
    if (!db) return { status: "success", demo: true };
    await db
      .insert(schema.subscribers)
      .values({ email: parsed.data.email.toLowerCase(), name: parsed.data.name || null, locale: parsed.data.locale })
      .onConflictDoNothing();
    return { status: "success" };
  } catch (e) {
    console.error("subscribeNewsletter", e);
    return { status: "error", code: "server" };
  }
}
