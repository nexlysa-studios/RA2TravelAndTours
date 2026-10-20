# RA2 codebase guide

## Application

This is the existing React 19 / TypeScript / TanStack Start application, with
file-based routing, Vite, Tailwind 4, Framer Motion, GSAP, Radix components and
Supabase. Netlify's official TanStack Start adapter builds the server-rendered
website and its server function. See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for
hosting, the production domain and required environment settings. These local
changes do not replace or deploy over the current public website.

- `src/routes/__root.tsx`: shared HTML shell, fonts, theme, query/preferences
  providers, reduced-motion configuration, errors and toast notifications.
- `src/routes/index.tsx`: the existing home-page section composition.
- `src/data/site.ts`: RA2 identity, contact links, service marketing content,
  experience catalogue, detailed itineraries, FAQs and travel styles.
- `src/styles.css`: RA2 dark teal, warm ivory and bronze tokens; Outfit headings
  and Manrope body text. Fonts are served from public/fonts with their OFL licenses. Existing photography/video files are retained.
- `src/components/Navbar.tsx`: desktop navigation and the retained animated
  mobile menu. Anchor links work across routes.
- `src/components/Hero.tsx`: full-screen herobg.png background and scroll animation.
- `src/components/ServiceOptions.tsx`: transport tabs and airport transfer details.
- `src/components/CapeTownCityTourSection.tsx`: retained city/Winelands/Peninsula
  carousel. `Tours.tsx` and `PackageCard.tsx` show RA2's featured experiences.
- `src/components/Gallery.tsx` and `Fleet.tsx`: existing asset galleries.
- `src/components/Testimonials.tsx`: travel-style carousel in the existing
  animated section; the copied client's reviews were removed.
- `src/components/Partners.tsx`: animated destinations strip. Previous client
  and sponsor endorsements are no longer asserted.
- `src/data/blog.ts`: static travel articles, retained with RA2 copy.

Public routes: `/`, `/packages` (Experiences), `/fleet`, `/gallery`, `/blog`,
`/blog/$slug`, `/cape-peninsula-tour`, `/cape-town-city-tour`,
`/stellenbosch-wine-tour`. Each has RA2 metadata and an absolute canonical URL.
The sitemap includes these pages and articles; robots excludes the admin area.
`src/data/public-pages.ts` holds the sitemap paths and explicit URL aliases.
`src/lib/seo.ts` builds unique canonical/social metadata and business, website,
page, breadcrumb, tour-service and article structured data.

The existing country/currency preferences live in `src/lib/pricing.tsx`.
Preference storage uses RA2 keys. Unverified inherited prices were removed;
all public experiences request a personalised quote.

## Booking lifecycle

1. The form loads active services from RA2's Supabase database. Experience links
   preselect the service using `?service=slug#book`.
2. `shared/booking.ts` normalises and validates input in both the browser and
   the Edge Function, including South African travel dates.
3. The browser invokes `create-booking` with an idempotency UUID.
4. The Edge Function calls a service-role-only database function. It verifies
   the service, limits abuse, generates an RA2 reference, and stores the request
   with status `pending` and payment `unpaid`. Prices remain unset until quoted.
5. The Edge Function sends the customer acknowledgement and admin notification
   through Resend. The stored booking is the email's authoritative source.
6. A persistent receipt appears. WhatsApp sharing opens only when selected,
   with the complete booking details prefilled.
7. Failed email delivery can be retried from the receipt or admin booking drawer.

Customer data is not publicly readable. Direct anonymous inserts are disabled.
IP addresses are hashed with a server-side salt for persistent rate limiting;
the raw IP is not stored. Requests are limited by IP and customer email.
Old booking records remain intact; inherited services are archived.

## Admin

`/admin/login` signs in through Supabase Auth. `/admin` checks the user's admin
role. Database row-level security separately enforces access.

- Dashboard: booking counts, status counts, upcoming trips and paid revenue.
- Bookings: search, status filters, CSV export, trip details, special requirements,
  booking/payment updates, internal notes, deletion and email status/retries.
- Services: descriptions, prices, availability, ordering and passenger limits.
- Customers: aggregates bookings by email, including repeat visits and paid spend.

No checkout or card-payment integration exists. The payment status field is an
admin bookkeeping tool. Changing a booking status does not trigger a separate
email; this scope covers acknowledgements on initial submission.

## Environment and operations

`src/integrations/supabase/client.ts` uses `VITE_SUPABASE_*` from `.env`.
There is no copied project's hardcoded client or API key. Generated database
types are in `types.ts`; UI aliases are in `database.types.ts`.

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for secrets, deployments, verification and
admin access. The existing optional Google reviews endpoint now requires RA2's
own place ID and a server-only API key; it returns an empty result when absent.

```powershell
npm run dev
npm run typecheck
npm run build
npm run test:booking
npm run test:e2e
```

Business content and verified social links were checked against
[RA2's existing website](https://ra2travelandtours.co.za/).

## Production preview and verification

Run `npm run build`, then
`npm run preview -- --host 127.0.0.1 --port 4180`.
The preview script serves the production Vite client and server output.
Set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4180` when running the browser suite
against that production preview instead of the default development server.

The Netlify production build and TypeScript check passed. The production
browser suite passed 23 tests on desktop and mobile, with one mobile-menu test
skipped on desktop. It includes a crawl of every sitemap page without
JavaScript, internal links, section anchors, redirects and real HTTP 404s.
The generated Netlify function also passed direct invocation checks for
production, deploy-preview and branch-deploy indexing headers.
Both Edge Function checks and six booking/email tests passed during the earlier
rebrand; those functions are unchanged by the hosting migration.
Runtime checks cover booking receipts, optional WhatsApp details, retries,
network failures, service loading, public routes, SEO, responsive overflow,
gallery keyboard controls, mobile navigation, sitemap and robots.

RA2 domain verification in Resend is intentionally pending the owner's DNS setup
at hosting time. Customer and admin email delivery cannot be verified until then.
