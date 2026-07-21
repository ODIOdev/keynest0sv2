-- Profile gender
alter table public.kn_profiles
  add column if not exists gender text;
