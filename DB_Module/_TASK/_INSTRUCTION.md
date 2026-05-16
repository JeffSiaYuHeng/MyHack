# Task Instruction

## Strategic Anchor (MANDATORY)

- **Phase**: `PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- **Block**: Block D — Final Pitch Walkthrough Polish

## Context

The judge's first touchpoint is the browser tab title and the login page. Currently `app/layout.tsx` uses scaffold-level metadata and `app/login/page.tsx` has no product copy. A judge arriving at the demo should immediately understand what Verrier is and who it is for. This task sets the app metadata, adds product framing to the login page, and confirms the product shell nav label is judge-ready — without adding decorative treatment or placeholder marketing copy.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `app/layout.tsx`
- `app/login/page.tsx`
- `components/features/product-shell.tsx`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `DB_Module/_DOCS/00_SRS.md` (product thesis, core promise, primary persona, success criteria)
- `DB_Module/_DOCS/02_STYLE_GUIDE.md` (Morandi Tech palette, typography tokens, copy rules)

---

## Steps (Execution Order)

1. Read `app/layout.tsx` to see current metadata title and description.
2. Read `app/login/page.tsx` to see current copy and layout structure.
3. Read `components/features/product-shell.tsx` to see current nav header content.
4. Read `DB_Module/_DOCS/00_SRS.md` Product, Product Thesis, Primary Users, and Success Criteria sections.
5. Read `DB_Module/_DOCS/02_STYLE_GUIDE.md` Product UX Principles and Implementation Rules sections.
6. Update `app/layout.tsx` metadata: set `title` to `"Verrier | AI-Powered Programme Intelligence"` and `description` to a two-sentence elevator pitch derived from the SRS product thesis (what Verrier does, who it is for). Do not use placeholder text.
7. Update `app/login/page.tsx`: above the existing sign-in UI, render the Verrier product name as a headline, the core promise from the SRS ("Verrier calculates who belongs together, and when relationships are drifting, before anyone notices.") as body copy, and a one-sentence role descriptor ("Built for programme coordinators managing mentor-startup cohorts."). Use Morandi on-surface text tokens — no decorative backgrounds, gradients, or orb effects.
8. Read the current nav header in `components/features/product-shell.tsx`. If the product name displayed is generic or scaffold-level, update it to "Verrier". If it already shows "Verrier", make no change.
9. Do not add Firebase Auth sign-in logic to `app/login/page.tsx`. It remains a demo placeholder.
10. Do not add new npm packages.
11. Run `npm run lint`.
12. Run `npm run build`.
13. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with changed files, the exact copy added to the login page, verification result, and exact failure output when a command fails.

---

## Constraints & Rules

- Do not modify files outside Context Scope.
- Do not use placeholder marketing copy — use language directly from `DB_Module/_DOCS/00_SRS.md`.
- Do not add decorative gradients, orb backgrounds, or animation.
- Do not add visible instructions that explain the UI itself (style guide rule).
- Do not implement Firebase Auth sign-in — login page is a demo placeholder.
- Do not add new npm dependencies.
- Do not modify seed data, API routes, or Firestore rules.
- Use Morandi Tech design tokens (on-surface, on-surface-variant) for text color.
- Login page copy must fit within the existing page layout without restructuring the sign-in component.

---

## Out of Scope (Hard Stop)

- Dashboard copy polish (Task 2).
- Applicant review and application page polish (Task 3).
- Matching workbench and relationship detail polish (Task 4).
- Firebase Auth implementation.
- New routes or pages.
- Seed data changes.
- API route changes.
- Firestore rule changes.

---

## Quality Checklist

- [ ] Context Scope contains no more than 4 files.
- [ ] Reference Scope contains no more than 2 files.
- [ ] Reference Scope files are not in Context Scope.
- [ ] No code snippets are included.
- [ ] Out of Scope is explicit.
- [ ] `app/layout.tsx` title is `"Verrier | AI-Powered Programme Intelligence"`.
- [ ] `app/layout.tsx` description uses SRS product language, not placeholder text.
- [ ] `app/login/page.tsx` includes product name, core promise, and role descriptor above the sign-in UI.
- [ ] Login page copy uses no decorative backgrounds, gradients, or orb effects.
- [ ] `components/features/product-shell.tsx` nav shows "Verrier" as the product name.
- [ ] Firebase Auth sign-in logic was not added to the login page.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] `npm run build` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
