# Deploy Portfolio 03

This version introduces an ivory, cobalt, and navy design with upright typography, an arched portrait, factual experience highlights, and animated sections. All existing admin and certificate workflows remain in place. No additional database migration is needed if 002_certifications.sql has already been run.

Your GitHub repository contains the complete website source, not a ZIP that needs extraction.

1. Open Vercel and import `saqibturi/Saqib-Portfolio` as a Next.js project. If already connected, the pushed commit triggers its normal deployment.
2. Keep the Supabase environment variables you already configured. Check that `NEXT_PUBLIC_SITE_URL` matches the site's exact deployed origin.
3. In Supabase SQL Editor, open a **new query**, paste the entire contents of `supabase/migrations/002_certifications.sql`, and run it.
4. **Do not rerun `001_portfolio.sql` if you already ran it.** Migration 002 adds certificate tables, preserves existing data, and initializes the supplied profile only if none exists.
5. Visit `/login`, then `/admin/certifications` to upload your genuine certificates and publish them.

Your projects, owner account, enquiries, and existing files remain intact. Certificates appear in the homepage section and at `/certifications` after publication.

If an existing saved profile still has the old headline wording, change the two hero lines under `/admin/profile`. The recommended new lines are “Intelligent ideas.” and “Built for people.” The redesigned typography is upright regardless of wording.

The public code is ready; live functionality depends on your Supabase environment variables, existing owner account, and authentication redirect settings. See `OWNER-GUIDE.md` for the full setup.
