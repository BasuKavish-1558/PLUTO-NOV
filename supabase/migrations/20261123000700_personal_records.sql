-- PR-1..PR-6. PRs are MANUAL user records, never auto-detected.
-- logged_at / logged_on come from the device clock and can never be changed.
-- A PR survives edits and deletes of the workout it was logged in (workout_id -> null).
-- "Previous record it beat" is computed in a pure client function, not stored.

create table public.personal_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise_id  uuid not null references public.exercises (id) on delete restrict,
  pr_type      text not null check (pr_type in ('heaviest_weight', 'most_reps')),
  weight_kg    numeric(7,3) not null check (weight_kg between 0 and 1000),
  reps         smallint not null check (reps between 1 and 1000),
  note         text check (char_length(note) <= 500),
  photo_path   text,
  logged_at    timestamptz not null,        -- device clock, never typed
  logged_on    date not null,               -- device local date at logged_at
  workout_id   uuid,
  created_at   timestamptz not null default now(),   -- server receipt time
  updated_at   timestamptz not null default now(),
  check (photo_path is null or photo_path like user_id::text || '/prs/%'),
  foreign key (workout_id, user_id)
    references public.workouts (id, user_id) on delete set null (workout_id)
);
create index personal_records_user_exercise_idx
  on public.personal_records (user_id, exercise_id, pr_type, logged_at);
create index personal_records_workout_idx on public.personal_records (workout_id);

create or replace function private.lock_pr_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.logged_at is distinct from old.logged_at
     or new.logged_on is distinct from old.logged_on then
    raise exception 'PR date comes from the device and cannot be edited'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger lock_pr_timestamp before update on public.personal_records
  for each row execute function private.lock_pr_timestamp();

call private.enable_owner_rls('personal_records');
create policy "personal_records: exercise visible" on public.personal_records
  as restrictive for all to authenticated
  using (true)
  with check (exists (select 1 from public.exercises e where e.id = exercise_id));

call private.attach_sync_triggers('personal_records');
