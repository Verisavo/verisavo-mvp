// M3: the web assistant (streamed answers, saved conversations) and the usage limits: 5 free questions, then a hard
// stop; 100 per paid period; duplicates never counted twice; a failed answer refunded; paid status rules (D9).
// Needs an answer key and a search key. Spends about four short AI answers.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { Client, cleanup, configured, createUser, sql, sleep, uuid } from "./helpers.mjs";

const skip = !(configured.answers && configured.search) && "needs AI keys for answers and knowledge search";
after(async () => { await cleanup(); await sql.end({ timeout: 2 }); });
const freeUsed = async id => (await sql`select coalesce((select used from free_usage where user_id = ${id}), 0)::int n`)[0].n;

test("a question streams an answer that is saved in a new conversation", { skip }, async () => {
  const user = await createUser();
  const c = new Client(); await c.login(user);
  const a = await c.ask("In one sentence, what can you help me with?");
  assert.equal(a.status, 200);
  assert.equal(a.end?.type, "done", JSON.stringify(a.end));
  assert.ok(a.text.length > 10);
  assert.equal(a.start.remaining, 4);
  const conv = await c.json("GET", `/api/assistant/conversations/${a.start.conversationId}`);
  assert.deepEqual(conv.data.messages.map(m => m.role), ["user", "assistant"]);
  const list = await c.json("GET", "/api/assistant/conversations");
  assert.ok(list.data.conversations.some(x => x.id === a.start.conversationId));
  // someone else can't open or delete it
  const other = new Client(); await other.login(await createUser());
  assert.equal((await other.json("GET", `/api/assistant/conversations/${a.start.conversationId}`)).status, 404);
  assert.equal((await other.ask("Hi", { conversationId: a.start.conversationId })).status, 404);
  assert.equal((await c.req("DELETE", `/api/assistant/conversations/${a.start.conversationId}`, { body: {} })).status, 200);
});

test("free plan: the 5th question is answered, the 6th gets the paywall and the model isn't called", { skip }, async () => {
  const user = await createUser({ freeUsed: 4 });
  const c = new Client(); await c.login(user);
  const fifth = await c.ask("Say hello in one word.");
  assert.equal(fifth.end?.type, "done");
  assert.equal(fifth.start.remaining, 0);
  const before = (await sql`select count(*)::int n from messages where user_id = ${user.id}`)[0].n;
  const sixth = await c.ask("A sixth question");
  assert.equal(sixth.status, 402);
  assert.equal(sixth.json.reason, "free_exhausted");
  assert.equal((await sql`select count(*)::int n from messages where user_id = ${user.id}`)[0].n, before, "nothing saved");
});

test("the same request id is never counted twice", { skip }, async () => {
  const user = await createUser({ freeUsed: 5 });
  const c = new Client(); await c.login(user);
  await sql`update free_usage set used = 3 where user_id = ${user.id}`;
  const requestId = uuid();
  await sql`insert into usage_events (user_id, channel, external_id, bucket) values (${user.id}, 'web', ${requestId}, 'free')`;
  const again = await c.ask("Duplicate?", { requestId });
  assert.equal(again.status, 409);
  assert.equal(await freeUsed(user.id), 3);
});

test("if the AI fails, the question is refunded and nothing is saved", { skip }, async () => {
  const user = await createUser({ freeUsed: 2 });
  const c = new Client(); await c.login(user);
  const [saved] = await sql`select answer_model from ai_settings`;
  await sql`update ai_settings set answer_model = 'model-that-does-not-exist'`;
  try {
    const a = await c.ask("This should fail");
    assert.equal(a.end?.type, "error");
    assert.match(a.end.message, /wasn't counted/);
  } finally {
    await sql`update ai_settings set answer_model = ${saved.answer_model}`;
  }
  assert.equal(await freeUsed(user.id), 2);
  assert.equal((await sql`select count(*)::int n from messages where user_id = ${user.id}`)[0].n, 0);
});

test("paid plan: at 100/100 the next question is blocked with the reset date, without calling the model", { skip }, async () => {
  const user = await createUser({ paid: true, paidUsed: 100, freeUsed: 5 });
  const c = new Client(); await c.login(user);
  const r = await c.ask("One more");
  assert.equal(r.status, 402);
  assert.equal(r.json.reason, "period_exhausted");
  assert.ok(r.json.usage.resetsAt);
});

test("two questions at 99/100 at the same moment: exactly one gets through", { skip }, async () => {
  const user = await createUser({ paid: true, paidUsed: 99, freeUsed: 5 });
  const c = new Client(); await c.login(user);
  const results = await Promise.all([c.ask("Reply with OK."), c.ask("Reply with OK.")]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 402]);
});

test("paid status follows the subscription: late renewals have 3 days' grace; past_due 21 days; canceled none", { skip }, async () => {
  const user = await createUser({ freeUsed: 5 });
  const c = new Client(); await c.login(user);
  const probe = async () => { const r = await c.ask("Reply with OK."); return r.status === 402 ? r.json.reason : "answered"; };
  const sub = (status, startDays, endDays) => sql`insert into subscriptions (id, user_id, status, price_id, current_period_start, current_period_end)
    values (${"manual_" + user.id}, ${user.id}, ${status}, 'manual', now() + make_interval(days => ${startDays}), now() + make_interval(days => ${endDays}))
    on conflict (id) do update set status = excluded.status, current_period_start = excluded.current_period_start, current_period_end = excluded.current_period_end`;
  await sub("active", -40, -5);
  assert.equal(await probe(), "free_exhausted", "5 days past the period end: no longer paid");
  await sub("past_due", -25, 5);
  assert.equal(await probe(), "free_exhausted", "retrying for 25 days: no longer paid");
  await sub("canceled", -10, 20);
  assert.equal(await probe(), "free_exhausted");
  await sub("active", -31, -1);
  assert.equal(await probe(), "answered", "1 day past the period end: still paid");
  await sleep(500);
});

test("cross-site and signed-out questions are refused", async () => {
  const r1 = await fetch(`${process.env.E2E_BASE_URL || "http://localhost:3000"}/api/assistant`, { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ question: "x", requestId: uuid() }) });
  const r2 = await fetch(`${process.env.E2E_BASE_URL || "http://localhost:3000"}/api/assistant`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "x", requestId: uuid() }) });
  assert.equal(r1.status, 403);
  assert.equal(r2.status, 401);
});

test("admins can reset a user's allowance (decision D10)", async () => {
  const user = await createUser({ freeUsed: 3 });
  const admin = new Client(); await admin.login(await createUser({ admin: true }));
  await admin.submit(`/admin/users?q=${encodeURIComponent(user.email)}`, "Reset allowance", {}, "/admin/users");
  assert.equal(await freeUsed(user.id), 0);
  const [log] = await sql`select action from audit_events where target_id = ${user.id} and action = 'admin.allowance_reset'`;
  assert.ok(log);
});
