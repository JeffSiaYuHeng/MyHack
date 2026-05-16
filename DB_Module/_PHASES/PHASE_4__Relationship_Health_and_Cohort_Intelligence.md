# Phase 4: Relationship Health and Cohort Intelligence

**Status**: IN_PROGRESS
**Prerequisite**: Phase 3 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Relationship Detail Timeline | — | COMPLETED |
| B | Meeting Submission and AI Analysis | Block A | COMPLETED |
| C | Relationship Diagnosis and Health Decay | Block B | COMPLETED |
| D | Cohort Overview and Narrative | Block C | IN_PROGRESS |

---

## Block A: Relationship Detail Timeline

### Scope
- [x] Implement `/relationships/[id]`.
- [x] Show pair header, health badge, matched date, cohort tag, stat row, and meeting timeline.
- [x] Add milestone tracker based on `currentMilestone` and `milestonesCompleted`.
- [x] Add a meeting upload modal or inline form shell for Block B.

### Acceptance Criteria
- [x] Relationship detail page renders from seeded relationship data.
- [x] Timeline shows meeting number, date, duration, summary, signal, and action items.
- [x] Milestone tracker can display all 5 stages.
- [x] Missing relationship IDs produce a clear not-found state.

---

## Block B: Meeting Submission and AI Analysis

### Scope
- [x] Implement `/submit-meeting` public form with token, date, duration, and notes.
- [x] Add `POST /api/ai/analyze-meeting` or `/api/meetings/submit` route.
- [x] Add meeting analysis prompt template and structured response parsing.
- [x] Update relationship health and meeting timeline state after analysis.

### Acceptance Criteria
- [x] Notes shorter than 50 characters are rejected.
- [x] Successful submission returns AI summary and action items.
- [x] HealthScore updates are clamped between 0 and 100.
- [x] Mentor sees a clear confirmation state.

---

## Block C: Relationship Diagnosis and Health Decay

### Scope
- [x] Add relationship diagnosis prompt template and route.
- [x] Add helper logic for days-since-last-meeting and stale relationship urgency.
- [x] Update dashboard Attention Feed to use relationship diagnosis or generated reason.
- [x] Ensure watch points are visible in relationship detail.

### Acceptance Criteria
- [x] Critical and stale relationships are ranked correctly.
- [x] Diagnosis returns narrative, watch points, and recommendation.
- [x] Dashboard and relationship detail share consistent health labels.
- [x] AI failure falls back to deterministic risk reason.

---

## Block D: Cohort Overview and Narrative

### Scope
- [x] Implement `/program/[cohortId]`.
- [x] Show cohort stats, health heatmap, milestone distribution, and report action.
- [ ] Add `POST /api/ai/cohort-summary`.
- [ ] Render generated narrative, key risks, and recommended actions.

### Acceptance Criteria
- [x] Cohort overview can be demoed from seeded data.
- [ ] Narrative includes specific cohort numbers.
- [ ] Copy/export fallback is available without a PDF dependency.
- [ ] Empty or unavailable AI response does not break the page.
