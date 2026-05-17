# Verrier Application Master Brief for Slides

**Project:** Verrier  
**Event:** Build With AI 2026 KL, Sunway University, Petaling Jaya  
**Repository:** MyHack  
**Version:** 0.5.1 interaction-polish  
**Last Updated:** 2026-05-17  
**Purpose:** One-file application summary for building a product pitch deck, demo script, or slide narrative.

---

## 1. One-Line Product Description

Verrier is an AI-powered ecosystem relationship management platform that helps innovation programme teams score startup fit, match mentors, monitor relationship health, and generate cohort intelligence.

---

## 2. Product Idea

Innovation programmes are relationship-heavy systems. Programme teams manage applicants, startups, mentors, meeting notes, cohort health, founder needs, and reporting expectations. In practice, this work often lives across spreadsheets, forms, WhatsApp groups, emails, memory, and manual status updates.

Verrier turns this messy relationship work into a structured operating system.

The core idea is:

> Verrier treats mentor-startup relationships as first-class data entities that can be matched, monitored, diagnosed, and improved over time.

The broader product idea is:

> Verrier is an ecosystem linkage layer. It can represent companies, mentors, programmes, partners, service providers, and initiatives as connected entities whose relationships can be matched, governed, monitored, and reused.

The MVP starts with the highest-friction linkage first: mentor-startup relationships inside accelerator programmes. This is the demo wedge, not the product boundary. The same relationship model extends to company-programme, partner-initiative, service-provider-company, and programme-initiative linkages.

Instead of only tracking whether a startup has been accepted into a programme, Verrier tracks the full lifecycle:

- what kind of programme is being run,
- which startups fit the programme,
- why a startup should be approved or reviewed,
- which mentor is the strongest match,
- whether the relationship is healthy,
- what happened in meetings,
- what actions are open,
- which relationships are drifting,
- and what management should do next.

---

## 3. Problem Statement

Programme administrators usually face four connected problems:

1. **Application overload**
   Startup applications are hard to compare consistently. Reviewers need to understand stage fit, industry fit, traction, team quality, and support needs quickly.

2. **Mentor matching is manual**
   Matching mentors to startups is often based on memory, informal judgment, availability guesses, and spreadsheet notes.

3. **Relationship health is invisible**
   A mentor-startup relationship can drift for weeks before anyone notices. Meeting notes may exist, but they are rarely converted into health signals.

4. **Reporting is repetitive**
   Programme owners want cohort summaries, risks, and recommended actions, but administrators often build these reports manually.

Verrier addresses these by using AI at the points where human coordinators need judgment support, not at the points where humans need control.

---

## 4. Product Thesis

Verrier’s thesis:

> AI should not replace the programme manager. AI should remove the invisible coordination burden so the programme manager can make better decisions faster.

The product is designed around the principle:

> AI does the analysis; humans make the call.

This means every AI feature is triggered explicitly by the user. Verrier does not silently call AI on page load, selection change, or passive background effects. The coordinator always knows when AI is being used.

---

## 5. Primary Users

| User | Role in the Product | Primary Jobs |
|---|---|---|
| Programme Administrator | Main coordinator and operator | Create programmes, review applicants, approve startups, match mentors, monitor risk, prepare reports |
| Startup Founder | Public application submitter | Submit company profile, founder details, support needs, and documents |
| Mentor | Public meeting note submitter | Submit session notes with minimal friction |
| Programme Owner | Strategic reader | Review cohort health, risks, and recommended actions |

Primary MVP persona:

> Sarah, a programme manager handling 2-4 cohorts, 30-120 startups, and 40-150 mentors.

Sarah’s pain is not that she lacks data. Her pain is that the useful signal is scattered across too many places.

---

## 6. Core Value Proposition

Verrier helps a programme team answer five operational questions:

1. **Which startups fit this programme?**
   AI programme-fit scoring evaluates applications against programme criteria.

2. **Which mentors should be matched to which startups?**
   AI mentor matching ranks mentors by industry, stage, availability, and style.

3. **Which relationships need attention?**
   Relationship health scores and attention feeds surface at-risk and critical pairings.

4. **What happened in the latest meeting?**
   AI meeting analysis summarizes notes, detects signals, extracts action items, and updates health.

5. **What should management know about this cohort?**
   AI cohort summaries produce narrative reports, key risks, and recommended actions.

---

## 7. MVP Goals

| Goal | What Verrier Demonstrates |
|---|---|
| Reduce application review time | AI-ranked applicant pool and fit explanations |
| Reduce mentor matching time | Top mentor recommendations with explainable scores |
| Surface at-risk relationships early | Health score, watch points, attention feed, diagnosis |
| Eliminate manual reporting | Cohort narrative generated from live programme data |
| Make AI indispensable | AI is used across fit scoring, matching, meeting analysis, diagnosis, and reports |

---

## 8. Complete Product Flow

