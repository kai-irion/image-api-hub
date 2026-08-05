-- Image API Hub — core schema
--
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent (create ... if not exists,
-- drop policy/trigger if exists before create, etc).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles — mirrors auth.users for public-facing user data
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- shared helper: keep updated_at current on row updates
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects — folders that group chats
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text,
  -- Prepended to the prompt of every image generation in this project's
  -- chats (see app/api/generate/route.ts).
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Applies to a projects table that already existed before these columns
-- were added; a no-op on a fresh install where the create table above
-- already included them.
alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists instructions text;

create index if not exists projects_owner_id_idx on public.projects (owner_id);

alter table public.projects enable row level security;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = owner_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = owner_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- chats
-- ---------------------------------------------------------------------------

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null default 'New chat',
  starred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Applies the column to a chats table that already existed before `starred`
-- was added; a no-op on a fresh install where the create table above already
-- included it.
alter table public.chats add column if not exists starred boolean not null default false;

create index if not exists chats_owner_id_idx on public.chats (owner_id);
create index if not exists chats_project_id_idx on public.chats (project_id);

alter table public.chats enable row level security;

drop trigger if exists trg_chats_updated_at on public.chats;
create trigger trg_chats_updated_at
  before update on public.chats
  for each row execute function public.set_updated_at();

drop policy if exists "chats_select_own" on public.chats;
create policy "chats_select_own"
  on public.chats for select
  using (auth.uid() = owner_id);

drop policy if exists "chats_insert_own" on public.chats;
create policy "chats_insert_own"
  on public.chats for insert
  with check (
    auth.uid() = owner_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "chats_update_own" on public.chats;
create policy "chats_update_own"
  on public.chats for update
  using (auth.uid() = owner_id)
  with check (
    auth.uid() = owner_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "chats_delete_own" on public.chats;
create policy "chats_delete_own"
  on public.chats for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- messages — ownership is transitive through chats.owner_id
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  -- Path of the generated image in the `generated-images` storage bucket
  -- (e.g. "<user_id>/<chat_id>/<uuid>.png"), not a URL. Signed URLs are
  -- generated on demand when messages are read.
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_id_idx on public.messages (chat_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.owner_id = auth.uid()
    )
  );

-- Bump the parent chat's updated_at whenever a message is added, so the
-- sidebar's "most recently active" ordering stays correct automatically.
create or replace function public.touch_chat_on_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_chat_on_message on public.messages;
create trigger trg_touch_chat_on_message
  after insert on public.messages
  for each row execute function public.touch_chat_on_message();

-- ---------------------------------------------------------------------------
-- user_settings — one row per user, holds the encrypted OpenAI API key
-- ---------------------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- AES-256-GCM ciphertext (iv + authTag + ciphertext, base64-encoded),
  -- produced by lib/crypto.ts using the server-side ENCRYPTION_KEY. Never
  -- store or return the plaintext key.
  openai_api_key_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- storage — private bucket for generated images, one folder per user
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', false)
on conflict (id) do nothing;

drop policy if exists "generated_images_select_own" on storage.objects;
create policy "generated_images_select_own"
  on storage.objects for select
  using (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "generated_images_insert_own" on storage.objects;
create policy "generated_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "generated_images_delete_own" on storage.objects;
create policy "generated_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
