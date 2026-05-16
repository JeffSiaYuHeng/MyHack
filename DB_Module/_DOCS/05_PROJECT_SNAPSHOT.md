# Project Snapshot

**Project**: Verrier
**Repository**: MyHack
**Event**: Build With AI 2026 KL
**Last Updated**: 2026-05-17
**Status**: Interaction polish complete — AI calls are explicit user actions, Programme CRUD live, Dashboard redesigned

---

## Current Architecture State

### Frontend

- Next.js App Router project contains the full Verrier coordinator demo surface.
- All core routes are live: dashboard, programme list, programme detail, programme setup wizard, public application intake, applicant review, matching, relationship list/detail, meeting submission, and cohort overview.
- `components/features/product-shell.tsx` provides the coordinator shell. Nav "Programmes" link now routes to `/programs` (list) instead of hardcoded applicants page. "Demo coordinator" badge removed. Cohort pill has live green pulse dot.
- `components/features/dashboard-command-center.tsx` fully redesigned as an AI operations platform: two-group stat bar with divider, left accent bars on attention cards, health score progress bars, ✦ AI badges, signal pill badges on meeting cards, loading skeletons, and critical count pulse animation.
- `components/features/matching-workbench.tsx` — AI mentor ranking is now button-driven through `Generate AI matches`, with animated loading visualization, staged matching labels, toast feedback, and deterministic fallback display.
- `components/features/relationship-detail.tsx` — Log Meeting form fully wired to `POST /api/ai/analyze-meeting`. Fields enabled, 50-char validation, loading state, toast feedback, inline AI result display (summary, signal badge, health delta, action items, watch points). Health score updates live in header.
- `components/features/relationship-detail.tsx` — AI Diagnosis panel wired to `POST /api/ai/diagnose`. "Refresh Diagnosis" button with spinner and toast feedback. Diagnosis state seeded from static data, refreshable. Recommendation line rendered below watch points.
- `components/features/cohort-overview.tsx` — AI report generation and copy actions now use toast feedback; fallback report mode is visible.
- `app/layout.tsx` — Global `react-hot-toast` presenter styled to match Verrier surfaces, borders, icon colors, and top-right operational placement.
- `app/globals.css` — Shared button and action-link hover/active/disabled effects added across the system, plus matching scan animation utilities.
- `components/features/program-list.tsx` — New component. Programme index with accent-bar cards, stats (applications, approved, mentors, dates), View/Applicants/Delete actions, delete confirmation modal.
- `components/features/program-detail.tsx` — New component. Full programme detail with read view (stats strip, basics, target profile, criteria bars, mentor list) and inline edit mode (all fields editable, sticky save panel, weights validation). Delete with confirmation modal and redirect.
- `components/features/applicant-review-pool.tsx` — "New Programme" button added to page header linking to `/programs/new`.
- `components/features/program-setup-wizard.tsx` — Save Programme button added. Shows when `isReady === true`. On save: confirmation state with application URL and "Create another" reset.

### Routes

| Route | Status |
|---|---|
| `/` | Live — redirects to dashboard |
| `/login` | Live — demo placeholder |
| `/dashboard` | Live — redesigned AI ops dashboard |
| `/programs` | **NEW** — programme list with CRUD actions |
| `/programs/[programId]` | **NEW** — programme detail with inline edit and delete |
| `/programs/new` | Live — setup wizard with working Save button |
| `/programs/[programId]/applicants` | Live — applicant review pool |
| `/apply/[programId]` | Live — public application with AI fit scoring |
| `/matching` | Live — AI mentor matching workbench |
| `/relationships` | Live — relationship list |
| `/relationships/[id]` | Live — detail with wired Log Meeting + Refresh Diagnosis |
| `/program/[cohortId]` | Live — cohort overview with AI report generation |
| `/submit-meeting` | Live — public mentor meeting form |

### Backend and AI

