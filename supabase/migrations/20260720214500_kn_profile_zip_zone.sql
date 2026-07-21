-- Profile service / coverage zip code zone
alter table public.kn_profiles
  add column if not exists zip_zone text;
