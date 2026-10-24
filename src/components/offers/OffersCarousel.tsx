"use client";

import { Children, useCallback, useSyncExternalStore, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

/** Swipeable, keyboard-operable carousel for server-rendered cards. */
export function Carousel({ children, labels, className }: { children: ReactNode; labels: { previous: string; next: string }; className?: string }) {
  const [ref, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false });
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!api) return () => {};
      api.on("select", cb).on("reInit", cb);
      return () => {
        api.off("select", cb).off("reInit", cb);
      };
    },
    [api],
  );
  const can = {
    prev: useSyncExternalStore(subscribe, () => api?.canScrollPrev() ?? false, () => false),
    next: useSyncExternalStore(subscribe, () => api?.canScrollNext() ?? true, () => true),
  };
  return (
    <div className={clsx("relative", className)}>
      <div className="overflow-hidden" ref={ref}>
        <ul className="-ml-5 flex touch-pan-y">
          {Children.map(children, (c) => (
            <li className="min-w-0 shrink-0 grow-0 basis-[85%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">{c}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={() => api?.scrollPrev()} disabled={!can.prev} className="grid size-12 place-items-center rounded-full bg-white text-navy-700 shadow-soft ring-1 ring-navy-100 transition hover:bg-navy-50 disabled:opacity-40" aria-label={labels.previous}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => api?.scrollNext()} disabled={!can.next} className="grid size-12 place-items-center rounded-full bg-navy-600 text-white shadow-soft transition hover:bg-navy-700 disabled:opacity-40" aria-label={labels.next}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
