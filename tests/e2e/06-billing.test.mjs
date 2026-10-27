// M3 / M5.1 payments: checkout, the webhook keeping the plan in sync, a renewal resetting usage, a failed payment,
// and cancelling. Uses Stripe TEST mode with a test clock (simulated months), and signs the webhook events itself,
// so no Stripe CLI is needed. Skipped until .env.local has sk_test_… keys, STRIPE_PRICE_MONTHLY and
// STRIPE_WEBHOOK_SECRET (any whsec_… value the dev server also uses).
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { BASE, Client, cleanup, configured, createUser, env, sleep, sql, uuid } from "./helpers.mjs";

after(async () => { await cleanup(); await sql.end({ timeout: 2 }); });

test("the webhook refuses unsigned events (503 while billing is off)", async () => {
  const r = await fetch(BASE + "/api/stripe/webhook", { method: "POST", headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=bad" }, body: "{}" });
  assert.equal(r.status, configured.stripe ? 400 : 503);
});

const skip = !configured.stripe && "needs Stripe test keys in .env.local (sk_test_…, STRIPE_PRICE_MONTHLY, STRIPE_WEBHOOK_SECRET)";
let stripe, clock, user, customer, sub;
const web = new Client();
const row = async () => (await sql`select status, cancel_at_period_end, current_period_start from subscriptions where user_id = ${user.id} and id like 'sub_%'`)[0];
const usage = async () => (await sql`select used, period_start from usage_periods where user_id = ${user.id} order by period_start desc limit 1`)[0];
// a webhook event signed with our endpoint secret, exactly as Stripe would send it
async function deliver(type, object, id = "evt_e2e_" + uuid().replace(/-/g, "")) {
  const payload = JSON.stringify({ id, object: "event", type, api_version: "2026-09-30.endive", created: Math.floor(Date.now() / 1000), livemode: false, data: { object } });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: env("STRIPE_WEBHOOK_SECRET") });
  const r = await fetch(BASE + "/api/stripe/webhook", { method: "POST", headers: { "content-type": "application/json", "stripe-signature": header }, body: payload });
  return { status: r.status, id };
}
async function advance(seconds) {
  const current = await stripe.testHelpers.testClocks.retrieve(clock.id);
  await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: current.frozen_time + seconds });
  for (let i = 0; i < 60; i++) { if ((await stripe.testHelpers.testClocks.retrieve(clock.id)).status === "ready") return; await sleep(2000); }
  throw new Error("the test clock didn't finish advancing");
}
const latestInvoice = async () => (await stripe.invoices.list({ subscription: sub.id, limit: 1 })).data[0];

before(async () => {
  if (skip) return;
  const Stripe = createRequire(import.meta.url)("stripe");
  stripe = new Stripe(env("STRIPE_SECRET_KEY"));
  user = await createUser({ name: "Billing Tester" });
  await web.login(user);
});
after(async () => { if (clock) await stripe.testHelpers.testClocks.del(clock.id).catch(() => {}); });

test("Subscribe opens a real Stripe Checkout page", { skip }, async () => {
  const r = await web.json("POST", "/api/billing/checkout", {});
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.data.url, /^https:\/\/checkout\.stripe\.com\//);
});

test("a completed checkout makes the user paid (webhook → sync)", { skip }, async () => {
  clock = await stripe.testHelpers.testClocks.create({ frozen_time: Math.floor(Date.now() / 1000), name: "verisavo-e2e" });
  customer = await stripe.customers.create({ email: user.email, test_clock: clock.id, metadata: { userId: user.id } });
  const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer: customer.id });
  sub = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: env("STRIPE_PRICE_MONTHLY") }], default_payment_method: pm.id, metadata: { userId: user.id } });
  // A test clock needs a customer created with it, so this isn't the customer the Subscribe test saved. Forget that
  // one, as if checkout had used this customer before its id was saved: the webhook must save it.
  await sql`update profiles set stripe_customer_id = null where id = ${user.id}`;
  const ev = await deliver("checkout.session.completed", { id: "cs_test_e2e", object: "checkout.session", mode: "subscription", customer: customer.id, client_reference_id: user.id, subscription: sub.id });
  assert.equal(ev.status, 200);
  assert.equal((await row())?.status, "active");
  assert.equal((await sql`select stripe_customer_id from profiles where id = ${user.id}`)[0].stripe_customer_id, customer.id);
  const page = (await web.page("/dashboard")).html.replace(/<!-- -->/g, "");
  assert.match(page, /Monthly/);
  // the same event again is ignored
  const again = await deliver("checkout.session.completed", { id: "cs_test_e2e", object: "checkout.session", customer: customer.id, client_reference_id: user.id, subscription: sub.id }, ev.id);
  assert.equal(again.status, 200);
  assert.equal((await sql`select count(*)::int n from stripe_events where id = ${ev.id}`)[0].n, 1);
  // a paying user is sent to the billing portal instead of a second checkout
  const second = await web.json("POST", "/api/billing/checkout", {});
  assert.match(second.data.url, /billing\.stripe\.com/);
});

test("a renewal starts a new period with the count back at 0", { skip }, async () => {
  const before = await usage();
  await sql`update usage_periods set used = 37 where user_id = ${user.id} and period_start = ${before.period_start}`;
  await advance(32 * 24 * 3600);
  assert.equal((await deliver("invoice.paid", await latestInvoice())).status, 200);
  const now = await usage();
  assert.ok(now.period_start > before.period_start, "a new period");
  assert.equal(now.used, 0);
  assert.ok((await sql`select 1 from audit_events where target_id = ${sub.id} and action = 'billing.renewed'`).length);
});

test("a failed renewal keeps access while Stripe retries (D9) and is logged", { skip }, async () => {
  const fail = await stripe.paymentMethods.attach("pm_card_chargeCustomerFail", { customer: customer.id });
  await stripe.subscriptions.update(sub.id, { default_payment_method: fail.id });
  await advance(32 * 24 * 3600);
  assert.equal((await deliver("invoice.payment_failed", await latestInvoice())).status, 200);
  assert.equal((await row()).status, "past_due");
  const page = (await web.page("/dashboard")).html.replace(/<!-- -->/g, "");
  assert.match(page, /Payment retrying/);
  assert.ok((await sql`select 1 from audit_events where actor_id = ${user.id} and action = 'billing.payment_failed'`).length);
});

test("cancelling at period end keeps access until then; a deleted subscription ends it", { skip }, async () => {
  const good = await stripe.paymentMethods.attach("pm_card_visa", { customer: customer.id });
  await stripe.subscriptions.update(sub.id, { default_payment_method: good.id, cancel_at_period_end: true });
  assert.equal((await deliver("customer.subscription.updated", await stripe.subscriptions.retrieve(sub.id))).status, 200);
  assert.equal((await row()).cancel_at_period_end, true);
  await stripe.subscriptions.cancel(sub.id);
  assert.equal((await deliver("customer.subscription.deleted", await stripe.subscriptions.retrieve(sub.id))).status, 200);
  assert.equal((await row()).status, "canceled");
  const page = (await web.page("/dashboard")).html.replace(/<!-- -->/g, "");
  assert.match(page, />Free</);
});
