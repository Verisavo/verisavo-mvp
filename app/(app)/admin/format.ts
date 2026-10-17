// Small display helpers for the admin pages
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dayTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const fmtDay = (d: Date | string | null | undefined) => (d ? day.format(new Date(d)) : "—");
export const fmtWhen = (d: Date | string | null | undefined) => (d ? dayTime.format(new Date(d)) : "—");

// ?page=N from the address bar: a whole number from 1 to 1000; anything else (1e309, -3, "x") is page 1
export const pageParam = (value: unknown): number => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 ? Math.min(n, 1000) : 1;
};

// Plain-English names for the activity log
const ACTIONS: Record<string, string> = {
  "auth.sign_up": "Signed up",
  "auth.email_confirmed": "Confirmed email",
  "auth.sign_in": "Signed in",
  "auth.sign_out": "Signed out",
  "auth.recovery_link": "Opened a password-reset link",
  "auth.password_reset": "Reset password",
  "auth.password_change": "Changed password",
  "auth.email_change_requested": "Asked to change email",
  "auth.email_changed": "Changed email",
  "profile.update": "Updated profile",
  "conversation.delete": "Deleted a conversation",
  "conversation.delete_all": "Deleted all their conversations",
  "admin.allowance_reset": "Reset a user's allowance",
  "billing.subscribed": "Subscribed to Verisavo Monthly",
  "billing.renewed": "Subscription renewed",
  "billing.cancel_scheduled": "Cancelled (ends at the period end)",
  "billing.cancel_undone": "Kept their subscription",
  "billing.ended": "Subscription ended",
  "billing.payment_failed": "Payment failed",
  "billing.manual_granted": "Was given the paid plan (no Stripe)",
  "billing.manual_revoked": "Had the manual paid plan removed",
  "whatsapp.linked": "Linked a WhatsApp number",
  "whatsapp.unlinked": "Unlinked their WhatsApp number",
  "admin.whatsapp_unlinked": "Unlinked a user's WhatsApp number",
  "admin.user_disable": "Disabled a user",
  "admin.user_enable": "Re-enabled a user",
  "admin.renewal_change_failed": "Couldn't change a user's plan renewal in Stripe (do it in the Stripe dashboard)",
  "admin.role_granted": "Was made an admin",
  "admin.role_revoked": "Stopped being an admin",
  "kb.create": "Added a knowledge-base document",
  "kb.update": "Edited a knowledge-base document",
  "kb.publish": "Published a knowledge-base document",
  "kb.archive": "Archived a knowledge-base document",
  "kb.restore": "Restored a knowledge-base document",
  "kb.reindex": "Re-indexed a knowledge-base document",
  "ai.answers_change": "Changed the AI service for answers",
  "ai.search_change": "Changed the knowledge search model"
};
export const actionLabel = (action: string) => ACTIONS[action] ?? action;

export const ACTION_GROUPS = [
  { value: "", label: "All activity" },
  { value: "auth.", label: "Sign-in and accounts" },
  { value: "profile.", label: "Profile changes" },
  { value: "kb.", label: "Knowledge base" },
  { value: "admin.", label: "Admin actions" },
  { value: "ai.", label: "AI settings" },
  { value: "billing.", label: "Subscriptions" },
  { value: "whatsapp.", label: "WhatsApp" },
  { value: "conversation.", label: "Conversations" }
];
