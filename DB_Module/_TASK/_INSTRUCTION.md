# Task Instruction: Make Docker Local Environment Usable

## Strategic Anchor

- Phase: `PHASE_1__Scaffold_Operational.md`
- Block: `Block A: Docker Local Environment`

## Context

The current Docker setup cannot be used directly because `docker-compose.yml` requires a missing `.env.local` file and runs `npm run dev` against an image built from a production-only Dockerfile. The goal is to support local Docker development while keeping production standalone builds available.

---

## Context Scope (Strict)

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore` (new)
- `.env.example` (new)
- `.env.local` (new local placeholder; ignored by Git)

---

## Reference Scope (Read-Only)

- `package.json`
- `next.config.ts`

---

## Steps (Execution Order)

1. Add a `.dockerignore` that excludes local dependencies, build output, Git metadata, logs, and real env files while allowing `.env.example`.
2. Add `.env.example` documenting all Gemini and Firebase variables required by the app.
3. Add a local `.env.local` placeholder so Docker Compose can run immediately without a missing env-file error.
4. Refactor `Dockerfile` into dependency, development, builder, and production runner targets.
5. Update `docker-compose.yml` to use the development target, mount source code for hot reload, and expose port `3000`.

---

## Constraints & Rules

- Do not put real secrets into committed files.
- Keep `next.config.ts` standalone output unchanged for production Docker builds.
- Keep Docker local development on port `3000`.
- Do not introduce extra services or databases.

---

## Out of Scope

- Do not change app feature code.
- Do not add Firebase emulators.
- Do not change GitHub Actions deployment in this task.

---

## Quality Checklist (Self-Review)

- [x] Context Scope contains ≤ 4 tracked files plus local ignored env placeholder.
- [x] `docker compose config` succeeds.
- [x] `docker compose build` succeeds.
- [x] Docker Compose can start the Next.js dev server.