```text
Coordinator opens dashboard
-> creates or reviews programmes
-> shares public application link
-> founder submits startup application
-> AI returns programme-fit score
-> coordinator reviews applicant pool
-> coordinator approves startup
-> UI nudges coordinator toward Matching
-> coordinator generates AI mentor matches
-> coordinator selects and confirms mentor match
-> relationship is created
-> coordinator copies mentor meeting submission link
-> mentor submits meeting notes
-> AI analyzes meeting health
-> coordinator reviews relationship detail
-> coordinator can log/analyze meeting inline
-> coordinator refreshes AI diagnosis
-> coordinator generates cohort report
```

---

## 9. Route and Page Overview

| Route | Page | Audience | Purpose |
|---|---|---|---|
| `/` | Root redirect | Any | Redirects to dashboard |
| `/login` | Login placeholder | Coordinator | Demo authentication entry |
| `/dashboard` | AI operations dashboard | Coordinator | View programme metrics, relationship health, attention feed, recent meetings |
| `/programs` | Programme list | Coordinator | Manage programmes and access programme detail/applicants |
| `/programs/new` | Programme setup wizard | Coordinator | Create programme criteria, targets, documents, dates, mentors |
| `/programs/[programId]` | Programme detail | Coordinator | View/edit programme settings and delete programme |
| `/programs/[programId]/applicants` | Applicant review pool | Coordinator | Review applicants, inspect AI insight, approve/decline/waitlist |
| `/apply/[programId]` | Public startup application | Startup founder | Submit company profile and request AI fit score |
| `/matching` | Mentor matching workbench | Coordinator | Generate AI mentor matches and confirm relationship |
| `/relationships` | Relationship list | Coordinator | Monitor all mentor-startup relationships |
| `/relationships/[id]` | Relationship detail | Coordinator | Inspect health, meeting history, diagnosis, log meeting, copy mentor link |
| `/submit-meeting` | Public mentor meeting form | Mentor | Submit meeting notes for AI analysis |
| `/program/[cohortId]` | Cohort overview | Coordinator / owner | Review cohort health and generate AI report |

---

## 10. Page-by-Page Application Detail

### 10.1 Dashboard

The dashboard is the programme command center. It gives the coordinator a quick answer to: "What needs my attention today?"

Current UI:

- Card-style top metric groups.
- Programme/application counts.
- Relationship health counts: healthy, at risk, critical, total relationships.
- Attention Feed with at-risk and critical relationship cards.
- Recent meeting summaries.
- Ecosystem Linkage Layer showing partners, service providers, initiatives, and reusable linkages beyond mentor-startup matching.
- Reusable Linkage Workbench with linkage-type filters, status chips, fit score, rationale, source/target details, and reusable signals.
- Health bars, status badges, AI badges, and skeleton loading.
- Critical count no longer flashes; it uses stable card styling.

Slide angle:

> Verrier starts from action, not reporting. The first screen tells the programme manager where to look.

### 10.2 Programme List

The programme list is the coordinator’s entry point for managing programmes.

Current UI:

- Programme cards with status, application count, approved count, mentors, and date range.
- Actions for View, Applicants, and Delete.
- Delete confirmation modal.
- Toast feedback for local delete.
- Empty state when no programmes exist.

Slide angle:

> A programme is the container for selection criteria, application intake, mentor pool, cohort formation, and reporting.

### 10.3 Programme Setup Wizard

The setup wizard captures the structure of a programme.

Coordinator defines:

- programme name,
- type,
- description,
- target startup stages,
- target industries,
- target markets,
- selection criteria weights,
- required documents,
- mentor pool,
- application and programme dates.

Current interaction:

- Save button appears only when required conditions are met.
- Criteria weights must total 100.
- Preview panel updates as the coordinator edits.
- Coordinator can generate an AI Ecosystem Pack directly from the programme profile.
- The Ecosystem Pack recommends grants, service providers, and partner linkages.
- AI drafts export-ready coordination documents: programme brief, grant readiness checklist, service-provider scope, partner outreach email, and application requirements.
- Documents can be copied or exported as Markdown for real coordinator follow-up.
- Save and reset actions use toast feedback.

Slide angle:

> Verrier lets the programme manager encode what "fit" means before applications arrive, then turns that programme definition into reusable ecosystem linkages and working documents.

### 10.4 Public Startup Application

The public application page is for founders.

Founder submits:

- company profile,
- founder profile,
- support needs,
- document metadata,
- founder summary.

AI event:

- Trigger: `Get fit score & submit`.
- API: `POST /api/ai/program-fit`.
- AI returns fit score, fit label, recommendation, explanation, breakdown, and eligibility flags.

Current interaction:

- AI is only called after explicit button click.
- AI loading state uses staged `AiOperationLoader`.
- Toast feedback communicates scoring status.
- Final submit confirmation dialog appears after score is ready.
- Pending/manual-review fallback still allows submission.

Slide angle:

> Founders get a transparent fit assessment; coordinators get structured, comparable applications.

