# Verrier — Complete System Product Requirements Document

## Build With AI 2026 KL · MyHack · System PRD v1.0

> **"A planet was discovered without anyone ever looking at it."**
> In 1846, Le Verrier calculated Neptune's position without a telescope — pure reasoning from data. Verrier does the same for innovation ecosystems: it calculates who belongs together, and when relationships are drifting, before anyone notices.

---

## Table of Contents

1. [Executive Summary](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#1-executive-summary)
2. [Problem Statement](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#2-problem-statement)
3. [Product Vision &amp; Goals](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#3-product-vision--goals)
4. [Users &amp; Personas](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#4-users--personas)
5. [System Architecture](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#5-system-architecture)
6. [Core Domain Model](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#6-core-domain-model)
7. [Feature Specifications](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#7-feature-specifications)
8. [AI System Design](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#8-ai-system-design)
9. [Data Schema](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#9-data-schema)
10. [API Contracts](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#10-api-contracts)
11. [Frontend Specifications](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#11-frontend-specifications)
12. [Security &amp; Access Control](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#12-security--access-control)
13. [SDG Alignment](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#13-sdg-alignment)
14. [MVP Scope &amp; Cut List](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#14-mvp-scope--cut-list)
15. [Success Metrics](https://claude.ai/chat/818b8af4-917c-42da-823f-8dd651cf5a0d#15-success-metrics)

---

## 1. Executive Summary

### What is Verrier?

Verrier is an AI-powered ecosystem relationship management platform designed for innovation programme administrators — organisations like Cradle Fund, MaGIC, MDEC, and corporate accelerators — who manage cohorts of startups, mentors, partners, and investors.

Today, these administrators rely on spreadsheets, forms, WhatsApp groups, and manual intuition to run the full programme funnel: define a programme, open applications, review startup fit, shortlist companies, assign mentors, and track whether those relationships are actually working. As programmes scale beyond 20 companies, the system collapses: applicants are reviewed inconsistently, match quality drops, relationships deteriorate invisibly, and programme outcomes suffer.

Verrier treats ecosystem relationships as first-class, programmable entities — not ad-hoc assignments. It uses Google's Gemini AI to automate three things no spreadsheet can do:

1. **Programme fit scoring** — Score startup applications against the programme criteria and explain who should be shortlisted.
2. **Intelligent mentor matching** — Score mentor-startup compatibility across multiple dimensions and explain the reasoning in plain language.
3. **Relationship health monitoring** — Analyse meeting notes to detect friction, declining engagement, and milestone risk before they become failures.
4. **Programme intelligence** — Synthesise applicant, cohort, and relationship data into actionable insights and management-ready reports.

### Technology Stack

| Layer      | Technology                                                             |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | Next.js 16 · App Router · TypeScript · Tailwind CSS v4 · shadcn/ui |
| AI         | Google Gemini 1.5 Flash via `@google/generative-ai`                  |
| Backend    | Next.js API Routes deployed on Google Cloud Run                        |
| Database   | Firebase Firestore                                                     |
| Auth       | Firebase Authentication (Google Sign-in)                               |
| Deployment | Docker · GitHub Actions → Google Cloud Run (asia-southeast1)         |
| State      | Zustand                                                                |

### SDG Alignment

* **Primary: SDG 8** — Decent Work and Economic Growth
* **Secondary: SDG 9** — Industry, Innovation and Infrastructure

---

## 2. Problem Statement

### Context

Regional innovation ecosystems — accelerators, incubators, government grant programmes — are growing rapidly in Southeast Asia. Organisations like Cradle Fund (Malaysia) manage dozens to hundreds of startups across multiple cohorts simultaneously.

### The Core Problem

**Ecosystem relationships are managed like one-off events, not system entities.**

When a programme manager launches a programme today:

* Programme criteria live in a slide deck, form, or spreadsheet
* Startup applications are reviewed manually and inconsistently
* Shortlist decisions depend heavily on human memory and gut feel
* Mentor assignments live in spreadsheet cells
* There is no mechanism to measure if a company-programme fit or mentor-startup match was good
* There is no way to know if the relationship is healthy without manually asking
* When the programme ends, none of the scoring or matching intelligence is reused for the next programme

The platform does not treat relationships as objects that can be defined, scored, monitored, and improved over time.

### Who Is Affected

| Actor                    | Pain                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Programme Administrators | 2+ weeks per programme launch on application review and manual matching; no visibility into relationship quality |
| Mentors                  | Matched to companies outside their expertise; no structured way to log impact          |
| Startups                 | Do not know which programmes suit them; paired with unsuitable mentors; fail silently before programme team notices |
| Programme Owners         | Cannot demonstrate ROI of mentorship; no data for board reports                        |
| Future Cohorts           | Matching intelligence from past cohorts is lost                                        |

### Why Existing Tools Fail

Traditional CRMs (Salesforce, HubSpot) track  *people* , not  *relationships* . They store contact records but have no concept of:

* Compatibility scoring between two entities
* Programme-fit scoring for startup applicants
* Relationship health over time
* Friction signals from interaction content
* Cross-cohort learning from past matching outcomes

---

## 3. Product Vision & Goals

### Vision Statement

> Verrier makes ecosystem relationships as measurable and manageable as financial assets — giving programme administrators the intelligence to match better, intervene earlier, and scale further.

### Product Goals (MVP)

| Goal                          | Metric                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| Reduce application review time | From days of manual screening → minutes with AI ranking    |
| Reduce matching time          | From 2 weeks manual → under 2 hours with AI suggestions   |
| Surface at-risk relationships | Identify deteriorating pairs ≥ 14 days before dropout     |
| Eliminate manual reporting    | Auto-generate cohort health summary for management         |
| Prove AI indispensability     | Every core action (match, monitor, report) requires Gemini |

### Design Principles

1. **AI does the work, human makes the call** — Verrier always suggests, never decides autonomously. Sarah approves every match and every intervention.
2. **Relationships are first-class entities** — A company-programme application and a mentor-startup pair are persistent objects with scores, status, reasoning, and lifecycle — not spreadsheet rows.
3. **Data compounds across programmes** — Every application decision, confirmed match, and outcome feeds future scoring intelligence.
4. **Explainability over black-box** — Every AI recommendation includes a plain-language reason. No unexplained scores.

### Primary Product Flow

The MVP should demonstrate one complete coordinator journey:

1. **Create programme** — Coordinator creates a programme with type, dates, target industries, target stages, eligibility rules, selection criteria, required documents, mentor needs, and application window.
2. **Publish application page** — Verrier generates a simple public application page for startups. The page shows the programme fit score once the startup profile is entered, so founders understand whether the programme suits them before applying.
3. **Receive applicant pool** — Submitted startups enter an applicant pool with AI programme-fit scoring, eligibility flags, missing document warnings, founder/team summary, and AI insight.
4. **Approve or decline** — Coordinator reviews each company profile, founder background, documents, and AI recommendation, then approves, declines, or waitlists the applicant.
5. **Build selected startup list** — Approved startups become the active programme cohort.
6. **Match mentors** — Verrier scores available mentors against each selected startup and recommends the best mentor assignments with reasoning.
7. **Confirm mentor assignment** — Coordinator confirms or overrides the suggested mentor. This creates a tracked Relationship entity.
8. **Monitor relationship health** — Mentors log meeting notes and availability; Verrier updates health scores, watch points, and programme-level reporting.

---

## 4. Users & Personas

### 4.1 Primary User — Programme Administrator

**Representative:** Sarah, Programme Manager at Cradle Fund

| Attribute           | Detail                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| Role                | Manages 2–4 active cohorts, 30–120 startups, 40–150 mentors                |
| Technical level     | Moderate — comfortable with web apps, not a developer                        |
| Device              | Desktop (primary), mobile (status checks)                                     |
| Key jobs to be done | Create programmes; review startup applicants; approve cohorts; match mentors to startups; monitor relationship health; produce board reports |
| Current tools       | Excel, WhatsApp, email, occasional Notion                                     |
| Core frustration    | "I don't know a relationship is broken until the startup ghosts us."          |

**Sarah's weekly cadence with Verrier:**

| Time               | Task                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| Every morning      | Check Dashboard for at-risk relationships and new meeting summaries  |
| Programme setup    | Create programme criteria, application window, required documents, and mentor needs |
| Application window | Review AI-scored applicants, compare company-programme fit, and approve or decline startups |
| Cohort launch week | Use Matching Engine to process 20–40 mentor assignments in hours    |
| Mid-cohort         | Review flagged pairs; read AI diagnoses; decide whether to intervene |
| Month end          | Generate Cohort Summary report for management                        |

---

### 4.2 Secondary User — Mentor

**Representative:** Ahmad Razif, serial entrepreneur and ecosystem mentor

| Attribute           | Detail                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| Role                | Mentors 2–5 startups per cohort across multiple programmes              |
| Technical level     | Low-to-moderate — needs zero-friction experience                        |
| Device              | Mobile (primary)                                                         |
| Key jobs to be done | Log meeting notes after each session; stay informed on assigned startups |
| Current tools       | WhatsApp, email                                                          |
| Core frustration    | "Filling in forms after every meeting is a chore I skip."                |

**Ahmad's interaction with Verrier:**

* Receives a link after being matched to a startup
* Submits meeting notes via a simple public form (no login required for MVP)
* Optionally views a lightweight summary of his mentorship history

---

### 4.3 Secondary User — Startup Founder

**Representative:** Aisha, founder applying to a Cradle/MaGIC-style accelerator

| Attribute           | Detail                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| Role                | Applies to programmes and later participates as a selected startup     |
| Technical level     | Moderate — comfortable with forms, pitch decks, and startup tools      |
| Device              | Desktop for application, mobile for status checks                      |
| Key jobs to be done | Find suitable programmes; understand fit; submit company/founder profile and documents |
| Core frustration    | "I do not know whether this programme is actually right for my stage, industry, and current needs." |

**Aisha's interaction with Verrier:**

* Opens a public programme application page
* Enters company profile, founder background, support needs, and documents
* Sees a simple programme-fit score and explanation before submitting
* Receives submitted / not selected / shortlisted / accepted status in MVP via confirmation page or email placeholder

---

### 4.4 Tertiary User — Programme Owner / Executive

**Representative:** Director of Ecosystem Development at Cradle Fund

| Attribute           | Detail                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| Role                | Oversight of all programmes; reports to board                                 |
| Technical level     | Low — needs reports, not dashboards                                          |
| Key jobs to be done | Understand cohort health; present data to board; justify programme investment |
| Verrier touchpoint  | Receives AI-generated PDF/text report monthly                                 |

---

### 4.5 Out of Scope Users (Post-MVP)

* Investors (deal flow visibility)
* Service providers (marketplace listing)
* Government stakeholders (compliance reporting)
* Full startup account portal with login, status inbox, and profile editing

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│   Programme Admin (Desktop)      Startup Applicant      Mentor      │
│   Next.js App Router             /apply/[programId]     /submit-meeting │
└───────────────────────┬─────────────────────┬───────────────────────┘
                        │ HTTPS               │ HTTPS
┌───────────────────────▼─────────────────────▼───────────────────────┐
│                      API LAYER (Cloud Run)                          │
│                                                                     │
│   /api/ai/program-fit    → Gemini applicant-programme fit analysis │
│   /api/ai/match          → Gemini mentor matching analysis          │
│   /api/ai/analyze-meeting → Gemini meeting analysis                 │
│   /api/ai/diagnose       → Gemini relationship diagnosis            │
│   /api/ai/cohort-summary → Gemini cohort narrative                  │
│   /api/programs/*        → CRUD for programme entities              │
│   /api/applications/*    → Startup application intake and review    │
│   /api/relationships/*   → CRUD for relationship entities           │
│   /api/meetings/*        → CRUD for meeting records                 │
└───────────┬─────────────────────────────────┬───────────────────────┘
            │                                 │
┌───────────▼───────────┐       ┌─────────────▼────────────────────┐
│   GOOGLE AI STUDIO    │       │         FIREBASE                 │
│                       │       │                                  │
│   Gemini 1.5 Flash    │       │   Firestore (primary database)   │
│   - Programme fit     │       │   Auth (Google Sign-in)          │
│   - Matching          │       │   Collections:                   │
│   - Meeting analysis  │       │     programs, applications,      │
│   - Health scoring    │       │     cohorts, companies, mentors, │
│   - Cohort summary    │       │     relationships, meetings,     │
│                       │       │     users                        │
└───────────────────────┘       └──────────────────────────────────┘
```

### 5.2 Request Flow — Startup Application & Programme Fit

```
Coordinator creates programme
        │
        ▼
Verrier stores programme criteria, required documents, application window
        │
        ▼
Startup opens /apply/[programId]
        │
        ▼
Startup enters company profile, founder background, support needs, documents
        │
        ▼
Gemini scores company-programme fit
        │
        ▼
Startup sees simple fit feedback and submits
        │
        ▼
Application enters applicant pool
        │
        ▼
Coordinator reviews AI insight, company profile, founders, documents
        │
        ▼
Coordinator approves / declines / waitlists
        │
        ▼
Approved application creates or updates Company record in selected cohort
```

### 5.3 Request Flow — Meeting Analysis (Core AI Flow)

```
Mentor submits notes (POST /submit-meeting)
        │
        ▼
API Route validates input
        │
        ▼
Fetch existing relationship record from Firestore
        │
        ▼
Assemble Gemini prompt (system + relationship context + raw notes)
        │
        ▼
Gemini 1.5 Flash responds with JSON
  {summary, actionItems, signal, healthScoreDelta}
        │
        ▼
Compute new HealthScore = clamp(current + delta, 0, 100)
        │
        ▼
Write meeting document to Firestore (meetings collection)
        │
        ▼
Update relationship document (healthScore, healthTrend, lastMeetingAt)
        │
        ▼
Return structured response to client
        │
        ▼
Dashboard Attention Feed recalculates (client-side re-fetch)
```

### 5.4 Deployment Architecture

```
GitHub (main branch push)
        │
        ▼
GitHub Actions: docker build → push to Artifact Registry
        │
        ▼
Cloud Run (asia-southeast1)
  Service: myhack-app
  Min instances: 0 (scale to zero when idle)
  Max instances: 3 (MVP)
  Memory: 512Mi
  CPU: 1
        │
        ├── Reads GEMINI_API_KEY from Secret Manager
        └── Reads Firebase config from environment
```

---

## 6. Core Domain Model

### 6.1 Entity Definitions

The central insight of Verrier's data model is that  **relationships are entities** , not join tables.

Verrier has two first-class relationship types in the MVP:

| Relationship Type | Meaning | Created When | Reviewed By |
| ----------------- | ------- | ------------ | ----------- |
| Company-Programme Application | A startup's fit and selection journey for a specific programme | Startup submits the public application form | Programme Coordinator |
| Mentor-Startup Assignment | A selected startup's active mentorship relationship inside a programme | Coordinator confirms a mentor match | Programme Coordinator |

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│   PROGRAM    │◄─────┤   APPLICATION    ├─────►│   COMPANY    │
│ id           │  1 N │ id               │ N 1  │ id           │
│ name         │      │ programId        │      │ name         │
│ type         │      │ companyId        │      │ stage        │
│ criteria     │      │ status           │      │ industry[]   │
│ targetStage[]│      │ fitScore         │      │ needsHelp[]  │
│ requiredDocs │      │ aiInsight        │      │ founders[]   │
└──────┬───────┘      │ decisionReason   │      └──────┬───────┘
       │              └──────────────────┘             │
       │                                               │
       │              ┌──────────────────┐             │
       └─────────────►│  RELATIONSHIP    │◄────────────┘
                  1 N │ id               │ N 1
                      │ programId        │
                      │ companyId        │         ┌─────────────┐
                      │ mentorId         ├────────►│   MENTOR    │
                      │ status           │ N 1     │ id          │
                      │ matchScore       │         │ expertise[] │
                      │ healthScore      │         │ industries[]│
                      │ healthTrend      │         │ availability│
                      │ aiDiagnosis      │         └─────────────┘
                      │ watchPoints[]    │
                      │ matchedAt        │         ┌─────────────┐
                      └────────┬─────────┘         │   MEETING   │
                               │ 1              N  │ rawNotes    │
                               └──────────────────►│ aiSummary   │
                                                    │ actionItems │
                                                    │ signal      │
                                                    └─────────────┘
```

### 6.2 Application Lifecycle

```
DRAFT          SUBMITTED         SHORTLISTED        APPROVED
(founder   →   (visible in   →   (high-potential → (becomes selected
 editing)       applicant pool)   applicant)        startup)

                         ↘
                          DECLINED / WAITLISTED
                          (decision reason stored)
```

Application status is separate from Company status. The same company may apply to multiple programmes over time, and each application keeps its own programme-fit score, AI insight, document checklist, and coordinator decision.

### 6.3 Mentor-Startup Relationship Lifecycle

```
PENDING          ACTIVE           PAUSED           COMPLETED
(matched,   →   (first meeting →  (no activity →   (programme
 not yet         logged)          for 21+ days)     ended or
 introduced)                                        early exit)

HealthScore:     HealthScore:     HealthScore:      HealthScore:
 60 (baseline)   0–100 (dynamic)  frozen            archived
```

### 6.4 HealthScore Algorithm

HealthScore is a 0–100 integer representing the quality and momentum of a mentor-startup relationship.

**Inputs:**

* Meeting frequency (days since last meeting)
* AI-assessed signal from each meeting (Positive / Neutral / Friction detected)
* Milestone completion rate
* Interaction trend over last 3 meetings

**Calculation (simplified for MVP):**

```
BaseScore = 60 (at match confirmation)

Per meeting:
  HealthScore = clamp(HealthScore + healthScoreDelta, 0, 100)
  where healthScoreDelta is returned by Gemini (-15 to +15)

Decay rule (applied daily):
  If daysSinceLastMeeting > 14: HealthScore -= 2 per day
  If daysSinceLastMeeting > 21: HealthScore -= 4 per day
  Floor: 0 (never negative)

HealthTrend:
  "improving"     → last 3 deltas average > 0
  "stable"        → last 3 deltas average between -3 and 0
  "deteriorating" → last 3 deltas average < -3
```

**Score bands:**

| Score   | Label    | Color | Dashboard action      |
| ------- | -------- | ----- | --------------------- |
| 70–100 | Healthy  | Green | No action needed      |
| 40–69  | At Risk  | Amber | Monitor closely       |
| 0–39   | Critical | Red   | Intervention required |

---

## 7. Feature Specifications

### 7.1 Feature Map

```
VERRIER MVP FEATURES
│
├── AUTH
│   └── F01: Google Sign-in (admin only)
│
├── PROGRAMME SETUP
│   ├── F02: Create / view programme
│   ├── F03: Define programme characteristics and selection criteria
│   ├── F04: Configure application window and required documents
│   └── F05: Publish public startup application page
│
├── STARTUP APPLICATION INTAKE  ← AI Feature 1
│   ├── F06: Startup enters company and founder profile
│   ├── F07: AI scores company-programme fit before submit
│   ├── F08: Submitted startups enter applicant pool
│   ├── F09: Coordinator reviews company profile, founders, documents, AI insight
│   └── F10: Coordinator approves / declines / waitlists applicant
│
├── MENTOR POOL MANAGEMENT
│   ├── F11: Maintain reusable organization-level mentor pool
│   ├── F12: Add mentors to a specific programme
│   └── F13: Mentors set interview / availability slots
│
├── MENTOR MATCHING ENGINE  ← AI Feature 2
│   ├── F14: View approved but unmatched startups
│   ├── F15: AI-generate top 3 mentor matches per startup
│   ├── F16: Admin confirms / overrides match
│   └── F17: Batch confirm all top suggestions
│
├── RELATIONSHIP MANAGEMENT
│   ├── F18: Auto-create Relationship entity on match confirm
│   ├── F19: View relationship list (filterable)
│   └── F20: Update milestone status
│
├── MEETING INTELLIGENCE  ← AI Feature 3
│   ├── F21: Mentor submits meeting notes (public form)
│   ├── F22: Gemini analyzes notes → summary + action items + signal
│   ├── F23: HealthScore updated automatically
│   └── F24: Meeting timeline displayed on relationship page
│
├── RELATIONSHIP HEALTH MONITORING  ← AI Feature 4
│   ├── F25: AI relationship diagnosis (per-pair narrative + watch points)
│   ├── F26: HealthScore decay (daily cron / on-demand)
│   └── F27: Attention Feed: surface at-risk pairs on dashboard
│
├── PROGRAMME INTELLIGENCE  ← AI Feature 5
│   ├── F28: Applicant funnel summary
│   ├── F29: Cohort health heatmap
│   ├── F30: Milestone distribution chart
│   └── F31: AI-generated programme narrative (management report)
│
└── ADMIN UTILITIES
    ├── F32: Dashboard overview (stat cards + attention feed)
    └── F33: Public meeting submission link generation
```

---

### 7.2 Feature Detail: F07 — AI Programme Fit Scoring

**Trigger:** Startup completes the public application form or coordinator clicks "Re-score" in the applicant pool

**Input:** Programme criteria + startup profile + founder background + support needs + uploaded document metadata

**Process:**

1. Fetch programme document from Firestore
2. Normalize startup answers into structured company profile
3. Assemble Gemini prompt (see AI System Design §8)
4. Parse structured JSON response
5. Store score, breakdown, eligibility flags, and recommendation on Application record

**Output to startup UI:**

* Simple fit score (0–100)
* Plain-language fit explanation
* "Strong fit", "Potential fit", or "Low fit" label
* Missing or weak areas, such as "Needs clearer revenue traction" or "Programme targets later-stage companies"

**Output to coordinator UI:**

* Applicant card with fit score, recommendation, criteria breakdown, AI insight, and document status
* Actions: Approve, Decline, Waitlist, Request more info

**Edge cases:**

* Gemini timeout: allow submission and mark "AI analysis pending"
* Missing required documents: allow draft but block final submit unless coordinator overrides
* Low fit score: do not block application; show recommendation but preserve founder choice

---

### 7.3 Feature Detail: F15 — AI Mentor Matching

**Trigger:** Admin clicks a startup card in /matching

**Input:** Startup profile + all available mentor profiles in the cohort

**Process:**

1. Fetch startup document from Firestore
2. Fetch all mentor documents assigned to this cohort
3. Assemble Gemini prompt (see AI System Design §8)
4. Parse structured JSON response
5. Render top 3 matches with scores + breakdown + reason

**Output to UI:**

* Ranked list of 3 mentor matches
* Per match: overall score (0–100), 4-dimension breakdown, plain-language reason, past cohort history flag
* Admin can confirm top match, or manually select a different mentor

**Edge cases:**

* < 3 available mentors: show all available, pad with "No more candidates" state
* Gemini timeout: show "Analysis unavailable — please select manually" with full mentor list
* Mentor already matched to 3+ startups: flag as "High load" with warning badge

---

### 7.4 Feature Detail: F22 — Meeting Intelligence

**Trigger:** Mentor submits notes via /submit-meeting form

**Input:** Raw text (meeting notes, min 50 characters), relationship ID, date, duration

**Process:**

1. Validate input (length, relationship ID exists)
2. Fetch relationship context (company name, mentor name, current health score, last 2 meeting summaries)
3. Assemble Gemini prompt with context
4. Parse JSON response
5. Write meeting document to Firestore
6. Update relationship: healthScore, healthTrend, lastMeetingAt, aiDiagnosis, watchPoints
7. Return structured response to client

**Output to admin UI:**

* New entry appears in meeting timeline (relationship detail page)
* HealthScore badge updates in real time
* If new score < 40: pair appears in dashboard Attention Feed

**Output to mentor (confirmation):**

* Simple confirmation screen: "Meeting logged ✓ — Verrier has processed your notes."
* Show the AI summary so mentor can verify accuracy

**Edge cases:**

* Notes too short (< 50 chars): validation error, request more detail
* Gemini returns malformed JSON: retry once, then store raw notes with "Analysis pending" label
* Duplicate submission (same date + relationship): warn user, allow override

---

### 7.5 Feature Detail: F27 — Attention Feed

**Trigger:** Dashboard page load

**Logic (client-side, from Firestore data):**

Priority ranking algorithm:

```
score = 0
if healthScore < 40: score += 100
if healthScore < 70: score += 50
if daysSinceLastMeeting > 21: score += 80
if daysSinceLastMeeting > 14: score += 40
if healthTrend === "deteriorating": score += 30
if currentMilestone behind expected: score += 20

Sort by score DESC → display top N pairs
```

**AI Enhancement:** For pairs with score > 50, generate a one-sentence AI reason ("No meeting logged in 18 days — last interaction showed misaligned expectations") via Gemini batch call on page load.

**Display:** Maximum 10 cards in Attention Feed. If 0 at-risk pairs: show positive empty state.

---

### 7.6 Feature Detail: F31 — AI Programme Narrative

**Trigger:** Admin clicks "Generate Report" on /program/[cohortId]

**Input:** All relationship records, meeting counts, health scores, milestone data for the cohort

**Output:** A 150–200 word management-ready paragraph covering:

* Overall cohort health summary
* Top performing pairs (highlights)
* At-risk pairs requiring attention
* Milestone completion rate vs expected
* Recommended actions for programme team

**Example output:**

> "Cohort Q2 2026 is progressing well at week 8 of 24. 31 of 38 mentor-startup pairs (82%) maintain healthy engagement scores above 70, reflecting strong programme cohesion. Standout pairs include NexaHealth-Dr. Priya Nair (score: 91) and ByteScale-Ahmad Razif (score: 82), both demonstrating consistent weekly cadence and milestone delivery. Three pairs — Agribot, UrbanFarm, and ClimateOS — present elevated risk with scores below 40 and meeting gaps exceeding 18 days; targeted intervention is recommended before week 10. Cohort milestone completion stands at 49% (94 of 190), aligned with programme timing. The primary systemic risk is mentor engagement frequency: 8 mentors have not logged a session in over 21 days."

---

## 8. AI System Design

### 8.1 Model Selection

**Primary model:** `gemini-1.5-flash`

Rationale:

* Best price/performance ratio for structured JSON tasks
* Sub-2-second response time for most prompts
* Native JSON mode via `responseMimeType: "application/json"`
* Sufficient context window for relationship history + meeting notes

**Fallback:** If Flash unavailable, degrade to cached last analysis result.

---

### 8.2 Gemini Integration Pattern

All AI calls go through `/api/ai/[endpoint]` route, never directly from the client.

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function callGemini<T>(
  systemPrompt: string,
  userContent: string,
  schema: object
): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,      // Low temp for consistent structured output
      maxOutputTokens: 1024,
    },
  });

  return JSON.parse(result.response.text()) as T;
}
```

**Safety rule:** Always request `responseMimeType: "application/json"`. Never parse free-text responses.

---

### 8.3 Prompt Specifications

#### PROMPT 1 — Programme Fit Scoring

```
SYSTEM:
You are an expert startup accelerator selection analyst.
Your job is to score how well a startup fits a specific programme based on the programme criteria and the startup's submitted profile.
Be fair, practical, and specific. Do not reject a startup automatically because of a weak signal unless it violates explicit eligibility criteria.
Always respond in valid JSON only.

USER CONTENT:
{
  "program": {
    "name": "[program name]",
    "type": "[accelerator | incubator | grant | corporate-innovation]",
    "targetStages": ["[stage]"],
    "targetIndustries": ["[industry]"],
    "targetMarkets": ["[country]"],
    "selectionCriteria": {
      "stageWeight": [number],
      "industryWeight": [number],
      "tractionWeight": [number],
      "teamWeight": [number],
      "needsFitWeight": [number]
    },
    "requiredDocuments": ["[documentType]"]
  },
  "startup": {
    "name": "[company name]",
    "stage": "[stage]",
    "industry": ["[industry1]", "[industry2]"],
    "country": "[country]",
    "businessModel": "[model]",
    "revenueMonthly": [number],
    "teamSize": [number],
    "needsHelp": ["[need1]", "[need2]"],
    "founderSummary": "[founder and team background]",
    "submittedDocumentTypes": ["[documentType]"]
  }
}

RESPONSE SCHEMA:
{
  "fitScore": number (0-100),
  "fitLabel": "Strong fit" | "Potential fit" | "Low fit",
  "aiRecommendation": "approve" | "review" | "decline",
  "aiInsight": "string (2-4 sentences explaining fit, strengths, and concerns)",
  "breakdown": {
    "stageFit": number (0-100),
    "industryFit": number (0-100),
    "tractionFit": number (0-100),
    "teamFit": number (0-100),
    "needsFit": number (0-100)
  },
  "eligibilityFlags": ["string"]
}
```

---

#### PROMPT 2 — Mentor Matching

```
SYSTEM:
You are an expert ecosystem matchmaker for startup accelerators in Southeast Asia.
Your job is to rank mentor candidates for a given startup based on compatibility.
Be specific in your reasoning — generic explanations reduce trust in your recommendations.
Always respond in valid JSON only.

USER CONTENT:
{
  "startup": {
    "name": "[company name]",
    "stage": "[stage]",
    "industry": ["[industry1]", "[industry2]"],
    "country": "[country]",
    "needsHelp": ["[need1]", "[need2]"],
    "founderBackground": "[background summary]",
    "businessModel": "[model]"
  },
  "mentors": [
    {
      "id": "[mentorId]",
      "name": "[name]",
      "expertise": ["[exp1]"],
      "industries": ["[ind1]"],
      "preferredStages": ["[stage]"],
      "mentorshipStyle": "[style]",
      "availabilityHoursPerMonth": [number],
      "hasFounderExperience": [bool],
      "geographies": ["[geo]"],
      "pastSuccessCount": [number]
    }
  ]
}

RESPONSE SCHEMA:
{
  "matches": [
    {
      "mentorId": "string",
      "overallScore": number (0-100),
      "reason": "string (2-3 sentences, specific to this pair)",
      "breakdown": {
        "industryMatch": number (0-100),
        "stageFit": number (0-100),
        "availability": number (0-100),
        "styleCompatibility": number (0-100)
      }
    }
  ]
}
Return exactly 3 matches, ranked highest to lowest score.
```

---

#### PROMPT 3 — Meeting Analysis

```
SYSTEM:
You are a relationship health analyst for an innovation accelerator.
Analyze mentor-startup meeting notes with precision and empathy.
Your analysis will be read by a programme manager making decisions about interventions.
Extract concrete, specific action items — not vague suggestions.
The relationship health signal must reflect the actual emotional tone and progress of the meeting.
Always respond in valid JSON only.

USER CONTENT:
{
  "relationshipContext": {
    "companyName": "[name]",
    "mentorName": "[name]",
    "currentHealthScore": [number],
    "meetingNumber": [number],
    "programmeWeek": [number],
    "previousSummaries": ["[summary1]", "[summary2]"]
  },
  "meeting": {
    "date": "[date]",
    "durationMinutes": [number],
    "rawNotes": "[full text of notes]"
  }
}

RESPONSE SCHEMA:
{
  "summary": "string (2-3 sentences, factual)",
  "actionItems": [
    {
      "owner": "startup | mentor",
      "task": "string (specific, actionable)",
      "dueDate": "string (YYYY-MM-DD) | null"
    }
  ],
  "signal": "Positive | Neutral | Friction detected",
  "signalReason": "string (1 sentence explaining the signal)",
  "healthScoreDelta": number (-15 to +15),
  "watchPoints": ["string"] (0-3 items, only if concerning patterns noticed)
}
```

---

#### PROMPT 4 — Relationship Diagnosis

```
SYSTEM:
You are a relationship health consultant for a startup accelerator.
Given the full history of a mentor-startup relationship, produce a clear diagnosis.
Your narrative will be displayed to a programme manager who may decide to intervene.
Be specific, honest, and constructive — avoid generic platitudes.
Always respond in valid JSON only.

USER CONTENT:
{
  "relationship": {
    "companyName": "[name]",
    "mentorName": "[name]",
    "matchScore": [number],
    "currentHealthScore": [number],
    "healthTrend": "[trend]",
    "daysSinceLastMeeting": [number],
    "meetingCount": [number],
    "currentMilestone": [number],
    "recentMeetings": [
      {
        "date": "[date]",
        "summary": "[summary]",
        "signal": "[signal]",
        "healthDelta": [number]
      }
    ]
  }
}

RESPONSE SCHEMA:
{
  "narrative": "string (3-4 sentences, overall relationship quality assessment)",
  "watchPoints": ["string"] (1-4 specific concerns, or empty if healthy),
  "recommendation": "string (1 sentence, what programme manager should do, if anything)"
}
```

---

#### PROMPT 5 — Cohort Narrative

```
SYSTEM:
You are a programme analytics officer writing a management summary for an innovation accelerator board.
Your summary will be read by executives who want clear, data-grounded insights — not filler.
Write in professional but accessible English. Use specific numbers.
Always respond in valid JSON only.

USER CONTENT:
{
  "cohort": {
    "name": "[name]",
    "weekNumber": [number],
    "totalWeeks": [number],
    "totalPairs": [number],
    "healthyPairs": [number],
    "atRiskPairs": [number],
    "criticalPairs": [number],
    "avgHealthScore": [number],
    "totalMilestones": [number],
    "completedMilestones": [number],
    "topPairs": [{ "company": "", "mentor": "", "score": 0 }],
    "criticalPairNames": ["string"],
    "mentorsInactive": [number]
  }
}

RESPONSE SCHEMA:
{
  "narrative": "string (150-200 words, management-ready paragraph)",
  "keyRisks": ["string"] (2-3 top risks),
  "recommendedActions": ["string"] (2-3 concrete actions for programme team)
}
```

---

### 8.4 AI Safety & Reliability

| Risk                                | Mitigation                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| Gemini API downtime                 | Cache last analysis result in Firestore; show "Last updated [time]" badge    |
| Malformed JSON response             | Retry once; if still malformed, store raw text with "Analysis pending" state |
| Hallucinated mentor IDs in matching | Validate all returned IDs against input list before rendering                |
| Biased matching output              | Always show breakdown scores so admin can inspect the reasoning              |
| Rate limiting                       | Queue requests with 500ms delay between calls; show progress indicator       |

---

## 9. Data Schema

### 9.1 Firestore Collections

#### `programs`

```typescript
interface Program {
  id: string;
  name: string;                  // "Cradle Startup Accelerator 2026"
  organizerName: string;         // "Cradle Fund"
  organizerId: string;           // admin user ID
  type: "accelerator" | "incubator" | "grant" | "corporate-innovation" | "university" | "challenge";
  description: string;
  targetStages: string[];        // ["pre-seed", "seed"]
  targetIndustries: string[];    // ["Fintech", "AI/ML"]
  targetMarkets: string[];       // ["Malaysia", "Singapore"]
  selectionCriteria: {
    stageWeight: number;
    industryWeight: number;
    tractionWeight: number;
    teamWeight: number;
    needsFitWeight: number;
  };
  requiredDocuments: string[];   // ["pitchDeck", "companyRegistration"]
  applicationOpenAt: Timestamp;
  applicationCloseAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  status: "draft" | "open" | "reviewing" | "matching" | "active" | "completed";
  mentorIds: string[];           // programme-specific mentor pool
  selectedCompanyIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `applications`

```typescript
interface Application {
  id: string;
  programId: string;
  companyId: string;
  founderContactEmail: string;
  status: "draft" | "submitted" | "shortlisted" | "approved" | "declined" | "waitlisted";

  // Startup-submitted content
  supportNeeds: string[];
  founderSummary: string;
  documentUrls: Record<string, string>;
  submittedAt: Timestamp | null;

  // AI programme-fit output
  fitScore: number;              // 0-100
  fitLabel: "Strong fit" | "Potential fit" | "Low fit";
  fitBreakdown: {
    stageFit: number;
    industryFit: number;
    tractionFit: number;
    teamFit: number;
    needsFit: number;
  };
  eligibilityFlags: string[];    // e.g. ["Missing company registration"]
  aiInsight: string;
  aiRecommendation: "approve" | "review" | "decline";

  // Coordinator decision
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  decisionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `cohorts`

```typescript
interface Cohort {
  id: string;                    // auto-generated
  name: string;                  // "Cradle Q2 2026"
  organizerName: string;         // "Cradle Fund"
  organizerId: string;           // admin user ID
  startDate: Timestamp;
  endDate: Timestamp;
  totalWeeks: number;
  status: "setup" | "matching" | "active" | "completed";
  companyIds: string[];          // references to companies collection
  mentorIds: string[];           // references to mentors collection
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `companies`

```typescript
interface Company {
  id: string;
  cohortId?: string;
  programIds: string[];
  name: string;
  registrationNumber?: string;
  stage: "idea" | "pre-seed" | "seed" | "series-a" | "series-b" | "growth";
  industry: string[];            // ["Fintech", "AI/ML"]
  country: string;               // "Malaysia"
  city?: string;
  businessModel: "B2B" | "B2C" | "B2B2C" | "Marketplace" | "Other";
  needsHelp: string[];           // ["GTM", "Fundraising", "Product"]
  founderBackground?: string;    // brief text description
  founders: Founder[];
  teamSize: number;
  revenueMonthly?: number;       // MYR, 0 if pre-revenue
  isMatched: boolean;
  createdAt: Timestamp;
}

interface Founder {
  name: string;
  role: string;
  email?: string;
  background: string;
  linkedInUrl?: string;
}
```

#### `mentors`

```typescript
interface Mentor {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  company: string;
  expertise: string[];           // ["GTM", "Fundraising", "Product Strategy"]
  industries: string[];          // ["Fintech", "SaaS"]
  preferredStages: string[];     // ["pre-seed", "seed"]
  mentorshipStyle: "hands-on" | "advisory" | "mixed";
  availabilityHoursPerMonth: number;
  availabilitySlots: AvailabilitySlot[]; // Calendly-style interview slots for MVP
  hasFounderExperience: boolean;
  hasInvestorExperience: boolean;
  geographies: string[];         // ["Malaysia", "Singapore"]
  languages: string[];           // ["English", "Bahasa Malaysia"]
  pastSuccessCount: number;      // past mentorships marked as successful
  cohortIds: string[];           // which cohorts this mentor is assigned to
  meetingSubmissionToken: string; // unique token for /submit-meeting link
  createdAt: Timestamp;
}

interface AvailabilitySlot {
  id: string;
  startsAt: Timestamp;
  endsAt: Timestamp;
  mode: "online" | "in-person";
  status: "available" | "held" | "booked";
  programId?: string;
}
```

#### `relationships`

```typescript
interface Relationship {
  id: string;
  programId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;

  // Match data
  status: "pending" | "active" | "paused" | "completed" | "terminated";
  matchScore: number;            // 0-100, from Gemini at time of matching
  matchReason: string;           // AI explanation at time of matching
  matchBreakdown: {
    industryMatch: number;
    stageFit: number;
    availability: number;
    styleCompatibility: number;
  };
  confirmedBy: string;           // admin user ID
  matchedAt: Timestamp;

  // Health tracking
  healthScore: number;           // 0-100, updated per meeting
  healthTrend: "improving" | "stable" | "deteriorating";
  lastMeetingAt: Timestamp | null;
  meetingCount: number;
  daysSinceLastMeeting: number;  // computed and stored on update

  // AI diagnosis (updated per meeting)
  aiDiagnosis: string;
  watchPoints: string[];

  // Milestones
  currentMilestone: number;      // 1-5
  milestonesCompleted: number[]; // [1, 2]
  milestoneCompletedAt: Record<number, Timestamp>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `meetings`

```typescript
interface Meeting {
  id: string;
  relationshipId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;

  // Meeting metadata
  date: Timestamp;
  durationMinutes: number;
  meetingNumber: number;         // sequential within relationship

  // Raw input
  rawNotes: string;
  submittedBy: "admin" | "mentor";
  submittedAt: Timestamp;

  // AI output
  aiSummary: string;
  actionItems: ActionItem[];
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;
  watchPoints: string[];

  // State
  aiProcessed: boolean;
  aiProcessedAt: Timestamp | null;
}

interface ActionItem {
  owner: "startup" | "mentor";
  task: string;
  dueDate: string | null;        // ISO date string
  completed: boolean;
  completedAt: Timestamp | null;
}
```

#### `users`

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "viewer";
  organizationId: string;        // e.g. "cradle-fund"
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

### 9.2 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Authenticated admins can read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Public meeting submission (mentor form)
    // Validate token against mentor document
    match /meetings/{meetingId} {
      allow create: if request.resource.data.keys().hasAll(['relationshipId', 'rawNotes', 'date'])
        && request.resource.data.rawNotes.size() >= 50;
    }
  }
}
```

---

## 10. API Contracts

### 10.1 `POST /api/programs`

**Purpose:** Create a programme and application configuration

**Request:**

```typescript
{
  name: string;
  type: Program["type"];
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: Program["selectionCriteria"];
  requiredDocuments: string[];
  applicationOpenAt: string;
  applicationCloseAt: string;
  startDate: string;
  endDate: string;
}
```

**Response:**

```typescript
{
  programId: string;
  applicationUrl: string; // /apply/[programId]
}
```

---

### 10.2 `POST /api/ai/program-fit`

**Purpose:** Score a startup application against programme criteria

**Request:**

```typescript
{
  programId: string;
  companyProfile: Partial<Company>;
  founderSummary: string;
  supportNeeds: string[];
  submittedDocumentTypes: string[];
}
```

**Response:**

```typescript
{
  fitScore: number;
  fitLabel: "Strong fit" | "Potential fit" | "Low fit";
  aiRecommendation: "approve" | "review" | "decline";
  aiInsight: string;
  breakdown: {
    stageFit: number;
    industryFit: number;
    tractionFit: number;
    teamFit: number;
    needsFit: number;
  };
  eligibilityFlags: string[];
}
```

---

### 10.3 `POST /api/applications`

**Purpose:** Submit a startup application into the applicant pool

**Request:**

```typescript
{
  programId: string;
  companyProfile: Partial<Company>;
  founderContactEmail: string;
  founderSummary: string;
  supportNeeds: string[];
  documentUrls: Record<string, string>;
}
```

**Response:**

```typescript
{
  applicationId: string;
  status: "submitted";
  fitScore: number;
  fitLabel: string;
}
```

---

### 10.4 `PATCH /api/applications/[applicationId]/decision`

**Purpose:** Coordinator approves, declines, shortlists, or waitlists an applicant

**Request:**

```typescript
{
  status: "shortlisted" | "approved" | "declined" | "waitlisted";
  decisionReason?: string;
}
```

**Response:**

```typescript
{
  applicationId: string;
  status: string;
  companyId: string;
}
```

---

### 10.5 `POST /api/ai/match`

**Purpose:** Generate top 3 mentor matches for a startup

**Request:**

```typescript
{
  startupId: string;
  programId: string;
  cohortId?: string;
}
```

**Response:**

```typescript
{
  matches: [
    {
      mentorId: string;
      mentorName: string;
      overallScore: number;
      reason: string;
      breakdown: {
        industryMatch: number;
        stageFit: number;
        availability: number;
        styleCompatibility: number;
      };
    }
  ]
}
```

**Error responses:**

* `400` — startupId and programId/cohortId missing
* `404` — startup or programme not found
* `503` — Gemini API unavailable (return cached result if available)

---

### 10.6 `POST /api/ai/analyze-meeting`

**Purpose:** Process meeting notes and update relationship health

**Request:**

```typescript
{
  relationshipId: string;
  date: string;              // ISO date
  durationMinutes: number;
  rawNotes: string;          // min 50 chars
  submittedBy: "admin" | "mentor";
}
```

**Response:**

```typescript
{
  meetingId: string;
  aiSummary: string;
  actionItems: ActionItem[];
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;
  newHealthScore: number;
  watchPoints: string[];
}
```

---

### 10.7 `POST /api/ai/diagnose`

**Purpose:** Generate AI diagnosis for a relationship

**Request:**

```typescript
{
  relationshipId: string;
}
```

**Response:**

```typescript
{
  narrative: string;
  watchPoints: string[];
  recommendation: string;
  updatedAt: string;
}
```

---

### 10.8 `POST /api/ai/cohort-summary`

**Purpose:** Generate management narrative for a cohort

**Request:**

```typescript
{
  cohortId: string;
}
```

**Response:**

```typescript
{
  narrative: string;
  keyRisks: string[];
  recommendedActions: string[];
  generatedAt: string;
}
```

---

### 10.9 `POST /api/relationships/confirm-match`

**Purpose:** Confirm a mentor-startup match (creates Relationship entity)

**Request:**

```typescript
{
  startupId: string;
  mentorId: string;
  cohortId: string;
  matchScore: number;
  matchReason: string;
  matchBreakdown: object;
}
```

**Response:**

```typescript
{
  relationshipId: string;
  status: "active";
  createdAt: string;
}
```

---

### 10.10 `GET /api/relationships`

**Purpose:** List relationships with filters

**Query params:**

* `cohortId` (required)
* `status` (optional: active | paused | completed)
* `healthBand` (optional: healthy | at-risk | critical)

**Response:**

```typescript
{
  relationships: Relationship[];
  summary: {
    total: number;
    healthy: number;
    atRisk: number;
    critical: number;
    avgHealthScore: number;
  }
}
```

---

### 10.11 `POST /submit-meeting` (Public, token-authenticated)

**Purpose:** Mentor meeting submission (no login required)

**Request:**

```typescript
{
  token: string;             // mentor's unique submission token
  date: string;
  durationMinutes: number;
  rawNotes: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  aiSummary: string;         // shown to mentor as confirmation
  actionItems: ActionItem[];
}
```

---

## 11. Frontend Specifications

### 11.1 Route Map

| Route                   | Page                   | Auth           |
| ----------------------- | ---------------------- | -------------- |
| `/`                   | Redirect → /dashboard | Required       |
| `/login`              | Google Sign-in         | Public         |
| `/dashboard`          | Command Center         | Required       |
| `/programs/new`       | Programme setup wizard | Required       |
| `/programs/[programId]/applicants` | Applicant pool | Required       |
| `/apply/[programId]`  | Startup application    | Public         |
| `/matching`           | Matching Engine        | Required       |
| `/relationships`      | All relationships list | Required       |
| `/relationships/[id]` | Relationship Detail    | Required       |
| `/program/[cohortId]` | Cohort Overview        | Required       |
| `/submit-meeting`     | Mentor meeting form    | Public (token) |

---

### 11.2 Page 1 — Dashboard `/dashboard`

**Header:** "Good morning, [name]" · Date · Active cohort pill

**Stat Cards (5):**

| Card               | Value                                | Color on threshold |
| ------------------ | ------------------------------------ | ------------------ |
| New Applicants     | Count submitted in active application window | —           |
| Total Active Pairs | Count                                | —                 |
| Healthy            | Count (score ≥ 70)                  | Green              |
| At Risk            | Count (score 40–69)                 | Amber              |
| Needs Attention    | Count (score < 40 or 14d no meeting) | Red                |

**AI Attention Feed (60% width):**

* Sorted by urgency score (see §7.4)
* Each card: priority badge · pair name · AI reason · health score + bar · CTA buttons
* Max 10 cards; empty state if all healthy

**Recent Meeting Summaries (40% width):**

* Last 3 AI-processed meetings
* Each card: pair name · date · AI summary · action items · signal badge
* Click → /relationships/[id]

---

### 11.3 Page 2 — Programme Setup `/programs/new`

**Purpose:** Let a coordinator create the programme container before applications open.

**Wizard steps:**

1. Basics: programme name, organizer, type, description, dates
2. Target profile: stages, industries, countries/markets, business models
3. Selection criteria: weighted sliders for stage, industry, traction, team, needs fit
4. Application setup: open/close dates, required documents, public page preview
5. Mentor setup: select mentors from organization pool or add seed mentors

**Primary action:** Create Programme → returns `/apply/[programId]` public URL.

---

### 11.4 Page 3 — Public Startup Application `/apply/[programId]`

**Purpose:** Simple public UI for startups to understand programme fit and apply.

**Sections:**

* Programme summary: name, dates, target stages, target industries
* Company profile: name, stage, industry, market, traction, team size, needs
* Founder profile: founder names, roles, background summary, contact email
* Documents: pitch deck, company registration, optional supporting files
* AI fit preview: score, label, brief explanation, missing/weak areas

**Submission:** POST `/api/applications`; show confirmation and application status.

---

### 11.5 Page 4 — Applicant Pool `/programs/[programId]/applicants`

**Purpose:** Coordinator reviews all startup applicants before cohort selection.

**Left panel:** Applicant table with filters (All · Strong fit · Needs review · Missing docs · Approved · Declined)

**Right panel:** Applicant detail drawer

* Company profile and founder background
* Uploaded document checklist
* AI fit score and criteria breakdown
* AI insight: strengths, concerns, suggested decision
* Actions: Approve, Decline, Waitlist, Request more info

**Approve action:** Creates or updates Company record and adds company to selected startup list for mentor matching.

---

### 11.6 Page 5 — Matching Engine `/matching`

**Left panel (35%):** Startup list with filter tabs (All · Unmatched · Matched)

**Right panel (65%):** Match results, appears on startup selection

* Top 3 mentor cards with overall score, 4-dimension breakdown bars, AI reason
* "Confirm Match" → POST /api/relationships/confirm-match
* "Batch Confirm All" → confirm all top suggestions at once

**Loading state:** "Analyzing compatibility across [N] mentor profiles..."

---

### 11.7 Page 6 — Relationship Detail `/relationships/[id]`

**Header:** Pair name · Health badge · Matched date · Cohort tag

**Stat row:** Meetings logged · Days since last meeting · Milestones completed

**Meeting Upload Modal:**

* Date picker · Duration input · Notes textarea (min 50 chars)
* Submit → AI analysis loading → result preview → Save to Timeline

**Meeting Timeline (60%):**

* Chronological, newest first
* Each entry: meeting number · date · duration · AI summary · action items · signal badge

**AI Diagnosis Panel (40%):**

* HealthScore (large) + trend arrow + spark line
* AI narrative paragraph
* Watch points list
* Interaction frequency mini-calendar

**Milestone Tracker:**

* 5-stage horizontal progress bar
* Click to mark complete · completion date logged

---

### 11.8 Page 7 — Cohort Overview `/program/[cohortId]`

**Header:** Cohort name · [Generate Report] button

**Stat bar:** Companies · Mentors · Avg health score · Weeks active · Milestones hit

**Health Heatmap:** Responsive grid of company cards colored by health score, filterable

**Milestone Distribution:** Bar chart showing companies per stage

**AI Cohort Narrative:** On-demand generation, copy to clipboard, export

---

### 11.9 Public Meeting Form `/submit-meeting`

**Accessed via:** Unique URL per mentor (contains token)

**Fields:** Date picker · Duration · Notes textarea

**Submission:** Calls POST /submit-meeting → shows AI summary as confirmation

**Design:** Mobile-first, minimal, no navigation

---

### 11.10 Design System

| Token             | Value                                               |
| ----------------- | --------------------------------------------------- |
| Framework         | Tailwind CSS v4                                     |
| Components        | shadcn/ui                                           |
| Color: Healthy    | Green (Tailwind `green-600`)                      |
| Color: At Risk    | Amber (Tailwind `amber-500`)                      |
| Color: Critical   | Red (Tailwind `red-600`)                          |
| Color: AI element | Purple (`purple-600`) — all AI-generated content |
| Notifications     | react-hot-toast                                     |
| Charts            | Recharts                                            |
| Icons             | lucide-react                                        |

**AI Content Convention:** All AI-generated text is marked with a subtle purple `✦ AI` badge to distinguish it from human-entered data.

---

## 12. Security & Access Control

### 12.1 Authentication

* Firebase Authentication with Google Sign-in
* Admin accounts provisioned manually for MVP
* Startup application is public per programme URL, no account required for MVP
* Mentor meeting submission uses a unique token (UUID per mentor), no account required

### 12.2 Role Matrix

| Action                   | Admin | Viewer | Startup Applicant | Mentor (token)      |
| ------------------------ | ----- | ------ | ----------------- | ------------------- |
| View dashboard           | ✓    | ✓     | ✗                | ✗                  |
| Create programme         | ✓    | ✗     | ✗                | ✗                  |
| Submit application       | ✗    | ✗     | ✓ (public URL)   | ✗                  |
| Approve / decline applicant | ✓ | ✗     | ✗                | ✗                  |
| Confirm mentor matches   | ✓    | ✗     | ✗                | ✗                  |
| View relationship detail | ✓    | ✓     | ✗                | ✗                  |
| Submit meeting notes     | ✓    | ✗     | ✗                | ✓ (own pairs only) |
| Generate cohort report   | ✓    | ✗     | ✗                | ✗                  |
| Add companies/mentors    | ✓    | ✗     | ✗                | ✗                  |

### 12.3 API Security

* All `/api/*` routes validate Firebase ID token in Authorization header
* `/api/applications` accepts public submissions only for programmes with `status == "open"` and current time inside the application window
* `/submit-meeting` validates mentor token against Firestore before processing
* Gemini API key stored in GCP Secret Manager, injected at runtime
* Firebase config keys are public (by design) but Firestore rules enforce data access

### 12.4 Malaysia Compliance (3R Rule)

Verrier operates in the Malaysian ecosystem context. All AI prompts include explicit guardrails:

* No content touching Race, Religion, or Royalty
* Programme data is business-focused and politically neutral
* No demographic categorisation of founders beyond professional attributes

---

## 13. SDG Alignment

### Primary: SDG 8 — Decent Work and Economic Growth

**Target 8.3:** Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation.

**How Verrier contributes:**

* Higher quality mentorship matching → higher startup survival rates → more jobs created
* Reducing manual coordination overhead → programme administrators can serve more startups
* Cross-cohort learning → each cohort produces better outcomes than the last

**Measurable impact:**

* If Verrier improves mentor-startup match quality by 20%, and match quality correlates with startup survival, even 2–3 additional startups surviving per cohort represents dozens of jobs and millions in economic output.

---

### Secondary: SDG 9 — Industry, Innovation and Infrastructure

**Target 9.b:** Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities.

**How Verrier contributes:**

* Provides digital infrastructure that allows innovation ecosystems to scale without proportional headcount increase
* Enables smaller ecosystem operators (NGOs, universities, government agencies) to run professional-grade programmes without enterprise software budgets
* Treats ecosystem relationship data as a compounding infrastructure asset

---

### Pitch SDG Slide (Rose — use these stats)

* Malaysia had 3,000+ startups in active incubation/acceleration programmes in 2025 (MDEC)
* Average programme manager handles 30–80 companies simultaneously
* Studies show mentor quality is the #1 predictor of startup programme outcomes (Endeavor Research)
* Verrier directly addresses the matching and monitoring bottleneck that limits programme scale

---

## 14. MVP Scope & Cut List

### In Scope (Must Demo)

| Feature                          | Why                                                |
| -------------------------------- | -------------------------------------------------- |
| Programme creation wizard        | Establishes the coordinator's first action and programme criteria |
| Public startup application page  | Makes the startup-facing entry point demoable      |
| AI programme-fit scoring         | Shows AI before mentor matching and explains shortlist logic |
| Applicant pool with approve/decline | Lets coordinator build the selected startup list |
| Dashboard with Attention Feed    | Core value prop visible immediately                |
| AI Mentor Matching (top 3)       | Primary AI touchpoint — most impressive to judges |
| Meeting submission + AI analysis | Second AI touchpoint — most practically useful    |
| Relationship detail page         | Shows HealthScore lifecycle                        |
| Cohort AI narrative              | Closes the loop — from data to management insight |

### Out of Scope (Post-MVP)

| Feature                          | Rationale                           |
| -------------------------------- | ----------------------------------- |
| Startup authenticated portal     | Public application page is enough for MVP |
| Mentor-facing dashboard          | Use simple form instead             |
| Full Calendly integration        | Use simple mentor availability slots |
| Real PDF export                  | Simulate with browser print         |
| Email/SMS notifications          | Use toast as stand-in               |
| Multi-cohort switching           | Demo one cohort                     |
| Real-time Firestore listeners    | Use manual refresh                  |
| Investor-facing views            | Different persona, different sprint |
| Service provider matching        | Lower priority than mentor matching |
| Cross-cohort analytics           | Requires historical data            |
| Mobile app                       | PWA acceptable for demo             |

### Demo Data Requirements (Seed Before Hackathon Day)

Seed the following into Firestore before pitching:

| Data          | Quantity                                         |
| ------------- | ------------------------------------------------ |
| Programs      | 1 active accelerator with scoring criteria       |
| Applications  | 12 startup applications with varied fit scores   |
| Companies     | 10 (varied stages, industries, needs)            |
| Mentors       | 15 (varied expertise, industries, styles)        |
| Relationships | 8 (mix of healthy, at-risk, critical)            |
| Meetings      | 12 (spread across relationships, varied signals) |
| Cohort        | 1 (Cradle Q2 2026, week 8 of 24)                 |

Ensure: at least 1 critical pair, 2 at-risk pairs, 1 unmatched startup for demo flow.

---

## 15. Success Metrics

### Demo Success Criteria

The pitch is successful if a judge can answer YES to all three:

1. "I understand the problem in 30 seconds."
2. "I can see the AI doing something a spreadsheet cannot."
3. "I believe this could work at scale."

### Product Success Metrics (Post-MVP / Real Deployment)

| Metric                         | Target                    | Measurement                                             |
| ------------------------------ | ------------------------- | ------------------------------------------------------- |
| Matching time reduction        | 80% faster than manual    | Compare cohort launch time before/after                 |
| At-risk detection lead time    | ≥ 14 days before dropout | Track pairs flagged vs pairs that eventually exit early |
| Programme manager NPS          | > 40                      | Post-cohort survey                                      |
| Mentor meeting submission rate | > 70% of meetings logged  | meetings.count / expected meeting count                 |
| Admin time saved per cohort    | ≥ 15 hours               | Self-reported time tracking                             |

### Hackathon Judging Criteria Alignment

| Judging Criterion             | Verrier's Answer                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| AI is genuinely indispensable | Every core action (match, monitor, report) requires Gemini — no AI = no product    |
| Real-world problem            | Cradle Fund, MaGIC, and every accelerator in Malaysia faces this daily              |
| Google stack depth            | Gemini 1.5 Flash + Firebase Auth + Firestore + Cloud Run + GCP Secret Manager       |
| SDG alignment                 | SDG 8 + SDG 9, with specific Malaysian ecosystem data points                        |
| Scalability vision            | Cross-cohort learning, multi-geography deployment, open API for ecosystem operators |
| Demo quality                  | 4-step judge journey, pre-loaded data, backup video, fallback mock data             |

---

## Appendix A — Glossary

| Term            | Definition                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Cohort          | A batch of startups enrolled in a programme during a specific period                             |
| Relationship    | A persistent, tracked entity representing a mentor-startup pairing                               |
| HealthScore     | 0–100 measure of a relationship's quality and momentum                                          |
| Attention Feed  | AI-sorted list of relationships requiring programme manager intervention                         |
| Signal          | AI-assessed emotional tone of a meeting: Positive / Neutral / Friction detected                  |
| Milestone       | A programme-defined stage checkpoint (1 of 5) that companies are expected to reach               |
| Watch Point     | A specific concern flagged by AI that may indicate future relationship problems                  |
| Ecosystem Actor | Any participant in the innovation ecosystem: startup, mentor, investor, partner, government body |

---

## Appendix B — Environment Variables

```bash
# AI
GEMINI_API_KEY=

# Firebase (client-side, public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only, via Secret Manager in production)
FIREBASE_SERVICE_ACCOUNT_KEY=

# App
NEXT_PUBLIC_APP_URL=https://myhack-app-[hash]-as.a.run.app
```

---

*Verrier_System_PRD.md · Team MyHack · v1.0*
*Build With AI 2026 KL – MyHack · Sunway University · May 16–17, 2026*
*Owners: Jeff (product + frontend) · Hamse (AI design) · Chun Xin (infra + schema) · Rose (design + SDG)*
