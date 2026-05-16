# Style Guide

**Product:** Verrier  
**Last Updated:** 2026-05-17  
**Design Direction:** Unified Light Morandi Operations

---

## Overview

Verrier is an AI-powered relationship intelligence platform for innovation programme teams. The interface should feel calm, structured, trustworthy, and operational. It is not a consumer social product, a crypto dashboard, or a dramatic AI showcase. It is a professional command center for programme administrators who need to review applicants, match mentors, monitor relationship health, and prepare cohort intelligence.

The design must use one unified visual language across all pages:

- light operational surfaces,
- restrained color,
- clear status semantics,
- dense but readable layouts,
- card-based data regions,
- explicit AI callouts,
- consistent buttons, dialogs, loading states, and toasts.

Do not use a split dark/light identity. Do not use a near-black sidebar, black hero surfaces, or coral-red brand system. The application should feel like a reliable programme operations tool: precise, quiet, and easy to scan for repeated daily work.

---

## Design Thesis

Verrier’s interface is built around one idea:

> Relationships are operational assets, and AI should make their state easier to understand.

The UI should make relationship state visible through:

- programme metrics,
- applicant fit scores,
- mentor match scores,
- relationship health scores,
- meeting signals,
- watch points,
- cohort risk summaries.

AI should appear as an assistant inside the workflow, not as a decorative theme. AI-generated content must be clearly labeled, explainable, and easy to compare.

---

## Product UX Principles

- **AI does the work; humans make the call.** AI recommends, summarizes, diagnoses, and ranks. Coordinators approve, confirm, and decide.
- **Relationships are first-class entities.** A mentor-startup match should feel trackable over time, not like a one-off assignment.
- **Use operational density.** Show useful product state early. Avoid empty hero sections, marketing copy, or decorative layouts.
- **Explainability is mandatory.** Every score or recommendation needs nearby reasoning.
- **Status color must be meaningful.** Green, amber, red, and AI accent colors should carry information, not decoration.
- **Public flows should be low-friction.** Startup application and mentor meeting submission must be calm, narrow, mobile-friendly, and easy to complete.
- **Selection should preview, not execute.** Selecting an applicant, startup, mentor, or filter should not trigger AI automatically.
- **AI calls are explicit.** Gemini calls must be triggered by clear buttons or form submissions.

---

## Unified Visual System

### Personality

Verrier should feel:

- calm,
- organized,
- high-trust,
- analytical,
- human-supervised,
- suitable for accelerators, universities, corporates, and public innovation agencies.

Verrier should not feel:

- dark and dramatic,
- neon,
- overly futuristic,
- playful,
- decorative,
- sales-page-like,
- dominated by one strong color.

### Layout Character

The product should use:

- light page background,
- white cards and panels,
- subtle grey borders,
- muted blue-grey primary actions,
- green/amber/red for relationship state,
- consistent card radii,
- clear grouping,
- compact tables/lists/cards for repeated operational items.

---

## Color Tokens

Use these values as the canonical palette when extending `app/globals.css`, Tailwind utilities, or component-level styles.

| Token | Hex | Usage |
|---|---:|---|
| `surface` | `#faf9f6` | App background |
| `surface-container-lowest` | `#ffffff` | Cards, panels, highest contrast content |
| `surface-container-low` | `#f4f3f0` | Subtle page bands and disabled fills |
| `surface-container` | `#efeeeb` | Controls, tabs, muted cards |
| `surface-container-high` | `#e9e8e5` | Raised controls, selected soft backgrounds |
| `surface-container-highest` | `#e3e2df` | Stronger selected surfaces |
| `on-surface` | `#1b1c1a` | Primary text |
| `on-surface-variant` | `#43474c` | Secondary text |
| `outline` | `#73777c` | Strong borders, rare |
| `outline-variant` | `#c3c7cc` | Default borders |
| `primary` | `#4a5e6f` | Primary actions, score emphasis, AI accent base |
| `primary-container` | `#d8e4ed` | Primary soft fill |
| `secondary` | `#55624f` | Healthy/supportive state |
| `secondary-container` | `#d6e4cc` | Healthy backgrounds |
| `warning` | `#8a5a00` | At-risk text |
| `warning-container` | `#f2dfb8` | At-risk backgrounds |
| `critical` | `#9f2f2f` | Critical text |
| `critical-container` | `#f2d4d1` | Critical backgrounds |
| `error` | `#ba1a1a` | Validation and destructive actions |

### Color Rules