### 10.5 Applicant Review Pool

The applicant pool helps coordinators review applications and make decisions.

Current UI:

- Filter tabs: all, submitted, shortlisted, approved, waitlisted, declined.
- Split layout: applicant queue on the left, selected applicant detail on the right.
- Detail panel includes company profile, fit score, AI insight, support needs, eligibility flags, and documents.
- Approve and decline use confirmation dialogs.
- Shortlist and waitlist update directly with toast feedback.
- After approval, a green banner nudges the coordinator to Matching.

AI involvement:

- No AI is called on this page.
- The page reads AI output from the earlier programme-fit scoring result.

Slide angle:

> Reviewers do not just see a score; they see the reason behind the recommendation and decide what happens next.

### 10.6 Matching Workbench

The matching page turns approved startups into mentor-startup relationships.

Current UI:

- Startup queue on the left.
- Selected startup summary on the right.
- Explicit `Generate AI matches` button.
- Animated matching loading state.
- Rich AI recommendation cards.

Mentor recommendation card shows:

- rank badge,
- mentor name,
- mentor role and company,
- overall match score,
- score breakdown bars,
- AI reason,
- warnings if available,
- selected state.

AI event:

- Trigger: `Generate AI matches`.
- API: `POST /api/ai/match`.
- AI ranks mentors by industry fit, stage fit, availability, and style compatibility.

Confirmation flow:

- Coordinator selects a mentor.
- Coordinator clicks `Confirm Match`.
- Confirmation dialog shows startup, mentor, score, and reason.
- API creates relationship through `POST /api/relationships/confirm-match`.
- Toast: `Match confirmed — relationship created`.
- After 1.5 seconds, coordinator is routed to `/relationships`.

Slide angle:

> Matching is not a black box. Verrier explains why each mentor is recommended.

### 10.7 Relationship List

The relationship list turns matches into ongoing operational entities.

Current UI:

- Relationship cards with company, mentor, status, health score, trend, meetings, days since last meeting, match score, and AI diagnosis snippet.
- Filters by status and health band.
- Health bar and status coloring.

Purpose:

- Monitor the relationship portfolio.
- Find healthy, at-risk, and critical pairings.
- Move from list-level health to detail-level diagnosis.

Slide angle:

> Verrier treats every mentor-startup pairing as a living relationship, not a completed assignment.

### 10.8 Relationship Detail

The relationship detail page is the operating view for one mentor-startup pair.

Current UI:

- Company and mentor header.
- Live health score.
- Health band and urgency label.
- Cohort and programme context.
- Copy Mentor Link button.
- Mentor meeting URL preview.
- Milestones.
- Match breakdown.
- AI diagnosis panel.
- Meeting timeline.
- Inline Log Meeting form.

Copy Mentor Link flow:

- Trigger: `Copy Mentor Link`.
- Copies `/submit-meeting?token={relationship.mentorId}`.
- Toast confirms mentor link copied.

Inline meeting analysis:

- Trigger: `Submit & Analyze`.
- API: `POST /api/ai/analyze-meeting`.
- Requires notes of at least 50 characters.
- Button shows `✦ Analyzing...` while loading.
- Result shows:
  - `✦ AI` badge,
  - signal badge,
  - health delta,
  - AI summary,
  - action items.

Relationship diagnosis:

- Trigger: `Refresh`.
- API: `POST /api/ai/diagnose`.
- Returns narrative, watch points, recommendation, updated timestamp.

Slide angle:

> Relationship detail is where Verrier turns meeting notes into operational intelligence.

### 10.9 Public Mentor Meeting Form

The public meeting form lets mentors submit notes with minimal friction.

Mentor submits:

- token,
- meeting date,
- duration,
- raw meeting notes.

AI event:

- Trigger: `Submit meeting notes`.
- API: `POST /api/ai/analyze-meeting`.
- AI returns summary, action items, signal, signal reason, health score delta, new health score, and watch points.

Fallback:

- If AI times out or network fails, the meeting still logs with a neutral pending state.

Slide angle:

> Mentors do not need to learn a dashboard. They submit notes; Verrier extracts the signal.

### 10.10 Cohort Overview

The cohort overview turns all relationship data into management intelligence.

Current UI:

- Cohort header.
- Health overview.
- Milestone distribution.
- Relationship heatmap.
- AI cohort report panel.

AI event:

- Trigger: `Generate Report`.
- API: `POST /api/ai/cohort-summary`.
- AI returns narrative, key risks, recommended actions, and generated timestamp.

Report actions:

- Copy report to clipboard.
- Fallback manual copy field if clipboard is unavailable.
- Local fallback report if Gemini is unavailable.

Slide angle:

> Verrier closes the loop by turning operational relationship data into management-ready reporting.

---

## 11. AI Features Summary

