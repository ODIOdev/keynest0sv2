-- KeyNestOS auth foundation (kn_* tables — public.profiles already used by another app)

create extension if not exists "pgcrypto";

do $$ begin
  create type public.kn_account_type as enum ('business', 'employee', 'customer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.kn_app_role as enum (
    'platform_admin',
    'owner',
    'manager',
    'employee',
    'realtor',
    'tax_preparer',
    'assistant',
    'customer'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.kn_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  account_type public.kn_account_type,
  phone text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kn_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  logo_url text,
  branding jsonb not null default '{}'::jsonb,
  subscription_plan text,
  owner_id uuid references public.kn_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kn_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.kn_organizations (id) on delete cascade,
  user_id uuid not null references public.kn_profiles (id) on delete cascade,
  role public.kn_app_role not null default 'employee',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.kn_invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.kn_organizations (id) on delete cascade,
  email text not null,
  role public.kn_app_role not null default 'employee',
  invited_by uuid references public.kn_profiles (id) on delete set null,
  token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists kn_memberships_user_id_idx on public.kn_memberships (user_id);
create index if not exists kn_memberships_org_id_idx on public.kn_memberships (org_id);
create index if not exists kn_invitations_email_idx on public.kn_invitations (email);
create index if not exists kn_invitations_token_idx on public.kn_invitations (token);

create or replace function public.kn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kn_profiles_updated_at on public.kn_profiles;
create trigger kn_profiles_updated_at
before update on public.kn_profiles
for each row execute function public.kn_set_updated_at();

drop trigger if exists kn_organizations_updated_at on public.kn_organizations;
create trigger kn_organizations_updated_at
before update on public.kn_organizations
for each row execute function public.kn_set_updated_at();

create or replace function public.kn_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.kn_profiles (id, email, full_name, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when (new.raw_user_meta_data ->> 'account_type') in ('business', 'employee', 'customer')
        then (new.raw_user_meta_data ->> 'account_type')::public.kn_account_type
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kn on auth.users;
create trigger on_auth_user_created_kn
after insert on auth.users
for each row execute function public.kn_handle_new_user();

alter table public.kn_profiles enable row level security;
alter table public.kn_organizations enable row level security;
alter table public.kn_memberships enable row level security;
alter table public.kn_invitations enable row level security;

create or replace function public.kn_is_org_member(check_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.kn_memberships m
    where m.org_id = check_org_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.kn_has_org_role(check_org_id uuid, allowed public.kn_app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.kn_memberships m
    where m.org_id = check_org_id
      and m.user_id = auth.uid()
      and m.role = any (allowed)
  );
$$;

drop policy if exists "Users can view own kn profile" on public.kn_profiles;
create policy "Users can view own kn profile"
on public.kn_profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own kn profile" on public.kn_profiles;
create policy "Users can update own kn profile"
on public.kn_profiles for update
using (auth.uid() = id);

drop policy if exists "Members can view their kn orgs" on public.kn_organizations;
create policy "Members can view their kn orgs"
on public.kn_organizations for select
using (public.kn_is_org_member(id));

drop policy if exists "Owners can update their kn orgs" on public.kn_organizations;
create policy "Owners can update their kn orgs"
on public.kn_organizations for update
using (public.kn_has_org_role(id, array['owner', 'platform_admin']::public.kn_app_role[]));

drop policy if exists "Authenticated users can create kn orgs" on public.kn_organizations;
create policy "Authenticated users can create kn orgs"
on public.kn_organizations for insert
with check (auth.uid() = owner_id);

drop policy if exists "Members can view kn memberships" on public.kn_memberships;
create policy "Members can view kn memberships"
on public.kn_memberships for select
using (public.kn_is_org_member(org_id) or user_id = auth.uid());

drop policy if exists "Owners can manage kn memberships" on public.kn_memberships;
create policy "Owners can manage kn memberships"
on public.kn_memberships for all
using (public.kn_has_org_role(org_id, array['owner', 'manager', 'platform_admin']::public.kn_app_role[]));

drop policy if exists "Owners can create their own kn membership" on public.kn_memberships;
create policy "Owners can create their own kn membership"
on public.kn_memberships for insert
with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.kn_organizations o
    where o.id = org_id
      and o.owner_id = auth.uid()
  )
);

drop policy if exists "Users can view kn invites" on public.kn_invitations;
create policy "Users can view kn invites"
on public.kn_invitations for select
using (
  public.kn_is_org_member(org_id)
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Owners can manage kn invites" on public.kn_invitations;
create policy "Owners can manage kn invites"
on public.kn_invitations for all
using (public.kn_has_org_role(org_id, array['owner', 'manager', 'platform_admin']::public.kn_app_role[]));

-- Allow owners to insert invites once they are members
drop policy if exists "Owners can insert kn invites" on public.kn_invitations;
create policy "Owners can insert kn invites"
on public.kn_invitations for insert
with check (public.kn_has_org_role(org_id, array['owner', 'manager', 'platform_admin']::public.kn_app_role[]));