All five Gemini-backed API routes are fully implemented and wired to UI:

| Route | Trigger | Status |
|---|---|---|
| `POST /api/ai/match` | "Generate AI matches" in `/matching` after startup selection | ✅ Live |
| `POST /api/ai/program-fit` | "Get fit score & submit" in `/apply/[programId]` | ✅ Live |
| `POST /api/ai/analyze-meeting` | "Submit & Analyze" in `/submit-meeting` AND inline Log Meeting in `/relationships/[id]` | ✅ Live |
| `POST /api/ai/cohort-summary` | "Generate Report" in `/program/[cohortId]` | ✅ Live |
| `POST /api/ai/diagnose` | "Refresh Diagnosis" in `/relationships/[id]` | ✅ Live — previously orphaned, now wired |

`lib/gemini.ts` wrapper (`analyzeWithGemini`, `generateContent`) remains exported but unused — all routes instantiate `GoogleGenerativeAI` directly inline.

### Data and Auth

- Seed-backed Verrier domain data supports the full demo flow.
- Firebase app, Firestore, and Auth initialized through `lib/firebase.ts`.
- `safeWrite` and `getFirebaseConfigStatus` remain available.
- Auth is a demo placeholder; admin-only writes fall back to `local-fallback`.
- Firestore rules are collection-aware (Phase 5 Block A).

### Infrastructure

- Docker development and standalone production build scaffolding exist.
- GitHub Actions Cloud Run deployment workflow exists.
- `.env.example` is the canonical local environment template.

---

## Completed Milestones

- Phase 1: Verrier Product Foundation. Completed 2026-05-16.
- Phase 2: Programme Intake and Applicant Review. Completed 2026-05-16.
- Phase 3: Mentor Matching and Relationship Creation. Completed 2026-05-16.
- Phase 4: Relationship Health and Cohort Intelligence. Completed 2026-05-16.
- Phase 5 Block A: Firebase Persistence and Rules. Completed 2026-05-17.
- Phase 5 Block B: Demo Resilience and Fallbacks. Completed 2026-05-17.
- **Post-hackathon polish session. Completed 2026-05-17.**
  - Dashboard redesigned as AI ops platform.
  - Log Meeting form wired to `POST /api/ai/analyze-meeting`.
  - Refresh Diagnosis button wired to `POST /api/ai/diagnose`.
  - Mentor matching changed from passive startup-selection trigger to explicit `Generate AI matches` action.
  - Matching loading visualization, toast feedback, and shared button interaction effects added.
  - Programme CRUD: list page, detail page, inline edit, delete with confirmation.
  - Programme Setup Wizard Save button implemented.
  - Nav "Programmes" link fixed to `/programs`.
  - "New Programme" button added to applicant review pool header.

## Current Milestone Progress

- Phase 1: 100%
- Phase 2: 100%
- Phase 3: 100%
- Phase 4: 100%
- Phase 5: 100%
- Polish: 100%

## Known Debt / Residual Issues

- Firestore persistence wired only into `POST /api/relationships/confirm-match`; all other flows use seed/local state.
- Authentication remains a demo placeholder; admin-only writes fall back to `local-fallback`.
- `lib/gemini.ts` wrapper is dead code — never imported by any route.
- Programme CRUD (create/edit/delete) is local state only — changes do not persist across page navigation.
- Build still prints the Next.js workspace-root warning because there are multiple lockfiles above the repo; lint and production build pass.

## Latest Verification

- `npm run lint` — passed.
- `npm run build` — passed, with the known workspace-root warning only.

## Recommended Next Steps

1. Wire `safeWrite` into programme create/edit/delete routes for Firestore persistence.
2. Enforce Firebase ID-token auth on coordinator API routes.
3. Remove or repurpose `lib/gemini.ts` dead code.
4. Add `POST /api/programs` and `PATCH /api/programs/[id]` route handlers to back the wizard and detail edit form.
