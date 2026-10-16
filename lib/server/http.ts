import "server-only";

// JSON responses for API routes. Auth responses carry session cookies, so they must never be cached.
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const notFound = () => json({ error: "not_found" }, 404);

export const tooMany = () => json({ error: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." }, 429);

export const forbidden = () => json({ error: "forbidden" }, 403);

// Only accept JSON sent by our own pages. A form on another site can't send application/json, and a cross-site
// fetch carries a foreign Origin, so this blocks login CSRF and other forged posts to the API.
export function fromOurSite(request: Request): boolean {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;   // non-browser clients; browsers always send Origin on POST
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

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
