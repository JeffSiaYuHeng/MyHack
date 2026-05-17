# Programmes Section — Page & Component Reference

**Last Updated:** 2026-05-17  
**Routes covered:** `/programs` · `/programs/[programId]` · `/programs/new` · `/programs/[programId]/applicants`

---

## Route Map

```
/programs                          ← Programme list (index)
/programs/new                      ← Create new programme (wizard)
/programs/[programId]              ← Programme detail (read + edit + delete)
/programs/[programId]/applicants   ← Applicant review pool
```

All four routes are wrapped in `ProductShell` (sidebar nav, cohort pill, Verrier logo).  
Nav active state: **"Programmes"** on all four routes.

---

## 1. `/programs` — Programme List

**File:** `app/programs/page.tsx`  
**Component:** `components/features/program-list.tsx`  
**Data source:** `seedPrograms` (all programmes), `seedApplications` (for counts)

### What the page shows

```
┌─────────────────────────────────────────────────────────────┐
│  Programmes                              [+ New Programme]  │
│  1 PROGRAMME                                                │
├─────────────────────────────────────────────────────────────┤
│ ▌ Cradle Startup Accelerator 2026  [active] [accelerator]  │
│   A 24-week accelerator for Malaysian seed-stage startups…  │
│                              [View] [Applicants] [Delete]   │
│   12 applications · 9 approved · 15 mentors                 │
│   Opens 2026-04-01 · Closes 2026-05-31 · Targets: pre-seed, seed │
└─────────────────────────────────────────────────────────────┘
```

### Elements & Labels

| Element | Content | Behaviour |
|---|---|---|
| Page title | "Programmes" | Static |
| Subtitle | "{n} programme(s)" | Counts current list |
| **+ New Programme** button | Top-right, red pill | Links to `/programs/new` |
| Loading skeletons | 3 placeholder cards | Shown for 400ms on mount |
| Empty state | "No programmes yet." + create link | Shown when list is empty |
| **Left accent bar** | Coloured by status (green=active, amber=open/reviewing, grey=completed, blue=draft) | Visual indicator |
| Programme name | `text-[15px] font-semibold` | Main card title |
| Status badge | `active` / `open` / `reviewing` / `matching` / `completed` / `draft` | Colour-coded pill |
| Type badge | `accelerator` / `incubator` / `grant` etc. | Neutral outline pill |
| Description | 1-line truncated | From `program.description` |
| **View** button | Outline pill | Links to `/programs/[id]` |
| **Applicants** button | Outline pill | Links to `/programs/[id]/applicants` |
| **Delete** button | Red outline pill | Opens confirmation modal |
| Stats row | `{n} applications · {n} approved · {n} mentors · Opens {date} · Closes {date} · Targets: {stages}` | Computed from seed data |
| **Delete modal** | "Delete programme?" + Cancel / Delete | Removes from local state, shows toast |

### Interactions

- Hover on card → `hover:shadow-md`
- Delete → confirmation modal → `confirmDelete()` → filters programme from state → `toast.success("Programme deleted locally.")`
- All changes are **local state only** (not persisted to Firestore)

---

## 2. `/programs/new` — Programme Setup Wizard

**File:** `app/programs/new/page.tsx`  
**Component:** `components/features/program-setup-wizard.tsx`  
**Data source:** `seedMentors` (for mentor selection list)

### Layout

Two-column: **left = form sections** (flex-1) · **right = sticky Live Preview panel** (w-64)

### Form Sections (left column)

#### Section 1 — Basics
| Field | Type | Required | Options |
|---|---|---|---|
| Programme name | Text input | ✅ | Free text |
| Programme type | Radio card grid (3×2) | — | Accelerator · Incubator · Grant · Corporate Innovation · University · Challenge |
| Description | Textarea (3 rows) | — | Free text |

Type cards show label + description (e.g. "Equity-based, cohort model") with red border when selected.

#### Section 2 — Target Profile
| Field | Type | Required | Options |
|---|---|---|---|
| Target stages | Pill toggle group | ✅ | idea · pre-seed · seed · series-a · series-b · growth |
| Target industries | Pill toggle group | — | AI/ML · Fintech · Healthtech · Climate · SaaS · AgriTech · FoodTech · EdTech |
| Target markets | Pill toggle group | — | Malaysia · Singapore · Indonesia · Thailand · Vietnam · Philippines |

Active pills turn red (`#f36458`). Inactive pills are outline/muted.

