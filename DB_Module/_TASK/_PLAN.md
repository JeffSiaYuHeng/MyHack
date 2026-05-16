# Task Plan

## Current Focus

Phase 5, Block D: polish the final pitch walkthrough so judges can understand the product problem in 30 seconds, see two clear AI moments, and follow the relationship health and cohort narrative close.

## Current Target

Polish app metadata, login page, and product shell branding to establish clear product identity and problem framing at the demo entry point.

## Strategic Source

- Roadmap: `DB_Module/_PHASES/00_ROADMAP.md`
- Phase file: `DB_Module/_PHASES/PHASE_5__Demo_Hardening_and_Deployment_Readiness.md`
- Active block: `Block D: Final Pitch Walkthrough Polish`

## Block C Completion Notes

- Production build verified: `npm run build` passes (19 routes, TypeScript clean).
- `deploy.yml` updated with all 6 `NEXT_PUBLIC_FIREBASE_*` env var secret references alongside `GEMINI_API_KEY`.
- `.env.example` restored with all 7 required keys and placeholder values.
- Runtime env gaps are documented; seed fallback remains the operational baseline when Firebase is unavailable in production.

## Judge Success Criteria (from SRS)

1. Judge can understand the product problem in 30 seconds.
2. Judge can see AI doing something a spreadsheet cannot.
3. Judge believes this could work at scale.

## 4-Step Demo Path

1. **Dashboard** — command center with metric row and AI Attention Feed.
2. **Applicant scoring** — AI programme-fit scoring with explanation and recommendation.
3. **Mentor matching** — AI top-3 match ranking with breakdown scores and reasoning.
4. **Meeting health / cohort report** — HealthScore timeline, AI diagnosis, and generated management narrative.

## Atomic Sub-Tasks

- [ ] Polish app metadata, login page, and product shell to frame the product problem for judges in 30 seconds.
- [ ] Polish dashboard command center copy and stat labels to make the AI Attention Feed scannable at a glance.
- [ ] Polish applicant review pool and public application page to highlight the AI fit scoring moment.
- [ ] Polish matching workbench and relationship detail to highlight the AI matching and health diagnosis moments.
- [ ] Update `05_PROJECT_SNAPSHOT.md` with final shipped state and append final demo instructions to `_Hand_OverLog.md`.

## Dependency Notes

- `app/layout.tsx` sets the browser tab title and `<meta>` description used in all link previews.
- `app/login/page.tsx` is the first screen judges see; it is currently a demo placeholder with no product copy.
- `components/features/product-shell.tsx` wraps every coordinator route and frames the product identity.
- `app/page.tsx` currently redirects to `/dashboard`; if it renders no user-visible content, metadata is the only change needed.
- SRS Product Thesis: "Verrier calculates who belongs together, and when relationships are drifting, before anyone notices." This is the core promise for all copy.
- SRS problem framing: "Innovation programmes currently manage relationships through spreadsheets, forms, WhatsApp groups, and memory."
- Style Guide: no decorative gradients, no visible UI instructions, use actual product language, Inter typography, Morandi Tech palette.
- `DB_Module/_DOCS/06_DEPENDENCY_GRAPH.md` is stale; direct inspection confirmed component structure.

## Out of Scope For Current Block

- Firebase Auth sign-in logic (login page remains a demo placeholder).
- New npm dependencies.
- New API routes.
- Firestore rule changes.
- Seed data changes.
- Phase 6 planning.
