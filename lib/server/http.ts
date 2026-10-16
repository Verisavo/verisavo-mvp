import "server-only";

// JSON responses for API routes. Auth responses carry session cookies, so they must never be cached.
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const notFound = () => json({ error: "not_found" }, 404);

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function cleanEmail(value: unknown): string {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : "";
}

export const cleanText = (value: unknown, max: number): string => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// The same rule is configured in Supabase (Authentication -> Providers -> Email), so both sides agree
export function passwordProblem(password: unknown): string {
  if (typeof password !== "string" || password.length < 8) return "Use at least 8 characters for your password.";
  if (password.length > 72) return "Use at most 72 characters for your password.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Use both letters and numbers in your password.";
  return "";
}

// Only redirect inside this site: "/dashboard" is allowed, "//evil.com" and "https://..." are not
export const safePath = (value: unknown, fallback: string): string =>
  typeof value === "string" && /^\/(?!\/)[\w\-/?=&#.%]*$/.test(value) ? value : fallback;

// Supabase Auth answers 429 (or a *_rate_limit code) when someone retries too often
export const isRateLimited = (error: { status?: number; code?: string } | null | undefined): boolean =>
  Boolean(error && (error.status === 429 || /rate_limit/.test(error.code ?? "")));
