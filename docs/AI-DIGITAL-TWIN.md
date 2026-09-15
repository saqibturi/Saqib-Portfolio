# Saqib AI — Digital Twin + Portfolio Intelligence

Saqib AI is a portfolio-integrated AI Digital Twin that turns verified professional material into two experiences:

1. a source-grounded conversational agent that can answer questions about Saqib's work; and
2. an interactive Portfolio Intelligence layer that maps milestones, skills, goals, and evidence-based recruiter analysis.

This is deliberately designed as a production-style final-year AI project rather than a generic "chat with PDF" demo.

## System architecture

```text
Visitor / Recruiter
        |
        v
Next.js Portfolio UI
        |
        +--------------------+
        |                    |
        v                    v
Digital Twin Chat       Portfolio Intelligence
        |                    |
        v                    +--> Life Map
Request Orchestrator         +--> Skill Evidence
        |                    +--> Goal Tracking
        |                    +--> Recruiter Mode
        v
Query Embedding
        |
        +--> RAG Retrieval --------> Supabase pgvector / HNSW
        |
        +--> Session Memory -------> conversation history + compact summary
        |
        +--> Personality / Policy -> grounding + privacy rules
        |
        v
OpenAI Responses API
        |
        v
Grounded answer + citations + telemetry

Owner Workspace
        |
        v
Resume / LinkedIn / Projects / Notes / Goals / Calendar / Journal / Certificates
        |
        v
Chunking -> Embeddings -> pgvector
        |
        +--> Structured evidence extraction
              +--> Life milestones
              +--> Explicit goals
              +--> Skill evidence
```

## Production components

- **Next.js 16 + React 19 + TypeScript** for the portfolio, APIs, owner workspace, and interactive UI.
- **OpenAI Responses API** for grounded response generation and structured evidence extraction.
- **GPT-5.6 Luna** as the default high-volume visitor chat model.
- **GPT-5.6 Terra** as the default deeper analysis model for ingestion and Recruiter Mode.
- **OpenAI `text-embedding-3-small`** for 1536-dimensional semantic embeddings.
- **Supabase Postgres + pgvector** with HNSW indexes for RAG and semantic memory retrieval.
- **Persistent conversation memory** with session-scoped history plus privacy-safe compaction summaries.
- **Evidence-based Recruiter Mode** that scores portfolio evidence for a requested role and exposes confidence, source markers, evidence gaps, and interview questions.
- **Portfolio Intelligence extraction** that converts unstructured sources into structured milestones, goals, and skill evidence.
- **Rate limiting and same-origin protection** on public model-consuming endpoints.
- **Telemetry** for latency and retrieval counts.

## Privacy model

Every uploaded source has one of three visibility levels:

- `private` — owner analysis only; never retrieved by the public twin or shown in the Life Map.
- `twin` — may ground public AI answers, but is not automatically exposed in public visualizations.
- `public` — may ground answers and may appear in shareable Life Map / Portfolio Intelligence views.

Private journal, calendar, note, and goal sources should default to `private`. Promotion to `twin` or `public` is an explicit owner decision.

The OpenAI Responses calls set `store: false`. Conversation summaries intentionally exclude visitor passwords, contact details, health information, religion, politics, sexuality, ethnicity, financial data, and unrelated personal details.

## Grounding policy

The twin is instructed to:

- answer factual questions about Saqib only from retrieved evidence or curated memory;
- never invent projects, jobs, education, achievements, dates, metrics, or preferences;
- state when evidence is insufficient;
- cite retrieved source markers such as `[S1]` and `[S2]`;
- keep recruiter analysis tied to evidence strength rather than presenting AI-generated percentages as objective measures of human ability.

## Ingestion pipeline

The owner workspace lives at `/admin/twin`.

Current direct text-file adapters:

- TXT
- Markdown
- CSV
- JSON
- ICS calendar exports
- HTML
- LOG/text exports

The owner can also paste verified source text. Native PDF/DOCX extraction is intentionally tracked as a dedicated ingestion adapter rather than silently using unreliable browser parsing.

On ingestion the backend:

1. hashes the source for change detection;
2. chunks the content with overlap;
3. creates embeddings;
4. stores chunks in pgvector;
5. runs structured-output extraction;
6. stores explicit milestones, goals, and skill evidence with inherited privacy visibility.

## Recruiter Mode methodology

Recruiter Mode accepts a target role such as `AI Engineer`, retrieves the most relevant portfolio evidence, and returns:

- overall evidence-based role fit;
- 4–6 scored dimensions;
- a confidence value for each dimension;
- rationale with `[S#]` evidence markers;
- strongest demonstrated evidence;
- missing evidence / portfolio gaps;
- targeted interview questions.

Scores represent **evidence strength and role fit**, not an absolute measurement of the person's real-world ability.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SECRET=
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-5.6-luna
OPENAI_ANALYSIS_MODEL=gpt-5.6-terra
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the browser.

## Final-year project research framing

**Research question:** Can a source-grounded AI Digital Twin represent a person's professional knowledge more accurately, transparently, and interactively than a static portfolio or naive LLM chatbot?

Recommended experimental baselines:

- Static portfolio only.
- Naive LLM chatbot with profile text in the system prompt.
- RAG Digital Twin without memory.
- Full system with RAG + session memory + structured portfolio intelligence.

Recommended evaluation metrics:

- retrieval Recall@K;
- context precision;
- answer correctness;
- citation precision;
- hallucination rate;
- unsupported-claim rate;
- latency p50 / p95;
- recruiter task completion time;
- recruiter confidence / usefulness survey;
- privacy boundary tests;
- prompt-injection resistance tests.

## Research-grade roadmap

1. Native PDF/DOCX ingestion and extraction.
2. Hybrid lexical + vector retrieval with reciprocal-rank fusion.
3. Reranking before response generation.
4. Automated RAG evaluation dataset and dashboard.
5. OpenAI Realtime voice with server-issued ephemeral sessions.
6. Multi-stage agent router for recruiter, project explorer, research, memory, and document workflows.
7. Prompt-injection detection and source trust levels.
8. Scenario-based career outlook with uncertainty rather than deterministic "future prediction" claims.
9. Observability dashboard for latency, retrieval scores, token usage, unanswered questions, and cost.
10. Multi-tenant architecture if the project evolves into a portfolio-intelligence SaaS product.
