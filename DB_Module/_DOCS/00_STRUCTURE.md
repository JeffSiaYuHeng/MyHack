# Project Structure Map

**Last Updated:** 2026-05-17 (post-hackathon polish session)

---

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
├── .env.example
├── .env.local
├── README.md
├── DB_Module/
│   ├── _DOCS/
│   │   ├── LOGS/
│   │   │   └── [session logs]
│   │   ├── 00_SRS.md
│   │   ├── 00_STRUCTURE.md          ← this file
│   │   ├── 01_DB_SCHEMA.md
│   │   ├── 02_STYLE_GUIDE.md
│   │   ├── 03_SERVER_ACTIONS.md
│   │   ├── 04_TECH_STACK.md
│   │   ├── 05_PROJECT_SNAPSHOT.md
│   │   ├── 06_DEPENDENCY_GRAPH.md
│   │   ├── 07_DATA_FLOW.md
│   │   └── PROJECT_SNAPSHOT.md
│   ├── _PHASES/
│   ├── _TASK/
│   ├── Resource/
│   ├── DB_README.md
│   └── Manual.md
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analyze-meeting/route.ts   ← POST: meeting notes → Gemini → summary, signal, delta
│   │   │   ├── cohort-summary/route.ts    ← POST: cohortId → Gemini → narrative, risks, actions
│   │   │   ├── diagnose/route.ts          ← POST: relationshipId → Gemini → narrative, watchPoints, recommendation
│   │   │   ├── match/route.ts             ← POST: startupId → Gemini → top 3 mentor matches
│   │   │   ├── program-fit/route.ts       ← POST: companyProfile → Gemini → fitScore, breakdown
│   │   │   └── route.ts                   ← legacy scaffold route (unused)
│   │   └── relationships/
│   │       └── confirm-match/route.ts     ← POST: creates Relationship, attempts Firestore write
│   ├── apply/
│   │   └── [programId]/page.tsx           ← public startup application
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── matching/
│   │   └── page.tsx
│   ├── program/
│   │   └── [cohortId]/page.tsx            ← cohort overview + AI report
│   ├── programs/
│   │   ├── [programId]/
│   │   │   ├── applicants/page.tsx        ← applicant review pool
│   │   │   └── page.tsx                   ← NEW: programme detail (read + edit + delete)
│   │   ├── new/page.tsx                   ← programme setup wizard
│   │   └── page.tsx                       ← NEW: programme list
│   ├── relationships/
│   │   ├── [id]/page.tsx                  ← relationship detail
│   │   └── page.tsx                       ← relationship list
│   ├── submit-meeting/
│   │   └── page.tsx                       ← public mentor meeting form
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                           ← redirects to /dashboard
├── components/
│   ├── features/
│   │   ├── applicant-review-pool.tsx      ← applicant list + detail panel + decisions
│   │   ├── cohort-overview.tsx            ← cohort stats, heatmap, AI report
│   │   ├── dashboard-command-center.tsx   ← redesigned AI ops dashboard
│   │   ├── matching-workbench.tsx         ← AI mentor matching UI
│   │   ├── meeting-submission-form.tsx    ← public meeting form (token-gated)
│   │   ├── product-shell.tsx              ← coordinator nav shell
│   │   ├── program-detail.tsx             ← NEW: programme detail + inline edit + delete
│   │   ├── program-list.tsx               ← NEW: programme index cards
│   │   ├── program-setup-wizard.tsx       ← programme creation wizard
│   │   ├── public-application-form.tsx    ← startup application form
│   │   ├── relationship-detail.tsx        ← detail + wired Log Meeting + Refresh Diagnosis
│   │   └── relationship-list.tsx          ← relationship list with health bands
│   └── ui/
│       ├── button.tsx
│       └── skeleton.tsx
├── lib/
│   ├── firebase.ts                        ← Firebase init, safeWrite, getFirebaseConfigStatus
│   ├── gemini.ts                          ← generic wrapper (unused — dead code)
│   ├── store.ts
│   ├── types.ts                           ← all domain types
│   ├── utils.ts
│   ├── verrier-analytics.ts               ← getDashboardSummary, getAttentionFeed, etc.
│   └── verrier-seed.ts                    ← all seed data (programs, cohorts, companies, mentors, relationships, meetings)
├── public/
└── scripts/
    ├── generate-dependency-graph.js
    └── generate-structure.js
```

---

## New Files Added (Post-Hackathon Polish)

| File | Purpose |
|---|---|
| `app/programs/page.tsx` | Programme list page |
| `app/programs/[programId]/page.tsx` | Programme detail page |
| `components/features/program-list.tsx` | Programme index component with CRUD actions |
| `components/features/program-detail.tsx` | Programme detail component with inline edit and delete |

## Key Changes to Existing Files

| File | Change |
|---|---|
| `components/features/product-shell.tsx` | Nav "Programmes" → `/programs`; removed "Demo coordinator" badge; cohort pill with pulse dot |
| `components/features/dashboard-command-center.tsx` | Full redesign: two-group stat bar, accent cards, health bars, AI badges, skeletons |
| `components/features/relationship-detail.tsx` | Log Meeting form wired to AI; Refresh Diagnosis button wired to AI |
| `components/features/applicant-review-pool.tsx` | "New Programme" button added to header |
| `components/features/program-setup-wizard.tsx` | Save Programme button implemented |

---

## Maintenance

- Run `npm run gen:structure` to regenerate from actual filesystem.
- Ignored: `node_modules`, `.git`, `.next`, `dist`, `build`.
