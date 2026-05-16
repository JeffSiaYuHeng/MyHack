# User Flow, UI, and Interaction Report

**Project:** Verrier  
**Last Updated:** 2026-05-17  
**Purpose:** Review the current end-to-end application flow, identify UI and interaction gaps, and define practical improvements for loading states, motion, dialogs, feedback, and page polish.

---

## Executive Summary

Verrier already has the core MVP flow in place: programme setup, public application intake, applicant review, mentor matching, relationship monitoring, meeting analysis, and cohort reporting. The application is functionally coherent, but the experience still feels uneven because interaction feedback is implemented feature by feature instead of as a system.

The most important next UX step is to introduce a shared interaction layer:

- consistent page loading and section loading states,
- modal/dialog patterns for irreversible or high-importance actions,
- toast feedback for every network, AI, save, copy, delete, and submit action,
- subtle transition and reveal motion across panels, cards, results, filters, and AI outputs,
- shared empty/error/success states that make the demo feel complete even when data is local or fallback-based.

The first interaction polish pass is now underway. Shared primitives and several high-value flows have been added: card-style dashboard metrics, explicit AI triggers, richer mentor recommendation cards, post-approval matching guidance, mentor link copy, inline meeting analysis, and stronger toast/dialog feedback.

---

## Current End-to-End User Flow

```text
Coordinator opens dashboard
-> creates or reviews programmes
-> opens public application link
-> founder submits startup application
-> AI returns programme-fit score
-> coordinator reviews applicants
-> coordinator approves applicant
-> UI nudges coordinator toward Matching
-> coordinator opens matching workbench
-> coordinator generates AI mentor matches
-> coordinator confirms a match
-> relationship is created
-> coordinator copies mentor submission link
-> mentor submits meeting notes
-> AI analyzes meeting health
-> coordinator reviews relationship detail
-> coordinator can also log/analyze meeting inline
-> coordinator refreshes diagnosis
-> coordinator generates cohort report
```

The product story is strong. The UI should make every stage feel like part of one operating system, not a set of separate pages.

---

## User Flow Catalogue

This section lists the practical routes a user can take through Verrier and the event that moves the user from one state to the next.

### Flow 1. Coordinator Reviews the Programme System

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/dashboard` | Opens coordinator dashboard | Dashboard summary, attention feed, and recent meetings render from aggregate seed data. |
| 2 | `/dashboard` | Reviews top metric cards | Coordinator sees programme/application counts and relationship health counts inside card-based metric groups. |
| 3 | `/dashboard` | Reviews attention feed | Coordinator identifies relationships needing review. |
| 4 | `/relationships/[id]` | Opens a relationship detail page | Coordinator can inspect health, timeline, diagnosis, and meeting history. |

AI trigger: none by default. Dashboard should not call AI on load. AI is only triggered when the coordinator explicitly refreshes diagnosis or generates a report in later flows.

### Flow 2. Coordinator Creates a Programme

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/programs` | Clicks `+ New Programme` | Navigates to programme setup wizard. |
| 2 | `/programs/new` | Fills basics, target profile, criteria, documents, mentors, dates | Preview panel updates locally. |
| 3 | `/programs/new` | Criteria total reaches `100` and required fields are present | `Save Programme` becomes available. |
| 4 | `/programs/new` | Clicks `Save Programme` | Local programme save state is shown and toast feedback confirms save. |
| 5 | `/programs/new` | Clicks `Create another` | Form resets and toast feedback confirms readiness for the next programme. |

AI trigger: none. Programme setup is a structured data flow. Future AI could suggest criteria or target profiles, but current MVP does not call AI here.

