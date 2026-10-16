# Verisavo website

The connected intelligence layer for African markets. Built with [Next.js](https://nextjs.org) (App Router), React, TypeScript and Tailwind CSS, on Supabase (Postgres + pgvector, Auth).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Node.js 20 or newer is required.

## Database

The app uses PostgreSQL with pgvector on [Supabase](https://supabase.com), accessed with [Drizzle ORM](https://orm.drizzle.team).

1. Copy `.env.example` to `.env.local`.
2. In the Supabase dashboard, click **Connect → Direct**, choose type **URI**, and copy two connection strings:
   - **Transaction pooler** (port 6543) into `DATABASE_URL`. The app uses this one.
   - **Session pooler** (port 5432) into `DATABASE_URL_MIGRATE`. Migrations use this one.

   Replace `[YOUR-PASSWORD]` in both, and percent-encode any special characters in the password.
3. Apply the migrations, then check the connection:

```bash
npm run db:migrate     # apply migrations in db/migrations to the database
npm run dev
# open http://localhost:3000/api/health  ->  {"ok":true,"database":"up","pgvector":"0.8.2"}
```

To change the database:
- Edit `db/schema.ts`, then run `npm run db:generate` to write a new migration and `npm run db:migrate` to apply it.
- For hand-written SQL, run `npm run db:generate -- --custom --name=<what-it-does>` and fill in the empty file it creates.
- `npm run db:studio` opens a browser view of the data.

**Live database:** put its Session pooler string in `.env.prod.local` as `DATABASE_URL_MIGRATE=...`. That file is gitignored, and Next.js never reads it. Then run `npm run db:migrate:prod`. It shows which database it will change and asks you to type `prod` before applying anything. `npm run db:migrate` on its own only ever touches the dev database in `.env.local`.

In the Supabase project settings, the Data API is off and automatic RLS is on. All database access goes through the server code in `lib/server/`.

## Accounts (Supabase Auth)

Sign up, email confirmation, sign in and password reset use Supabase Auth with email + password. Only the server talks to Supabase, and the session lives in httpOnly cookies. Set this up in each Supabase project (dev and live):

1. **`.env.local` / hosting env:**
   - `SUPABASE_URL`: `https://<project-ref>.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: from Project Settings → API Keys (never the secret key)
   - `APP_URL`
   - `RELEASE_STAGE`
2. **Authentication → Sign In / Providers → Email:**
   - Email provider and **Confirm email** are on
   - Minimum password length is **8**
   - Password requirements are set to **letters and digits**
3. **Authentication → URL Configuration:**
   - **Site URL** is the site's address (`http://localhost:3000` for dev)
   - Add `<site>/**` to **Redirect URLs**
4. **Authentication → Emails → Templates.** In each template below, replace `{{ .ConfirmationURL }}` with:
   - **Confirm sign up:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - **Reset password:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   - **Change email address:** `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/dashboard`

   These links work on any device, because the server checks them; the default links only work in the same browser.
5. **Email sender.** Until Verisavo's domain is set up, Supabase's built-in sender is used. It's rate-limited and only delivers to the project's team members. After that, set Resend as the custom SMTP sender (Authentication → Emails → SMTP Settings).
6. **Authentication → Rate Limits.** Only our server talks to Supabase, so Supabase sees one address for every visitor. Its per-IP limits must therefore be site-wide, and the per-visitor limits live in the app (`lib/server/rate-limit.ts`). Raise these to about:
   - **Sign-ups and sign-ins:** 300 per 5 minutes
   - **Token verifications:** 300 per 5 minutes
   - **Token refreshes:** 1800 per 5 minutes
7. **Access token lifetime.** Set it to about **600 seconds** (Project Settings → JWT Keys). A copied login token then stops working within 10 minutes of sign-out.

Email links open `/auth/confirm`, which only asks the user to press a button. Nothing happens until then, so email scanners can't use links up. A password-reset link allows one password change, only in the browser session it opened, for 15 minutes.

**Before public launch** (not needed for reviews):
- Add a CAPTCHA (e.g. Cloudflare Turnstile, via Supabase's CAPTCHA protection) to sign-up and forgot-password.
- Add a Vercel Firewall rate-limit rule on `/api/auth/*`.

`RELEASE_STAGE` switches milestones on in a deployment (see `lib/release.ts`): 1 = accounts and dashboard, up to 5 = everything. Below 1, the sign-in dialog runs the old demo.

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage: the 3D market story in eight chapters. About us, Research, Contact, Pricing and Careers open over the scene at `/#about-us`, `/#research`, `/#contact`, `/#pricing` and `/#careers`. |
| `/platform` | Platform page: the question box and sign in. A signed-in user's question opens `/assistant`; signed-out visitors are asked to sign up or sign in first. |
| `/assistant` | Signed-in users only: the Verisavo Intelligence Assistant, as a window that switches to full screen. `/platform#app` leads here. |
| `/dashboard` | Signed-in users only: plan and billing, conversations, profile, email and password. |

`/about-us`, `/research`, `/contact`, `/pricing` and `/careers` redirect to the matching homepage page. The old file names `/index.html` and `/assistant.html` redirect to `/` and `/platform`.

## How the code is organised

There are two parts:
- **The landing site** (`/`, `/platform`): JavaScript, with its own CSS and page scripts. It was supplied as is.
- **The app**: TypeScript and Tailwind CSS. This covers the signed-in pages, the API routes and all server code.

```
app/
  layout.tsx              fonts and viewport, shared by every page; tells page scripts the release stage
  page.jsx  home.css      homepage route and its styles
  platform/
    page.jsx  platform.css
  (app)/                  app pages (assistant, dashboard, reset password, later admin), styled with Tailwind (only these load it)
    assistant/            /assistant: the Intelligence Assistant (sign-in only), a window with a full-screen toggle
    app.css               Tailwind + Verisavo colours and fonts
    dashboard/            /dashboard: plan and billing, conversations, profile, email, password (server actions in actions.ts)
    reset-password/       /reset-password: choose a new password after the reset email
  auth/confirm/route.ts   target of the links in Supabase's emails (confirm sign-up, reset, email change)
  api/
    health/route.ts       GET /api/health: checks the database and pgvector
    auth/                 signup, login, logout, forgot, reset, resend, me
components/
  home/                   homepage markup as React components (Header, Menu, AboutUsPage, ResearchPage, dialogs, ...)
    HomeClient.jsx        starts the homepage behaviour in the browser
  platform/               Platform page markup (Header, Main, AssistantWindow, dialogs, ...)
    PlatformClient.jsx    starts the Platform page behaviour in the browser
lib/
  home/                   homepage behaviour: auth.js (early access, sign in), soon.js, scene.js (three.js market scene,
                          chapters, inner pages, research, highlights), header.js
  platform/               main.js (question box, sign in, menu, assistant), soon.js
  sound.js                sound engine shared by both pages (music, clicks, keyboard sounds, mute toggle)
  authDialog.ts           the sign in / sign up / reset dialog, shared by both landing pages
  release.ts              RELEASE_STAGE: which milestones are switched on
  plan.ts                 plan numbers (5 free questions, 100 messages a month)
  server/                 server-only code; never imported by the browser
    db.ts                 database client (Drizzle + postgres-js, set up for Supabase's pooler)
    supabase.ts  auth.ts  Supabase Auth client and the current user; auth-cookies.ts holds the cookie settings
    http.ts  audit.ts     API helpers and the admin activity log
db/
  schema.ts               database tables (Drizzle)
  migrations/             SQL migrations, applied with npm run db:migrate
drizzle.config.ts         drizzle-kit settings (reads .env.local)
proxy.ts                  refreshes the login session and keeps signed-out visitors out of /dashboard
scripts/migrate-prod.mjs  npm run db:migrate:prod
public/
  home-music.mp3          homepage music: "Elsweyr Beat" (Joseph Beg), looped on a bar
  bg-music.mp3            About us music: "I'm Yours" (Xack), remixed without drums and bass
```

On the landing site, the components hold the markup. The page behaviour in `lib/` runs once in the browser after the page renders, started by `HomeClient` or `PlatformClient`. The 3D scene uses `three` 0.128 from npm.

Pages are linked with full page loads (plain `<a>`), so each one keeps only its own styles. That also keeps Tailwind off the landing site.

## Not connected yet

- **Intelligence Assistant** answers show "Not connected yet" until `ASSISTANT.endpoint` is set in `lib/platform/main.js`.
- **Early access** runs in demo mode (code `123456`). Set `CONFIG.mode`, `CONFIG.api` and `CONFIG.whatsappNumber` in `lib/home/auth.js` and `lib/platform/main.js`.
- **Contact form**: set `CONTACT_ENDPOINT` in `lib/home/scene.js`. Until then nothing is sent.

## Music licence

Both tracks come from Epidemic Sound. Check that your licence covers use on a website, including the remixed version.
