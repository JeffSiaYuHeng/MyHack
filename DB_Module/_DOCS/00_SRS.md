# Software Requirements Specification

**Last Updated:** 2026-05-17 (post-hackathon polish session)

---

## Product

**Verrier** is an AI-powered ecosystem relationship management platform for innovation programme administrators. It helps programme teams define programmes, review startup applications, match mentors to selected startups, monitor relationship health, and generate management-ready cohort intelligence.

## Event Context

Build With AI 2026 KL, Sunway University, Petaling Jaya, May 16-17, 2026.

## Product Thesis

Innovation programmes currently manage relationships through spreadsheets, forms, WhatsApp groups, and memory. Verrier treats relationships as first-class data entities that can be scored, monitored, diagnosed, and improved over time.

Core promise:

> Verrier calculates who belongs together, and when relationships are drifting, before anyone notices.

## Primary Users

| User | Primary Jobs |
|------|--------------|
| Programme Administrator | Create programmes, review applicants, approve cohorts, match mentors, monitor risk, produce reports |
| Mentor | Log meeting notes after sessions with minimal friction |
| Startup Founder | Understand programme fit and submit a complete application |
| Programme Owner | Read cohort health and ROI summaries without operating the dashboard |

Primary persona for the MVP is Sarah, a programme manager handling 2-4 cohorts, 30-120 startups, and 40-150 mentors.

## MVP Goals

| Goal | Target |
|------|--------|
| Reduce application review time | AI-ranked applicant pool in minutes |
| Reduce matching time | Suggested mentor assignments in under 2 hours |
| Surface at-risk relationships | Identify deteriorating pairs before dropout |
| Eliminate manual reporting | Generate cohort health summary from live data |
| Prove AI indispensability | Fit scoring, matching, meeting analysis, diagnosis, and reports all require Gemini |

## Core Product Flow

1. Coordinator creates a programme with target stage, industry, market, criteria, documents, mentor needs, and application window.
2. Verrier publishes a public application page for startups.
3. Startup enters company, founder, support needs, and document metadata.
4. Gemini scores programme fit and explains strengths, concerns, and recommendation.
5. Submitted applications enter the coordinator applicant pool.
6. Coordinator approves, declines, or waitlists applicants.
7. Approved startups become selected companies for the cohort.
8. Gemini ranks top mentor matches for selected startups.
9. Coordinator confirms or overrides a match.
10. Verrier creates a tracked Relationship entity with baseline health.
11. Mentors submit meeting notes through a tokenized public form, or coordinator logs inline from the relationship detail page.
12. Gemini summarizes notes, extracts action items, detects relationship signal, and updates HealthScore.
13. Dashboard Attention Feed surfaces critical and at-risk relationships.
14. Coordinator refreshes AI diagnosis on any relationship for a current narrative and recommendation.
15. Coordinator generates a cohort narrative for management.

## MVP Feature Set

### Implemented and Demo-Ready

- Programme list view with CRUD (create, read, edit, delete).
- Programme creation wizard with Save button.
- Public startup application page with AI programme-fit scoring.
- Applicant pool with approve, decline, and waitlist decisions.
- Dashboard redesigned as AI operations platform with stat groups, health bars, AI badges, and skeletons.
- AI mentor matching with top 3 candidates and deterministic fallback.
- Match confirmation that creates a Relationship.
- Public meeting submission form with AI analysis.
- Inline Log Meeting form on relationship detail page, wired to AI.
- Relationship detail page with timeline, milestones, live health score, and AI diagnosis.
- Refresh Diagnosis button on relationship detail, wired to `POST /api/ai/diagnose`.
- Cohort overview with generated management narrative, key risks, and recommended actions.

### Post-MVP

- Firestore persistence for programme CRUD (currently local state).
- Startup authenticated portal.
- Mentor dashboard.
- Full calendar integration.
- Real PDF export.
- Email/SMS notifications.
- Multi-cohort switching.
- Investor and service-provider views.
- Cross-cohort analytics.
- Firebase ID-token enforcement on coordinator API routes.

