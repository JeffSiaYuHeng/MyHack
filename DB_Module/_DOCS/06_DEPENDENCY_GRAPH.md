# Dependency Graph

**Last Updated:** 2026-05-17 (post-hackathon polish session — manually updated)

---

## Statistics

- **Total Feature Components**: 12
- **Total API Routes**: 7
- **Total Pages**: 13

---

## High-Impact Files

Files imported by many others. Modifying them requires careful impact analysis.

| File | Imported By | Impact |
|---|---|---|
| `lib/verrier-seed.ts` | 12 files | HIGH |
| `lib/types.ts` | 10 files | HIGH |
| `components/features/product-shell.tsx` | 10 pages | HIGH |
| `lib/verrier-analytics.ts` | 4 files | MEDIUM |
| `lib/utils.ts` | 2 UI components | LOW |
| `lib/firebase.ts` | 1 API route | LOW |

---

## Full Dependency Map

```json
{
  "app/api/ai/analyze-meeting/route.ts": [
    "lib/verrier-seed.ts",
    "lib/types.ts"
  ],
  "app/api/ai/cohort-summary/route.ts": [
    "lib/verrier-seed.ts"
  ],
  "app/api/ai/diagnose/route.ts": [
    "lib/verrier-seed.ts"
  ],
  "app/api/ai/match/route.ts": [
    "lib/types.ts",
    "lib/verrier-analytics.ts"
  ],
  "app/api/ai/program-fit/route.ts": [],
  "app/api/relationships/confirm-match/route.ts": [
    "lib/types.ts",
    "lib/firebase.ts"
  ],
  "app/apply/[programId]/page.tsx": [
    "lib/verrier-seed.ts",
    "components/features/public-application-form.tsx"
  ],
  "app/dashboard/page.tsx": [
    "components/features/dashboard-command-center.tsx",
    "components/features/product-shell.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/matching/page.tsx": [
    "lib/verrier-seed.ts",
    "components/features/product-shell.tsx",
    "components/features/matching-workbench.tsx"
  ],
  "app/page.tsx": [
    "components/features/product-shell.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/program/[cohortId]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/cohort-overview.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/programs/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/program-list.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/programs/[programId]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/program-detail.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/programs/[programId]/applicants/page.tsx": [
    "lib/verrier-seed.ts",
    "components/features/product-shell.tsx",
    "components/features/applicant-review-pool.tsx"
  ],
  "app/programs/new/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/program-setup-wizard.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/relationships/[id]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/relationship-detail.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/relationships/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/relationship-list.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/submit-meeting/page.tsx": [
    "components/features/meeting-submission-form.tsx"
  ],
  "components/features/applicant-review-pool.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/cohort-overview.tsx": [
    "lib/types.ts",
    "lib/verrier-analytics.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/dashboard-command-center.tsx": [
    "lib/verrier-analytics.ts"
  ],
  "components/features/matching-workbench.tsx": [
    "lib/types.ts",
    "lib/verrier-analytics.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/meeting-submission-form.tsx": [
    "lib/verrier-seed.ts",
    "lib/types.ts"
  ],
  "components/features/product-shell.tsx": [],
  "components/features/program-detail.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/program-list.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/program-setup-wizard.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/public-application-form.tsx": [
    "lib/types.ts"
  ],
  "components/features/relationship-detail.tsx": [
    "lib/types.ts",
    "lib/verrier-analytics.ts"
  ],
  "components/features/relationship-list.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/ui/button.tsx": [
    "lib/utils.ts"
  ],
  "components/ui/skeleton.tsx": [
    "lib/utils.ts"
  ],
  "lib/store.ts": [
    "lib/types.ts"
  ]
}
```

---

## Reverse Dependency Map

```json
{
  "lib/verrier-seed.ts": [
    "app/api/ai/analyze-meeting/route.ts",
    "app/api/ai/cohort-summary/route.ts",
    "app/api/ai/diagnose/route.ts",
    "app/apply/[programId]/page.tsx",
    "app/dashboard/page.tsx",
    "app/matching/page.tsx",
    "app/program/[cohortId]/page.tsx",
    "app/programs/page.tsx",
    "app/programs/[programId]/page.tsx",
    "app/programs/[programId]/applicants/page.tsx",
    "app/programs/new/page.tsx",
    "app/relationships/[id]/page.tsx",
    "app/relationships/page.tsx",
    "components/features/applicant-review-pool.tsx",
    "components/features/cohort-overview.tsx",
    "components/features/matching-workbench.tsx",
    "components/features/meeting-submission-form.tsx",
    "components/features/program-detail.tsx",
    "components/features/program-list.tsx",
    "components/features/program-setup-wizard.tsx",
    "components/features/relationship-list.tsx"
  ],
  "lib/types.ts": [
    "app/api/ai/analyze-meeting/route.ts",
    "app/api/ai/match/route.ts",
    "app/api/relationships/confirm-match/route.ts",
    "components/features/applicant-review-pool.tsx",
    "components/features/cohort-overview.tsx",
    "components/features/matching-workbench.tsx",
    "components/features/meeting-submission-form.tsx",
    "components/features/program-detail.tsx",
    "components/features/program-list.tsx",
    "components/features/program-setup-wizard.tsx",
    "components/features/public-application-form.tsx",
    "components/features/relationship-detail.tsx",
    "components/features/relationship-list.tsx",
    "lib/store.ts"
  ],
  "lib/verrier-analytics.ts": [
    "app/api/ai/match/route.ts",
    "components/features/cohort-overview.tsx",
    "components/features/dashboard-command-center.tsx",
    "components/features/matching-workbench.tsx",
    "components/features/relationship-detail.tsx"
  ],
  "lib/firebase.ts": [
    "app/api/relationships/confirm-match/route.ts"
  ],
  "lib/utils.ts": [
    "components/ui/button.tsx",
    "components/ui/skeleton.tsx"
  ],
  "components/features/product-shell.tsx": [
    "app/dashboard/page.tsx",
    "app/matching/page.tsx",
    "app/page.tsx",
    "app/program/[cohortId]/page.tsx",
    "app/programs/page.tsx",
    "app/programs/[programId]/page.tsx",
    "app/programs/[programId]/applicants/page.tsx",
    "app/programs/new/page.tsx",
    "app/relationships/[id]/page.tsx",
    "app/relationships/page.tsx"
  ]
}
```

---

## Maintenance

- Run `npm run gen:graph` to regenerate from actual imports.
- Directories analyzed: `app`, `components`, `lib`.
- File types: `.ts`, `.tsx`.
