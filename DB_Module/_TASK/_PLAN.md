# Task Plan

## Current Focus

Phase 5, Block B: harden the final demo against slow Gemini, failed Firestore writes, empty data, and missing live services.

## Current Target

Document the backup demo path and fallback behavior for Phase 5 Block B resilience.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- Active block: `Block B: Demo Resilience and Fallbacks`

## Block A Completion Notes

- Runtime CSV data is normalized and import-ready.
- Firebase readiness helpers and safe MVP collection writes are available in `lib/firebase.ts`.
- Match confirmation attempts Firestore persistence and falls back to a local response when Firebase is unavailable.
- Firestore rules are collection-aware and narrower than broad authenticated access.
- Environment variables were confirmed and documented during Block A evaluation.

## Atomic Sub-Tasks

- [x] Add timeout handling and deterministic fallback confirmation states to public application and meeting submission flows.
- [x] Add timeout, empty, and fallback states to matching and cohort report demo flows.
- [x] Add missing-seed and empty-state guards to demo-critical pages and components.
- [ ] Document the backup demo path and fallback behavior in project docs and handover notes.
- [ ] Run lint/build verification and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- `components/features/public-application-form.tsx` calls `POST /api/ai/program-fit` and currently enters an error state on network failure.
- `components/features/meeting-submission-form.tsx` calls `POST /api/ai/analyze-meeting` and currently enters an error state on network failure.
- Both public flows are pitch-critical and should support a deterministic local fallback when live API/Gemini calls fail or time out.
- `app/api/ai/program-fit/route.ts` and `app/api/ai/analyze-meeting/route.ts` already provide server-side fallback behavior when the route is reachable.
- Public application and meeting submission timeout/fallback states passed evaluation.
- `components/features/matching-workbench.tsx` calls `POST /api/ai/match` and currently shows an error with manual selection when matching fails.
- `components/features/cohort-overview.tsx` calls `POST /api/ai/cohort-summary` and currently shows an error state when the report call fails.
- `app/api/ai/match/route.ts` and `app/api/ai/cohort-summary/route.ts` already provide deterministic server fallback behavior when reachable.
- Matching and cohort report timeout/fallback logic was implemented, but the Evaluator failed the task because visible fallback copy is missing from both components.
- Matching and cohort report fallback indicators passed re-audit.
- `app/dashboard/page.tsx`, `app/matching/page.tsx`, and `app/relationships/page.tsx` assume `seedPrograms[0]` and `seedCohorts[0]` exist.
- `components/features/dashboard-command-center.tsx` maps attention feed and recent meetings without local empty-state messaging.
- Top-level dashboard, matching, and relationships seed guards passed evaluation.
- `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` still reports Phase 4 shipped and should record the current Phase 5 Block B resilience state.
- `DB_Module/_DOCS/07_DATA_FLOW.md` describes data movement but does not yet summarize the fallback demo path.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not include the current component graph; direct file inspection confirmed the relevant components.

## Out of Scope For Current Task

- API route changes.
- Firestore rules.
- Firebase helper changes.
- Public application resilience.
- Meeting submission resilience.
- Fallback scoring/report generation rewrites.
- Dynamic relationship and cohort detail page guards.
- Source code changes.
- Cloud Run deployment.
