import "server-only";
import crypto from "node:crypto";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { whatsappCodes, whatsappLinks } from "@/db/schema";
import { audit } from "@/lib/server/audit";
import { sendCodeTemplate, sendingConfigured, waLink } from "./api";

// Linking a WhatsApp number to an account (M4.2, decision D13). The code is sent by an approved authentication
// template; until there is one, the user sends "LINK <code>" from their number instead ("reverse"), which proves
// the same thing. Codes: 6 digits, stored only as a salted hash, 10 minutes, 5 tries, a new one after 30 seconds.

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

const hashCode = (code: string, salt: string) => crypto.createHash("sha256").update(`${salt}:${code}`).digest("hex");
const sameHash = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function getLink(userId: string) {
  const [link] = await db.select({ phone: whatsappLinks.phone, verifiedAt: whatsappLinks.verifiedAt }).from(whatsappLinks).where(eq(whatsappLinks.userId, userId)).limit(1);
  return link ?? null;
}

export async function userForPhone(phone: string): Promise<string | null> {
  const [link] = await db.select({ userId: whatsappLinks.userId }).from(whatsappLinks).where(eq(whatsappLinks.phone, phone)).limit(1);
  return link?.userId ?? null;
}

export async function pendingLink(userId: string) {
  const [p] = await db.select({ phone: whatsappCodes.phone, method: whatsappCodes.method, expiresAt: whatsappCodes.expiresAt, sentAt: whatsappCodes.sentAt })
    .from(whatsappCodes).where(and(eq(whatsappCodes.userId, userId), gt(whatsappCodes.expiresAt, new Date()))).limit(1);
  return p ?? null;
}

export type LinkStart = { ok: true; method: "otp" } | { ok: true; method: "reverse"; code: string; url: string } | { ok: false; error: string };

export async function startLink(userId: string, phone: string): Promise<LinkStart> {
  const [taken] = await db.select({ userId: whatsappLinks.userId }).from(whatsappLinks).where(and(eq(whatsappLinks.phone, phone), ne(whatsappLinks.userId, userId))).limit(1);
  if (taken) return { ok: false, error: "That number is already linked to another Verisavo account." };
  const [last] = await db.select({ sentAt: whatsappCodes.sentAt }).from(whatsappCodes).where(eq(whatsappCodes.userId, userId)).limit(1);
  if (last && Date.now() - last.sentAt.getTime() < RESEND_AFTER_MS) return { ok: false, error: "Please wait 30 seconds before asking for another code." };

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = crypto.randomBytes(16).toString("hex");
  const method = process.env.WHATSAPP_OTP_TEMPLATE && sendingConfigured() ? "otp" : "reverse";
  const row = { phone, method, codeHash: hashCode(code, salt), salt, attempts: 0, expiresAt: new Date(Date.now() + CODE_TTL_MS), sentAt: new Date() };
  await db.insert(whatsappCodes).values({ userId, ...row }).onConflictDoUpdate({ target: whatsappCodes.userId, set: row });

  if (method === "reverse") return { ok: true, method, code, url: waLink(`LINK ${code}`) };
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
  return completeLink(userId, p.phone);
}

// "LINK <code>" arrived from `phone` (method "reverse"): WhatsApp has already proved the sender owns that number
export async function verifyFromPhone(phone: string, code: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const rows = await db.update(whatsappCodes).set({ attempts: sql`${whatsappCodes.attempts} + 1` })
    .where(and(eq(whatsappCodes.phone, phone), eq(whatsappCodes.method, "reverse"), gt(whatsappCodes.expiresAt, new Date()), sql`${whatsappCodes.attempts} < ${MAX_ATTEMPTS}`))
    .returning();
  const match = rows.find(r => sameHash(hashCode(code, r.salt), r.codeHash));
  if (!match) return { ok: false, error: "That code didn’t match. Start again from your Verisavo dashboard to get a new one." };
  const done = await completeLink(match.userId, phone);
  return done.ok ? { ok: true, userId: match.userId } : done;
}

async function completeLink(userId: string, phone: string): Promise<{ ok: true; phone: string } | { ok: false; error: string }> {
  try {
    await db.transaction(async tx => {
      await tx.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
      await tx.insert(whatsappLinks).values({ userId, phone, verifiedAt: new Date() })
        .onConflictDoUpdate({ target: whatsappLinks.userId, set: { phone, verifiedAt: new Date() } });
    });
  } catch {
    return { ok: false, error: "That number is already linked to another Verisavo account." };   // the phone is unique
  }
  await audit("whatsapp.linked", { actorId: userId, targetType: "user", targetId: userId, metadata: { phone: maskPhone(phone) } });
  return { ok: true, phone };
}

export async function unlink(userId: string): Promise<boolean> {
  const removed = await db.delete(whatsappLinks).where(eq(whatsappLinks.userId, userId)).returning({ phone: whatsappLinks.phone });
  await db.delete(whatsappCodes).where(eq(whatsappCodes.userId, userId));
  if (removed.length) await audit("whatsapp.unlinked", { actorId: userId, targetType: "user", targetId: userId, metadata: { phone: maskPhone(removed[0].phone) } });
  return removed.length > 0;
}