### Flow 3. Founder Submits a Startup Application

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/apply/[programId]` | Founder opens public application URL | Programme context and application form render. |
| 2 | `/apply/[programId]` | Founder fills company, founder, support needs, and document fields | Validation state updates locally. |
| 3 | `/apply/[programId]` | Clicks `Get fit score & submit` | `POST /api/ai/program-fit` is called. |
| 4 | `/apply/[programId]` | Waits during scoring | `AiOperationLoader` shows staged fit-scoring progress and toast shows loading. |
| 5 | `/apply/[programId]` | Fit score returns | Fit score, label, recommendation, insight, and flags render in the fit preview. |
| 6 | `/apply/[programId]` | Clicks `Confirm & submit` | Final submit confirmation dialog opens. |
| 7 | `/apply/[programId]` | Confirms submit | Application is recorded in local state and success screen renders. |

AI trigger: only the `Get fit score & submit` button. The application form should never call AI while the founder is typing.

Fallback: if Gemini times out or network fails, a pending/manual-review fit result is created. The user can still submit.

### Flow 4. Coordinator Reviews Applicants

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/programs/[programId]/applicants` | Opens applicant review pool | Applicant list, filters, approved strip, and selected detail render. |
| 2 | `/programs/[programId]/applicants` | Changes filter tab | Applicant list updates locally. Empty filter state can clear filters. |
| 3 | `/programs/[programId]/applicants` | Selects an applicant | Detail panel shows company profile, fit score, AI insight, support needs, flags, and documents. |
| 4 | `/programs/[programId]/applicants` | Clicks `Shortlist` or `Waitlist` | Decision applies locally and toast confirms the update. |
| 5 | `/programs/[programId]/applicants` | Clicks `Approve` or `Decline` | Confirmation dialog opens because the action changes the applicant path. |
| 6 | `/programs/[programId]/applicants` | Confirms decision | Applicant status updates locally and toast confirms result. |
| 7 | `/programs/[programId]/applicants` | Applicant was approved | A green banner appears below the detail header with `Go to Matching ->`. |

AI trigger: none on this page. AI output is read from the application score generated earlier.

Important UX point: approving a startup is the handoff into mentor matching. It now feels intentional because the UI confirms approval and points the coordinator toward `/matching`.

### Flow 5. Coordinator Generates Mentor Matches

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/matching` | Opens matching workbench | Approved startup queue and mentor pool context render. |
| 2 | `/matching` | Selects a startup in the queue | Startup context changes and previous match output resets. |
| 3 | `/matching` | Clicks `Generate AI matches` | `POST /api/ai/match` is called. |
| 4 | `/matching` | Waits during matching | Matching loading animation and toast feedback are shown. |
| 5 | `/matching` | AI returns ranked matches | Rich AI recommendation cards render with rank badge, mentor role/company, match score, score bars, AI reason, warnings, and selected state. |
| 6 | `/matching` | Clicks `Select` on a mentor card | Mentor card becomes selected and `Confirm Match` becomes available. |
| 7 | `/matching` | Clicks `Confirm Match` | Confirmation dialog opens with startup, mentor, score, and reason. |
| 8 | `/matching` | Confirms match | `POST /api/relationships/confirm-match` is called. Toast confirms `Match confirmed — relationship created`. |
| 9 | `/matching` | Confirmation succeeds | After a 1.5s delay, the coordinator is routed to `/relationships`. |

AI trigger: only the `Generate AI matches` button. Startup selection does not call AI.

Fallback: if Gemini fails, deterministic local mentor scoring should rank mentors and label fallback status clearly.

### Flow 6. Coordinator Shares Mentor Submission Link

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/relationships/[id]` | Opens relationship detail | Header shows relationship health score and mentor submission link control. |
| 2 | `/relationships/[id]` | Clicks `Copy Mentor Link` | Clipboard receives `/submit-meeting?token={relationship.mentorId}` and toast confirms copy. |
| 3 | `/relationships/[id]` | Reads URL preview | Small monospace text shows the tokenized meeting form path for demo clarity. |

AI trigger: none. This is a demo handoff flow from coordinator to mentor.

Current caveat: the copied token uses `relationship.mentorId`. The public meeting form currently resolves seeded mentor submission tokens, so this demo URL is mainly an exposure/narrative affordance unless token resolution is aligned later.

