// Shared helpers for the end-to-end tests (M5.1). The tests drive the running app over HTTP, like a browser, and
// check the dev database directly. Every run creates its own throwaway accounts and removes them afterwards.
//
// Needs: the dev server running (npm run dev; E2E_BASE_URL, default http://localhost:3000) with RELEASE_STAGE=5,
// and .env.local pointing at the DEV database. They refuse to run against the live database.
import fs from "node:fs";
import http from "node:http";
import crypto from "node:crypto";
import zlib from "node:zlib";
import postgres from "postgres";

export const BASE = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

// ---- settings from .env.local (never printed)
export function env(key, file = ".env.local") {
  if (!fs.existsSync(file)) return "";
  const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find(l => l.startsWith(key + "="));
  return line ? line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}
const ref = url => { try { const u = new URL(url); return u.username.split(".")[1] || u.hostname; } catch { return ""; } };
const devUrl = env("DATABASE_URL_MIGRATE");
if (!devUrl) throw new Error("DATABASE_URL_MIGRATE is missing in .env.local");
if (env("DATABASE_URL_MIGRATE", ".env.prod.local") && ref(env("DATABASE_URL_MIGRATE", ".env.prod.local")) === ref(devUrl)) {
  throw new Error(".env.local points at the live database. The end-to-end tests only run against dev.");
}
export const sql = postgres(devUrl, { prepare: false, max: 2, idle_timeout: 2 });
export const configured = {
  search: Boolean(env("GOOGLE_GENERATIVE_AI_API_KEY") || env("OPENAI_API_KEY")),
  answers: Boolean(env("ANTHROPIC_API_KEY") || env("OPENAI_API_KEY") || env("GOOGLE_GENERATIVE_AI_API_KEY")),
  whatsappStandIn: env("WHATSAPP_API_BASE").startsWith("http://localhost:4010") && Boolean(env("WHATSAPP_APP_SECRET")),
  stripe: Boolean(env("STRIPE_SECRET_KEY").startsWith("sk_test_") && env("STRIPE_WEBHOOK_SECRET") && env("STRIPE_PRICE_MONTHLY"))
};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const uuid = () => crypto.randomUUID();
const unescape = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// ---- throwaway accounts, confirmed, made straight in Supabase Auth (no emails are sent)
const made = [];
export async function createUser({ name = "E2E Tester", admin = false, paid = false, freeUsed = 0, paidUsed = 0, disabled = false } = {}) {
  const email = `e2e-${crypto.randomBytes(5).toString("hex")}@test.verisavo.dev`;
  const password = `Vs${crypto.randomBytes(6).toString("hex")}9z`;
  const [user] = await sql`
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                            created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', ${email},
            extensions.crypt(${password}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
            ${sql.json({ name, organisation: "E2E" })}, now(), now(), '', '', '', '')
    returning id`;
  await sql`insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
            values (gen_random_uuid(), ${user.id}, ${user.id}, ${sql.json({ sub: user.id, email, email_verified: true })}, 'email', now(), now(), now())`;
  if (admin || disabled) await sql`update profiles set role = ${admin ? "admin" : "user"}, disabled_at = ${disabled ? new Date() : null} where id = ${user.id}`;
  if (freeUsed) await sql`insert into free_usage (user_id, used) values (${user.id}, ${freeUsed})`;
  const u = { id: user.id, email, password };
  if (paid) await givePlan(u, paidUsed);
  made.push(u.id);
  return u;
}
// a paid plan without Stripe (like npm run plan:grant)
export async function givePlan(user, used = 0) {
  const [sub] = await sql`insert into subscriptions (id, user_id, status, price_id, current_period_start, current_period_end)
    values (${"manual_" + user.id}, ${user.id}, 'active', 'manual', now() - interval '1 day', now() + interval '29 days')
    on conflict (id) do update set status = 'active' returning current_period_start, current_period_end`;
  await sql`insert into usage_periods (user_id, period_start, period_end, allowance, used) values (${user.id}, ${sub.current_period_start}, ${sub.current_period_end}, 100, ${used})
            on conflict (user_id, period_start) do update set used = ${used}`;
  return sub;
}
export const removePlan = user => sql`delete from subscriptions where user_id = ${user.id}`;
export async function cleanup() {
  for (const id of made.splice(0)) {
    await sql`delete from rate_limits where key like ${"%" + id + "%"}`;
    await sql`delete from audit_events where actor_id = ${id} or target_id = ${id}`;
    await sql`delete from auth.users where id = ${id}`;   // cascades to profiles and everything they own
  }
}

