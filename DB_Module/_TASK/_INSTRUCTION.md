# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- **Block**: Block A — Firebase Persistence and Rules

## Context

Add Firebase configuration readiness helpers and safe collection write semantics in `lib/firebase.ts`. This prepares later Firestore persistence tasks to detect missing Firebase config, restrict writes to documented MVP collections, and return fallback-safe results instead of crashing demo flows.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `lib/firebase.ts`
- `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `DB_Module/_DOCS/01_DB_SCHEMA.md`
- `DB_Module/_DOCS/04_TECH_STACK.md`

---

## Dependency Note

- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale and does not list the current app surface.
- Direct search found no app or component imports of `lib/firebase.ts`.
- Preserve existing exports `db`, `auth`, and `saveResult` for compatibility.
- This task does not involve Next.js route, page, metadata, caching, or server/client boundary changes, so no local Next.js doc read is required.

---

## Steps (Execution Order)

1. Read `lib/firebase.ts`.
2. Read `DB_Module/_DOCS/01_DB_SCHEMA.md` for the MVP collection names.
3. Read `DB_Module/_DOCS/04_TECH_STACK.md` for Firebase and environment expectations.
4. Preserve Firebase app initialization, Firestore initialization, Auth initialization, and existing named exports.
5. Add a constant list or readonly set of allowed MVP collection names: `programs`, `applications`, `cohorts`, `companies`, `mentors`, `relationships`, `meetings`, and `users`.
6. Add an exported collection-name type derived from the allowed collection list.
7. Add an exported Firebase config status helper that checks all required `NEXT_PUBLIC_FIREBASE_*` values without exposing secret values.
8. Include missing config key names in the helper result.
9. Add an exported safe collection write helper for documented MVP collections.
10. Return a structured result object from the safe write helper with `ok`, `collectionName`, `fallbackUsed`, and either `id` or `error`.
11. Make the safe write helper return a fallback-safe failure result when Firebase config is incomplete.
12. Make the safe write helper return a fallback-safe failure result when Firestore throws.
13. Keep `saveResult(collectionName, data)` backward compatible.
14. Make `saveResult` delegate to the safe write helper only when doing so preserves its existing Promise behavior.
15. Do not allow arbitrary collection names in the new safe helper.
16. Do not add Firebase Admin SDK.
17. Do not add dependencies.
18. Do not log environment values.
19. Update `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` to note Firebase readiness helper status, safe write helper status, allowed MVP collections, and seed fallback behavior.
20. Run `npm run lint`.
21. Run `npm run build`.
22. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with changed files, exported helper names, fallback behavior, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify files outside Context Scope.
- Do not modify API routes.
- Do not modify UI components.
- Do not modify runtime CSV data.
- Do not modify `firestore.rules`.
- Do not add Firestore reads.
- Do not add Firebase Admin SDK.
- Do not add dependencies.
- Preserve strict TypeScript with no `any`.
- Do not expose Firebase or Gemini secret values in code, logs, docs, or handover.
- Keep seed fallback behavior explicit.

---

## Out of Scope (Hard Stop)

- API route persistence wiring.
- Public application persistence.
- Meeting submission persistence.
- Match confirmation persistence.
- Firestore rules.
- Authentication enforcement.
- Cloud Run deployment.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] `db`, `auth`, and `saveResult` remain exported.
- [ ] Firebase config readiness helper is exported.
- [ ] Safe MVP collection write helper is exported.
- [ ] New safe helper restricts collection names to documented MVP collections.
- [ ] Missing config returns fallback-safe result.
- [ ] Firestore write failure returns fallback-safe result.
- [ ] No secret values are logged or documented.
- [ ] `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` documents helper and fallback status.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