- Use `surface` for the global background.
- Use `surface-container-lowest` for cards and important content panels.
- Use `primary` for AI accent, primary CTAs, score bars, and selected borders.
- Use green/amber/red only for status.
- Avoid black backgrounds in the application shell.
- Avoid saturated coral/red as brand accent.
- Avoid purple gradients and decorative AI glows.
- Do not let AI color dominate full pages.

---

## Semantic Status Colors

| State | Treatment |
|---|---|
| Healthy | Muted green text and soft green background |
| At Risk | Amber text and soft amber background |
| Critical | Red text and soft red background, no flashing |
| AI generated | Muted primary/blue-grey badge labeled `AI` or `✦ AI` |
| Pending | Neutral border and muted text |
| Selected | Primary border, subtle shadow, soft primary background |
| Disabled | Muted surface, muted text, no hover lift |
| Fallback active | Amber badge or fallback state block |

Critical states should be clear but stable. Do not use flashing, pinging, or pulsing numbers for critical counts. Use steady color, border, and card treatment instead.

---

## Typography

Primary font: **Inter**.

Use a single primary type family across the app. Avoid introducing a strong mono brand layer unless it is already implemented globally. Monospace is allowed only for URLs, tokens, IDs, and compact technical metadata.

| Token | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| `headline-xl` | 40-48px | 600 | 48-56px | Rare top-level marketing/pitch surfaces, not routine app panels |
| `headline-lg` | 28-32px | 600 | 36-40px | Major page headings |
| `headline-md` | 20px | 600 | 28px | Panel headings and route titles |
| `title-sm` | 15-16px | 600 | 22-24px | Card titles, company names, mentor names |
| `body-md` | 14-16px | 400 | 22-24px | Form and body content |
| `label-md` | 12-14px | 500-600 | 18-20px | Labels, tabs, table metadata |
| `label-sm` | 10-12px | 600 | 14-16px | Badges, status chips, compact metrics |

Typography rules:

- Do not scale font size with viewport width.
- Keep letter spacing at `0` for normal text.
- Uppercase labels may use modest tracking for section eyebrows.
- Use tabular numbers for metrics, scores, counts, and health values.
- Keep headings compact inside cards and panels.

---

## Spacing and Layout

- Base spacing unit: `8px`.
- Mobile page margin: `16px`.
- Desktop page margin: `40-48px`.
- Default panel gap: `16-24px`.
- Max content width: `1440px`.
- Cards and panels should use `8px` radius or less unless an existing primitive requires slightly more.
- Avoid nested cards. Use bordered sections, dividers, or subtle bands inside a card instead.
- Use full-width operational layouts, not hero sections.
- Keep dashboards scannable at 1280px wide and comfortable at mobile widths.

---

## Component Conventions

### Buttons

- Use existing `Button` and `cn()` patterns where possible.
- Buttons and action links share global hover/active behavior:
  - `200ms` ease-out transition,
  - subtle hover lift/shadow,
  - pressed active state,
  - disabled state with no lift.
- Primary actions use muted blue-grey primary styling.
- Destructive actions use red only when the action is actually destructive.
- Icon buttons should use `lucide-react` when an icon exists.
- Keep button labels short and action-specific.

### Cards and Panels

Cards should:

- group one coherent unit of work or data,
- use white or near-white surfaces,
- use subtle borders,
- avoid heavy shadows,
- use status accent bars sparingly,
- have stable dimensions where repeated cards need comparison.

Use cards for:

- programme cards,
- applicant rows/details,
- mentor recommendation cards,
- relationship cards,
- metric groups,
- dialogs,
- AI result panels.

Do not use cards for every page section if a simple band or divider is enough.

### Badges and Status Chips

- Use small badges for status, AI, fallback, health, and stage.
- Status badges must be readable and not overpower the card.
- AI badges should say `✦ AI` or `AI`.
- Avoid decorative pills with no operational meaning.

### Forms

- Public forms should be narrow and calm.
- Coordinator forms may be denser but still need clear labels.
- Required fields should be visible through labels and validation.
- Long forms should use sections, completion indicators, or sticky preview panels.
- Textareas for meeting notes and founder summaries should show enough height to encourage useful input.

### Toasts

Use the global `react-hot-toast` system for:

- AI loading,
- AI success,
- AI fallback/error,
- save/delete/copy actions,
- approval/decision feedback,
- report copy.

Toast copy should be direct:

- "Generating mentor matches..."
- "Match confirmed - relationship created"
- "Mentor link copied to clipboard"
- "Meeting analyzed"
- "AI unavailable. Local fallback is ready."

### Dialogs

Use confirmation dialogs for:

- approving/declining applicants,
- confirming mentor matches,
- deleting programmes,
- final application submit,
- discarding meaningful typed content.

