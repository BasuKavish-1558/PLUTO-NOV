-- Profile linked 1:1 to auth.users. Supabase Auth owns email and password;
-- there is deliberately no email or password_hash column here.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) between 1 and 60),
  avatar_path   text,                       -- storage path in the private user-media bucket
  age           smallint check (age between 13 and 120),
  weight_unit   text not null default 'kg'     check (weight_unit in ('kg', 'lb')),
  height_unit   text not null default 'cm'     check (height_unit in ('cm', 'ft_in')),
  theme_pref    text not null default 'system' check (theme_pref in ('system', 'light', 'dark')),
  show_bmi      boolean not null default false,
  onboarded_at  timestamptz,                -- null until the stats step is finished
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (avatar_path is null or avatar_path like id::text || '/avatar/%')
);

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
create policy "profiles: select own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- No insert policy (the trigger below creates the row) and no delete policy
-- (the row goes away with auth.users via the delete-account Edge Function).

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
