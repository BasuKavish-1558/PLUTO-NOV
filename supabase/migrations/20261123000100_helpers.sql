-- Shared helpers used by every later migration.
-- * private.enable_owner_rls: turns on RLS and adds "own rows only" policies.
-- * private.attach_sync_triggers: keeps updated_at fresh and records delete tombstones.
-- * sync_tombstones: lets other devices learn about hard deletes during pull-sync.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- updated_at is server time; the sync engine pulls rows with updated_at > cursor.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.sync_tombstones (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  table_name  text not null,
  row_id      uuid not null,
  deleted_at  timestamptz not null default now()
);
create index sync_tombstones_user_deleted_idx
  on public.sync_tombstones (user_id, deleted_at);

alter table public.sync_tombstones enable row level security;
create policy "sync_tombstones: select own" on public.sync_tombstones
  for select to authenticated
  using (user_id = (select auth.uid()));
-- No insert/update/delete policies: rows are written only by the trigger below.

create or replace function private.record_tombstone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- During account deletion auth.users is already gone; skip so the cascade succeeds.
  if old.user_id is not null
     and exists (select 1 from auth.users u where u.id = old.user_id) then
    insert into public.sync_tombstones (user_id, table_name, row_id)
    values (old.user_id, tg_table_name, old.id);
  end if;
  return old;
end;
$$;

-- RLS: users may only touch rows whose user_id is their own.
create or replace procedure private.enable_owner_rls(tbl text, allow_update boolean default true)
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', tbl);
  execute format(
    'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',
    tbl || ': select own', tbl);
  execute format(
    'create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',
    tbl || ': insert own', tbl);
  if allow_update then
    execute format(
      'create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      tbl || ': update own', tbl);
  end if;
  execute format(
    'create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))',
    tbl || ': delete own', tbl);
end;
$$;

create or replace procedure private.attach_sync_triggers(tbl text, track_updates boolean default true)
language plpgsql
as $$
begin
  if track_updates then
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      tbl);
  end if;
  execute format(
    'create trigger record_tombstone after delete on public.%I for each row execute function private.record_tombstone()',
    tbl);
end;
$$;
