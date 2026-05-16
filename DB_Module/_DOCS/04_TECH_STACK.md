# Tech Stack

## Application

- Next.js `16.2.6`
- React `19.2.4`
- React DOM `19.2.4`
- TypeScript `^5`
- Node.js 20 Alpine in Docker
- App Router under `app/`

Important: this repository uses a newer Next.js version than common training assumptions. Read relevant guides in `node_modules/next/dist/docs/` before changing framework API usage, metadata, route handlers, caching, or server/client boundaries.

## Styling and UI

- Tailwind CSS `^4`
- `@tailwindcss/postcss`
- `shadcn` `^4.7.0`
- `@base-ui/react` `^1.4.1`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `tw-animate-css`
- `lucide-react`
- `react-hot-toast`

Design source:

- `DB_Module/Resource/Design.md`
- Active palette: Morandi Tech
- Active typography target: Inter

Current font in code is Geist. Phase 1 may migrate to Inter if implementation time allows.

## AI

- `@google/generative-ai` `^0.24.1`
- Current code model: `gemini-3-flash-preview`
- PRD model reference: `gemini-1.5-flash`
- Server API key: `GEMINI_API_KEY`

All AI routes must execute server-side. Prefer structured JSON responses.

## Backend and Data

- Firebase `^12.13.0`
- Firebase Auth initialized in `lib/firebase.ts`
- Firestore initialized in `lib/firebase.ts`
- Firestore rules in `firestore.rules`

MVP collections:

- `programs`
- `applications`
- `cohorts`
- `companies`
- `mentors`
- `relationships`
- `meetings`
- `users`

## State

- Zustand `^5.0.13`

Use Zustand for client workflow state only when prop/state colocation becomes awkward. Firestore data shapes should live in TypeScript domain types.

## Build and Quality

- ESLint `^9`
- `eslint-config-next` `16.2.6`
- Next standalone output enabled in `next.config.ts`
- Structure generator: `scripts/generate-structure.js`
- Dependency graph generator: `scripts/generate-dependency-graph.js`

## Infrastructure

- Dockerfile with dependency, development, builder, and standalone runner stages.
- Docker Compose for local development.
- GitHub Actions deployment to Google Cloud Run.
- Cloud Run region: `asia-southeast1`.

## Candidate Additions

Do not use these until intentionally added and documented:

- Recharts for cohort charts and milestone distribution.
- Firebase Admin SDK for server-side privileged Firestore access.
- Validation library such as Zod for API inputs and Gemini outputs.
- Playwright for browser-based visual verification.

## Not Currently Installed

- Prisma
- PostgreSQL
- Supabase
- NextAuth
- Stripe
- Recharts
- Playwright
- Vitest
- Firebase Admin SDK
- Zod

Do not plan work around uninstalled tools unless a phase block explicitly adds them.

## DualBrain Module

- Markdown-based memory and workflow system under `DB_Module/`.
- Agent role skills under `.agent/skills/`.
- `_DOCS` is the durable Verrier knowledge base.
- `_PHASES` is the strategic build order.
- `_TASK` is the active work instruction layer.
