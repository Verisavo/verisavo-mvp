import type { EmailOtpType } from "@supabase/supabase-js";

// The kinds of email link /auth/confirm accepts (see "Accounts" in the README for the email templates)
export const LINK_TYPES = ["email", "recovery", "email_change"] as const satisfies readonly EmailOtpType[];
export type LinkType = (typeof LINK_TYPES)[number];
export const isLinkType = (value: unknown): value is LinkType => LINK_TYPES.includes(value as LinkType);

export const LINK_TEXT: Record<LinkType, { eyebrow: string; title: string; body: string; button: string }> = {
  email: { eyebrow: "Confirm your email", title: "One more step", body: "Press the button to confirm your email and sign in to Verisavo.", button: "Confirm and continue" },
  recovery: { eyebrow: "Password reset", title: "Reset your password", body: "Press the button to choose a new password.", button: "Continue" },
  email_change: { eyebrow: "New email address", title: "Confirm your new email", body: "Press the button to confirm the change to your sign-in email.", button: "Confirm" }
};
