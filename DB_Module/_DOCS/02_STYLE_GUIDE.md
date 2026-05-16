# Style Guide

## Current UI Direction

MyHack currently presents as a polished hackathon scaffold and status surface. The UI should feel fast, clear, and operational: useful for a team building under time pressure, without turning into a marketing landing page once the actual product flow begins.

## Active Styling System

- Tailwind CSS v4
- `shadcn/tailwind.css`
- `tw-animate-css`
- CSS variables in `app/globals.css`
- Geist Sans and Geist Mono from `next/font/google`
- Base UI button primitive wrapped in `components/ui/button.tsx`
- `cn()` utility from `lib/utils.ts`

## Design Tokens

Current colors are neutral OKLCH tokens with light/dark support:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--muted`
- `--accent`
- `--destructive`
- `--border`
- `--input`
- `--ring`

Radius base:

- `--radius: 0.625rem`

## Component Conventions

- Prefer reusable primitives under `components/ui/`.
- Use the existing `Button` component for button controls.
- Use `variant` and `size` props from `buttonVariants` instead of ad hoc button classes.
- Use `cn()` for conditional class composition.
- Keep feature-specific UI close to the feature until reuse is proven.

## Current Page Pattern

`app/page.tsx` uses:

- Centered full-screen scaffold layout
- Large team heading
- Team member grid
- Status cards
- Quick action controls
- Topic-drop placeholder

This is acceptable for the pre-topic state. Once the product idea is known, the first screen should become the actual usable product experience.

## Implementation Rules

- Preserve TypeScript strictness.
- Prefer existing repo patterns before introducing new component abstractions.
- Keep cards for discrete repeated items or status panels only.
- Avoid nested cards.
- Keep text readable across mobile and desktop.
- Do not add new visual libraries without updating `04_TECH_STACK.md`.
- Do not add generated decorative SVGs when actual product UI would be more useful.
