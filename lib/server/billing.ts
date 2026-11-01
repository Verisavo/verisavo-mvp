import "server-only";
import { and, eq, inArray, isNull, like, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { profiles, stripeEvents, subscriptions, usagePeriods } from "@/db/schema";
import { PLAN } from "@/lib/plan";
import { audit } from "@/lib/server/audit";
import { stripe, stripeConfigured, type Stripe } from "@/lib/server/stripe";
import { appUrl } from "@/lib/server/http";
import { createSupabase } from "@/lib/server/supabase";

// Stripe billing (M3.2–M3.3, see the verisavo-stripe-billing skill): customers, checkout, the billing portal, and the
// webhook handler that keeps the subscriptions table in sync. Entitlements read that table; nothing here counts usage.


// Billing pages act on money and personal data, so the session is confirmed with Supabase (getUser), not only from
// the signed token: a token copied before sign-out stops working here at once (the same check as requireAdmin)
export async function sessionConfirmed(userId: string): Promise<boolean> {
  const { data, error } = await (await createSupabase()).auth.getUser();
  return !error && data.user?.id === userId;
}
const PAID = ["active", "trialing", "past_due"];   // decision D9, the same list as lib/server/entitlements.ts

// Work done while a lock is held runs on the lock's own transaction: asking the pool for a second connection there could
// leave every connection waiting on the one that holds the lock
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// The user's Stripe customer, created on their first checkout and stored on their profile
export async function getOrCreateCustomer(user: { id: string; email: string; name: string }, q: typeof db | Tx = db): Promise<string> {
  const [p] = await q.select({ customerId: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (p?.customerId) return p.customerId;
  // the idempotency key makes two quick clicks create one customer, not two
  const customer = await stripe().customers.create(
    { email: user.email, name: user.name || undefined, metadata: { userId: user.id } },
    { idempotencyKey: `customer-${user.id}` }
  );
  const [set] = await q.update(profiles).set({ stripeCustomerId: customer.id })
    .where(and(eq(profiles.id, user.id), isNull(profiles.stripeCustomerId))).returning({ id: profiles.stripeCustomerId });
  if (set?.id) return set.id;
  const [again] = await q.select({ customerId: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
  return again?.customerId ?? customer.id;
}

// Never two subscriptions: Stripe itself is asked first, because our table can lag behind it (the webhook may not have
// arrived yet). A live subscription sends the user to the portal; one whose first payment is still in progress waits;
// a checkout page left open in another tab is closed before a new one opens. One checkout runs at a time per user (a
// lock held until this transaction ends), so clicks at the same moment can't each find nothing open and leave several
// pages that could each be paid; a click while another is opening is told so at once, rather than waiting on a
// connection.
export type CheckoutResult = { url: string } | { pending: true } | { busy: true };
const LIVE = ["active", "trialing", "past_due", "unpaid"];

export async function createCheckout(user: { id: string; email: string; name: string }): Promise<CheckoutResult> {
  return db.transaction(async tx => {
    const [lock] = await tx.execute<{ locked: boolean }>(sql`select pg_try_advisory_xact_lock(hashtext(${"checkout:" + user.id})) as locked`);
    if (!lock?.locked) return { busy: true };
    return openCheckout(user, tx);
  });
}

async function openCheckout(user: { id: string; email: string; name: string }, tx: Tx): Promise<CheckoutResult> {
  const customer = await getOrCreateCustomer(user, tx);
  const subs = await stripe().subscriptions.list({ customer, status: "all", limit: 20 });
  if (subs.data.some(s => LIVE.includes(s.status))) return { url: await createPortal(customer) };
  if (subs.data.some(s => s.status === "incomplete")) return { pending: true };
  const open = await stripe().checkout.sessions.list({ customer, status: "open", limit: 20 });
  for (const s of open.data) await stripe().checkout.sessions.expire(s.id);

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price: process.env.STRIPE_PRICE_MONTHLY, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id } },
    success_url: `${appUrl()}/dashboard?checkout=success#plan`,
    cancel_url: `${appUrl()}/dashboard?checkout=cancel#plan`
  });
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return { url: session.url };
}

export async function createPortal(customerId: string): Promise<string> {
  const session = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: `${appUrl()}/dashboard#plan` });
  return session.url;
}

