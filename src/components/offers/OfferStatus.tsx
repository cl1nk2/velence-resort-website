"use client";

import { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Card";

/** Live badge: "available now" or "starts in N days" (computed on the client so cached pages stay accurate). */
export function OfferStatus({ from, to, labels }: { from: string | null; to: string | null; labels: { ongoing: string; upcoming: string; countdown: string; days: string } }) {
  const [text, setText] = useState<{ tone: "spa" | "gold"; label: string } | null>(null);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (!from || from <= today) {
      if (!to || to >= today) setText({ tone: "spa", label: labels.ongoing });
      return;
    }
    const days = Math.ceil((new Date(from).getTime() - Date.now()) / 86400000);
    setText(days <= 60 ? { tone: "gold", label: `${labels.countdown}: ${days} ${labels.days}` } : { tone: "gold", label: labels.upcoming });
  }, [from, to, labels]);
  if (!text) return null;
  return <Chip tone={text.tone}>{text.label}</Chip>;
}
