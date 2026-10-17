// Creates (or resets) dummy accounts on the DEV database for testing, each in a different state, and writes their
// sign-in details to test-accounts.local.md (git-ignored). Never runs against the live database.
// Usage: npm run seed:test-users
//        npm run seed:test-users -- --no-live-file   only on a machine without .env.prod.local, when you're sure
//                                                    .env.local is the dev database
// The addresses use test.verisavo.dev, so no email can be delivered to them: they are confirmed already.
import crypto from "node:crypto";
import fs from "node:fs";
import postgres from "postgres";
import { devVersusLive, readUrl } from "./db-target.mjs";

const url = readUrl(".env.local");
if (!url) { console.error("DATABASE_URL_MIGRATE is missing in .env.local."); process.exit(1); }
const target = devVersusLive();
if (target === "same") { console.error(".env.local points at the live database. Dummy accounts are for dev only."); process.exit(1); }
if (target === "unknown" && !process.argv.includes("--no-live-file")) {
  console.error("There's no .env.prod.local to check that .env.local isn't the live database. If you're sure it's dev, add --no-live-file.");
  process.exit(1);
}

const USERS = [
  { email: "amina.bello@test.verisavo.dev", name: "Amina Bello", org: "Lagos Foods Ltd", plan: "free", used: 0, note: "Free plan, all 5 questions left" },
  { email: "kwame.mensah@test.verisavo.dev", name: "Kwame Mensah", org: "Accra Retail Co", plan: "free", used: 5, note: "Free plan, 5 of 5 used: sees the paywall" },
  { email: "chidi.okafor@test.verisavo.dev", name: "Chidi Okafor", org: "Okafor Distribution", plan: "paid", used: 40, note: "Paid plan (manual, 30 days), 40 of 100 used" },
  { email: "dee.disabled@test.verisavo.dev", name: "Dee Disabled", org: null, plan: "free", used: 0, note: "Disabled by an admin: can't sign in", disabled: true }
];
const password = () => `Vs${crypto.randomBytes(5).toString("hex")}9z`;

const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 2 });
const rows = [];
try {
  for (const u of USERS) {
    const pw = password();
    let [user] = await sql`select id from auth.users where lower(email) = ${u.email}`;
    if (user) {
      await sql`update auth.users set encrypted_password = extensions.crypt(${pw}, extensions.gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now() where id = ${user.id}`;
    } else {
      // a confirmed email + password user, the way Supabase Auth stores one; the signup trigger creates the profile
      [user] = await sql`
        insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                                created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', ${u.email},
                extensions.crypt(${pw}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
                ${sql.json({ name: u.name, organisation: u.org })}, now(), now(), '', '', '', '')
        returning id`;
      await sql`insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
                values (gen_random_uuid(), ${user.id}, ${user.id}, ${sql.json({ sub: user.id, email: u.email, email_verified: true })}, 'email', now(), now(), now())`;
    }
    await sql`update public.profiles set name = ${u.name}, organisation = ${u.org}, role = 'user', disabled_at = ${u.disabled ? new Date() : null}, updated_at = now() where id = ${user.id}`;
    // plan and usage
    await sql`delete from public.subscriptions where user_id = ${user.id} and id like 'manual_%'`;
    await sql`delete from public.usage_periods where user_id = ${user.id}`;
    await sql`insert into public.free_usage (user_id, used) values (${user.id}, ${u.plan === "free" ? u.used : 0}) on conflict (user_id) do update set used = excluded.used`;
    if (u.plan === "paid") {
      const [sub] = await sql`
        insert into public.subscriptions (id, user_id, status, price_id, current_period_start, current_period_end)
        values (${"manual_" + user.id}, ${user.id}, 'active', 'manual', now(), now() + interval '30 days') returning current_period_start, current_period_end`;
      await sql`insert into public.usage_periods (user_id, period_start, period_end, allowance, used) values (${user.id}, ${sub.current_period_start}, ${sub.current_period_end}, 100, ${u.used})`;
    }
    rows.push({ ...u, pw });
    console.log(`${u.email}: ${u.note}`);
  }
  fs.writeFileSync("test-accounts.local.md", [
    "# Dev test accounts (git-ignored; dev database only)",
    "",
    "Made by `npm run seed:test-users`. Running it again resets these accounts and makes new passwords.",
    "",
    "| Email | Password | State |",
    "|---|---|---|",
    ...rows.map(r => `| ${r.email} | ${r.pw} | ${r.note} |`),
    ""
  ].join("\n"));
  console.log("\nSign-in details written to test-accounts.local.md");
} finally {
  await sql.end({ timeout: 2 });
}
