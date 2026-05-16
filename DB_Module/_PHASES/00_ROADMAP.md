# Project Roadmap

**Current Phase**: Phase 3 — Mentor Matching and Relationship Creation
**Current Block**: Block B
**Last Updated**: 2026-05-16

---

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Verrier Product Foundation | COMPLETED |
| 2 | Programme Intake and Applicant Review | COMPLETED |
| 3 | Mentor Matching and Relationship Creation | IN_PROGRESS |
| 4 | Relationship Health and Cohort Intelligence | NOT_STARTED |
| 5 | Demo Hardening and Deployment Readiness | NOT_STARTED |

---

## Active: Phase 3 → Block B

> See `PHASE_3__Mentor_Matching_and_Relationship_Creation.md` for full block details.

**What we're building**: A server-side AI mentor matching route that ranks top mentor candidates for an approved startup and validates returned mentor IDs against the available mentor pool.
**Acceptance gate**: Gemini calls stay server-side, invalid mentor IDs are rejected or replaced with a safe fallback, fewer than 3 mentors is handled gracefully, and route failures preserve manual matching as a fallback.
