# Dependency Graph

**AUTO-GENERATED** by `scripts/generate-dependency-graph.js`
**DO NOT EDIT MANUALLY** - Regenerate with: `npm run gen:graph`
**Last Updated:** 05/17/2026, 02:05

---

## Purpose

This file maps import/export relationships across the codebase.
**Critical for Planner**: Before modifying a file, check if it's imported by others.
If a file has many importers, changes may require updating Reference Scope or Context Scope.

---

## Statistics

- **Total Files Analyzed**: 39
- **Total Dependencies**: 86
- **Average Dependencies per File**: 2.2

---

## High-Impact Files (Top 20)

These files are imported by many others. Modifying them requires careful impact analysis.


### `lib/verrier-seed.ts`
- **Impact Level**: HIGH
- **Imported By**: 21 file(s)
- **Key Importers**:
  - `app/api/ai/analyze-meeting/route.ts`
  - `app/apply/[programId]/page.tsx`
  - `app/dashboard/page.tsx`
  - `app/matching/page.tsx`
  - `app/mentors/[mentorId]/page.tsx`
  - *...and 16 more*


### `lib/types.ts`
- **Impact Level**: HIGH
- **Imported By**: 15 file(s)
- **Key Importers**:
  - `app/api/ai/analyze-meeting/route.ts`
  - `app/api/ai/match/route.ts`
  - `app/api/relationships/confirm-match/route.ts`
  - `components/features/applicant-review-pool.tsx`
  - `components/features/meeting-submission-form.tsx`
  - *...and 10 more*


### `components/features/product-shell.tsx`
- **Impact Level**: HIGH
- **Imported By**: 14 file(s)
- **Key Importers**:
  - `app/dashboard/page.tsx`
  - `app/matching/page.tsx`
  - `app/mentors/[mentorId]/page.tsx`
  - `app/mentors/page.tsx`
  - `app/page.tsx`
  - *...and 9 more*


### `components/ui/skeleton.tsx`
- **Impact Level**: HIGH
- **Imported By**: 6 file(s)
- **Key Importers**:
  - `components/features/applicant-review-pool.tsx`
  - `components/features/dashboard-command-center.tsx`
  - `components/features/matching-workbench.tsx`
  - `components/features/program-list.tsx`
  - `components/features/relationship-detail.tsx`
  - *...and 1 more*


### `lib/utils.ts`
- **Impact Level**: HIGH
- **Imported By**: 5 file(s)
- **Key Importers**:
  - `components/ui/ai-operation-loader.tsx`
  - `components/ui/button.tsx`
  - `components/ui/confirm-dialog.tsx`
  - `components/ui/skeleton.tsx`
  - `components/ui/state-block.tsx`



### `lib/verrier-analytics.ts`
- **Impact Level**: HIGH
- **Imported By**: 3 file(s)
- **Key Importers**:
  - `app/api/ai/match/route.ts`
  - `components/features/dashboard-command-center.tsx`
  - `components/features/relationship-detail.tsx`



### `components/ui/confirm-dialog.tsx`
- **Impact Level**: HIGH
- **Imported By**: 3 file(s)
- **Key Importers**:
  - `components/features/applicant-review-pool.tsx`
  - `components/features/matching-workbench.tsx`
  - `components/features/public-application-form.tsx`



### `components/features/dashboard-command-center.tsx`
- **Impact Level**: HIGH
- **Imported By**: 2 file(s)
- **Key Importers**:
  - `app/dashboard/page.tsx`
  - `app/page.tsx`



### `components/ui/ai-operation-loader.tsx`
- **Impact Level**: HIGH
- **Imported By**: 2 file(s)
- **Key Importers**:
  - `components/features/meeting-submission-form.tsx`
  - `components/features/public-application-form.tsx`



### `lib/firebase.ts`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/api/relationships/confirm-match/route.ts`



### `components/features/public-application-form.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/apply/[programId]/page.tsx`



### `components/features/matching-workbench.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/matching/page.tsx`



### `components/features/mentor-detail.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/mentors/[mentorId]/page.tsx`



### `components/features/mentor-list.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/mentors/page.tsx`



### `components/features/cohort-overview.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/program/[cohortId]/page.tsx`



### `components/features/applicant-review-pool.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/programs/[programId]/applicants/page.tsx`



### `components/features/program-detail.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/programs/[programId]/page.tsx`



### `components/features/program-setup-wizard.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/programs/new/page.tsx`



### `components/features/program-list.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/programs/page.tsx`



### `components/features/relationship-detail.tsx`
- **Impact Level**: HIGH
- **Imported By**: 1 file(s)
- **Key Importers**:
  - `app/relationships/[id]/page.tsx`



---

## Full Dependency Map

<details>
<summary>Click to expand complete dependency graph (JSON format)</summary>

