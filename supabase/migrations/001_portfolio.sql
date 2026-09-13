-- Apply using Supabase SQL Editor as the project administrator.
create table public.owners(user_id uuid primary key references auth.users(id) on delete cascade);
create unique index single_owner on public.owners((true));
create or replace function public.is_owner() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.owners where user_id=auth.uid()) $$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;
create table public.profile(id int primary key check(id=1),content jsonb not null,updated_at timestamptz not null default now());
create table public.project_drafts(id uuid primary key,content jsonb not null,updated_at timestamptz not null default now(),check(content->>'id'=id::text));
create table public.published_projects(id uuid primary key references public.project_drafts(id) on delete cascade,slug text unique not null,content jsonb not null,published_at timestamptz not null default now());
create table public.project_slugs(slug text primary key,project_id uuid not null references public.project_drafts(id) on delete cascade);
create index project_slugs_project on public.project_slugs(project_id);
create table public.messages(id uuid primary key,name text not null,email text not null,company text not null default '',type text not null,message text not null,status text not null default 'unread' check(status in ('unread','read','replied','archived')),created_at timestamptz not null default now());
create index messages_status_created on public.messages(status,created_at desc);
create table public.media(id uuid primary key,path text unique not null,mime text not null,name text not null,size int not null,created_at timestamptz not null default now());
create table public.rate_limits(key text primary key,hits int not null,window_start timestamptz not null default now());
alter table public.owners enable row level security;
alter table public.profile enable row level security;
alter table public.project_drafts enable row level security;
alter table public.published_projects enable row level security;
alter table public.project_slugs enable row level security;
alter table public.messages enable row level security;
alter table public.media enable row level security;
alter table public.rate_limits enable row level security;
create policy owner_identity on public.owners for select to authenticated using(user_id=auth.uid());
create policy public_profile on public.profile for select to anon,authenticated using(true);
create policy public_projects on public.published_projects for select to anon,authenticated using(true);
create policy public_aliases on public.project_slugs for select to anon,authenticated using(exists(select 1 from public.published_projects p where p.id=project_id));
-- Owner reads use their own JWT and RLS; mutations pass through authorized server endpoints.
create policy owner_drafts on public.project_drafts for select to authenticated using(public.is_owner());
create policy owner_messages on public.messages for select to authenticated using(public.is_owner());
create policy owner_media on public.media for select to authenticated using(public.is_owner());
revoke all on public.owners,public.profile,public.project_drafts,public.published_projects,public.project_slugs,public.messages,public.media,public.rate_limits from anon,authenticated;
grant select on public.profile,public.published_projects,public.project_slugs to anon,authenticated;
grant select on public.owners,public.project_drafts,public.messages,public.media to authenticated;
grant all on public.owners,public.profile,public.project_drafts,public.published_projects,public.project_slugs,public.messages,public.media,public.rate_limits to service_role;
create or replace function public.publish_project(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare d jsonb; wanted text; reserved uuid;
begin
  perform pg_advisory_xact_lock(927401);
  select content into d from public.project_drafts where id=p_id for update;
  if d is null then raise exception 'Draft missing'; end if;
  wanted:=d->>'slug';
  select project_id into reserved from public.project_slugs where slug=wanted;
  if reserved is not null and reserved<>p_id then raise unique_violation using message='Slug reserved'; end if;
  insert into public.project_slugs(slug,project_id) values(wanted,p_id) on conflict(slug) do nothing;
  insert into public.published_projects(id,slug,content) values(p_id,wanted,d)
  on conflict(id) do update set slug=excluded.slug,content=excluded.content,published_at=now();
end;$$;
revoke all on function public.publish_project(uuid) from public,anon,authenticated;
grant execute on function public.publish_project(uuid) to service_role;
create or replace function public.consume_rate_limit(p_key text,p_limit int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;
begin
  insert into public.rate_limits(key,hits) values(p_key,1)
  on conflict(key) do update set hits=case when rate_limits.window_start<now()-interval '1 hour' then 1 else rate_limits.hits+1 end,
    window_start=case when rate_limits.window_start<now()-interval '1 hour' then now() else rate_limits.window_start end
  returning hits into n;
  -- Opportunistic expiry keeps the durable limiter bounded without cron.
  delete from public.rate_limits where window_start<now()-interval '2 days';
  return n<=p_limit;
end;$$;
revoke all on function public.consume_rate_limit(text,int) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,int) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-media','portfolio-media',false,3000000,array['image/webp','application/pdf']) on conflict(id) do nothing;
-- No storage.objects policies for anon/authenticated: all files are private.
-- Authorized upload endpoint and reference-checking download endpoint use service_role.
