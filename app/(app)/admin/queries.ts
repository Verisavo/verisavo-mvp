import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/server/db";
import { PLAN } from "@/lib/plan";
import { PAID_SQL } from "@/lib/server/entitlements";

// Read-only queries for the admin pages. Emails live in Supabase's auth.users, which our server can read as the owner.
export const PAGE_SIZE = 25;
const like = (s: string) => `%${s.replace(/[\\%_]/g, c => "\\" + c)}%`;

export type UserRow = {
  id: string; name: string; organisation: string | null; role: string; disabled_at: string | null; created_at: string;
  email: string; last_sign_in_at: string | null; email_confirmed_at: string | null; questions: number;
  sub_status: string | null; renews_at: string | null; cancel_at_period_end: boolean | null; used: number; allowance: number;
};

const offset = (page: number, size: number, total: number) => {
  const current = Math.min(page, Math.max(1, Math.ceil(total / size)));   // a page past the end shows the last one
  return { current, skip: (current - 1) * size };
};
const isDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

export type UserFilters = { q?: string; plan?: string; status?: string };

// Plan and allowance follow the same rules as lib/server/entitlements.ts (PAID_SQL, counted per billing period);
// otherwise the free questions
export async function listUsers({ q = "", plan = "", status = "" }: UserFilters, page: number) {
  const from = sql`
    from profiles p join auth.users u on u.id = p.id
    left join lateral (
      select status, current_period_start, current_period_end, cancel_at_period_end from subscriptions
      where user_id = p.id and ${PAID_SQL} order by current_period_end desc limit 1
    ) s on true`;
  const conditions = [sql`true`];
  if (q) conditions.push(sql`(u.email ilike ${like(q)} or p.name ilike ${like(q)} or coalesce(p.organisation, '') ilike ${like(q)})`);
  if (plan === "paid") conditions.push(sql`s.status is not null`);
  if (plan === "free") conditions.push(sql`s.status is null`);
  if (status === "active") conditions.push(sql`p.disabled_at is null`);
  if (status === "disabled") conditions.push(sql`p.disabled_at is not null`);
  if (status === "unconfirmed") conditions.push(sql`u.email_confirmed_at is null`);
  const where = sql.join(conditions, sql` and `);
  const [{ total }] = await db.execute<{ total: number }>(sql`select count(*)::int as total ${from} where ${where}`);
  const { current, skip } = offset(page, PAGE_SIZE, total);
  const rows = await db.execute<UserRow>(sql`
    select p.id, p.name, p.organisation, p.role, p.disabled_at, p.created_at,
           u.email, u.last_sign_in_at, u.email_confirmed_at,
           (select count(*) from messages m where m.user_id = p.id and m.role = 'user')::int as questions,
           s.status as sub_status, s.current_period_end as renews_at, s.cancel_at_period_end,
           (case when s.status is null then coalesce(f.used, 0) else coalesce(up.used, 0) end)::int as used,
           (case when s.status is null then ${PLAN.FREE_QUESTIONS} else coalesce(up.allowance, ${PLAN.PAID_MESSAGES_PER_PERIOD}) end)::int as allowance
    ${from}
    left join usage_periods up on up.user_id = p.id and up.period_start = s.current_period_start
    left join free_usage f on f.user_id = p.id
    where ${where}
    order by p.created_at desc
    limit ${PAGE_SIZE} offset ${skip}`);
  return { rows: [...rows], total, page: current };
}

export type ActivityRow = { id: number; action: string; target_type: string | null; target_id: string | null; created_at: string; name: string | null; email: string | null; target_email: string | null };
export type ActivityFilters = { group?: string; who?: string; from?: string; to?: string };

export async function listActivity({ group = "", who = "", from = "", to = "" }: ActivityFilters, page: number, limit = PAGE_SIZE) {
  const conditions = [sql`true`];
  if (group) conditions.push(sql`a.action like ${group + "%"}`);
  if (who) conditions.push(sql`(u.email ilike ${like(who)} or p.name ilike ${like(who)})`);
  if (isDay(from)) conditions.push(sql`a.created_at >= ${from}::date`);
  if (isDay(to)) conditions.push(sql`a.created_at < ${to}::date + 1`);
  const where = sql.join(conditions, sql` and `);
  const joins = sql`from audit_events a left join profiles p on p.id = a.actor_id left join auth.users u on u.id = a.actor_id`;
  const [{ total }] = await db.execute<{ total: number }>(sql`select count(*)::int as total ${joins} where ${where}`);
  const { current, skip } = offset(page, limit, total);
  const rows = await db.execute<ActivityRow>(sql`
    select a.id, a.action, a.target_type, a.target_id, a.created_at, p.name, u.email, t.email as target_email
    ${joins}
    left join auth.users t on a.target_type = 'user' and t.id::text = a.target_id
    where ${where}
    order by a.id desc
    limit ${limit} offset ${skip}`);
  return { rows: [...rows], total, page: current };
}

export async function overviewStats() {
  const [users] = await db.execute<{ total: number; new7: number; admins: number; disabled: number; confirmed: number }>(sql`
    select count(*)::int as total,
           count(*) filter (where p.created_at > now() - interval '7 days')::int as new7,
           count(*) filter (where p.role = 'admin')::int as admins,
           count(*) filter (where p.disabled_at is not null)::int as disabled,
           count(*) filter (where u.email_confirmed_at is not null)::int as confirmed
    from profiles p join auth.users u on u.id = p.id`);
  const [kb] = await db.execute<{ published: number; drafts: number; archived: number; chunks: number }>(sql`
    select count(*) filter (where status = 'published')::int as published,
           count(*) filter (where status = 'draft')::int as drafts,
           count(*) filter (where status = 'archived')::int as archived,
           coalesce(sum(chunk_count), 0)::int as chunks
    from kb_documents`);
  // paid users and subscriptions (M2.3 with M3's billing), by the same rule as entitlements (PAID_SQL)
  const [plans] = await db.execute<{ paid: number; past_due: number; cancelling: number }>(sql`
    select count(distinct user_id) filter (where ${PAID_SQL})::int as paid,
           count(*) filter (where ${PAID_SQL} and status = 'past_due')::int as past_due,
           count(*) filter (where ${PAID_SQL} and cancel_at_period_end)::int as cancelling
    from subscriptions`);
  // questions asked per day, last 14 days, by channel (M2.3)
  const days = await db.execute<{ day: string; web: number; whatsapp: number }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day,
           count(m.id) filter (where m.channel = 'web')::int as web,
           count(m.id) filter (where m.channel = 'whatsapp')::int as whatsapp
    from generate_series(current_date - 13, current_date, interval '1 day') d
    left join messages m on m.role = 'user' and m.created_at >= d and m.created_at < d + interval '1 day'
    group by d order by d desc`);
  // new accounts per day, same 14 days
  const signups = await db.execute<{ day: string; users: number }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day, count(p.id)::int as users
    from generate_series(current_date - 13, current_date, interval '1 day') d
    left join profiles p on p.created_at >= d and p.created_at < d + interval '1 day'
    group by d order by d`);
  return { users, kb, days, plans, signups };
}
