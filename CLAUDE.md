# Pluto

Gym tracker PWA: weekly splits, workout logging with a timer, progress charts, manual PRs, a contribution-style calendar with photos, and a daily protein goal.

- Requirements: `docs/PRD.md` (v1.0 Final). Build plan and decided ambiguities: `docs/PLAN.md`. When they disagree, `docs/PLAN.md` wins because it records later decisions.
- Build in the PRD's phases, one phase at a time. Stop for review at the end of each phase.
- Platform: a responsive web app (installable PWA) only. Native Android/iOS apps come after the web product is finished; don't add native tooling (Capacitor, React Native, etc.).

## Stack (do not add anything else without asking)

- Vite + React + TypeScript (strict), React Router
- Tailwind CSS + shadcn/ui
- Motion (framer-motion) for animation, canvas-confetti for PR celebrations
- Recharts
- Supabase: Postgres, Auth (email + password), Storage, RLS
- Dexie (IndexedDB) for offline storage with a sync outbox
- vite-plugin-pwa
- TanStack Query + Zustand, Zod
- Vitest (unit), Playwright (a few e2e flows)

Ask before adding any dependency outside this list, including small helpers. Prefer a few lines of our own code.

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # type-check + production build (also generates the service worker)
npm run preview      # serve the production build on :4173 (test PWA/offline here)
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint .
npm run format       # prettier --write .
npm test             # vitest run
npm run test:watch   # vitest
npm run db:types     # regenerate src/data/database.types.ts from the linked Supabase project
# npm run test:e2e   # Playwright, added in Phase 1
```

Before every commit: `npm run typecheck && npm run lint && npm test`.

## Architecture rules

1. **Units.** Store weight in kg and height in cm, always. Convert only for display and input, using `src/domain/units.ts` and the profile's `weight_unit` (kg/lb) and `height_unit` (cm/ft_in).
2. **1RM.** Epley lives only in `src/domain/one-rep-max.ts` (`reps === 1` returns the weight). Nothing else computes 1RM, and it is never stored.
3. **PRs are manual.** No auto-detection anywhere. A PR is a user-created record: exercise, type (`heaviest_weight` | `most_reps`), weight, reps, optional note and photo. `logged_at`/`logged_on` come from the device clock, are never typed, and can't be edited. PRs are independent of workout edits and deletes. "Previous record it beat" is the pure function in `src/domain/pr-history.ts`. A PR logged during a workout gets that `workout_id` and shows in its summary.
4. **Derived data.** Streaks, days trained per month, and chart series (top working-set weight, volume, best e1RM per session, body weight) are pure functions in `src/domain/` computed from history, never stored. Warm-up sets are excluded from volume and charts. Streaks use the user's local date (`workout_date`); a streak ends today if today has a workout, otherwise yesterday.
5. **Offline first.** Every user write goes to Dexie first and into the outbox; the sync engine pushes to Supabase in the background and pulls changes (by `updated_at` plus `sync_tombstones`). IDs are client-generated UUIDs. The in-progress workout, including timer pause intervals, lives in Dexie so it survives a crash or closed tab.
6. **Events.** Append to the event log for `workout_completed`, `set_logged`, `pr_logged`, `protein_goal_met`, `photo_added`. Events are never updated or deleted. Do not build gamification.
7. **Nutrition.** Generic model (nutrient + amount). Protein goal = body weight × multiplier, derived per day in `src/domain/protein-goal.ts`. The user edits only the multiplier (cut 2.0 / maintain 1.6 / bulk 1.8 pre-fill it) and can never type grams. Goal history is kept via `effective_from`.
8. **Security.** RLS on every table: users only see their own rows. All images go in the private `user-media` bucket under `{uid}/…` and are read with signed URLs. Account deletion goes through the `delete-account` Edge Function and removes all rows and files.
9. **Exercises.** Exercises used in logged workouts are archived, never hard-deleted. Seeded exercises are read-only.
10. **Photos.** At most 3 per workout day (the DB enforces it). Compress client-side (canvas → webp) before upload. PR photos are separate and don't count toward the cap.
11. **Auth.** Supabase Auth owns credentials. `profiles` is linked to `auth.users`; never add email or password columns.

Tooling notes:

- TypeScript is pinned to 6.0.x because typescript-eslint doesn't support 7 yet.
- shadcn/ui components live in `src/components/ui/` and are ours to edit. Add new ones with `npx shadcn add <name>` (config in `components.json`).
- `src/data/database.types.ts` is generated; never edit it by hand. Regenerate after every migration.

Code layout: pure logic in `src/domain/` (no React, Dexie or Supabase imports; every function has Vitest tests). Data access in `src/data/` (`repos/` for entities, `sync/` for the engine). UI by feature in `src/features/<area>/`. shadcn components in `src/components/ui/`. Keep files small and single-purpose.

## Design direction

- Minimal: neutral palette, one accent colour, lots of whitespace, one font (Inter), `rounded-xl` cards, no clutter.
- Light and dark themes via CSS variables in `src/styles/globals.css`; manual toggle; preference saved to `profiles.theme_pref`.
- Motion is springy and short (150-300 ms): page transitions, animated protein ring, calendar cells that fill in, drag-to-reorder exercises (Motion `Reorder`), confetti plus a bounce on a new PR, subtle press feedback on buttons. Respect `prefers-reduced-motion` everywhere.
- Mobile first, tap targets at least 44 px. Phones: bottom nav with Home, Workout, Calendar, Progress, More (Split, Nutrition); Profile is the avatar button at the top left of every page header. md and up: sidebar with all seven.
- Home (phone and desktop) is just the month calendar marking workout days (`src/features/calendar/MonthCalendar.tsx`). No other cards on Home.
- Logging a set takes 2 taps or fewer once the exercise is open (new sets are prefilled from the previous set or last session).

## Workflow

- After each phase: type-check, lint, test, fix, commit with a clear conventional message, and list what to test manually.
- New migrations go in `supabase/migrations/` with a timestamp prefix; every new table gets RLS (`call private.enable_owner_rls('table')`) and sync triggers if it syncs.
