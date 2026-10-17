import "server-only";
import crypto from "node:crypto";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { profiles, whatsappCodes, whatsappLinks } from "@/db/schema";
import { audit } from "@/lib/server/audit";
import { allow, LIMITS } from "@/lib/server/rate-limit";
import { getEntitlements } from "@/lib/server/entitlements";
import { sendCodeTemplate, sendingConfigured, waLink } from "./api";

// Linking a WhatsApp number to an account (M4.2, decision D13). The code is sent by an approved authentication
// template; until there is one, the user sends "LINK <code>" from their number instead ("reverse"), which proves
// the same thing. Codes: 6 digits, stored only as a keyed hash, 10 minutes, 5 tries, a new one after 30 seconds.
// The phone always has the last word: the link confirmation names the account, and replying UNLINK removes it.

export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_AFTER_MS = 30 * 1000;
export const MAX_ATTEMPTS = 5;

// "+234 803 123 4567" or "00234…" -> "2348031234567". A country code is required; numbers are kept as digits only,
// the way WhatsApp sends them.
export function normalizePhone(input: unknown): string | null {
  let s = String(input ?? "").replace(/[\s().-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  else if (s.startsWith("00")) s = s.slice(2);
  else return null;
  return /^[1-9]\d{7,14}$/.test(s) ? s : null;
}
export const maskPhone = (digits: string) => `+${digits.slice(0, 3)} •••• ${digits.slice(-4)}`;
const maskEmail = (email: string) => { const [name, domain] = email.split("@"); return `${name.slice(0, 1)}•••@${domain ?? ""}`; };

// keyed with a server secret, so a copy of the table alone doesn't reveal the codes
const hashCode = (code: string, salt: string) =>
  crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET || "verisavo-dev").update(`${salt}:${code}`).digest("hex");
const sameHash = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function getLink(userId: string) {
  const [link] = await db.select({ phone: whatsappLinks.phone, verifiedAt: whatsappLinks.verifiedAt }).from(whatsappLinks).where(eq(whatsappLinks.userId, userId)).limit(1);
  return link ?? null;
}

export async function userForPhone(phone: string): Promise<string | null> {
  const [link] = await db.select({ userId: whatsappLinks.userId }).from(whatsappLinks).where(eq(whatsappLinks.phone, phone)).limit(1);
  return link?.userId ?? null;
}

export type LinkStart = { ok: true; method: "otp" } | { ok: true; method: "reverse"; code: string; url: string } | { ok: false; error: string };

// Never says whether the number belongs to another account (that would let anyone check who uses Verisavo):
// a taken number simply gets no code (OTP), or fails when the phone owner sends it (reverse), where they're told.
export async function startLink(userId: string, phone: string): Promise<LinkStart> {
  const [last] = await db.select({ sentAt: whatsappCodes.sentAt }).from(whatsappCodes).where(eq(whatsappCodes.userId, userId)).limit(1);
  if (last && Date.now() - last.sentAt.getTime() < RESEND_AFTER_MS) return { ok: false, error: "Please wait 30 seconds before asking for another code." };

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = crypto.randomBytes(16).toString("hex");
  const method = process.env.WHATSAPP_OTP_TEMPLATE && sendingConfigured() ? "otp" : "reverse";
  const row = { phone, method, codeHash: hashCode(code, salt), salt, attempts: 0, expiresAt: new Date(Date.now() + CODE_TTL_MS), sentAt: new Date() };
  await db.insert(whatsappCodes).values({ userId, ...row }).onConflictDoUpdate({ target: whatsappCodes.userId, set: row });
  if (method === "reverse") return { ok: true, method, code, url: waLink(`LINK ${code}`) };

  // OTP: a template message costs money and lands on someone's phone, so it's only sent to a free number, with limits
  // per number and overall that one account can't use up for someone else
  const [taken] = await db.select({ userId: whatsappLinks.userId }).from(whatsappLinks).where(and(eq(whatsappLinks.phone, phone), ne(whatsappLinks.userId, userId))).limit(1);
  if (taken || !(await allow(LIMITS.whatsappTemplate(phone)))) return { ok: true, method };
  if (!(await sendCodeTemplate(phone, code))) {
    await db.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
    return { ok: false, error: "We couldn’t send a code to that number. Check that it uses WhatsApp, then try again." };
  }
  return { ok: true, method };
}

// The code typed into the dashboard (method "otp")
export async function verifyCode(userId: string, code: string): Promise<{ ok: true; phone: string } | { ok: false; error: string }> {
  const expired = { ok: false as const, error: "That code has expired. Ask for a new one." };
  // count the try first, atomically, so parallel guesses can't get more than 5
  const [p] = await db.update(whatsappCodes).set({ attempts: sql`${whatsappCodes.attempts} + 1` })
    .where(and(eq(whatsappCodes.userId, userId), eq(whatsappCodes.method, "otp"), gt(whatsappCodes.expiresAt, new Date()), sql`${whatsappCodes.attempts} < ${MAX_ATTEMPTS}`))
    .returning();
  if (!p) return expired;
  if (!/^\d{6}$/.test(code) || !sameHash(hashCode(code, p.salt), p.codeHash)) {
    const left = MAX_ATTEMPTS - p.attempts;
    return { ok: false, error: left > 0 ? `That code isn’t right. ${left} ${left === 1 ? "try" : "tries"} left.` : "That code isn’t right, and it can’t be used any more. Ask for a new one." };
  }
  const done = await completeLink(userId, p.phone);
  return done.ok ? { ok: true, phone: p.phone } : done;
}

// "LINK <code>" arrived from `phone` (method "reverse"): WhatsApp has already proved the sender owns that number.
// The reply names the account it was linked to, so someone tricked into sending the code sees it and can UNLINK.
export async function verifyFromPhone(phone: string, code: string): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const rows = await db.update(whatsappCodes).set({ attempts: sql`${whatsappCodes.attempts} + 1` })
    .where(and(eq(whatsappCodes.phone, phone), eq(whatsappCodes.method, "reverse"), gt(whatsappCodes.expiresAt, new Date()), sql`${whatsappCodes.attempts} < ${MAX_ATTEMPTS}`))
    .returning();
  const match = rows.find(r => sameHash(hashCode(code, r.salt), r.codeHash));
  if (!match) return { ok: false, error: "That code didn’t match. Start again from your Verisavo dashboard to get a new one." };
  const done = await completeLink(match.userId, phone);
  if (!done.ok) return done;
  const [owner] = await db.execute<{ email: string }>(sql`select email from auth.users where id = ${match.userId}`);
  return { ok: true, reply: `This number is now linked to the Verisavo account ${maskEmail(owner?.email ?? "")}. Ask me anything about your markets.\n\nNot your account? Reply UNLINK.` };
}

