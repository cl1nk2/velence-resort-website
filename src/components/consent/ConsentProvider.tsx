"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export type Consent = { analytics: boolean; media: boolean };
type Ctx = { consent: Consent | null; ready: boolean; save: (c: Consent) => void; reopen: () => void; open: boolean };

const ConsentContext = createContext<Ctx | null>(null);
const COOKIE = "vr_consent";
const VERSION = 1;

function read(): Consent | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    const v = JSON.parse(decodeURIComponent(m[1]));
    return v.v === VERSION ? { analytics: !!v.a, media: !!v.m } : null;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = read();
    setConsent(c);
    setOpen(!c);
    setReady(true);
  }, []);

  const save = useCallback((c: Consent) => {
    const value = encodeURIComponent(JSON.stringify({ v: VERSION, a: c.analytics, m: c.media }));
    document.cookie = `${COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax; Secure`;
    setConsent(c);
    setOpen(false);
  }, []);

  const reopen = useCallback(() => setOpen(true), []);

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
