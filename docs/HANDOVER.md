# Handover: start here

This guide is for the developer taking over Verisavo after Phase 1. It explains what the product is, where everything lives, how the code fits together, and what's left. The other guides in `docs/` go deeper; this one tells you which to read and when.

## 1. What Verisavo is

The Verisavo Intelligence Assistant answers questions about African markets from Verisavo's approved research (a knowledge base the Verisavo team manages) and from files the user attaches. People use it on the **website** and on **WhatsApp**, with one shared history and one shared allowance.

**The plan rules** (in `lib/plan.ts`, enforced on the server in `lib/server/entitlements.ts`):

| | Free account | Verisavo Monthly ($5 a month, Stripe) |
|---|---|---|
| Questions | 5 in total, text only | 100 a month, shared across web and WhatsApp |
| File and image uploads | No | Yes |
| PDF reports | No | Yes |
| WhatsApp | No | Yes, after linking a number in the dashboard |

When a limit is reached, the server refuses the question (HTTP 402) before the AI is called, and the page shows a paywall.

## 2. Where everything lives

| What | Where |
|---|---|
| Code | GitHub **Verisavo/verisavo-platform**. Branch **`m5` is the live code**. `m1`–`m4` are earlier milestones; `site-v2` was the branch for the new website, now merged into `m5`. |
| Hosting | Vercel, team **Verisavo**, project `verisavo-mvp`. Live at **https://verisavo-mvp.vercel.app**. Vercel builds production from one branch: make sure **Settings → Environments → Production → Branch Tracking** is `m5` (it once said `m3`, which is old code). |
| Database and logins | Supabase, two projects: **dev** (`uhdpdzanabgktvwugyvj`, free tier: it pauses when idle; restore it from the dashboard) and **live** (`bqoddhxusjvxnvncbycm`). Postgres with pgvector, through Drizzle. |
| Payments | Stripe, currently in **test mode**. |
| WhatsApp | Meta WhatsApp Cloud API through **Kapso** (`WHATSAPP_PROVIDER=kapso`). |
| AI | Claude, OpenAI or Gemini. The admin chooses which one answers and which one searches, in `/admin` → AI settings. |
| Secrets | Vercel environment variables, plus `.env.local` (dev) and `.env.prod.local` (live database migrations) on your machine. Never in the repo. Every variable is explained in [ENV.md](ENV.md). |

Ask Henry for access to: the Verisavo GitHub organisation, the Vercel team, both Supabase projects, Stripe, Kapso, the Meta Business account, the Google Cloud project (Google sign-in), GoDaddy (DNS for verisavo.com) and the AI provider accounts.

## 3. First day

1. Clone the repo and check out `m5`. Use Node.js 20 or newer.
2. `npm install`
3. Create `.env.local` from `.env.example` with the **dev** values ([ENV.md](ENV.md) says where each one comes from). Restore the dev Supabase project first if it's paused, or every request fails with `AuthRetryableFetchError: fetch failed`.
4. `npm run db:migrate`, then `npm run dev` and open http://localhost:3000. Check http://localhost:3000/api/health shows `{"ok":true,"database":"up",...}`.
5. Make yourself an admin: `npm run admin:grant -- you@example.com`. Then open `/admin`.
6. Read [SETUP.md](SETUP.md) for the details, and [ADMIN-GUIDE.md](ADMIN-GUIDE.md) to see what the team does in the admin dashboard.

**This is Next.js 16.** It differs from older versions: `cookies()`, `headers()` and `params` are async, `middleware` is now `proxy.ts`, and Turbopack is the default. Read `AGENTS.md`, and the bundled docs in `node_modules/next/dist/docs/` before writing Next-specific code.

## 4. How the code fits together

There are two parts.

### The public website: the client's design

The pages at `/`, `/platform`, `/assistant`, `/docs` and `/apply` are **Henry's own design**, supplied as one HTML file. They are not React. The build turns that file into real pages and connects them to the backend:

| File | What it does |
|---|---|
| `site/source/verisavo.html` | The client's design, exactly as supplied (one file holding every page, image and track). |
| `scripts/build-site.mjs` | `npm run site:build` (also runs automatically before `dev` and `build`). Unpacks the pages into `public/site/`, moves the images into `public/site/a/`, points the links between pages at real URLs, applies the patches, and adds `live.js`. The output folder is not committed. |
| `next.config.mjs` → `rewrites()` | Serves the built pages: `/` → `index.html`, `/platform` and `/assistant` → `assistant.html`, `/docs`, `/apply`. |
| `site/live.js` | Plain browser JavaScript that connects the pages to the real backend: sign in and sign up (email and password, Google), the Assistant (streamed answers), saved conversations, uploads, PDF reports, the paywall, Stripe, and "Coming soon" dialogs. |
| `site/patches.mjs` | Small, exact edits to the client's scripts: swap the demo sign-in for the real one, plug in the live Assistant, put the real plan on the Pricing page, mark unbuilt features "Coming soon". |
| `site/inject/assistant-live.js` | Inserted inside the client's Assistant script. Replaces its simulated answers with real ones (`ask`, `openConv`, `renderAnswer`, file picking) while keeping its layout. |
| `site/overrides/index.css` | Our layout changes to the homepage, such as the full-screen hero. |

**When the client sends a new version of the design:** copy it over `site/source/verisavo.html` and run `npm run site:build`. Each patch must match the client's code exactly. If the client changed one of those places, the build stops and names the patch to update. Nothing breaks silently.

