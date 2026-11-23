-- CL-5, CL-6, WK-8. Up to 3 photos per LOCAL workout day across all of that day's
-- workouts. Files live in the private user-media bucket; rows store the path only.
-- Photos are immutable (no update policy). Deleting a workout deletes its photo rows;
-- the client removes the storage files first.

create table public.workout_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid(),
  workout_id    uuid not null,
  storage_path  text not null unique,
  created_at    timestamptz not null default now(),
  check (storage_path like user_id::text || '/workouts/%'),
  foreign key (workout_id, user_id) references public.workouts (id, user_id) on delete cascade
);
create index workout_photos_workout_idx on public.workout_photos (workout_id);

create or replace function private.enforce_photo_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_date date;
begin
  select w.workout_date into v_date from public.workouts w where w.id = new.workout_id;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || v_date::text, 0));
  -- Runs as the caller, so RLS limits the count to the caller's own rows.
  if (select count(*)
      from public.workout_photos p
      join public.workouts w on w.id = p.workout_id
      where p.user_id = new.user_id and w.workout_date = v_date) >= 3 then
    raise exception 'photo_cap_reached' using errcode = 'P0001',
      hint = 'A workout day can have at most 3 photos';
  end if;
  return new;
end;
$$;

create trigger enforce_photo_cap before insert on public.workout_photos
  for each row execute function private.enforce_photo_cap();

-- Moving a workout to another date must not push that date over the cap.
create or replace function private.enforce_photo_cap_on_move()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_moving integer;
begin
  select count(*) into v_moving from public.workout_photos p where p.workout_id = new.id;
  if v_moving > 0
     and (select count(*)
          from public.workout_photos p
          join public.workouts w on w.id = p.workout_id
          where p.user_id = new.user_id and w.workout_date = new.workout_date) + v_moving > 3 then
    raise exception 'photo_cap_reached' using errcode = 'P0001',
      hint = 'The target day already has too many photos';
  end if;
  return new;
end;
$$;

create trigger enforce_photo_cap_on_move
  before update of workout_date on public.workouts
  for each row when (old.workout_date is distinct from new.workout_date)
  execute function private.enforce_photo_cap_on_move();

call private.enable_owner_rls('workout_photos', allow_update => false);
call private.attach_sync_triggers('workout_photos', track_updates => false);
