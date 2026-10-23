"use client";

import { useState } from "react";
import clsx from "clsx";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Expand } from "lucide-react";

export type GalleryImage = { src: string; thumb: string; srcSet?: string; w: number; h: number; alt: string; blur?: string };

/** Masonry grid with an accessible, swipeable lightbox. */
export function Gallery({ images, layout = "masonry", openLabel, limit }: { images: GalleryImage[]; layout?: "masonry" | "strip" | "grid"; openLabel: string; limit?: number }) {
  const [index, setIndex] = useState(-1);
  const shown = limit ? images.slice(0, limit) : images;
  return (
    <>
      <ul
        className={clsx(
          layout === "masonry" && "columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3",
          layout === "grid" && "grid grid-cols-2 gap-3 sm:grid-cols-3",
          layout === "strip" && "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2",
        )}
      >
        {shown.map((img, i) => (
          <li key={img.src + i} className={clsx("break-inside-avoid", layout === "strip" && "w-72 shrink-0 snap-start sm:w-96")}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-navy-100 focus-visible:outline-offset-4"
              aria-label={`${openLabel}: ${img.alt || `${i + 1}`}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumb}
                srcSet={img.srcSet}
                sizes={layout === "strip" ? "384px" : "(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"}
                alt=""
                width={img.w}
                height={img.h}
                loading="lazy"
                decoding="async"
                className={clsx("w-full object-cover transition duration-700 ease-out-expo group-hover:scale-105", (layout === "grid" || layout === "strip") && "aspect-[4/3]")}
                style={img.blur ? { backgroundImage: `url(${img.blur})`, backgroundSize: "cover" } : undefined}
              />
              <span className="absolute inset-0 grid place-items-center bg-navy-900/0 opacity-0 transition group-hover:bg-navy-900/30 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="size-8 text-white drop-shadow" aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Zoom, Counter, Thumbnails]}
        slides={images.map((img) => ({
          src: img.src,
          alt: img.alt,
          width: img.w,
          height: img.h,
          srcSet: img.srcSet
            ? img.srcSet.split(", ").map((s) => {
                const [u, w] = s.split(" ");
                const width = parseInt(w);
                return { src: u, width, height: Math.round((img.h / img.w) * width) };
              })
            : undefined,
        }))}
        thumbnails={{ width: 96, height: 64, border: 0, borderRadius: 8, gap: 8 }}
        styles={{ container: { backgroundColor: "rgba(11,21,29,.96)" } }}
      />
    </>
  );
}