#### Section 3 — Criteria Weights
| Field | Type | Constraint |
|---|---|---|
| Stage fit | Number input + progress bar | 0–100 |
| Industry fit | Number input + progress bar | 0–100 |
| Traction fit | Number input + progress bar | 0–100 |
| Team fit | Number input + progress bar | 0–100 |
| Needs fit | Number input + progress bar | 0–100 |

Total indicator: green ✓ when sum = 100, red ! otherwise. **Save Programme is disabled until total = 100.**

#### Section 4 — Application Setup
| Field | Type | Options |
|---|---|---|
| Required documents | Pill toggle group | Pitch deck · Company registration · Traction summary · Founder profiles |
| Application opens | Date picker | — |
| Application closes | Date picker | — |
| Programme start | Date picker | — |
| Programme end | Date picker | — |

#### Section 5 — Mentor Setup
Full list of `seedMentors` (15 mentors). Each row shows:
- Custom checkbox (red when checked)
- Mentor name + role · company
- Expertise tags (first 2) + hours/month

Selected rows get a subtle red-tinted border.

### Live Preview Panel (right column, sticky)

| Element | Content |
|---|---|
| Programme name | Live from form |
| Type | Live from form |
| Status badge | "draft" until published, then "open" |
| Mentors count | Live count |
| Stages count | Live count |
| Criteria total | Green if 100, red otherwise |
| Checklist | 3 items: name ✓, stage ✓, criteria ✓ — strikethrough when done |
| Application URL | `/apply/program-draft-local` (monospace) |
| **Save as Draft** button | Always enabled — saves to `localStorage` |
| Draft timestamp | "Draft · {time ago}" + Discard link |
| **Save Programme** button | Red pill — enabled only when `isReady` |
| Published state | "✓ Programme published" + "Create another" reset |

### Draft Persistence
- Draft auto-loads from `localStorage` key `verrier:program-draft` on mount
- "Save as Draft" writes to localStorage + shows toast
- "Discard" clears localStorage + resets form
- "Save Programme" clears localStorage + sets `published: true`

---

## 3. `/programs/[programId]` — Programme Detail

**File:** `app/programs/[programId]/page.tsx`  
**Component:** `components/features/program-detail.tsx`  
**Data source:** `seedPrograms` (by `programId`), `seedApplications`, `seedMentors`  
**Guard:** `notFound()` if `programId` not in seed data

### Two modes: Read View and Edit View

#### Read View (default)

**Header row:**
- `← Programmes` breadcrumb link
- Programme name (`text-xl font-bold`)
- Status badge (colour-coded pill)
- Type badge (outline pill)
- Organiser name
- Action buttons: **Applicants ({n})** · **Edit** · **Delete**

**Stats strip** (horizontal scroll of metrics):
| Metric | Value |
|---|---|
| Applications | Total count from seedApplications |
| Approved | Count with status "approved" |
| Mentors | Count from mentorIds |
| Opens | applicationOpenAt date |
| Closes | applicationCloseAt date |
| Starts | startDate |
| Ends | endDate |

**Info cards** (2-column grid):

| Card | Fields shown |
|---|---|
| **Basics** | Name · Type · Description |
| **Target Profile** | Stages · Industries · Markets |
| **Criteria Weights** | 5 progress bars (Stage/Industry/Traction/Team/Needs) with numeric values |
| **Application Setup** | Required documents · Application URL (`/apply/{id}`) |
| **Mentors** (full width) | Chip list: name · role — all assigned mentors |

#### Edit View (toggled by Edit button)

Same layout as wizard but inline. Left column = editable form sections, right column = sticky save panel.

**Editable fields:**
- Name, Type, Status (dropdown: draft/open/reviewing/matching/active/completed), Description
- Target stages (checkboxes), industries (checkboxes), markets (checkboxes)
- Criteria weights (number inputs + progress bars) — must total 100
- Required documents (checkboxes)
- Application open/close/start/end dates
- Mentor assignment (checkbox list of all 15 seed mentors)

**Sticky save panel:**
- Programme name preview
- Mentor count + criteria total (green/red)
- **Save changes** button (red pill, disabled if weights ≠ 100)
- **Cancel** button

**Save behaviour:** Updates local `program` state → `toast.success("Programme changes saved locally.")` — not persisted to Firestore.

#### Delete flow
- **Delete** button → confirmation modal: "Delete '{name}'?"
- Cancel → closes modal
- Delete → `handleDelete()` → `toast.success` → `router.push("/programs")` after 1.2s

---

## 4. `/programs/[programId]/applicants` — Applicant Review Pool

**File:** `app/programs/[programId]/applicants/page.tsx`  
**Component:** `components/features/applicant-review-pool.tsx`  
**Data source:** `seedApplications`, `seedCompanies`

