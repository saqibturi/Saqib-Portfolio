create extension if not exists vector with schema extensions;

create table if not exists public.twin_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Saqib AI',
  headline text not null default 'AI Digital Twin',
  personality_prompt text not null default 'Be concise, grounded, professional, curious, and transparent about uncertainty.',
  response_rules jsonb not null default '{"cite_sources":true,"admit_uncertainty":true,"never_invent_experience":true}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create table if not exists public.twin_sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('profile','resume','linkedin','project','note','document','goal','calendar','journal','certificate','custom')),
  title text not null,
  source_url text,
  raw_content text not null,
  metadata jsonb not null default '{}'::jsonb,
  checksum text,
  enabled boolean not null default true,
  visibility text not null default 'private' check (visibility in ('private','twin','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.twin_chunks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.twin_sources(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(1536),
  token_estimate integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_id, chunk_index)
);

create table if not exists public.twin_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  memory_summary text,
  message_count integer not null default 0,
  last_intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, session_id)
);

create table if not exists public.twin_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.twin_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  model text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.twin_memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.twin_conversations(id) on delete cascade,
  memory_type text not null default 'conversation' check (memory_type in ('conversation','preference','fact','goal')),
  content text not null,
  embedding extensions.vector(1536),
  salience real not null default 0.5 check (salience >= 0 and salience <= 1),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.twin_events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.twin_life_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.twin_sources(id) on delete set null,
  category text not null check (category in ('education','career','skill','project','goal','certificate','personal')),
  title text not null,
  summary text not null default '',
  started_at date,
  ended_at date,
  importance smallint not null default 3 check (importance between 1 and 5),
  evidence jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private','twin','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.twin_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.twin_sources(id) on delete set null,
  title text not null,
  category text not null default 'career',
  status text not null default 'active' check (status in ('planned','active','paused','completed','abandoned')),
  progress smallint not null default 0 check (progress between 0 and 100),
  target_date date,
  rationale text,
  success_criteria jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  visibility text not null default 'private' check (visibility in ('private','twin','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.twin_skill_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.twin_sources(id) on delete set null,
  skill text not null,
  category text not null default 'technical',
  evidence_text text not null,
  confidence real not null default 0.7 check (confidence between 0 and 1),
  observed_at date,
  metadata jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private','twin','public')),
  created_at timestamptz not null default now()
);

create table if not exists public.twin_recruiter_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  role_target text,
  dimensions jsonb not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists twin_chunks_embedding_hnsw on public.twin_chunks using hnsw (embedding vector_cosine_ops) where embedding is not null;
create index if not exists twin_memories_embedding_hnsw on public.twin_memories using hnsw (embedding vector_cosine_ops) where embedding is not null;
create index if not exists twin_sources_owner_enabled_idx on public.twin_sources(owner_id, enabled);
create index if not exists twin_messages_conversation_created_idx on public.twin_messages(conversation_id, created_at);
create index if not exists twin_events_owner_created_idx on public.twin_events(owner_id, created_at desc);
create index if not exists twin_life_events_owner_date_idx on public.twin_life_events(owner_id, started_at desc nulls last);
create index if not exists twin_goals_owner_status_idx on public.twin_goals(owner_id, status, target_date);
create index if not exists twin_skill_evidence_owner_skill_idx on public.twin_skill_evidence(owner_id, skill);
create index if not exists twin_recruiter_snapshots_owner_created_idx on public.twin_recruiter_snapshots(owner_id, created_at desc);

alter table public.twin_profiles enable row level security;
alter table public.twin_sources enable row level security;
alter table public.twin_chunks enable row level security;
alter table public.twin_conversations enable row level security;
alter table public.twin_messages enable row level security;
alter table public.twin_memories enable row level security;
alter table public.twin_events enable row level security;
alter table public.twin_life_events enable row level security;
alter table public.twin_goals enable row level security;
alter table public.twin_skill_evidence enable row level security;
alter table public.twin_recruiter_snapshots enable row level security;

drop policy if exists twin_profiles_owner_all on public.twin_profiles;
create policy twin_profiles_owner_all on public.twin_profiles for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_profiles.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_profiles.owner_id = auth.uid()));

drop policy if exists twin_sources_owner_all on public.twin_sources;
create policy twin_sources_owner_all on public.twin_sources for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_sources.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_sources.owner_id = auth.uid()));

