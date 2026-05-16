# Phase 2: Programme Intake and Applicant Review

**Status**: NOT_STARTED
**Prerequisite**: Phase 1 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Programme Setup Wizard | — | NOT_STARTED |
| B | Public Startup Application | Block A | NOT_STARTED |
| C | AI Programme Fit Route | Block B | NOT_STARTED |
| D | Applicant Pool Decisions | Block C | NOT_STARTED |

---

## Block A: Programme Setup Wizard

### Scope
- [ ] Implement `/programs/new` with basics, target profile, criteria weights, application setup, and mentor setup sections.
- [ ] Use seed mentors and local state for first implementation.
- [ ] Generate a deterministic public application URL for the created programme.
- [ ] Keep the form ergonomic on desktop and mobile.

### Acceptance Criteria
- [ ] Coordinator can complete a programme setup flow without runtime errors.
- [ ] Criteria weights and required documents are visible and editable.
- [ ] The created programme shape matches `_DOCS/01_DB_SCHEMA.md`.
- [ ] The UI follows Morandi Tech style guidance.

---

## Block B: Public Startup Application

### Scope
- [ ] Implement `/apply/[programId]` with programme summary, company profile, founder profile, documents, and support needs.
- [ ] Add validation for required fields and required document metadata.
- [ ] Show a fit preview area that can consume AI scoring once Block C is complete.
- [ ] Provide a confirmation state after submission.

### Acceptance Criteria
- [ ] Public page renders without coordinator auth.
- [ ] Startup can enter the MVP application data shape.
- [ ] Validation blocks incomplete required submissions.
- [ ] Confirmation preserves submitted status and fit label placeholder.

---

## Block C: AI Programme Fit Route

### Scope
- [ ] Add `POST /api/ai/program-fit`.
- [ ] Add programme fit prompt template and structured response parsing.
- [ ] Validate request input and returned score ranges.
- [ ] Wire the public application page to request a fit score before final submission.

### Acceptance Criteria
- [ ] Gemini call stays server-side.
- [ ] Route returns fit score, label, recommendation, insight, breakdown, and eligibility flags.
- [ ] Malformed or unavailable AI response produces a recoverable pending state.
- [ ] `_DOCS/03_SERVER_ACTIONS.md` remains accurate.

---

## Block D: Applicant Pool Decisions

### Scope
- [ ] Implement `/programs/[programId]/applicants`.
- [ ] Show applicant filters, applicant list, and detail drawer/panel.
- [ ] Add approve, decline, waitlist, and shortlist actions against local/seeded state.
- [ ] Prepare action boundaries for later Firestore persistence.

### Acceptance Criteria
- [ ] Coordinator can review AI-scored applicants from the seeded/submitted pool.
- [ ] Decision actions update visible applicant state.
- [ ] Approved applicants are visible as selected companies for matching.
- [ ] Empty, loading, and error states are present for demo resilience.
