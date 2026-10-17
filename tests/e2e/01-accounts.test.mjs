// M1: sign-in, sessions, protected pages, the CSRF guard, disabled accounts and admin-only pages
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { BASE, Client, cleanup, createUser, sql } from "./helpers.mjs";

after(async () => { await cleanup(); await sql.end({ timeout: 2 }); });

test("sign in sets an httpOnly session; /api/auth/me knows the user; sign out ends it", async () => {
  const user = await createUser({ name: "Accounts Tester" });
  const c = new Client();
  const r = await c.req("POST", "/api/auth/login", { body: { email: user.email, password: user.password } });
  assert.equal(r.status, 200);
  const cookies = r.headers.getSetCookie().filter(x => /auth-token/.test(x));
  assert.ok(cookies.length > 0 && cookies.every(x => /HttpOnly/i.test(x) && /SameSite=Lax/i.test(x)), "session cookies are httpOnly and SameSite=Lax");
  assert.equal((await c.json("GET", "/api/auth/me")).data?.user?.email, user.email);
  await c.logout();
  assert.equal((await c.json("GET", "/api/auth/me")).data?.user, null);
});

test("a wrong password is refused with one message for every account", async () => {
  const user = await createUser();
  const wrong = await new Client().json("POST", "/api/auth/login", { email: user.email, password: "Wrong12345" });
  const nobody = await new Client().json("POST", "/api/auth/login", { email: `nobody-${Date.now()}@test.verisavo.dev`, password: "Wrong12345" });
  assert.equal(wrong.status, 401);
  assert.equal(nobody.status, 401);
  assert.equal(wrong.data.message, nobody.data.message);
});

test("signed-out visitors are sent to sign in from the assistant, dashboard and admin", async () => {
  for (const path of ["/assistant", "/dashboard", "/admin"]) {
    const p = await new Client().page(path);
    assert.ok([302, 303, 307].includes(p.status) && p.location.includes("/platform#signin"), `${path} → ${p.status} ${p.location}`);
  }
});

test("auth routes refuse cross-site and non-JSON posts", async () => {
  const user = await createUser();
  const plain = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify({ email: user.email, password: user.password }) });
  const cross = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ email: user.email, password: user.password }) });
  assert.equal(plain.status, 403);
  assert.equal(cross.status, 403);
});

test("sign-up checks the password rule before anything is sent", async () => {
  const r = await new Client().json("POST", "/api/auth/signup", { email: `e2e-weak-${Date.now()}@test.verisavo.dev`, password: "short", name: "Weak" });
  assert.equal(r.status, 400);
  assert.equal(r.data.error, "weak_password");
});

test("disabling an account ends its session and blocks sign-in; re-enabling restores it", async () => {
  const user = await createUser();
  const c = new Client();
  assert.equal(await c.login(user), 200);
  assert.equal((await c.page("/dashboard")).status, 200);
  await sql`update profiles set disabled_at = now() where id = ${user.id}`;
  const after = await c.page("/dashboard");
  assert.ok([302, 303, 307].includes(after.status), "the open session stops working");
  const again = await new Client().json("POST", "/api/auth/login", { email: user.email, password: user.password });
  assert.equal(again.status, 403);
  assert.equal(again.data.error, "account_disabled");
  await sql`update profiles set disabled_at = null where id = ${user.id}`;
  assert.equal(await new Client().login(user), 200);
});

test("the admin area is a 404 for everyone but admins", async () => {
  const user = await createUser();
  const admin = await createUser({ admin: true });
  const c = new Client(), a = new Client();
  await c.login(user); await a.login(admin);
  for (const path of ["/admin", "/admin/users", "/admin/knowledge", "/admin/ai", "/admin/activity"]) {
    assert.equal((await c.page(path)).status, 404, `${path} for a normal user`);
    assert.equal((await a.page(path)).status, 200, `${path} for an admin`);
  }
});
