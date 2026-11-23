-- EL-1..EL-6. Seeded exercises are global (user_id null, read-only for everyone).
-- Custom exercises belong to one user. Exercises referenced by a logged workout
-- cannot be deleted (FK restrict in the workouts migration); the app archives them instead.

create table public.muscle_groups (
  id          text primary key,
  name        text not null,
  sort_order  smallint not null
);

insert into public.muscle_groups (id, name, sort_order) values
  ('chest', 'Chest', 1), ('back', 'Back', 2), ('shoulders', 'Shoulders', 3),
  ('biceps', 'Biceps', 4), ('triceps', 'Triceps', 5), ('forearms', 'Forearms', 6),
  ('quads', 'Quads', 7), ('hamstrings', 'Hamstrings', 8), ('glutes', 'Glutes', 9),
  ('calves', 'Calves', 10), ('abs_core', 'Abs/Core', 11);

alter table public.muscle_groups enable row level security;
create policy "muscle_groups: read all" on public.muscle_groups
  for select to authenticated using (true);

create table public.exercises (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users (id) on delete cascade,  -- null = seeded
  slug               text unique,     -- stable key for seeded rows; preset templates use it
  name               text not null check (char_length(name) between 1 and 80),
  muscle_group_id    text not null references public.muscle_groups (id),
  secondary_muscles  text[] not null default '{}' check (
    secondary_muscles <@ array['chest','back','shoulders','biceps','triceps','forearms',
                               'quads','hamstrings','glutes','calves','abs_core']::text[]),
  equipment          text not null check (
    equipment in ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight')),
  is_custom          boolean generated always as (user_id is not null) stored,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check ((user_id is null) = (slug is not null))
);
create index exercises_muscle_idx on public.exercises (muscle_group_id);
create index exercises_user_idx on public.exercises (user_id) where user_id is not null;

alter table public.exercises enable row level security;
create policy "exercises: select seeded or own" on public.exercises
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));
create policy "exercises: insert own custom" on public.exercises
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "exercises: update own custom" on public.exercises
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "exercises: delete own custom" on public.exercises
  for delete to authenticated using (user_id = (select auth.uid()));

call private.attach_sync_triggers('exercises');

-- The ~150 seeded exercises go in a separate migration in Phase 1.
