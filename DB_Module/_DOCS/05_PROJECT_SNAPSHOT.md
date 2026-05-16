# Project Snapshot

**Project**: Verrier
**Repository**: MyHack
**Event**: Build With AI 2026 KL
**Last Updated**: 2026-05-16
**Status**: Phase 4 shipped; awaiting next planning instruction

## Current Architecture State

### Frontend

- Next.js App Router project now contains the Verrier coordinator demo surface.
- Core routes are live for dashboard, programme setup, public application intake, applicant review, matching, relationship list/detail, meeting submission, and cohort overview.
- `components/features/product-shell.tsx` provides the coordinator shell and demo route boundary.
- `components/features/cohort-overview.tsx` renders cohort stats, health heatmap, milestone distribution, AI-generated narrative, key risks, recommended actions, and copy fallback.

### Backend and AI

- API route contracts are route-handler based under `app/api/`.
- Structured Gemini-backed routes exist for programme fit, mentor matching, meeting analysis, relationship diagnosis, and cohort summary.
- Each AI workflow keeps deterministic fallback behavior when Gemini is unavailable or output is malformed.
- `POST /api/relationships/confirm-match` creates demo relationship responses from seed-backed inputs.

### Data and Auth

- Seed-backed Verrier domain data supports the current demo flow.
- Firebase app, Firestore, and Auth are initialized through `lib/firebase.ts`.
- `lib/firebase.ts` exports `getFirebaseConfigStatus()`: checks all six `NEXT_PUBLIC_FIREBASE_*` keys and returns `{ ready: boolean, missingKeys: string[] }` without exposing values. Call this before any write to detect misconfigured environments.
- `lib/firebase.ts` exports `safeWrite(collectionName: MvpCollectionName, data)`: restricts writes to the eight documented MVP collections (`programs`, `applications`, `cohorts`, `companies`, `mentors`, `relationships`, `meetings`, `users`). Returns a structured `CollectionWriteResult` with `ok`, `collectionName`, `fallbackUsed`, and either `id` or `error`. Returns a fallback-safe failure result (not a throw) when config is incomplete or Firestore raises an exception. Seed fallback behavior is preserved: when `safeWrite` returns `ok: false`, callers may proceed with seeded or local state.
- `MvpCollectionName` type is exported for callers that need to type-check collection names at compile time.
- `saveResult(collectionName: string, data)` and named exports `db` and `auth` are preserved unchanged for backward compatibility.
- Firestore persistence is not yet wired into demo-critical API routes; those flows still rely on seed/local state.
- Auth UI is a demo boundary. Production Firebase ID-token enforcement is not implemented yet.
- Firestore rules are still scaffold-level and require collection-aware tightening before final deployment.

### Infrastructure

- Docker development and standalone production build scaffolding exist.
- GitHub Actions Cloud Run deployment workflow exists.
- Known verification commands remain `npm run lint` and `npm run build`.

## Completed Milestones

- Phase 1: Verrier Product Foundation. Completed on 2026-05-16. Product shell, domain model, seed data, dashboard foundation, Docker environment, and route boundary were established.
- Phase 2: Programme Intake and Applicant Review. Completed on 2026-05-16. Programme setup, public intake, AI fit scoring, and applicant review were established.
- Phase 3: Mentor Matching and Relationship Creation. Completed on 2026-05-16. Matching workbench, AI match route, confirmation flow, and relationship list were established.
- Phase 4: Relationship Health and Cohort Intelligence. Completed on 2026-05-16. Relationship detail, meeting analysis, diagnosis, health decay, cohort overview, and cohort narrative reporting were established.

## Current Milestone Progress

- Phase 1: 100%
- Phase 2: 100%
- Phase 3: 100%
- Phase 4: 100%
- Phase 5: 0%

## Known Debt / Residual Issues

- Firestore persistence is not wired into demo-critical flows.
- Firestore rules are not yet collection-aware.
- Authentication remains a demo placeholder.
- Seed fallback remains the operational baseline for the demo.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and should be regenerated before dependency-sensitive planning.

## Recommended Next Milestone

Wait for explicit human approval before preparing the next phase or block.
