# End-to-end tests

The suite in `tests/e2e/` drives the running app over HTTP, like a browser, and checks the dev database directly.
- It creates its own throwaway accounts for each run and deletes them afterwards.
- It refuses to run against the live database.

```bash
npm run dev            # in one terminal (RELEASE_STAGE 5, the default in development)
npm run test:e2e       # in another
```

It uses Node's built-in test runner (Node 22), so there's nothing extra to install. A full run takes about 10 minutes and spends roughly a dozen short AI answers.

| File | Covers | Needs |
|---|---|---|
| `01-accounts` | Sign-in and httpOnly sessions; one message for wrong passwords; protected pages; the CSRF guard; the password rule; disabling accounts; admin pages are a 404 for others | — |
| `02-knowledge` | Admin upload (PDF), publish, search ("Try a question"), the match cut-off, edits re-embedding, market tags, archive and restore, unreadable files | A search key (Gemini or OpenAI) |
| `03-assistant` | Streamed answers and saved conversations, and that only the owner can open them. Limits: the 5th free question is answered and the 6th is blocked without calling the model; duplicates aren't counted twice; a failed answer is refunded; 100 per paid period; parallel requests at 99 (one gets through). Paid-status rules and admin "Reset allowance" | AI keys |
| `04-uploads-pdf` | Uploads of PDF, Excel, PowerPoint, CSV and images. Refused uploads: fake images, zip bombs, wrong types, oversized images, cross-site posts. Free-plan refusal; answers using the files; PDF reports | AI keys |
| `05-whatsapp` | The webhook's verify token and signature; unlinked and unpaid numbers. Linking: by code, by template, and UNLINK; changed numbers and old messages. One history and one allowance with the web; redelivered messages; images; admin unlink | The WhatsApp test settings in `.env.local` (see SETUP.md §8) and AI keys |
| `06-billing` | The webhook refusing unsigned events. **With Stripe test keys:** Checkout, a webhook-driven subscription, dedupe, a renewal resetting the count (Stripe test clock), a failed renewal (`past_due`, access kept), cancelling | `sk_test_…`, `STRIPE_PRICE_MONTHLY` and `STRIPE_WEBHOOK_SECRET` (the same value the dev server uses) |

Tests whose services aren't configured are **skipped**, with the reason, rather than failed.

**Notes:**
- The assistant tests briefly set an invalid model name, to check that a failed answer is refunded, and then restore it. Don't use the dev site during a run.
- The WhatsApp template test edits `WHATSAPP_OTP_TEMPLATE` in `.env.local` and puts it back afterwards.
- Run one file with `node --test tests/e2e/03-assistant.test.mjs`.
