// Applies the migrations in db/migrations to the LIVE database.
// The live connection string lives in .env.prod.local (gitignored, and never read by Next.js),
// so `npm run db:migrate` can only ever reach the dev database in .env.local.
//
// Usage: npm run db:migrate:prod            shows the target and asks you to type "prod"
//        npm run db:migrate:prod -- --yes   no question (for scripted use)
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import readline from "node:readline/promises";

const FILE = ".env.prod.local";

if (!fs.existsSync(FILE)) {
  console.error(`${FILE} not found. Create it with DATABASE_URL_MIGRATE=<live session pooler string>.`);
  process.exit(1);
}
const line = fs.readFileSync(FILE, "utf8").split(/\r?\n/).find(l => l.startsWith("DATABASE_URL_MIGRATE="));
const url = line ? line.slice("DATABASE_URL_MIGRATE=".length).trim().replace(/^["']|["']$/g, "") : "";
if (!url || url.includes("[YOUR-PASSWORD]")) {
  console.error(`DATABASE_URL_MIGRATE in ${FILE} is empty or still has the [YOUR-PASSWORD] placeholder.`);
  process.exit(1);
}
let target;
try {
  const u = new URL(url);
  target = `${u.hostname}:${u.port}`;
} catch {
  console.error(`DATABASE_URL_MIGRATE in ${FILE} is not a valid URL. Percent-encode special characters in the password.`);
  process.exit(1);
}

console.log(`About to apply migrations to the LIVE database at ${target}`);
if (!process.argv.includes("--yes")) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('Type "prod" to continue: ');
  rl.close();
  if (answer.trim() !== "prod") {
    console.log("Cancelled. Nothing was changed.");
    process.exit(1);
  }
}

// A variable passed in the environment wins over .env.local (see drizzle.config.js), so this run reaches the live database only
const result = spawnSync("npx drizzle-kit migrate", { stdio: "inherit", shell: true, env: { ...process.env, DATABASE_URL_MIGRATE: url } });
process.exit(result.status ?? 1);