### Flow 7. Mentor Submits Meeting Notes

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/submit-meeting` | Mentor opens public meeting form | Token, date, duration, and notes fields render. |
| 2 | `/submit-meeting` | Enters mentor token | Matching relationship context resolves locally when token is valid. |
| 3 | `/submit-meeting` | Enters date, duration, and notes | Validation checks token, date, duration, and minimum note length. |
| 4 | `/submit-meeting` | Clicks `Submit meeting notes` | `POST /api/ai/analyze-meeting` is called with `submittedBy: "mentor"`. |
| 5 | `/submit-meeting` | Waits during analysis | `AiOperationLoader` shows meeting-analysis stages and toast shows loading. |
| 6 | `/submit-meeting` | AI returns result | Confirmation screen shows summary, signal, health delta, action items, and watch points. |

AI trigger: only the `Submit meeting notes` form submit.

Fallback: timeout or network failure still logs the meeting locally with neutral signal and `analysis-pending` watch point.

### Flow 8. Coordinator Logs or Analyzes a Meeting Inline

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/relationships/[id]` | Opens relationship detail | Health, diagnosis, milestones, timeline, and meeting panel render. |
| 2 | `/relationships/[id]` | Clicks `Log Meeting` | Inline form opens with date, duration, and notes fields unlocked. |
| 3 | `/relationships/[id]` | Enters notes with at least 50 characters | Form is ready for AI analysis. |
| 4 | `/relationships/[id]` | Clicks `Submit & Analyze` | `POST /api/ai/analyze-meeting` is called with `submittedBy: "admin"`. |
| 5 | `/relationships/[id]` | Waits during analysis | Button shows `✦ Analyzing...`, disables, and pulses. |
| 6 | `/relationships/[id]` | AI returns result | Inline result shows `✦ AI` badge, signal badge, health delta, AI summary, and action item list. |

AI trigger: only the `Submit & Analyze` button.

Fallback: inline failure shows toast feedback and keeps the form open for retry.

### Flow 9. Coordinator Refreshes Relationship Diagnosis

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/relationships/[id]` | Reviews AI diagnosis panel | Seeded diagnosis and watch points are visible. |
| 2 | `/relationships/[id]` | Clicks `Refresh` / `Refresh Diagnosis` | `POST /api/ai/diagnose` is called. |
| 3 | `/relationships/[id]` | Waits during diagnosis | Button loading state and toast feedback are shown. |
| 4 | `/relationships/[id]` | AI returns diagnosis | Diagnosis narrative, watch points, recommendation, and timestamp update. |

AI trigger: only the refresh diagnosis button.

Fallback: deterministic diagnosis should preserve existing state and show toast feedback if refresh fails.

### Flow 10. Coordinator Generates Cohort Intelligence

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/program/[cohortId]` | Opens cohort overview | Cohort health, heatmap, milestones, and report panel render. |
| 2 | `/program/[cohortId]` | Clicks `Generate Report` | `POST /api/ai/cohort-summary` is called. |
| 3 | `/program/[cohortId]` | Waits during generation | Report loading state and toast feedback are shown. |
| 4 | `/program/[cohortId]` | AI returns report | Narrative, key risks, recommended actions, and generated timestamp render. |
| 5 | `/program/[cohortId]` | Clicks `Copy report` | Clipboard copy runs and toast confirms success or fallback. |

AI trigger: only the `Generate Report` button.

Fallback: deterministic local report is generated from visible cohort metrics and marked as fallback.

### Flow 11. Coordinator Manages Programmes

| Step | Page | User Action | Event / Result |
|---|---|---|---|
| 1 | `/programs` | Opens programme list | Programme cards render with status, applications, approved count, mentors, and dates. |
| 2 | `/programs` | Clicks `View` | Opens programme detail. |
| 3 | `/programs/[programId]` | Clicks `Edit` | Inline edit mode opens. |
| 4 | `/programs/[programId]` | Clicks `Save changes` | Local programme state updates and toast confirms save. |
| 5 | `/programs/[programId]` or `/programs` | Clicks `Delete` | Delete confirmation dialog opens. |
| 6 | `/programs/[programId]` or `/programs` | Confirms delete | Local delete completes and toast confirms result. |

AI trigger: none. These are structured CRUD interactions.

---

## AI and Event Trigger Map

All AI actions must be explicit. Verrier should not call AI from page load, route render, startup selection, applicant selection, filter change, or passive `useEffect`.

