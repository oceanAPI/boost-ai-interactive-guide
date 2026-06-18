-- Engagement edit-access requests (self-service collaboration).
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0001.
--
-- Security model mirrors 0001: all access goes through Next.js server
-- actions using the service-role key (bypasses RLS). RLS is enabled
-- here as a deny-all backstop. Authorization (boost-domain caller,
-- owner-only approve/deny) is enforced in the server-action layer.
--
-- A boost user browsing the shared engagement library can VIEW any
-- engagement (read-only) and request EDIT access. The owner approves
-- in-app, which promotes the requester to an engagement_collaborators
-- row. Kept in its own table (not a status column on collaborators) so
-- a pending request can never accidentally grant edit via the
-- collaborator join in listMyEngagements / canEdit.

create table if not exists engagement_access_requests (
  engagement_id   uuid not null references engagements(id) on delete cascade,
  requester_email text not null,                       -- @boost.ai requester
  status          text not null default 'pending',     -- pending / approved / denied
  created_at      timestamptz not null default now(),
  primary key (engagement_id, requester_email)
);
create index if not exists access_requests_requester_idx
  on engagement_access_requests (lower(requester_email));
create index if not exists access_requests_engagement_idx
  on engagement_access_requests (engagement_id, status);

alter table engagement_access_requests enable row level security;
