# Project Snapshot

**Project**: MyHack  
**Event**: Build With AI 2026 KL  
**Last Updated**: 2026-05-15  
**Status**: Scaffold ready, product feature pending topic drop  

## Current Architecture State

### Frontend

- Next.js App Router project is active.
- `app/page.tsx` renders the Team MyHack landing/status page.
- `app/layout.tsx` sets metadata, Geist fonts, global styles, and `react-hot-toast`.
- `components/ui/button.tsx` provides the reusable button primitive.
- `app/globals.css` defines Tailwind v4 imports and design tokens.

### AI

- `POST /api/ai` calls Gemini 3 Flash Preview and returns generated text.
- `lib/gemini.ts` provides both raw text generation and structured JSON analysis helpers.
- `GEMINI_API_KEY` is required in local and deployment environments.

### Data and Auth

- Firebase app, Firestore, and Auth are initialized.
- Firestore helper `saveResult()` is available.
- No product-specific collections are finalized.
- Auth UI is not implemented.

### State

- Zustand store tracks messages and current user.
- Shared app types are in `lib/types.ts`.

### Infrastructure

- Dockerfile supports standalone Next.js production output.
- Docker Compose runs local development with `.env.local`.
- GitHub Actions deploys to Cloud Run on pushes to `main`.

### DualBrain

- `DB_Module/` has been added as the project memory and execution protocol layer.
- `.agent/skills/` defines Planner, Coder, Evaluator, and Archivist roles.
- `_DOCS` is initialized to describe the actual MyHack scaffold.
- `_PHASES/00_INIT.md` exists as the roadmap bootstrap controller.
- `_TASK` contains sample and active task handover files.

## Current Gaps

- Final hackathon product idea is not selected.
- `.env.local` must be populated with real Firebase and Gemini values.
- DualBrain `_PHASES` has not been bootstrapped into `00_ROADMAP.md` and `PHASE_N__*.md` files.
- `_TASK/_INSTRUCTION.md` currently contains an unrelated R2 sample and should be replaced by the Planner once a real task starts.
- Firestore schema and rules are still broad and scaffold-level.
- `README.md` remains the default Next.js README.

## Recommended Next Milestone

Initialize DualBrain planning for this actual project:

1. Read `DB_Module/_DOCS/00_SRS.md`.
2. Use `DB_Module/_PHASES/00_INIT.md` to generate the roadmap and phase files.
3. Replace stale sample task instructions with a real first task.
4. Run `npm run gen:structure` and `npm run gen:graph` before planning implementation work.

## Known Working Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run gen:structure
npm run gen:graph
```