// An admin disabling a paying user also stops their plan renewing, so Stripe doesn't keep charging someone who can't
// sign in to cancel (they'd likely dispute it). Re-enabling turns renewal back on, but only where disabling stopped
// it: a cancellation the customer made themselves stays. The webhook then updates our table and the activity log.
export async function pauseRenewal(userId: string, pause: boolean): Promise<void> {
  if (!stripeConfigured()) return;
  const live = await db.select({ id: subscriptions.id }).from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), like(subscriptions.id, "sub_%"), inArray(subscriptions.status, LIVE)));
  for (const { id } of live) {
    const sub = await stripe().subscriptions.retrieve(id);
    if (pause && !sub.cancel_at_period_end) {
      await stripe().subscriptions.update(id, { cancel_at_period_end: true, metadata: { stoppedByAdmin: "1" } });
    } else if (!pause && sub.cancel_at_period_end && sub.metadata?.stoppedByAdmin === "1") {
      await stripe().subscriptions.update(id, { cancel_at_period_end: false, metadata: { stoppedByAdmin: "" } });   // "" removes the key
    }
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toDate = (seconds: number) => new Date(seconds * 1000);

// Only Verisavo Monthly gives a plan: a subscription to anything else in this Stripe account (a test price, a plan
// added later) gives none until the app is set up for it. Compared by product, not price, so a new price for the
// same product (a price change) keeps working for everyone. Looked up once per server process.
let ourProduct: Promise<string | null> | null = null;
const verisavoProduct = () =>
  (ourProduct ??= stripe().prices.retrieve(process.env.STRIPE_PRICE_MONTHLY ?? "").then(p => idOf(p.product), err => { ourProduct = null; throw err; }));
const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);