## AI Requirements

All Gemini calls run server-side. The MVP uses structured JSON responses for:

- Programme fit scoring (`POST /api/ai/program-fit`).
- Mentor matching (`POST /api/ai/match`).
- Meeting analysis (`POST /api/ai/analyze-meeting`).
- Relationship diagnosis (`POST /api/ai/diagnose`).
- Cohort narrative (`POST /api/ai/cohort-summary`).

Every AI recommendation includes plain-language reasoning. Verrier suggests actions; the human coordinator decides.

All prompts include the Malaysia context guardrail: evaluate only on professional and business criteria — do not assess on race, religion, or royalty.

Every AI route has a deterministic fallback that activates when Gemini is unavailable or returns malformed output.

## Data Requirements

The MVP uses Firestore as the primary database. Core collections:

- `programs`
- `applications`
- `cohorts`
- `companies`
- `mentors`
- `relationships`
- `meetings`
- `users`

Seed data in `lib/verrier-seed.ts`:

| Data | Quantity |
|------|----------|
| Programs | 1 active accelerator |
| Applications | 12 varied startup applications |
| Companies | 10 varied startups |
| Mentors | 15 varied mentors |
| Relationships | 8 mixed health states |
| Meetings | 12 varied meeting records |
| Cohorts | 1 active cohort, week 8 of 24 |

Demo data includes 1 critical pair, 2 at-risk pairs, and 1 unmatched startup.

## Frontend Route Requirements

| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/` | Redirect to dashboard | — | Live |
| `/login` | Google sign-in | Public | Demo placeholder |
| `/dashboard` | AI ops command center | Required | Live |
| `/programs` | Programme list with CRUD | Required | **Live** |
| `/programs/[programId]` | Programme detail with edit/delete | Required | **Live** |
| `/programs/new` | Programme setup wizard | Required | Live |
| `/programs/[programId]/applicants` | Applicant pool | Required | Live |
| `/apply/[programId]` | Startup application | Public | Live |
| `/matching` | Mentor matching engine | Required | Live |
| `/relationships` | Relationship list | Required | Live |
| `/relationships/[id]` | Relationship detail | Required | Live |
| `/program/[cohortId]` | Cohort overview | Required | Live |
| `/submit-meeting` | Mentor meeting form | Public token | Live |

## Technical Constraints

- Next.js App Router and React 19 are installed.
- Read relevant `node_modules/next/dist/docs/` guidance before using Next.js APIs.
- Tailwind CSS v4 and shadcn conventions are active.
- Firebase client SDK is installed and initialized.
- Gemini SDK (`@google/generative-ai`) is installed.
- Keep private keys server-side.
- Do not add heavy infrastructure unless required for a demo-critical capability.

## Design Constraints

Use the Morandi Tech design direction from `DB_Module/Resource/Design.md`:

- Calm, operational, high-trust interface.
- Inter typography.
- 8px spacing unit.
- Neutral surfaces, muted blue primary, muted green secondary, muted red tertiary.
- Avoid decorative hero/marketing treatment; first screen should be a usable product surface.
- AI markers use `var(--status-ai)` color (`#637789`) with subtle background tint.

## Security Requirements

- Firebase Authentication with Google sign-in for coordinator/admin surfaces.
- Admin accounts manually provisioned for MVP.
- Public startup applications only accepted for open programmes inside the application window.
- Public meeting submission uses a unique mentor token.
- Firestore rules are collection-aware (implemented Phase 5 Block A).
- All `/api/*` admin routes must validate Firebase ID token before production deployment.

## Success Criteria

The demo succeeds if a judge can answer yes to:

1. I understand the problem in 30 seconds.
2. I can see AI doing something a spreadsheet cannot.
3. I believe this could work at scale.
