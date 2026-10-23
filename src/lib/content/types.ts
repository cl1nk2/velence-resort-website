import type { Locale } from "@/lib/i18n/config";

export type ImageRef = { src: string; alt: string };

export type Block =
  | { type: "html"; html: string }
  | { type: "image"; src: string; alt: string }
  | { type: "split"; images: ImageRef[]; imageFirst: boolean; blocks: Block[] }
  | { type: "gallery"; items: ImageRef[] }
  | { type: "faq"; groups: { title: string; items: { q: string; a: string }[] }[] }
  | { type: "videos"; ids: string[] };

export type Facts = {
  size?: string;
  people?: string;
  building?: string;
  temp?: string;
  depth?: string;
  duration?: string;
};

export type PageLocale = {
  slug: string;
  title: string;
  subtitle?: string | null;
  metaTitle?: string;
  description?: string;
  excerpt?: string | null;
  blocks: Block[];
  facts?: Facts;
  pdfs?: string[];
};

export type Template =
  | "home"
  | "hotel"
  | "spa"
  | "content"
  | "rooms"
  | "room"
  | "pools"
  | "saunas"
  | "facility"
  | "sights"
  | "sight"
  | "helpers"
  | "person"
  | "faq"
  | "contact"
  | "newsletter"
  | "gallery"
  | "videos"
  | "offers"
  | "news"
  | "events"
  | "loyalty"
  | "reviews"
  | "prices"
  | "legal";

export type Section = "resort" | "hotel" | "spa";

export type Page = {
  id: string;
  section: Section;
  template: Template;
  parent?: string;
  order?: number;
  image?: string | null;
  cardImage?: string;
  gallery?: string[];
} & Partial<Record<Locale, PageLocale>>;

export type Offer = {
  id: string;
  sort: number;
  published: boolean;
  categories: string[];
  image: string | null;
  heroImage: string | null;
  validFrom: string | null;
  validTo: string | null;
  priceFrom: number | null;
  minNights: number | null;
} & Record<Locale, { slug: string; title: string; summary: string; highlights: string[] }>;

export type NewsItem = {
  id: string;
  category: "spa" | "ele-village" | "resort";
  date: string;
  published: boolean;
  image: string | null;
  gallery: string[];
  hu: { slug: string; title: string; excerpt: string; blocks: Block[] };
  en?: { slug: string; title: string; excerpt: string; blocks: Block[] };
};

export type Album = {
  id: string;
  section: Section;
  images: string[];
  cover: string | null;
} & Record<Locale, { slug: string; title: string }>;

export type Video = { id: string; hu: string; en: string; thumb: string };

export type PriceTable = {
  id: string;
  title: Record<Locale, string>;
  columns: Record<Locale, string[]>;
  rows: { label: Record<Locale, string>; prices: (number | null)[]; highlight?: boolean }[];
};

export type Prices = {
  validFrom: string;
  peakPeriods: { from: string; to: string }[];
  hours: Record<Locale, { spa: string; cashier: string }>;
  tables: PriceTable[];
  notes: Record<Locale, string[]>;
};