```json
{
  "app/api/ai/analyze-meeting/route.ts": [
    "lib/verrier-seed.ts",
    "lib/types.ts"
  ],
  "app/api/ai/match/route.ts": [
    "lib/types.ts",
    "lib/verrier-analytics.ts"
  ],
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
  "app/mentors/[mentorId]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/mentor-detail.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/mentors/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/mentor-list.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/page.tsx": [
    "components/features/dashboard-command-center.tsx",
    "components/features/product-shell.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/program/[cohortId]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/cohort-overview.tsx"
  ],
  "app/programs/[programId]/applicants/page.tsx": [
    "lib/verrier-seed.ts",
    "components/features/product-shell.tsx",
    "components/features/applicant-review-pool.tsx"
  ],
  "app/programs/[programId]/page.tsx": [
    "lib/verrier-seed.ts",
    "components/features/product-shell.tsx",
    "components/features/program-detail.tsx"
  ],
  "app/programs/new/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/program-setup-wizard.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/programs/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/program-list.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/relationships/[id]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/relationship-detail.tsx"
  ],
  "app/relationships/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/relationship-list.tsx"
  ],
  "app/startups/[companyId]/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/startup-detail.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/startups/page.tsx": [
    "components/features/product-shell.tsx",
    "components/features/startup-list.tsx",
    "lib/verrier-seed.ts"
  ],
  "app/submit-meeting/page.tsx": [
    "components/features/meeting-submission-form.tsx"
  ],
  "components/features/applicant-review-pool.tsx": [
    "components/ui/confirm-dialog.tsx",
    "components/ui/skeleton.tsx",
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/dashboard-command-center.tsx": [
    "lib/verrier-analytics.ts",
    "components/ui/skeleton.tsx"
  ],
  "components/features/matching-workbench.tsx": [
    "components/ui/confirm-dialog.tsx",
    "components/ui/skeleton.tsx"
  ],
  "components/features/meeting-submission-form.tsx": [
    "components/ui/ai-operation-loader.tsx",
    "lib/verrier-seed.ts",
    "lib/types.ts"
  ],
  "components/features/mentor-detail.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/mentor-list.tsx": [
    "lib/types.ts"
  ],
  "components/features/program-detail.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/program-list.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts",
    "components/ui/skeleton.tsx"
  ],
  "components/features/program-setup-wizard.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/public-application-form.tsx": [
    "components/ui/ai-operation-loader.tsx",
    "components/ui/confirm-dialog.tsx",
    "lib/types.ts"
  ],
  "components/features/relationship-detail.tsx": [
    "components/ui/skeleton.tsx",
    "lib/verrier-analytics.ts"
  ],
  "components/features/relationship-list.tsx": [
    "lib/types.ts",
    "components/ui/skeleton.tsx"
  ],
  "components/features/startup-detail.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/features/startup-list.tsx": [
    "lib/types.ts",
    "lib/verrier-seed.ts"
  ],
  "components/ui/ai-operation-loader.tsx": [
    "lib/utils.ts"
  ],
  "components/ui/button.tsx": [
    "lib/utils.ts"
  ],
  "components/ui/confirm-dialog.tsx": [
    "lib/utils.ts"
  ],
  "components/ui/skeleton.tsx": [
    "lib/utils.ts"
  ],
  "components/ui/state-block.tsx": [
    "lib/utils.ts"
  ],
  "lib/store.ts": [
    "lib/types.ts"
  ]
}
```

</details>

---

## Reverse Dependency Map

<details>
<summary>Click to expand reverse dependencies (which files import what)</summary>

