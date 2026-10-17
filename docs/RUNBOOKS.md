# Runbooks

What to do when something needs attention. The **activity log** in Admin → Activity records sign-ins, account changes, admin actions, knowledge-base changes, AI settings, subscriptions and WhatsApp links. Start there.

## Payments (Stripe)

**A customer paid but still shows Free**
1. In Stripe → Developers → Webhooks → your endpoint, look for failed deliveries (they show 4xx/5xx).
2. Fix the cause and press **Resend** on the event. The app handles each event once and re-reads the subscription from Stripe, so resending is always safe.
3. Common causes:
   - a wrong `STRIPE_WEBHOOK_SECRET` (returns 400)
   - billing not configured (returns 503)
   - a database outage (returns 500, and Stripe retries automatically)

**A customer wants a refund or a different date.** Use the Stripe dashboard. The app follows Stripe through the webhook.

**A complimentary account (no Stripe).** Run `npm run plan:grant -- them@… --days 30 --prod`. Remove it with `--revoke`.

**A failed payment.** The customer keeps access while Stripe retries (up to 21 days), then drops to Free. The activity log shows "Payment failed".

## WhatsApp

**Nobody gets answers**
1. In the Meta app → WhatsApp → Configuration, check that the webhook is verified and subscribed to **messages**.
2. Check the Vercel logs for `[whatsapp]` lines. A signature mismatch (401) means `WHATSAPP_APP_SECRET` is wrong.
3. Check the token hasn't expired: use a System User token, not the 24-hour test token.

**Someone linked the wrong number**
- The phone's owner can reply **UNLINK** at any time.
- An admin can press **Unlink WhatsApp** in Admin → Users.
- The account owner can unlink from their dashboard.

**Codes aren't arriving.** Until the authentication template is approved, `WHATSAPP_OTP_TEMPLATE` must be **empty**, so users link by sending "LINK 123456" instead.

**A number changed.** When WhatsApp tells us a user changed number, the old link is removed automatically and they link again.

## Knowledge base

**Add or update content**
1. Admin → Knowledge base → upload a PDF or Word file (or paste text) and check the extracted text.
2. Press **Publish**.
3. Editing a published document re-publishes it straight away.

**Remove content.** Press **Archive**: it leaves search immediately. **Restore** brings it back as a draft.

**A scanned PDF has no text.** Paste the text instead.

**Answers miss documents, or use the wrong ones**
1. Use **Try a question** to see what search finds.
2. The match cut-off is per search model (Gemini 60%, OpenAI 25%) in `lib/server/ai/providers.ts`. Tune it with real questions.

**After switching the search model** (Admin → AI settings), published documents are re-indexed. Press **Continue re-indexing** until nothing is left.

## AI services

**One provider is down or out of credit**
1. In Admin → AI settings, switch answers to another service that has a key. Use **Test** to confirm.
2. Search can switch between OpenAI and Gemini, but that triggers re-indexing.

**Costs**
- The model is chosen in Admin → AI settings.
- On a $5 plan with 100 messages, Claude Opus costs about $3.40 per user per month, Sonnet about $1.70 and Haiku about $0.09.
- Set budgets in each provider's console.

## Users

| Need | Where |
|---|---|
| Find a user | Admin → Users (search by name, email or organisation) |
| Block someone | **Disable** (it also ends their open sessions); **Re-enable** to undo |
| Give their allowance back | **Reset allowance** (logged) |
| Make someone an admin | `npm run admin:grant -- them@… --prod` (there's no button, on purpose) |

## Keys and secrets

- **To rotate a key:** create the new one, update it in Vercel, redeploy, then revoke the old one.
- **Never paste keys** into chats, tickets or the repository.

## Database

- **Backups:** Supabase Pro makes daily backups (Database → Backups). Point-in-time recovery is a paid add-on.
- **Schema changes:**
  1. Edit `db/schema.ts`.
  2. Run `npm run db:generate` to write a migration.
  3. Run `npm run db:migrate` on dev, then `npm run db:migrate:prod`.
