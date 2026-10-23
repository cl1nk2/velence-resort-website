import { getImage, largestUrl, srcSet, variantUrl } from "@/lib/images";
import type { GalleryImage } from "@/components/ui/Gallery";

/** Resolve original image URLs to the props the client gallery needs. */
export function toGalleryImages(srcs: { src: string; alt?: string }[], fallbackAlt: string): GalleryImage[] {
  const out: GalleryImage[] = [];
  srcs.forEach((s, i) => {
    const e = getImage(s.src);
    if (!e) return;
    out.push({
      src: largestUrl(e),
      thumb: variantUrl(e, e.widths[0]),
      srcSet: srcSet(e),
      w: e.w,
      h: e.h,
      alt: s.alt || `${fallbackAlt} – ${i + 1}`,
      blur: e.blur,
    });
  });
  return out;
}
