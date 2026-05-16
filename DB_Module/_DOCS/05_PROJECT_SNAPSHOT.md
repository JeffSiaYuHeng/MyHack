# Project Snapshot

**Project**: Verrier  
**Repository**: MyHack  
**Event**: Build With AI 2026 KL  
**Last Updated**: 2026-05-16  
**Status**: Verrier PRD initialized in DualBrain docs and phase plan; product code still at scaffold state  

## Current Architecture State

### Frontend

- Next.js App Router project is active.
- `app/page.tsx` still renders the Team MyHack scaffold/status page.
- `app/layout.tsx` sets metadata, Geist fonts, global styles, and `react-hot-toast`.
- `components/ui/button.tsx` provides the reusable button primitive.
- `app/globals.css` defines Tailwind v4 imports and design tokens.

### Product Definition

- Verrier is now the locked product direction.
- Source PRD lives at `DB_Module/Resource/prd.md`.
- Design source lives at `DB_Module/Resource/Design.md`.
- `_DOCS/00_SRS.md` now summarizes the product requirements for Planner use.
- `_DOCS/01_DB_SCHEMA.md` now defines MVP Firestore collections and TypeScript domain shapes.
- `_DOCS/02_STYLE_GUIDE.md` now reflects the Morandi Tech design system.

### AI

- Existing `POST /api/ai` calls Gemini and returns generated text.
- Existing `lib/gemini.ts` provides raw text and scaffold-level JSON helper functions.
- Verrier still needs dedicated JSON AI routes for programme fit, mentor matching, meeting analysis, relationship diagnosis, and cohort summary.

### Data and Auth

- Firebase app, Firestore, and Auth are initialized.
- Firestore helper `saveResult()` is available.
- Verrier-specific collections are documented but not implemented in code.
- Auth UI is not implemented.
- Firestore rules are not yet collection-aware.

### State

- Zustand store tracks messages and current user.
- Product domain types still need to be added to `lib/types.ts`.

### Infrastructure

- Dockerfile supports separate dependency, development, builder, and standalone production runner targets.
- Docker Compose runs local development with `.env.local`, source mounts, hot reload, and optional `APP_PORT` override.
- GitHub Actions deploys to Cloud Run on pushes to `main`.

### DualBrain

- `_DOCS` has been reinitialized around Verrier.
- `_PHASES` is being reinitialized around the Verrier MVP build sequence.
- Phase work should now proceed from the new roadmap rather than the old generic topic-lock phase.

## Current Gaps

- Product code still shows scaffold page.
- No Verrier routes have been implemented yet.
- No seed data module exists yet.
- No domain-specific Firestore helpers exist yet.
- No dedicated Gemini prompt modules exist yet.
- No auth UI exists yet.
- Firestore rules are still scaffold-level.
- Recharts and validation libraries are not installed.

## Recommended Next Milestone

Start `_PHASES` Phase 1, Block A:

1. Add shared Verrier domain types and seed data.
2. Add deterministic mock data for programme, applicants, mentors, relationships, meetings, and cohort.
3. Add small read-only helper functions for dashboard and matching screens.
4. Keep the first block implementation small enough for one `_TASK/_INSTRUCTION.md`.

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
