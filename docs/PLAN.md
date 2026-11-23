# Pluto build plan (Step 1)

Based on the PRD v1.0 (Final), November 23, 2026. Nothing in here is built yet. Once approved, this file moves to `docs/PLAN.md` in the repo, the SQL goes to `supabase/migrations/`, and `CLAUDE.md` goes to the repo root.

---

## (a) Ambiguities and contradictions

Each item has a recommended resolution. Reply with the numbers you want changed; the rest I'll treat as approved.

### The six you suspected

**1. "Sign in" in onboarding vs "create an account" in P-1.**
The flow in §4 and P-1 is account creation; §6 just uses the wrong verb. Recommend one auth screen that opens on **Create account**, with a "Already have an account? Sign in" switch and a "Forgot password" link (Supabase gives this for free; the PRD doesn't mention it, but without it a forgotten password locks the user out). Onboarding is then: Create account (email + password) → Profile (name, optional photo) → Stats (age, weight, height) → Home. The profile photo is optional with an initials avatar, so onboarding stays fast. A returning user who signs in with an unfinished onboarding (`profiles.onboarded_at` is null) resumes where they stopped. Supabase email confirmation: keep it on, and show a "check your inbox" screen when sign-up returns no session.

**2. Seven nav items vs bottom navigation.**
§6's own fallback (Nutrition and Profile under More) still gives six tabs. Recommend **five tabs on phones: Home, Workout, Calendar, Progress, More**. More holds **Split, Nutrition, Profile**. Reasoning: Split is set up once and rarely touched; protein is logged from the Home ring (tap it to quick-add), so Nutrition doesn't need its own tab; Profile is also reachable from the avatar in the Home header. Tablet and desktop (md and up) show a sidebar with all seven. While a workout is in progress, a slim "resume" bar with the running timer sits above the bottom nav on every screen.

**3. WK-5 previous performance: Phase 1 logging, but listed under Phase 2.**
Recommend building it in **Phase 1**. It's one local query, it's what makes the 2-tap target reachable (a new set is prefilled from the previous set, or from last session), and logging without it is noticeably worse. Phase 2 keeps the charts and PRs.

**4. Does a streak survive if today's workout isn't done yet?**
Yes. The current streak is the run of consecutive local dates with a workout, ending **today if today has one, otherwise yesterday**. It only drops to 0 once a full local day passes with no workout. If the streak is alive but today is empty, the Home card says "Train today to keep your N-day streak". Note the PRD's literal rule (decision #21, "consecutive days") means a planned rest day breaks the streak. I'll follow the PRD for v1 and keep the rule in one pure function so a "split rest days don't break it" option can be added with gamification.

**5. "Previous record it beat" for most-reps-at-a-given-weight.**
Computed at read time by one pure function (so edits and deletes of PRs stay correct), over PRs of the same exercise and type, ordered by `logged_at`:
- *Heaviest weight:* previous = the heaviest earlier entry (ties broken by more reps, then most recent).
- *Most reps at a weight:* previous = the earlier entry **at the same weight** with the most reps. Weights match after rounding to 0.1 kg, so 225 lb (102.058 kg) entered twice matches itself.
- No earlier entry → "First record".
- PRs are manual, so a user can log one that doesn't beat the old best. The form shows a soft warning ("Your best is 100 kg × 3") but still lets them save; the list then labels it "matches" or "below previous best" instead of "beat".

**6. PR photos vs private storage and the 3-photo cap.**
PR photos go in the **same private bucket** (`{uid}/prs/{pr_id}.webp`), one photo per PR, same client-side compression, read through signed URLs. They **don't count toward the 3-per-day cap**: that cap belongs to calendar day photos (CL-5), and PRs are independent of workouts (PR-6). In the calendar day log they appear in the PR section, not in the day's photo gallery. Profile pictures use the same bucket at `{uid}/avatar/`.

### Others I found

**7. "3 photos per workout day" vs photos attached to a workout.** Photos belong to a workout (WK-8), and the cap is counted per local day across all that day's workouts (CL-5). A day with no workout can't have photos, so shading keeps its meaning. Deleting a workout deletes its photos (the confirm dialog says so). The database enforces the cap, including when a workout's date is edited.

**8. More than one workout in a day.** Allowed. The calendar day log lists them all; shading, streaks and counts work per day.

**9. "Monthly workout count".** Recommend counting **days trained this month**, matching the binary calendar ("12 days this month"). Two workouts on one day count once.

**10. `SetLog.estimated_1rm` is a stored column.** Storing it conflicts with "formula is swappable" and "derived data". Dropped. 1RM is computed when charts are built.

**11. `NutritionGoal.target` is stored.** A stored gram value goes stale when body weight changes (NT-5). For protein, only the multiplier is stored; the daily goal is derived from the body weight in effect that day. `target` stays as a nullable column for future absolute goals like calories, and the database refuses a protein goal with a target.

**12. Epley as written gives weight × 1.033 for one rep, but the PRD says a single equals the weight.** The function special-cases `reps === 1`.

**13. Unit preference.** "kg/lb and cm/ft-in" reads like two settings, and kg with ft-in is a common mix. Recommend two independent prefs: `weight_unit` (kg/lb) and `height_unit` (cm/ft_in).

**14. Workout duration with pause/resume.** `duration_seconds` is active time with pauses excluded; `started_at` and `ended_at` are wall-clock. Editing a past workout can change its duration and date.

**15. PR "created_at from the device".** Stored as `logged_at` (device clock) plus `logged_on` (device local date), because an offline PR syncs later and server time would be wrong. A trigger blocks any edit of either, so "never typed" holds even when editing.

**16. Presets.** The PRD lists 6 (PPL, Upper/Lower, Full Body 3-day, Bro, Arnold, PHUL), which satisfies "at least 5". Presets live as templates in code, keyed by exercise slugs. Picking one **copies** it into the user's own split, so edits never touch the template. That replaces `Split.is_preset` with `preset_key` (where it came from). Target reps become `target_reps_min/max` so presets can say "8-12".

**17. Offline scope.** Rule 5 covers workout logging. Recommend that **every user write** (workouts, sets, PRs, protein entries, body weight, splits, events) goes through the same Dexie-first outbox. One code path instead of two, and the gym-with-no-signal case covers protein shakes too. Only sign-up and sign-in need the network.

**18. Archived exercises.** Only custom exercises can be archived or deleted (seeded ones are read-only). Deleting a custom exercise hard-deletes it if it was never logged, otherwise archives it. Archived exercises disappear from the library and pickers but stay visible in history and existing splits (with an "archived" tag).

**19. Bodyweight exercises.** Weight 0 makes weight/volume/1RM charts flat. Recommend charting max reps per session for exercises with `equipment = bodyweight` (Phase 2; tell me if you'd rather leave it out).

**20. Theme before sign-in.** `theme_pref` is `system | light | dark` (default system, manual toggle picks light or dark). Before sign-in it lives in localStorage; after sign-in the profile value wins and changes sync to it.

---

## (b) Folder structure

```
pluto/
├─ CLAUDE.md
├─ docs/
│  ├─ PRD.md                 # PRD converted from the PDF
│  └─ PLAN.md                # this file
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/            # timestamped SQL, see (c)
│  └─ functions/
│     └─ delete-account/     # Edge Function: wipe storage prefix, delete auth user
├─ public/                   # PWA icons, favicon
├─ e2e/                      # Playwright specs (a few flows only)
├─ src/
│  ├─ main.tsx
│  ├─ app/                   # router, providers, AppShell, BottomNav, Sidebar, route guards
│  ├─ components/
│  │  ├─ ui/                 # shadcn/ui generated components (not edited by hand much)
│  │  └─ …                   # shared: ProgressRing, NumberStepper, PageTransition, EmptyState
│  ├─ domain/                # PURE functions, no React/Dexie/Supabase imports, all Vitest-tested
│  │  ├─ local-date.ts       # LocalDate type, today(), weekday(), addDays()
│  │  ├─ units.ts            # kg<->lb, cm<->ft-in, display formatting
│  │  ├─ one-rep-max.ts      # Epley, the only place the formula lives
│  │  ├─ sets.ts             # working sets, volume, top set
│  │  ├─ streak.ts           # current/longest streak, days trained per month
│  │  ├─ chart-series.ts     # per-session series + body weight series, range filter
│  │  ├─ pr-history.ts       # "previous record it beat"
│  │  ├─ protein-goal.ts     # goal for a date from weight history + goal history
│  │  ├─ workout-timer.ts    # active duration from start + pause intervals
│  │  └─ workout-summary.ts
│  ├─ data/
│  │  ├─ supabase.ts         # client
│  │  ├─ database.types.ts   # generated by `supabase gen types`
│  │  ├─ db.ts               # Dexie schema (mirrors synced tables + outbox + meta)
│  │  ├─ sync/               # outbox, push, pull (updated_at cursor + tombstones), online watcher
│  │  └─ repos/              # one file per entity: local writes enqueue to the outbox
│  ├─ features/              # one folder per area: components/, hooks/, schema.ts (Zod), store.ts
│  │  ├─ auth/  onboarding/  profile/  body-vitals/
│  │  ├─ exercises/  splits/  workout/  calendar/  photos/
│  │  └─ nutrition/  progress/  prs/
│  ├─ lib/                   # cn(), image-compress (canvas → webp), events, motion presets
│  ├─ styles/globals.css     # design tokens (CSS variables) for light and dark
│  └─ test/                  # Vitest setup, factories
├─ index.html  vite.config.ts  tsconfig*.json  eslint.config.js  playwright.config.ts
```

Data flow: UI → feature hook → `repos/*` writes to Dexie and appends to the outbox → sync engine pushes to Supabase when online and pulls changes back. TanStack Query reads from the repos and is invalidated after local writes and after each sync. Zustand holds UI-only state (active workout screen, timer display, theme). The in-progress workout is crash-safe by construction: every set is a Dexie write the moment it's logged, and timer state (start, pause intervals) is in Dexie too.

---

## (c) Supabase schema

The migrations are in [`supabase/migrations/`](supabase/migrations/), 11 files. I applied them to a local Postgres 16 with stubbed `auth` and `storage` schemas and checked the behavior: one user can't read another's rows, can't attach a child row to another user's workout, can't use another user's custom exercise, can't change a PR's date, can't add a 4th photo to a day (or move a workout onto a full day), can't set a gram target for protein, can't update events; deleting a workout keeps its PR (workout link set to null); deleting the auth user removes every row.

| File | Contents |
|---|---|
| `…0100_helpers` | `private` schema, `updated_at` trigger, `sync_tombstones` + delete trigger, helper procedures that apply "own rows only" RLS |
| `…0200_profiles` | `profiles` linked to `auth.users`, auto-created on sign-up; no email or password columns |
| `…0300_body_vitals` | dated weight/height entries (history kept) |
| `…0400_exercise_library` | `muscle_groups` (11, seeded), `exercises` (seeded = global read-only, custom = per user, `archived_at`) |
| `…0500_splits` | `splits` (one active per user), `split_days`, `split_day_exercises` |
| `…0600_workouts` | `workouts` (local `workout_date`, one in progress per user), `workout_exercises` (exercise FK `restrict`), `set_logs` |
| `…0700_personal_records` | manual PRs, device timestamp locked, survives workout delete |
| `…0800_workout_photos` | photo rows (path only), 3-per-day cap enforced in the DB |
| `…0900_nutrition` | generic `nutrition_goals` (`effective_from` history) and `nutrition_entries` |
| `…1000_events` | append-only event log with `dedupe_key` |
| `…1100_storage` | private `user-media` bucket (2 MB, webp/jpeg), per-user folder policies |

Design choices worth knowing:
- Weights are `numeric(7,3)` kg and heights `numeric(5,1)` cm, so lb values round-trip exactly.
- Every child table carries `user_id` with a composite FK `(parent_id, user_id)`. RLS is then one indexed check per table, and the database itself guarantees a child belongs to the same user as its parent.
- IDs are UUIDs generated on the client, so replaying the offline outbox is idempotent.
- Hard deletes write a tombstone, so a second device learns about deletes on its next pull.
- Account deletion (P-5) is an Edge Function using the service role: remove `{uid}/` from storage, then `auth.admin.deleteUser`. Everything cascades from `auth.users`. Supabase blocks deleting storage files from SQL, which is why it can't be a plain trigger.
- The ~150 seeded exercises are a separate migration written in Phase 1.

---

## (d) Phase-by-phase plan

After every phase: `npm run typecheck`, `npm run lint`, `npm test` (and `npm run test:e2e` where a flow exists), fix, commit, then tell you what to test by hand. I stop for your review at the end of each phase.

### Phase 0: Scaffold (stop for review)
1. `chore: scaffold Vite + React + TS strict` with ESLint, Vitest, scripts, `.env.example`, Zod-validated env.
2. `feat(ui): Tailwind, shadcn/ui and design tokens` with Inter, light/dark CSS variables, one accent, ThemeProvider and toggle (localStorage for now), reduced-motion helper.
3. `feat(app): routing shell` with AppShell, bottom nav (5 tabs + More sheet) on phones, sidebar on md+, placeholder pages, animated page transitions.
4. `feat(pwa): installable PWA` with vite-plugin-pwa manifest, icons, app-shell precache, update prompt.
5. `feat(data): Supabase client, Dexie skeleton and migrations` with the SQL from (c) and generated types.
6. `docs: CLAUDE.md, PRD and plan`.

### Phase 1: MVP
1. `feat(domain): local dates and unit conversion` (+ tests).
2. `feat(auth): create account, sign in, reset password` with a persisted session and route guards.
3. `feat(onboarding): profile and body stats` with an avatar upload (canvas compression to webp) and unit-aware inputs.
4. `feat(profile): edit profile, units, theme sync, sign out, delete account` (+ Edge Function).
5. `feat(sync): Dexie outbox and background sync` covering push, pull with tombstones, retries and a dead-letter list with a toast on server rejection (+ tests).
6. `feat(body-vitals): weight history, height, BMI toggle`.
7. `feat(exercises): seeded library, browse/search/filter, custom exercises, archive on delete` (seed migration).
8. `feat(splits): presets, custom builder, drag-to-reorder, active split` with Home showing today's workout.
9. `feat(workout): logging with timer` covering start from split or ad hoc, pause/resume, 2-tap set logging with prefill, warm-up flag, previous performance (WK-5), add/remove exercises mid-workout, finish summary, events (+ timer/summary tests).
10. `feat(workout): history, edit and delete past workouts`.
11. `feat(calendar): month grid, streak and days-trained` with animated cell fill, day log sheet (+ streak tests covering today/yesterday, edits, deletes, and local-midnight edge cases).
12. `feat(photos): day photos with compression, 3-per-day cap, gallery, delete`.
13. `feat(nutrition): protein goal, quick add, progress ring, history` with goal-type prefill, multiplier only, `effective_from` history, and a once-per-day goal-met event (+ goal tests).
14. `test(e2e): sign up → onboarding → home; log a workout offline then sync; quick-add protein`.

The Progress tab shows body weight history and an empty state for charts until Phase 2.

### Phase 2: Progress
1. `feat(domain): 1RM, volume and chart series` (warm-ups excluded, per-session aggregation, range filter, + tests).
2. `feat(progress): exercise charts and body weight chart` with Recharts, an exercise picker, and 1M/3M/6M/1Y/All.
3. `feat(domain): PR history (previous record beaten)` (+ tests for both PR types, ties, edits, deletes).
4. `feat(prs): manual PR logging and PR list` from a workout or standalone, with an optional note and photo, confetti and bounce, edit/delete, and display in the workout summary and calendar day log.
5. `test(e2e): log a PR mid-workout and see it in the summary`.

### Phase 3: Engagement
Not planned for building now. The event log, streak functions and generic nutrition model from Phases 1 and 2 are the groundwork.

---

## Dependencies that need your OK

The stack you listed, plus what shadcn/ui installs by itself (Radix primitives, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`). Beyond that, I'd like to add:

| Package | Why | If you say no |
|---|---|---|
| ESLint + `typescript-eslint` + React Hooks/Refresh plugins (dev) | the `lint` step you asked for; ships with the Vite template | no lint step |
| Prettier (dev) | consistent formatting | rely on ESLint only |
| Supabase CLI (dev) | run migrations locally, generate DB types | apply SQL by hand in the dashboard, hand-written types |
| `fake-indexeddb` (dev) | test the Dexie outbox and sync in Vitest | sync logic gets no unit tests |
| `@fontsource-variable/inter` | self-hosted font so it works offline | Google Fonts, cached by the service worker after first load |

Things I'm deliberately **not** adding: date-fns (small local-date helpers instead), dnd-kit (Motion's `Reorder` handles drag-to-reorder), react-hook-form (Zod + controlled inputs), an image-compression library (about 40 lines of canvas code), next-themes (a tiny own provider), dexie-react-hooks (TanStack Query over the repos).

## What I need from you before Phase 0
1. Approval of (a), with any numbers you want changed, and of the dependency table.
2. A GitHub repo added in Project settings (resources section), so I can commit.
3. A Supabase project when we reach Phase 1 (its URL and anon key go in `.env.local`; Phase 0 runs without one).