drop policy if exists twin_chunks_owner_all on public.twin_chunks;
create policy twin_chunks_owner_all on public.twin_chunks for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_chunks.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_chunks.owner_id = auth.uid()));

drop policy if exists twin_conversations_owner_all on public.twin_conversations;
create policy twin_conversations_owner_all on public.twin_conversations for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_conversations.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_conversations.owner_id = auth.uid()));

drop policy if exists twin_messages_owner_read on public.twin_messages;
create policy twin_messages_owner_read on public.twin_messages for select to authenticated using (exists (select 1 from public.twin_conversations c join public.owners o on o.user_id = c.owner_id where c.id = twin_messages.conversation_id and o.user_id = auth.uid()));

drop policy if exists twin_memories_owner_all on public.twin_memories;
create policy twin_memories_owner_all on public.twin_memories for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_memories.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_memories.owner_id = auth.uid()));

drop policy if exists twin_events_owner_all on public.twin_events;
create policy twin_events_owner_all on public.twin_events for all to authenticated using (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_events.owner_id = auth.uid())) with check (exists (select 1 from public.owners o where o.user_id = auth.uid() and twin_events.owner_id = auth.uid()));

drop policy if exists twin_life_events_owner_all on public.twin_life_events;
create policy twin_life_events_owner_all on public.twin_life_events for all to authenticated using (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid())) with check (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid()));

drop policy if exists twin_goals_owner_all on public.twin_goals;
create policy twin_goals_owner_all on public.twin_goals for all to authenticated using (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid())) with check (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid()));

drop policy if exists twin_skill_evidence_owner_all on public.twin_skill_evidence;
create policy twin_skill_evidence_owner_all on public.twin_skill_evidence for all to authenticated using (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid())) with check (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid()));

drop policy if exists twin_recruiter_snapshots_owner_all on public.twin_recruiter_snapshots;
create policy twin_recruiter_snapshots_owner_all on public.twin_recruiter_snapshots for all to authenticated using (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid())) with check (owner_id = auth.uid() and exists (select 1 from public.owners o where o.user_id = auth.uid()));

create or replace function public.match_twin_chunks(
  p_owner_id uuid,
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 8,
  p_min_similarity double precision default 0.35
)
returns table (
  chunk_id uuid,
  source_id uuid,
  title text,
  source_type text,
  source_url text,
  content text,
  similarity double precision,
  metadata jsonb
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select c.id, s.id, s.title, s.source_type, s.source_url, c.content,
    1 - (c.embedding <=> p_query_embedding) as similarity,
    c.metadata
  from public.twin_chunks c
  join public.twin_sources s on s.id = c.source_id
  where c.owner_id = p_owner_id
    and s.enabled = true
    and s.visibility in ('twin','public')
    and c.embedding is not null
    and 1 - (c.embedding <=> p_query_embedding) >= p_min_similarity
  order by c.embedding <=> p_query_embedding
  limit greatest(1, least(p_match_count, 20));
$$;

create or replace function public.match_twin_memories(
  p_owner_id uuid,
  p_conversation_id uuid,
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 5,
  p_min_similarity double precision default 0.4
)
returns table (
  memory_id uuid,
  content text,
  memory_type text,
  salience real,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select m.id, m.content, m.memory_type, m.salience,
    1 - (m.embedding <=> p_query_embedding) as similarity
  from public.twin_memories m
  where m.owner_id = p_owner_id
    and (m.conversation_id = p_conversation_id or m.conversation_id is null)
    and m.embedding is not null
    and (m.expires_at is null or m.expires_at > now())
    and 1 - (m.embedding <=> p_query_embedding) >= p_min_similarity
  order by (0.75 * (m.embedding <=> p_query_embedding)) - (0.25 * m.salience)
  limit greatest(1, least(p_match_count, 10));
$$;

revoke all on function public.match_twin_chunks(uuid, extensions.vector, integer, double precision) from public, anon, authenticated;
revoke all on function public.match_twin_memories(uuid, uuid, extensions.vector, integer, double precision) from public, anon, authenticated;
grant execute on function public.match_twin_chunks(uuid, extensions.vector, integer, double precision) to service_role;
grant execute on function public.match_twin_memories(uuid, uuid, extensions.vector, integer, double precision) to service_role;
