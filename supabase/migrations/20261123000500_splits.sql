-- SP-1..SP-7. Presets are templates in app code; choosing one copies it into the
-- user's own split (preset_key records where it came from). One active split per user.
-- Child tables carry user_id and a composite FK to the parent so RLS is a simple
-- user_id check and a child can never point at another user's parent row.

create table public.splits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  preset_key  text check (preset_key in ('ppl', 'upper_lower', 'full_body_3', 'bro', 'arnold', 'phul')),
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, user_id)
);
create unique index splits_one_active_per_user on public.splits (user_id) where is_active;

create table public.split_days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  split_id    uuid not null,
  weekday     smallint not null check (weekday between 1 and 7),   -- ISO: 1 = Monday
  label       text check (char_length(label) <= 40),
  is_rest     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (split_id, weekday),
  unique (id, user_id),
  foreign key (split_id, user_id) references public.splits (id, user_id) on delete cascade
);

create table public.split_day_exercises (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid(),
  split_day_id     uuid not null,
  exercise_id      uuid not null references public.exercises (id) on delete cascade,
  position         smallint not null check (position >= 0),
  target_sets      smallint check (target_sets between 1 and 20),
  target_reps_min  smallint check (target_reps_min between 1 and 100),
  target_reps_max  smallint check (target_reps_max between 1 and 100),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (target_reps_min is null or target_reps_max is null or target_reps_min <= target_reps_max),
  foreign key (split_day_id, user_id) references public.split_days (id, user_id) on delete cascade
);
create index split_day_exercises_day_idx on public.split_day_exercises (split_day_id, position);

call private.enable_owner_rls('splits');
call private.enable_owner_rls('split_days');
call private.enable_owner_rls('split_day_exercises');

-- Restrictive: the referenced exercise must be visible to the user (seeded or their own).
-- The subquery runs under the caller's RLS, so another user's custom exercise is invisible.
create policy "split_day_exercises: exercise visible" on public.split_day_exercises
  as restrictive for all to authenticated
  using (true)
  with check (exists (select 1 from public.exercises e where e.id = exercise_id));

call private.attach_sync_triggers('splits');
call private.attach_sync_triggers('split_days');
call private.attach_sync_triggers('split_day_exercises');
