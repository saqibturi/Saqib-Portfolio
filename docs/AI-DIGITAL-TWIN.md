# AI Digital Twin — Architecture

This repository contains Saqib Muhammad's portfolio-integrated AI Digital Twin.

## Core pipeline

Visitor -> `/api/twin/chat` -> query embedding -> Supabase pgvector retrieval -> long-term memory retrieval -> OpenAI Responses API -> grounded answer with citations -> conversation telemetry.

## Production components

- Next.js 16 App Router frontend and server routes
- OpenAI Responses API for response generation
- OpenAI `text-embedding-3-small` for 1536-dimensional embeddings
- Supabase Postgres + pgvector HNSW indexes
- RAG retrieval over verified professional sources
- Conversation persistence and semantic long-term memory schema
- Personality/system-policy layer
- Source citations in the public UI
- Protected owner-only source ingestion
- Analytics event table for latency and retrieval measurements

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-5.6-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the browser.

## Next research-grade extensions

1. Hybrid BM25 + vector retrieval and reciprocal-rank fusion.
2. Reranking stage before generation.
3. Automatic memory extraction and consolidation after N turns.
4. RAG evaluation dataset: faithfulness, context precision, answer relevance, citation accuracy.
5. OpenAI Realtime voice interface with ephemeral server-created sessions.
6. Agent router with specialized project, recruiter, research, and memory tools.
7. Document upload pipeline with PDF/DOCX extraction and asynchronous indexing.
8. Prompt-injection detector and source trust levels.
9. Observability dashboard for latency, retrieval scores, token usage, and unanswered questions.
10. Multi-tenant architecture if this becomes a SaaS product.

## Final-year project framing

Research question: **Can a source-grounded AI Digital Twin represent a person's professional knowledge more accurately, transparently, and interactively than a static portfolio?**

Evaluate against a static portfolio and naive chatbot baseline using a curated question set. Report retrieval recall@k, grounded-answer correctness, citation precision, hallucination rate, latency, and recruiter/user satisfaction.