**Rules here:** keep the client's design and wording; don't redesign. Every answer feature shows real data only. Follow-up questions are suggestions built from the market; "Show chart" appears only when an answer contains a table of numbers. Nothing fake (made-up evidence or figures) is ever attached to a real answer.

### The app: TypeScript and Tailwind

Everything signed-in and server-side is in `app/` and `lib/server/`. The layout under "How the code is organised" in the README is accurate for these parts:

| Area | Where |
|---|---|
| User dashboard (plan and billing, WhatsApp linking, profile, conversations) | `app/(app)/dashboard/` |
| Admin dashboard (users, usage, knowledge base, AI settings, activity, conversations) | `app/(app)/admin/`. Every page and action calls `requireAdmin()` on the server |
| Sign-in APIs | `app/api/auth/*`, `lib/server/auth.ts` |
| The Assistant (one answer core for web and WhatsApp) | `app/api/assistant/route.ts` (streamed NDJSON), `lib/server/assistant/` |
| Knowledge base and RAG (extract, chunk, embed, publish, archive, search) | `lib/server/rag/` |
| Counting and limits (the only place usage is counted) | `lib/server/entitlements.ts` |
| Stripe (checkout, portal, webhook) | `app/api/billing/*`, `app/api/stripe/webhook/route.ts`, `lib/server/billing.ts` |
| WhatsApp (webhook, number linking, replies) | `app/api/whatsapp/webhook/route.ts`, `lib/server/whatsapp/` |
| PDF reports | `lib/server/pdf/report.ts` |
| Database tables and migrations | `db/schema.ts`, `db/migrations/` (every table has RLS on) |

**No longer used:** the old React landing site (`app/page.jsx`, `app/platform/`, `components/home/`, `components/platform/`, `lib/home/`, `lib/platform/`) and the old React Assistant (`app/(app)/assistant/`). The rewrites in `next.config.mjs` take precedence over them. They can be deleted. When you do, update the README's "Pages" and "How the code is organised" sections, which still describe them.

## 5. Rules that matter

- **`RELEASE_STAGE`** (`lib/release.ts`) switches milestones on. Production runs at `4`, which turns on everything the live site uses.
- **Live database changes:** commit the migration, run `npm run db:migrate:prod` (it asks you to type "prod"), then deploy. Never run migration SQL by hand in Supabase.
- **Security:** every API route checks the session itself, and admin pages check the role. POST routes require JSON from our own site (`fromOurSite`). Anything that calls Supabase Auth or sends email goes through the rate limiter. Webhooks verify their signature on the raw body. Look up user data by id *and* owner.
- **Testing:** `npm run test:e2e` runs the end-to-end suite against the dev database ([TESTING.md](TESTING.md)). For WhatsApp without a phone, use `node scripts/whatsapp-fake-inbound.mjs`.
- When something breaks in production (payments, WhatsApp, the knowledge base, an AI provider), see [RUNBOOKS.md](RUNBOOKS.md).

## 6. What's left before launch

| Item | Notes |
|---|---|
| Connect **verisavo.com** to Vercel | [DEPLOY.md](DEPLOY.md). Then update `APP_URL`, Supabase's Site URL and redirect URLs, the Google OAuth redirect, and the Stripe and Kapso webhook URLs. |
| Google sign-in shows "Verisavo" | Verify verisavo.com in Google Search Console (TXT record in GoDaddy). Then in Google Cloud → Google Auth Platform → Branding, set the name, logo, home page, privacy and terms links, and request brand verification. Optional: a Supabase custom domain (`auth.verisavo.com`, paid add-on) shows verisavo.com instead of supabase.co. |
| WhatsApp code template | Once Meta verifies the business: `node scripts/kapso-template.mjs --env .env.prod.local --create`, then set `WHATSAPP_OTP_TEMPLATE=verisavo_link_code` and `WHATSAPP_OTP_TEMPLATE_LANG=en` in Vercel and redeploy. Until then, number linking uses the "LINK 123456" message. |
| Email from verisavo.com | Set up Resend SMTP in Supabase. Branded email templates are in `docs/email-templates/`. |
| Stripe live mode | Live keys, live price and live webhook. Also set Stripe branding and customer emails. |
| Kapso paid plan | Before real traffic. |
| Knowledge base content | Henry's team uploads and publishes research in `/admin/knowledge`. The Assistant only answers from published documents. |
| Privacy Policy and Terms | The ones in the client's design should name the services used: Supabase, Stripe, Kapso/Meta WhatsApp and the AI providers. |
| Careers form (`/apply`) | It posts to `formsubmit.co`, an outside service. Its first submission sends an activation email to career@verisavo.com, and applicants' files pass through it. Keep it, or switch to a mail draft like the contact form. |
| Vercel billing | The Vercel team showed **Overdue**. An unpaid team can have deployments paused. |

The contact and demo forms open the visitor's email app with the message ready (`CONTACT_ENDPOINT` is empty on purpose), so they need no backend.

## 7. Phase 2 (agreed with the client)

These parts of the client's design show "Coming soon" or appear only in the sample preview, and need new backend work:

- AI-written follow-up questions (today: suggestions built from the market)
- The "What this answer rests on" evidence panel with its tabs (Knowledge Base, Public records, Digital, Ground), and intelligence gaps
- SavoScouts: the scout community, tasks, VeriPoints, investigations and credits
- Company knowledge (each customer describes their company), workspaces and team members
- The overview dashboard and notifications

Each one slots into the place the client's design already gives it. In `site/inject/assistant-live.js`, the answer renderer has a single place where these get filled in.
