# Admin guide

A walkthrough of the Verisavo admin area for the team running the service.

**Getting in:** sign in, go to your dashboard and press **Admin** (or open `/admin`). Only accounts that have been made admins can see it; for everyone else the page doesn't exist.

## Overview

Your numbers at a glance:
- **Users:** how many, new this week, how many confirmed their email.
- **Paid subscribers:** with payments being retried and cancellations at period end.
- **Knowledge base:** published, drafts, archived.
- **Questions over the last 14 days:** split into web and WhatsApp, with a day-by-day table.
- **Latest activity:** see "Activity" below.

## Users

- **Search** by name, email or organisation.
- **Each row shows:**
  - their plan (Free or Monthly, with the renewal or end date)
  - how much of their allowance they've used: free questions out of 5, or messages this month out of 100
  - questions asked in total
  - when they joined and last signed in
  - whether WhatsApp is linked
- **Disable:** stops someone signing in and ends any session they have open. **Re-enable** undoes it.
- **Reset allowance:** gives a user their questions back for the current month (or their 5 free questions), for example after a problem on our side.
- **Unlink WhatsApp:** removes their linked number, for example if it was linked by mistake.

Every one of these actions is recorded in the activity log, with your name.

## Knowledge base

This is what the Intelligence Assistant answers from. **Only published documents are used.**

1. **Add a document:** upload a PDF, Word (.docx), .txt or .md file up to 4 MB, or paste the text. Give it a title. You can also tag the markets it covers (leave them all unticked if it applies everywhere). It's saved as a **draft**.
2. **Check the text:** PDFs sometimes come out messy (page numbers, headers, broken tables). Tidy the text in the editor and press **Save changes**. Scanned PDFs have no text at all, so paste the text instead.
3. **Publish:** the document becomes searchable straight away. Edits to a published document are re-published when you save.
4. **Try a question:** type what a customer might ask, and see which sections the assistant would use and how well they match. If nothing matches well, the assistant tells the customer it doesn't know rather than guessing.
5. **Archive:** takes a document out of answers immediately and keeps its text. **Restore** brings it back as a draft.

## AI settings

- **Who answers questions:** choose Claude, OpenAI or Gemini, and the model.
  - Bigger models give better answers but cost more per question.
  - **Test answers** sends one tiny request to check it works.
- **How documents are searched:** choose OpenAI or Gemini. Claude doesn't offer this part.
  - Changing it re-indexes every published document; press **Continue re-indexing** if asked.
  - **Test search** checks the key.
- The keys themselves are kept in the hosting settings, never on this page. A service shows "No key" until its key is added there.

## Activity

Everything important, newest first, filterable by type:
- sign-ins and account changes
- admin actions
- knowledge-base changes
- AI settings
- subscriptions (subscribed, renewed, cancelled, payment failed)
- WhatsApp links

Use it to answer "what happened to this account?" questions.

## What customers see

- **Free:** 5 questions on the web, then a prompt to subscribe.
- **Verisavo Monthly ($5 a month):** 100 messages a month across web and WhatsApp, file and image uploads, and PDF reports of answers. They manage their card, invoices and cancelling through **Manage billing** on their dashboard, which is Stripe's own secure portal.
- **WhatsApp:** subscribers link their number on their dashboard. Their WhatsApp questions appear in their web conversations and use the same 100 messages.
