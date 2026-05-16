# Phase 3: Mentor Matching and Relationship Creation

**Status**: NOT_STARTED
**Prerequisite**: Phase 2 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Mentor Pool and Startup Queue | — | NOT_STARTED |
| B | AI Mentor Matching Route | Block A | NOT_STARTED |
| C | Matching Workbench UI | Block B | NOT_STARTED |
| D | Match Confirmation and Relationship List | Block C | NOT_STARTED |

---

## Block A: Mentor Pool and Startup Queue

### Scope
- [ ] Normalize seeded mentor and approved-startup data for matching.
- [ ] Add helper functions for available mentors, mentor load, and unmatched startups.
- [ ] Flag mentors with high load or insufficient availability.
- [ ] Keep helpers reusable for route handlers and client UI.

### Acceptance Criteria
- [ ] Approved unmatched startups can be queried deterministically.
- [ ] Mentor candidates can be filtered by cohort/programme.
- [ ] Mentor load warnings are computed from relationship data.
- [ ] TypeScript remains strict and clear.

---

## Block B: AI Mentor Matching Route

### Scope
- [ ] Add `POST /api/ai/match`.
- [ ] Add mentor matching prompt template and structured response parsing.
- [ ] Return top 3 matches with scores, reasons, and breakdowns.
- [ ] Validate returned mentor IDs against the candidate list.

### Acceptance Criteria
- [ ] Gemini call stays server-side.
- [ ] Invalid mentor IDs are discarded or replaced with a safe fallback.
- [ ] Fewer than 3 mentors is handled gracefully.
- [ ] Route failures preserve manual matching as a fallback.

---

## Block C: Matching Workbench UI

### Scope
- [ ] Implement `/matching`.
- [ ] Build a two-panel workbench with startup queue and ranked mentor results.
- [ ] Add loading, empty, error, and manual-select states.
- [ ] Show score breakdowns and AI reasons clearly.

### Acceptance Criteria
- [ ] Selecting a startup requests or displays top mentor matches.
- [ ] Mentor cards are comparable at a glance.
- [ ] Manual selection is possible when AI is unavailable.
- [ ] UI remains usable on desktop and mobile.

---

## Block D: Match Confirmation and Relationship List

### Scope
- [ ] Add `POST /api/relationships/confirm-match` or local equivalent if Firestore is not yet active.
- [ ] Create Relationship records with baseline health and match metadata.
- [ ] Implement `/relationships` list with status and health filters.
- [ ] Update selected startup state after confirmation.

### Acceptance Criteria
- [ ] Confirming a match creates a Relationship-shaped record.
- [ ] New relationship appears in the relationship list.
- [ ] Matched startups are no longer shown as unmatched.
- [ ] Relationship initial health state matches `_DOCS/01_DB_SCHEMA.md`.
