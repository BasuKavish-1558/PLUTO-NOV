-- BV-1..BV-3: every entry is dated and kept (never overwritten).
-- Current height = latest row with a non-null height_cm, which also gives optional history.

create table public.body_vitals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  measured_on  date not null,                 -- user's local date
  weight_kg    numeric(7,3) check (weight_kg between 20 and 400),
  height_cm    numeric(5,1) check (height_cm between 100 and 250),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (weight_kg is not null or height_cm is not null)
);
create index body_vitals_user_date_idx on public.body_vitals (user_id, measured_on desc);
create index body_vitals_user_updated_idx on public.body_vitals (user_id, updated_at);

call private.enable_owner_rls('body_vitals');
call private.attach_sync_triggers('body_vitals');
