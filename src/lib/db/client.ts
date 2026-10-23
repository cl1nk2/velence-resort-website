import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

/** Drizzle client, or null when no database is configured (the site then serves bundled seed content). */
export const db = url ? drizzle(neon(url), { schema }) : null;
export const hasDb = !!db;
export { schema };
