# Software Requirements Specification

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
11. Mentors submit meeting notes through a tokenized public form.
12. Gemini summarizes notes, extracts action items, detects relationship signal, and updates HealthScore.
13. Dashboard Attention Feed surfaces critical and at-risk relationships.
14. Coordinator generates a cohort narrative for management.

## MVP Feature Set

### Must Demo

- Programme creation wizard.
- Public startup application page.
- AI programme-fit scoring.
- Applicant pool with approve, decline, and waitlist decisions.
- Dashboard with stat cards and AI Attention Feed.
- AI mentor matching with top 3 candidates.
- Match confirmation that creates a Relationship.
- Public meeting submission form.
- AI meeting analysis and HealthScore update.
- Relationship detail page with timeline, diagnosis, and milestones.
- Cohort overview with generated management narrative.

### Post-MVP

- Startup authenticated portal.
- Mentor dashboard.
- Full calendar integration.
- Real PDF export.
- Email/SMS notifications.
- Multi-cohort switching.
- Investor and service-provider views.
- Cross-cohort analytics.

## AI Requirements

All private Gemini calls must run server-side. The MVP uses structured JSON responses for:

- Programme fit scoring.
- Mentor matching.
- Meeting analysis.
- Relationship diagnosis.
- Cohort narrative.

Every AI recommendation must include plain-language reasoning. Verrier suggests actions; the human coordinator decides.

## Data Requirements

The MVP uses Firestore as the primary database. Core collections are:

- `programs`
- `applications`
- `cohorts`
- `companies`
- `mentors`
- `relationships`
- `meetings`
- `users`

Seed data is required for a reliable demo:

| Data | Quantity |
|------|----------|
| Programs | 1 active accelerator |
| Applications | 12 varied startup applications |
| Companies | 10 varied startups |
| Mentors | 15 varied mentors |
| Relationships | 8 mixed health states |
| Meetings | 12 varied meeting records |
| Cohorts | 1 active cohort, week 8 of 24 |

Demo data must include at least 1 critical pair, 2 at-risk pairs, and 1 unmatched startup.

## Frontend Route Requirements

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Redirect or dashboard shell | Required eventually |
| `/login` | Google sign-in | Public |
| `/dashboard` | Command center | Required |
| `/programs/new` | Programme setup wizard | Required |
| `/programs/[programId]/applicants` | Applicant pool | Required |
| `/apply/[programId]` | Startup application | Public |
| `/matching` | Mentor matching engine | Required |
| `/relationships` | Relationship list | Required |
| `/relationships/[id]` | Relationship detail | Required |
| `/program/[cohortId]` | Cohort overview | Required |
| `/submit-meeting` | Mentor meeting form | Public token |

## Technical Constraints

- Next.js 16 App Router and React 19 are already installed.
- Read relevant `node_modules/next/dist/docs/` guidance before using Next.js APIs that may have changed.
- Tailwind CSS v4 and shadcn conventions are active.
- Firebase client SDK is installed and initialized.
- Gemini SDK is installed.
- Keep private keys server-side.
- Use Firestore for persistence.
- Do not add heavy infrastructure during the hackathon unless required for a demo-critical capability.
- Keep work scoped by DualBrain phases and blocks.

## Design Constraints

Use the Morandi Tech design direction from `DB_Module/Resource/Design.md`:

- Calm, operational, high-trust interface.
- Inter typography.
- 8px spacing unit.
- Neutral surfaces, muted blue primary, muted green secondary, muted red tertiary.
- Avoid decorative hero/marketing treatment; first screen should be a usable product surface.

## Security Requirements

- Firebase Authentication with Google sign-in for coordinator/admin surfaces.
- Admin accounts manually provisioned for MVP.
- Public startup applications only accepted for open programmes inside the application window.
- Public meeting submission uses a unique mentor token.
- Firestore rules must become collection-aware before final demo.
- All `/api/*` admin routes must validate Firebase ID token before production deployment.

## Malaysia Context Guardrails

The product is business-focused and politically neutral. Prompts and UI must avoid content touching Race, Religion, or Royalty. Founder and mentor evaluation must use professional attributes only.

## Success Criteria

The demo succeeds if a judge can answer yes to:

1. I understand the problem in 30 seconds.
2. I can see AI doing something a spreadsheet cannot.
3. I believe this could work at scale.

## Initialization Acceptance

- `_DOCS` reflects Verrier instead of the generic scaffold.
- `_PHASES` provides product-specific build blocks scoped for DualBrain execution.
- The next Planner can create `_TASK/_INSTRUCTION.md` for the first Verrier implementation block without rereading the full PRD.
