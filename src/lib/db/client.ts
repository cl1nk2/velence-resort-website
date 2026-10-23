import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// Both drivers expose the same query-builder API; type them as one for callers.
function create(): NodePgDatabase<typeof schema> | null {
  if (!url) return null;
  // Neon (production) uses the HTTP driver – ideal for serverless; any other Postgres (local dev, CI) uses TCP.
  if (/neon\.tech|neon\.build/.test(url)) return drizzleNeon(neon(url), { schema }) as unknown as NodePgDatabase<typeof schema>;
  return drizzlePg(new Pool({ connectionString: url, max: 3 }), { schema });
}

/** Drizzle client, or null when no database is configured (the site then serves bundled seed content). */
export const db = create();
export const hasDb = !!db;
export { schema };
