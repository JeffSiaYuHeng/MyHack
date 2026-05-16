# Tech Stack

## Application

- Next.js `16.2.6`
- React `19.2.4`
- React DOM `19.2.4`
- TypeScript `^5`
- Node.js 20 Alpine in Docker

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

## AI

- `@google/generative-ai` `^0.24.1`
- Current model usage: `gemini-3-flash-preview`
- Server API key: `GEMINI_API_KEY`

## Backend and Data

- Firebase `^12.13.0`
- Firebase Auth initialized in `lib/firebase.ts`
- Firestore initialized in `lib/firebase.ts`
- Firestore rules in `firestore.rules`

## State

- Zustand `^5.0.13`

## Build and Quality

- ESLint `^9`
- `eslint-config-next` `16.2.6`
- Next standalone output enabled in `next.config.ts`

## Infrastructure

- Dockerfile with builder and runner stages
- Docker Compose for local development
- GitHub Actions deployment to Google Cloud Run
- Cloud Run region: `asia-southeast1`

## DualBrain Module

- Markdown-based memory and workflow system under `DB_Module/`
- Agent role skills under `.agent/skills/`
- Structure generator: `scripts/generate-structure.js`
- Dependency graph generator: `scripts/generate-dependency-graph.js`

## Not Currently Installed

- Prisma
- PostgreSQL
- Supabase
- NextAuth
- Stripe
- Playwright
- Vitest

Do not plan work around these tools unless they are intentionally added and this file is updated.