// ---- a browser-like client with its own cookies
export class Client {
  jar = new Map();
  async req(method, path, { body, json = true, headers = {} } = {}) {
    const h = { cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join("; "), ...headers };
    if (body !== undefined && json) h["content-type"] = "application/json";
    const r = await fetch(BASE + path, { method, redirect: "manual", headers: h, body: body === undefined ? undefined : json ? JSON.stringify(body) : body });
    for (const c of r.headers.getSetCookie()) { const [x] = c.split(";"); const i = x.indexOf("="); const v = x.slice(i + 1); if (!v || /max-age=0/i.test(c)) this.jar.delete(x.slice(0, i)); else this.jar.set(x.slice(0, i), v); }
    return r;
  }
  async json(method, path, body) { const r = await this.req(method, path, { body }); return { status: r.status, data: await r.json().catch(() => null), headers: r.headers }; }
  async page(path) { const r = await this.req("GET", path); return { status: r.status, location: r.headers.get("location") ?? "", html: await r.text() }; }
  async login(user) { const r = await this.json("POST", "/api/auth/login", { email: user.email, password: user.password }); return r.status; }
  async logout() { await this.req("POST", "/api/auth/logout", { body: {} }); }
  // Submits a form found on a page (or in the raw `html` of an earlier step) the way a browser without JavaScript does,
  // which drives the app's server actions. Returns the re-rendered page: `html` raw (to submit its forms next) and
  // `text` with entities decoded (to check messages).
  async submit(pathOrHtml, marker, fields = {}, postPath) {
    const html = pathOrHtml.startsWith("/") ? (await this.page(pathOrHtml)).html : pathOrHtml;
    const form = html.split("<form").slice(1).map(f => f.split("</form>")[0]).find(f => f.includes(marker));
    if (!form) throw new Error(`form "${marker}" not found`);
    const fd = new FormData();
    for (const [, n, v] of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g)) fd.append(unescape(n), unescape(v ?? ""));
    for (const [k, v] of Object.entries(fields)) { if (v instanceof Blob) fd.set(k, v, v.name); else fd.set(k, v); }
    const r = await this.req("POST", postPath ?? (pathOrHtml.startsWith("/") ? pathOrHtml : "/"), { body: fd, json: false, headers: { origin: BASE } });
    const raw = await r.text();
    return { status: r.status, location: r.headers.get("location") ?? "", html: raw, text: unescape(raw.replace(/<!-- -->/g, "")) };
  }
  // POST /api/assistant: the streamed answer as { status, start, end, text } or the JSON refusal as { status, json }
  async ask(question, { conversationId = null, market = "All markets", requestId = uuid(), attachmentIds = [] } = {}) {
    const r = await this.req("POST", "/api/assistant", { body: { question, market, requestId, conversationId, attachmentIds } });
    if (!(r.headers.get("content-type") ?? "").includes("ndjson")) return { status: r.status, json: await r.json().catch(() => null), requestId };
    const lines = (await r.text()).split("\n").filter(Boolean).map(l => JSON.parse(l));
    return { status: r.status, start: lines.find(l => l.type === "start"), end: lines.at(-1), text: lines.filter(l => l.type === "delta").map(l => l.text).join(""), requestId };
  }
  async upload(name, bytes, { origin = BASE } = {}) {
    const fd = new FormData(); fd.append("file", new Blob([bytes]), name);
    const r = await this.req("POST", "/api/assistant/attachments", { body: fd, json: false, headers: origin ? { origin } : {} });
    return { status: r.status, data: await r.json().catch(() => null) };
  }
}

