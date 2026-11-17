# Email templates

Branded templates for the emails Supabase sends. Paste each file into Supabase → **Authentication → Emails → Templates**:

- Replace the whole **Message body**.
- Set the **Subject** to the one in `subjects.json`.
- Press **Save**.

| Supabase template | File |
|---|---|
| Confirm sign up | `confirm-signup.html` |
| Reset password | `reset-password.html` |
| Change email address | `change-email.html` |
| Password changed (Security) | `password-changed.html` |
| Email address changed (Security) | `email-changed.html` |
| Identity linked (Security), e.g. Google added to a password account | `identity-linked.html` |

**Rules:**
- The links use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…`, so they must stay exactly like that (see README, "Accounts").
- The greeting uses the name given at sign-up (`{{ .Data.name }}`), and just "Hi," when there isn't one.
- The Security templates are only sent when those notifications are switched on in Supabase (Authentication → Emails → Security).
- Not needed: Magic link, Invite user and Reauthentication. Verisavo never sends them, and `/auth/confirm` only accepts sign-up, recovery and email-change links.

## Payment emails (Stripe)

Receipts, failed payments, renewal reminders and refunds come from **Stripe**, not from the app. They're professional out of the box once Stripe has Verisavo's branding:

1. Stripe → **Settings → Business → Branding**:
   - Icon and logo: the Verisavo "V" mark and wordmark
   - Brand colour `#1F273F` (ink), accent colour `#4D74C3` (brand blue)
2. Stripe → **Settings → Business → Public details**: business name **Verisavo**, support email, website.
3. Stripe → **Settings → Billing → Customer emails** (Subscriptions and emails), switch on:
   - **Successful payments** (receipt for every renewal)
   - **Refunds**
   - **Failed payments** (with the link to update the card)
   - **Upcoming renewals** (a reminder before each renewal)
   - **Expiring cards**
4. Stripe → **Settings → Billing → Customer portal**: same branding; this is the page "Manage billing" opens.

Branding is set separately in test and live mode, so repeat it when Stripe goes live. A Verisavo-styled "payment failed" email from the app itself (decision D9) waits for Resend on Verisavo's domain.

**Sender:** these only change how emails look. The sender stays Supabase's until Resend is set up as custom SMTP with Verisavo's domain. Then emails come from Verisavo's own address (Authentication → Emails → SMTP Settings).

**Built for email apps:**
- table layout and inline styles
- the wordmark is text, not an image, so it shows even when images are blocked
- Poppins where the app allows it, otherwise Helvetica or Arial
