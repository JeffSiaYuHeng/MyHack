# Phase 1: Verrier Product Foundation

**Status**: IN_PROGRESS
**Prerequisite**: Existing MyHack scaffold is operational
**Required _DOCS**: `00_SRS.md`, `00_STRUCTURE.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Domain Types and Seed Data | — | COMPLETED |
| B | App Shell and Design Tokens | Block A | IN_PROGRESS |
| C | Dashboard Command Center | Block B | NOT_STARTED |
| D | Auth and Data Boundary Prep | Block C | NOT_STARTED |

---

## Block A: Domain Types and Seed Data

### Scope
- [x] Add shared TypeScript domain types for Program, Application, Cohort, Company, Mentor, Relationship, Meeting, ActionItem, and User.
- [x] Create deterministic Verrier demo seed data matching `_DOCS/01_DB_SCHEMA.md`.
- [x] Add read-only helper functions for dashboard summaries, health bands, attention feed ranking, and mentor/startup lookup.
- [x] Keep seed data local and dependency-free so UI work can proceed before Firestore is wired.

### Acceptance Criteria
- [x] TypeScript compiles with the new domain types.
- [x] Seed data includes 1 active program, 1 active cohort, 12 applications, 10 companies, 15 mentors, 8 relationships, and 12 meetings.
- [x] Seed data includes at least 1 critical pair, 2 at-risk pairs, and 1 unmatched startup.
- [x] Helpers return deterministic dashboard counts and attention feed order.

---

## Block B: App Shell and Design Tokens

### Scope
- [ ] Update global metadata and root copy from MyHack scaffold to Verrier.
- [ ] Align global design tokens with Morandi Tech guidance from `_DOCS/02_STYLE_GUIDE.md`.
- [ ] Create a reusable product shell for authenticated coordinator pages.
- [ ] Preserve existing shared UI primitives and avoid broad component churn.

### Acceptance Criteria
- [ ] The root app no longer presents as a topic-drop scaffold.
- [ ] Verrier styling uses the Morandi Tech palette and operational layout conventions.
- [ ] Product shell works at mobile and desktop widths.
- [ ] `npm run lint` succeeds or issues are documented in the handover.

---

## Block C: Dashboard Command Center

### Scope
- [ ] Implement `/dashboard` using seeded data.
- [ ] Show active cohort header, stat cards, AI Attention Feed, and recent meeting summaries.
- [ ] Add health score bands and urgent relationship ranking.
- [ ] Make `/` route to or render the command center experience.

### Acceptance Criteria
- [ ] Dashboard displays new applicants, active pairs, healthy, at-risk, and needs-attention counts.
- [ ] Attention Feed surfaces critical and stale relationships before healthy pairs.
- [ ] Recent meetings show AI summary, signal, and action item count.
- [ ] Dashboard is usable on desktop and mobile.

---

## Block D: Auth and Data Boundary Prep

### Scope
- [ ] Add a minimal login route or demo-auth placeholder consistent with Firebase Auth.
- [ ] Document which routes are public and which are coordinator-only in code comments or route structure.
- [ ] Prepare Firestore helper boundaries so later blocks can swap seeded reads for real reads.
- [ ] Update `_DOCS/03_SERVER_ACTIONS.md` if implementation chooses a different route boundary.

### Acceptance Criteria
- [ ] Public routes and coordinator routes are separated clearly.
- [ ] Seed-data helpers are isolated from future Firestore helper surfaces.
- [ ] Auth work does not block public application or meeting form development.
- [ ] Relevant docs remain accurate after the block.
