# Project Snapshot

**Project**: MyHack  
**Event**: Build With AI 2026 KL  
**Last Updated**: 2026-05-16  
**Status**: Scaffold and Docker environment verified, product feature pending topic drop  

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

- Dockerfile supports separate dependency, development, builder, and standalone production runner targets.
- Docker Compose runs local development with `.env.local`, source mounts, hot reload, and optional `APP_PORT` override.
- GitHub Actions deploys to Cloud Run on pushes to `main`.

### DualBrain

- `DB_Module/` has been added as the project memory and execution protocol layer.
- `.agent/skills/` defines Planner, Coder, Evaluator, and Archivist roles.
- `_DOCS` is initialized to describe the actual MyHack scaffold.
- `_PHASES/00_INIT.md` has been bootstrapped.
- `_PHASES/00_ROADMAP.md` now points to Phase 2, Block A.
- Phase 1: Scaffold Operational is complete.
- `_TASK` contains sample and active task handover files.

## Current Gaps

- Final hackathon product idea is not selected.
- `.env.local` exists with placeholder values and must be populated with real Firebase and Gemini values.
- Port `3000` may be occupied by another local Docker project; use `APP_PORT=3001 docker compose up -d` until it is free.
- Firestore schema and rules are still broad and scaffold-level.
- `README.md` remains the default Next.js README.

## Recommended Next Milestone

Lock the hackathon topic and define the first product slice:

1. Update `DB_Module/_DOCS/00_SRS.md` with the selected topic and target users.
2. Update `DB_Module/_DOCS/01_DB_SCHEMA.md` with initial Firestore collections.
3. Create the first product workflow instruction from Phase 2, Block A.
4. Replace placeholder env values with real Gemini and Firebase credentials.

## Known Working Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run gen:structure
npm run gen:graph
docker compose config
docker compose build
APP_PORT=3001 docker compose up -d
```
