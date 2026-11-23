-- Section 5.9: append-only event log for future gamification. Written from day one,
-- never updated or deleted by users (no update/delete policies). Removed only with the
-- account. dedupe_key makes once-per-day events (protein_goal_met) idempotent offline.

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type        text not null check (type in (
                'workout_completed', 'set_logged', 'pr_logged', 'protein_goal_met', 'photo_added')),
  payload     jsonb not null default '{}'::jsonb,
  dedupe_key  text,
  created_at  timestamptz not null,        -- device clock at the moment of the action
  received_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);
create index events_user_created_idx on public.events (user_id, created_at);

alter table public.events enable row level security;
create policy "events: select own" on public.events
  for select to authenticated using (user_id = (select auth.uid()));
create policy "events: insert own" on public.events
  for insert to authenticated with check (user_id = (select auth.uid()));
