# Phase 3: Demo and Deployment Readiness

**Status**: NOT_STARTED
**Prerequisite**: Phase 2 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Auth and Rules Hardening | — | NOT_STARTED |
| B | Cloud Run Deployment Verification | Block A | NOT_STARTED |
| C | Demo Polish and Recovery Path | Block B | NOT_STARTED |

---

## Block A: Auth and Rules Hardening

### Scope
- [ ] Decide whether the selected product needs user identity.
- [ ] Implement the minimum required auth flow if needed.
- [ ] Tighten Firestore rules around actual collections.

### Acceptance Criteria
- [ ] Auth behavior matches the demo workflow needs.
- [ ] Firestore rules are not broader than necessary for the demo.
- [ ] Manual demo access steps are documented.

---

## Block B: Cloud Run Deployment Verification

### Scope
- [ ] Confirm production Docker build works with required environment variables.
- [ ] Confirm GitHub Actions Cloud Run deployment configuration.
- [ ] Verify deployed app health after release.

### Acceptance Criteria
- [ ] Production build succeeds locally or in CI.
- [ ] Cloud Run service receives required runtime variables.
- [ ] The deployed app loads successfully.

---

## Block C: Demo Polish and Recovery Path

### Scope
- [ ] Add final copy, loading states, and error states needed for judging.
- [ ] Prepare a fallback path for failed AI or Firebase calls.
- [ ] Update project snapshot with final demo state.

### Acceptance Criteria
- [ ] The demo can be completed even if an external service responds slowly.
- [ ] Critical failures are visible and understandable to the team.
- [ ] `_DOCS/05_PROJECT_SNAPSHOT.md` reflects the shipped demo state.
