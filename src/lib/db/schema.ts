import { boolean, date, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

type OfferI18n = { slug: string; title: string; summary: string; highlights: string[] };
type NewsI18n = { slug: string; title: string; excerpt: string; blocks: unknown[] };

export const offers = pgTable("offers", {
  id: text("id").primaryKey(),
  sort: integer("sort").notNull().default(0),
  published: boolean("published").notNull().default(true),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  image: text("image"),
  heroImage: text("hero_image"),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  priceFrom: integer("price_from"),
  minNights: integer("min_nights"),
  hu: jsonb("hu").$type<OfferI18n>().notNull(),
  en: jsonb("en").$type<OfferI18n>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const news = pgTable(
  "news",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull().default("resort"),
    date: date("date").notNull(),
    published: boolean("published").notNull().default(true),
    image: text("image"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    hu: jsonb("hu").$type<NewsI18n>().notNull(),
    en: jsonb("en").$type<NewsI18n | null>(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("news_date_idx").on(t.date)],
);

/** Small key/value store for editable singletons (spa prices, announcement banner). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // contact | event | newsletter
    locale: text("locale").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("submissions_created_idx").on(t.createdAt)],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    locale: text("locale").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("subscribers_email_idx").on(t.email)],
);

/** Fixed-window rate limiting shared across serverless instances. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});
