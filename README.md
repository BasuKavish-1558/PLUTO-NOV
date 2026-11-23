# Pluto

A gym tracker web app (installable PWA): weekly splits, workout logging with a timer, progress charts, manual PRs, a contribution-style calendar with photos, and a daily protein goal.

- Requirements: [docs/PRD.md](docs/PRD.md)
- Build plan and decisions: [docs/PLAN.md](docs/PLAN.md)
- Conventions for contributors and Claude: [CLAUDE.md](CLAUDE.md)

## Getting started

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

The app needs a Supabase project (without one it shows a setup screen):

1. Create a project at supabase.com.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon (publishable) key from Project Settings > API.
3. Link the project and apply the migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npm run db:types
   ```
4. Deploy the account-deletion function:
   ```bash
   npx supabase functions deploy delete-account
   ```
5. In Authentication > URL Configuration, set the Site URL to where the app runs (e.g. `http://localhost:5173`) and add `<site>/auth/update-password` to the redirect URLs so password-reset links work.

## Scripts

| Command             | What it does                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`       | Dev server on http://localhost:5173                                             |
| `npm run build`     | Type-check and production build, including the service worker                   |
| `npm run preview`   | Serve the build on http://localhost:4173 (use this to test install and offline) |
| `npm run typecheck` | TypeScript, strict                                                              |
| `npm run lint`      | ESLint                                                                          |
| `npm test`          | Vitest unit tests                                                               |
| `npm run db:types`  | Regenerate database types from the linked Supabase project                      |
