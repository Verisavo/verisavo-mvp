import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { recoveryGrants } from "@/db/schema";
import type { createSupabase } from "@/lib/server/supabase";

// A password-reset link allows exactly one password change, only in the session that link created, for 15 minutes.
// Without this, any signed-in session (say, an unattended browser) could change the password without knowing it.
type Supabase = Awaited<ReturnType<typeof createSupabase>>;
const MINUTES = 15;

async function currentSession(supabase: Supabase) {
  const { data } = await supabase.auth.getClaims();
  const sessionId = data?.claims?.session_id, userId = data?.claims?.sub;
  return sessionId && userId ? { sessionId, userId } : null;
}

// Called by /auth/confirm right after a recovery link has signed the user in
export async function grantRecovery(supabase: Supabase): Promise<void> {
  const s = await currentSession(supabase);
  if (!s) return;
  const expiresAt = new Date(Date.now() + MINUTES * 60_000);
  await db.insert(recoveryGrants).values({ ...s, expiresAt })
    .onConflictDoUpdate({ target: recoveryGrants.sessionId, set: { expiresAt } });
}

// Does this session hold a live grant? (the reset page shows its form only then)
export async function hasRecoveryGrant(supabase: Supabase): Promise<{ sessionId: string; userId: string } | null> {
  const s = await currentSession(supabase);
  if (!s) return null;
  const [row] = await db.select({ sessionId: recoveryGrants.sessionId }).from(recoveryGrants)
    .where(and(eq(recoveryGrants.sessionId, s.sessionId), eq(recoveryGrants.userId, s.userId), gt(recoveryGrants.expiresAt, new Date())))
    .limit(1);
  return row ? s : null;
}

export async function consumeRecoveryGrant(sessionId: string): Promise<void> {
  await db.delete(recoveryGrants).where(eq(recoveryGrants.sessionId, sessionId));
}
