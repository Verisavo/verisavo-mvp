// M4: WhatsApp without Meta. A stand-in for the Graph API on :4010 records our replies; signed fake webhooks play the
// user. Needs .env.local with WHATSAPP_APP_SECRET, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and
// WHATSAPP_API_BASE=http://localhost:4010 (test values only). Spends a few short AI answers.
import fs from "node:fs";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { BASE, Client, cleanup, configured, createUser, env, metaStandIn, png, removePlan, givePlan, sleep, sql, whatsappInbound as inbound } from "./helpers.mjs";

const skip = !(configured.whatsappStandIn && configured.answers && configured.search) && "needs the WhatsApp test settings (WHATSAPP_API_BASE=http://localhost:4010) and AI keys";
const meta = metaStandIn({ MEDIA_RED: { bytes: png(48, 48, [210, 25, 25]), mime: "image/png" } });
const PHONE = `23480${String(Date.now()).slice(-8)}`, OTHER_PHONE = `44770${String(Date.now()).slice(-7)}`;
const web = new Client();
let user, other;
const linkedPhone = async () => (await sql`select phone from whatsapp_links where user_id = ${user.id}`)[0]?.phone;
const used = async () => (await sql`select coalesce(max(used), -1)::int n from usage_periods where user_id = ${user.id}`)[0].n;
const codeOn = page => page.text.match(/tracking-\[\.3em\][^>]*>(\d{6})</)?.[1];
async function link() {
  const r = await web.submit("/dashboard", 'name="phone"', { phone: `+${PHONE}` }, "/dashboard");
  const mark = meta.sent.length;
  await inbound(PHONE, { type: "text", text: { body: `LINK ${codeOn(r)}` } });
  return meta.repliesTo(PHONE, mark);
}
async function say(text, from = PHONE) {
  const mark = meta.sent.length;
  await inbound(from, { type: "text", text: { body: text } });
  return meta.repliesTo(from, mark);
}

before(async () => {
  if (skip) return;
  await meta.start();
  user = await createUser({ name: "WhatsApp Tester" });
  other = await createUser({ paid: true });
  await sql`insert into whatsapp_links (user_id, phone) values (${other.id}, ${OTHER_PHONE})`;
  await web.login(user);
});
after(async () => {
  if (!skip) await meta.stop();
  await cleanup();
  await sql.end({ timeout: 2 });
});

test("the webhook checks Meta's verify token and signature", { skip }, async () => {
  const ok = await fetch(`${BASE}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${env("WHATSAPP_VERIFY_TOKEN")}&hub.challenge=4242`);
  assert.equal(await ok.text(), "4242");
  assert.equal((await fetch(`${BASE}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=1`)).status, 403);
  assert.equal((await inbound(PHONE, { type: "text", text: { body: "hi" } }, { secret: "not-the-secret" })).status, 401);
});

