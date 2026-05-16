# Phase 2: Topic Product Slice

**Status**: IN_PROGRESS
**Prerequisite**: Phase 1 must be COMPLETE
**Required _DOCS**: `00_SRS.md`, `01_DB_SCHEMA.md`, `02_STYLE_GUIDE.md`, `03_SERVER_ACTIONS.md`, `04_TECH_STACK.md`, `05_PROJECT_SNAPSHOT.md`, `06_DEPENDENCY_GRAPH.md`

---

## Block Dependency Table

| Block | Name | Depends On | Status |
|-------|------|------------|--------|
| A | Topic Lock and Workflow Definition | — | IN_PROGRESS |
| B | First Product UI Flow | Block A | NOT_STARTED |
| C | AI and Persistence Integration | Block B | NOT_STARTED |

---

## Block A: Topic Lock and Workflow Definition

### Scope
- [ ] Update the SRS with the selected hackathon topic and target users.
- [ ] Define the first usable workflow for the demo.
- [ ] Define initial Firestore collections required by the workflow.

### Acceptance Criteria
- [ ] `_DOCS/00_SRS.md` reflects the locked topic.
- [ ] `_DOCS/01_DB_SCHEMA.md` lists concrete collection names and data shapes.
- [ ] The active workflow can be implemented without reinterpreting the product idea.

---

## Block B: First Product UI Flow

### Scope
- [ ] Replace scaffold placeholder content with the first product workflow.
- [ ] Preserve existing styling conventions and mobile readability.
- [ ] Keep new UI scoped to the selected workflow.

### Acceptance Criteria
- [ ] The home page presents a usable product action instead of only scaffold status.
- [ ] The UI works on desktop and mobile widths.
- [ ] Existing shared UI primitives are reused where appropriate.

---

## Block C: AI and Persistence Integration

### Scope
- [ ] Wire the selected UI flow to Gemini through the server-side API/helper layer.
- [ ] Persist relevant output or session data to Firestore.
- [ ] Document any API contract changes.

### Acceptance Criteria
- [ ] AI calls remain server-side when using private keys.
- [ ] Firestore writes use documented collection names.
- [ ] `_DOCS/03_SERVER_ACTIONS.md` reflects any new route or helper contract.
