# Environment variables

These are server-only settings: nothing here reaches the browser.
- **Locally,** they live in `.env.local`, which is git-ignored.
- **On the live site,** they go in Vercel → Project → Settings → Environment Variables.

Never commit real values.

| Variable | What it is | Where it comes from | Needed for |
|---|---|---|---|
| `DATABASE_URL` | Database connection for the app (transaction pooler, port 6543) | Supabase → Connect → Direct → URI | Everything |
| `DATABASE_URL_MIGRATE` | Connection for migrations (session pooler, port 5432) | Same page | `npm run db:migrate`, scripts |
| `APP_URL` | The site's address, without a trailing slash, e.g. `https://verisavo.com` | Your domain | Stripe return links, WhatsApp links |
| `RELEASE_STAGE` | Which milestones are switched on: 1 = accounts, 2 = admin and knowledge base, 3 = assistant and billing, 4 = WhatsApp, 5 = everything (including "Start free"). Unset means 0 in production and 5 in development. | You choose | Rollout |
| `SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → Data API | Sign-in |
| `SUPABASE_PUBLISHABLE_KEY` | The **publishable** key, never the secret key | Supabase → Project Settings → API Keys | Sign-in |
| `ANTHROPIC_API_KEY` | Claude, for answers | console.anthropic.com → API keys | AI (one of the three) |
| `OPENAI_API_KEY` | OpenAI, for answers and/or knowledge search | platform.openai.com → API keys | AI |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini, for answers and/or knowledge search | aistudio.google.com → Get API key (on a billed project) | AI |
| `STRIPE_SECRET_KEY` | Stripe secret key: `sk_test_…` locally, `sk_live_…` live | Stripe → Developers → API keys | Payments |
| `STRIPE_PRICE_MONTHLY` | Price ID (`price_…`) of "Verisavo Monthly" ($5/month) | Stripe → Product catalog | Payments |
| `STRIPE_WEBHOOK_SECRET` | The webhook endpoint's signing secret (`whsec_…`) | Stripe → Developers → Webhooks (live), or `stripe listen` (local) | Payments |
| `WHATSAPP_PROVIDER` | `kapso` to send and receive through Kapso (Verisavo's live setup). Empty means Meta directly. | You choose | WhatsApp |
| `WHATSAPP_TOKEN` | **Kapso:** the Kapso API key. **Meta:** a System User permanent token with `whatsapp_business_messaging`. | Kapso → Developer / Meta Business → System users | WhatsApp |
| `WHATSAPP_PHONE_NUMBER_ID` | The sender's phone number **ID** (not the number). Verisavo's is `1413171608550151`. | Kapso → Phone numbers / Meta app → API setup | WhatsApp |
| `WHATSAPP_APP_SECRET` | The secret every webhook is signed with. **Kapso:** a long random string you choose; `scripts/kapso-webhook.mjs` gives it to Kapso. **Meta:** the app secret. | You choose / Meta app → App settings → Basic | WhatsApp |
| `WHATSAPP_VERIFY_TOKEN` | **Meta only:** a random string you choose and also enter in the Meta webhook settings | You choose | WhatsApp |
| `WHATSAPP_NUMBER` | Verisavo's WhatsApp number, digits only with country code (`447354613866`) | Kapso / Meta | WhatsApp links |
| `WHATSAPP_GRAPH_VERSION` | Graph API version. Kapso: `v24.0`. Meta: the one your app shows. | Kapso / Meta | WhatsApp |
| `WHATSAPP_OTP_TEMPLATE` | Name of the approved **Authentication** template with a copy-code button. Leave it empty until it's approved; users then link by sending "LINK 123456". | WhatsApp Manager → Message templates | WhatsApp linking |
| `WHATSAPP_OTP_TEMPLATE_LANG` | That template's language code, e.g. `en` | Same | WhatsApp linking |
| `WHATSAPP_API_BASE` | **Local tests only:** a stand-in for Meta's API. Leave it empty in real use; production builds ignore it anyway. | — | Tests |
| `RESEND_API_KEY`, `EMAIL_FROM` | Reserved for the "payment failed" email. Account emails go through Supabase, with Resend set as Supabase's SMTP. | resend.com | Later |

**Spending limits:**
- Set a monthly budget on every AI account.
- On Stripe, watch Radar.
- WhatsApp authentication templates cost money per message. The app caps them at 5 a day per number and 500 a day overall.

**Live database file:** keep the live database's session pooler string in `.env.prod.local` (git-ignored). It's only used by `npm run db:migrate:prod`, and by `admin:grant` and `plan:grant` with `--prod`.
