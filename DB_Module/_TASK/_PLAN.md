# Task Plan

## Current Focus

Phase 3, Block B: build the server-side AI mentor matching route for approved startups using the Phase 3 Block A queue and mentor-pool helpers.

## Current Target

Add the mentor matching prompt template and structured Gemini response parsing to the existing `POST /api/ai/match` route.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_3__Mentor_Matching_and_Relationship_Creation.md`
- Active block: `Block B: AI Mentor Matching Route`

## Atomic Sub-Tasks

- [x] Add `POST /api/ai/match` route boundary with request validation and seeded candidate loading.
- [ ] Add mentor matching prompt template and structured response parsing.
- [ ] Return top 3 matches with scores, reasons, and breakdowns.
- [ ] Validate returned mentor IDs against the candidate list and replace invalid output with a safe fallback.
- [x] Handle fewer than 3 mentors and route failures gracefully, run lint/build verification, and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- `app/api/ai/program-fit/route.ts` is the closest implemented structured AI route pattern.
- `lib/gemini.ts` provides a shared Gemini helper, but `program-fit` currently calls the SDK directly.
- `lib/verrier-analytics.ts` now exports `getApprovedStartupQueue` and `getMentorPool` for matching route inputs.
- `lib/types.ts` defines `Company`, `Mentor`, and `MatchBreakdown`; keep it read-only unless a later task proves a type gap.
- `DB_Module/_DOCS/03_SERVER_ACTIONS.md` already documents the target `POST /api/ai/match` request and response contract.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and should be treated as a baseline only.

## Out of Scope For This Block

- `/matching` UI.
- Match confirmation.
- Relationship creation.
- Firestore writes.
- Relationship list pages.
- Meeting analysis or relationship health work.
