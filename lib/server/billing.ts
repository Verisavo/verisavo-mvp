import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { profiles, stripeEvents, subscriptions, usagePeriods } from "@/db/schema";
import { PLAN } from "@/lib/plan";
import { audit } from "@/lib/server/audit";
import { stripe, type Stripe } from "@/lib/server/stripe";
import { createSupabase } from "@/lib/server/supabase";

// Stripe billing (M3.2–M3.3, see the verisavo-stripe-billing skill): customers, checkout, the billing portal, and the
// webhook handler that keeps the subscriptions table in sync. Entitlements read that table; nothing here counts usage.

const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Billing pages act on money and personal data, so the session is confirmed with Supabase (getUser), not only from
// the signed token: a token copied before sign-out stops working here at once (the same check as requireAdmin)
export async function sessionConfirmed(userId: string): Promise<boolean> {
  const { data, error } = await (await createSupabase()).auth.getUser();
  return !error && data.user?.id === userId;
}
const PAID = ["active", "trialing", "past_due"];   // decision D9, the same list as lib/server/entitlements.ts

// The user's Stripe customer, created on their first checkout and stored on their profile
export async function getOrCreateCustomer(user: { id: string; email: string; name: string }): Promise<string> {
  const [p] = await db.select({ customerId: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (p?.customerId) return p.customerId;
  // the idempotency key makes two quick clicks create one customer, not two
  const customer = await stripe().customers.create(
    { email: user.email, name: user.name || undefined, metadata: { userId: user.id } },
    { idempotencyKey: `customer-${user.id}` }
  );
  const [set] = await db.update(profiles).set({ stripeCustomerId: customer.id })
    .where(and(eq(profiles.id, user.id), isNull(profiles.stripeCustomerId))).returning({ id: profiles.stripeCustomerId });
  if (set?.id) return set.id;
  const [again] = await db.select({ customerId: profiles.stripeCustomerId }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
  return again?.customerId ?? customer.id;
}

// Never two subscriptions: Stripe itself is asked first, because our table can lag behind it (the webhook may not have
// arrived yet). A live subscription sends the user to the portal; one whose first payment is still in progress waits;
// a checkout page left open in another tab is closed before a new one opens.
export type CheckoutResult = { url: string } | { pending: true };
const LIVE = ["active", "trialing", "past_due", "unpaid"];

export async function createCheckout(user: { id: string; email: string; name: string }): Promise<CheckoutResult> {
  const customer = await getOrCreateCustomer(user);
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

const toDate = (seconds: number) => new Date(seconds * 1000);
const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);

// "Sync, don't patch": fetch the subscription as it is now and upsert the whole row, so events arriving out of order
// can't leave an old state behind. A paid period also gets its usage row; a renewal's new period starts at 0.
export async function syncSubscription(subscriptionId: string): Promise<void> {
  const sub = await stripe().subscriptions.retrieve(subscriptionId);
  const customerId = idOf(sub.customer);
  let userId: string | null = sub.metadata?.userId ?? null;
  if (!userId && customerId) {
    const [p] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.stripeCustomerId, customerId)).limit(1);
    userId = p?.id ?? null;
  }
  if (userId) {   // only trust metadata that points at a real profile
    const [p] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, userId)).limit(1);
    userId = p?.id ?? null;
  }
  if (!userId) { console.warn("[stripe] subscription for an unknown customer, ignored:", subscriptionId); return; }

  // from API version 2025-03-31 the billing period lives on each subscription item
  const item = sub.items.data[0];
  if (!item) { console.warn("[stripe] subscription without items, ignored:", subscriptionId); return; }
  const row = {
    userId, status: sub.status, priceId: item.price?.id ?? null,
    currentPeriodStart: toDate(item.current_period_start), currentPeriodEnd: toDate(item.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end, updatedAt: new Date()
  };

  const [before] = await db.select({ status: subscriptions.status, periodStart: subscriptions.currentPeriodStart, cancel: subscriptions.cancelAtPeriodEnd })
    .from(subscriptions).where(eq(subscriptions.id, sub.id)).limit(1);
  await db.transaction(async tx => {
    await tx.insert(subscriptions).values({ id: sub.id, ...row }).onConflictDoUpdate({ target: subscriptions.id, set: row });
    if (PAID.includes(sub.status)) {
      await tx.insert(usagePeriods)
        .values({ userId, periodStart: row.currentPeriodStart, periodEnd: row.currentPeriodEnd, allowance: PLAN.PAID_MESSAGES_PER_PERIOD })
        .onConflictDoUpdate({ target: [usagePeriods.userId, usagePeriods.periodStart], set: { periodEnd: row.currentPeriodEnd } });
    }
  });

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
      if (customerId && userId) {
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

// Each event is handled once: its id is recorded first, and removed again if handling fails, so Stripe's retry runs
// it again. Handling is idempotent anyway (sync re-fetches), so a crash in between is harmless.
export async function processEvent(event: Stripe.Event): Promise<"handled" | "duplicate"> {
  const [fresh] = await db.insert(stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing().returning({ id: stripeEvents.id });
  if (!fresh) return "duplicate";
  try {
    await handleEvent(event);
    return "handled";
  } catch (err) {
    await db.delete(stripeEvents).where(eq(stripeEvents.id, event.id));
    throw err;
  }
}