| Feature | Route | User Trigger | API/Event | Loading UI | Success UI | Fallback/Error UI |
|---|---|---|---|---|---|---|
| Programme fit scoring | `/apply/[programId]` | `Get fit score & submit` button | `POST /api/ai/program-fit` | `AiOperationLoader` with fit steps + loading toast | Fit preview with score, label, recommendation, insight | Pending/manual review result + fallback toast |
| Final application submit | `/apply/[programId]` | `Confirm & submit` then dialog confirm | Local application creation | Button/dialog state | Submitted application success screen + toast | Validation blocks submit |
| Applicant decision | `/programs/[programId]/applicants` | Decision buttons | Local status update | Optional button disabled state | Status updates + toast | Confirmation dialog for approve/decline |
| Post-approve nudge | `/programs/[programId]/applicants` | Approve confirmation succeeds | Local banner state | None | Green `ready for mentor matching` banner with `/matching` CTA | None |
| Mentor matching | `/matching` | `Generate AI matches` button | `POST /api/ai/match` | Matching loader + loading toast | Rich ranked AI recommendation cards | Fallback ranking or error state + toast |
| Match confirmation | `/matching` | `Confirm Match` then dialog confirm | `POST /api/relationships/confirm-match` | Confirming button/toast | Relationship created, toast shown, delayed route to `/relationships` | Error message + retry |
| Mentor link copy | `/relationships/[id]` | `Copy Mentor Link` button | Clipboard API | None | Toast confirms mentor link copied; URL preview shown | Browser clipboard failure is not yet surfaced |
| Public meeting analysis | `/submit-meeting` | `Submit meeting notes` form submit | `POST /api/ai/analyze-meeting` | `AiOperationLoader` with meeting steps + toast | Confirmation screen with signal and health delta | Neutral fallback analysis + `analysis-pending` |
| Inline meeting analysis | `/relationships/[id]` | `Submit & Analyze` button | `POST /api/ai/analyze-meeting` | `✦ Analyzing...` disabled pulse button | Inline AI result, signal badge, health delta, action items, live health update | Toast error, form remains open |
| Relationship diagnosis | `/relationships/[id]` | `Refresh` / `Refresh Diagnosis` button | `POST /api/ai/diagnose` | Button loading + toast | Diagnosis panel updates | Existing diagnosis preserved + toast |
| Cohort summary | `/program/[cohortId]` | `Generate Report` button | `POST /api/ai/cohort-summary` | Report loading + toast | Cohort narrative, risks, actions | Local fallback report + fallback indicator |
| Report copy | `/program/[cohortId]` | `Copy report` button | Clipboard API | Button/toast feedback | Clipboard success toast | Manual copy text field + toast |
| Programme save/reset/delete | `/programs`, `/programs/new`, `/programs/[programId]` | Save/reset/delete buttons | Local state update | Button/dialog state | Toast feedback | Delete confirmation or validation |

---

## User-Visible Event Principles

- **Selection should preview, not execute.** Selecting a startup, applicant, relationship, filter, or programme should update visible context only.
- **AI work should always be button-driven.** The user should understand when Gemini is being used.
- **Every async action needs feedback.** Use loading state, toast, and a visible panel state.
- **Every high-impact action needs review.** Use a dialog for approve, decline, confirm match, delete, discard, or final submit.
- **Fallback should feel designed.** If AI is unavailable, the UI should say fallback/manual review is active and still let the user proceed where safe.
- **Local-only persistence should be honest.** For demo/local updates, toast copy should use language like "saved locally" or "marked locally" when appropriate.
- **Handoffs should be visible.** After approval, the UI should nudge toward Matching; after match confirmation, the UI should move toward Relationships; relationship detail should expose the mentor meeting link.

---

## Current Interaction Strengths

- Dashboard has skeleton loading, animated health bars, status accents, and card-style top metrics without flashing critical counts.
- Matching workbench now uses an explicit `Generate AI matches` button with loading visualization, toast feedback, rich AI recommendation cards, and delayed navigation to `/relationships` after confirmation.
- Applicant approval now shows a green next-step banner that links to Matching.
- Relationship detail uses toast feedback for diagnosis refresh and meeting analysis, exposes a copyable mentor submission link, and has an unlocked inline Log Meeting form.
- Cohort overview uses toast feedback for report generation and copy behavior.
- Program list and program detail already have delete confirmation modals.
- Shared `AiOperationLoader`, `ConfirmDialog`, and `StateBlock` primitives have been introduced for first-pass interaction consistency.
- Global button hover/active behavior exists in `app/globals.css`.
- Global toast styling exists in `app/layout.tsx`.

