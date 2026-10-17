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
7. **Access token lifetime.** Set it to about **600 seconds** (Authentication → Sessions, "Access token expiry time"; older dashboards had it under Project Settings → JWT Keys). A copied login token then stops working within 10 minutes of sign-out.

Email links open `/auth/confirm`, which only asks the user to press a button. Nothing happens until then, so email scanners can't use links up. A password-reset link allows one password change, only in the browser session it opened, for 15 minutes.

**Before public launch** (not needed for reviews):
- Add a CAPTCHA (e.g. Cloudflare Turnstile, via Supabase's CAPTCHA protection) to sign-up and forgot-password.
- Add a Vercel Firewall rate-limit rule on `/api/auth/*`.

## AI services

Answers and knowledge search go through the Vercel AI SDK. An admin chooses the services in **Admin → AI settings**:
- **Answers:** Claude (Anthropic), OpenAI or Gemini (Google). Any model ID the service offers can be used.
- **Knowledge search:** OpenAI or Gemini embeddings, because Anthropic has no embedding model.
  - Every option produces vectors of 1536 numbers, so switching needs no migration.
  - When the model changes, the page re-indexes the published documents with the new one.

Set a key for each service the admin may choose, in `.env.local` or the hosting env: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`.
- Use API keys from each service's developer console, on an account the business owns, with a monthly spending limit. Never use a personal Claude Code or ChatGPT login.
- Keys are never stored in the database.
- The **Test** buttons send one tiny request to check a key and model work.

## Payments (Stripe)

The plan is Verisavo Monthly: 100 messages per billing period, shared across web and WhatsApp. Free accounts get 5 questions. Checkout, the billing portal (invoices, card, cancelling) and the webhook live in `lib/server/billing.ts` and `app/api/billing/*`; usage limits live in `lib/server/entitlements.ts`.

1. In Stripe (use **test mode** for development):
   - Create the product "Verisavo Monthly" with one recurring monthly price ($5), and put the price ID in `STRIPE_PRICE_MONTHLY`.
   - Put the secret key in `STRIPE_SECRET_KEY`.
   - Turn on the **Customer portal** (Settings → Billing → Customer portal) with cancelling, updating the payment method and invoice history.
     - Set cancellation to **at the end of the billing period**. Immediate cancellation lets someone cancel and resubscribe for a fresh 100 messages.
     - Leave plan switching **off**, because there is only one plan.
   - Under Settings → Billing → Subscriptions → Manage failed payments, choose **cancel the subscription** once all retries fail.
     - The app treats a past-due subscription as paid for at most 21 days anyway.
2. Webhook:
   - **Local:** run `stripe listen --forward-to localhost:3000/api/stripe/webhook` and put the `whsec_…` it prints in `STRIPE_WEBHOOK_SECRET`.
   - **Live:** add an endpoint at `https://<site>/api/stripe/webhook` with API version `2026-09-30.endive` (the version the installed `stripe` package uses). Subscribe it to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` and `invoice.payment_failed`, and use that endpoint's own signing secret.
3. Test cards (any future date, any CVC):
   - `4242 4242 4242 4242` succeeds.
   - `4000 0000 0000 0341` fails when charged, to test failed payments.

A user stays paid while Stripe retries a failed payment (`past_due`) and drops to free when the subscription ends. Each renewal starts a new usage period at 0.

**Subscriber features:**
- **Attachments:** up to 5 files of 4 MB each per question: PDF, Word, PowerPoint (.pptx), Excel (.xlsx), CSV, text and PNG/JPEG/WebP/GIF images.
  - Documents are kept as extracted text and images as bytes, only for that user and conversation (`attachments` table). They never go into the knowledge base.
- **PDF reports:** one answer or a whole conversation, in Verisavo's colours and its Poppins font (`lib/server/pdf/`, fonts under the SIL Open Font License).

## WhatsApp

Subscribers link one WhatsApp number in their dashboard and ask Verisavo there.
- It's the same assistant, with the same 100 messages a month.
- Their WhatsApp messages join their conversations on the web. A message within 30 minutes of their last activity continues that conversation.
- Images and documents work as they do on the web.
- Unlinked or unpaid numbers get a short reply with a link instead of an answer.

The code is in `lib/server/whatsapp/` and `app/api/whatsapp/webhook/route.ts`.

1. **In Meta (Henry's Business account):**
   - Create an app with the WhatsApp product and a phone number.
   - Create a **System User** permanent token with `whatsapp_business_messaging` permission.
   - Set the webhook URL to `https://<site>/api/whatsapp/webhook`, with a verify token you choose.
   - Subscribe it to the `messages` field.
2. **Env:** fill in every value listed in `.env.example`:
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_APP_SECRET` (it checks Meta's signature on every webhook)
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_GRAPH_VERSION`
   - `WHATSAPP_NUMBER`: the number in digits, for wa.me links
3. **Link codes:**
   - In WhatsApp Manager, create an **Authentication** template with a copy-code button, and put its name in `WHATSAPP_OTP_TEMPLATE`. Codes are then sent to the user's WhatsApp.
   - Until Meta approves it, leave that empty. Users then link by sending "LINK 123456" from their WhatsApp with one tap, which proves the number is theirs.
   - The phone always has the last word. The link confirmation names the account it was linked to, and replying **UNLINK** removes the link.
   - Admins can also unlink a number under Admin → Users.
   - When WhatsApp reports that a number changed, its link is removed.
4. **Testing without Meta:**
   - `node scripts/whatsapp-fake-inbound.mjs --from 2348031234567 --text "Hello"` posts a correctly signed fake message to the local webhook.
   - Point `WHATSAPP_API_BASE` at a local stand-in for the Graph API to capture replies. Leave it empty in real use.

## Test accounts (dev only)

- `npm run seed:test-users` creates or resets dummy accounts on the dev database, each in a different state:
  - free
  - free with the questions used up
  - subscriber
  - disabled

  Their sign-in details go in `test-accounts.local.md`, which is git-ignored.
- `npm run plan:grant -- someone@example.com [--days 30] [--revoke]` gives an account the paid plan without Stripe, for testing or a complimentary account. Stripe never changes these "manual" plans.

`RELEASE_STAGE` switches milestones on in a deployment (see `lib/release.ts`): 1 = accounts and dashboard, up to 5 = everything. Below 1, the sign-in dialog runs the old demo.

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage: the 3D market story in eight chapters. About us, Research, Contact, Pricing and Careers open over the scene at `/#about-us`, `/#research`, `/#contact`, `/#pricing` and `/#careers`. |
| `/platform` | Platform page: the question box and sign in. A signed-in user's question opens `/assistant`; signed-out visitors are asked to sign up or sign in first. |
| `/assistant` | Signed-in users only: the Verisavo Intelligence Assistant, as a window that switches to full screen. `/platform#app` leads here. |
| `/dashboard` | Signed-in users only: plan and billing, conversations, profile, email and password. |
| `/admin` | Admins only (everyone else gets a 404): overview, users, knowledge base, AI settings, activity log. Make someone an admin with `npm run admin:grant -- their@email` (add `--prod` for the live database). |

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
  (app)/                  app pages (assistant, dashboard, admin, reset password), styled with Tailwind (only these load it)
    app.css               Tailwind + Verisavo colours and fonts
    assistant/            /assistant: the Intelligence Assistant (sign-in only), a window with a full-screen toggle
    dashboard/            /dashboard: plan and billing, conversations, profile, email, password (server actions in actions.ts)
    admin/                /admin: overview, users, knowledge base (upload, edit, publish, archive, try a question),
                          AI settings (which service answers and which one searches), activity
    reset-password/       /reset-password: choose a new password after the reset email
    auth/confirm/         /auth/confirm: where Supabase's email links land; verifies only when the user presses the button
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
  markets.ts              market list shared by the assistant and the knowledge base
  server/                 server-only code; never imported by the browser
    db.ts                 database client (Drizzle + postgres-js, set up for Supabase's pooler)
    supabase.ts  auth.ts  Supabase Auth client and the current user; auth-cookies.ts holds the cookie settings
    http.ts  audit.ts     API helpers and the admin activity log
    rate-limit.ts         per-visitor limits for everything that calls Supabase Auth
    recovery.ts           one-time password-reset grants
    admin.ts              requireAdmin() for every admin page and action
    ai/                   providers.ts (Claude, OpenAI, Gemini) and settings.ts (the admin's choice of service)
    rag/                  knowledge base: extract (PDF/Word/text), chunk, embed, publish/archive/re-index, search
db/
  schema.ts               database tables (Drizzle)
  migrations/             SQL migrations, applied with npm run db:migrate
drizzle.config.ts         drizzle-kit settings (reads .env.local)
proxy.ts                  refreshes the login session and keeps signed-out visitors out of /dashboard
scripts/                  migrate-prod (npm run db:migrate:prod), grant-admin, grant-plan, seed-test-users,
                          whatsapp-fake-inbound (signed test messages for the WhatsApp webhook)
public/
  home-music.mp3          homepage music: "Elsweyr Beat" (Joseph Beg), looped on a bar
  bg-music.mp3            About us music: "I'm Yours" (Xack), remixed without drums and bass
```

On the landing site, the components hold the markup. The page behaviour in `lib/` runs once in the browser after the page renders, started by `HomeClient` or `PlatformClient`. The 3D scene uses `three` 0.128 from npm.

Pages are linked with full page loads (plain `<a>`), so each one keeps only its own styles. That also keeps Tailwind off the landing site.

## Not connected yet

- **Before `RELEASE_STAGE` 3,** the Intelligence Assistant shows "Not connected yet" instead of answers. From stage 3 it answers through `/api/assistant`.
- **Early access** runs in demo mode (code `123456`). Set `CONFIG.mode`, `CONFIG.api` and `CONFIG.whatsappNumber` in `lib/home/auth.js` and `lib/platform/main.js`.
- **Contact form**: set `CONTACT_ENDPOINT` in `lib/home/scene.js`. Until then nothing is sent.

## Music licence

Both tracks come from Epidemic Sound. Check that your licence covers use on a website, including the remixed version.
