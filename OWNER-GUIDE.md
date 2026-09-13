# Owner guide

## 1. Create and connect Supabase

1. Create a Supabase project in your own account. Keep the database password private.
2. Open SQL Editor and run `supabase/migrations/001_portfolio.sql` once. This creates the tables, access policies, private media bucket, and publishing functions. Then run `002_certifications.sql` as a separate query. If 001 was already applied, run only 002.
3. In Authentication settings, **disable new user signups**. The portfolio has no public registration screen.
4. Under Authentication → Users, create your owner account using `contact.saqibmuhammad@gmail.com`, a strong unique password, and a confirmed email. Copy the new user's UUID.
5. Grant that UUID owner access in SQL Editor:

```sql
insert into public.owners(user_id) values ('YOUR_AUTH_USER_UUID');
```

A unique index enforces one owner. Never use the placeholder UUID literally.

6. Configure a reliable SMTP provider in Supabase Authentication for password-recovery email. Configure allowed redirect URLs:
   - `http://localhost:3000/auth/callback` for local development.
   - `https://YOUR_VERCEL_DOMAIN/auth/callback` for the deployed site.
7. Set the Supabase Authentication Site URL to the production origin when launching.
8. Copy `.env.example` to `.env.local`, then fill:

| Variable                               | Value                                              |
| -------------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Exact origin, e.g. `http://localhost:3000` locally |
| `NEXT_PUBLIC_SUPABASE_URL`             | Your Supabase project URL                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (or legacy anon key)               |
| `SUPABASE_SERVICE_ROLE_KEY`            | Private service-role key, server only              |
| `RATE_LIMIT_SECRET`                    | Random private secret, at least 32 bytes           |

