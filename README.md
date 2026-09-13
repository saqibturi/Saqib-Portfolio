# Saqib Muhammad — portfolio & owner workspace

A Vercel-ready Next.js portfolio with a graphite, electric-lime, and glacier-blue design, responsive layouts, animated entrances, an original folded-arms portrait, and a Supabase-backed CMS.

## What is included

- Public home, projects, project case studies, About, Certifications, and Contact pages.
- Certificate uploads with issuer, dates, credential ID, description, skills, verification URL, private drafts, and explicit publishing.
- Real supplied profile, education, internship, email, phone, and social links.
- Single-owner login, recovery, and server-side authorization.
- Project drafts separated from published snapshots. Publishing needs no redeploy.
- Private draft previews; publish/unpublish/delete; permanent redirects after slug changes.
- Cover and gallery uploads, alt text, captions, featured flag, and display order.
- Editable profile, hero, expertise, experience, education, social links, résumé, section ordering, and search metadata.
- Private contact inbox with search, status filters, pagination, CSV export, and email-draft links.
- Private object storage; validated image uploads converted to WebP; validated downloadable PDFs.
- Reduced-motion support, keyboard navigation, focus states, semantic forms, and responsive styling.
- SQL migration, tests, environment example, and launch instructions.

## Current status

The code runs without credentials to let you inspect the real public profile and design. No projects have been invented or published. Without Supabase configuration, the contact form returns a clear error and admin sign-in is disabled. It does not simulate database success.

**A live Supabase project and your Vercel account configuration are still required to launch the persistent admin and contact workflow.** Nothing has been deployed to your Vercel account.

Read `OWNER-GUIDE.md` for the complete setup and ongoing management steps. Read `VALIDATION.md` for what was actually verified and remaining live-service tests.

## Run locally

Requires Node.js 22.12+ (tested with Node 24) and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With blank Supabase values, public content uses the supplied initial profile. This configuration fallback is not used as a production database.

After connecting Supabase and applying the migration:

```bash
npm run seed
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

`npm run seed` only inserts the initial profile if absent; it never overwrites your edited profile and never creates demonstration projects.

## Design

Upright bold Manrope headings, graphite surfaces, electric-lime actions, blue portrait details, and contrasting expertise cards. No italic display headings. Motion uses transform/opacity entrances and interaction feedback; essential content remains visible without JavaScript and under reduced-motion preferences. Fonts and the portrait are served locally. Source portrait is in `public/portrait.webp`.

UI/UX Pro Max guidance informed the layout and accessibility. 21st catalog access was attempted but required sign-in, so no unverified 21st components or generated templates are claimed.

The original brief preferred Tailwind; this implementation uses a cohesive token-based CSS stylesheet with Next.js and TypeScript, avoiding unnecessary styling runtime and duplicated component systems. Supabase remains the database/auth/storage architecture requested in the brief.

## Architecture

- `app/`: server-rendered public pages and authenticated admin page entry point.
- `app/api/`: origin-checked, validated mutation endpoints.
- `components/`: public UI, forms, and admin editors.
- `lib/supabase.ts`: server-only clients and owner authorization.
- `lib/validation.ts`: Zod schemas and safe CSV handling.
- `supabase/migrations/001_portfolio.sql`: original database setup.
- `supabase/migrations/002_certifications.sql`: certifications, private draft policies, and initial profile insertion only when absent.
- `tests/`: database/validation tests and browser acceptance checks.

Admin writes use a service-role client only after `getUser()` and an owner-table check. No service secret is included in browser code. Public readers use the publishable client and RLS. No public insert policy exists for enquiries: the server validates and rate-limits them first.

Project drafts and published snapshots are separate tables. Historical slugs are reserved and publishing updates atomically. The sitemap is dynamic. Public pages are rendered from current database records, so publishing/unpublishing is visible on the next request.

Uploads use a private bucket. `/api/media/[id]` permits public access only for files referenced in currently published content/profile, otherwise requiring the owner. Responses use `no-store`; removing public references revokes future access. As with any public media, a visitor can retain a copy already downloaded. Referenced draft and published files cannot be removed through the media manager.

## Verification references

Implementation was checked against official documentation:

- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication)
- [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)

Package versions are pinned by `package-lock.json`. Review routine security updates before launch and periodically afterward.

## Updating from the first version

Read `UPGRADE.md`. Existing Supabase installations must run only `002_certifications.sql`, not the original migration again.
