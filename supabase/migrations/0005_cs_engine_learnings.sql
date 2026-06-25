-- CS decision-engine learnings — operator-curated GLOBAL suppression list.
-- Run in the Supabase SQL editor AFTER 0004.
--
-- The /cs/analytics operator (mikal@boost.ai) removes engine suggestions that
-- make no sense. Each removal stages a `suppress` row; "Run training" flips
-- staged → active. Active rows are hydrated into the client and the pure
-- suggest* functions filter them out for EVERY customer, everywhere they run.
-- One row per (kind, item_key) — the mute list is global by design.
--
--   select kind, item_key, item_label, status
--   from cs_engine_learnings where status = 'active' order by kind;
--
-- Same security model as 0003/0004: all access via service-role server
-- actions; RLS enabled as a deny-all backstop. No secrets stored here.

create table if not exists cs_engine_learnings (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('story','recommendation','agentic','chapter')),
  item_key    text not null,                                  -- story id / initiative id / chapter tag
  item_label  text,                                           -- denormalised for UI + SQL reads
  signal      text not null default 'suppress' check (signal in ('suppress')),
  status      text not null default 'staged' check (status in ('staged','active')),
  created_by  text,                                           -- operator email (audit)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (kind, item_key)
);
create index if not exists cs_engine_learnings_status_idx
  on cs_engine_learnings (status, kind);

-- Reuse the set_updated_at() trigger function defined in 0001.
drop trigger if exists cs_engine_learnings_set_updated_at on cs_engine_learnings;
create trigger cs_engine_learnings_set_updated_at
  before update on cs_engine_learnings
  for each row execute function set_updated_at();

alter table cs_engine_learnings enable row level security;
