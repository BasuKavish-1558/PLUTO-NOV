-- WK-1..WK-10. Workouts are written to Dexie first and synced here.
-- ids are generated on the client (uuid v4) so offline writes are idempotent.
-- No estimated_1rm column: 1RM, volume, streaks and chart series are derived in
-- pure functions so they stay correct after edits and the formula can be swapped.

create table public.workouts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  split_day_id      uuid,
  split_day_label   text check (char_length(split_day_label) <= 40),  -- snapshot for history
  workout_date      date not null,          -- user's LOCAL date when the workout started
  started_at        timestamptz not null,
  ended_at          timestamptz,            -- null while in progress
  duration_seconds  integer check (duration_seconds between 0 and 86400),  -- active time, pauses excluded
  notes             text check (char_length(notes) <= 2000),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (id, user_id),
  check (ended_at is null or ended_at >= started_at),
  check ((ended_at is null) = (duration_seconds is null)),
  foreign key (split_day_id, user_id)
    references public.split_days (id, user_id) on delete set null (split_day_id)
);
create index workouts_user_date_idx on public.workouts (user_id, workout_date desc);
create index workouts_user_updated_idx on public.workouts (user_id, updated_at);
create unique index workouts_one_in_progress on public.workouts (user_id) where ended_at is null;

create table public.workout_exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid(),
  workout_id   uuid not null,
  exercise_id  uuid not null references public.exercises (id) on delete restrict,  -- EL-6
  position     smallint not null check (position >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, user_id),
  foreign key (workout_id, user_id) references public.workouts (id, user_id) on delete cascade
);
create index workout_exercises_workout_idx on public.workout_exercises (workout_id, position);
create index workout_exercises_exercise_idx on public.workout_exercises (user_id, exercise_id);

create table public.set_logs (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid(),
  workout_exercise_id  uuid not null,
  set_number           smallint not null check (set_number between 1 and 100),
  weight_kg            numeric(7,3) not null check (weight_kg between 0 and 1000),  -- 0 = bodyweight
  reps                 smallint not null check (reps between 1 and 1000),
  is_warmup            boolean not null default false,
  logged_at            timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  foreign key (workout_exercise_id, user_id)
    references public.workout_exercises (id, user_id) on delete cascade
);
create index set_logs_we_idx on public.set_logs (workout_exercise_id, set_number);

call private.enable_owner_rls('workouts');
call private.enable_owner_rls('workout_exercises');
call private.enable_owner_rls('set_logs');

create policy "workout_exercises: exercise visible" on public.workout_exercises
  as restrictive for all to authenticated
  using (true)
  with check (exists (select 1 from public.exercises e where e.id = exercise_id));

call private.attach_sync_triggers('workouts');
call private.attach_sync_triggers('workout_exercises');
call private.attach_sync_triggers('set_logs');
