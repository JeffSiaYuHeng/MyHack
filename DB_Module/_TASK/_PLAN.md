# Task Plan

## Current Focus

Phase 4, Block B: implement the public mentor meeting submission and AI analysis flow for relationship health updates.

## Current Target

Wire `/submit-meeting` to `POST /api/ai/analyze-meeting` and show the returned AI summary, action items, signal, watch points, and local health score update.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_4__Relationship_Health_and_Cohort_Intelligence.md`
- Active block: `Block B: Meeting Submission and AI Analysis`

## Atomic Sub-Tasks

- [x] Implement `/submit-meeting` public form with token, date, duration, and notes.
- [x] Add `POST /api/ai/analyze-meeting` or `/api/meetings/submit` route.
- [x] Add meeting analysis prompt template and structured response parsing.
- [x] Update relationship health and meeting timeline state after analysis.
- [x] Run lint/build verification and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- `components/features/relationship-detail.tsx` includes a disabled meeting upload shell from Block A.
- `components/features/meeting-submission-form.tsx` owns the public mentor submission UI and currently uses local confirmation state.
- `app/api/ai/analyze-meeting/route.ts` now provides validated meeting analysis output with deterministic fallback behavior.
- `lib/verrier-seed.ts` exports mentor meeting submission tokens, relationships, companies, mentors, and meetings.
- `DB_Module/_DOCS/03_SERVER_ACTIONS.md` documents `POST /api/ai/analyze-meeting` and the public meeting submission boundary.
- `DB_Module/_DOCS/01_DB_SCHEMA.md` defines `Meeting`, `ActionItem`, and health score update rules.
- `DB_Module/_DOCS/02_STYLE_GUIDE.md` calls for a mobile-first public meeting form.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and should be treated as a baseline only.

## Out of Scope For This Block

- Firestore writes.
- Relationship diagnosis route.
- Dashboard Attention Feed changes.
- Cohort overview or narrative work.
- PDF or report export.
