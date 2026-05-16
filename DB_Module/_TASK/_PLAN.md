# Task Plan

## Current Focus

Phase 4, Block D: implement cohort overview and narrative reporting for portfolio health intelligence.

## Current Target

Show cohort stats, health heatmap, milestone distribution, and report action in the cohort overview component.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_4__Relationship_Health_and_Cohort_Intelligence.md`
- Active block: `Block D: Cohort Overview and Narrative`

## Atomic Sub-Tasks

- [x] Implement `/program/[cohortId]`.
- [ ] Show cohort stats, health heatmap, milestone distribution, and report action.
- [ ] Add `POST /api/ai/cohort-summary`.
- [ ] Render generated narrative, key risks, and recommended actions.
- [ ] Run lint/build verification and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- `app/relationships/[id]/page.tsx` shows the current dynamic route pattern with promised `params`.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` confirms current dynamic segment conventions.
- `components/features/product-shell.tsx` provides the standard coordinator shell.
- `components/features/cohort-overview.tsx` now renders the cohort overview shell and receives seeded cohort context from `/program/[cohortId]`.
- `lib/verrier-seed.ts` provides seeded programs, cohorts, companies, mentors, relationships, and meetings.
- `lib/verrier-analytics.ts` provides reusable health band and urgency helpers from Block C.
- `DB_Module/_DOCS/01_DB_SCHEMA.md` defines cohort and relationship fields needed for overview metrics.
- `DB_Module/_DOCS/02_STYLE_GUIDE.md` calls for dense operational views and visible cohort risk state.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and should be treated as a baseline only.

## Out of Scope For This Block

- Firestore writes.
- PDF generation dependency.
- Phase 5 deployment hardening.
- Authentication hardening.