async function completeLink(userId: string, phone: string): Promise<{ ok: true } | { ok: false; error: string }> {
  // the account must still be enabled and paid when the link completes
  const [profile] = await db.select({ disabledAt: profiles.disabledAt }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!profile || profile.disabledAt || !(await getEntitlements(userId)).features.whatsapp) {
    await db.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
    return { ok: false, error: "This Verisavo account can’t link WhatsApp right now (it needs an active subscription)." };
  }
  try {
    await db.transaction(async tx => {
      await tx.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
      await tx.insert(whatsappLinks).values({ userId, phone, verifiedAt: new Date() })
        .onConflictDoUpdate({ target: whatsappLinks.userId, set: { phone, verifiedAt: new Date() } });
    });
  } catch {
    return { ok: false, error: "This number is already linked to another Verisavo account. Reply UNLINK from it first if that account is no longer yours." };
  }
  await audit("whatsapp.linked", { actorId: userId, targetType: "user", targetId: userId, metadata: { phone: maskPhone(phone) } });
  return { ok: true };
}

// By the account owner (dashboard), by the phone itself (UNLINK), by an admin, or because WhatsApp says the number changed
export async function unlink(userId: string, { actorId = userId, reason = "dashboard" }: { actorId?: string | null; reason?: string } = {}): Promise<boolean> {
  const removed = await db.delete(whatsappLinks).where(eq(whatsappLinks.userId, userId)).returning({ phone: whatsappLinks.phone });
  await db.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
  if (removed.length) await audit(actorId === userId ? "whatsapp.unlinked" : "admin.whatsapp_unlinked", { actorId, targetType: "user", targetId: userId, metadata: { phone: maskPhone(removed[0].phone), reason } });
  return removed.length > 0;
}

export async function unlinkPhone(phone: string, reason: string): Promise<boolean> {
  const userId = await userForPhone(phone);
  return userId ? unlink(userId, { actorId: userId, reason }) : false;
}
