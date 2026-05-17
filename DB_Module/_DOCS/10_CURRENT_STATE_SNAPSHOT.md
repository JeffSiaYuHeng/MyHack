# Verrier — Current State Snapshot

**Last Updated:** 2026-05-17  
**Purpose:** Full audit of all pages, components, navigation, data flow, and implemented features as of the latest build session.

---

## Navigation Structure

### Sidebar (ProductShell)

| Label | Route | Icon | Notes |
|---|---|---|---|
| Dashboard | `/dashboard` | LayoutDashboard | Main command centre |
| Programmes | `/programs` | Briefcase | List of all 4 programmes |
| Startups | `/startups` | Building2 | Global startup list |
| Mentors | `/mentors` | GraduationCap | Global mentor list |
| Matching | `/matching` | GitBranch | AI matching workbench |
| Relationships | `/relationships` | Users | Relationship health list |

**Bottom of sidebar:**
| Label | Route | Notes |
|---|---|---|
| Settings | `#` | Placeholder (not yet wired) |
| Support | `/support` | ✅ Live — links to Support Centre page |
| Log In / Out | `/login` | Demo auth placeholder |

**Dynamic Top Bar:**  
The top bar reads the current `pathname` and renders the active page title. Cohort Overview pages show the cohort name. All main pages display their label.

---

## Page Inventory

### `/dashboard` — Dashboard Command Centre

**Component:** `components/features/dashboard-command-center.tsx`

#### Stat Cards (4)
| Card | Source | Value |
|---|---|---|
| Programmes | `seedPrograms.length` | 4 (all programmes, not filtered) |
| Active Cohorts | `seedCohorts.filter(status=active)` | 1 |
| New Applications | `seedApplications.filter(submittedAt != null)` | Dynamic |
| Approved Startups | `seedApplications.filter(status=approved)` | Dynamic |

#### AI Hero Section (View Cohort CTA)
- Purple gradient banner linking to `/program/cohort-cradle-q2-2026`
- "Instant Cohort Intelligence" label with animated pulse dot

#### Health Score Distribution + Watchlist (2-column)

**Left — Bar Chart:**
- Recharts `BarChart` showing distribution of relationship health bands
- Bands: Critical / At Risk / Healthy, colour-coded

**Right — Watchlist:**
- Persisted to `localStorage["verrier_watchlist"]` as array of company IDs
- Shows: coloured initials avatar, company name, industry tag, mini 5-bar indicator, health score
- `+` button opens Add to Watchlist dialog
- Hover reveals `✕` remove button per row
- **Add to Watchlist Dialog:**
  - Search by name or industry (autofocus)
  - Lists all `seedCompanies` with avatar, name, industry, health score, checkbox toggle
  - Footer shows "X on watchlist · saved to browser" + Done button
  - Click outside or Done to close

#### Attention Feed (lg:col-span-2)

**Filter Chips:**
| Chip | Filter | Dot |
|---|---|---|
| All | Show all | Grey |
| Critical | `band === "critical"` | Red |
| At Risk | `band === "at-risk"` | Amber |
| Healthy | `band === "healthy"` | Green |

- Active chip: filled dark background + white text
- Max **5 cards** visible; overflow shows `+N more relationships → View all` dashed pill
- Each card: coloured left accent bar, company ↔ mentor, health score (3xl), status badge, days since meeting, AI insight box
- Clicks through to `/relationships/[id]`

#### Recent Meetings (lg:col-span-1)
- Last N meetings with company name, mentor name, date, signal badge, AI summary (line-clamp-2)

---

### `/programs` — Programme List

**Component:** `components/features/program-list.tsx`

- Shows all 4 `seedPrograms`
- Filter tabs: All / Accelerator / Incubator / Grant / Corporate-Innovation / University / Challenge
- Search bar (name or description)
- Pagination: 5 per page

**Programme Card Actions:**
| Button | Condition | Destination |
|---|---|---|
| ✦ View Cohort | Has matching cohort in `cohortMap` | `/program/[cohortId]` |
| View | Always | `/programs/[programId]` |
| Applicants | Always | `/programs/[programId]/applicants` |
| Delete | Always | Local delete with toast |

**Programme → Cohort Map:**
| Programme ID | Cohort ID |
|---|---|
| program-cradle-accelerator-2026 | cohort-cradle-q2-2026 |
| program-mdec-digital-grant-2026 | cohort-mdec-digital-q3-2026 |
| program-sunway-yseali-incubator-2026 | cohort-sunway-yseali-q2-2026 |
| program-cimb-fintech-challenge-2025 | cohort-cimb-fintech-2025 |

---

### `/programs/new` — Programme Setup Wizard

**Component:** `components/features/program-setup-wizard.tsx`

5-step wizard:
1. Basics (name, type, description, organiser)
2. Target Profile (stage, markets, industries)
3. Criteria Weights (must total 100)
4. Documents & Requirements
5. Mentors & Dates (timeline, mentor assignment)

- Real-time preview panel
- Save enabled only when criteria = 100 and required fields filled
- Local save with toast; "Create another" resets form