These are good foundations. The next work is to make the rest of the app follow the same interaction grammar.

---

## Main UX Gaps

### 1. Loading is inconsistent across pages

Some pages have loading states, but most are local, static, or text-only. The user cannot always tell whether the app is working, waiting for AI, saving local state, or simply idle.

Needs:

- page-level route skeletons for dashboard, programmes, applicants, matching, relationships, relationship detail, and cohort overview,
- section-level skeletons for cards, lists, tables, and AI panels,
- AI-specific loading animations for fit scoring, diagnosis, meeting analysis, and cohort report generation,
- submit/save/delete loading states for programme CRUD and applicant decisions.

### 2. Dialogs are not used consistently

Delete actions have dialogs, but many important actions happen instantly or inline:

- approve/decline applicant,
- confirm mentor match,
- save programme edits,
- submit application after AI score,
- submit meeting notes,
- generate cohort report,
- reset wizard or create another programme.

Not every action needs a blocking modal, but each critical action needs a clear confirmation, review, or undo pattern.

### 3. Toast feedback is not yet universal

Toast is now polished, but not every user-facing action uses it. This makes some features feel less complete than others.

Toast should be used for:

- public application scoring and final submit,
- public meeting submit success/fallback/error,
- applicant approve/shortlist/waitlist/decline,
- programme save/edit/delete,
- wizard save and reset,
- match generation and confirmation,
- diagnosis refresh,
- cohort report generation and copy,
- clipboard fallback.

### 4. Motion does not yet tell a product story

The app has hover transitions and some progress animations, but page changes, result reveals, and AI outputs are mostly static.

Motion should communicate state:

- cards appear when filters change,
- AI result panels reveal after generation,
- score bars animate from 0 to final values,
- matched mentor cards stagger in after ranking,
- confirmation banners slide/fade into place,
- skeletons shimmer while sections are loading.

### 5. Empty, fallback, and error states need shared language

The app has several local fallbacks, but the visual treatment differs by feature. Fallback should feel intentional, not broken.

Needed states:

- Empty applicant list.
- No approved startups for matching.
- No relationships after filters.
- No meetings yet.
- AI unavailable, local fallback active.
- Clipboard unavailable, manual copy available.
- Saved locally, Firestore unavailable.

---

## Page-by-Page Report

### `/dashboard`

Current role:

- Coordinator command center.
- Shows programme attention, metrics, relationship health, recent signals.

Current interaction state:

- Has initial skeleton loading.
- Has animated bars and hoverable cards.
- Top metric area is now grouped into compact cards and the critical count no longer flashes.

Recommended improvements:

- Add click-through micro-transition when opening attention items.
- Add a small "syncing dashboard" pulse in the header during data refresh.
- Add a manual refresh button with toast feedback.
- Add skeleton variants for each dashboard region instead of one generic delay.
- Add "empty attention feed" and "all healthy" celebratory but restrained state.

Priority: Medium.

---

### `/programs`

Current role:

- Programme list and CRUD entry.
- Cards show status, applications, approvals, mentors, dates.

Current interaction state:

- Delete confirmation modal exists.
- Local delete updates immediately with toast feedback.

Recommended improvements:

- Add undo toast for local delete if persistence is not ready.
- Add loading/disabled state while delete is being confirmed.
- Add card enter animation for programme list.
- Add empty programme state with a direct `New Programme` action.
- Add status filter or segmented control when list grows.

Priority: High.

---

### `/programs/new`

Current role:

- Programme setup wizard.
- Builds programme profile, target profile, criteria weights, documents, mentors, dates.

Current interaction state:

- Save button appears when ready.
- Confirmation state appears after save.
- Save and reset actions use toast feedback.

Recommended improvements:

