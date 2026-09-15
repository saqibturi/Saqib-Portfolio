# Deploy Saqib AI on Vercel

## 1. Required Vercel environment variables

Add these to Production and Preview environments:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RATE_LIMIT_SECRET=...
GEMINI_API_KEY=...
GEMINI_CHAT_MODEL=gemini-3.5-flash-lite
GEMINI_ANALYSIS_MODEL=gemini-3.5-flash-lite
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
```

`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RATE_LIMIT_SECRET` are server-only secrets. Never prefix them with `NEXT_PUBLIC_`.

The Digital Twin now uses Google Gemini for chat, structured portfolio analysis, and embeddings. `gemini-embedding-2` is requested at 1536 dimensions so it remains compatible with the existing Supabase pgvector schema.

## 2. Database

Production Supabase already needs the schema in:

`supabase/migrations/20260915_ai_digital_twin.sql`

For a fresh environment, apply that migration after the portfolio core schema.

Optional public starter data lives at:

`supabase/seed/ai_digital_twin_seed.sql`

If you ever change embedding providers or embedding dimensionality after indexing real sources, re-index all existing chunks and memories before semantic search is used. Embeddings from different model families must not be mixed in the same similarity index.

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
- Gemini free-tier quota errors are surfaced without exposing the API key.

## 5. Next deployment phase

The production roadmap after the text-first launch is:

- native PDF/DOCX extraction;
- Gemini-compatible realtime voice or a dedicated realtime voice provider;
- hybrid retrieval and reranking;
- automated RAG evaluation dashboard;
- observability/cost dashboard;
- scenario-based career outlook.