Dialogs should include:

- clear title,
- one-sentence consequence,
- primary action,
- cancel action,
- optional summary of the object being changed.

### Loading States

Long-running AI actions need both:

- local visual loading state,
- toast loading state.

Use `AiOperationLoader` or equivalent staged loaders for:

- programme fit scoring,
- mentor matching,
- meeting analysis,
- diagnosis,
- cohort report generation.

Avoid blank panels and generic "Loading..." text for major workflows.

---

## AI Interaction Rules

All Gemini calls must be explicit user actions.

Allowed triggers:

- `Get fit score & submit`
- `Generate AI matches`
- `Submit meeting notes`
- `Submit & Analyze`
- `Refresh Diagnosis`
- `Generate Report`

Disallowed triggers:

- page load,
- route render,
- selecting a startup,
- selecting an applicant,
- selecting a filter,
- passive `useEffect`,
- hovering or focusing a control.

Every AI result must show:

- score or signal when applicable,
- plain-language reason,
- breakdown or action items when applicable,
- fallback state if Gemini is unavailable.

---

## Shared Interaction Patterns

### Dashboard Metrics

Use compact card groups for top-level metrics. Numbers should be stable, tabular, and non-flashing.

### Applicant Approval Handoff

After approval, show a green banner:

- "Approved - ready for mentor matching"
- include `Go to Matching` action.

### Mentor Recommendation Cards

Mentor match cards should feel like AI recommendation objects, not plain list rows.

Each card should include:

- rank badge,
- mentor name,
- role and company,
- overall match score,
- breakdown bars,
- AI reason,
- warnings if present,
- selected state,
- clear select button.

### Relationship Detail

Relationship detail should expose:

- health score,
- status and urgency,
- copy mentor link action,
- milestones,
- match breakdown,
- AI diagnosis,
- meeting timeline,
- inline log meeting form,
- inline AI meeting result.

### Public Meeting Submission

Mentor form should remain narrow and focused:

- token,
- date,
- duration,
- notes,
- submit action,
- AI analysis result.

---

## Page-Specific Guidance

### Dashboard

Use a command-center layout:

- card-style metric row,
- attention feed as primary area,
- recent meetings as supporting area,
- stable critical status treatment,
- no flashing numbers.

### Programme List

Show programme cards with:

- status,
- applications,
- approved count,
- mentor count,
- date range,
- View / Applicants / Delete actions.

### Programme Setup

Use a wizard-like structure:

- basics,
- target profile,
- selection criteria,
- required documents,
- mentor pool,
- dates,
- preview panel.

Criteria weights should be editable and precise.

### Applicant Review

Use a split workbench:

- filter tabs and applicant queue on the left,
- selected applicant detail on the right,
- AI insight and fit score in the detail panel,
- approval/decline confirmation,
- post-approval Matching nudge.

### Public Application

Keep the form calm and confidence-building:

- programme summary,
- company profile,
- founder profile,
- support needs,
- documents,
- fit preview.

Show programme fit explanation only after explicit AI score action.

### Matching Engine

Use a two-panel workbench:

- startup queue on the left,
- selected startup and ranked mentor cards on the right.

Selecting a startup only changes context and resets previous AI output. The coordinator starts ranking with `Generate AI matches`.

### Relationship List

Use relationship cards that show:

- company,
- mentor,
- health score,
- trend,
- meeting count,
- days since last meeting,
- AI diagnosis snippet.

Filters should remain compact and fast.

### Relationship Detail

Health score, timeline, diagnosis, milestones, match breakdown, copy mentor link, and meeting analysis should be visible without feeling like separate mini-apps.

### Public Meeting Form

Mobile-first, minimal navigation, one primary action, clear validation for note length.

### Cohort Overview

Use an operational report layout:

- health overview,
- risk distribution,
- milestone progress,
- relationship heatmap,
- AI narrative report,
- copy/export affordance.

---

## Implementation Rules

- Preserve TypeScript strictness.
- Keep feature-specific UI close to its route until reuse is proven.
- Do not introduce a visual library without updating `04_TECH_STACK.md`.
- Do not use decorative gradient/orb backgrounds.
- Do not add visible instructions that merely explain how the UI works.
- Ensure all button and badge text fits on mobile.
- Use actual product data or realistic seed data in UI; avoid placeholder marketing copy.
- Keep all AI calls behind explicit user actions.
- Prefer shared primitives for toasts, dialogs, loading states, and state blocks.
- Keep the design unified: no dark theme shell, no black sidebar, no coral-red brand system.
