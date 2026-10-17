# Local setup

How to run Verisavo on your own machine against a **dev** database. For the live site, see [DEPLOY.md](DEPLOY.md).

## 1. Tools

- Node.js 20 or newer (22 recommended) and npm
- A Supabase account for a dev project (the free plan is enough)
- Optional: an AI key (Claude, OpenAI or Gemini), Stripe test keys, and later Meta WhatsApp test values

## 2. Code and packages

```bash
git clone <repo>
cd verisavomvp
npm install
cp .env.example .env.local      # then fill it in (see ENV.md)
```

Keep the project folder outside a synced folder such as OneDrive or Dropbox, because `.env.local` holds secrets.

## 3. Dev database (Supabase)

1. Create a project and enable pgvector: **Database → Extensions → vector**.
2. In **Project Settings → Data API**, turn the Data API **off**. All access goes through our server.
3. Under **Connect → Direct → URI**, copy two strings into `.env.local`:
   - the transaction pooler (port 6543) into `DATABASE_URL`
   - the session pooler (port 5432) into `DATABASE_URL_MIGRATE`
   - Percent-encode special characters in the password.
4. Copy the project URL and the **publishable** key (never the secret key) into `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
5. Apply the migrations:

```bash
npm run db:migrate
```

6. Set up Supabase Auth as described in the README section "Accounts": confirm email, the password rule, URL configuration, the three email templates, rate limits and token lifetime.

## 4. Run it

```bash
npm run dev                     # http://localhost:3000
```

Check http://localhost:3000/api/health. It should say `{"ok":true,"database":"up",...}`.

In development, `RELEASE_STAGE` defaults to 5, which switches every feature on.

## 5. Accounts for testing

- **Your admin account:** sign up on the site, then run `npm run admin:grant -- you@example.com`.
- **Paid features without Stripe:** `npm run plan:grant -- you@example.com` (add `--revoke` to undo).
- **Dummy users:** `npm run seed:test-users` creates four, each in a different state: free, free used up, subscriber and disabled. Their passwords go in `test-accounts.local.md`, which is git-ignored.

## 6. AI

- Add at least one key: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`.
- Knowledge search needs **OpenAI or Gemini**, because Claude has no embedding model.
- Choose the services in **Admin → AI settings**. Use the **Test** buttons there to check each key.

## 7. Payments (optional locally)

Use Stripe **test mode**. Put the test keys and the price ID in `.env.local`, then run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints the whsec_… for STRIPE_WEBHOOK_SECRET
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## 8. WhatsApp without Meta

- For local testing, set made-up values:
  - `WHATSAPP_APP_SECRET` and `WHATSAPP_VERIFY_TOKEN`: random strings
  - `WHATSAPP_TOKEN`: any value
  - `WHATSAPP_PHONE_NUMBER_ID=TEST_PHONE_NUMBER_ID`
  - `WHATSAPP_NUMBER=15550000000`
  - `WHATSAPP_API_BASE=http://localhost:4010`
- `node scripts/whatsapp-fake-inbound.mjs --text "Hello"` sends a signed fake message.
- The end-to-end tests run their own stand-in for Meta on port 4010.

## 9. Tests

See [TESTING.md](TESTING.md). With the dev server running:

```bash
npm run test:e2e
```
