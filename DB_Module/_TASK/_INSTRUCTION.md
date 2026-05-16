# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- **Block**: Block B — Demo Resilience and Fallbacks

## Context

Document the backup demo path and fallback behavior created during Phase 5 Block B. The project docs must make it clear that the demo can continue when Gemini, Firestore, network calls, or seed data are unavailable.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md`
- `DB_Module/_DOCS/07_DATA_FLOW.md`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `DB_Module/_DOCS/LOGS/2026-05-17_Resilience_Hardening.md`
- `DB_Module/_DOCS/LOGS/2026-05-17_Resilience_Hardening_Correction.md`

---

## Dependency Note

- This is a documentation-only task.
- `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` currently states an older Phase 4 status.
- `DB_Module/_DOCS/07_DATA_FLOW.md` explains the core data flow but lacks a final demo backup path.
- The docs must reference visible fallback states for public application, meeting submission, matching, cohort report, and top-level empty states.

---

## Steps (Execution Order)

1. Read `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md`.
2. Read `DB_Module/_DOCS/07_DATA_FLOW.md`.
3. Read the two reference log files listed above.
4. Update `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` status to reflect Phase 5 Block B in progress.
5. Add a concise resilience summary to `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md`.
6. Document the 10-second timeout behavior for public application scoring, meeting analysis, matching recommendations, and cohort report generation.
7. Document visible fallback indicators for public flows, matching, and cohort reporting.
8. Document seed and empty-state guards for dashboard, matching, and relationships routes.
9. Update Known Debt or Residual Issues so unrelated lint failures from `.claude/worktrees/` are identified as external hygiene, not demo-blocking behavior.
10. Add a `Demo Backup Path` section to `DB_Module/_DOCS/07_DATA_FLOW.md`.
11. In the backup path, list the demo sequence: dashboard, public application, matching, meeting submission, cohort report.
12. For each demo step, state the live path and the fallback path.
13. Include Firestore fallback behavior for match confirmation: `persisted: false` and `persistenceMode: "local-fallback"` still keep the demo moving.
14. Include a note that seed data remains the baseline when Firebase or live writes are unavailable.
15. Do not modify source code.
16. Do not add dependencies.
17. Run a markdown grep check for the new `Demo Backup Path` heading.
18. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with changed files, documented backup path, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify files outside Context Scope.
- Do not modify source code.
- Do not modify phase files.
- Do not modify roadmap.
- Do not add dependencies.
- Do not expose Firebase or Gemini secret values.
- Keep the backup path actionable and concise.
- Avoid claiming Cloud Run deployment is verified.

---

## Out of Scope (Hard Stop)

- Source code edits.
- Cloud Run verification.
- Deployment smoke tests.
- Auth enforcement.
- Firestore rule changes.
- New fallback implementation.
- Phase 5 Block C planning.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] `05_PROJECT_SNAPSHOT.md` reflects Phase 5 Block B resilience state.
- [ ] `05_PROJECT_SNAPSHOT.md` documents timeout and visible fallback behavior.
- [ ] `05_PROJECT_SNAPSHOT.md` documents seed and empty-state guards.
- [ ] `07_DATA_FLOW.md` contains a `Demo Backup Path` section.
- [ ] Backup path covers dashboard, public application, matching, meeting submission, and cohort report.
- [ ] Firestore local fallback response behavior is documented.
- [ ] No secret values are documented.
- [ ] Markdown grep check succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
