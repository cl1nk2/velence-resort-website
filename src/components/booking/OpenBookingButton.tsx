"use client";

import type { ReactNode } from "react";
import { openBooking, type BookingPreset } from "./events";

function fromOffer(validFrom: string | null, nights: number | null): BookingPreset {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const arrival = validFrom && validFrom > tomorrow ? validFrom : tomorrow;
  const dep = new Date(arrival + "T12:00:00");
  dep.setDate(dep.getDate() + (nights ?? 2));
  return { arrival, departure: dep.toISOString().slice(0, 10) };
}

export function OpenBookingButton({
  children,
  className,
  preset,
  offer,
}: {
  children: ReactNode;
  className?: string;
  preset?: BookingPreset;
  /** Pre-fill dates from an offer's validity and minimum stay (computed at click time). */
  offer?: { validFrom: string | null; minNights: number | null };
}) {
  return (
    <button type="button" className={className} onClick={() => openBooking(offer ? fromOffer(offer.validFrom, offer.minNights) : preset)}>
      {children}
    </button>
  );
}
