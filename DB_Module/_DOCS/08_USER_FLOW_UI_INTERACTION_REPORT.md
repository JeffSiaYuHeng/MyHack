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

This should be treated as the next polish milestone before deeper persistence work, because it will make the existing MVP feel more alive, confident, and judge-ready.

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
-> coordinator opens matching workbench
-> coordinator generates AI mentor matches
-> coordinator confirms a match
-> relationship is created
-> mentor submits meeting notes
-> AI analyzes meeting health
-> coordinator reviews relationship detail
-> coordinator refreshes diagnosis
-> coordinator generates cohort report
```

The product story is strong. The UI should make every stage feel like part of one operating system, not a set of separate pages.

---

## Current Interaction Strengths

- Dashboard has skeleton loading, animated health bars, status accents, and a stronger operational layout.
- Matching workbench now uses an explicit `Generate AI matches` button with loading visualization and toast feedback.
- Relationship detail uses toast feedback for diagnosis refresh and meeting analysis.
- Cohort overview uses toast feedback for report generation and copy behavior.
- Program list and program detail already have delete confirmation modals.
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
- Local delete updates immediately.

Recommended improvements:

- Add toast on programme delete.
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

Recommended improvements:

- Convert the long form into clear steps or an anchored stepper.
- Add animated completion meter as sections become valid.
- Add save loading state even if local-only.
- Add toast on save.
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

Recommended improvements:

- Add toast on save, cancel, and delete.
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
- Decision buttons update local state immediately.
- There is a simple text loading branch, but it is not actively used.

Recommended improvements:

- Add decision confirmation for `decline` and possibly `approve`.
- Add toast for approve, shortlist, waitlist, decline.
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
- Does not yet use global toast.

Recommended improvements:

- Add toast for fit scoring start, success, fallback, and final submission.
- Add AI loading animation similar to matching, but tailored to fit scoring:
  - reading company profile,
  - checking programme criteria,
  - reviewing support needs,
  - preparing recommendation.
- Add final submit confirmation dialog after score is ready.
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
- Explicit AI button, loading visualization, toasts, confirm state.

Recommended improvements:

- Add a confirmation dialog before final `Confirm Match` showing startup, mentor, score, and reason.
- Add staggered reveal animation for ranked mentor cards after AI generation.
- Add compare mode for two or three mentors.
- Add undo or "view relationship" action after match confirmation.
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
- Inline log meeting panel exists.

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

Priority: High.

---

### `/submit-meeting`

Current role:

- Public mentor meeting submission.
- Mentor enters token, date, duration, notes.

Current interaction state:

- Good validation and confirmed result screen.
- Has fallback behavior, but no toast.

Recommended improvements:

- Add toast for submission start, success, fallback, and error.
- Add token resolving state once token becomes valid.
- Add AI loading visualization tailored to meeting analysis.
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
