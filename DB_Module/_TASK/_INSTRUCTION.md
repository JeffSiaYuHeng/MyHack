# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_4__Relationship_Health_and_Cohort_Intelligence.md`
- **Block**: Block B — Meeting Submission and AI Analysis

## Context

Implement the next Phase 4 Block B task from `_PLAN.md`: update relationship health and meeting timeline state after analysis. For this task, wire the public mentor meeting form to the existing analysis route and show the returned analysis in local UI state.

Latest Evaluator status: PASSED for `app/api/ai/analyze-meeting/route.ts`. The route already validates notes, returns AI summary and action items, clamps health score output, and falls back deterministically on Gemini failure.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `components/features/meeting-submission-form.tsx`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `app/api/ai/analyze-meeting/route.ts`
- `lib/verrier-seed.ts`

---

## Dependency Note

- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not list `components/features/meeting-submission-form.tsx`.
- Treat `components/features/meeting-submission-form.tsx` as the only source file for this task.
- Keep `lib/verrier-seed.ts` read-only; use existing token and relationship context already resolved by the form.
- Keep `app/api/ai/analyze-meeting/route.ts` read-only; consume its existing response contract.

---

## Steps (Execution Order)

1. Read `components/features/meeting-submission-form.tsx`.
2. Read `app/api/ai/analyze-meeting/route.ts` to confirm the request and response fields.
3. Extend the form state to track submission progress, API errors, and the analysis result.
4. Keep the existing client validation for token, date, duration, and notes.
5. On valid submit, call `POST /api/ai/analyze-meeting` with JSON body fields `relationshipId`, `date`, `durationMinutes`, `rawNotes`, and `submittedBy`.
6. Send `submittedBy` as `"mentor"`.
7. Convert the duration input to a number before sending the request.
8. On a non-OK response, show a clear inline error and keep the form available.
9. On success, store `meetingId`, `aiSummary`, `actionItems`, `signal`, `signalReason`, `healthScoreDelta`, `newHealthScore`, and `watchPoints` in local state.
10. Replace the current queued confirmation copy with the returned analysis summary.
11. Render action items with owner, task, and due date when present.
12. Render signal, signal reason, health score delta, new health score, and watch points.
13. Keep the confirmation state clear for mentors after success.
14. Do not mutate seed data, Firestore, or global relationship state.
15. Do not edit the API route in this task.
16. Run `npm run lint`.
17. Run `npm run build`.
18. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with files changed, UI behavior, API integration behavior, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify any file outside Context Scope.
- Do not modify `app/api/ai/analyze-meeting/route.ts`.
- Do not modify `lib/verrier-seed.ts`.
- Do not add Firestore reads or writes.
- Do not mutate seeded meetings or relationships.
- Do not add dependencies.
- Preserve strict TypeScript with no `any`.
- Preserve the existing token-gated public form behavior.
- Keep all relationship health and timeline updates local to the form UI for this task.

---

## Out of Scope (Hard Stop)

- API route changes.
- Firestore persistence.
- Seed data mutation.
- Relationship detail timeline mutation.
- Dashboard Attention Feed changes.
- Relationship diagnosis route.
- Cohort narrative work.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] Form calls `POST /api/ai/analyze-meeting` after client validation.
- [ ] Non-OK API responses show an inline error.
- [ ] Success state shows AI summary and action items.
- [ ] Success state shows signal, health score delta, new health score, and watch points.
- [ ] No Firestore or seed mutation is added.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
