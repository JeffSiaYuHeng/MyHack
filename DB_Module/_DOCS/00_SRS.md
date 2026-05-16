# Software Requirements Snapshot

## Product Name

MyHack Prototype

## Event Context

Build With AI 2026 KL, Sunway University, Petaling Jaya, May 16-17, 2026.

## Current Product Statement

MyHack is a hackathon-ready AI application scaffold. Before topic drop, it exists as a prepared foundation: a Next.js app shell with Gemini, Firebase, state management, Docker, Cloud Run deployment, and a DualBrain agent workflow for structured implementation.

The final user-facing product is not defined yet. The system must remain flexible enough to absorb the hackathon topic quickly.

## Primary Goals

- Let the team start feature work immediately after the hackathon prompt is released.
- Keep AI calls server-side and ready for structured output.
- Provide Firebase persistence and auth foundations.
- Maintain a clear project memory through DualBrain docs and phases.
- Support fast local development and deployment to Cloud Run.

## Current Users

- Team MyHack members: Jeff, Chun Xin, Hamse, and Rose.
- Future demo users or judges, depending on the selected hackathon idea.

## Implemented Capabilities

- Team MyHack landing/status page.
- Server-side Gemini text generation route.
- Gemini helper for structured JSON responses.
- Firebase app, Firestore, and Auth initialization.
- Firestore write helper.
- Zustand client store for messages and user.
- Docker and Docker Compose setup.
- GitHub Actions Cloud Run deployment workflow.
- DualBrain project memory and agent protocol files.

## Required Near-Term Capabilities

- Real `.env.local` values for Gemini and Firebase.
- Topic-specific product workflow.
- First real data model and Firestore collection plan.
- UI wired to AI and persistence helpers.
- Auth flow if the final idea needs user identity.
- Roadmap and phase files generated from this SRS.

## Constraints

- Follow current Next.js 16 project conventions.
- Read Next.js docs in `node_modules/next/dist/docs/` before using framework APIs that may have changed.
- Keep implementation scoped for a hackathon timeline.
- Do not introduce heavy infrastructure unless the final idea requires it.
- Keep all DualBrain planning traceable to `_PHASES` once bootstrapped.

## Non-Goals For The Scaffold Stage

- No finalized domain schema before topic drop.
- No payment, Prisma, SQL, or external auth provider work unless selected later.
- No broad redesign of the scaffold landing page until the actual product direction is known.

## Acceptance For Initialization

- `_DOCS` reflects the actual MyHack project rather than sample content.
- Structure and dependency graph generation commands exist.
- `overview.md` explains both the app scaffold and DualBrain Module.
- The next Planner can bootstrap `_PHASES` from this SRS without needing external context.
