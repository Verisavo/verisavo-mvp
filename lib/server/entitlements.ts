import "server-only";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { freeUsage, subscriptions, usageEvents, usagePeriods } from "@/db/schema";
import { PLAN, type UsageView } from "@/lib/plan";
import { audit } from "@/lib/server/audit";

// Who may ask, and how much (see the verisavo-entitlements skill). The only module that reads or writes usage
// counters; the web assistant and WhatsApp both go through consumeMessage before calling the model.

export type Feature = "uploads" | "pdf" | "whatsapp";
export type BlockReason = "free_exhausted" | "period_exhausted" | "feature_requires_subscription";
export type Entitlements = {
  plan: "free" | "paid";
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date | null;           // paid: the end of the billing period
  cancelAtPeriodEnd: boolean;
  pastDue: boolean;                // paid, but Stripe is retrying a failed payment (decision D9)
  features: Record<Feature, boolean>;
};

// Who is paid, as a condition on the subscriptions table (also used by the admin pages):
// - active or trialing, up to 3 days past the period end (a renewal webhook can be late; it shouldn't cut anyone off,
//   but a cancellation the webhook never delivered can't keep someone paid for ever either)
// - past_due (decision D9: Stripe is retrying a failed payment) for at most 21 days into the period
// unpaid and canceled never count. Constant SQL, no user input.
export const PAID_SQL = sql.raw(`((status in ('active', 'trialing') and current_period_end > now() - interval '3 days')
  or (status = 'past_due' and current_period_start > now() - interval '21 days'))`);

async function currentSubscription(userId: string) {
  const [sub] = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), PAID_SQL))
    .orderBy(desc(subscriptions.currentPeriodEnd)).limit(1);
  return sub ?? null;
}
type Sub = NonNullable<Awaited<ReturnType<typeof currentSubscription>>>;

// The usage row for the subscription's current period. Created here if the renewal webhook hasn't arrived yet, so a
// paying user is never blocked by a slow webhook (a late renewal keeps counting in the latest known period).
const periodRow = (userId: string, sub: Sub) =>
  ({ userId, periodStart: sub.currentPeriodStart, periodEnd: sub.currentPeriodEnd, allowance: PLAN.PAID_MESSAGES_PER_PERIOD });

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const sub = await currentSubscription(userId);
  if (sub) {
    const [p] = await db.select({ used: usagePeriods.used, allowance: usagePeriods.allowance }).from(usagePeriods)
      .where(and(eq(usagePeriods.userId, userId), eq(usagePeriods.periodStart, sub.currentPeriodStart))).limit(1);
    const used = p?.used ?? 0, limit = p?.allowance ?? PLAN.PAID_MESSAGES_PER_PERIOD;
    return {
      plan: "paid", used, limit, remaining: Math.max(0, limit - used), resetsAt: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd, pastDue: sub.status === "past_due",
      features: { uploads: true, pdf: true, whatsapp: true }
    };
  }
  const [f] = await db.select({ used: freeUsage.used }).from(freeUsage).where(eq(freeUsage.userId, userId)).limit(1);
  const used = f?.used ?? 0;
  return {
    plan: "free", used, limit: PLAN.FREE_QUESTIONS, remaining: Math.max(0, PLAN.FREE_QUESTIONS - used), resetsAt: null,
    cancelAtPeriodEnd: false, pastDue: false, features: { uploads: false, pdf: false, whatsapp: false }
  };
}

export const usageView = (e: Entitlements): UsageView => ({
  plan: e.plan, used: e.used, limit: e.limit, remaining: e.remaining, resetsAt: e.resetsAt?.toISOString() ?? null,
  pastDue: e.pastDue, cancelAtPeriodEnd: e.cancelAtPeriodEnd
});

class Blocked extends Error {
  constructor(readonly reason: BlockReason | "duplicate") { super(reason); }
}

export type Consumed = { ok: true; usageEventId: number; remaining: number } | { ok: false; reason: BlockReason | "duplicate" };

