-- PRD Software PostgreSQL foundation schema.
-- Tenant isolation is enforced by tenant_id on every business table and must be
-- combined with authenticated server-side authorization/RLS policies.

create extension if not exists pgcrypto;

create table if not exists workspace_tenant (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists workspace_snapshot (
  tenant_id uuid primary key references workspace_tenant(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  version text not null default '1',
  updated_at timestamptz not null default now()
);

create table if not exists crm_record (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  kind text not null,
  name text not null,
  detail text not null default '',
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, kind, name)
);

create index if not exists crm_record_tenant_kind_idx on crm_record (tenant_id, kind);
create index if not exists crm_record_tenant_status_idx on crm_record (tenant_id, status);

create table if not exists crm_portal_share (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  record_id uuid not null references crm_record(id) on delete cascade,
  audience text not null,
  access text not null default 'Read only' check (access = 'Read only'),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists crm_campaign_member (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  campaign_id uuid not null references crm_record(id) on delete cascade,
  subject text not null,
  status text not null default 'Targeted',
  source text,
  created_at timestamptz not null default now()
);

create table if not exists workspace_permission (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  subject text not null,
  resource text not null,
  can_read boolean not null default true,
  can_edit boolean not null default false,
  unique (tenant_id, subject, resource)
);

create table if not exists workspace_approval (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  record_id uuid not null references crm_record(id) on delete cascade,
  record_type text not null,
  requested_action text not null,
  status text not null default 'Pending',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists audit_event (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  actor_id text not null,
  action text not null,
  resource text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists crm_automation_rule (
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  rule_id text not null,
  name text not null,
  event_type text not null,
  rule jsonb not null,
  active boolean not null default true,
  priority integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, rule_id)
);

create table if not exists crm_automation_execution (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references workspace_tenant(id) on delete cascade,
  rule_id text not null,
  event_type text not null,
  record_id text not null,
  matched boolean not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists crm_automation_execution_tenant_record_idx on crm_automation_execution (tenant_id, record_id, created_at desc);
