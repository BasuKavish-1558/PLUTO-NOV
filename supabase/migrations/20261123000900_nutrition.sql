-- NT-1..NT-6. Generic nutrient model. For protein the user only ever sets a
-- multiplier (g per kg body weight); the gram goal is derived on the client from the
-- body weight in effect that day, so it recalculates when weight changes.
-- target is reserved for future absolute goals (e.g. calories) and must be null for protein.

create table public.nutrition_goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nutrient        text not null check (nutrient in ('protein')),
  goal_type       text check (goal_type in ('cut', 'maintain', 'bulk')),
  multiplier      numeric(4,2) check (multiplier between 0.5 and 4.0),
  target          numeric(8,2) check (target > 0),
  effective_from  date not null,           -- user's local date
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (num_nonnulls(multiplier, target) = 1),
  check (nutrient <> 'protein' or (multiplier is not null and target is null)),
  unique (user_id, nutrient, effective_from)   -- same-day edits replace that day's row
);

create table public.nutrition_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date  date not null,               -- user's local date (NT-4 resets at local midnight)
  nutrient    text not null check (nutrient in ('protein')),
  amount      numeric(7,2) not null check (amount > 0 and amount <= 1000),
  label       text check (char_length(label) <= 60),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index nutrition_entries_user_date_idx
  on public.nutrition_entries (user_id, nutrient, entry_date);

call private.enable_owner_rls('nutrition_goals');
call private.enable_owner_rls('nutrition_entries');
call private.attach_sync_triggers('nutrition_goals');
call private.attach_sync_triggers('nutrition_entries');
