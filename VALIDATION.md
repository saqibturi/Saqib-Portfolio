# Portfolio 03 verification

The new ivory/cobalt/navy frontend passed the production build, TypeScript compilation, ESLint, and all five existing browser tests. Public routes were checked at 320, 375, 390, 768, 1024, and 1440 px. Desktop and mobile previews were visually reviewed. Certificate uploads, owner authentication, and other backend workflows were preserved; they were not exercised against live Supabase in this redesign task.

The 21st local review found informational hardcoded-color notices in the theme stylesheet. The catalog search required an unavailable sign-in, so this design reuses the existing React components.

## Previous verification and remaining launch checks

## Verified in this workspace

- Next.js 16.3.5 production build: passed.
- TypeScript strict type checking: passed.
- ESLint: passed without warnings or errors.
- Seven automated validation/database tests: passed.
- Database migration executed against embedded PostgreSQL (PGlite), with test-only Supabase auth/storage schema stubs.
- Database tests cover anonymous write/read rejection for private tables, non-owner isolation, owner draft reads, draft/published snapshot separation, atomic publishing, reserved historical slugs, unpublishing, durable rate limits, and unique contact submission IDs.
- Validation tests cover invalid/oversized contact data, dangerous link/asset values, CSV formula injection, and draft media visibility decisions.
- Five Playwright browser tests: passed (see command below).
- Public home, projects, About, Contact, Certifications, and owner sign-in checked at 320, 375, 390, 768, 1024, and 1440 px. No horizontal overflow after fixing the About portrait's mobile width. Referenced images loaded.
- Mobile navigation, Escape handling, focus return, route changes, social destinations, and contact links checked.
- Unauthorized admin route redirects to sign-in; inbox API rejects anonymous access; upload API rejects anonymous access; cross-origin admin mutation rejected.
- Unconfigured contact form presents an error and does not report a saved message.
- Desktop and mobile screenshots visually inspected. Previews are included in `preview/`.
- Browser client output searched for server-only secret variable names; none found.

## Performance observations

The optimized portrait is approximately 116 KiB at 960 × 1200. Fonts are bundled locally. The local mobile homepage loaded its portrait and reported 21 resource entries, with document width equal to the 390 px viewport. These are local observations, not a Lighthouse score or a measurement of real visitor Core Web Vitals. Measure production performance on the actual Vercel deployment and connection conditions before making performance claims.

## Not yet verified against live services

The local test run did not configure live Supabase credentials or Vercel account access. Therefore these remain required launch checks, not claimed successes:

1. Apply the migration to real Supabase and seed the profile.
2. Log in using the provisioned owner and verify password recovery email delivery and redirect handling.
3. Create a real draft, upload a cover and gallery, preview, publish, edit without leaking draft changes, publish again, change the slug, and unpublish.
4. Confirm durable media remains available after a redeploy and cannot be read anonymously while draft-only.
5. Upload a résumé and confirm its download appears publicly after saving the profile.
6. Submit a contact enquiry, confirm persistence in the inbox, and verify filters, statuses, CSV export, and confirmed deletion.
7. If notifications are enabled, test a deliberately failing email provider configuration and confirm the message still persists.
8. Inspect authenticated admin screens at the requested desktop/mobile widths with real data, including long titles, messages, and multiple gallery images.
9. Verify production sitemap, canonical URLs, origin checks, and recovery after deploying to Vercel and again after changing domains.
10. Measure production mobile performance and run an accessibility audit with assistive technology as appropriate.

PGlite tests validate SQL behavior but do not substitute for real Supabase Auth/Storage integration tests. The browser tests exercise the truthful unconfigured state; no fake backend, fake admin account, or simulated successful contact save is included.

## Reproduce tests

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
node scripts/check-browser.mjs
```

The browser script starts and stops the production server in the same process environment, runs the tests, and generates previews. It expects port 3000 to be free and an unconfigured local environment for the fail-closed test. Use `PLAYWRIGHT_EXECUTABLE_PATH` if a compatible Chromium is already installed. Hosted-service tests must be performed against a separate staging project using credentials you control.

## Redesign and certification verification

Certificate input validation and database migration tests pass. Tests verify repeated migration safety, existing profile preservation, anonymous draft denial, published snapshot separation, anonymous write denial, and draft retention after unpublishing. Public certificate page and upright headline typography were browser-tested. Live Supabase authentication and certificate upload/publish workflows still require the user’s connected project and must be verified after setup.
