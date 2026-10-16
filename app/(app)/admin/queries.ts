import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/server/db";

// Read-only queries for the admin pages. Emails live in Supabase's auth.users, which our server can read as the owner.
export const PAGE_SIZE = 50;
const like = (s: string) => `%${s.replace(/[\\%_]/g, c => "\\" + c)}%`;

export type UserRow = {
  id: string; name: string; organisation: string | null; role: string; disabled_at: string | null; created_at: string;
  email: string; last_sign_in_at: string | null; email_confirmed_at: string | null; questions: number;
};

export async function listUsers(q: string, page: number) {
  const rows = await db.execute<UserRow>(sql`
    select p.id, p.name, p.organisation, p.role, p.disabled_at, p.created_at,
           u.email, u.last_sign_in_at, u.email_confirmed_at,
           (select count(*) from messages m where m.user_id = p.id and m.role = 'user')::int as questions
    from profiles p join auth.users u on u.id = p.id
    where ${q} = '' or u.email ilike ${like(q)} or p.name ilike ${like(q)} or coalesce(p.organisation, '') ilike ${like(q)}
    order by p.created_at desc
    limit ${PAGE_SIZE + 1} offset ${(page - 1) * PAGE_SIZE}`);
  return { rows: rows.slice(0, PAGE_SIZE), more: rows.length > PAGE_SIZE };
}

export type ActivityRow = { id: number; action: string; target_type: string | null; target_id: string | null; created_at: string; name: string | null; email: string | null };

export async function listActivity(group: string, page: number, limit = PAGE_SIZE) {
  const rows = await db.execute<ActivityRow>(sql`
    select a.id, a.action, a.target_type, a.target_id, a.created_at, p.name, u.email
    from audit_events a
    left join profiles p on p.id = a.actor_id
    left join auth.users u on u.id = a.actor_id
    where ${group} = '' or a.action like ${group + "%"}
    order by a.id desc
    limit ${limit + 1} offset ${(page - 1) * limit}`);
  return { rows: rows.slice(0, limit), more: rows.length > limit };
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
  // questions asked per day, last 14 days, by channel (M2.3)
  const days = await db.execute<{ day: string; web: number; whatsapp: number }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day,
           count(m.id) filter (where m.channel = 'web')::int as web,
           count(m.id) filter (where m.channel = 'whatsapp')::int as whatsapp
    from generate_series(current_date - 13, current_date, interval '1 day') d
    left join messages m on m.role = 'user' and m.created_at >= d and m.created_at < d + interval '1 day'
    group by d order by d desc`);
  return { users, kb, days };
}