// "Sync, don't patch": fetch the subscription as it is now and upsert the whole row, so events arriving out of order
// can't leave an old state behind. A paid period also gets its usage row; a renewal's new period starts at 0.
// Stripe sends several events within the same second when someone subscribes, so one sync runs at a time per
// subscription (a lock held until the transaction ends): each sees what the one before it wrote, the activity log gets
// one "Subscribed", and since Stripe is read inside the lock, the last write is the latest state.
export async function syncSubscription(subscriptionId: string): Promise<void> {
  const synced = await db.transaction(async tx => {
    // a waiter gives up after 20 s (the event fails and Stripe retries it) rather than holding a connection for good
    await tx.execute(sql`set local lock_timeout = '20s'`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"subscription:" + subscriptionId}))`);
    let sub: Stripe.Subscription;
    try {
      sub = await stripe().subscriptions.retrieve(subscriptionId);
    } catch (err) {
      // a subscription Stripe doesn't know (deleted, or another account's) would otherwise fail and be retried for days
      if ((err as { code?: string }).code === "resource_missing") { console.warn("[stripe] no such subscription, ignored:", subscriptionId); return null; }
      throw err;
    }
    const customerId = idOf(sub.customer);
    let userId: string | null = sub.metadata?.userId ?? null;
    if (userId && !UUID.test(userId)) userId = null;   // e.g. typed by hand in the Stripe dashboard
    if (!userId && customerId) {
      const [p] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.stripeCustomerId, customerId)).limit(1);
      userId = p?.id ?? null;
    }
    if (userId) {   // only trust metadata that points at a real profile
      const [p] = await tx.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, userId)).limit(1);
      userId = p?.id ?? null;
    }
    if (!userId) { console.warn("[stripe] subscription for an unknown customer, ignored:", subscriptionId); return null; }

    // from API version 2025-03-31 the billing period lives on each subscription item
    const item = sub.items.data[0];
    if (!item) { console.warn("[stripe] subscription without items, ignored:", subscriptionId); return null; }
    if (idOf(item.price?.product) !== (await verisavoProduct())) {
      // and if it was Verisavo Monthly before (switched in the portal), it stops counting
      await tx.delete(subscriptions).where(eq(subscriptions.id, sub.id));
      console.warn("[stripe] not a Verisavo Monthly subscription, ignored:", subscriptionId);
      return null;
    }
    const row = {
      userId, status: sub.status, priceId: item.price?.id ?? null,
      currentPeriodStart: toDate(item.current_period_start), currentPeriodEnd: toDate(item.current_period_end),
      cancelAtPeriodEnd: sub.cancel_at_period_end, updatedAt: new Date()
    };
    const [before] = await tx.select({ status: subscriptions.status, periodStart: subscriptions.currentPeriodStart, cancel: subscriptions.cancelAtPeriodEnd })
      .from(subscriptions).where(eq(subscriptions.id, sub.id)).limit(1);
    await tx.insert(subscriptions).values({ id: sub.id, ...row }).onConflictDoUpdate({ target: subscriptions.id, set: row });
    if (PAID.includes(sub.status)) {
      await tx.insert(usagePeriods)
        .values({ userId, periodStart: row.currentPeriodStart, periodEnd: row.currentPeriodEnd, allowance: PLAN.PAID_MESSAGES_PER_PERIOD })
        .onConflictDoUpdate({ target: [usagePeriods.userId, usagePeriods.periodStart], set: { periodEnd: row.currentPeriodEnd } });
    }
    return { sub, userId, row, before };
  });
  if (!synced) return;
  const { sub, userId, row, before } = synced;

  // subscription changes for the admin activity log (M2.4)
  const wasPaid = Boolean(before && PAID.includes(before.status)), isPaid = PAID.includes(sub.status);
  const log = (action: string) => audit(action, { actorId: userId, targetType: "subscription", targetId: sub.id, metadata: { status: sub.status } });
  if (!wasPaid && isPaid) await log("billing.subscribed");
  else if (wasPaid && !isPaid) await log("billing.ended");
  else if (wasPaid && isPaid && before && before.periodStart.getTime() !== row.currentPeriodStart.getTime()) await log("billing.renewed");
  if (isPaid && before && !before.cancel && sub.cancel_at_period_end) await log("billing.cancel_scheduled");
  if (isPaid && before?.cancel && !sub.cancel_at_period_end) await log("billing.cancel_undone");
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const customerId = idOf(s.customer), userId = s.client_reference_id;
      if (customerId && userId && UUID.test(userId)) {
        await db.update(profiles).set({ stripeCustomerId: customerId }).where(and(eq(profiles.id, userId), isNull(profiles.stripeCustomerId)));
      }
      const subId = idOf(s.subscription);
      if (subId) await syncSubscription(subId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object.id);
      return;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subId = idOf(event.data.object.parent?.subscription_details?.subscription);
      if (subId) await syncSubscription(subId);
      if (event.type === "invoice.payment_failed") {
        const customerId = idOf(event.data.object.customer);
        const [p] = customerId ? await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.stripeCustomerId, customerId)).limit(1) : [];
        if (p) await audit("billing.payment_failed", { actorId: p.id, targetType: "subscription", targetId: subId ?? undefined });
        // TODO(M3, after the domain): email the user through Resend that the payment failed (decision D9)
      }
      return;
    }
    default:
      return;   // not subscribed to anything else; ignore quietly
  }
}

// Each event is handled once. Its id is recorded only after handling succeeds, so an event cut off half-way (a
// timeout, a redeploy) runs again when Stripe retries it, instead of being skipped as already seen. Handling is
// idempotent (sync re-fetches and runs one at a time per subscription), so a copy that slips in while the first is
// still running does no harm.
export async function processEvent(event: Stripe.Event): Promise<"handled" | "duplicate"> {
  const [seen] = await db.select({ id: stripeEvents.id }).from(stripeEvents).where(eq(stripeEvents.id, event.id)).limit(1);
  if (seen) return "duplicate";
  await handleEvent(event);
  await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  return "handled";
}
