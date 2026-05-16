# MyHack Project Overview

## Current Statement

MyHack is a hackathon-ready AI prototype scaffold for Build With AI 2026 KL. It combines a deployable Next.js application foundation with a new DualBrain Module that gives the project a structured agentic workflow for planning, coding, evaluation, and archival.

The application layer is currently a prepared product shell: Team MyHack branding, Gemini integration, Firebase persistence hooks, state management, Docker support, and Cloud Run deployment automation. The final hackathon feature is still pending topic drop.

The DualBrain layer is now the project operating system. It stores long-term project truth in `_DOCS`, future execution strategy in `_PHASES`, active task instructions in `_TASK`, and role-specific agent behavior in `.agent/skills`.

## Project Status

Status: scaffold ready, DualBrain initialized, product feature pending.

The repository is ready for rapid feature implementation once the event topic is released. The most important current gap is not infrastructure, but product direction: the project still needs a selected idea, real environment variables, and a bootstrapped DualBrain roadmap.

## Application Stack

- Framework: Next.js 16.2.6 with App Router
- Runtime UI: React 19.2.4 and React DOM 19.2.4
- Language: TypeScript
- Styling: Tailwind CSS v4, `shadcn/tailwind.css`, `tw-animate-css`
- UI primitives: `@base-ui/react`, class-variance-authority, clsx, tailwind-merge
- Icons and feedback: lucide-react, react-hot-toast
- AI: Google Gemini through `@google/generative-ai`
- Backend services: Firebase Auth and Firestore
- Client state: Zustand
- Deployment target: Google Cloud Run
- Containerization: Docker and Docker Compose

## Current Application Surface

`app/page.tsx` renders the current scaffold experience:

- Team MyHack hero heading
- Build With AI 2026 KL prototype label
- Team member cards for Jeff, Chun Xin, Hamse, and Rose
- System status panel
- Quick action buttons for future AI and auth checks
- Topic-drop placeholder
- Event footer for Sunway University, Petaling Jaya, May 16-17, 2026

`app/layout.tsx` sets metadata, Geist fonts, global styles, and the toast provider. `app/globals.css` defines the Tailwind v4 theme tokens.

## AI Layer

AI support is split between an API route and helper functions:

- `app/api/ai/route.ts` exposes `POST /api/ai`, accepts a `prompt`, calls Gemini 3 Flash Preview, and returns generated text.
- `lib/gemini.ts` provides `generateContent(prompt)` for raw text and `analyzeWithGemini(input, outputSchema)` for structured JSON responses using `responseMimeType: "application/json"`.

The required server environment variable is `GEMINI_API_KEY`.

## Firebase and State

`lib/firebase.ts` initializes Firebase, Firestore, and Auth from public Firebase environment variables. It also exports `saveResult(collectionName, data)`, which writes a Firestore document with a server timestamp.

`lib/store.ts` uses Zustand to track messages and the current user. Shared app types live in `lib/types.ts`.

No final Firestore collection schema exists yet because the hackathon product direction has not been locked.

## Infrastructure

The Dockerfile uses a builder/runner structure for standalone Next.js output. `docker-compose.yml` runs local development on port 3000 with `.env.local`.

`.github/workflows/deploy.yml` deploys to Google Cloud Run on pushes to `main`, using service `myhack-app` in region `asia-southeast1`.

## DualBrain Module

`DB_Module/` adds a Markdown-based agent workflow and memory system. Its purpose is to reduce context drift during rapid development by separating stable project truth, roadmap state, active instructions, and agent handovers.

### `_DOCS` Long-Term Memory

`DB_Module/_DOCS` now reflects the actual MyHack project instead of sample content:

