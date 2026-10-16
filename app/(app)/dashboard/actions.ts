"use server";
// Dashboard actions. Each one checks the session itself: never trust that the page was only shown to the right user.
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { released } from "@/lib/release";
import { db } from "@/lib/server/db";
import { conversations, profiles } from "@/db/schema";
import { getSessionUser, requireUser } from "@/lib/server/auth";
import { createSupabase } from "@/lib/server/supabase";
import { audit } from "@/lib/server/audit";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { cleanEmail, cleanText, isRateLimited, passwordProblem } from "@/lib/server/http";

const TOO_MANY = { error: "Too many attempts. Please wait a few minutes and try again." };

export type FormState = { ok?: string; error?: string } | null;

async function liveUser() {
  if (!released(1)) redirect("/");
  return requireUser();
}

export async function updateProfile(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await liveUser();
  const name = cleanText(formData.get("name"), 120);
  const organisation = cleanText(formData.get("organisation"), 160);
  if (!name) return { error: "Enter your name." };
  await db.update(profiles).set({ name, organisation: organisation || null, updatedAt: new Date() }).where(eq(profiles.id, user.id));
  await audit("profile.update", { actorId: user.id, targetType: "profile", targetId: user.id });
  revalidatePath("/dashboard");
  return { ok: "Saved." };
}

export async function changeEmail(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await liveUser();
  const email = cleanEmail(formData.get("email"));
  if (!email) return { error: "Enter a valid email address." };
  if (email === user.email.toLowerCase()) return { error: "That's already your email address." };
  if (!(await allow(LIMITS.accountChange(user.id)))) return TOO_MANY;
  const almostDone = { ok: `Almost done: open the confirmation links we sent to your current address and to ${email}.` };
  const supabase = await createSupabase();
  const { error } = await supabase.auth.updateUser({ email });
  if (isRateLimited(error)) return TOO_MANY;
  if (error) {
    // Same answer as success, so this form can't be used to find out which emails have accounts
    if (error.code === "email_exists") return almostDone;
    console.error("[dashboard/changeEmail]", error.code, error.message);
    return { error: "We couldn't change your email. Please try again." };
  }
  await audit("auth.email_change_requested", { actorId: user.id });
  return almostDone;
}

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await liveUser();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const weak = passwordProblem(password);
  if (weak) return { error: weak };
  if (!(await allow(LIMITS.accountChange(user.id)))) return TOO_MANY;

  const supabase = await createSupabase();
  // Ask for the current password first, so an unattended signed-in browser can't be used to take over the account
  const { error: wrong } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (wrong) return { error: isRateLimited(wrong) ? "Too many attempts. Please wait a few minutes and try again." : "Your current password isn't right." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used before." };
    console.error("[dashboard/changePassword]", error.code, error.message);
    return { error: "We couldn't change your password. Please try again." };
  }
  await audit("auth.password_change", { actorId: user.id });
  return { ok: "Your password has been changed." };
}

export async function deleteConversation(formData: FormData): Promise<void> {
  const user = await liveUser();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  // Scoped to the owner: another user's id simply matches nothing
  const removed = await db.delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)))
    .returning({ id: conversations.id });
  if (removed.length) await audit("conversation.delete", { actorId: user.id, targetType: "conversation", targetId: id });
  revalidatePath("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const user = await getSessionUser();
  const supabase = await createSupabase();
  await supabase.auth.signOut({ scope: "local" });   // this device only, not every device the user is signed in on
  if (user) await audit("auth.sign_out", { actorId: user.id });
  redirect("/");
}