| AI Capability | User Trigger | Output | Human Decision |
|---|---|---|---|
| Programme fit scoring | Founder clicks `Get fit score & submit` | Fit score, label, recommendation, breakdown, insight | Coordinator decides applicant outcome |
| Programme ecosystem pack | Coordinator clicks `Generate Ecosystem Pack` | Recommended grants, service providers, partner linkages, draft documents | Coordinator reviews, exports, and uses the pack |
| Mentor matching | Coordinator clicks `Generate AI matches` | Ranked mentor cards with score and reason | Coordinator selects and confirms mentor |
| Meeting analysis | Mentor or coordinator submits meeting notes | Summary, action items, signal, health delta, watch points | Coordinator acts on relationship signal |
| Relationship diagnosis | Coordinator clicks `Refresh` | Narrative, watch points, recommendation | Coordinator decides intervention |
| Cohort summary | Coordinator clicks `Generate Report` | Narrative report, risks, recommended actions | Programme owner/coordinator uses report |

All AI calls are explicit. Verrier does not run AI silently in the background.

---

## 12. AI Models and API Routes

| API Route | Model | Purpose |
|---|---|---|
| `POST /api/ai/program-fit` | `gemini-3.0-flash-preview` | Score startup fit for a programme |
| `POST /api/ai/programme-ecosystem-pack` | `gemini-3.0-flash-preview` | Recommend grants, service providers, partner linkages, and draft exportable documents |
| `POST /api/ai/match` | `gemini-3.0-flash-preview` | Rank mentor matches for a startup |
| `POST /api/ai/analyze-meeting` | `gemini-3.0-flash-preview` | Summarize meeting notes and update relationship health |
| `POST /api/ai/diagnose` | `gemini-3.0-flash-preview` | Diagnose relationship state and recommend action |
| `POST /api/ai/cohort-summary` | `gemini-3.0-flash-preview` | Generate cohort management report |
| `POST /api/ai/parse-program` | `gemini-3.0-flash-preview` | Extract data from programme briefs |
| `POST /api/relationships/confirm-match` | Non-AI route | Create a relationship record after match confirmation |

Every AI route has deterministic fallback behavior when Gemini is unavailable or malformed output is returned.

---

## 13. Data Model Summary

Verrier’s core data model mirrors the lifecycle of an innovation programme.

| Collection / Type | Purpose |
|---|---|
| `programs` | Programme setup, criteria, application windows, mentor pool, selected companies |
| `applications` | Startup application, fit score, AI recommendation, review status |
| `companies` | Startup company and founder profile |
| `mentors` | Mentor profile, expertise, industries, availability, meeting submission token |
| `cohorts` | Batch container for selected companies and mentors |
| `relationships` | Mentor-startup pairing with match score, health score, diagnosis, milestones |
| `meetings` | Meeting notes, AI summary, action items, signal, health delta |
| `users` | Coordinator/admin identity and role |
| `ecosystemEntities` | Broader ecosystem actors such as partners, service providers, initiatives, programmes, companies, and mentors |
| `ecosystemLinkages` | Reusable non-mentor linkages such as partner-initiative, service-provider-company, and programme-initiative relationships |

Key concept:

> The `relationships` collection is the heart of Verrier. It connects companies, mentors, meetings, health, milestones, diagnosis, and reporting.

---

## 14. Relationship Health Model

Relationship health is the operational signal that makes Verrier more than an applicant tracker.

Each relationship tracks:

- match score,
- match reason,
- match breakdown,
- status,
- health score,
- health trend,
- days since last meeting,
- meeting count,
- AI diagnosis,
- watch points,
- current milestone,
- completed milestones.

Meeting analysis can adjust relationship health through `healthScoreDelta`.

Signals include:

- `Positive`
- `Neutral`
- `Friction detected`

Health bands:

- Healthy
- At Risk
- Critical

---

## 15. Demo Dataset

The MVP uses seed-backed data to make the full demo flow visible.

| Data | Quantity |
|---|---|
| Programmes | 1 active accelerator |
| Applications | 12 varied startup applications |
| Companies | 10 varied startups |
| Mentors | 15 varied mentors |
| Relationships | 8 mixed health states |
| Meetings | 12 varied meeting records |
| Cohorts | 1 active cohort, week 8 of 24 |

Demo includes:

- 1 critical pair,
- 2 at-risk pairs,
- 1 unmatched startup,
- approved applicants ready for matching,
- relationship history for health monitoring,
- cohort data for AI reporting.
- ecosystem entities for partners, service providers, grants, programmes, and initiatives.
- reusable ecosystem linkages beyond mentor-startup matching.

Broader ecosystem demo data:

| Entity / Linkage | Quantity | Purpose |
|---|---:|---|
| Ecosystem entities | 18 | Shows programmes, grant pathways, partners, service providers, and initiatives as addressable actors |
| Ecosystem linkages | 12 | Shows company-programme, partner-initiative, service-provider-company, and programme-initiative relationships |
| Partner / initiative examples | 7 | Demonstrates ecosystem coordination beyond mentor matching |
| Service-provider examples | 6 | Demonstrates support-provider matching for cloud, legal, regulatory, product, impact, and talent needs |
| Grant pathway examples | 3 | Demonstrates non-dilutive funding recommendations during programme setup |