---

### `/programs/[programId]` — Programme Detail

**Component:** `components/features/program-detail.tsx`

- Inline edit mode (toggle)
- Mentor assignment list
- Linked cohort display if exists
- Delete confirmation dialog
- Toast on save / cancel / delete

---

### `/programs/[programId]/applicants` — Applicant Review Pool

**Component:** `components/features/applicant-review-pool.tsx`

- Split layout: list left, detail right
- Filter tabs: All / Pending / Shortlisted / Waitlisted / Approved / Declined
- Decision buttons: Shortlist / Waitlist / Approve / Decline
- Approve/Decline uses `ConfirmDialog`
- Approve success: green banner with "Go to Matching →" CTA
- AI fit score, insight, support needs, flags, documents in detail panel

---

### `/apply/[programId]` — Public Application Form

**Component:** `components/features/public-application-form.tsx`

- Founder-facing public intake form
- Sections: Company info, Founder info, Support needs, Documents
- `Get fit score & submit` → `POST /api/ai/program-fit`
- `AiOperationLoader` during scoring
- Fit preview: score, label, recommendation, AI insight, flags
- `Confirm & submit` → `ConfirmDialog` → local application creation
- Fallback: pending/manual-review result if AI fails

---

### `/matching` — Matching Workbench

**Component:** `components/features/matching-workbench.tsx`

#### Queue Column (left, w-72)
- Lists all approved startups without confirmed matches
- Each card: company name, stage pill (purple), industry tags, Fit Score progress bar
- Selected card highlighted with purple ring

#### Startup Header Card (right panel top)
- Company name + **ACTIVE SELECTION** badge
- 📍 City | Industry meta row
- Quote-style support needs (italic, left purple border)
- **Overall Fit XX%** pill (white text, purple background) top-right
- "Benchmark: Top 15%" label
- Button: **Generate AI Matches** → after done: **↺ Re-calibrate Matches**

#### AI Loading State
- Spinning orb animation (ping + spin ring + inner pulse)
- 4-step timeline: Reading startup profile → Scanning mentor network → Evaluating fit → Ranking best matches
- Progress bar 0–100% over 13.3s
- "Preparing your results" finalising state

