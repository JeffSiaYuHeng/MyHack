# Phase 2: Programme Intake and Applicant Review

**Status**: COMPLETED
**Prerequisite**: Phase 1 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Programme Setup Wizard | — | COMPLETED |
| B | Public Startup Application | Block A | COMPLETED |
| C | AI Programme Fit Route | Block B | COMPLETED |
| D | Applicant Pool Decisions | Block C | COMPLETED |

---

## Block A: Programme Setup Wizard

### Scope
- [x] Implement `/programs/new` with basics, target profile, criteria weights, application setup, and mentor setup sections.
- [x] Use seed mentors and local state for first implementation.
- [x] Generate a deterministic public application URL for the created programme.
- [x] Keep the form ergonomic on desktop and mobile.

### Acceptance Criteria
- [x] Coordinator can complete a programme setup flow without runtime errors.
- [x] Criteria weights and required documents are visible and editable.
- [x] The created programme shape matches `_DOCS/01_DB_SCHEMA.md`.
- [x] The UI follows Morandi Tech style guidance.

---

## Block B: Public Startup Application

### Scope
- [x] Implement `/apply/[programId]` with programme summary, company profile, founder profile, documents, and support needs.
- [x] Add validation for required fields and required document metadata.
- [x] Show a fit preview area that can consume AI scoring once Block C is complete.
- [x] Provide a confirmation state after submission.

### Acceptance Criteria
- [x] Public page renders without coordinator auth.
- [x] Startup can enter the MVP application data shape.
- [x] Validation blocks incomplete required submissions.
- [x] Confirmation preserves submitted status and fit label placeholder.

---

## Block C: AI Programme Fit Route

### Scope
- [x] Add `POST /api/ai/program-fit`.
- [x] Add programme fit prompt template and structured response parsing.
- [x] Validate request input and returned score ranges.
- [x] Wire the public application page to request a fit score before final submission.

### Acceptance Criteria
- [x] Gemini call stays server-side.
- [x] Route returns fit score, label, recommendation, insight, breakdown, and eligibility flags.
- [x] Malformed or unavailable AI response produces a recoverable pending state.
- [x] `_DOCS/03_SERVER_ACTIONS.md` remains accurate.

---

## Block D: Applicant Pool Decisions

### Scope
- [x] Implement `/programs/[programId]/applicants`.
- [x] Show applicant filters, applicant list, and detail drawer/panel.
- [x] Add approve, decline, waitlist, and shortlist actions against local/seeded state.
- [x] Prepare action boundaries for later Firestore persistence.

### Acceptance Criteria
- [x] Coordinator can review AI-scored applicants from the seeded/submitted pool.
- [x] Decision actions update visible applicant state.
- [x] Approved applicants are visible as selected companies for matching.
- [x] Empty, loading, and error states are present for demo resilience.
