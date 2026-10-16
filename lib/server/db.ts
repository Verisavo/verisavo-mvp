import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// One Postgres client per server process. Development hot reload re-runs this module,
// so the client is kept on globalThis to avoid opening a new pool on every edit.
// prepare: false is required by Supabase's transaction pooler (DATABASE_URL, port 6543).
const globalForDb = globalThis as typeof globalThis & { __verisavoSql?: postgres.Sql };
const client = globalForDb.__verisavoSql ?? postgres(process.env.DATABASE_URL ?? "", { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.__verisavoSql = client;

export const db = drizzle(client, { schema });
