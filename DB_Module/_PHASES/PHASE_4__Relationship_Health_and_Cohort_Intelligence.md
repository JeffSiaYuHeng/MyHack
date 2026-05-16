# Phase 4: Relationship Health and Cohort Intelligence

**Status**: NOT_STARTED
**Prerequisite**: Phase 3 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Relationship Detail Timeline | — | NOT_STARTED |
| B | Meeting Submission and AI Analysis | Block A | NOT_STARTED |
| C | Relationship Diagnosis and Health Decay | Block B | NOT_STARTED |
| D | Cohort Overview and Narrative | Block C | NOT_STARTED |

---

## Block A: Relationship Detail Timeline

### Scope
- [ ] Implement `/relationships/[id]`.
- [ ] Show pair header, health badge, matched date, cohort tag, stat row, and meeting timeline.
- [ ] Add milestone tracker based on `currentMilestone` and `milestonesCompleted`.
- [ ] Add a meeting upload modal or inline form shell for Block B.

### Acceptance Criteria
- [ ] Relationship detail page renders from seeded relationship data.
- [ ] Timeline shows meeting number, date, duration, summary, signal, and action items.
- [ ] Milestone tracker can display all 5 stages.
- [ ] Missing relationship IDs produce a clear not-found state.

---

## Block B: Meeting Submission and AI Analysis

### Scope
- [ ] Implement `/submit-meeting` public form with token, date, duration, and notes.
- [ ] Add `POST /api/ai/analyze-meeting` or `/api/meetings/submit` route.
- [ ] Add meeting analysis prompt template and structured response parsing.
- [ ] Update relationship health and meeting timeline state after analysis.

### Acceptance Criteria
- [ ] Notes shorter than 50 characters are rejected.
- [ ] Successful submission returns AI summary and action items.
- [ ] HealthScore updates are clamped between 0 and 100.
- [ ] Mentor sees a clear confirmation state.

---

## Block C: Relationship Diagnosis and Health Decay

### Scope
- [ ] Add relationship diagnosis prompt template and route.
- [ ] Add helper logic for days-since-last-meeting and stale relationship urgency.
- [ ] Update dashboard Attention Feed to use relationship diagnosis or generated reason.
- [ ] Ensure watch points are visible in relationship detail.

### Acceptance Criteria
- [ ] Critical and stale relationships are ranked correctly.
- [ ] Diagnosis returns narrative, watch points, and recommendation.
- [ ] Dashboard and relationship detail share consistent health labels.
- [ ] AI failure falls back to deterministic risk reason.

---

## Block D: Cohort Overview and Narrative

### Scope
- [ ] Implement `/program/[cohortId]`.
- [ ] Show cohort stats, health heatmap, milestone distribution, and report action.
- [ ] Add `POST /api/ai/cohort-summary`.
- [ ] Render generated narrative, key risks, and recommended actions.

### Acceptance Criteria
- [ ] Cohort overview can be demoed from seeded data.
- [ ] Narrative includes specific cohort numbers.
- [ ] Copy/export fallback is available without a PDF dependency.
- [ ] Empty or unavailable AI response does not break the page.
