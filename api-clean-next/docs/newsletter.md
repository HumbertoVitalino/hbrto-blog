# Newsletter

Allows visitors to subscribe to the blog and receive an email whenever a new review is published. Fully self-hosted — subscriber data lives in Supabase, emails are sent via Resend.

---

## Architecture

Follows the same Clean Architecture layers used across the project.

```
domain/
  Subscriber.ts                         # Entity: id, email, subscribedAt, isActive

infrastructure/
  repositories/SubscriberRepository.ts  # Supabase CRUD
  email/EmailService.ts                 # Resend integration

application/usecases/
  SubscribeUseCase.ts                   # Validate, deduplicate, create
  UnsubscribeUseCase.ts                 # Set isActive = false
  GetAllSubscribersUseCase.ts           # List active subscribers

app/
  api/newsletter/subscribe/route.ts     # POST  — public
  api/newsletter/unsubscribe/route.ts   # GET   — public (used by email links)
  api/newsletter/subscribers/route.ts   # GET, DELETE — admin only
  api/newsletter/broadcast/route.ts     # POST  — admin only
  components/newsletter/
    NewsletterBanner.tsx                # Landing page banner
  unsubscribe/page.tsx                  # Unsubscribe confirmation page
```

---

## Database

Table: `newsletter_subscribers`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `email` | `text` | Unique |
| `subscribed_at` | `timestamptz` | Default `now()` |
| `is_active` | `boolean` | Default `true` — soft delete |

Subscribers are never hard-deleted. Unsubscribing sets `is_active = false`, which allows re-subscription without losing history.

---

## Email flows

### Welcome email
Triggered on `POST /api/newsletter/subscribe`. Sent to the new subscriber only.

### New review notification
Triggered on `POST /api/reviews` (admin action). Fetches all active subscribers and sends via `resend.batch.send()` with an individual unsubscribe link per recipient.

### Broadcast
Triggered manually from the admin panel via `POST /api/newsletter/broadcast`. Sends a custom subject + message to all active subscribers. Each email includes an individual unsubscribe link.

---

## Unsubscribe

Email links point to `/unsubscribe?email=<encoded>`. The page calls `GET /api/newsletter/unsubscribe?email=<encoded>` on mount and shows a confirmation. No login required.

---

## Subscriber banner

`NewsletterBanner` is a fixed bottom-right card rendered on the landing page (`/`). It appears after a 3-second delay and is dismissed permanently via `localStorage` (key: `newsletter_status`).

| `localStorage` value | Behavior |
|---|---|
| not set | Banner appears after 3s |
| `dismissed` | Never shows again |
| `subscribed` | Never shows again |

---

## Admin panel

The `/admin` dashboard includes a **Newsletter** section with:

- Subscriber count in the stats bar
- Full subscriber list with email and subscription date
- Remove button per subscriber (soft-delete via `is_active = false`)
- **Send email** compose form — subject + message, sent to all active subscribers

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender address (e.g. `contato@humbertovitalino.com.br`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Used to build unsubscribe links in emails |
