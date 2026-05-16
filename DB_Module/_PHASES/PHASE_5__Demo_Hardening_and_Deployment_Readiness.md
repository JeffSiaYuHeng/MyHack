# Phase 5: Demo Hardening and Deployment Readiness

**Status**: IN_PROGRESS
**Prerequisite**: Phase 4 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Firebase Persistence and Rules | — | COMPLETED |
| B | Demo Resilience and Fallbacks | Block A | COMPLETED |
| C | Cloud Run Deployment Verification | Block B | COMPLETED |
| D | Final Pitch Walkthrough Polish | Block C | IN_PROGRESS |

---

## Block A: Firebase Persistence and Rules

### Scope
- [x] Replace critical seeded mutations with Firestore reads/writes where demo value requires persistence.
- [x] Add or update Firestore rules for admin, viewer, public application, and tokenized meeting flows.
- [x] Confirm environment variables are documented and available.
- [x] Keep seed data available as a fallback path.

### Acceptance Criteria
- [x] Firestore collections match `_DOCS/01_DB_SCHEMA.md`.
- [x] Rules are narrower than broad authenticated read/write for final demo.
- [x] Public submission paths validate required fields.
- [x] Seed fallback can still run when Firebase is unavailable.

---

## Block B: Demo Resilience and Fallbacks

### Scope
- [x] Add loading, timeout, empty, and error states to demo-critical flows.
- [x] Add fallback mock AI responses for pitch-critical actions.
- [x] Ensure all public and admin routes can recover from slow Gemini or Firestore.
- [x] Update handover notes with the fallback demo path.

### Acceptance Criteria
- [x] The demo can complete without a successful live Gemini response.
- [x] Failed Firestore writes are visible and understandable.
- [x] No route crashes on missing seed or API data.
- [x] Team can follow a documented backup path.

---

## Block C: Cloud Run Deployment Verification

### Scope
- [x] Verify production build locally or in CI.
- [x] Confirm GitHub Actions and Cloud Run environment configuration.
- [x] Confirm runtime secrets for Gemini and Firebase are available.
- [x] Smoke test deployed routes.

### Acceptance Criteria
- [x] `npm run build` succeeds or the exact blocker is documented.
- [x] Cloud Run service loads the app successfully.
- [x] Demo-critical routes respond after deployment.
- [x] Runtime env gaps are documented before judging.

---

## Block D: Final Pitch Walkthrough Polish

### Scope
- [ ] Polish copy, states, and visual hierarchy along the judge walkthrough.
- [ ] Prepare the 4-step demo path: dashboard, applicant scoring, mentor matching, meeting health/report.
- [ ] Update `_DOCS/05_PROJECT_SNAPSHOT.md` with final shipped state.
- [ ] Update `_TASK/_Hand_OverLog.md` with final demo instructions.

### Acceptance Criteria
- [ ] Judge can understand the product problem in 30 seconds.
- [ ] At least two AI moments are clearly demoable.
- [ ] Relationship health and cohort narrative close the story.
- [ ] DualBrain docs match the final demo state.
