import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/server/db";

// App-side rate limits for everything that calls Supabase Auth. Supabase only sees our server's address, so its
// per-IP limits would be shared by every visitor; these are keyed on the visitor's IP and, where it helps, the email.

export type Rule = { key: string; limit: number; windowSeconds: number };

// The visitor's IP as reported by the hosting platform (Vercel puts the client first in x-forwarded-for)
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim() || "unknown";
}

// Counts one attempt against every rule; false if any rule is over its limit. Each rule is one atomic upsert,
// so parallel requests can't slip past. If the counter itself fails we let the request through (and log it),
// rather than lock everyone out because of a limiter problem.
export async function allow(rules: Rule[]): Promise<boolean> {
  try {
    let ok = true;
    for (const r of rules) {
      const [row] = await db.execute<{ count: number }>(sql`
        insert into rate_limits (key, window_start, count) values (${r.key}, now(), 1)
        on conflict (key) do update set
          count = case when rate_limits.window_start < now() - make_interval(secs => ${r.windowSeconds}) then 1 else rate_limits.count + 1 end,
          window_start = case when rate_limits.window_start < now() - make_interval(secs => ${r.windowSeconds}) then now() else rate_limits.window_start end
        returning count`);
      if (Number(row?.count ?? 0) > r.limit) ok = false;
    }
    // now and then, drop counters nobody has touched for a day
    if (Math.random() < 0.01) void db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`).catch(() => {});
    return ok;
  } catch (err) {
    console.error("[rate-limit] counter failed, allowing request:", err instanceof Error ? err.message : err);
    return true;
  }
}

// The limits, in one place
export const LIMITS = {
  login: (ip: string, email: string): Rule[] => [
    { key: `login:ip:${ip}`, limit: 20, windowSeconds: 300 },
    { key: `login:email:${email}`, limit: 10, windowSeconds: 900 }
  ],
  signup: (ip: string, email: string): Rule[] => [
    { key: `signup:ip:${ip}`, limit: 5, windowSeconds: 3600 },
    { key: `signup:email:${email}`, limit: 3, windowSeconds: 3600 }
  ],
  // forgot password and "send the email again"
  email: (ip: string, email: string): Rule[] => [
    { key: `email:ip:${ip}`, limit: 5, windowSeconds: 3600 },
    { key: `email:email:${email}`, limit: 3, windowSeconds: 3600 }
  ],
  link: (ip: string): Rule[] => [{ key: `link:ip:${ip}`, limit: 20, windowSeconds: 300 }],
  reset: (ip: string): Rule[] => [{ key: `reset:ip:${ip}`, limit: 10, windowSeconds: 300 }],
  accountChange: (userId: string): Rule[] => [{ key: `account:user:${userId}`, limit: 5, windowSeconds: 900 }],
  // M3: questions to the assistant. The plan limits how many count; this stops bursts that would run the model in parallel
  ask: (userId: string): Rule[] => [{ key: `ask:user:${userId}`, limit: 20, windowSeconds: 300 }]
};
