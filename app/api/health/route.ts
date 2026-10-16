import { sql } from "drizzle-orm";
import { db } from "@/lib/server/db";

// Health check: can the app reach the database, and is pgvector enabled?
// Returns no error details to the caller; those go to the server log.
export async function GET() {
  try {
    const [row] = await db.execute<{ pgvector: string | null }>(sql`select (select extversion from pg_extension where extname = 'vector') as pgvector`);
    const ok = Boolean(row?.pgvector);
    return Response.json({ ok, database: "up", pgvector: row?.pgvector ?? null }, { status: ok ? 200 : 503 });
  } catch (err) {
    console.error("[health] database check failed:", err instanceof Error ? err.message : err);
    return Response.json({ ok: false, database: "down" }, { status: 503 });
  }
}