```json
{
  "lib/verrier-seed.ts": [
    "app/api/ai/analyze-meeting/route.ts",
    "app/apply/[programId]/page.tsx",
    "app/dashboard/page.tsx",
    "app/matching/page.tsx",
    "app/mentors/[mentorId]/page.tsx",
    "app/mentors/page.tsx",
    "app/page.tsx",
    "app/programs/[programId]/applicants/page.tsx",
    "app/programs/[programId]/page.tsx",
    "app/programs/new/page.tsx",
    "app/programs/page.tsx",
    "app/startups/[companyId]/page.tsx",
    "app/startups/page.tsx",
    "components/features/applicant-review-pool.tsx",
    "components/features/meeting-submission-form.tsx",
    "components/features/mentor-detail.tsx",
    "components/features/program-detail.tsx",
    "components/features/program-list.tsx",
    "components/features/program-setup-wizard.tsx",
    "components/features/startup-detail.tsx",
    "components/features/startup-list.tsx"
  ],
  "lib/types.ts": [
    "app/api/ai/analyze-meeting/route.ts",
    "app/api/ai/match/route.ts",
    "app/api/relationships/confirm-match/route.ts",
    "components/features/applicant-review-pool.tsx",
    "components/features/meeting-submission-form.tsx",
    "components/features/mentor-detail.tsx",
    "components/features/mentor-list.tsx",
    "components/features/program-detail.tsx",
    "components/features/program-list.tsx",
    "components/features/program-setup-wizard.tsx",
    "components/features/public-application-form.tsx",
    "components/features/relationship-list.tsx",
    "components/features/startup-detail.tsx",
    "components/features/startup-list.tsx",
    "lib/store.ts"
  ],
  "lib/verrier-analytics.ts": [
    "app/api/ai/match/route.ts",
    "components/features/dashboard-command-center.tsx",
    "components/features/relationship-detail.tsx"
  ],
  "lib/firebase.ts": [
    "app/api/relationships/confirm-match/route.ts"
  ],
  "components/features/public-application-form.tsx": [
    "app/apply/[programId]/page.tsx"
  ],
  "components/features/dashboard-command-center.tsx": [
    "app/dashboard/page.tsx",
    "app/page.tsx"
  ],
  "components/features/product-shell.tsx": [
    "app/dashboard/page.tsx",
    "app/matching/page.tsx",
    "app/mentors/[mentorId]/page.tsx",
    "app/mentors/page.tsx",
    "app/page.tsx",
    "app/program/[cohortId]/page.tsx",
    "app/programs/[programId]/applicants/page.tsx",
    "app/programs/[programId]/page.tsx",
    "app/programs/new/page.tsx",
    "app/programs/page.tsx",
    "app/relationships/[id]/page.tsx",
    "app/relationships/page.tsx",
    "app/startups/[companyId]/page.tsx",
    "app/startups/page.tsx"
  ],
  "components/features/matching-workbench.tsx": [
    "app/matching/page.tsx"
  ],
  "components/features/mentor-detail.tsx": [
    "app/mentors/[mentorId]/page.tsx"
  ],
  "components/features/mentor-list.tsx": [
    "app/mentors/page.tsx"
  ],
  "components/features/cohort-overview.tsx": [
    "app/program/[cohortId]/page.tsx"
  ],
  "components/features/applicant-review-pool.tsx": [
    "app/programs/[programId]/applicants/page.tsx"
  ],
  "components/features/program-detail.tsx": [
    "app/programs/[programId]/page.tsx"
  ],
  "components/features/program-setup-wizard.tsx": [
    "app/programs/new/page.tsx"
  ],
  "components/features/program-list.tsx": [
    "app/programs/page.tsx"
  ],
  "components/features/relationship-detail.tsx": [
    "app/relationships/[id]/page.tsx"
  ],
  "components/features/relationship-list.tsx": [
    "app/relationships/page.tsx"
  ],
  "components/features/startup-detail.tsx": [
    "app/startups/[companyId]/page.tsx"
  ],
  "components/features/startup-list.tsx": [
    "app/startups/page.tsx"
  ],
  "components/features/meeting-submission-form.tsx": [
    "app/submit-meeting/page.tsx"
  ],
  "components/ui/confirm-dialog.tsx": [
    "components/features/applicant-review-pool.tsx",
    "components/features/matching-workbench.tsx",
    "components/features/public-application-form.tsx"
  ],
  "components/ui/skeleton.tsx": [
    "components/features/applicant-review-pool.tsx",
    "components/features/dashboard-command-center.tsx",
    "components/features/matching-workbench.tsx",
    "components/features/program-list.tsx",
    "components/features/relationship-detail.tsx",
    "components/features/relationship-list.tsx"
  ],
  "components/ui/ai-operation-loader.tsx": [
    "components/features/meeting-submission-form.tsx",
    "components/features/public-application-form.tsx"
  ],
  "lib/utils.ts": [
    "components/ui/ai-operation-loader.tsx",
    "components/ui/button.tsx",
    "components/ui/confirm-dialog.tsx",
    "components/ui/skeleton.tsx",
    "components/ui/state-block.tsx"
  ]
}
```

</details>

---

## How Planner Should Use This

### Before Creating Context Scope:

1. **Read this file** to understand the file's position in the dependency tree
2. **Check "High-Impact Files"** section first
3. **If modifying a high-impact file**:
   - Add key importers to **Reference Scope** (read-only)
   - OR add to **Context Scope** if they also need changes
   - Document potential side-effects in instruction

### Example Decision Flow:

```
Task: Modify lib/utils/validation.ts

Step 1: Check 06_DEPENDENCY_GRAPH.md
Step 2: Find validation.ts is imported by 12 files
Step 3: Identify top 3 importers:
  - app/auth/login/page.tsx
  - components/forms/UserForm.tsx
  - lib/actions/user-actions.ts

Step 4: Add to _INSTRUCTION.md:
  Context Scope:
    - lib/utils/validation.ts

  Reference Scope:
    - app/auth/login/page.tsx (uses validateEmail)
    - components/forms/UserForm.tsx (uses validatePassword)
```

---

## Maintenance

- **Update**: Run `npm run gen:graph` before planning sessions
- **Tool**: Uses madge (install: `npm install -g madge`) or built-in analyzer
- **Directories Analyzed**: app, components, lib, utils, hooks, context
- **File Types**: .ts, .tsx, .js, .jsx

---

## Integration with Evaluator

The Evaluator should verify:
- If a Context Scope file is high-impact, did the Coder test affected importers?
- Are breaking changes properly documented in 03_SERVER_ACTIONS.md?
