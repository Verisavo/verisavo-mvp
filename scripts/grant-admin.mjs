// Makes an existing account an admin (or takes admin away) on the dev or the live database.
// Usage: npm run admin:grant -- someone@example.com            dev database (.env.local)
//        npm run admin:grant -- someone@example.com --prod     live database (.env.prod.local, asks you to type "prod")
//        npm run admin:grant -- someone@example.com --revoke   back to a normal user
// There is no button for this on purpose: admin rights are given by someone with database access.
import fs from "node:fs";
import readline from "node:readline/promises";
import postgres from "postgres";

const args = process.argv.slice(2);
const email = (args.find(a => !a.startsWith("--")) ?? "").trim().toLowerCase();
const prod = args.includes("--prod"), revoke = args.includes("--revoke");
if (!email) { console.error("Usage: npm run admin:grant -- someone@example.com [--prod] [--revoke]"); process.exit(1); }

const file = prod ? ".env.prod.local" : ".env.local";
const line = fs.existsSync(file) && fs.readFileSync(file, "utf8").split(/\r?\n/).find(l => l.startsWith("DATABASE_URL_MIGRATE="));
const url = line ? line.slice("DATABASE_URL_MIGRATE=".length).trim().replace(/^["']|["']$/g, "") : "";
if (!url || url.includes("[YOUR-PASSWORD]")) { console.error(`DATABASE_URL_MIGRATE is missing in ${file}.`); process.exit(1); }

if (prod) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`About to ${revoke ? "remove admin from" : "make admin"} ${email} on the LIVE database (${new URL(url).hostname}). Type "prod" to continue: `);
  rl.close();
  if (answer.trim() !== "prod") { console.log("Cancelled. Nothing was changed."); process.exit(1); }
}

const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 2 });
try {
  const rows = await sql`
    update public.profiles set role = ${revoke ? "user" : "admin"}, updated_at = now()
    where id = (select id from auth.users where lower(email) = ${email})
    returning id`;
  if (!rows.length) { console.error(`No account found for ${email}. They need to sign up first.`); process.exitCode = 1; }
  else {
    await sql`insert into public.audit_events (action, target_type, target_id, metadata) values (${revoke ? "admin.role_revoked" : "admin.role_granted"}, 'user', ${rows[0].id}, ${sql.json({ via: "script" })})`;
    console.log(`${email} is ${revoke ? "no longer an admin" : "now an admin"}${prod ? " on the live database" : " on dev"}.`);
  }
} finally {
  await sql.end({ timeout: 2 });
}
