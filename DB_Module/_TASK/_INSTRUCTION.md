# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_4__Relationship_Health_and_Cohort_Intelligence.md`
- **Block**: Block D — Cohort Overview and Narrative

## Context

Implement the next Phase 4 Block D task from `_PLAN.md`: add `POST /api/ai/cohort-summary`. The cohort overview now shows seeded stats, health heatmap, milestone distribution, and report action.

Latest Evaluator status: PASSED for `components/features/cohort-overview.tsx`. Ready for AI cohort summary route.

---

## Required Local Framework Doc

- Read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `app/api/ai/cohort-summary/route.ts`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `app/api/ai/diagnose/route.ts`
- `lib/verrier-seed.ts`

---

## Dependency Note

- `app/api/ai/cohort-summary/route.ts` is a new route required by Phase 4 Block D.
- `app/api/ai/diagnose/route.ts` provides the current Gemini JSON response and deterministic fallback pattern.
- `lib/verrier-seed.ts` provides seeded cohorts, programs, relationships, companies, mentors, and meetings.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not list the new route.

---

## Steps (Execution Order)

1. Read the local Next route handler doc listed above.
2. Read `app/api/ai/diagnose/route.ts` for validation, prompt, JSON response mode, safe parsing, and fallback patterns.
3. Read `DB_Module/_DOCS/03_SERVER_ACTIONS.md` for the `POST /api/ai/cohort-summary` request and response contract.
4. Create `app/api/ai/cohort-summary/route.ts`.
5. Add `POST(req: Request)` with safe JSON parsing.
6. Return `400` for invalid JSON, a non-object body, or missing `cohortId`.
7. Resolve the cohort from `seedCohorts`.
8. Return `404` when the cohort is missing.
9. Load related seeded program, companies, mentors, relationships, and meetings.
10. Compute cohort numbers for total companies, mentors, relationships, meetings, average health score, healthy count, at-risk count, critical count, stale count, and milestone distribution.
11. Build a cohort summary prompt that includes the specific cohort numbers from step 10.
12. Require the AI response to contain `narrative`, `keyRisks`, and `recommendedActions`.
13. Call Gemini server-side with JSON response mode, following the existing route pattern.
14. Parse Gemini output safely from `unknown`.
15. Normalize `narrative` to a non-empty string.
16. Normalize `keyRisks` to a string array.
17. Normalize `recommendedActions` to a string array.
18. Add `generatedAt` as an ISO timestamp in every success response.
19. Add deterministic fallback output for Gemini errors, malformed JSON, missing fields, and empty output.
20. Ensure fallback `narrative` includes concrete cohort numbers.
21. Keep the response contract aligned with `POST /api/ai/cohort-summary` in `DB_Module/_DOCS/03_SERVER_ACTIONS.md`.
22. Do not write to Firestore or mutate seed data.
23. Do not wire the route into `CohortOverview` in this task.
24. Run `npm run lint`.
25. Run `npm run build`.
26. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with files changed, validation behavior, AI/fallback behavior, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify any file outside Context Scope.
- Do not modify `components/features/cohort-overview.tsx`.
- Do not modify `lib/verrier-seed.ts`.
- Do not modify `lib/verrier-analytics.ts`.
- Do not add Firestore reads or writes.
- Do not mutate seeded records.
- Do not add dependencies.
- Preserve strict TypeScript with no `any`.
- Keep Gemini API key usage server-side only.
- Include specific cohort numbers in the prompt and fallback narrative.

---

## Out of Scope (Hard Stop)

- Wiring the route into `CohortOverview`.
- Generated narrative rendering.
- Copy/export fallback implementation.
- PDF generation dependency.
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
- [ ] `app/api/ai/cohort-summary/route.ts` exists.
- [ ] Invalid JSON returns `400`.
- [ ] Missing `cohortId` returns `400`.
- [ ] Missing cohort returns `404`.
- [ ] Valid request returns `narrative`, `keyRisks`, `recommendedActions`, and `generatedAt`.
- [ ] Prompt includes specific cohort numbers.
- [ ] Fallback narrative includes specific cohort numbers.
- [ ] AI failure returns deterministic fallback output.
- [ ] No Firestore or seed mutation is added.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
