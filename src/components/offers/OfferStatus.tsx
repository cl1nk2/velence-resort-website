"use client";

import { Chip } from "@/components/ui/Card";
import { useClientValue } from "@/lib/use-client-value";

/** Live badge: "available now" or "starts in N days" (computed on the client so cached pages stay accurate). */
export function OfferStatus({ from, to, labels }: { from: string | null; to: string | null; labels: { ongoing: string; upcoming: string; countdown: string; days: string } }) {
  const today = useClientValue(() => new Date().toISOString().slice(0, 10), null);
  if (!today) return null;
  if (!from || from <= today) return !to || to >= today ? <Chip tone="spa">{labels.ongoing}</Chip> : null;
  const days = Math.round((Date.parse(from) - Date.parse(today)) / 86400000);
  return <Chip tone="gold">{days <= 60 ? `${labels.countdown}: ${days} ${labels.days}` : labels.upcoming}</Chip>;
}
