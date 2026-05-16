# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- **Block**: Block B — Demo Resilience and Fallbacks

## Context

Harden the two public demo flows against slow or unavailable live API responses. Public application scoring/submission and mentor meeting submission must reach clear confirmation states using deterministic local fallback data when network calls fail or exceed a short timeout.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `components/features/public-application-form.tsx`
- `components/features/meeting-submission-form.tsx`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `app/api/ai/program-fit/route.ts`
- `app/api/ai/analyze-meeting/route.ts`

---

## Dependency Note

- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not list the current component graph.
- Both target files are client components and do not require local Next.js route-handler docs for this task.
- Server routes already provide fallback behavior when reachable; this task covers client-side network timeout and unreachable-route fallback.

---

## Steps (Execution Order)

1. Read `components/features/public-application-form.tsx`.
2. Read `components/features/meeting-submission-form.tsx`.
3. Read `app/api/ai/program-fit/route.ts` to confirm current fallback response shape.
4. Read `app/api/ai/analyze-meeting/route.ts` to confirm current fallback response shape.
5. Add a small client-side timeout helper or local `AbortController` pattern in each target component.
6. Use a bounded timeout for the public application fit-score request.
7. When the fit-score request times out or network fails, create a deterministic fallback `FitResult` with `status: "pending"`, zeroed score breakdown, `"Potential fit"` label, `"review"` recommendation, and a clear fallback insight.
8. Set the public application flow to the existing `pending` state after fallback so the user can still confirm submission.
9. Render visible fallback copy in the public application flow when fallback scoring is used.
10. Preserve current validation rules and existing successful server response behavior.
11. Use a bounded timeout for the meeting analysis request.
12. When the meeting analysis request times out or network fails, create a deterministic fallback `AnalysisResult` with a local meeting id, neutral signal, zero health delta, existing health score, empty action items, and a clear fallback summary.
13. Move the meeting submission flow to the existing confirmation state after fallback analysis.
14. Render visible fallback copy in the meeting confirmation when fallback analysis is used.
15. Keep existing non-OK API response handling for validation errors and server errors.
16. Do not modify API routes.
17. Do not add dependencies.
18. Preserve strict TypeScript with no `any`.
19. Run `npm run lint`.
20. Run `npm run build`.
21. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with changed files, timeout value, fallback behavior, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify files outside Context Scope.
- Do not modify API routes.
- Do not modify Firestore rules.
- Do not modify Firebase helpers.
- Do not add dependencies.
- Do not mutate seed data.
- Preserve the existing successful API response path.
- Keep fallback states visible and concise.
- Preserve dense operational layout and avoid decorative UI changes.

---

## Out of Scope (Hard Stop)

- Matching workbench resilience.
- Cohort report resilience.
- Route-handler fallback changes.
- Firestore persistence changes.
- Auth enforcement.
- Cloud Run deployment.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] Public application scoring timeout creates pending fallback result.
- [ ] Public application fallback still allows confirmation.
- [ ] Public application fallback copy is visible.
- [ ] Meeting analysis timeout creates deterministic fallback result.
- [ ] Meeting fallback reaches confirmation state.
- [ ] Meeting fallback copy is visible.
- [ ] Existing successful API response behavior is preserved.
- [ ] Existing validation and non-OK response handling is preserved.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
