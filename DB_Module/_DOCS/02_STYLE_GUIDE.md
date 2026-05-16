# Style Guide

## Design Direction

Verrier uses the **Morandi Tech** design system from `DB_Module/Resource/Design.md`.

The interface should feel calm, operational, and trustworthy: a programme command center for repeated work, not a marketing page. The first viewport should show useful product state such as applications, matches, relationship health, or cohort risk.

## Product UX Principles

- AI does the work; humans make the call.
- Relationships are first-class entities and should look persistent, trackable, and inspectable.
- Prefer dense but readable operational layouts over decorative hero sections.
- Explainability is part of the UI: every AI score needs a reason nearby.
- Status colors must be meaningful and sparing.
- Mobile public flows should be low-friction, especially application and meeting submission.

## Color Tokens

Use these values as the reference palette when extending `app/globals.css` or Tailwind utility usage.

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#faf9f6` | App background |
| `surface-container-lowest` | `#ffffff` | Highest contrast content panels |
| `surface-container-low` | `#f4f3f0` | Subtle bands |
| `surface-container` | `#efeeeb` | Panels and controls |
| `surface-container-high` | `#e9e8e5` | Raised controls |
| `surface-container-highest` | `#e3e2df` | Selected or emphasized surfaces |
| `on-surface` | `#1b1c1a` | Primary text |
| `on-surface-variant` | `#43474c` | Secondary text |
| `outline` | `#73777c` | Strong borders |
| `outline-variant` | `#c3c7cc` | Subtle borders |
| `primary` | `#4a5e6f` | Main actions, score emphasis |
| `primary-container` | `#637789` | Filled badges/pills |
| `secondary` | `#55624f` | Healthy or supportive states |
| `secondary-container` | `#d6e4cc` | Healthy backgrounds |
| `tertiary` | `#79524d` | Critical accents, careful use |
| `tertiary-container` | `#946a64` | Critical filled treatment |
| `error` | `#ba1a1a` | Validation and destructive states |

## Semantic Status Colors

| State | Preferred Treatment |
|-------|---------------------|
| Healthy | Muted green, derived from `secondary` |
| At Risk | Amber utility color, small badges and bars only |
| Critical | Red/error treatment |
| AI generated | Subtle primary or muted violet badge if needed, labeled `AI` |
| Pending | Neutral outline and muted text |

Do not let AI surfaces dominate the full page with purple. The PRD mentions purple badges, but the active Morandi palette should keep AI markers subtle and professional.

## Typography

Primary font: **Inter**.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `headline-xl` | 48px | 600 | 56px | Rare top-level page titles |
| `headline-lg` | 32px | 500 | 40px | Dashboard and major route titles |
| `headline-lg-mobile` | 24px | 600 | 32px | Mobile major titles |
| `headline-md` | 20px | 500 | 28px | Panel headings |
| `body-lg` | 18px | 400 | 28px | Important narrative text |
| `body-md` | 16px | 400 | 24px | Body and form text |
| `label-md` | 14px | 500 | 20px | Form labels, table labels |
| `label-sm` | 12px | 600 | 16px | Badges and metadata |

Do not scale font size with viewport width. Keep letter spacing at `0` unless implementing the source design token for small labels.

## Spacing and Layout

- Base spacing unit: `8px`.
- Default gutter: `24px`.
- Mobile page margin: `16px`.
- Desktop page margin: `48px`.
- Max content width: `1440px`.
- Cards and panels should use `8px` radius or less unless an existing component requires otherwise.
- Avoid nested cards.
- Use full-width bands or unframed layouts for page sections.

## Component Conventions

- Prefer reusable primitives under `components/ui/`.
- Use existing `Button` and `cn()` patterns.
- Use lucide-react icons for icon buttons when available.
- Use tabs for applicant and matching filters.
- Use segmented controls for dashboard/view modes.
- Use sliders for programme criteria weights.
- Use toggles/checkboxes for required document selection.
- Use progress bars or compact meters for scores and health.
- Use tables/lists for operational review surfaces.

## Page-Specific Guidance

### Dashboard

Use a command-center layout:

- Header with date and active cohort.
- Compact metric row.
- Attention Feed as the primary content area.
- Recent meeting summaries as supporting content.

### Programme Setup

Use a wizard or stepper. Criteria weights should feel editable and precise.

### Public Application

Keep the form calm and confidence-building. Show programme fit explanation only after enough fields are present or after explicit score action.

### Matching Engine

Use a two-panel workbench: startup queue on the left, ranked mentor cards on the right. Mentor cards should be comparable at a glance.

### Relationship Detail

HealthScore, timeline, diagnosis, and milestones should all be visible without feeling like separate mini-apps.

### Public Meeting Form

Mobile-first, minimal navigation, one primary action, clear validation for note length.

## Implementation Rules

- Preserve TypeScript strictness.
- Keep feature-specific UI close to its route until reuse is proven.
- Do not introduce a visual library without updating `04_TECH_STACK.md`.
- Do not use decorative gradient/orb backgrounds.
- Do not add visible instructions that explain the UI itself.
- Ensure all button and badge text fits on mobile.
- Use actual product data or realistic seed data in UI; avoid placeholder marketing copy.
