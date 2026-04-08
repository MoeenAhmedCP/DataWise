-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS (one per company/tenant)
-- ============================================================
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ORGANIZATION MEMBERS (links users to orgs)
-- ============================================================
create table org_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member',
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- ============================================================
-- METRIC DEFINITIONS (what metrics this org tracks)
-- ============================================================
create table metric_definitions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  unit text,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- ============================================================
-- METRIC DATA POINTS (time-series values per metric)
-- ============================================================
create table metric_data (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  metric_id uuid references metric_definitions(id) on delete cascade not null,
  date date not null,
  value numeric not null,
  label text,
  created_at timestamptz default now(),
  unique(metric_id, date)
);

-- ============================================================
-- ALERTS (rules that trigger when metric drops/rises)
-- ============================================================
create table alerts (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  metric_id uuid references metric_definitions(id) on delete cascade not null,
  name text not null,
  condition text not null,
  threshold numeric not null,
  threshold_type text default 'percent',
  period_days integer default 7,
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ALERT EVENTS (log of when alerts fired)
-- ============================================================
create table alert_events (
  id uuid default gen_random_uuid() primary key,
  alert_id uuid references alerts(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  metric_id uuid references metric_definitions(id) not null,
  triggered_at timestamptz default now(),
  current_value numeric,
  previous_value numeric,
  change_percent numeric,
  message text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

create or replace function get_user_org_id()
returns uuid as $$
  select org_id from org_members
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer;

alter table organizations enable row level security;
alter table org_members enable row level security;
alter table metric_definitions enable row level security;
alter table metric_data enable row level security;
alter table alerts enable row level security;
alter table alert_events enable row level security;

create policy "Users see their own org" on organizations
  for all using (id = get_user_org_id());

create policy "Users see their org members" on org_members
  for all using (org_id = get_user_org_id());

create policy "Metric definitions scoped to org" on metric_definitions
  for all using (org_id = get_user_org_id());

create policy "Metric data scoped to org" on metric_data
  for all using (org_id = get_user_org_id());

create policy "Alerts scoped to org" on alerts
  for all using (org_id = get_user_org_id());

create policy "Alert events scoped to org" on alert_events
  for all using (org_id = get_user_org_id());

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_metric_data_metric_id_date on metric_data(metric_id, date desc);
create index idx_metric_data_org_id on metric_data(org_id);
create index idx_org_members_user_id on org_members(user_id);