---

## 16. UX and Interaction Principles

Verrier’s interaction model is intentionally operational:

- **Selection previews.** Selecting a startup, applicant, relationship, filter, or programme changes context only.
- **AI is button-driven.** Every AI call has a clear user action.
- **Humans decide.** AI produces recommendations and explanations; coordinators approve, match, refresh, and confirm.
- **Long-running work is visible.** AI operations show loaders and toast feedback.
- **Handoffs are guided.** Approval nudges toward Matching; confirmed match routes to Relationships; relationship detail exposes the mentor link.
- **Fallbacks are designed.** If AI is unavailable, local deterministic behavior keeps the demo moving.

---

## 17. Visual Design Direction

Verrier uses the Morandi Tech design direction.

Design traits:

- calm operational surfaces,
- dense but readable layouts,
- muted color palette,
- card-based metrics,
- subtle AI badges,
- meaningful status colors,
- restrained motion,
- no decorative gradients or marketing hero treatment.

Important visual language:

- `✦ AI` badge marks AI-generated outputs.
- Health uses green/amber/red.
- AI recommendation areas use muted primary/AI accent.
- Cards and panels keep small radii and clear borders.
- Toasts communicate async status.
- Confirmation dialogs protect high-impact decisions.

---

## 18. Current Implementation Status

Current status:

> Feature-complete MVP with interaction polish, explicit AI triggers, live demo routes, deterministic fallback behavior, and passing lint/build.

Verification status:

- `npm run lint` passes.
- `npm run build` passes.
- Next.js 16.2.6 Turbopack root is explicitly configured in `next.config.ts`.
- Production build generates all core demo routes and AI API routes.

Completed:

- Programme foundation.
- AI Ecosystem Pack for programme-level grant, service-provider, partner-linkage, and document drafting.
- Public startup application.
- AI programme-fit scoring.
- Applicant review pool.
- Mentor matching workbench.
- Match confirmation.
- Relationship list and detail.
- Public mentor meeting form.
- Inline meeting analysis.
- Relationship diagnosis.
- Cohort overview.
- AI cohort summary.
- Dashboard redesign.
- Toast system.
- Shared button interactions.
- AI loading visuals.
- Confirmation dialogs for key decisions.
- Post-approval matching nudge.
- Mentor link copy.
- Rich mentor recommendation cards.

Known technical debt:

- Programme CRUD is local state only.
- Firestore persistence is mainly wired to match confirmation.
- Auth is a demo placeholder.
- Mentor link token should be aligned with the public meeting form’s expected `meetingSubmissionToken`.

---

## 19. Technology Stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16.2.6 App Router |
| UI | React 19.2.4, TypeScript, Tailwind CSS v4 |
| Components | shadcn conventions, Base UI, class-variance-authority, lucide-react |
| Feedback | react-hot-toast |
| AI | Google Gemini via `@google/generative-ai` |
| Data | Firebase Firestore and seed data |
| Auth | Firebase Auth initialized, demo auth placeholder |
| Deployment | Docker, Docker Compose, GitHub Actions, Google Cloud Run |
| Region | `asia-southeast1` |

Important engineering note:

> The app uses Next.js 16.2.6, which has breaking changes compared with older Next.js assumptions. The repository instructions require reading local Next docs before changing framework APIs.

---

## 20. Security and Governance

MVP security requirements:

- Coordinator/admin surfaces should require Firebase Auth in production.
- Public application should only accept submissions for open programmes.
- Public meeting submission should use token-based access.
- Private Gemini API key stays server-side.
- Firestore rules are collection-aware.
- AI prompts include Malaysia context guardrail: evaluate only on professional and business criteria; do not assess race, religion, or royalty.

---

## 21. Differentiation

Verrier is not just:

- an application form,
- a CRM,
- a meeting note tool,
- or a reporting dashboard.

It connects all of them around the relationship lifecycle.

What makes it different:

- Fit scoring happens before review.
- Mentor matching is explainable.
- Relationships have health, trend, milestones, and diagnosis.
- Meeting notes update relationship intelligence.
- Cohort reports are generated from actual relationship data.
- AI is embedded at decision points, not sprinkled onto the interface.
- The same linkage model can represent partners, service providers, initiatives, programmes, companies, and mentors.
- Mentor-startup matching is the MVP wedge; the product thesis is broader ecosystem linkage automation.

---

## 22. Judging Criteria Alignment

This section maps Verrier directly to the judging rubric.

Estimated current scoring position after demo hardening:

| Rubric area | Estimated score | Rationale |
|---|---:|---|
| Technical Implementation and Architecture | 32-35 / 40 | Working Next.js MVP, server-side Gemini routes, Firestore readiness, Cloud Run workflow, passing lint/build |
| Business Innovation and Problem Solving | 33-36 / 40 | Strong problem-solution fit around programmable relationship entities; clear ecosystem stakeholders |
| Presentation and Pitching | 15-17 / 20 | Strong narrative and demo flow; final score depends on slide quality and live demo execution |
| Overall | 80-88 / 100 | Strong hackathon-ready MVP with remaining gaps in production auth, full persistence, and measured AI evaluation |

### Technical Implementation and Architecture

Verrier demonstrates a working Next.js and React prototype with server-side AI API routes, structured domain types, seed-backed demo data, Firebase readiness helpers, Firestore rules, Docker configuration, and a Google Cloud Run deployment workflow.

Relevant evidence:

- Next.js App Router pages cover the full operating flow: dashboard, programmes, public application, applicant review, matching, relationships, meeting submission, and cohort overview.
- Server-side AI routes keep `GEMINI_API_KEY` private and return structured JSON.
- `safeWrite` restricts Firestore writes to documented MVP collections and returns clear fallback metadata.
- `firestore.rules` defines collection-specific access patterns for programmes, applications, companies, mentors, relationships, meetings, cohorts, and users.
- Docker and GitHub Actions provide a feasible deployment path to Cloud Run.
- `npm run lint` and `npm run build` pass after final demo hardening.

### Google Technology Integration

Verrier uses Google technologies as part of the core product, not as a side feature.

| Google technology | Where used | Why it matters |
|---|---|---|
| Gemini API | Programme fit scoring, mentor matching, meeting analysis, relationship diagnosis, cohort summary, programme brief parsing | Converts unstructured ecosystem data into structured recommendations, signals, and reports |
| Firebase Firestore | MVP collection model, Firestore rules, safe write boundary, match confirmation persistence path | Provides the relationship graph data layer needed for reusable ecosystem entities |
| Firebase Auth | Initialized as the production auth direction | Supports coordinator/admin and viewer role separation in a production version |
| Google Cloud Run | GitHub Actions deploy workflow targets Cloud Run in `asia-southeast1` | Gives the app a realistic deployment path for Malaysia and Southeast Asia demos |

Technology choice rationale:

- Gemini is appropriate because the hard parts of the problem are judgment-heavy: scoring programme fit, comparing mentor compatibility, summarizing meeting notes, detecting relationship risk, and producing management-ready cohort narratives.
- Firestore fits the MVP because ecosystem entities are document-oriented and relationship records can evolve over time with meetings, health scores, diagnosis, watch points, and milestones.
- Cloud Run fits the deployment model because the Next.js standalone build can run as a containerized web service with server-side AI routes.

### AI Implementation Quality

AI is essential to Verrier because the product value depends on converting messy coordination inputs into reusable operational intelligence.

Core AI jobs:

- Score startup applications against programme criteria.
- Recommend programme-level grants, service providers, and partner linkages.
- Draft reusable coordination documents for programme launch and partner follow-up.
- Rank mentors for approved startups.
- Summarize meeting notes and extract action items.
- Detect relationship health signals.
- Generate relationship diagnosis and cohort reports.
- Extract programme setup parameters from a brief.

Human oversight:

- AI calls are triggered by explicit user actions.
- AI recommendations are shown with rationale and score breakdowns.
- Coordinators approve applicants, select mentors, confirm matches, and decide interventions.
- The product principle is: AI does the analysis; humans make the call.

Ethical AI considerations:

- Prompts instruct Gemini to evaluate only professional and business criteria.
- Prompts explicitly exclude race, religion, and royalty from assessment.
- The UI labels AI-generated outputs with `✦ AI`.
- Private Gemini credentials stay server-side.
- Meeting notes and founder data are only sent to AI when the user triggers an AI action.
- Production roadmap should add explicit consent copy for founders and mentors before AI analysis.

### AI Model Performance

The MVP contains engineering controls that reduce hallucinations and malformed outputs.

Implemented controls:

- `responseMimeType: "application/json"` is used for structured Gemini responses.
- API routes parse and validate AI output before returning it to the UI.
- Numeric scores are clamped into expected ranges.
- Mentor IDs returned by Gemini are checked against the known mentor pool.
- Ecosystem Pack recommendations are constrained to known service categories and reusable ecosystem entities.
- If Gemini fails, times out, or returns malformed JSON, deterministic fallback logic keeps the demo usable.
- Meeting analysis, diagnosis, cohort summary, matching, and programme fit scoring all have fallback behavior.

Suggested evidence slide:

| Evaluation area | Demo evidence to show |
|---|---|
| Accuracy | Compare AI top-3 mentor recommendations against a manually selected best mentor for 10 demo startups |
| Consistency | Show that identical seed inputs produce stable score ranges and valid JSON output |
| Hallucination reduction | Demonstrate that invalid Gemini mentor IDs are rejected and local fallback ranking is used |
| Efficiency | Record average response time for fit scoring, matching, meeting analysis, and cohort summary |
| Reliability | Show the fallback state when Gemini is unavailable and confirm the user can continue the workflow |

