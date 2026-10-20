# RA2 booking email setup

Booking creation and email delivery run in Supabase Edge Functions on project
`opqhpeiwimiadlpkrecb`. The browser calls `create-booking`; it does not call
Resend or insert bookings directly.

## Delivery

- Customer: the validated email entered in the booking form.
- Admin: `rezah@ra2travelandtours.co.za`.
- Sender: `RA2 Travel & Tours <bookings@ra2travelandtours.co.za>`.
- Customer Reply-To: RA2's inbox. Admin Reply-To: the customer.
- Both messages include the booking reference and all trip details.
- These acknowledge a booking request. Availability and a quote still require
  the team's confirmation; there is no online payment processing.

The RA2 domain must be verified in Resend. Add the DNS records supplied by Resend
at the domain's DNS host; do not replace the existing website or mail records.

## Supabase secrets

`RESEND_API_KEY` has already been configured in the project's Edge Function
secrets. No copy is needed in the frontend or website host.

Optional overrides:

| Secret | Default |
| --- | --- |
| `RESEND_FROM_EMAIL` | `RA2 Travel & Tours <bookings@ra2travelandtours.co.za>` |
| `BOOKING_ADMIN_EMAIL` | `rezah@ra2travelandtours.co.za` |
| `BOOKING_ALLOWED_ORIGINS` | Additional comma-separated HTTPS frontend origins |

The RA2 root/www domains and local HTTP previews are allowed by default. Add a
staging frontend's exact origin to `BOOKING_ALLOWED_ORIGINS` before using its form.
Keep all API secrets in Supabase. The service role and Supabase URL are supplied
automatically to hosted Edge Functions.

## Deployment

Run from the checkout, with the Supabase CLI signed into the RA2 account:

```powershell
supabase link --project-ref opqhpeiwimiadlpkrecb
supabase db push
supabase functions deploy create-booking --project-ref opqhpeiwimiadlpkrecb --use-api
supabase functions deploy send-booking-emails --project-ref opqhpeiwimiadlpkrecb --use-api
```

Existing migrations were retrieved from RA2 before adding these changes.
For a fresh database, use migrations. `supabase/schema.sql` is an alternative
SQL Editor bootstrap; do not apply both approaches to the same fresh database.

## Reliability and troubleshooting

The Edge Function validates input and looks up the active service in the database.
The database generates the RA2 reference and creates the booking atomically. A
request UUID and content fingerprint make retries safe if a response is lost.
The browser cannot set a booking's price, status, reference or email recipients.

Bookings persist even if Resend fails. The success screen offers optional
WhatsApp sharing and an email retry. The admin booking drawer shows each email's
status and offers **Retry pending emails**. That endpoint checks the signed-in
user and their admin role. It never accepts arbitrary email recipients.

Successful delivery markers are stored in the database. A short database lease
and deterministic Resend idempotency keys protect concurrent retries. Temporary
provider failures receive bounded retries with timeouts. An accepted Resend
request is recorded as sent; inbox delivery is not guaranteed by API acceptance.
No automatic background retry job is configured: after bounded attempts, the
customer or admin can retry without creating another booking.

Inspect **Supabase > Edge Functions > Logs** for `booking_email_failed`.
Only references, recipient categories and safe error codes are logged.

- `missing_api_key`: configure `RESEND_API_KEY` in Supabase secrets.
- `invalid_api_key`: replace the invalid key in Supabase secrets.
- `sender_or_key_not_verified`: check the RA2 domain and API key permissions.
- `sender_domain_not_verified`: finish RA2's DNS verification in Resend.
- `test_sender_restricted`: use a sender on RA2's verified domain.
- `provider_rate_limited` / `provider_unavailable`: retry after the provider recovers.
- `provider_rejected`: inspect the corresponding request in Resend's logs.
- `delivery_status_not_saved`: check database connectivity and function logs.

Test with an address you control or Resend's documented
[`delivered@resend.dev` test address](https://resend.com/docs/dashboard/emails/send-test-emails).
Every booking also emails the configured admin recipient.

## Admin access

The existing admin login uses Supabase email/password authentication and the
`user_roles` table. Create the intended user in Supabase Auth and assign the
`admin` role using the SQL example at the bottom of `supabase/schema.sql`.
Passwords and role assignments are never seeded automatically.

## Current verification

On 20 October 2026, the deployed booking function saved a request and safely
replayed it with the same reference. Public booking reads and unauthenticated
email retries were blocked. Test records were removed. Resend rejected both
messages with `sender_domain_not_verified`. The owner will configure RA2 DNS
when hosting the website; real email delivery remains pending that step.
