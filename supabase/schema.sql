-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL).
-- Habilita extensión para gen_random_uuid si hace falta:
-- create extension if not exists "pgcrypto";

-- Perfil (nombre + mensaje de crisis)
create table if not exists public.users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  crisis_message text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Contactos de apoyo
create table if not exists public.support_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  phone text not null,
  role text not null check (role in ('support_1', 'support_2', 'support_3', 'therapist')),
  created_at timestamptz not null default now()
);

create index if not exists support_contacts_user_id_idx on public.support_contacts (user_id);

-- Registros / check-ins diarios
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood text not null,
  context text,
  craving_intensity int check (craving_intensity is null or (craving_intensity >= 1 and craving_intensity <= 10)),
  consumed boolean not null default false,
  had_urge boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists daily_checkins_user_id_idx on public.daily_checkins (user_id);
create index if not exists daily_checkins_created_at_idx on public.daily_checkins (created_at desc);

-- Registro de recaídas
create table if not exists public.relapse_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  location text,
  people_context text,
  emotion_before text,
  trigger text,
  next_action text,
  notified_someone boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists relapse_logs_user_id_idx on public.relapse_logs (user_id);

alter table public.users_profile enable row level security;
alter table public.support_contacts enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.relapse_logs enable row level security;

-- Políticas: cada usuario solo ve y modifica sus filas
create policy "users_profile_select_own"
  on public.users_profile for select
  using (auth.uid() = user_id);

create policy "users_profile_insert_own"
  on public.users_profile for insert
  with check (auth.uid() = user_id);

create policy "users_profile_update_own"
  on public.users_profile for update
  using (auth.uid() = user_id);

create policy "support_contacts_all_own"
  on public.support_contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_checkins_all_own"
  on public.daily_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "relapse_logs_all_own"
  on public.relapse_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
