import clsx from "clsx";
import { getImage, largestUrl, srcSet } from "@/lib/images";

type Props = {
  src: string | undefined | null;
  alt: string;
  sizes?: string;
  className?: string;
  /** Fill the positioned parent (object-cover). */
  fill?: boolean;
  priority?: boolean;
  /** Show the blurred placeholder while loading. */
  placeholder?: boolean;
};

/**
 * Responsive image backed by pre-optimised WebP variants (see scripts/images).
 * We avoid runtime image optimisation so the site stays within Vercel Hobby limits.
 */
export function Img({ src, alt, sizes = "100vw", className, fill, priority, placeholder = true }: Props) {
  const entry = getImage(src);
  if (!entry) {
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={clsx(fill && "absolute inset-0 h-full w-full object-cover", className)} loading={priority ? "eager" : "lazy"} decoding="async" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={largestUrl(entry)}
      srcSet={srcSet(entry)}
      sizes={sizes}
      width={entry.w}
      height={entry.h}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      className={clsx(fill && "absolute inset-0 h-full w-full object-cover", className)}
      style={placeholder && entry.blur ? { backgroundImage: `url(${entry.blur})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    />
  );
}
