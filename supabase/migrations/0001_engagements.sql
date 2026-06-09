-- Engagement persistence, collaboration & gated sharing.
-- Run in the Supabase SQL editor (or via the Supabase CLI).
--
-- Security model: all access goes through Next.js server actions using
-- the service-role key, which BYPASSES RLS. RLS is enabled here as a
-- deny-all backstop so a leaked anon/publishable key can read nothing.
-- Authorization (owner / collaborator / invitee) is enforced in the
-- server-action layer against the Auth.js session email.
--
-- Identity is keyed by lowercased email (Auth.js gives us the email;
-- no separate users table to sync).

-- ─── Tables ───────────────────────────────────────────────────────────

create table if not exists engagements (
  id            uuid primary key default gen_random_uuid(),
  owner_email   text not null,
  title         text,
  company_name  text,
  data          jsonb not null default '{}'::jsonb,   -- full GuideFormData
  sections      text[] not null default '{}',          -- selected section ids
  audience      text,                                  -- sales / customer-excellence / professional-services
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists engagements_owner_email_idx on engagements (lower(owner_email));

create table if not exists engagement_collaborators (
  engagement_id uuid not null references engagements(id) on delete cascade,
  email         text not null,                         -- @boost.ai editor
  added_by      text,
  created_at    timestamptz not null default now(),
  primary key (engagement_id, email)
);
create index if not exists collaborators_email_idx on engagement_collaborators (lower(email));

create table if not exists engagement_invites (
  id            uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  email         text not null,                         -- invited external email
  invited_by    text,
  status        text not null default 'pending',       -- pending / accepted / revoked
  created_at    timestamptz not null default now(),
  unique (engagement_id, email)
);
create index if not exists invites_email_idx on engagement_invites (lower(email));

create table if not exists engagement_comments (
  id            uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  author_email  text not null,
  author_kind   text not null default 'boost',         -- boost / external
  section_id    text,                                  -- anchor: which section/slide
  body          text not null,
  parent_id     uuid references engagement_comments(id) on delete cascade,
  resolved      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists comments_engagement_idx on engagement_comments (engagement_id, created_at);

create table if not exists engagement_edits (
  id            uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  editor_email  text not null,
  summary       text,
  created_at    timestamptz not null default now()
);
create index if not exists edits_engagement_idx on engagement_edits (engagement_id, created_at);

create table if not exists engagement_events (
  id            uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  viewer_email  text,
  event_type    text not null,                         -- nav_next / nav_prev / section_view
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists events_engagement_idx on engagement_events (engagement_id, created_at);

-- ─── updated_at trigger ───────────────────────────────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists engagements_set_updated_at on engagements;
create trigger engagements_set_updated_at
  before update on engagements
  for each row execute function set_updated_at();

-- ─── RLS: enable + deny-all backstop ──────────────────────────────────
-- No policies are created, so with RLS enabled every anon/authenticated
-- (non-service-role) request is denied by default. The service-role key
-- used by our server actions bypasses RLS entirely.

alter table engagements              enable row level security;
alter table engagement_collaborators enable row level security;
alter table engagement_invites       enable row level security;
alter table engagement_comments      enable row level security;
alter table engagement_edits         enable row level security;
alter table engagement_events        enable row level security;