- Convert the long form into clear steps or an anchored stepper.
- Add animated completion meter as sections become valid.
- Add save loading state even if local-only.
- Add reset confirmation dialog before discarding form data.
- Add inline field validation as the user touches fields.
- Add "criteria total" motion when the total changes, especially if it is not 100.
- Add preview panel reveal animation when the programme becomes ready.

Priority: High.

---

### `/programs/[programId]`

Current role:

- Programme detail, inline edit, mentor selection, delete.

Current interaction state:

- Edit mode exists.
- Delete confirmation modal exists.
- Save is local.
- Save, cancel, and delete use toast feedback.

Recommended improvements:

- Add dirty-state guard when leaving edit mode with unsaved changes.
- Add save confirmation banner or sticky save summary.
- Add skeleton loading for detail route.
- Add animation between read and edit mode.
- Add disabled/loading state for save and delete actions.
- Add modal for "Discard changes?".

Priority: High.

---

### `/programs/[programId]/applicants`

Current role:

- Applicant review pool.
- Coordinator filters applicants and makes decisions.

Current interaction state:

- Split list/detail layout.
- Decision buttons update local state with toast feedback.
- Approve and decline use a confirmation dialog.
- Approve success shows a green banner that links to `/matching`.
- There is a simple text loading branch, but it is not actively used.

Recommended improvements:

- Add optimistic update with undo toast for local decisions.
- Add applicant list skeleton and detail skeleton.
- Add animated detail panel transition when selecting applicants.
- Add "AI recommendation changed" visual emphasis when decision differs from AI recommendation.
- Add empty filter state with a button to clear filters.

Priority: Highest.

---

### `/apply/[programId]`

Current role:

- Public startup application intake.
- Founder submits profile and triggers AI fit scoring before confirmation.

Current interaction state:

- Has `loading`, `scored`, `pending`, and `error` fit states.
- Uses inline fit result panel.
- Uses global toast for AI scoring and final submission.
- Uses `AiOperationLoader` while fit scoring is running.
- Uses final submit confirmation dialog after the score is ready.

Recommended improvements:

- Add sticky mobile submit bar.
- Add section completion indicators for long public form.
- Add character counter and quality hint for founder summary.
- Add success screen motion after submission.

Priority: Highest.

---

### `/matching`

Current role:

- Coordinator selects an approved startup, generates AI mentor matches, selects a mentor, confirms match.

Current interaction state:

- Strongest current interaction implementation.
- Explicit AI button, loading visualization, toasts, confirm state, and final match confirmation dialog.
- Mentor match cards now look like AI recommendation cards with rank badge, mentor context, match score, breakdown bars, AI reason, warnings, and selected state.
- Confirmation success navigates to `/relationships` after a short delay.

Recommended improvements:

- Add staggered reveal animation for ranked mentor cards after AI generation.
- Add compare mode for two or three mentors.
- Add "view created relationship" deep link once persisted IDs are routed.
- Add empty state if all startups are matched.
- Add fallback badge in result header when local scoring is active.

Priority: Medium.

---

### `/relationships`

Current role:

- Relationship health list.
- Filters by status and health band.

Current interaction state:

- Good filtering and card hover states.
- No loading, toast, or animated filter transitions.

Recommended improvements:

- Add list skeleton loading.
- Animate cards when filters change.
- Add empty filter state with "Clear filters".
- Add quick actions on relationship card:
  - log meeting,
  - refresh diagnosis,
  - view detail.
- Add subtle health trend animation for improving or deteriorating state.

Priority: Medium.

---

### `/relationships/[id]`

Current role:

- Relationship detail, health, timeline, AI diagnosis, meeting logging.

Current interaction state:

- Diagnosis refresh has toast feedback.
- Meeting analysis has loading state and toast feedback.
- Inline log meeting panel exists and its date, duration, and notes fields are unlocked.
- Inline analysis result shows AI badge, signal badge, health delta, AI summary, and action items.
- Header includes `Copy Mentor Link` and a monospace mentor form URL preview.

Recommended improvements:

- Add route-level skeleton.
- Add animated diagnosis panel refresh, not only button text.
- Add loading visualization for meeting analysis:
  - extracting summary,
  - identifying action items,
  - checking friction signals,
  - recalculating health.
