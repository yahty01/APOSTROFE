-- Schema + RLS for APOSTROFE MVP

-- Extensions
create extension if not exists "pgcrypto";

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin_or_editor()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  document_id text not null unique,
  title text not null,
  description text null,
  category text null,
  license_type text null,
  status text null,
  measurements jsonb null,
  details jsonb null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

create table if not exists public.asset_media (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  path text not null,
  kind text not null check (kind in ('hero', 'gallery')),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists asset_media_asset_kind_order_idx
  on public.asset_media (asset_id, kind, order_index);

create table if not exists public.settings_marquee (
  id int primary key,
  enabled boolean not null default true,
  text_ru text not null default '',
  text_en text not null default '',
  speed int null,
  direction text null
);

insert into public.settings_marquee (id)
values (1)
on conflict (id) do nothing;

-- Optional: auto-create profiles for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.asset_media enable row level security;
alter table public.settings_marquee enable row level security;

-- profiles: user can read own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

-- assets
drop policy if exists "assets_select_published" on public.assets;
create policy "assets_select_published"
on public.assets
for select
using (is_published = true);

drop policy if exists "assets_crud_admin_editor" on public.assets;
create policy "assets_crud_admin_editor"
on public.assets
for all
using (public.is_admin_or_editor())
with check (public.is_admin_or_editor());

-- asset_media
drop policy if exists "asset_media_select_published" on public.asset_media;
create policy "asset_media_select_published"
on public.asset_media
for select
using (
  exists (
    select 1
    from public.assets
    where public.assets.id = public.asset_media.asset_id
      and public.assets.is_published = true
  )
);

drop policy if exists "asset_media_crud_admin_editor" on public.asset_media;
create policy "asset_media_crud_admin_editor"
on public.asset_media
for all
using (public.is_admin_or_editor())
with check (public.is_admin_or_editor());

-- settings_marquee
drop policy if exists "settings_marquee_select_public" on public.settings_marquee;
create policy "settings_marquee_select_public"
on public.settings_marquee
for select
using (true);

drop policy if exists "settings_marquee_crud_admin_editor" on public.settings_marquee;
create policy "settings_marquee_crud_admin_editor"
on public.settings_marquee
for all
using (public.is_admin_or_editor())
with check (public.is_admin_or_editor());

-- Storage bucket + policies
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

-- Read: only published assets (document_id is first path segment)
drop policy if exists "assets_bucket_read_published" on storage.objects;
create policy "assets_bucket_read_published"
on storage.objects
for select
using (
  bucket_id = 'assets'
  and exists (
    select 1
    from public.assets
    where public.assets.document_id = split_part(storage.objects.name, '/', 1)
      and public.assets.is_published = true
  )
);

-- Write: only admin/editor
drop policy if exists "assets_bucket_write_admin_editor" on storage.objects;
create policy "assets_bucket_write_admin_editor"
on storage.objects
for all
using (bucket_id = 'assets' and public.is_admin_or_editor())
with check (bucket_id = 'assets' and public.is_admin_or_editor());
