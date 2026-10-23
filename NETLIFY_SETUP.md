# Host RA2 Travel & Tours on Netlify

The project uses Netlify's official TanStack Start Vite adapter. Public pages
are rendered on the server, including their content, metadata and structured
data. Booking storage and Resend emails continue to run in Supabase Edge
Functions.

## Connect the repository

1. In Netlify, import `nexlysa-studios/RA2TravelAndTours` from GitHub and select
   the `main` branch. The base directory is the repository root.
2. Netlify reads the settings in `netlify.toml`: Node 24, build command
   `npm run build`, and publish directory `dist/client`. Dependencies use
   `package-lock.json`; the old Bun lockfile and Cloudflare target were removed.
3. Add these environment variables in Netlify before the first build, with the
   values from your local `.env`, available to the build:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

   These are public browser settings. Keep `.env` out of Git. Private Resend
   and Supabase service-role keys stay in Supabase secrets.

4. Deploy the project. The adapter also creates
   `.netlify/v1/functions/server.mjs`; Netlify deploys that server function
   automatically alongside `dist/client`.

Do not deploy `dist/client` by dragging it into Netlify. It contains the static
assets; page rendering also requires the server function produced by the
Git-connected build. Do not add an `/* /index.html 200` rewrite: this is a
server-rendered application, and unknown pages must return an actual 404.

## Domain and booking setup

1. Add `ra2travelandtours.co.za` and `www.ra2travelandtours.co.za` under Netlify's
   domain management. Set **ra2travelandtours.co.za** as the primary domain.
2. Use the DNS records shown by Netlify for this project and enable HTTPS.
   Existing email records must be preserved. The committed domain redirects
   send HTTP and `www` traffic to `https://ra2travelandtours.co.za` while
   preserving the requested path and query parameters.
3. In Supabase Auth's URL configuration, use
   `https://ra2travelandtours.co.za` as the Site URL. Add the required production
   redirect URLs if you enable password recovery or OAuth later.
4. The primary domain and `www` already pass the booking functions' CORS rules.
   To test real bookings on a Netlify staging hostname, add its exact origin
   (for example `https://your-project.netlify.app`) to the Supabase secret
   `BOOKING_ALLOWED_ORIGINS`. Keep any existing origins in that comma-separated
   value. Preview URLs need their own explicit entry; they are not allowed by
   default.
5. Finish the Resend DNS verification you planned for
   `ra2travelandtours.co.za`. See [EMAIL_SETUP.md](EMAIL_SETUP.md). Email delivery
   remains dependent on that verification.

## URLs and search indexing

- Canonicals and social URLs use `https://ra2travelandtours.co.za`.
- Every public page has a unique title, description, main heading and matching
  Open Graph/Twitter image. Articles use article metadata and publication dates.
- JSON-LD describes RA2's verified business/contact information, website,
  breadcrumbs, tour services and articles. It does not invent prices, ratings
  or opening hours.
- `/sitemap.xml` lists only public pages and articles; `/robots.txt` references
  the production sitemap. Submit
  `https://ra2travelandtours.co.za/sitemap.xml` in Google Search Console after
  the domain points at the new deployment.
- Public URLs use no trailing slash except `/`. The server redirects trailing
  slashes and explicit aliases in `src/data/public-pages.ts`, preserving query
  parameters and section anchors.
- Unknown URLs and missing articles return HTTP 404. Admin/API responses and
  errors have `X-Robots-Tag: noindex, nofollow`; admin responses are not cached.
  Netlify deploy-preview and branch-deploy server responses are also noindex.
- Fingerprinted assets are cached for a year; font assets for a week. Server
  response headers are set in `src/server.ts` as well as static headers in
  `netlify.toml`.

## Local production verification

GSAP is bundled into SSR with `ssr.noExternal` in `vite.config.ts`. This avoids
Netlify's Node runtime trying to resolve its CommonJS entry as a named ESM
export (`Named export 'gsap' not found`). `npm run build` runs a post-build
check that rejects external GSAP imports and directly loads the generated
Netlify function to render key public pages and a real 404. See
[Vite's SSR dependency configuration](https://vite.dev/config/ssr-options.html#ssr-noexternal).

The Vite configuration disables Netlify Edge Functions emulation during local
development. This project uses Netlify's Node server function for SSR and
hosted Supabase Edge Functions for bookings. The unused Netlify Deno emulator
can otherwise fail at startup with `unexpected argument '--allow-scripts'`.
Run `npm run dev` normally; no local Netlify edge server is required.

```sh
npm ci
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1 --port 4180
```

Run the browser suite against that production preview in a separate terminal.
In PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4180'
npm run test:e2e
```

In Bash:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4180 npm run test:e2e
```

The SEO checks crawl every sitemap page without JavaScript, validate its
metadata/social images and structured data, follow internal links and section
anchors, and check redirects and HTTP 404s. The existing interactive suite
covers bookings, retry behavior, WhatsApp details, navigation and the gallery.
The local production preview verifies the application and generated server;
Netlify's live CDN, TLS, DNS and domain redirects must be checked after hosting.

Local verification passed: the Netlify production build, TypeScript, TOML
configuration validation, and 23 browser tests (one mobile-only test skipped on
desktop). Direct invocation of the generated function confirmed correct
indexing headers in production and both preview contexts.

Reference: [Netlify's TanStack Start setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/)
and [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
