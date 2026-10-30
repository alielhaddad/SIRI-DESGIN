-- Siri Designs database setup
-- Run this entire script once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'تشطيبات متكاملة',
  location text default '',
  image_url text default '',
  description text default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text default '',
  service text not null,
  budget text default '',
  details text default '',
  status text not null default 'new' check (status in ('new','in_progress','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text default '',
  note text default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings(id, value)
values ('main', '{"address":"القاهرة، مصر","about":"نحوّل أفكارك إلى مساحات أنيقة تجمع بين الجودة والراحة والوظيفة، من الفكرة الأولى وحتى أدق تفاصيل التنفيذ."}'::jsonb)
on conflict (id) do nothing;

create index if not exists projects_published_created_idx on public.projects (published, created_at desc);
create index if not exists clients_active_created_idx on public.clients (active, created_at desc);
create index if not exists customer_requests_created_idx on public.customer_requests (created_at desc);

-- Row Level Security
alter table public.projects enable row level security;
alter table public.customer_requests enable row level security;
alter table public.clients enable row level security;
alter table public.site_settings enable row level security;

-- Drop policies first so this setup can be safely re-run.
drop policy if exists "Public can view published projects" on public.projects;
drop policy if exists "Authenticated admins manage projects" on public.projects;
drop policy if exists "Public can submit customer requests" on public.customer_requests;
drop policy if exists "Authenticated admins read requests" on public.customer_requests;
drop policy if exists "Authenticated admins update requests" on public.customer_requests;
drop policy if exists "Authenticated admins delete requests" on public.customer_requests;
drop policy if exists "Public can view active clients" on public.clients;
drop policy if exists "Authenticated admins manage clients" on public.clients;
drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Authenticated admins manage settings" on public.site_settings;

create policy "Public can view published projects"
  on public.projects for select to anon, authenticated using (published = true);
create policy "Authenticated admins manage projects"
  on public.projects for all to authenticated using (true) with check (true);

create policy "Public can submit customer requests"
  on public.customer_requests for insert to anon, authenticated with check (
    length(trim(name)) between 2 and 100 and
    length(trim(phone)) between 5 and 30 and
    length(trim(service)) between 2 and 100
  );
create policy "Authenticated admins read requests"
  on public.customer_requests for select to authenticated using (true);
create policy "Authenticated admins update requests"
  on public.customer_requests for update to authenticated using (true) with check (true);
create policy "Authenticated admins delete requests"
  on public.customer_requests for delete to authenticated using (true);

create policy "Public can view active clients"
  on public.clients for select to anon, authenticated using (active = true);
create policy "Authenticated admins manage clients"
  on public.clients for all to authenticated using (true) with check (true);

create policy "Public can read site settings"
  on public.site_settings for select to anon, authenticated using (id = 'main');
create policy "Authenticated admins manage settings"
  on public.site_settings for all to authenticated using (true) with check (true);

-- Public portfolio bucket for project photos and client logos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 6291456, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 6291456, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio images" on storage.objects;
drop policy if exists "Authenticated admins upload portfolio images" on storage.objects;
drop policy if exists "Authenticated admins update portfolio images" on storage.objects;
drop policy if exists "Authenticated admins delete portfolio images" on storage.objects;

create policy "Public can view portfolio images"
  on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio');
create policy "Authenticated admins upload portfolio images"
  on storage.objects for insert to authenticated with check (bucket_id = 'portfolio');
create policy "Authenticated admins update portfolio images"
  on storage.objects for update to authenticated using (bucket_id = 'portfolio') with check (bucket_id = 'portfolio');
create policy "Authenticated admins delete portfolio images"
  on storage.objects for delete to authenticated using (bucket_id = 'portfolio');