Suggested pitch metric language:

> In the MVP, we evaluate AI quality through recommendation agreement, valid structured output rate, response time, and fallback recovery. The system is designed so malformed AI output cannot directly create an invalid relationship record.

### Working Demo and UI/UX

The demo demonstrates the complete core workflow:

```text
Programme setup
-> Gemini ecosystem pack
-> grants, service providers, partner linkages, draft documents
-> founder application
-> Gemini fit score
-> applicant review
-> Gemini mentor matching
-> human match confirmation
-> relationship record
-> meeting submission
-> Gemini meeting analysis
-> relationship diagnosis
-> cohort report
```

UI strengths:

- Operational dashboard starts from attention and risk, not marketing copy.
- AI features are button-driven and visible.
- Programme setup now produces a concrete ecosystem operating pack, not only a programme record.
- Loading states, toast feedback, confirmations, and fallback states are designed.
- Relationship cards expose health score, trend, meeting count, last activity, match breakdown, watch points, and AI insight.
- Public forms reduce friction for founders and mentors.

---

## 23. Business Model and Scalability

Primary customers:

- Accelerators and incubators.
- Government innovation agencies.
- University entrepreneurship programmes.
- Corporate innovation teams.
- Regional ecosystem platforms.

Primary beneficiaries:

- Programme administrators reduce manual review, matching, follow-up, and reporting work.
- Startups receive more relevant mentor and programme support.
- Mentors get cleaner context and lower admin burden.
- Programme owners get earlier visibility into cohort risk and outcomes.

Business model options:

| Model | Fit |
|---|---|
| SaaS per programme team | Best MVP path; charge by active programme, seats, and relationship volume |
| Ecosystem platform license | Suitable for government or regional operators managing multiple initiatives |
| Usage-based AI add-on | Charge for AI scoring, matching, diagnosis, and reports above included quota |
| Services plus platform | Useful for first deployments where customers need onboarding and data migration |

Scalability considerations:

- Firestore collections map cleanly to programmes, applications, companies, mentors, relationships, meetings, cohorts, and users.
- Relationship records are reusable across reporting, diagnosis, health monitoring, and future matching.
- Gemini calls are explicit rather than passive, which controls cost and avoids background AI spend.
- Deterministic fallback logic allows the demo and future product to remain usable during AI failures.
- Cloud Run provides a path to horizontal scaling for the web app and API routes.

Cost controls:

- Use Gemini Flash-class models for fast, lower-cost operational analysis.
- Trigger AI only when the user requests scoring, matching, diagnosis, meeting analysis, or report generation.
- Cache or persist AI outputs such as match rationale, diagnosis, and cohort reports.
- Use deterministic heuristics for pre-filtering and fallback before asking Gemini for narrative reasoning.

---

## 24. Deployment Readiness

Current deployment path:

- Next.js standalone output is enabled.
- Dockerfile builds the application into a production runner image.
- Docker Compose supports local development.
- GitHub Actions authenticates to Google Cloud and deploys to Cloud Run.
- Cloud Run service is configured for `asia-southeast1`.
- Runtime environment variables include Gemini and Firebase configuration.

Production hardening roadmap:

- Enforce Firebase Auth on coordinator/admin routes.
- Add Firebase ID token verification in server routes before privileged writes.
- Persist programme CRUD, application decisions, meeting analysis, and diagnosis updates to Firestore.
- Align mentor meeting links with secure `meetingSubmissionToken` flow.
- Add audit logs for AI decisions, human overrides, and relationship changes.
- Add evaluation dashboard for AI latency, fallback rate, and recommendation acceptance rate.

Deployment pitch line:

> Verrier is deployable today as a Cloud Run-hosted Next.js service, with Gemini server routes and Firebase-ready data boundaries. The remaining work is production auth enforcement and full Firestore persistence beyond the match-confirmation path.

---

## 25. Presentation Scoring Strategy

Recommended pitch narrative:

```text
Problem:
Ecosystem relationships are still coordinated manually.

Insight:
The core asset is not the application spreadsheet. It is the relationship graph.

Solution:
Verrier turns linkages into first-class programmable entities.

AI:
Gemini scores fit, ranks mentors, analyzes meetings, diagnoses relationship risk, and generates cohort intelligence.

Impact:
Programme teams reduce manual coordination, catch relationship drift earlier, and reuse engagement data across programmes.
```

Recommended diagram:

```text
Actors
  Founder -> Application
  Mentor -> Meeting Notes
  Coordinator -> Decisions

Programmable Entities
  Programme -> Application -> Company
  Company + Mentor -> Relationship
  Relationship -> Meetings -> Health -> Diagnosis
  Cohort -> Report

AI Layer
  Fit Scoring
  Mentor Matching
  Meeting Analysis
  Relationship Diagnosis
  Cohort Summary
```

