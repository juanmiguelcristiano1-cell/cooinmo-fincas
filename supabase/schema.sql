-- COOINMO FINCAS · Supabase / PostgreSQL
-- Ejecuta este archivo en Supabase SQL Editor.
-- Diseñado para funcionar con un frontend estático en GitHub Pages.

create extension if not exists pgcrypto;

create table if not exists public.fincas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  provincia text not null,
  municipio text,
  tipo text not null,
  superficie text,
  hectareas text,
  agua text,
  pies text,
  produccion text,
  precio text,
  estado text default 'En captación',
  telefono text,
  descripcion text,
  fotos text,
  publicado boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tipo_lead text not null check (tipo_lead in ('propietario','comprador')),
  nombre text not null,
  telefono text,
  email text,
  provincia text,
  municipio text,
  presupuesto text,
  superficie text,
  cultivo text,
  mensaje text,
  source text default 'web',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fincas_updated_at on public.fincas;
create trigger trg_fincas_updated_at
before update on public.fincas
for each row execute function public.set_updated_at();

alter table public.fincas enable row level security;
alter table public.leads enable row level security;

revoke all on table public.fincas from anon, authenticated;
revoke all on table public.leads from anon, authenticated;

grant select on table public.fincas to anon, authenticated;
grant insert, update, delete on table public.fincas to authenticated;

grant insert on table public.leads to anon, authenticated;
grant select, update, delete on table public.leads to authenticated;

-- Web pública: solo muestra fincas marcadas como publicadas.
drop policy if exists "Public can view published farms" on public.fincas;
create policy "Public can view published farms"
on public.fincas
for select
to anon, authenticated
using (publicado = true or (select auth.uid()) = created_by);

-- Usuarios autenticados pueden gestionar el inventario.
drop policy if exists "Authenticated can insert farms" on public.fincas;
create policy "Authenticated can insert farms"
on public.fincas
for insert
to authenticated
with check ((select auth.uid()) = created_by);

drop policy if exists "Authenticated can update farms" on public.fincas;
create policy "Authenticated can update farms"
on public.fincas
for update
to authenticated
using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

drop policy if exists "Authenticated can delete farms" on public.fincas;
create policy "Authenticated can delete farms"
on public.fincas
for delete
to authenticated
using ((select auth.uid()) = created_by);

-- Los formularios públicos pueden crear leads; solo usuarios autenticados pueden verlos o gestionarlos.
drop policy if exists "Public can submit leads" on public.leads;
create policy "Public can submit leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated can view leads" on public.leads;
create policy "Authenticated can view leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "Authenticated can update leads" on public.leads;
create policy "Authenticated can update leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete leads" on public.leads;
create policy "Authenticated can delete leads"
on public.leads
for delete
to authenticated
using (true);

-- Nota de seguridad:
-- Usa únicamente la Publishable Key en el navegador. Nunca expongas service_role/secret keys.
