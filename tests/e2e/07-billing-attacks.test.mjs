// Billing under attack and under stress: forged, tampered and replayed webhooks, subscriptions that belong to nobody,
// events arriving late, twice or all at once, cross-site requests, a double-clicked Subscribe and a declined first
// payment. Uses Stripe TEST mode and signs webhook events itself, like 06-billing. Skipped without Stripe test keys.
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { BASE, Client, cleanup, configured, createUser, env, sql, uuid } from "./helpers.mjs";

const skip = !configured.stripe && "needs Stripe test keys in .env.local (sk_test_…, STRIPE_PRICE_MONTHLY, STRIPE_WEBHOOK_SECRET)";
let stripe;
const customers = [];

before(() => { if (!skip) stripe = new (createRequire(import.meta.url)("stripe"))(env("STRIPE_SECRET_KEY")); });
after(async () => {
  for (const id of customers) await stripe.customers.del(id).catch(() => {});   // also cancels their subscriptions
  await sql`delete from stripe_events where id like 'evt_attack_%'`;
  await cleanup();
  await sql.end({ timeout: 2 });
});

const event = (type, object, id = "evt_attack_" + uuid().replace(/-/g, "")) =>
  ({ id, payload: JSON.stringify({ id, object: "event", type, api_version: "2026-09-30.endive", created: Math.floor(Date.now() / 1000), livemode: false, data: { object } }) });
const sign = (payload, { secret = env("STRIPE_WEBHOOK_SECRET"), timestamp } = {}) => stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp });
const send = async (payload, header) =>
  (await fetch(BASE + "/api/stripe/webhook", { method: "POST", headers: { "content-type": "application/json", "stripe-signature": header }, body: payload })).status;
const deliver = (type, object, id) => { const e = event(type, object, id); return send(e.payload, sign(e.payload)); };
const recorded = async id => (await sql`select count(*)::int n from stripe_events where id = ${id}`)[0].n;

// a user with a Stripe customer of their own and, optionally, a subscription paid by `card`
async function subscriber({ card = "pm_card_visa", subscribe = true } = {}) {
  const user = await createUser({ name: "Billing Attacker" });
  const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
  customers.push(customer.id);
  await sql`update profiles set stripe_customer_id = ${customer.id} where id = ${user.id}`;
  if (!subscribe) return { user, customer };
  const pm = await stripe.paymentMethods.attach(card, { customer: customer.id });
  const sub = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: env("STRIPE_PRICE_MONTHLY") }], default_payment_method: pm.id, metadata: { userId: user.id } });
  return { user, customer, sub };
}
// the plan the user's dashboard shows: "Monthly" or "Free"
async function plan(user) {
  const web = new Client();
  await web.login(user);
  return (await web.page("/dashboard")).html.replace(/<!-- -->/g, "").match(/>(Monthly|Free)<\/span>/)?.[1];
}

test("a webhook signed with the wrong secret is refused and changes nothing", { skip }, async () => {
  const e = event("customer.subscription.updated", { id: "sub_forged", object: "subscription" });
  assert.equal(await send(e.payload, sign(e.payload, { secret: "whsec_" + crypto.randomBytes(24).toString("hex") })), 400);
  assert.equal(await send(e.payload, ""), 400);
  assert.equal(await recorded(e.id), 0);
});

test("a correctly signed event whose body was changed afterwards is refused", { skip }, async () => {
  const e = event("customer.subscription.updated", { id: "sub_tampered", object: "subscription" });
  const header = sign(e.payload);
  assert.equal(await send(e.payload.replace("customer.subscription.updated", "customer.subscription.created"), header), 400);
  assert.equal(await recorded(e.id), 0);
});

test("a correctly signed event replayed more than 5 minutes later is refused", { skip }, async () => {
  const e = event("customer.subscription.updated", { id: "sub_replayed", object: "subscription" });
  assert.equal(await send(e.payload, sign(e.payload, { timestamp: Math.floor(Date.now() / 1000) - 600 })), 400);
  assert.equal(await recorded(e.id), 0);
});

test("a real subscription that belongs to nobody here gives nobody a plan", { skip }, async () => {
  const stranger = await stripe.customers.create({ email: "stranger@test.verisavo.dev" });
  customers.push(stranger.id);
  const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer: stranger.id });
  // a user id that doesn't exist, one that isn't even a user id (typed by hand in the dashboard), and none at all with
  // a customer that isn't anyone's
  for (const metadata of [{ userId: uuid() }, { userId: "not-a-user-id" }, {}]) {
    const sub = await stripe.subscriptions.create({ customer: stranger.id, items: [{ price: env("STRIPE_PRICE_MONTHLY") }], default_payment_method: pm.id, metadata });
    assert.equal(await deliver("customer.subscription.created", sub), 200);
    assert.equal((await sql`select count(*)::int n from subscriptions where id = ${sub.id}`)[0].n, 0);
  }
});

test("an event about a subscription Stripe doesn't have is accepted and ignored, not retried for days", { skip }, async () => {
  const e = event("customer.subscription.updated", { id: "sub_" + crypto.randomBytes(12).toString("hex"), object: "subscription" });
  assert.equal(await send(e.payload, sign(e.payload)), 200);
  assert.equal(await recorded(e.id), 1);
});