- Add modal option for log meeting, especially on smaller screens.
- Add "mark action item complete" interactions with toast feedback.
- Add timeline item reveal when new meeting result is created.
- Add confirmation before discarding typed meeting notes.
- Align copied mentor token with the public meeting form's expected `meetingSubmissionToken`.

Priority: High.

---

### `/submit-meeting`

Current role:

- Public mentor meeting submission.
- Mentor enters token, date, duration, notes.

Current interaction state:

- Good validation and confirmed result screen.
- Has fallback behavior.
- Uses toast feedback and `AiOperationLoader` during AI meeting analysis.

Recommended improvements:

- Add token resolving state once token becomes valid.
- Add success transition after meeting is logged.
- Add mobile-first sticky submit button.
- Add "analysis pending" fallback badge on success screen.
- Add clear "submit another meeting" action.

Priority: High.

---

### `/program/[cohortId]`

Current role:

- Cohort overview, health heatmap, milestone distribution, AI narrative report.

Current interaction state:

- Report generation has toast and fallback.
- Copy has toast and fallback.

Recommended improvements:

- Add AI loading visualization for report generation:
  - reading cohort health,
  - finding risk clusters,
  - summarizing meeting signals,
  - drafting recommended actions.
- Add report preview reveal animation.
- Add export dialog for report format choices.
- Add relationship heatmap hover/focus detail.
- Add skeleton loading for cohort metrics and heatmap.
- Add modal to inspect a risk cluster from the cohort view.

Priority: Medium.

---

### `/login`

Current role:

- Demo login placeholder.

Current interaction state:

- Minimal static page.

Recommended improvements:

- Add demo-login loading state before routing.
- Add toast or inline confirmation if demo auth is selected.
- Add clear future auth note only if it does not become visible instructional clutter.

Priority: Low.

---

## Recommended Shared Interaction System

### 1. Page Shell Loading

Create reusable page-level loading states:

- `DashboardSkeleton`
- `ListPageSkeleton`
- `SplitPanelSkeleton`
- `DetailPageSkeleton`
- `FormPageSkeleton`
- `ReportPageSkeleton`

Use these in route-level `loading.tsx` files where possible:

- `app/dashboard/loading.tsx`
- `app/programs/loading.tsx`
- `app/programs/[programId]/loading.tsx`
- `app/programs/[programId]/applicants/loading.tsx`
- `app/matching/loading.tsx`
- `app/relationships/loading.tsx`
- `app/relationships/[id]/loading.tsx`
- `app/program/[cohortId]/loading.tsx`

### 2. AI Operation Loader

Create a shared component:

```ts
<AiOperationLoader
  title="Generating mentor matches"
  steps={[
    "Reading startup needs",
    "Scanning mentor expertise",
    "Checking load and availability",
    "Ranking compatibility"
  ]}
/>
```

Use variants:

- `match`
- `fit`
- `meeting`
- `diagnosis`
- `cohort`

The loader should use the current `ai-loading-scan` animation and remain compact enough for cards and panels.

### 3. Toast Contract

Every async action should follow this pattern:

```text
toast.loading(action started)
-> toast.success(action completed)
-> toast.error(action failed or fallback active)
```

Toast copy should be operational and specific:

- "Generating mentor matches..."
- "Generated 3 mentor matches."
- "AI unavailable. Local fallback results are ready."
- "Applicant approved locally."
- "Programme saved locally."
- "Meeting logged. Analysis pending."

### 4. Dialog Contract

Use dialogs for:

- destructive actions,
- irreversible decisions,
- actions that convert one entity into another,
- discarding typed content,
- final review before submission.

Recommended dialogs:

- `ConfirmDialog`
- `DiscardChangesDialog`
- `DecisionDialog`
- `MatchConfirmationDialog`
- `ReportExportDialog`

Dialogs should be short, specific, and action-oriented.

### 5. Motion Rules

Motion should be subtle and operational:

- 150ms to 250ms for hover, focus, active, simple reveals.
- 300ms to 500ms for score bars and skeleton-to-content transitions.
- Staggered lists should use small delays only.
- Respect `prefers-reduced-motion`.
- Avoid decorative motion that does not explain state.

