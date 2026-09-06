-- Cloud database structure (PostgreSQL / Supabase).
--
-- How to use: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. It is safe to run more than once.
--
-- Columns match the local SQLite tables, minus "synced", which is bookkeeping
-- that only makes sense on the phone.

create table if not exists equipment (
  id uuid primary key,
  name text not null,
  category text,
  location text,
  interval_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists maintenance (
  id uuid primary key,
  equipment_id uuid not null references equipment(id) on delete cascade,
  type text not null check (type in ('preventive', 'corrective')),
  description text,
  technician text,
  performed_at timestamptz not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_maintenance_equipment
  on maintenance(equipment_id);

-- Deletion is logical on both sides. The app never removes a row: it fills in
-- deleted_at and uploads again. Without this, equipment deleted on the phone
-- would live here forever, because the upload only sends rows that still exist.

-- ---------------------------------------------------------------------------
-- Carries over data from the first version, when the tables were named in
-- Portuguese. Harmless if those tables never existed.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.equipamentos') is not null then
    insert into equipment (id, name, category, location, interval_days, created_at, updated_at, deleted_at)
      select id, nome, categoria, localizacao, intervalo_dias, criado_em, atualizado_em, deleted_at
        from equipamentos
      on conflict (id) do nothing;
  end if;

  if to_regclass('public.manutencoes') is not null then
    insert into maintenance (id, equipment_id, type, description, technician, performed_at, created_at, deleted_at)
      select id, equipamento_id,
             case tipo when 'preventiva' then 'preventive' else 'corrective' end,
             descricao, responsavel, data, criado_em, deleted_at
        from manutencoes
      on conflict (id) do nothing;
  end if;
end $$;

drop table if exists manutencoes;
drop table if exists equipamentos;

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
-- Supabase turns Row Level Security on by default and, with no policy at all,
-- blocks everything coming from the anon key — including this app's writes.
-- Since the project has no login, both tables are opened up.
-- (A deliberate academic scope decision: a real app would restrict this to the
-- signed-in user.)
alter table equipment enable row level security;
alter table maintenance enable row level security;

drop policy if exists public_access_equipment on equipment;
create policy public_access_equipment on equipment
  for all using (true) with check (true);

drop policy if exists public_access_maintenance on maintenance;
create policy public_access_maintenance on maintenance
  for all using (true) with check (true);