// Counts one question, in one transaction: record the event (a retry with the same id is refused as "duplicate"),
// then add 1 only if the counter is still under its limit. Never read-then-write, so two tabs at 4/5 can't both pass.
export async function consumeMessage(userId: string, { channel, externalId }: { channel: "web" | "whatsapp"; externalId: string }): Promise<Consumed> {
  const sub = await currentSubscription(userId);
  try {
    return await db.transaction(async tx => {
      const [event] = await tx.insert(usageEvents)
        .values({ userId, channel, externalId, bucket: sub ? "paid" : "free", periodStart: sub?.currentPeriodStart ?? null })
        .onConflictDoNothing().returning({ id: usageEvents.id });
      if (!event) throw new Blocked("duplicate");
      if (sub) {
        await tx.insert(usagePeriods).values(periodRow(userId, sub)).onConflictDoNothing();
        const [row] = await tx.update(usagePeriods).set({ used: sql`${usagePeriods.used} + 1` })
          .where(and(eq(usagePeriods.userId, userId), eq(usagePeriods.periodStart, sub.currentPeriodStart), sql`${usagePeriods.used} < ${usagePeriods.allowance}`))
          .returning({ used: usagePeriods.used, allowance: usagePeriods.allowance });
        if (!row) throw new Blocked("period_exhausted");
        return { ok: true as const, usageEventId: event.id, remaining: row.allowance - row.used };
      }
      await tx.insert(freeUsage).values({ userId }).onConflictDoNothing();
      const [row] = await tx.update(freeUsage).set({ used: sql`${freeUsage.used} + 1` })
        .where(and(eq(freeUsage.userId, userId), sql`${freeUsage.used} < ${PLAN.FREE_QUESTIONS}`))
        .returning({ used: freeUsage.used });
      if (!row) throw new Blocked("free_exhausted");
      return { ok: true as const, usageEventId: event.id, remaining: PLAN.FREE_QUESTIONS - row.used };
    });
  } catch (err) {
    if (err instanceof Blocked) return { ok: false, reason: err.reason };
    throw err;
  }
}

// We failed to answer, so the question doesn't count (decision D4). Safe to call twice: only the first refund counts.
export async function refundMessage(usageEventId: number): Promise<void> {
  await db.transaction(async tx => {
    const [event] = await tx.update(usageEvents).set({ refundedAt: new Date() })
      .where(and(eq(usageEvents.id, usageEventId), isNull(usageEvents.refundedAt)))
      .returning({ userId: usageEvents.userId, bucket: usageEvents.bucket, periodStart: usageEvents.periodStart });
    if (!event) return;
    if (event.bucket === "paid" && event.periodStart) {
      await tx.update(usagePeriods).set({ used: sql`greatest(${usagePeriods.used} - 1, 0)` })
        .where(and(eq(usagePeriods.userId, event.userId), eq(usagePeriods.periodStart, event.periodStart)));
    } else {
      await tx.update(freeUsage).set({ used: sql`greatest(${freeUsage.used} - 1, 0)` }).where(eq(freeUsage.userId, event.userId));
    }
  });
}

// Decision D10: an admin sets the user's current count back to 0 (the current billing period, or the free questions)
export async function resetAllowance(userId: string, actorId: string): Promise<Entitlements> {
  const sub = await currentSubscription(userId);
  if (sub) {
    await db.insert(usagePeriods).values(periodRow(userId, sub)).onConflictDoUpdate({ target: [usagePeriods.userId, usagePeriods.periodStart], set: { used: 0 } });
  } else {
    await db.insert(freeUsage).values({ userId }).onConflictDoUpdate({ target: freeUsage.userId, set: { used: 0 } });
  }
  await audit("admin.allowance_reset", { actorId, targetType: "user", targetId: userId, metadata: { plan: sub ? "paid" : "free" } });
  return getEntitlements(userId);
}