test("an unlinked number gets a link to the dashboard, not an answer (M4.3)", { skip }, async () => {
  const reply = await say("What is happening in Lagos retail?");
  assert.match(reply, /isn't linked/);
  assert.match(reply, /dashboard#whatsapp/);
});

test("linking: subscribers only; the code must come from the number; the reply names the account (M4.2)", { skip }, async () => {
  assert.ok(!(await web.page("/dashboard")).html.includes('name="phone"'), "free plan: no link form");
  await givePlan(user);
  const local = await web.submit("/dashboard", 'name="phone"', { phone: "08031234567" }, "/dashboard");
  assert.match(local.text, /country code/);
  const started = await web.submit("/dashboard", 'name="phone"', { phone: `+${PHONE}` }, "/dashboard");
  const code = codeOn(started);
  assert.ok(code && /wa\.me\/\d+\?text=LINK%20\d{6}/.test(started.text));
  assert.match(await say(`LINK ${code}`, `44700${String(Date.now()).slice(-7)}`), /didn’t match/);
  const reply = await say(`link ${code}`);
  assert.equal(await linkedPhone(), PHONE);
  assert.match(reply, /linked to the Verisavo account \S•••@/);
  assert.match(reply, /Reply UNLINK/);
});

test("the phone can always undo a link; old messages and other numbers are ignored", { skip }, async () => {
  assert.match(await say("UNLINK"), /no longer linked/);
  assert.equal(await linkedPhone(), undefined);
  await link();
  assert.equal(await linkedPhone(), PHONE);
  const mark = meta.sent.length;
  await inbound(PHONE, { type: "text", text: { body: "old" } }, { age: 8 * 24 * 3600 });
  await inbound(PHONE, { type: "text", text: { body: "elsewhere" } }, { phoneNumberId: "ANOTHER_NUMBER" });
  await sleep(3000);
  assert.equal(meta.sent.slice(mark).filter(s => s.to === PHONE).length, 0);
  await inbound(PHONE, { type: "system", system: { type: "user_changed_number", new_wa_id: "2348030000000" } });
  await sleep(2500);
  assert.equal(await linkedPhone(), undefined, "a changed number is unlinked");
  await link();
});

test("one assistant, one history, one allowance across web and WhatsApp (M4.1, M4.4, M4.5, D5)", { skip }, async () => {
  const w = await web.ask("Reply with one short sentence about African retail.");
  assert.equal(w.end?.type, "done");
  const before = await used();
  const reply = await say("And in one more short sentence?");
  assert.ok(reply.length > 5 && !/isn't linked|part of Verisavo Monthly/.test(reply), reply);
  const rows = await sql`select conversation_id, channel from messages where user_id = ${user.id} order by created_at desc limit 2`;
  assert.ok(rows.every(r => r.conversation_id === w.start.conversationId && r.channel === "whatsapp"), "joined the web conversation");
  assert.equal(await used(), before + 1);
  // Meta redelivers the same message: answered and counted once
  const id = "wamid.E2E-REDELIVERED";
  const m0 = meta.sent.length;
  await inbound(PHONE, { id, type: "text", text: { body: "Say OK." } });
  await meta.repliesTo(PHONE, m0);
  const n = await used(), m1 = meta.sent.length;
  await inbound(PHONE, { id, type: "text", text: { body: "Say OK." } });
  await sleep(3000);
  assert.equal(meta.sent.slice(m1).filter(s => s.to === PHONE).length, 0);
  assert.equal(await used(), n);
});

test("images on WhatsApp are kept for the next question; voice notes are declined", { skip }, async () => {
  const before = await used();
  const m0 = meta.sent.length;
  await inbound(PHONE, { type: "image", image: { id: "MEDIA_RED", mime_type: "image/png" } });
  assert.match(await meta.repliesTo(PHONE, m0), /What would you like to know/);
  assert.equal(await used(), before, "not counted");
  assert.match(await say("What colour is the picture I just sent?"), /red/i);
  const m1 = meta.sent.length;
  await inbound(PHONE, { type: "audio", audio: { id: "MEDIA_X" } });
  assert.match(await meta.repliesTo(PHONE, m1), /text messages, images and documents/);
});

test("at 100 messages both channels stop; WhatsApp shows the reset date; unpaid numbers get the subscribe link", { skip }, async () => {
  const [sub] = await sql`select current_period_start s from subscriptions where user_id = ${user.id}`;
  await sql`update usage_periods set used = 100 where user_id = ${user.id} and period_start = ${sub.s}`;
  assert.match(await say("Anything?"), /You've used all 100 messages[\s\S]*reset on/);
  assert.equal((await web.ask("And on the web?")).json?.reason, "period_exhausted");
  await removePlan(user);
  assert.match(await say("Still there?"), /part of Verisavo Monthly/);
  await givePlan(user);
});

test("the dashboard doesn't reveal another account's number; the phone owner is told instead", { skip }, async () => {
  await web.submit("/dashboard", ">Unlink<", {}, "/dashboard");
  assert.equal(await linkedPhone(), undefined);
  const r = await web.submit("/dashboard", 'name="phone"', { phone: `+${OTHER_PHONE}` }, "/dashboard");
  assert.ok(codeOn(r) && !/already linked/.test(r.text));
  assert.match(await say(`LINK ${codeOn(r)}`, OTHER_PHONE), /already linked to another/);
  assert.equal((await sql`select user_id from whatsapp_links where phone = ${OTHER_PHONE}`)[0]?.user_id, other.id);
  await sql`delete from whatsapp_codes where user_id = ${user.id}`;
});

test("with an approved template the code is sent by WhatsApp and typed in the dashboard", { skip }, async () => {
  const file = ".env.local", before = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, before.replace(/^WHATSAPP_OTP_TEMPLATE=.*$/m, "WHATSAPP_OTP_TEMPLATE=e2e_link_code"));
  try {
    // the dev server reloads .env.local, and its server-action ids can change meanwhile: wait, and retry once if stale
    await sleep(6000);
    const attempt = async () => {
      await sql`delete from rate_limits where key like 'wa:%'`;
      await sql`delete from whatsapp_codes where user_id = ${user.id}`;
      const m0 = meta.sent.length;
      const r = await web.submit("/dashboard", 'name="phone"', { phone: `+${PHONE}` }, "/dashboard");
      if (/Failed to find Server Action/.test(r.text)) return null;
      await meta.repliesTo(PHONE, m0);
      return { r, tpl: meta.sent.slice(m0).find(m => m.type === "template") };
    };
    const got = (await attempt()) ?? (await sleep(6000), await attempt());
    const tpl = got?.tpl;
    const code = tpl?.template?.components?.[0]?.parameters?.[0]?.text;
    assert.equal(tpl?.template?.name, "e2e_link_code");
    assert.match(code ?? "", /^\d{6}$/);
    const wrong = await web.submit(got.r.html, 'name="code"', { code: code === "000000" ? "111111" : "000000" }, "/dashboard");
    assert.match(wrong.text, /4 tries left/);
    await web.submit(got.r.html, 'name="code"', { code }, "/dashboard");
    assert.equal(await linkedPhone(), PHONE);
  } finally {
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/^WHATSAPP_OTP_TEMPLATE=.*$/m, "WHATSAPP_OTP_TEMPLATE="));
  }
});

test("an admin can unlink a number, and it's logged", { skip }, async () => {
  const admin = new Client(); await admin.login(await createUser({ admin: true }));
  await admin.submit(`/admin/users?q=${encodeURIComponent(user.email)}`, "Unlink WhatsApp", {}, "/admin/users");
  assert.equal(await linkedPhone(), undefined);
  assert.ok((await sql`select 1 from audit_events where target_id = ${user.id} and action = 'admin.whatsapp_unlinked'`).length);
});
