# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- **Block**: Block A — Firebase Persistence and Rules

## Context

Replace the current broad Firestore rule set with collection-aware rules for the documented MVP collections. The rules must distinguish admin and viewer access, allow validated public application creation, allow tokenized meeting creation, and deny unknown collections.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `firestore.rules`
- `DB_Module/_DOCS/01_DB_SCHEMA.md`
- `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `DB_Module/_DOCS/03_SERVER_ACTIONS.md`
- `lib/firebase.ts`

---

## Dependency Note

- `firestore.rules` is not imported by app source code, so `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` has no runtime import guidance for this task.
- `lib/firebase.ts` uses Firebase client SDK writes, so Firestore rules apply to writes made through `safeWrite`.
- Admin-only writes can return fallback mode until Firebase Auth and ID-token enforcement are wired.
- Public create rules must stay narrow because public application and meeting flows are unauthenticated by design.

---

## Steps (Execution Order)

1. Read `firestore.rules`.
2. Read `DB_Module/_DOCS/01_DB_SCHEMA.md` Security Rules Target and collection field contracts.
3. Read `DB_Module/_DOCS/03_SERVER_ACTIONS.md` route boundary and public flow expectations.
4. Replace the broad recursive authenticated rule with explicit collection rules.
5. Add helper functions for signed-in user detection, user profile lookup, admin role check, viewer role check, required field presence, and scalar type checks where Firestore rules support them.
6. Use `users/{uid}` documents as the role source with `role` equal to `admin` or `viewer`.
7. Allow admins to read and write admin collections for their own organization where an organization field is present.
8. Allow viewers to read dashboard-relevant collections and deny viewer writes.
9. Allow public creation of `applications` only when required fields are present and status is `submitted` or `draft`.
10. Allow public creation of draft `companies` only when required company fields are present and `isMatched` is `false`.
11. Allow public creation of `meetings` only when required meeting fields are present, `submittedBy` is `mentor`, and the submitted token matches the referenced mentor token.
12. Deny public update and delete for `applications`, `companies`, and `meetings`.
13. Keep `programs`, `cohorts`, `mentors`, `relationships`, and `users` writes admin-only unless a narrower public create rule is explicitly defined.
14. Allow viewers to read `programs`, `applications`, `cohorts`, `companies`, `mentors`, `relationships`, and `meetings`.
15. Restrict `users` reads so users can read their own profile and admins can read organization users.
16. Deny all unknown collections and unmatched paths.
17. Do not leave a permissive `match /{document=**}` read/write allow rule.
18. Update `DB_Module/_DOCS/01_DB_SCHEMA.md` Security Rules Target to reflect the actual rule strategy and fallback implication for admin-only writes.
19. Update `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` so Firestore rules are no longer described as scaffold-level.
20. Do not modify app source code.
21. Do not add Firebase Admin SDK.
22. Run a local rules syntax validation command when available in the repo toolchain.
23. Run `npm run lint`.
24. Run `npm run build`.
25. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with changed files, rule categories, validation result, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify files outside Context Scope.
- Do not modify API routes.
- Do not modify UI components.
- Do not modify `lib/firebase.ts`.
- Do not add Firebase Admin SDK.
- Do not add dependencies.
- Do not expose Firebase or Gemini secret values in rules, docs, or handover.
- Keep public create rules field-validated.
- Keep seed fallback behavior explicit for admin-only writes that lack authenticated context.

---

## Out of Scope (Hard Stop)

- API route persistence wiring.
- Public application form changes.
- Meeting submission form changes.
- Match confirmation route changes.
- Firebase Auth UI.
- ID-token verification.
- Cloud Run deployment.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] Broad authenticated recursive read/write access is removed.
- [ ] Admin and viewer roles are based on `users/{uid}.role`.
- [ ] Public `applications` create is validated.
- [ ] Public draft `companies` create is validated.
- [ ] Tokenized public `meetings` create is validated against mentor token data.
- [ ] Unknown collections and unmatched paths are denied.
- [ ] `DB_Module/_DOCS/01_DB_SCHEMA.md` reflects the rule strategy.
- [ ] `DB_Module/_DOCS/05_PROJECT_SNAPSHOT.md` reflects collection-aware rules.
- [ ] Rules syntax validation succeeds or exact failure is logged.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