Generate a secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local`, share secrets in a public repository, or put the service-role key into a `NEXT_PUBLIC_` variable.

9. Initialize your real profile once:

```bash
npm ci
npm run seed
npm run dev
```

Open `/login`, sign in, and confirm you can access `/admin`.

## 2. Launch on Vercel

1. Put the supplied project folder in a Git repository you own. Keep `.gitignore` intact. Do not upload `node_modules`, `.next`, or `.env.local`.
2. Import that repository into Vercel. Select the Next.js framework and Node.js 24 (or supported Node.js 22.12+).
3. Add all environment variables above to the intended deployment environment. Set `NEXT_PUBLIC_SITE_URL` to the exact Vercel production URL; do not include a trailing slash or a path.
4. Leave build settings at `npm run build`. No custom output directory is required.
5. Deploy. Update Supabase's Site URL and allowed recovery URL to match.
6. If using a Vercel preview URL, configure its exact origin independently. Origin checks intentionally reject forms when `NEXT_PUBLIC_SITE_URL` does not match the page origin. Prefer a separate Supabase staging project for preview environments; do not use production data for tests.
7. Complete the live acceptance checks in `VALIDATION.md` before sharing publicly.

Vercel credentials were not available in the build session, so deployment must be connected from your account. The code is not tied to ChatGPT hosting.

## 3. Manage projects

- Open `/admin/projects`, then **New project**.
- Add your title, URL slug, summary, category, technologies, role, and timeline.
- Upload a cover or gallery images, each under 3 MB. Add useful alt text describing each image.
- Write the case study using plain text. Describe the actual problem, your approach, data, implementation, evaluation, limitations, and outcomes. Optional empty sections are hidden. No Markdown/HTML is executed.
- Save a draft. Open **Preview saved draft** to inspect it privately. Unsaved edits are not included in preview.
- Choose **Publish**, then confirm. Publication requires a summary, problem, approach, and alt text for images.
- Set **Feature on homepage** and a lower display-order number to prioritize the project.
- Editing an already published project changes only its draft until you explicitly publish again.
- Changing and publishing a slug preserves prior published links through redirects.
- **Unpublish** hides the public project but retains the draft.
- **Delete project** removes the draft, publication, and aliases after confirmation. Uploaded files remain available in Media until you delete them separately.

## 4. Edit your profile

Under `/admin/profile`, edit your name, professional title, hero lines, biography, contact details, availability, expertise, timeline entries, social links, and search metadata. Upload a new portrait or PDF résumé. Reorder or hide homepage sections. Click **Save & publish profile** to apply changes.

Profile changes are published together when saved. The résumé download is hidden until a résumé is supplied. Initial content uses the information you provided; no graduation dates, internship dates, project metrics, or certifications have been invented.

## 5. Manage enquiries

Accepted contact messages are stored in Supabase before success is reported. Open `/admin/inbox` to search, filter, or paginate enquiries. Mark a message read, replied, or archived as appropriate.

**Draft reply** opens your email app; it does not send a message and does not change the status. After sending the response yourself, mark the enquiry **replied**.

CSV export includes all messages and neutralizes leading spreadsheet formula characters. Deletion requires confirmation. Handle contact details privately and remove them when no longer needed or when the sender requests deletion.

The contact endpoint permits five submissions per hashed IP per hour. The login/recovery endpoint permits 15 attempts per hour in addition to Supabase's controls. On Vercel the limiter uses the platform-provided client IP header. Local development shares a single limiter identity. If adapting to another host, configure a trusted proxy source first.

## 6. Optional email notifications

To receive a generic notification when an enquiry arrives:

1. Configure a verified sender with Resend.
2. Set `RESEND_API_KEY`, `NOTIFICATION_FROM`, and `NOTIFICATION_TO` in Vercel.
3. Redeploy to load changed environment settings.

Notifications contain no enquiry body. A failed notification never removes a saved message or causes a successful save to be reported as failed. Your admin inbox remains the source of truth. Supabase's authentication SMTP is a separate configuration for recovery emails.

## 7. Media

JPG, PNG, and WebP uploads are decoded and re-encoded as optimized WebP. PDF uploads are parsed to confirm they are valid, and served as downloads. SVG and executable uploads are not accepted. The 3 MB source limit stays within Vercel's request size constraints.

Files in the private bucket are served only through the application. A file becomes public when referenced in your saved profile or a published project. Unreferenced files and draft-only files require owner sign-in. Remove all references before deleting a file.

## 8. Move to a custom domain

Content and uploaded files remain in the same Supabase project and survive a domain change.

- Add the new domain in Vercel and complete its DNS verification.
- Set `NEXT_PUBLIC_SITE_URL=https://your-domain.example` and redeploy.
- Change Supabase's Site URL and add `https://your-domain.example/auth/callback` to allowed redirects.
- Keep the old callback temporarily if outstanding recovery links may use it; remove it after transition.
- Confirm canonical URLs, the dynamic sitemap, Open Graph URLs, JSON-LD, contact submissions, sign-in, and recovery on the new domain.
- Redirect the former public domain to the new domain through Vercel as appropriate.
- Update any verified notification sender/domain configuration separately if your email identity changes.
- Retest origin checks. No database or file migration is required.

## 9. Backups and maintenance

Use Supabase backups appropriate to your plan and retain an independent backup of important media and project content. Keep dependency updates and Supabase/Vercel security settings current. Test recovery before relying on the site for business enquiries.


## 10. Certificates

Open `/admin/certifications` and choose **Add certificate**. Enter its title, issuer, dates, credential ID, description, and related skills. Upload a PDF or image and optionally an image for the public card. You can also add an HTTPS verification link.

Save a draft, inspect its card preview, then explicitly publish. Editing a published certificate changes its private draft only. Unpublish to hide it; delete removes the draft and published version after confirmation. Referenced certificate files are protected from deletion in Media. No credentials are invented or automatically populated.

Migration 002 preserves your owner and all existing content. If your profile table is empty, it inserts the supplied real profile automatically, removing the need to run a local seed command for this setup.
