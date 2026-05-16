# Phase 5: Demo Hardening and Deployment Readiness

**Status**: NOT_STARTED
**Prerequisite**: Phase 4 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Firebase Persistence and Rules | — | NOT_STARTED |
| B | Demo Resilience and Fallbacks | Block A | NOT_STARTED |
| C | Cloud Run Deployment Verification | Block B | NOT_STARTED |
| D | Final Pitch Walkthrough Polish | Block C | NOT_STARTED |

---

## Block A: Firebase Persistence and Rules

### Scope
- [ ] Replace critical seeded mutations with Firestore reads/writes where demo value requires persistence.
- [ ] Add or update Firestore rules for admin, viewer, public application, and tokenized meeting flows.
- [ ] Confirm environment variables are documented and available.
- [ ] Keep seed data available as a fallback path.

### Acceptance Criteria
- [ ] Firestore collections match `_DOCS/01_DB_SCHEMA.md`.
- [ ] Rules are narrower than broad authenticated read/write for final demo.
- [ ] Public submission paths validate required fields.
- [ ] Seed fallback can still run when Firebase is unavailable.

---

## Block B: Demo Resilience and Fallbacks

### Scope
- [ ] Add loading, timeout, empty, and error states to demo-critical flows.
- [ ] Add fallback mock AI responses for pitch-critical actions.
- [ ] Ensure all public and admin routes can recover from slow Gemini or Firestore.
- [ ] Update handover notes with the fallback demo path.

### Acceptance Criteria
- [ ] The demo can complete without a successful live Gemini response.
- [ ] Failed Firestore writes are visible and understandable.
- [ ] No route crashes on missing seed or API data.
- [ ] Team can follow a documented backup path.

---

## Block C: Cloud Run Deployment Verification

### Scope
- [ ] Verify production build locally or in CI.
- [ ] Confirm GitHub Actions and Cloud Run environment configuration.
- [ ] Confirm runtime secrets for Gemini and Firebase are available.
- [ ] Smoke test deployed routes.

### Acceptance Criteria
- [ ] `npm run build` succeeds or the exact blocker is documented.
- [ ] Cloud Run service loads the app successfully.
- [ ] Demo-critical routes respond after deployment.
- [ ] Runtime env gaps are documented before judging.

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
