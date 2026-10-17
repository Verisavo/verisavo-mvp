// Gives an existing account the paid plan without Stripe (a "manual" subscription), or takes it away.
// For testing paid features, or a complimentary account. Stripe never touches these rows (their ids start "manual_").
// Usage: npm run plan:grant -- someone@example.com                 dev database (.env.local), 30 days
//        npm run plan:grant -- someone@example.com --days 365
//        npm run plan:grant -- someone@example.com --revoke        back to the free plan
//        npm run plan:grant -- someone@example.com --prod          live database (asks you to type "prod")
import fs from "node:fs";
import readline from "node:readline/promises";
import postgres from "postgres";

const args = process.argv.slice(2);
const email = (args.find(a => !a.startsWith("--") && !/^\d+$/.test(a)) ?? "").trim().toLowerCase();
const prod = args.includes("--prod"), revoke = args.includes("--revoke");
const days = Number(args[args.indexOf("--days") + 1]) || 30;
if (!email || (args.includes("--days") && !(days > 0 && days <= 3650))) {
  console.error("Usage: npm run plan:grant -- someone@example.com [--days 30] [--revoke] [--prod]");
  process.exit(1);
}

const file = prod ? ".env.prod.local" : ".env.local";
const line = fs.existsSync(file) && fs.readFileSync(file, "utf8").split(/\r?\n/).find(l => l.startsWith("DATABASE_URL_MIGRATE="));
const url = line ? line.slice("DATABASE_URL_MIGRATE=".length).trim().replace(/^["']|["']$/g, "") : "";
if (!url || url.includes("[YOUR-PASSWORD]")) { console.error(`DATABASE_URL_MIGRATE is missing in ${file}.`); process.exit(1); }

if (prod) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`About to ${revoke ? "remove the manual plan from" : `give ${days} days of the paid plan to`} ${email} on the LIVE database (${new URL(url).hostname}). Type "prod" to continue: `);
  rl.close();
  if (answer.trim() !== "prod") { console.log("Cancelled. Nothing was changed."); process.exit(1); }
}

const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 2 });
try {
  const [user] = await sql`select id from auth.users where lower(email) = ${email}`;
  if (!user) { console.error(`No account found for ${email}. They need to sign up first.`); process.exitCode = 1; }
  else if (revoke) {
    const removed = await sql`delete from public.subscriptions where id = ${"manual_" + user.id} returning id`;
    if (removed.length) await sql`insert into public.audit_events (action, target_type, target_id, metadata) values ('billing.manual_revoked', 'user', ${user.id}, ${sql.json({ via: "script" })})`;
    console.log(removed.length ? `${email} is back on the free plan${prod ? " on the live database" : " on dev"}.` : `${email} had no manual plan.`);
  } else {
    // a new period from today; usage for it starts at 0 (lib/server/entitlements.ts creates the row on first use)
    const [sub] = await sql`
      insert into public.subscriptions (id, user_id, status, price_id, current_period_start, current_period_end, cancel_at_period_end)
      values (${"manual_" + user.id}, ${user.id}, 'active', 'manual', now(), now() + make_interval(days => ${days}), false)
      on conflict (id) do update set status = 'active', current_period_start = now(), current_period_end = now() + make_interval(days => ${days}), updated_at = now()
      returning current_period_end`;
    await sql`insert into public.audit_events (action, target_type, target_id, metadata) values ('billing.manual_granted', 'user', ${user.id}, ${sql.json({ via: "script", days })})`;
    console.log(`${email} has the paid plan until ${sub.current_period_end.toISOString().slice(0, 10)}${prod ? " on the live database" : " on dev"}.`);
  }
} finally {
  await sql.end({ timeout: 2 });
}