### Layout

```
Header: "Applicant Review Pool"  {n} total applications    [+ New Programme]
Approved strip: ✓ NexaHealth  ✓ ByteScale  ✓ Agribot  …
Filter tabs: All(12) | Submitted(1) | Shortlisted(0) | Approved(9) | Waitlisted(1) | Declined(1)
─────────────────────────────────────────────────────────────────────────────
[List panel 256px]  |  [Detail panel flex-1]
```

### List Panel (left, 256px)

Each row shows:
- Company name (truncated)
- Status badge (colour-coded pill)
- Founder contact email
- Fit score mini progress bar + numeric score
- AI recommendation label (approve/review/decline, colour-coded)

Selected row: `bg-muted` highlight.

### Detail Panel (right, flex-1)

**Panel header:**
- Company name + industry · stage · city, country
- Status badge

**Approved banner** (shown when just approved):
- "✓ Approved — ready for mentor matching" + **Go to Matching →** link

**Decision action bar:**
| Button | Colour | Behaviour |
|---|---|---|
| Approve | Green | Opens confirm dialog |
| Shortlist | Amber | Applies immediately |
| Waitlist | Amber | Applies immediately |
| Decline | Red | Opens confirm dialog |

Current status button is filled/disabled.

**Content grid (2 columns):**

| Section | Fields |
|---|---|
| **Company Profile** | Business model · Team size · MRR (if set) · Contact email |
| **Fit Score** | Overall score + label + 5 breakdown bars (Stage/Industry/Traction/Team/Needs) |
| **Founder Summary** | `founderSummary` text + `founderBackground` (if set) |
| **AI Insight** | ✦ AI badge + `aiInsight` text + `→ {aiRecommendation}` |
| **Support Needs** | Pill tags from `supportNeeds[]` |
| **Eligibility Flags** | "✓ No eligibility flags" or list of flag strings |
| **Documents** | Monospace chips: docType + filename |

### Confirm Dialog (Approve / Decline)

Shown for approve and decline decisions only (shortlist/waitlist apply immediately).

- Title: "Approve this applicant?" or "Decline this applicant?"
- Description: context-specific explanation
- Summary row: Applicant name + Decision
- Buttons: Cancel · Confirm (red for decline)

### Approved Companies Strip

Shown above filter tabs when any applications are approved.  
Displays green pill badges: `✓ {companyName}` for each unique approved company.

### Loading State

Skeleton layout shown for 400ms on mount:
- Left: 6 skeleton list rows
- Right: skeleton header + 2-column content grid

### Empty States

- No applicants matching filter → "No applicants match this filter" + "Clear filter" button
- No applicant selected → "Select an applicant" placeholder

---

## 5. Data Flow Summary

```
seedPrograms ──→ /programs (list)
                      │
                      ├──→ /programs/new (create, local state + localStorage draft)
                      │
                      ├──→ /programs/[id] (read + edit + delete, local state)
                      │
                      └──→ /programs/[id]/applicants
                                    │
                                    ├── seedApplications (list + decisions, local state)
                                    ├── seedCompanies (company profiles)
                                    └── Approve → banner → link to /matching
```

---

## 6. Persistence Notes

| Action | Persisted? | Where |
|---|---|---|
| Create programme (wizard) | ✅ Draft | `localStorage` (`verrier:program-draft`) |
| Create programme (publish) | ❌ Local state only | Clears localStorage, sets `published: true` |
| Edit programme | ❌ Local state only | Resets on page refresh |
| Delete programme | ❌ Local state only | Resets on page refresh |
| Applicant decisions | ❌ Local state only | Resets on page refresh |

**Next step for persistence:** Wire `POST /api/programs`, `PATCH /api/programs/[id]`, `DELETE /api/programs/[id]`, and `PATCH /api/applications/[id]/decision` routes using `safeWrite` to Firestore.

---

## 7. Screenshot Reference

The screenshot provided shows `/programs` with:
- Sidebar nav: Dashboard · Portfolio · Relationships · Mentors · Insights (different nav labels from current implementation — current uses Dashboard · Programmes · Matching · Relationships · Login)
- 1 programme card: "Cradle Startup Accelerator 2026" with Active + Accelerator badges
- Stats: 12 applications · 9 approved · 15 mentors · Opens 2026-04-01 · Closes 2026-05-31 · Targets: pre-seed, seed
- Action buttons: View · Applicants · Delete
- Top-right: "+ New Programme" red pill button

This matches the current `ProgramList` component implementation exactly.
