# Pull request notes

This branch introduces the first production slice of the AI Digital Twin + Portfolio Intelligence project.

Key changes:

- public `/twin` experience;
- source-grounded RAG chat;
- persistent session-scoped memory;
- Supabase pgvector/HNSW retrieval;
- owner-only ingestion workspace;
- private/twin/public source visibility;
- structured milestone, goal, and skill extraction;
- interactive Life Map;
- evidence-based Recruiter Mode;
- API rate limits and origin checks;
- reproducible Supabase migration and seed;
- CI workflow;
- architecture, project-scope, and deployment documentation.

The production database migrations have already been applied to the connected Supabase project. The application still requires `OPENAI_API_KEY` in Vercel before model-backed ingestion/chat/recruiter analysis can work live.
