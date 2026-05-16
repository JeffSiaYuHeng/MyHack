# Task Instruction

## Strategic Anchor (MANDATORY)
- **Phase**: `PHASE_3__Mentor_Matching_and_Relationship_Creation.md`
- **Block**: Block B — AI Mentor Matching Route

## Context

Implement the next task from `_PLAN.md`: add the mentor matching prompt template and structured response parsing to the existing `POST /api/ai/match` route. Preserve the deterministic fallback path already implemented by the prior task.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `app/api/ai/match/route.ts`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `app/api/ai/program-fit/route.ts`
- `lib/verrier-analytics.ts`
- `lib/verrier-seed.ts`
- `lib/types.ts`
- `lib/gemini.ts`
- `DB_Module/_DOCS/01_DB_SCHEMA.md`
- `DB_Module/_DOCS/03_SERVER_ACTIONS.md`
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md`
- `DB_Module/_PHASES/PHASE_3__Mentor_Matching_and_Relationship_Creation.md`

---

## Dependency Note

- `app/api/ai/match/route.ts` now owns the matching route boundary and deterministic fallback scoring.
- `app/api/ai/program-fit/route.ts` shows the current local pattern for Gemini JSON response mode, malformed JSON handling, and recoverable fallback.
- `lib/verrier-analytics.ts` provides approved startup queue and mentor pool data; keep it read-only.
- `lib/types.ts` is high-impact in the dependency graph; keep it read-only.

---

## Steps (Execution Order)

1. Read `app/api/ai/match/route.ts` and identify the existing deterministic fallback match generation.
2. Import `GoogleGenerativeAI` from `@google/generative-ai` in `app/api/ai/match/route.ts`.
3. Initialize Gemini server-side using `process.env.GEMINI_API_KEY || ""`, following the pattern in `app/api/ai/program-fit/route.ts`.
4. Add a mentor matching prompt builder inside `app/api/ai/match/route.ts`.
5. Include startup company profile, support needs, founder summary, and mentor candidates in the prompt.
6. Require Gemini to return a JSON object with a `matches` array.
7. Require each returned match to contain `mentorId`, `overallScore`, `reason`, and `breakdown`.
8. Add structured parsing helpers that accept unknown Gemini output and normalize score fields to `0` through `100`.
9. Preserve the current deterministic fallback matches as the recovery path for Gemini failure, malformed JSON, empty matches, or invalid shape.
10. Do not trust Gemini mentor names; resolve `mentorName` from the validated local mentor pool.
11. Do not yet discard invalid mentor IDs in a final validation pass unless the current task needs it to preserve fallback safety.
12. Keep the route response shape as `{ matches: [...] }`.
13. Keep all Gemini calls inside `POST`; do not expose API keys to client code.
14. Run `npm run lint`.
15. Run `npm run build`.
16. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with files changed, prompt/parsing behavior, fallback behavior, verification result, and any exact failure output.

---

## Constraints & Rules

- Do not modify any file outside Context Scope.
- Do not modify `lib/verrier-analytics.ts`.
- Do not modify `lib/types.ts`.
- Do not modify `lib/verrier-seed.ts`.
- Do not add Firestore reads or writes.
- Do not add dependencies.
- Preserve strict TypeScript with no `any`.
- Preserve the existing deterministic fallback output.
- Keep the response contract aligned with `POST /api/ai/match` in `DB_Module/_DOCS/03_SERVER_ACTIONS.md`.

---

## Out of Scope (Hard Stop)

- Final invalid mentor ID replacement policy beyond fallback safety.
- `/matching` UI.
- Match confirmation.
- Relationship creation.
- Firestore writes.
- Edits to analytics helpers or seed data.

---

## Quality Checklist

- [ ] `app/api/ai/match/route.ts` contains a mentor matching prompt builder.
- [ ] Gemini call stays server-side.
- [ ] Gemini response parsing accepts unknown input safely.
- [ ] Score fields are clamped to `0` through `100`.
- [ ] Malformed Gemini output falls back to deterministic matches.
- [ ] Route response remains `{ matches: [...] }`.
- [ ] Existing validation behavior remains intact.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
