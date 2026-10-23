import manifest from "@/content/images.json";

export type ImageEntry = { id: string; w: number; h: number; widths: number[]; blur: string };
const images = manifest as Record<string, ImageEntry>;

/** Resolve an original (zcms.hu) URL or a local `/img/...` id to the optimised variants. */
export function getImage(src: string | undefined | null): ImageEntry | null {
  if (!src) return null;
  return images[src] ?? images[src.replace(/^http:/, "https:")] ?? null;
}

export function variantUrl(entry: ImageEntry, width: number) {
  return `/img/${entry.id}-${width}.webp`;
}

export function srcSet(entry: ImageEntry) {
  return entry.widths.map((w) => `${variantUrl(entry, w)} ${w}w`).join(", ");
}

export function largestUrl(entry: ImageEntry) {
  return variantUrl(entry, entry.widths[entry.widths.length - 1]);
}

/** Absolute URL of a representative image, for Open Graph / JSON-LD. */
export function ogImageUrl(src: string | undefined | null) {
  const e = getImage(src);
  if (!e) return undefined;
  const w = e.widths.find((x) => x >= 1200) ?? e.widths[e.widths.length - 1];
  return variantUrl(e, w);
}
