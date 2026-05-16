# Task Plan

## Current Focus

Phase 5, Block A: prepare Firebase persistence and rules readiness while keeping seed fallback available.

## Current Target

Add Firebase configuration readiness helpers and safe collection write semantics so future persistence tasks can fail gracefully and preserve seed fallback behavior.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- Active block: `Block A: Firebase Persistence and Rules`

## Runtime Data Findings

- `runtime_data/` contains CSVs for every documented MVP collection: `programs`, `applications`, `cohorts`, `companies`, `mentors`, `relationships`, `meetings`, and `users`.
- Embedded JSON fields parse cleanly.
- Counts are demo-appropriate: 1 program, 1 cohort, 12 applications, 19 companies, 15 mentors, 8 relationships, 12 meetings, and 2 users.
- Two application rows reference missing company IDs: `applicant-ledgerlane` and `applicant-procurenest`.
- `programs.csv` and `cohorts.csv` intentionally link the 10 selected cohort companies while `companies.csv` also includes 9 extra source-backed test companies.

## Atomic Sub-Tasks

- [x] Normalize runtime CSV referential integrity for application company links and document selected versus extra company behavior.
- [x] Add Firebase readiness helpers and safe collection write semantics while preserving seed fallback.
- [ ] Replace critical seeded mutation boundaries with Firestore write attempts plus fallback behavior.
- [ ] Add or update Firestore rules for admin, viewer, public application, and tokenized meeting flows.
- [ ] Confirm Firebase and Gemini environment variables are documented and available.
- [ ] Run lint/build verification and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- Runtime data normalization passed evaluation and all application `companyId` values now resolve to company rows.
- `runtime_data/merge_notes.md` defines the intended import and fallback use for the runtime dataset.
- `DB_Module/_DOCS/01_DB_SCHEMA.md` defines the target Firestore collections and field contracts.
- `DB_Module/_DOCS/04_TECH_STACK.md` confirms Firebase SDK usage and the MVP collection names.
- `lib/firebase.ts` currently initializes Firebase app, Firestore, Auth, and exposes `saveResult(collectionName, data)`.
- `lib/firebase.ts` has no current app importers; `saveResult` is unused by current routes/components.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not include the current app surface; direct search confirmed no app imports of `lib/firebase.ts`.

## Out of Scope For Current Task

- Firestore rules.
- API route changes.
- UI changes.
- Firebase Admin SDK.
- New dependencies.