// ---- WhatsApp: a stand-in for Meta's Graph API on :4010 (WHATSAPP_API_BASE) and signed fake webhooks
export function metaStandIn(media = {}) {
  const sent = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", () => {
      if (req.headers.authorization !== `Bearer ${env("WHATSAPP_TOKEN")}`) { res.writeHead(401).end("{}"); return; }
      if (req.method === "POST" && req.url.endsWith(`/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`)) {
        const msg = JSON.parse(body); if (!msg.status) sent.push(msg);
        res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ messages: [{ id: "wamid.OUT" + sent.length }] })); return;
      }
      const info = req.url.match(/^\/v[\d.]+\/(MEDIA_\w+)$/);
      if (info && media[info[1]]) { res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ url: `http://localhost:4010/download/${info[1]}`, mime_type: media[info[1]].mime, file_size: media[info[1]].bytes.length })); return; }
      const dl = req.url.match(/^\/download\/(MEDIA_\w+)$/);
      if (dl && media[dl[1]]) { res.writeHead(200, { "content-type": media[dl[1]].mime }).end(media[dl[1]].bytes); return; }
      res.writeHead(404).end("{}");
    });
  });
  return {
    sent,
    start: () => new Promise(r => server.listen(4010, r)),
    stop: () => new Promise(r => server.close(r)),
    // the replies to one number after position `from` (replies are written after the webhook has answered)
    async repliesTo(phone, from, { count = 1, timeout = 90_000 } = {}) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        if (sent.slice(from).filter(s => s.to === phone).length >= count) { await sleep(300); break; }
        await sleep(250);
      }
      return sent.slice(from).filter(s => s.to === phone).map(m => m.text?.body ?? `[template ${m.template?.name}]`).join("\n---\n");
    }
  };
}
export async function whatsappInbound(from, message, { secret = env("WHATSAPP_APP_SECRET"), phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID"), age = 0 } = {}) {
  const id = message.id ?? "wamid.E2E" + crypto.randomBytes(6).toString("hex");
  const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "WABA", changes: [{ field: "messages", value: {
    messaging_product: "whatsapp", metadata: { phone_number_id: phoneNumberId }, contacts: [{ wa_id: from }],
    messages: [{ from, id, timestamp: String(Math.floor(Date.now() / 1000) - age), ...message }] } }] }] });
  const r = await fetch(BASE + "/api/whatsapp/webhook", { method: "POST", headers: { "content-type": "application/json", "x-hub-signature-256": "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex") }, body });
  return { status: r.status, id };
}

// ---- small test files
// a solid-colour PNG
export function png(w, h, rgb) {
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3).map((_, i) => rgb[i % 3])]);
  const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.concat(Array(h).fill(row)))), chunk("IEND", Buffer.alloc(0))]);
}
// a minimal text PDF: one page per array of lines
export function pdf(pages) {
  const esc = s => s.replace(/[\\()]/g, m => "\\" + m);
  const objs = ["<</Type/Catalog/Pages 2 0 R>>", null, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"], kids = [];
  for (const lines of pages) {
    const stream = lines.length ? `BT /F1 12 Tf 72 720 Td 16 TL ${lines.map(l => `(${esc(l)}) '`).join(" ")} ET` : "0.5 g 72 300 468 400 re f";
    objs.push(`<</Length ${Buffer.byteLength(stream)}>>\nstream\n${stream}\nendstream`);
    objs.push(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 3 0 R>>>>/Contents ${objs.length} 0 R>>`);
    kids.push(`${objs.length} 0 R`);
  }
  objs[1] = `<</Type/Pages/Kids[${kids.join(" ")}]/Count ${kids.length}>>`;
  let body = "%PDF-1.4\n"; const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(body)); body += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}