#### Ranked Mentor Matches Section
- Section header: **Ranked Mentor Matches (N)** + HIGH FIT ● / POTENTIAL ● legend
- Each card:
  - **Initials avatar** (purple for #1, grey for others)
  - Name + **VERIFIED EXPERT** badge (rank 1 only)
  - Role · Company subtitle
  - 🕐 X Startups Mentored · ⭐ 4.x/5.0 Rating
  - Match Score pill (3xl font-black) + "vs. Cohort Avg (82) +N%" comparison
  - **📊 Technical Fit Analysis** section with 4 labelled bars + % values (purple)
  - **✦ AI Matching Insight** reasoning box
  - Warning chips if mentor has capacity concerns
  - Footer: "Select [Name] as Mentor" / "✓ Selected" toggle
- **Confirm Match →** button appears when a mentor is selected
- `ConfirmDialog` confirms with startup / mentor / score / reason
- On confirm: `POST /api/relationships/confirm-match` → toast → delay → route to `/relationships`

---

### `/relationships` — Relationship List

**Component:** `components/features/relationship-list.tsx`

- Filter by health band: All / Critical / At Risk / Healthy / Stale
- Cards: company name, mentor, health score, urgency label, days since meeting
- Click → `/relationships/[id]`

---

### `/relationships/[id]` — Relationship Detail

**Component:** `components/features/relationship-detail.tsx`

- Header: company ↔ mentor, health score, health band badge
- **Copy Mentor Link** button → clipboard → toast
- AI Diagnosis panel with watch points and refresh button
- Milestone progress
- Meeting timeline
- Inline Log Meeting form (date, duration, notes ≥ 50 chars)
- `Submit & Analyze` → `POST /api/ai/analyze-meeting`
- Inline result: AI badge, signal badge, health delta, summary, action items

---

### `/program/[cohortId]` — Cohort Overview

**Component:** `components/features/cohort-overview.tsx`

**Available cohorts:**
| Cohort ID | Programme | Status |
|---|---|---|
| cohort-cradle-q2-2026 | Cradle Startup Accelerator | active |
| cohort-mdec-digital-q3-2026 | MDEC Digital Innovation Grant | open |
| cohort-sunway-yseali-q2-2026 | Sunway-YSEALI Incubator | reviewing |
| cohort-cimb-fintech-2025 | CIMB SEA Fintech Challenge | completed |

**Sections:**
1. **Header** — Cohort name, status pill, programme name, dates
2. **Health Overview** — Avg Score, Healthy, At Risk, Critical, Stale counters
3. **Milestone Distribution** — Progress bar per milestone stage
4. **Relationship Heatmap** — Grid: mentors (rows) × companies (cols), health score cells colour-coded, urgency labels
5. **✦ Instant Cohort Intelligence** — AI hero section
   - Generate button → `POST /api/ai/cohort-summary`
   - 2.5s simulated animation → real AI response
   - Output: Narrative / Key Risks / Recommended Actions (3-column grid)
   - Copy Report, Share with Partners, Regenerate buttons

---

### `/startups` — Startup List

**Component:** `components/features/startup-list.tsx`

- Lists all `seedCompanies`
- Search, filter by industry/stage
- Click → `/startups/[id]`

---

### `/mentors` — Mentor List

**Component:** `components/features/mentor-list.tsx`

- Lists all `seedMentors`
- Filter by expertise/availability
- Click → `/mentors/[id]`

---

### `/support` — Support Centre ✅ NEW

**Component:** `components/features/support-center.tsx`

**Sections:**

**Quick Access Cards (3):**
- 📚 Documentation
- 💬 Live Chat (Mon–Fri 9–6 MYT)
- 📧 Email Support (support@verrier.io · 24h SLA)

**FAQ Accordion (6 questions):**
- Health Score calculation
- Generating AI Cohort Report
- Matching algorithm
- Exporting Intelligence Report
- Adding a new programme
- Heatmap Urgency labels

**Documentation & Guides (4 items):**
- Getting Started (5 min video)
- Programme Setup Guide
- Matching Algorithm Deep-Dive
- Instant Cohort Intelligence API

**Support Ticket Form (right panel):**
- Subject, Category (dropdown), Message
- Submit → 1.5s → ✓ Ticket submitted! success state
- "Submit another ticket" resets form
- Footer: "X on watchlist · saved to browser"

**System Status:**
- 🟢 "All services operational · Healthy" (animated pulse dot)

---

### `/submit-meeting` — Public Meeting Submission

**Component:** `components/features/meeting-submission-form.tsx`

- Mentor token resolution
- Date, duration, notes fields
- `POST /api/ai/analyze-meeting`
- Success screen: summary, signal, health delta, action items

---

### `/login` — Demo Auth

- Static placeholder
- Routes to `/dashboard` on click

---

## Data Layer

### Seed Files (`lib/verrier-seed.ts`)

| Export | Count | Notes |
|---|---|---|
| `seedPrograms` | 4 | Cradle, MDEC, Sunway-YSEALI, CIMB |
| `seedCohorts` | 4 | One per programme, all statuses covered |
| `seedCompanies` | 12+ | All in cohort-cradle-q2-2026 |
| `seedMentors` | 15+ | Shared across programmes |
| `seedApplications` | 15+ | Mix of statuses |
| `seedRelationships` | 10+ | Active + inactive, various health scores |
| `seedMeetings` | 10+ | AI summaries and signals |

### Analytics (`lib/verrier-analytics.ts`)

Key function: `getDashboardSummary()`

| Field | Calculation |
|---|---|
| `activeProgramCount` | `seedPrograms.length` (all 4, **not** filtered by status) |
| `activeCohortCount` | `seedCohorts.filter(status=active)` |
| `submittedApplicationCount` | `filter(submittedAt != null)` |
| `approvedApplicationCount` | `filter(status=approved)` |
| `activeRelationshipCount` | `filter(status=active)` |
| `healthyRelationshipCount` | health band = healthy |
| `atRiskRelationshipCount` | health band = at-risk |
| `criticalRelationshipCount` | health band = critical |
| `meetingCount` | `seedMeetings.length` |

---

## AI Trigger Map

All AI calls are **explicit button-only**. No AI is triggered on page load, route change, or selection.

| Feature | Route | Trigger | Endpoint |
|---|---|---|---|
| Programme fit score | `/apply/[programId]` | "Get fit score & submit" | `POST /api/ai/program-fit` |
| Mentor matching | `/matching` | "Generate AI Matches" | `POST /api/ai/match` |
| Cohort intelligence | `/program/[cohortId]` | "✦ Generate Cohort Report" | `POST /api/ai/cohort-summary` |
| Meeting analysis (public) | `/submit-meeting` | "Submit meeting notes" | `POST /api/ai/analyze-meeting` |
| Meeting analysis (inline) | `/relationships/[id]` | "Submit & Analyze" | `POST /api/ai/analyze-meeting` |
| Relationship diagnosis | `/relationships/[id]` | "Refresh Diagnosis" | `POST /api/ai/diagnose` |

---

## Local Persistence

| Feature | Key | Storage | Type |
|---|---|---|---|
| Watchlist | `verrier_watchlist` | `localStorage` | `string[]` (company IDs) |

All other state is in-memory React state (resets on page refresh). No Firestore writes are active in demo mode.

---

## Known Gaps / Not Yet Wired

| Item | Status |
|---|---|
| Settings page | `href="#"` — placeholder only |
| Firestore persistence | All saves are local state only |
| Real auth | Demo placeholder at `/login` |
| Mentor detail page | May be partially stubbed |
| Startup detail page | May be partially stubbed |
| Watchlist → relationship link | Shows health score but doesn't link to relationship page |
| MDEC / Sunway / CIMB cohort data | Cohorts exist but have minimal company/mentor linkage in seed |
