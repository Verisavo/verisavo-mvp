import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/server/db";
import { profiles, type Profile } from "@/db/schema";
import { createSupabase } from "@/lib/server/supabase";
import { supabaseConfigured } from "@/lib/server/auth-cookies";

export type SessionUser = { id: string; email: string };
export type CurrentUser = SessionUser & { profile: Profile };

// The signed-in user for this request, or null. getClaims verifies the session token's signature with Supabase.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  await connection();   // anything that depends on the user is per request
  if (!supabaseConfigured()) return null;
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: data.claims.email ?? "" };
});

export async function getProfile(userId: string): Promise<Profile | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return row ?? null;
}

// What the browser may know about the signed-in user
export const publicUser = (user: SessionUser, profile: Profile | null) => ({
  id: user.id,
  email: user.email,
  name: profile?.name ?? "",
  organisation: profile?.organisation ?? "",
  role: profile?.role ?? "user"
});

// The signed-in, enabled user with their profile, or null
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (!profile || profile.disabledAt) return null;
  return { ...user, profile };
}

// Is "Continue with Google" switched on in Supabase? Asked at most every 5 minutes, so the button appears by itself
// once it's set up, and nobody is sent to a Google button that can't work.
let google: { on: boolean; at: number } | null = null;
export async function googleEnabled(): Promise<boolean> {
  if (google && Date.now() - google.at < 300_000) return google.on;
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "" }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    const settings = (await r.json()) as { external?: { google?: boolean } };
    google = { on: r.ok && Boolean(settings.external?.google), at: Date.now() };
    return google.on;
  } catch {
    return google?.on ?? false;
  }
}

// After signing in with Google, only these pages can be the destination
export const afterGoogle = (next: unknown): string => (next === "/assistant" ? "/assistant" : "/dashboard");

// For pages and server actions: the current user, or a redirect to sign in
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/platform#signin");
  return user;
}
