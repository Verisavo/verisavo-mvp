// The plan rules in one place (see the verisavo-entitlements skill). If these change, change the Pricing page text too.
export const PLAN = {
  FREE_QUESTIONS: 5,              // lifetime, text only
  PAID_MESSAGES_PER_PERIOD: 100,  // per billing period, shared across web and WhatsApp
  PRICE_TEXT: "$5 a month"        // display only: the amount charged is the Stripe price (STRIPE_PRICE_MONTHLY, decision D1)
} as const;

// What the browser is told about the user's allowance (from getEntitlements in lib/server/entitlements.ts)
export type UsageView = {
  plan: "free" | "paid";
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string | null;
  pastDue: boolean;
  cancelAtPeriodEnd: boolean;
};
