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

**Rules:**
- The links use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…`, so they must stay exactly like that (see README, "Accounts").
- The greeting uses the name given at sign-up (`{{ .Data.name }}`), and just "Hi," when there isn't one.
- The two Security templates are only sent when those notifications are switched on in Supabase.

**Sender:** these only change how emails look. The sender stays Supabase's until Resend is set up as custom SMTP with Verisavo's domain. Then emails come from Verisavo's own address (Authentication → Emails → SMTP Settings).

**Built for email apps:**
- table layout and inline styles
- the wordmark is text, not an image, so it shows even when images are blocked
- Poppins where the app allows it, otherwise Helvetica or Arial
