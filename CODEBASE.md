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
- `src/routes/index.tsx`: the redesigned single-page home experience.
- `src/components/home/HomeExperience.tsx`: split photographic hero, filtered
  journey collection, local story, airport transfers, planning steps and FAQs.
- `src/components/home/TravelChrome.tsx`: shared header and footer for the new
  homepage and gallery, with a keyboard-accessible mobile navigation dialog.
- `src/components/home/travel.css`: scoped presentation rules for these pages.
  The booking wizard is reused without changing its data or submission logic.
- `src/components/gallery/GalleryExperience.tsx`: curated standalone gallery,
  category filters, captions and an accessible lightbox with arrow-key
  navigation and focus restoration. Its layout is in `gallery/gallery.css`.
- The homepage still uses the existing `Gallery preview` photo reel unchanged.
- `src/data/site.ts`: RA2 identity, contact links, service marketing content,
  experience catalogue, detailed itineraries, FAQs and travel styles.
- `src/styles.css`: current RA2 ocean blue, red, gold and ivory tokens; Outfit headings
  and Manrope body text. Fonts are served from public/fonts with their OFL licenses. Existing photography/video files are retained.
- `src/components/Navbar.tsx` and `Footer.tsx`: existing navigation used by
  supplementary public routes. `PackageCard.tsx` still serves `/packages`.
- The former homepage components remain in the repository for supplementary
  routes and references, but are no longer composed on the homepage.
- `src/components/Gallery.tsx`: existing homepage photo reel, preserved intact.
- `Fleet.tsx`: existing fleet gallery.
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
browser suite passed 29 tests on desktop and mobile, with one mobile-menu test
skipped on desktop. It includes a crawl of every sitemap page without
JavaScript, internal links, section anchors, redirects and real HTTP 404s.
The generated Netlify function also passed direct invocation checks for
production, deploy-preview and branch-deploy indexing headers.
Both Edge Function checks and six booking/email tests passed during the earlier
rebrand; those functions are unchanged by the hosting migration.
Runtime checks cover booking receipts, optional WhatsApp details, retries,
network failures, service loading, public routes, SEO, responsive overflow,
gallery keyboard controls, mobile navigation, sitemap and robots.

The homepage/gallery redesign also passed journey-category filters, gallery
filters, photo navigation and focus restoration, mobile menu section jumps and
the preserved homepage photo-reel checks. Visual QA found no JavaScript errors
or broken images. Both pages fit widths from 320px to 1920px, and the lightbox
fits a short 844x390 landscape viewport. The booking component, homepage reel,
global fonts/palette, Supabase functions, shared validation and server entry
remain unchanged from the pulled version.

RA2 domain verification in Resend is intentionally pending the owner's DNS setup
at hosting time. Customer and admin email delivery cannot be verified until then.
