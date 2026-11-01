// Client feedback and the M1-M3 security review: Google sign-in routes, email links, genres and countries, filters and
// pages on Users and Activity, trying a model before saving it, rate-limit lockouts, security headers and charts.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { BASE, Client, cleanup, createUser, sql, uuid } from "./helpers.mjs";

const TAG = `e2e-fb-${Date.now()}`;
const admin = new Client();
const post = (path, body, headers = {}) => fetch(BASE + path, { method: "POST", redirect: "manual", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

before(async () => { await admin.login(await createUser({ admin: true })); });
after(async () => {
  await sql`delete from kb_documents where title like ${TAG + "%"}`;
  await cleanup();
  await sql.end({ timeout: 2 });
});

test("Google sign-in: refuses other websites, says when it's off, and a bad or missing code signs nobody in", async () => {
  const options = await (await fetch(BASE + "/api/auth/options")).json();
  assert.equal(typeof options.google, "boolean");
  assert.equal((await post("/api/auth/google", {}, { origin: "https://evil.example" })).status, 403);
  const start = await post("/api/auth/google", { next: "https://evil.example" });
  if (options.google) {
    const { url } = await start.json();
    assert.match(decodeURIComponent(url), /redirect_to=[^&]*\/auth\/callback\?next=\/dashboard/, "only our own pages can be the destination");
  } else assert.equal(start.status, 503);
  for (const path of ["/auth/callback", "/auth/callback?code=fake&next=https://evil.example", "/auth/callback?error=access_denied"]) {
    const r = await fetch(BASE + path, { redirect: "manual" });
    assert.equal(r.status, 303, path);
    assert.match(r.headers.get("location"), /\/platform\?auth=google-failed#signin$/, path);
    assert.ok(!r.headers.getSetCookie().some(c => /auth-token=[^;]/.test(c)), "no session was set");
  }
});

test("an email link never carries a destination, and the dashboard says whose account it is", async () => {
  const page = await (await fetch(`${BASE}/auth/confirm?token_hash=fake&type=email&next=//evil.example`)).text();
  assert.ok(page.includes('name="token_hash"'));
  assert.ok(!page.includes('name="next"'));
  const user = await createUser({ name: "Link Reader" });
  const web = new Client();
  await web.login(user);
  const dash = (await web.page("/dashboard?confirmed=1")).html.replace(/<!-- -->/g, "");
  assert.ok(dash.includes(`signed in as ${user.email}`));
});

test("a Google-only account isn't asked for a password it doesn't have", async () => {
  const user = await createUser({ name: "Google Only" });
  const web = new Client();
  await web.login(user);
  assert.match((await web.page("/dashboard")).html, /name="(current|password)/);
  await sql`update auth.users set encrypted_password = '' where id = ${user.id}`;
  assert.match((await web.page("/dashboard")).html, /You sign in with Google/);
});

test("documents take countries and genres; only real ones are kept, and the list filters by genre", async () => {
  const r = await admin.submit("/admin/knowledge", "Add as draft", { title: TAG, body: "Notes on Zambian maize", markets: "Zambia", genres: "Agriculture" }, "/admin/knowledge");
  assert.ok(r.location.includes("/admin/knowledge/"), `${r.status} ${r.location}`);
  const [doc] = await sql`select markets, genres from kb_documents where title = ${TAG}`;
  assert.deepEqual([doc.markets, doc.genres], [["Zambia"], ["Agriculture"]]);
  const bad = await admin.submit("/admin/knowledge", "Add as draft", { title: `${TAG}-bad`, body: "x", markets: "Atlantis", genres: "<script>" }, "/admin/knowledge");
  assert.ok(bad.location.includes("/admin/knowledge/"));
  const [badDoc] = await sql`select markets, genres from kb_documents where title = ${TAG + "-bad"}`;
  assert.deepEqual([badDoc.markets, badDoc.genres], [[], []]);
  assert.ok((await admin.page("/admin/knowledge?genre=Agriculture")).html.includes(TAG));
  assert.ok(!(await admin.page("/admin/knowledge?genre=Energy")).html.includes(TAG));
  assert.ok((await admin.page("/admin/knowledge?genre=' OR 1=1 --")).html.includes(TAG), "an unknown genre means no filter");
});

test("Users: search, plan and status filters, with a total", async () => {
  const stamp = uuid().slice(0, 8);
  const paid = await createUser({ name: `Filter ${stamp} Paid`, paid: true });
  await createUser({ name: `Filter ${stamp} Free` });
  await createUser({ name: `Filter ${stamp} Off`, disabled: true });
  const names = async query => {
    const html = (await admin.page(`/admin/users?q=${stamp}&${query}`)).html.replace(/<!-- -->/g, "");
    return { paid: html.includes(`${stamp} Paid`), free: html.includes(`${stamp} Free`), off: html.includes(`${stamp} Off`), showing: html.match(/Showing [^<]+/)?.[0] };
  };
  assert.deepEqual(await names(""), { paid: true, free: true, off: true, showing: "Showing 1–3 of 3" });
  assert.deepEqual(await names("plan=paid"), { paid: true, free: false, off: false, showing: "Showing 1–1 of 1" });
  assert.deepEqual(await names("plan=free"), { paid: false, free: true, off: true, showing: "Showing 1–2 of 2" });
  assert.deepEqual(await names("status=disabled"), { paid: false, free: false, off: true, showing: "Showing 1–1 of 1" });
  assert.ok((await admin.page(`/admin/users?q=${encodeURIComponent(paid.email)}&plan=junk&status=junk`)).html.includes(`${stamp} Paid`), "unknown filter values are ignored");
});

test("Activity: pages stay inside the range and filters combine", async () => {
  const user = await createUser({ name: `Activity ${uuid().slice(0, 8)}` });
  const web = new Client();
  await web.login(user);
  // only the table: the filter box repeats whatever was searched for
  const shown = async query => { const html = (await admin.page(`/admin/activity?${query}`)).html.replace(/<!-- -->/g, ""); return { html: html.slice(html.indexOf("<tbody"), html.indexOf("</tbody>")), showing: html.match(/Showing [^<]+/)?.[0] }; };
  const who = await shown(`who=${encodeURIComponent(user.email)}&type=auth.`);
  assert.ok(who.html.includes(user.email));
  assert.match(who.showing, /Showing 1–\d+ of \d+/);
  assert.ok(!(await shown(`who=${encodeURIComponent(user.email)}&type=billing.`)).html.includes(user.email));
  assert.ok(!(await shown(`who=${encodeURIComponent(user.email)}&to=2020-01-01`)).html.includes(user.email));
  assert.equal((await admin.req("GET", "/admin/activity?from=2026-13-45&to=junk&page=abc")).status, 200, "bad values don't break the page");
  const past = await shown("page=999999");
  const [, from, , total] = past.showing.match(/Showing (\d+)–(\d+) of (\d+)/);
  assert.ok(Number(from) <= Number(total), "a page past the end shows the last page");
});

test("admin filters are for admins only", async () => {
  const web = new Client();
  await web.login(await createUser());
  for (const path of ["/admin/users?plan=paid", "/admin/activity?type=auth.", "/admin/knowledge?genre=Energy"]) assert.equal((await web.req("GET", path)).status, 404, path);
});

test("a model that doesn't work is never saved", async () => {
  const [before] = await sql`select answer_provider, answer_model from ai_settings where id = 1`;
  const r = await admin.submit("/admin/ai", 'name="provider"', { provider: before.answer_provider, model: "no-such-model-e2e" }, "/admin/ai");
  assert.match(r.text, /Not saved/);
  const [now] = await sql`select answer_provider, answer_model from ai_settings where id = 1`;
  assert.deepEqual(now, before);
});

test("nobody can lock someone else out by failing with their email", async () => {
  const user = await createUser({ name: "Lockout Target" });
  const attacker = { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200) + 1}` };
  let last;
  for (let i = 0; i < 12; i++) last = await post("/api/auth/login", { email: user.email, password: "wrong-password-1" }, attacker);
  assert.equal(last.status, 429, "the attacker is stopped");
  const owner = await post("/api/auth/login", { email: user.email, password: user.password }, { "x-forwarded-for": "203.0.113.77" });
  assert.equal(owner.status, 200, "the real owner still gets in");
});

test("security headers are sent, and an oversized JSON body is refused", async () => {
  const r = await fetch(BASE + "/");
  assert.equal(r.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.ok(r.headers.get("referrer-policy"));
  assert.ok(r.headers.get("content-security-policy-report-only"));
  assert.equal(r.headers.get("x-powered-by"), null);
  const big = await post("/api/auth/login", JSON.stringify({ email: "a@test.verisavo.dev", password: "x".repeat(1_100_000) }));
  assert.equal(big.status, 400);
});

test("the overview and dashboard show charts, with the numbers still readable as text", async () => {
  const overview = (await admin.page("/admin")).html.replace(/<!-- -->/g, "");
  assert.ok(overview.includes("Questions per day"));
  assert.ok(overview.includes("New accounts per day"));
  assert.ok(overview.includes("View as a table"));
  assert.match(overview, /People by plan: Monthly \d+, Free \d+/);
  const web = new Client();
  await web.login(await createUser());
  assert.match((await web.page("/dashboard")).html.replace(/<!-- -->/g, ""), /No questions in the last 14 days/);
});
