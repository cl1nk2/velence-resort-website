"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { BookingForm } from "./BookingForm";
import type { BookingPreset } from "./events";

/** Global booking dialog, opened from anywhere via openBooking(). Uses native <dialog> for focus handling. */
export function BookingDialog({ t, closeLabel }: { t: Dictionary["booking"]; closeLabel: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [preset, setPreset] = useState<BookingPreset>({});
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setPreset((e as CustomEvent<BookingPreset>).detail ?? {});
      setKey((k) => k + 1);
      ref.current?.showModal();
    };
    window.addEventListener("velence:open-booking", onOpen);
    return () => window.removeEventListener("velence:open-booking", onOpen);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="booking-title"
      className="m-auto w-[min(44rem,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-navy-800 shadow-lift backdrop:bg-navy-950/60 backdrop:backdrop-blur-sm open:animate-[fadeIn_.3s_ease-out]"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="relative bg-gradient-to-br from-navy-600 to-lake-500 px-6 pb-6 pt-7 text-white sm:px-8">
        <p className="font-script text-3xl leading-none text-lake-100">Velence Resort & Spa</p>
        <h2 id="booking-title" className="mt-1 font-display text-3xl">
          {t.title}
        </h2>
        <button type="button" onClick={() => ref.current?.close()} className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/15" aria-label={closeLabel}>
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>
      <div className="p-6 sm:p-8">
        <BookingForm key={key} t={t} layout="stack" initial={preset} />
      </div>
    </dialog>
  );
}
