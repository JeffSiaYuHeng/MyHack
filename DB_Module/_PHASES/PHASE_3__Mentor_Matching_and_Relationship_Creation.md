# Phase 3: Mentor Matching and Relationship Creation

**Status**: COMPLETED
**Prerequisite**: Phase 2 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Mentor Pool and Startup Queue | — | COMPLETED |
| B | AI Mentor Matching Route | Block A | COMPLETED |
| C | Matching Workbench UI | Block B | COMPLETED |
| D | Match Confirmation and Relationship List | Block C | COMPLETED |

---

## Block A: Mentor Pool and Startup Queue

### Scope
- [x] Normalize seeded mentor and approved-startup data for matching.
- [x] Add helper functions for available mentors, mentor load, and unmatched startups.
- [x] Flag mentors with high load or insufficient availability.
- [x] Keep helpers reusable for route handlers and client UI.

### Acceptance Criteria
- [x] Approved unmatched startups can be queried deterministically.
- [x] Mentor candidates can be filtered by cohort/programme.
- [x] Mentor load warnings are computed from relationship data.
- [x] TypeScript remains strict and clear.

---

## Block B: AI Mentor Matching Route

### Scope
- [x] Add `POST /api/ai/match`.
- [x] Add mentor matching prompt template and structured response parsing.
- [x] Return top 3 matches with scores, reasons, and breakdowns.
- [x] Validate returned mentor IDs against the candidate list.

### Acceptance Criteria
- [x] Gemini call stays server-side.
- [x] Invalid mentor IDs are discarded or replaced with a safe fallback.
- [x] Fewer than 3 mentors is handled gracefully.
- [x] Route failures preserve manual matching as a fallback.

---

## Block C: Matching Workbench UI

### Scope
- [x] Implement `/matching`.
- [x] Build a two-panel workbench with startup queue and ranked mentor results.
- [x] Add loading, empty, error, and manual-select states.
- [x] Show score breakdowns and AI reasons clearly.

### Acceptance Criteria
- [x] Selecting a startup requests or displays top mentor matches.
- [x] Mentor cards are comparable at a glance.
- [x] Manual selection is possible when AI is unavailable.
- [x] UI remains usable on desktop and mobile.

---

## Block D: Match Confirmation and Relationship List

### Scope
- [x] Add `POST /api/relationships/confirm-match` or local equivalent if Firestore is not yet active.
- [x] Create Relationship records with baseline health and match metadata.
- [x] Implement `/relationships` list with status and health filters.
- [x] Update selected startup state after confirmation.

### Acceptance Criteria
- [x] Confirming a match creates a Relationship-shaped record.
- [x] New relationship appears in the relationship list.
- [x] Matched startups are no longer shown as unmatched.
- [x] Relationship initial health state matches `_DOCS/01_DB_SCHEMA.md`.
