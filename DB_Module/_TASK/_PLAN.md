# Task Plan

## Current Focus

Phase 1, Block B: replace scaffold presentation with Verrier metadata, Morandi Tech design tokens, and a reusable coordinator product shell while preserving existing shared UI primitives.

## Current Target

Update global metadata and root route copy from the MyHack scaffold to the Verrier product foundation.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_1__Verrier_Product_Foundation.md`
- Active block: `Block B: App Shell and Design Tokens`

## Atomic Sub-Tasks

- [ ] Update global metadata and root route copy from MyHack scaffold to Verrier.
- [ ] Align global design tokens in `app/globals.css` with the Morandi Tech palette from `DB_Module/_DOCS/02_STYLE_GUIDE.md`.
- [ ] Create a reusable coordinator product shell for authenticated product pages.
- [ ] Verify mobile and desktop layout behavior for the shell and root route.
- [ ] Run lint/build verification and append Coder handover details to `DB_Module/_TASK/_Hand_OverLog.md`.

## Dependency Notes

- `app/layout.tsx` owns global metadata and imports `app/globals.css`.
- `app/page.tsx` currently imports `components/ui/button.tsx`; keep `components/ui/button.tsx` read-only during the first Block B instruction.
- `components/ui/button.tsx` is listed as high-impact in `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` with 1 importer: `app/page.tsx`.
- `app/globals.css` is the global token surface for Block B design-token work.
- `lib/verrier-analytics.ts` and `lib/verrier-seed.ts` are available read-only data sources for realistic Verrier root copy if needed.

## Out of Scope For This Block

- Dashboard route implementation beyond root-route scaffold replacement.
- Programme intake forms, applicant review, matching workflows, relationship detail pages, and meeting forms.
- API routes and Gemini prompts.
- Firestore reads, writes, or security rules.
- Auth behavior beyond shell-ready visual structure.
