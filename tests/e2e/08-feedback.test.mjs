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

test("a chat can be renamed by its owner only; titles are checked, and another person's chat can't be touched", async () => {
  const owner = await createUser({ name: "Chat Owner" }), other = await createUser({ name: "Chat Other" });
  const [conv] = await sql`insert into conversations (user_id, title) values (${owner.id}, 'Before') returning id`;
  const web = new Client(), stranger = new Client();
  await web.login(owner);
  await stranger.login(other);
  const path = `/api/assistant/conversations/${conv.id}`;
  const title = async () => (await sql`select title from conversations where id = ${conv.id}`)[0]?.title;
  const renamed = await web.json("PATCH", path, { title: "  New name  " });
  assert.equal(renamed.status, 200);
  assert.equal(await title(), "New name");
  assert.equal((await web.json("PATCH", path, { title: "   " })).status, 400);
  assert.equal((await web.json("PATCH", path, {})).status, 400);
  await web.json("PATCH", path, { title: "x".repeat(500) });
  assert.equal((await title()).length, 120, "long titles are cut");
  const script = "<img src=x onerror=alert(1)>";
  await web.json("PATCH", path, { title: script });
  assert.ok(!(await web.page("/dashboard")).html.includes(script), "a title is shown as text, never as HTML");
  assert.equal((await stranger.json("PATCH", path, { title: "Hijacked" })).status, 404);
  assert.equal((await stranger.json("DELETE", path, {})).status, 404);
  assert.notEqual(await title(), "Hijacked");
  assert.equal((await new Client().json("PATCH", path, { title: "Anon" })).status, 401);
  assert.equal((await web.req("PATCH", path, { body: { title: "Cross" }, headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal((await web.json("PATCH", "/api/assistant/conversations/not-a-uuid", { title: "x" })).status, 404);
  assert.equal((await web.json("DELETE", path, {})).status, 200);
  assert.equal(await title(), undefined);
});

test("conversation lists: people see only their own chats; admins see all, and each opening is logged", async () => {
  const stamp = uuid().slice(0, 8);
  const alice = await createUser({ name: `Alice ${stamp}` }), bob = await createUser({ name: `Bob ${stamp}` });
  const script = "<img src=x onerror=alert(1)>";
  const [conv] = await sql`insert into conversations (user_id, title) values (${alice.id}, ${`Alice plan ${stamp}`}) returning id`;
  await sql`insert into messages (conversation_id, user_id, role, content) values (${conv.id}, ${alice.id}, 'user', ${`Secret question ${stamp} ${script}`})`;
  const aliceWeb = new Client(), bobWeb = new Client();
  await aliceWeb.login(alice);
  await bobWeb.login(bob);
  const body = html => html.slice(html.indexOf("<tbody"), html.indexOf("</tbody>"));

  // their own list: search and dates work
  assert.ok(body((await aliceWeb.page(`/dashboard/conversations?q=${stamp}`)).html).includes(`Alice plan ${stamp}`));
  assert.ok(!body((await aliceWeb.page("/dashboard/conversations?q=nothing-like-this")).html).includes(stamp));
  assert.ok(!body((await aliceWeb.page("/dashboard/conversations?to=2020-01-01")).html).includes(stamp));
  assert.equal((await aliceWeb.req("GET", "/dashboard/conversations?from=junk&page=abc")).status, 200);

  // the chat page shows the text as text
  const chat = (await aliceWeb.page(`/dashboard/conversations/${conv.id}`)).html;
  assert.ok(chat.includes(`Secret question ${stamp}`));
  assert.ok(!chat.includes(script), "stored text is never HTML");

  // someone else can't list it, open it, or reach it through the assistant, even by asking for another person
  assert.ok(!body((await bobWeb.page(`/dashboard/conversations?q=${stamp}&who=${encodeURIComponent(alice.email)}`)).html).includes(stamp));
  assert.equal((await bobWeb.req("GET", `/dashboard/conversations/${conv.id}`)).status, 404);
  assert.ok(!(await bobWeb.page(`/assistant?c=${conv.id}`)).html.includes(`Alice plan ${stamp}`));
  for (const path of ["/admin/conversations", `/admin/conversations/${conv.id}`]) assert.equal((await bobWeb.req("GET", path)).status, 404, path);
  assert.equal((await new Client().req("GET", `/dashboard/conversations/${conv.id}`)).status, 307);

  // admins: everyone's, filter by person; reading is logged, and listing isn't
  const logged = async () => (await sql`select count(*)::int n from audit_events where action = 'admin.conversation_view' and target_id = ${alice.id}`)[0].n;
  assert.ok(body((await admin.page(`/admin/conversations?who=${encodeURIComponent(alice.email)}`)).html).includes(`Alice plan ${stamp}`));
  assert.ok(!body((await admin.page(`/admin/conversations?who=${encodeURIComponent(bob.email)}`)).html).includes(`Alice plan ${stamp}`));
  assert.equal(await logged(), 0);
  const read = (await admin.page(`/admin/conversations/${conv.id}`)).html;
  assert.ok(read.includes(`Secret question ${stamp}`));
  assert.ok(!read.includes(script));
  assert.equal(await logged(), 1);
  assert.equal((await admin.req("GET", "/admin/conversations/not-a-uuid")).status, 404);
  assert.equal((await admin.req("GET", `/admin/conversations/${uuid()}`)).status, 404);
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