- `00_SRS.md`: current product requirements snapshot for the scaffold stage
- `00_STRUCTURE.md`: generated file tree from the real repository
- `01_DB_SCHEMA.md`: current Firebase/Auth/Firestore data truth and schema gaps
- `02_STYLE_GUIDE.md`: current UI conventions and styling rules
- `03_SERVER_ACTIONS.md`: current API and helper contracts
- `04_TECH_STACK.md`: approved and installed technology stack
- `05_PROJECT_SNAPSHOT.md`: detailed current state and gaps
- `06_DEPENDENCY_GRAPH.md`: generated import/dependency map
- `PROJECT_SNAPSHOT.md`: compact quick-orientation snapshot
- `LOGS/`: evaluator audit log location

The project now includes generator commands:

```bash
npm run gen:structure
npm run gen:graph
```

Both write into `DB_Module/_DOCS`.

### `_PHASES` Strategic Memory

`DB_Module/_PHASES/00_INIT.md` is the bootstrap controller. It expects the Planner to read `_DOCS/00_SRS.md`, generate phase files, then create `00_ROADMAP.md`.

Current state: not bootstrapped yet. There is no `00_ROADMAP.md` or `PHASE_N__*.md` file yet.

### `_TASK` Working Memory

`DB_Module/_TASK` holds active task execution files:

- `_INSTRUCTION.md`
- `_Hand_OverLog.md`
- `_INSTRUCTION(Sample).md`
- `_PLAN(Sample).md`

Current note: `_INSTRUCTION.md` contains an unrelated sample R2 task and should be replaced by the Planner before real implementation work starts.

### `.agent` Agent Skills

`.agent/skills` defines the role behavior for the DualBrain workflow:

- `dual-brain-planner`: reads docs and phases, writes task plans and instructions
- `dual-brain-coder`: implements only the scoped instruction
- `dual-brain-evaluator`: verifies build, scope, and phase acceptance
- `dual-brain-archivist`: compacts completed work into long-term memory and advances phase state after evaluator signal

The intended loop is:

```text
Planner -> Coder -> Evaluator -> Archivist
```

For simple build or syntax failures, the system also supports:

```text
Evaluator -> Coder -> Evaluator
```

## Current Project Structure

```text
MyHack/
├── .agent/                  # DualBrain role skills
├── .github/workflows/       # Cloud Run deployment workflow
├── app/                     # Next.js routes, layout, styles, API
├── components/              # UI and future feature components
├── DB_Module/               # DualBrain docs, phases, task memory
├── lib/                     # Gemini, Firebase, store, types, utilities
├── public/                  # Static scaffold assets
├── scripts/                 # DualBrain doc generators
├── Dockerfile
├── docker-compose.yml
├── firebase.json
├── firestore.rules
├── next.config.ts
├── package.json
├── SetupReport.md
└── overview.md
```

For the full generated tree, see `DB_Module/_DOCS/00_STRUCTURE.md`.

## Environment Variables

Local development should use `.env.local` based on `.env.local.example`.

Required values:

- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

GitHub deployment also expects:

- `GCP_SA_KEY`
- `GEMINI_API_KEY`

## Available Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run gen:structure
npm run gen:graph
```

Docker local development:

```bash
docker compose up --build
```

## Immediate Next Steps

1. Populate `.env.local` with real Gemini and Firebase values.
2. Run `npm run build` to verify the scaffold before topic work begins.
3. Use `DB_Module/_PHASES/00_INIT.md` to bootstrap `00_ROADMAP.md` and phase files from `DB_Module/_DOCS/00_SRS.md`.
4. Replace the stale `_TASK/_INSTRUCTION.md` sample with the first real Planner-generated task.
5. After topic drop, update `00_SRS.md`, finalize Firestore collections, and build the selected product workflow.

## Summary

MyHack is now both an application scaffold and an agent-managed development system. The app provides the deployable AI/Firebase/Next.js foundation, while the DualBrain Module provides structured project memory and execution discipline. The repository is ready for the next phase: bootstrap the roadmap, lock the hackathon topic, and build the actual user-facing product.
