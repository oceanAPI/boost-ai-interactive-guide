-- Per-customer manual overrides — the metadata Planhat does NOT have.
-- Run in the Supabase SQL editor AFTER 0003.
--
-- When the CS builder pulls a Planhat company, mapped fields Planhat has
-- no value for are prompted to the operator. Whatever they fill in is
-- stored here, keyed by (connection, planhat company id, target field),
-- so it round-trips on the next pull and is queryable via SQL — e.g.
--   select company_name, field_target, value
--   from integration_customer_overrides
--   where connection_id = '...';
--
-- Same security model as 0003: all access via service-role server
-- actions; RLS enabled as a deny-all backstop. No secrets stored here.

create table if not exists integration_customer_overrides (
  id                 uuid primary key default gen_random_uuid(),
  connection_id      uuid not null references integration_connections(id) on delete cascade,
  planhat_company_id text not null,                       -- Planhat _id of the company
  company_name       text,                                -- denormalised for easy SQL reads
  field_target       text not null,                       -- Customer/GuideFormData dot-path
  value              jsonb,                               -- manually-entered value
  entered_by         text,                                -- operator email (audit)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (connection_id, planhat_company_id, field_target)
);
create index if not exists overrides_company_idx
  on integration_customer_overrides (connection_id, planhat_company_id);

-- Reuse the set_updated_at() trigger function defined in 0001.
drop trigger if exists customer_overrides_set_updated_at on integration_customer_overrides;
create trigger customer_overrides_set_updated_at
  before update on integration_customer_overrides
  for each row execute function set_updated_at();

alter table integration_customer_overrides enable row level security;
