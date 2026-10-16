import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load the same env files as `next dev` (.env.local, never .env.production*).
// A variable set in the shell wins over the files: that is how `npm run db:migrate:prod` points a migration at the live database.
loadEnvConfig(process.cwd(), true);

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  // migrations use the session pooler (port 5432); the transaction pooler does not suit schema changes
  dbCredentials: { url: process.env.DATABASE_URL_MIGRATE ?? "" },
  // Supabase owns its own schemas (auth, storage, extensions, ...); only manage ours
  schemaFilter: ["public"],
  strict: true,
  verbose: true
});