### 6. Empty and Fallback States

Create a reusable `StateBlock` component with variants:

- `empty`
- `error`
- `fallback`
- `success`
- `loading`

Each state should include:

- short title,
- one-sentence explanation,
- optional primary action,
- optional secondary action.

---

## Priority Roadmap

### Phase UI-1: Shared Feedback Foundation

Goal: make all actions feel responsive.

Tasks:

1. Create shared `AiOperationLoader`.
2. Create shared `ConfirmDialog`.
3. Create shared `StateBlock`.
4. Add toast feedback to public application, public meeting, applicant decisions, programme save/delete, and wizard save.
5. Add consistent disabled/loading button states to all async actions.

Impact: Highest. This immediately makes the MVP feel more polished and reliable.

---

### Phase UI-2: Page Loading and Skeletons

Goal: remove static or text-only loading experiences.

Tasks:

1. Add route `loading.tsx` files for major pages.
2. Replace text loading with skeleton layouts.
3. Add split-panel skeletons for applicant review and matching.
4. Add detail skeletons for relationship and programme pages.
5. Add report skeleton for cohort overview.

Impact: High. This makes the app feel more like a production product.

---

### Phase UI-3: Critical Dialogs and Review Moments

Goal: make important decisions feel intentional.

Tasks:

1. Add applicant decision dialog for approve and decline.
2. Add final match confirmation dialog.
3. Add public application final submit review dialog.
4. Add discard-changes dialog for programme edit and meeting notes.
5. Add report export dialog.

Impact: High. This strengthens trust and reduces accidental actions.

---

### Phase UI-4: Motion and Result Reveals

Goal: make AI results feel generated and explainable.

Tasks:

1. Animate AI result panel reveals.
2. Animate score bars from 0 to final values.
3. Stagger mentor cards after matching.
4. Animate applicant detail panel transitions.
5. Animate new meeting timeline items.
6. Add reduced-motion guards.

Impact: Medium. This adds polish after the core feedback system is stable.

---

## Recommended Build Order

1. Build shared `AiOperationLoader`, `ConfirmDialog`, and `StateBlock`.
2. Wire toast coverage across every async/local action.
3. Add applicant decision feedback and dialogs.
4. Add public application scoring loader and final submit dialog.
5. Add public meeting and relationship meeting analysis loaders.
6. Add route-level skeletons.
7. Add result reveal animation and staggered card transitions.

This order gives the largest perceived quality improvement with the least risk.

---

## Success Criteria

The next UI polish pass is successful when:

- every async action has loading, success, and failure feedback,
- every AI action has a visible local loading visualization,
- every destructive or high-impact action has a dialog or undo pattern,
- every route has a skeleton or intentional loading state,
- every empty/fallback/error state looks designed,
- all button interactions feel consistent,
- no page feels frozen while Gemini or local fallback work is happening.

---

## Final Recommendation

The current application does not need a new visual direction. It needs a stronger interaction system. The Morandi Tech style is already appropriate for Verrier: calm, operational, and trust-building. The next milestone should focus on making the interface respond clearly to every user action.

The complete user journey is now clear:

- coordinators use the dashboard to identify work,
- programme teams create and manage programme setup,
- founders submit applications and explicitly request AI fit scoring,
- coordinators review applicant AI output and decide who moves forward,
- coordinators explicitly generate mentor matches,
- coordinators confirm relationships after reviewing the AI reason,
- mentors submit meeting notes and explicitly trigger analysis,
- coordinators refresh relationship diagnosis only when needed,
- coordinators generate cohort intelligence reports on demand.

The AI model should act like an assistant called in by the user, not a background process that surprises the user. Every AI event should therefore follow this contract:

```text
User clicks a clear action
-> UI shows local loading state and toast
-> AI or fallback returns structured output
-> UI reveals the result with explanation
-> user makes the final decision
```

The highest-value next implementation is:

```text
Shared interaction primitives
-> universal toast coverage
-> AI loaders for every AI panel
-> dialogs for critical decisions
-> route skeletons
-> result reveal motion
```

That will make the existing product feel significantly more complete without changing the core architecture.
