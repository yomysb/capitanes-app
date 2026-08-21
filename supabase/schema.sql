-- =====================================================
-- CAPITANES APP - ESQUEMA DE BASE DE DATOS
-- Ejecutar completo en el SQL Editor de Supabase
-- =====================================================

create extension if not exists "uuid-ossp";

-- TABLA: jugadores
create table jugadores (
  id uuid primary key default uuid_generate_v4(),
  nombre_completo text not null,
  aka text,
  numero_jersey int,
  nombre_jersey text,
  estado text not null default 'activo'
    check (estado in ('activo', 'inactivo', 'baja')),
  tipo_compromiso text not null default 'por_partido'
    check (tipo_compromiso in ('fijo', 'por_partido')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABLA: config (parámetros configurables, ej. costo arbitraje)
create table config (
  clave text primary key,
  valor numeric not null,
  updated_at timestamptz default now()
);

insert into config (clave, valor) values ('costo_arbitraje', 250);

-- TABLA: torneos
create table torneos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  fecha_inicio date,
  fecha_fin date,
  activo boolean default true,
  created_at timestamptz default now()
);

-- TABLA: partidos
create table partidos (
  id uuid primary key default uuid_generate_v4(),
  torneo_id uuid references torneos(id) on delete set null,
  jornada int,
  rival text not null,
  fecha date not null,
  hora time,
  cancha text,
  color_uniforme text,
  puntos_capitanes int,
  puntos_rival int,
  costo_arbitraje numeric not null default 250,
  estado text not null default 'programado'
    check (estado in ('programado', 'jugado', 'cancelado')),
  created_at timestamptz default now()
);

-- TABLA: asistencias (pase de lista por partido)
create table asistencias (
  id uuid primary key default uuid_generate_v4(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  asistio boolean not null default false,
  monto_a_pagar numeric,
  created_at timestamptz default now(),
  unique (partido_id, jugador_id)
);

-- TABLA: campanas (fondos destinados: torneo, uniformes, caja, etc.)
create table campanas (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  meta numeric,
  activa boolean default true,
  created_at timestamptz default now()
);

-- TABLA: transacciones (ingresos: arbitraje, aportaciones, excedentes)
create table transacciones (
  id uuid primary key default uuid_generate_v4(),
  jugador_id uuid references jugadores(id) on delete set null,
  partido_id uuid references partidos(id) on delete set null,
  campana_id uuid references campanas(id) on delete set null,
  concepto text not null,
  monto numeric not null,
  forma_pago text not null
    check (forma_pago in ('efectivo', 'transferencia', 'mercado_pago')),
  tipo text not null default 'ingreso'
    check (tipo in ('ingreso', 'excedente')),
  fecha date not null default current_date,
  created_at timestamptz default now()
);

-- TABLA: gastos
create table gastos (
  id uuid primary key default uuid_generate_v4(),
  campana_id uuid references campanas(id) on delete set null,
  concepto text not null,
  categoria text not null,
  monto numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table jugadores enable row level security;
alter table config enable row level security;
alter table torneos enable row level security;
alter table partidos enable row level security;
alter table asistencias enable row level security;
alter table campanas enable row level security;
alter table transacciones enable row level security;
alter table gastos enable row level security;

create policy "auth_full_access" on jugadores
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on config
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on torneos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on partidos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on asistencias
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on campanas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on transacciones
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth_full_access" on gastos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================
-- VISTAS
-- =====================================================

create view v_record_deportivo as
select
  count(*) filter (where estado = 'jugado') as partidos_jugados,
  count(*) filter (where estado = 'jugado' and puntos_capitanes > puntos_rival) as ganados,
  count(*) filter (where estado = 'jugado' and puntos_capitanes < puntos_rival) as perdidos,
  coalesce(sum(puntos_capitanes) filter (where estado = 'jugado'), 0) as puntos_favor,
  coalesce(sum(puntos_rival) filter (where estado = 'jugado'), 0) as puntos_contra
from partidos;

create view v_balance_caja as
select
  (select coalesce(sum(monto), 0) from transacciones) as total_ingresos,
  (select coalesce(sum(monto), 0) from gastos) as total_gastos,
  (select coalesce(sum(monto), 0) from transacciones)
    - (select coalesce(sum(monto), 0) from gastos) as balance;