Recommended demo emphasis:

- Do not demo every page equally.
- Spend most time on the transformation from approved startup to AI match to living relationship record.
- Show one fallback or governance detail briefly to prove reliability.
- End on cohort report because it shows the management-level value of relationship data.

---

## 26. Suggested Slide Structure

### Slide 1. Title

**Verrier**  
AI-powered relationship management for innovation programmes.

### Slide 2. Problem

Programme teams manage applications, mentors, meetings, health, and reporting across disconnected tools.

### Slide 3. Insight

The real asset in an accelerator is not the spreadsheet. It is the mentor-startup relationship.

### Slide 4. Solution

Verrier turns applications, matching, meetings, relationship health, and reporting into one AI-assisted operating system.

### Slide 5. User Journey

Show the full flow:

```text
Programme setup -> AI ecosystem pack -> application -> AI fit score -> review -> AI match -> relationship -> meeting analysis -> diagnosis -> cohort report
```

### Slide 6. AI Fit Scoring

Founder submits profile. Gemini scores fit and explains recommendation.

### Slide 6A. AI Ecosystem Pack

Coordinator creates a programme, then Gemini recommends grants, service providers, and partner linkages while drafting export-ready coordination documents.

### Slide 7. Applicant Review

Coordinator compares applicants using fit score, AI insight, support needs, flags, and documents.

### Slide 8. AI Mentor Matching

AI ranks mentors with score breakdown and explanation. Human confirms.

### Slide 9. Relationship Health

Every match becomes a relationship with health score, milestones, watch points, and timeline.

### Slide 10. Meeting Intelligence

Mentor or coordinator submits notes. AI summarizes, extracts actions, detects signal, and updates health.

### Slide 11. Cohort Intelligence

Verrier generates management-ready narrative, key risks, and recommended actions.

### Slide 12. Architecture

Next.js, React, Firebase, Firestore, Gemini, server-side AI APIs, deterministic fallbacks.

### Slide 13. Google Technology Choices

Explain why Gemini, Firebase, Firestore, and Cloud Run were selected.

### Slide 14. AI Safety and Reliability

Human-in-loop decisions, bias guardrails, JSON validation, deterministic fallbacks, privacy boundary.

### Slide 15. Business Model and Scale

SaaS for programme teams, ecosystem platform licenses, usage-based AI add-ons.

### Slide 16. Demo Status

Feature-complete MVP: all core routes live, programme ecosystem pack added, AI routes wired, lint/build passing.

### Slide 17. Roadmap

Persist programme CRUD, enforce production auth, add DOCX/PDF exports, add notifications, deepen analytics.

### Slide 18. Closing

Verrier helps programme teams know who belongs together and when relationships are drifting before anyone notices.

---

## 27. Demo Script

1. Open dashboard.
   Show metric cards, attention feed, and relationship health.

2. Open programmes.
   Show programme list and setup wizard.

3. Create a programme ecosystem pack.
   Generate grants, service-provider recommendations, partner linkages, and exportable draft documents.

4. Open public application.
   Submit startup details and trigger AI fit score.

5. Open applicant pool.
   Review AI insight, approve applicant, show Matching nudge.

6. Open matching workbench.
   Generate AI mentor matches and inspect recommendation cards.

7. Select mentor and confirm.
   Show confirmation dialog and relationship creation toast.

8. Open relationships.
   Show relationship portfolio and health filtering.

9. Open relationship detail.
   Copy mentor link, inspect diagnosis, log meeting inline.

10. Submit meeting notes.
   Show AI summary, signal, health delta, and action items.

11. Open cohort overview.
    Generate AI report and copy it.

---

## 28. Key Phrases for Pitch

- "Verrier is the operating system for accelerator relationships."
- "AI does the analysis; humans make the call."
- "We turn meeting notes into relationship health signals."
- "Matching is explainable, not magical."
- "Every mentor-startup pair becomes a living relationship record."
- "Programme managers get early warning before relationships drift."
- "Cohort reporting becomes a generated output of live relationship data."
- "The relationship is the reusable unit of ecosystem coordination."
- "Gemini helps convert scattered programme signals into structured relationship intelligence."
- "Verrier does not automate away the coordinator; it gives the coordinator a better operating system."

---

## 29. Final Product Summary

Verrier is a feature-complete MVP for AI-assisted innovation programme management. It begins with programme setup and startup applications, uses Gemini to score programme fit, helps coordinators approve applicants, ranks mentor matches, creates tracked relationships, analyzes meeting notes, diagnoses relationship health, and generates cohort intelligence.

The application is built around a clear operational philosophy:

```text
Structured programme data
-> explicit AI analysis
-> human decision
-> relationship tracking
-> health intelligence
-> management reporting
```

For a slide deck, the story should focus on one transformation:

> Verrier turns scattered programme coordination into a live relationship intelligence system.
