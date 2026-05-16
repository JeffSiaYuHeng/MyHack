# Project Structure Map

**AUTO-GENERATED** by `scripts/generate-structure.js`  
**DO NOT EDIT MANUALLY** - This file is regenerated before each planning session.  
**Last Updated:** 05/16/2026, 15:20

---

## Purpose
This file provides the current valid file tree to prevent AI hallucination of paths.
It is automatically generated from the actual directory structure.

## Directory Structure

```
MyHack/
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── README.md
├── overview.md
├── SetupReport.md
├── DB_Module/
│   ├── _DOCS/
│   │   ├── LOGS/
│   │   │   ├── 2026-05-16_AI_Fit_Route.md
│   │   │   ├── 2026-05-16_Applicant_Review_Pool.md
│   │   │   ├── 2026-05-16_Auth_Boundary.md
│   │   │   ├── 2026-05-16_Block_A_Closure.md
│   │   │   ├── 2026-05-16_Dashboard_Command_Center.md
│   │   │   ├── 2026-05-16_Design_Token_Alignment.md
│   │   │   ├── 2026-05-16_Docker_Environment.md
│   │   │   ├── 2026-05-16_Domain_Types.md
│   │   │   ├── 2026-05-16_Matching_Data_Normalization.md
│   │   │   ├── 2026-05-16_Matching_Route_Boundary.md
│   │   │   ├── 2026-05-16_Metadata_and_Root_Copy.md
│   │   │   ├── 2026-05-16_Product_Shell.md
│   │   │   ├── 2026-05-16_Programme_Setup_Wizard.md
│   │   │   ├── 2026-05-16_Public_Application.md
│   │   │   └── LOG(format).md
│   │   ├── 00_SRS.md
│   │   ├── 00_STRUCTURE.md
│   │   ├── 01_DB_SCHEMA.md
│   │   ├── 02_STYLE_GUIDE.md
│   │   ├── 03_SERVER_ACTIONS.md
│   │   ├── 04_TECH_STACK.md
│   │   ├── 05_PROJECT_SNAPSHOT.md
│   │   ├── 06_DEPENDENCY_GRAPH.md
│   │   └── PROJECT_SNAPSHOT.md
│   ├── _PHASES/
│   │   ├── 00_INIT.md
│   │   ├── 00_ROADMAP.md
│   │   ├── PHASE_1__Verrier_Product_Foundation.md
│   │   ├── PHASE_2__Programme_Intake_and_Applicant_Review.md
│   │   ├── PHASE_3__Mentor_Matching_and_Relationship_Creation.md
│   │   ├── PHASE_4__Relationship_Health_and_Cohort_Intelligence.md
│   │   └── PHASE_5__Demo_Hardening_and_Deployment_Readiness.md
│   ├── _TASK/
│   │   ├── _Hand_OverLog.md
│   │   ├── _INSTRUCTION.md
│   │   ├── _INSTRUCTION(Sample).md
│   │   ├── _PLAN.md
│   │   └── _PLAN(Sample).md
│   ├── Resource/
│   │   ├── Design.md
│   │   └── prd.md
│   ├── DB_README.md
│   ├── Manual.md
│   └── prd.md
├── app/
│   ├── api/
│   │   └── ai/
│   │       ├── match/
│   │       │   └── route.ts
│   │       ├── program-fit/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── apply/
│   │   └── [programId]/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── programs/
│   │   ├── [programId]/
│   │   │   └── applicants/
│   │   │       └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── features/
│   │   ├── applicant-review-pool.tsx
│   │   ├── dashboard-command-center.tsx
│   │   ├── product-shell.tsx
│   │   ├── program-setup-wizard.tsx
│   │   └── public-application-form.tsx
│   └── ui/
│       └── button.tsx
├── lib/
│   ├── firebase.ts
│   ├── gemini.ts
│   ├── store.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── verrier-analytics.ts
│   └── verrier-seed.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── scripts/
    ├── generate-dependency-graph.js
    └── generate-structure.js
```

---

## Maintenance

- **Auto-generated:** Run `npm run gen:structure` or `node scripts/generate-structure.js`
- **Pre-planning hook:** This should run automatically before Planner agent execution
- **Ignored items:** node_modules, .git, .next, dist, build, .turbo, .vercel, coverage
- **Scanned directories:** DB_Module, .agent, app, components, context, hooks, lib, public, utils, scripts

## Integration with Dual-Brain System

The Planner agent should always read this file first to ensure accurate path references.
This eliminates the need for manual updates and prevents outdated structure information.
