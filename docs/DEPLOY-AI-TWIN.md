# Deploy Saqib AI on Vercel

## 1. Required Vercel environment variables

Add these to Production and Preview environments:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RATE_LIMIT_SECRET=...
OPENAI_API_KEY=...
OPENAI_CHAT_MODEL=gpt-5.6-luna
OPENAI_ANALYSIS_MODEL=gpt-5.6-terra
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RATE_LIMIT_SECRET` are server-only secrets. Never prefix them with `NEXT_PUBLIC_`.

## 2. Database

Production Supabase already needs the schema in:

`supabase/migrations/20260915_ai_digital_twin.sql`

For a fresh environment, apply that migration after the portfolio core schema.

Optional public starter data lives at:

`supabase/seed/ai_digital_twin_seed.sql`

## 3. Owner workflow

After deployment:

1. Sign in to the existing portfolio admin.
2. Open `/admin/twin`.
3. Add or import resume, LinkedIn, projects, certificates, notes, goals, calendar exports, or journal extracts.
4. Choose source visibility deliberately:
   - Private: owner analysis only.
   - Twin: can ground public AI answers.
   - Public: can also appear in Life Map / Portfolio Intelligence.
5. Index the source.
6. Test `/twin` with factual and adversarial questions.

## 4. Production verification

Before promoting a deployment:

- GitHub CI is green.
- `/twin` renders on desktop and mobile.
- Public Life Map shows only `public` data.
- Private source text cannot be retrieved by public chat.
- Source citations match retrieved documents.
- Chat returns a clear insufficient-evidence answer for unknown facts.
- Rate limiting returns HTTP 429 after the configured hourly cap.
- Recruiter Mode labels scores as evidence-based fit, not objective human ability.
- Supabase security advisor has no new Digital Twin RLS warnings.

## 5. Next deployment phase

The production roadmap after the text-first launch is:

- native PDF/DOCX extraction;
- OpenAI Realtime voice with ephemeral sessions;
- hybrid retrieval and reranking;
- automated RAG evaluation dashboard;
- observability/cost dashboard;
- scenario-based career outlook.
