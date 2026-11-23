-- =============================================================================
-- NEURONOTE · Esquema PostgreSQL (Supabase) · migración 001
-- Datos relacionales: cuentas, perfiles sensoriales, favoritos, psicólogos y
-- bitácora de accesos. Aplicada al proyecto "neuronote" el 23-nov-2026.
--
-- Modelo de seguridad:
--   * La API Express (clave SECRETA, solo en el servidor) es quien lee/escribe.
--   * RLS activado en TODAS las tablas. Sin políticas para anon/authenticated
--     en las tablas privadas  →  desde el navegador no se puede leer ni escribir.
--   * Única tabla pública: psychologist_presence (solo lectura, sin datos
--     sensibles), para el indicador en vivo con Supabase Realtime.
-- =============================================================================

create extension if not exists pgcrypto;

-- Cuentas (contraseñas con bcrypt, generadas por la API) ----------------------
create table public.app_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(email) and length(email) <= 254),
  password_hash text not null check (password_hash like '$2%'),
  display_name  text not null check (length(display_name) between 2 and 40),
  role          text not null default 'user' check (role in ('user', 'psychologist', 'admin')),
  created_at    timestamptz not null default now()
);

-- Perfil sensorial (1 = poca sensibilidad, 5 = mucha) -------------------------
create table public.sensory_profiles (
  user_id           uuid primary key references public.app_users(id) on delete cascade,
  noise_sensitivity smallint not null check (noise_sensitivity between 1 and 5),
  light_sensitivity smallint not null check (light_sensitivity between 1 and 5),
  crowd_sensitivity smallint not null check (crowd_sensitivity between 1 and 5),
  heat_sensitivity  smallint not null check (heat_sensitivity between 1 and 5),
  route_priority    text not null default 'calm' check (route_priority in ('calm', 'fast')),
  updated_at        timestamptz not null default now()
);

-- Oasis favoritos (lugares de OpenStreetMap) ----------------------------------
create table public.favorite_havens (
  user_id    uuid not null references public.app_users(id) on delete cascade,
  osm_id     text not null check (osm_id ~ '^(node|way|relation)-[0-9]{1,15}$'),
  name       text not null check (length(name) between 1 and 120),
  lat        double precision not null check (lat between -90 and 90),
  lon        double precision not null check (lon between -180 and 180),
  created_at timestamptz not null default now(),
  primary key (user_id, osm_id)
);

-- Psicólogos (datos privados: la validación de cédula la hace el motor PHP) ---
create table public.psychologists (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid unique references public.app_users(id) on delete set null,
  display_name     text not null,
  specialty        text,
  license_number   text,                       -- cédula profesional (privada)
  license_verified boolean not null default false,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  whatsapp         text check (whatsapp ~ '^[0-9]{8,15}$'),
  online           boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- Vista pública para Realtime: solo nombre, especialidad y si está en línea ----
create table public.psychologist_presence (
  psychologist_id uuid primary key references public.psychologists(id) on delete cascade,
  display_name    text not null,
  specialty       text,
  online          boolean not null default false,
  updated_at      timestamptz not null default now()
);

-- Bitácora de accesos (sin IP ni datos del dispositivo) -----------------------
create table public.access_audit (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.app_users(id) on delete cascade,
  action     text not null check (action in ('register', 'login', 'delete')),
  created_at timestamptz not null default now()
);

create index access_audit_user_idx on public.access_audit (user_id, created_at desc);
create index favorite_havens_user_idx on public.favorite_havens (user_id, created_at desc);

-- La presencia pública se sincroniza sola desde psychologists ------------------
create or replace function public.sync_psychologist_presence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved' and new.license_verified then
    insert into public.psychologist_presence (psychologist_id, display_name, specialty, online, updated_at)
    values (new.id, new.display_name, new.specialty, new.online, now())
    on conflict (psychologist_id) do update
      set display_name = excluded.display_name,
          specialty    = excluded.specialty,
          online       = excluded.online,
          updated_at   = now();
  else
    delete from public.psychologist_presence where psychologist_id = new.id;
  end if;
  return new;
end;
$$;

create trigger psychologists_presence_sync
after insert or update on public.psychologists
for each row execute function public.sync_psychologist_presence();

-- Row Level Security ------------------------------------------------------------
alter table public.app_users             enable row level security;
alter table public.sensory_profiles      enable row level security;
alter table public.favorite_havens       enable row level security;
alter table public.psychologists         enable row level security;
alter table public.psychologist_presence enable row level security;
alter table public.access_audit          enable row level security;

-- Única política pública: leer la presencia de profesionales aprobados
create policy "Presencia pública de profesionales aprobados"
  on public.psychologist_presence
  for select
  to anon, authenticated
  using (true);

-- Defensa extra: sin permisos de escritura para los roles del navegador
revoke insert, update, delete on all tables in schema public from anon, authenticated;

-- Realtime solo para la tabla pública
alter publication supabase_realtime add table public.psychologist_presence;
