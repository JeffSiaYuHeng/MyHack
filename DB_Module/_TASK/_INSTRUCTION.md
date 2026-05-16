# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_4__Relationship_Health_and_Cohort_Intelligence.md`
- **Block**: Block D — Cohort Overview and Narrative

## Context

Implement the next Phase 4 Block D task from `_PLAN.md`: show cohort stats, health heatmap, milestone distribution, and report action. The `/program/[cohortId]` route and `CohortOverview` shell have passed evaluation.

Latest Evaluator status: PASSED for `/program/[cohortId]`. Overview placeholders are present and ready for seeded metrics.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `components/features/cohort-overview.tsx`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `app/program/[cohortId]/page.tsx`
- `lib/verrier-analytics.ts`

---

## Dependency Note

- `components/features/cohort-overview.tsx` receives cohort, program, relationships, companies, mentors, and meetings from the route.
- `lib/verrier-analytics.ts` provides shared health band and urgency helpers.
- Keep the page route read-only; the required data already reaches the component.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not list the new component.

---

## Steps (Execution Order)

1. Read `components/features/cohort-overview.tsx`.
2. Read `app/program/[cohortId]/page.tsx` to confirm props passed into `CohortOverview`.
3. Read `lib/verrier-analytics.ts` to confirm shared health and urgency helpers.
4. Replace the health overview placeholder with real seeded stats.
5. Show total relationships, active relationships, average health score, healthy count, at-risk count, critical count, stale count, and total meeting count.
6. Add a compact health heatmap using each relationship as a cell or row with company name, health score, health label, urgency label, and days since last meeting.
7. Sort the heatmap by urgency priority, days since last meeting, health score, then company name.
8. Add milestone distribution for milestones 1 through 5 using relationship `currentMilestone` and `milestonesCompleted`.
9. Show distribution counts and simple compact bars or meters.
10. Add a non-mutating report action area with a button for generating the cohort report in a later task.
11. Keep the report action disabled or local-only in this task.
12. Keep the existing cohort header and shell structure.
13. Do not add `POST /api/ai/cohort-summary` in this task.
14. Do not render generated narrative content in this task.
15. Do not modify the dynamic route page.
16. Do not add Firestore reads or writes.
17. Do not mutate seed data.
18. Run `npm run lint`.
19. Run `npm run build`.
20. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with files changed, metrics behavior, heatmap behavior, milestone behavior, report action behavior, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify any file outside Context Scope.
- Do not modify `app/program/[cohortId]/page.tsx`.
- Do not modify `lib/verrier-analytics.ts`.
- Do not modify `lib/verrier-seed.ts`.
- Do not add API routes in this task.
- Do not add Firestore reads or writes.
- Do not mutate seeded records.
- Do not add dependencies.
- Preserve strict TypeScript with no `any`.
- Use dense operational layout, compact meters, and sparing status colors.
- Avoid nested cards and decorative backgrounds.

---

## Out of Scope (Hard Stop)

- `POST /api/ai/cohort-summary`.
- Generated narrative rendering.
- Copy/export fallback implementation.
- PDF generation dependency.
- Dynamic route page changes.
- Firestore persistence.
- Seed data mutation.
- Phase 5 deployment hardening.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] Cohort stats render from seeded props.
- [ ] Health heatmap renders relationship health and urgency.
- [ ] Milestone distribution renders milestones 1 through 5.
- [ ] Report action is present and non-mutating.
- [ ] No API route is added.
- [ ] No Firestore or seed mutation is added.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
