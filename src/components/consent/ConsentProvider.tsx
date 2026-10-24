"use client";

import { createContext, useCallback, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useClientValue } from "@/lib/use-client-value";

export type Consent = { analytics: boolean; media: boolean };
type Ctx = { consent: Consent | null; ready: boolean; save: (c: Consent) => void; reopen: () => void; open: boolean };

const ConsentContext = createContext<Ctx | null>(null);
const COOKIE = "vr_consent";
const VERSION = 1;

function parse(raw: string | undefined): Consent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    return v.v === VERSION ? { analytics: !!v.a, media: !!v.m } : null;
  } catch {
    return null;
  }
}

// The cookie is the store; the parsed value is cached per raw string so snapshots stay referentially stable.
const listeners = new Set<() => void>();
let cached: { raw: string | undefined; value: Consent | null } | null = null;
function read(): Consent | null {
  const raw = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))?.[1];
  if (!cached || cached.raw !== raw) cached = { raw, value: parse(raw) };
  return cached.value;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(subscribe, read, () => null);
  const ready = useClientValue(() => true, false);
  // Until the visitor saves or reopens, the banner shows exactly when no choice is stored.
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const open = openOverride ?? (ready && !consent);

  const save = useCallback((c: Consent) => {
    const value = encodeURIComponent(JSON.stringify({ v: VERSION, a: c.analytics, m: c.media }));
    document.cookie = `${COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax; Secure`;
    listeners.forEach((l) => l());
    setOpenOverride(false);
  }, []);

  const reopen = useCallback(() => setOpenOverride(true), []);

  return (
    <ConsentContext.Provider value={{ consent, ready, save, reopen, open }}>
      {children}
      {consent?.analytics && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const c = useContext(ConsentContext);
  if (!c) throw new Error("useConsent outside ConsentProvider");
  return c;
}
