# Task Instruction

## Strategic Anchor (MANDATORY)
- **Phase**: `PHASE_1__Verrier_Product_Foundation.md`
- **Block**: Block B — App Shell and Design Tokens

## Context

Replace the remaining MyHack scaffold presentation with Verrier product metadata and root-route copy. This is the first Block B task and must keep the work inside global metadata and root route presentation.

---

## Context Scope (Strict)

The Coder agent is ONLY allowed to modify the following files:

- `app/layout.tsx`
- `app/page.tsx`
- `DB_Module/_TASK/_Hand_OverLog.md`

---

## Reference Scope (Read-Only)

The Coder agent may read these files for context but MUST NOT modify them:

- `components/ui/button.tsx`
- `lib/verrier-analytics.ts`
- `lib/verrier-seed.ts`
- `DB_Module/_DOCS/00_STRUCTURE.md`
- `DB_Module/_DOCS/02_STYLE_GUIDE.md`
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md`
- `DB_Module/_TASK/_PLAN.md`
- `DB_Module/_PHASES/PHASE_1__Verrier_Product_Foundation.md`

---

## Dependency Note

- `app/page.tsx` imports `components/ui/button.tsx`.
- `components/ui/button.tsx` is high-impact with 1 importer: `app/page.tsx`.
- Do not modify `components/ui/button.tsx`.
- `app/layout.tsx` imports `app/globals.css`; do not modify `app/globals.css` in this instruction.

---

## Steps (Execution Order)

1. Modify `app/layout.tsx` metadata:
   - Set title to `Verrier`
   - Set description to `AI-powered relationship management for innovation programmes`
2. Modify `app/page.tsx` to remove MyHack scaffold language:
   - Remove team-member cards.
   - Remove hackathon scaffold status.
   - Remove topic-drop waiting state.
   - Remove decorative gradient headline treatment.
3. Render a Verrier root experience using existing local data where useful:
   - Use product name `Verrier`.
   - Present active cohort context.
   - Present compact operational metrics from seed or analytics helpers.
   - Present relationship health or attention-feed preview.
4. Keep the root route operational and product-focused:
   - Use dense readable layout.
   - Use real Verrier seed data.
   - Avoid marketing hero layout.
   - Avoid decorative gradients or orb backgrounds.
5. Preserve existing shared UI primitives:
   - Keep `Button` usage only if the root route needs clear actions.
   - Do not change `components/ui/button.tsx`.
6. Run `npm run lint`.
7. Append a Coder handover entry to `DB_Module/_TASK/_Hand_OverLog.md` with:
   - files changed
   - summary of root metadata/copy changes
   - lint result
   - any exact failure output if lint fails

---

## Constraints & Rules

- Do not modify any file outside Context Scope.
- Do not modify `app/globals.css` in this instruction.
- Do not create a reusable shell component in this instruction.
- Do not add routes.
- Do not add dependencies.
- Do not add Firestore reads or writes.
- Do not call Gemini.
- Keep all displayed data deterministic.

---

## Out of Scope (Hard Stop)

- `app/globals.css`
- `components/ui/button.tsx`
- New component files.
- Dashboard route implementation.
- Programme intake forms.
- Applicant review.
- Matching workflows.
- Relationship detail pages.
- API routes.
- Firebase reads, writes, or rules.
- Gemini prompt or helper changes.
- Phase 1 Block C or Block D work.

---

## Quality Checklist

- [ ] Metadata says Verrier.
- [ ] Root page no longer presents as MyHack or topic-drop scaffold.
- [ ] Root page uses real Verrier seed or analytics data.
- [ ] Root page follows operational Morandi Tech guidance from the style guide.
- [ ] No out-of-scope files are modified.
- [ ] `npm run lint` succeeds or exact failure is logged.
- [ ] Coder handover note is appended.
