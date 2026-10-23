import clsx from "clsx";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/ui/Reveal";
import { Gallery } from "@/components/ui/Gallery";
import { YouTube } from "@/components/ui/YouTube";
import { FaqList } from "./FaqList";
import { Html } from "./Html";

export { Html };
import type { Block } from "@/lib/content/types";
import { toGalleryImages } from "@/lib/gallery-props";
import type { Dictionary } from "@/lib/i18n/dictionaries/hu";
import { videos } from "@/lib/content/pages";
import type { Locale } from "@/lib/i18n/config";

export function Blocks({ blocks, t, locale, title }: { blocks: Block[]; t: Dictionary; locale: Locale; title: string }) {
  let splitIndex = 0;
  return (
    <div className="space-y-14">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "html":
            return (
              <Reveal key={i} className="mx-auto max-w-3xl">
                <Html html={b.html} />
              </Reveal>
            );
          case "split": {
            const flip = splitIndex++ % 2 === 1;
            return (
              <Reveal key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                <div className={clsx("relative", flip && "lg:order-2")}>
                  <div aria-hidden="true" className={clsx("absolute -inset-3 -z-10 rounded-[2.5rem] bg-lake-100", flip ? "rotate-2" : "-rotate-2")} />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft">
                    <Img src={b.images[0]?.src} alt={b.images[0]?.alt ?? ""} fill sizes="(min-width:1024px) 40vw, 100vw" className="transition duration-[1.2s] ease-out-expo hover:scale-105" />
                  </div>
                </div>
                <div className="space-y-6">
                  {b.blocks.map((x, j) =>
                    x.type === "html" ? <Html key={j} html={x.html} /> : x.type === "faq" ? <FaqList key={j} groups={x.groups} /> : null,
                  )}
                </div>
              </Reveal>
            );
          }
          case "image":
            return (
              <Reveal key={i} as="figure" className="mx-auto max-w-4xl">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-soft">
                  <Img src={b.src} alt={b.alt} fill sizes="(min-width:1024px) 900px, 100vw" />
                </div>
                {b.alt && <figcaption className="mt-3 text-center text-sm text-navy-800/75">{b.alt}</figcaption>}
              </Reveal>
            );
          case "gallery":
            return (
              <Reveal key={i}>
                <Gallery images={toGalleryImages(b.items, title)} openLabel={t.common.photos} layout={b.items.length <= 4 ? "grid" : "masonry"} />
              </Reveal>
            );
          case "faq":
            return (
              <Reveal key={i} className="mx-auto max-w-3xl">
                <FaqList groups={b.groups} />
              </Reveal>
            );
          case "videos":
            return (
              <div key={i} className="grid gap-6 md:grid-cols-2">
                {b.ids.map((id) => {
                  const v = videos.find((x) => x.id === id);
                  return (
                    <YouTube
                      key={id}
                      id={id}
                      title={v?.[locale] ?? "Video"}
                      thumb={v?.thumb ?? `/img/yt/${id}.webp`}
                      playLabel={t.a11y.playVideo}
                      consentText={t.consent.mediaBlocked}
                      enableLabel={t.consent.enableMedia}
                    />
                  );
                })}
              </div>
            );
        }
      })}
    </div>
  );
}
