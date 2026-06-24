-- Integration connections + field maps (Planhat / AWS → Customer record).
-- Run in the Supabase SQL editor AFTER 0001 + 0002.
--
-- Security model mirrors 0001/0002: all access goes through Next.js
-- server actions using the service-role key (bypasses RLS). RLS is
-- enabled here as a deny-all backstop. Authorization (operator
-- allow-list) is enforced in the server-action layer.
--
-- Connections are ORG-LEVEL config, not per-user: any operator on the
-- allow-list can see and edit every connection (a shared Planhat token
-- belongs to the team, not one person). owner_email records the creator
-- for audit only — it does NOT gate access.
--
-- SECRETS ARE NEVER STORED HERE. `auth_env_key` holds the NAME of an
-- environment variable (e.g. PLANHAT_API_TOKEN); the secret value lives
-- only in the server env (Vercel + .env.local). The server reads
-- process.env[auth_env_key] at call time, validated against a strict
-- name allow-list so the lookup can never be pointed at our own secrets.

create table if not exists integration_connections (
  id            uuid primary key default gen_random_uuid(),
  owner_email   text not null,                          -- creator (audit only)
  name          text not null,
  provider      text not null,                          -- planhat / aws
  endpoint      text,                                   -- base URL or region descriptor
  auth_env_key  text,                                   -- ENV VAR NAME, never the secret
  status        text not null default 'draft',          -- draft / connected
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists integration_field_maps (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references integration_connections(id) on delete cascade,
  kind          text not null default 'provider',       -- provider / other / custom
  source        text not null default '',               -- provider field | free-text name | literal value
  target        text not null default '',               -- tool field path (Customer/GuideFormData)
  transform     text not null default '',               -- human note, not executed
  position      integer not null default 0,             -- render order within a connection
  created_at    timestamptz not null default now()
);
create index if not exists field_maps_connection_idx
  on integration_field_maps (connection_id, position);

-- Reuse the set_updated_at() trigger function defined in 0001.
drop trigger if exists integration_connections_set_updated_at on integration_connections;
create trigger integration_connections_set_updated_at
  before update on integration_connections
  for each row execute function set_updated_at();

-- RLS: enable + deny-all backstop (no policies → every non-service-role
-- request is denied). Server actions use the service-role key, which
-- bypasses RLS.
alter table integration_connections enable row level security;
alter table integration_field_maps  enable row level security;