test("the webhook refuses a huge body without reading it", { skip }, async () => {
  assert.equal(await send("x".repeat(2_000_000), "t=1,v1=00"), 413);
});

test("an old 'active' event arriving after cancelling can't bring the plan back", { skip }, async () => {
  const { user, sub } = await subscriber();
  assert.equal(await deliver("customer.subscription.created", sub), 200);
  assert.equal(await plan(user), "Monthly");
  await stripe.subscriptions.cancel(sub.id);
  assert.equal(await deliver("customer.subscription.deleted", await stripe.subscriptions.retrieve(sub.id)), 200);
  assert.equal(await plan(user), "Free");
  // the stale snapshot still says "active"; the app re-reads Stripe instead of trusting it
  assert.equal(await deliver("customer.subscription.updated", sub), 200);
  assert.equal((await sql`select status from subscriptions where id = ${sub.id}`)[0].status, "canceled");
  assert.equal(await plan(user), "Free");
});

test("events arriving all at once, or the same event five times, are handled once", { skip }, async () => {
  const { user, sub } = await subscriber();
  const invoice = (await stripe.invoices.list({ subscription: sub.id, limit: 1 })).data[0];
  // Stripe sends these within the same second when someone subscribes
  const statuses = await Promise.all([
    deliver("customer.subscription.created", sub), deliver("customer.subscription.updated", sub), deliver("invoice.paid", invoice)
  ]);
  assert.deepEqual(statuses, [200, 200, 200]);
  assert.equal(await plan(user), "Monthly");
  assert.equal((await sql`select count(*)::int n from usage_periods where user_id = ${user.id}`)[0].n, 1);
  assert.equal((await sql`select count(*)::int n from audit_events where target_id = ${sub.id} and action = 'billing.subscribed'`)[0].n, 1, "one 'Subscribed' in the activity log");
  // Stripe retrying one event while the first delivery is still running
  const e = event("customer.subscription.updated", sub);
  const header = sign(e.payload);
  assert.deepEqual(await Promise.all(Array.from({ length: 5 }, () => send(e.payload, header))), [200, 200, 200, 200, 200]);
  assert.equal(await recorded(e.id), 1);
});

test("Subscribe needs a signed-in user and refuses other websites", { skip }, async () => {
  assert.equal((await new Client().json("POST", "/api/billing/checkout", {})).status, 401);
  const web = new Client();
  await web.login(await createUser());
  assert.equal((await web.req("POST", "/api/billing/checkout", { body: {}, headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal((await web.req("POST", "/api/billing/checkout", { body: "x=1", json: false, headers: { "content-type": "application/x-www-form-urlencoded" } })).status, 403);
});

test("Manage billing refuses other websites, and a free user without a billing account gets a clear 404", { skip }, async () => {
  assert.equal((await new Client().json("POST", "/api/billing/portal", {})).status, 401);
  const web = new Client();
  await web.login(await createUser());
  assert.equal((await web.req("POST", "/api/billing/portal", { body: {}, headers: { origin: "https://evil.example" } })).status, 403);
  const r = await web.json("POST", "/api/billing/portal", {});
  assert.equal(r.status, 404);
  assert.equal(r.data.error, "no_customer");
});

test("a burst of Subscribe clicks opens one payment page, and the site keeps answering meanwhile", { skip }, async () => {
  const user = await createUser();
  const web = new Client();
  await web.login(user);
  const clicks = Promise.all(Array.from({ length: 6 }, () => web.json("POST", "/api/billing/checkout", {})));
  // other visitors aren't held up while the clicks are dealt with
  const started = Date.now();
  const health = await (await fetch(BASE + "/api/health")).json();
  assert.equal(health.database, "up");
  assert.ok(Date.now() - started < 5000, "the site answered within 5 s");
  const results = await clicks;
  assert.ok(results.some(r => r.status === 200), "one click opens the payment page");
  for (const r of results) {
    assert.ok([200, 409].includes(r.status), JSON.stringify(r.data));
    if (r.status === 409) assert.equal(r.data.error, "checkout_busy");
  }
  const [{ stripe_customer_id: customer }] = await sql`select stripe_customer_id from profiles where id = ${user.id}`;
  customers.push(customer);
  const open = await stripe.checkout.sessions.list({ customer, status: "open", limit: 10 });
  assert.equal(open.data.length, 1, "only one checkout page can be paid");
});

test("a declined first payment gives no plan, and Subscribe waits instead of opening a second checkout", { skip }, async () => {
  const { user, sub } = await subscriber({ card: "pm_card_chargeCustomerFail" });
  assert.equal(sub.status, "incomplete");
  assert.equal(await deliver("customer.subscription.created", sub), 200);
  assert.equal(await plan(user), "Free");
  const web = new Client();
  await web.login(user);
  const r = await web.json("POST", "/api/billing/checkout", {});
  assert.equal(r.status, 409);
  assert.equal(r.data.error, "payment_pending");
});
