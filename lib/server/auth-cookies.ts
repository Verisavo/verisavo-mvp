import type { CookieOptionsWithName } from "@supabase/ssr";

// Options for the Supabase session cookies. Only our server talks to Supabase Auth, so browser
// JavaScript never needs to read the tokens and the cookies can be httpOnly.
// Kept apart from lib/server/supabase.ts so proxy.ts can import it (proxy cannot import "server-only" modules).
export const authCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/"
};

export const supabaseConfigured = (): boolean => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
