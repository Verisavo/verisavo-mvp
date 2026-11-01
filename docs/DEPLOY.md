# Deploying the live site

The live site runs on **Vercel** with Henry's account, and on the **live Supabase project** in Henry's organisation (Pro plan, Frankfurt). Features go live in stages with `RELEASE_STAGE`, one milestone at a time.

## 1. One-time setup

### Supabase (live project)
1. Make sure pgvector is enabled and the **Data API is off**.
2. Put the live **session pooler** string in `.env.prod.local` as `DATABASE_URL_MIGRATE=…`. That file is git-ignored.
3. Apply the migrations:

   ```bash
   npm run db:migrate:prod
   ```

   It shows which database it will change and asks you to type `prod`.
4. Set up Auth exactly as in the README section "Accounts":
   - confirm email
   - password rule (8 or more characters, with letters and digits)
   - **Site URL** = `https://<domain>`, and **Redirect URLs** include `https://<domain>/**`
   - the three email templates, which point at `/auth/confirm`
   - rate limits 300/300/1800 per 5 minutes
   - access token lifetime 600 seconds
5. Email sender: once the domain is verified in Resend, set Resend as the **custom SMTP** in Supabase (Authentication → Emails → SMTP).
6. Make Henry an admin: `npm run admin:grant -- henry@… --prod`. He signs up on the site first.

### Vercel
1. Import the repository and use the **Next.js** preset. Set the function region near the database (**Frankfurt, fra1**).
2. Add every variable from [ENV.md](ENV.md) for **Production**, including `APP_URL=https://<domain>`. Leave `WHATSAPP_API_BASE` empty.
3. Function time: the assistant and the WhatsApp webhook use up to 120 seconds, which is allowed on Vercel Pro.
4. **Domain:** add it under Vercel → Domains, then set the DNS records your registrar shows. `APP_URL` and Supabase's Site URL must match it.

### Stripe (live mode)
1. Create the product **Verisavo Monthly** with a recurring monthly price of **$5**, and set `STRIPE_PRICE_MONTHLY`.
2. **Customer portal** (Settings → Billing → Customer portal):
   - Allow cancelling **at the end of the period**, updating the card and invoice history.
   - Turn plan switching **off**.
3. **Failed payments** (Settings → Billing → Subscriptions): retry for **14 days at most**, then **cancel the subscription**. The retries must end well before the next renewal: a customer keeps access while a payment is retried, so a subscription left "past due" for good would get part of every month free.
4. **One subscription per customer** (Settings → Checkout and Payment Links, "Limit customers to one subscription"): on, if your dashboard offers it. The app already stops a second checkout; this makes Stripe refuse one too.
5. **Webhook endpoint:**
   - URL: `https://<domain>/api/stripe/webhook`, API version **2026-09-30.endive**
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

### Meta / WhatsApp
1. In Henry's Meta Business account, create an app with the **WhatsApp** product and a business phone number.
2. Create a **System User** permanent token with `whatsapp_business_messaging` (`WHATSAPP_TOKEN`). Then note:
   - the phone number ID (`WHATSAPP_PHONE_NUMBER_ID`)
   - the app secret (`WHATSAPP_APP_SECRET`)
   - the number itself (`WHATSAPP_NUMBER`)
   - the Graph API version (`WHATSAPP_GRAPH_VERSION`)
3. **Webhook:**
   - URL `https://<domain>/api/whatsapp/webhook`
   - verify token = your `WHATSAPP_VERIFY_TOKEN`
   - subscribe to the **messages** field
4. In WhatsApp Manager, create an **Authentication** template with a copy-code button and submit it. When it's approved, put its name in `WHATSAPP_OTP_TEMPLATE` and redeploy. Until then, linking uses the "send LINK code" fallback.

## 2. Weekly releases (`RELEASE_STAGE`)

| Stage | Switches on | Migrations needed |
|---|---|---|
| 1 | Accounts, sign-in, dashboard | 0000–0003 |
| 2 | Admin dashboard, knowledge base, AI settings | 0004–0005 |
| 3 | Assistant answers, limits, payments, uploads, PDF reports | 0006–0008 |
| 4 | WhatsApp | 0009 |
| 5 | Everything, plus "Start free" on the landing page | — |

Running `npm run db:migrate:prod` always applies every migration not yet applied, so it's safe to run before any stage. Order for each release:
1. Apply the migrations.
2. Set `RELEASE_STAGE` in Vercel.
3. Redeploy.
4. Run the smoke test below.

## 3. Smoke test after a deploy

1. `https://<domain>/api/health` returns `{"ok":true,…}`.
2. Sign up with a real address, confirm the email, sign in, and check the dashboard.
3. Stage 2 and later:
   - **Admin → AI settings:** both **Test** buttons say "Working".
   - **Admin → Knowledge base:** publish a document and find it with **Try a question**.
4. Stage 3 and later:
   - Ask a question and get an answer.
   - Subscribe with a real card, then refund it in Stripe. The plan should show "Monthly".
   - Open **Manage billing**.
5. Stage 4 and later:
   - Link a number from the dashboard and ask on WhatsApp.
   - The answer should appear in the web conversation.

## 4. Before public launch

- **CAPTCHA:** turn on Supabase's CAPTCHA protection (e.g. Cloudflare Turnstile) for sign-up and forgot-password.
- **Firewall:** add a Vercel Firewall rate-limit rule for `/api/auth/*`.
- **Legal text:** the Privacy Policy and Terms still describe an unpaid "early access programme". Henry must update them for paid subscriptions, WhatsApp and file uploads before launch.
