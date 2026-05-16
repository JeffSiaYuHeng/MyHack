# Server Actions and API Contracts

**Last Updated:** 2026-05-17 (interaction polish session)

---

## Route Boundary Reference

### Public routes (no auth required)

| Route | Status |
|---|---|
| `/` | Live — redirects to `/dashboard` |
| `/login` | Live — demo placeholder; no real Firebase Auth |
| `/apply/[programId]` | Live — public application intake with AI fit scoring |
| `/submit-meeting` | Live — public meeting submission (token-gated) |

### Coordinator routes (auth-gated in production, open for demo)

| Route | Status |
|---|---|
| `/dashboard` | Live — redesigned AI ops dashboard |
| `/programs` | **Live** — programme list with CRUD |
| `/programs/[programId]` | **Live** — programme detail with inline edit and delete |
| `/programs/new` | Live — programme setup wizard with Save button |
| `/programs/[programId]/applicants` | Live — applicant review pool |
| `/matching` | Live — AI mentor matching workbench |
| `/relationships` | Live — relationship list |
| `/relationships/[id]` | Live — relationship detail with wired Log Meeting and Refresh Diagnosis |
| `/program/[cohortId]` | Live — cohort overview with AI report generation |

---

## Implemented AI API Routes

All five AI routes are fully implemented and wired to UI triggers.

### `POST /api/ai/program-fit`

**Trigger:** "Get fit score & submit" button on `/apply/[programId]`  
**Model:** `gemini-3-flash-preview`

Request:
```ts
{
  programId: string;
  companyProfile: Partial<Company>;
  founderSummary: string;
  supportNeeds: string[];
  submittedDocumentTypes: string[];
}
```

Response:
```ts
{
  fitScore: number;
  fitLabel: "Strong fit" | "Potential fit" | "Low fit";
  aiRecommendation: "approve" | "review" | "decline";
  aiInsight: string;
  breakdown: {
    stageFit: number;
    industryFit: number;
    tractionFit: number;
    teamFit: number;
    needsFit: number;
  };
  eligibilityFlags: string[];
  status: "scored" | "pending";
}
```

Fallback: `status: "pending"` with zeroed scores when Gemini is unavailable. Public form allows submission in pending state.

---

### `POST /api/ai/match`

**Trigger:** "Generate AI matches" button on `/matching` after a startup is selected  
**Model:** `gemini-3-flash-preview`

Request:
```ts
{
  startupId: string;
  programId: string;
  cohortId?: string;
}
```

Response:
```ts
{
  matches: Array<{
    mentorId: string;
    mentorName: string;
    overallScore: number;
    reason: string;
    breakdown: {
      industryMatch: number;
      stageFit: number;
      availability: number;
      styleCompatibility: number;
    };
  }>;
}
```

Fallback: deterministic scoring (industry overlap × 0.35 + stage fit × 0.30 + availability × 0.20 + style × 0.15).

UI behavior: selecting a startup resets previous AI output but does not call the API. `handleGenerateMatches()` starts the request, shows a toast loading state, renders the animated matching visualization, then replaces the right panel with ranked cards. Success and error outcomes are surfaced through the global toast system.

---

### `POST /api/ai/analyze-meeting`

**Triggers:**
1. "Submit meeting notes" button on `/submit-meeting` (public mentor form)
2. "✦ Submit & Analyze" button in the inline Log Meeting form on `/relationships/[id]`

**Model:** `gemini-2.0-flash`

Request:
```ts
{
  relationshipId: string;
  date: string;           // ISO date string
  durationMinutes: number;
  rawNotes: string;       // minimum 50 characters
  submittedBy: "admin" | "mentor";
}
```

Response:
```ts
{
  meetingId: string;
  aiSummary: string;
  actionItems: Array<{
    task: string;
    owner: "mentor" | "startup";
    dueDate: string | null;
    completed: boolean;
    completedAt: string | null;
  }>;
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;   // clamped -15 to +15
  newHealthScore: number;     // clamped 0 to 100
  watchPoints: string[];
}
```

Fallback: neutral signal, 0 delta, empty action items. Both callers handle timeout and network errors gracefully.

---

### `POST /api/ai/diagnose`

**Trigger:** "Refresh Diagnosis" button on `/relationships/[id]`  
**Model:** `gemini-3-flash-preview`

Request:
```ts
{ relationshipId: string }
```

Response:
```ts
{
  narrative: string;
  watchPoints: string[];
  recommendation: string;
  updatedAt: string;
}
```

Fallback: deterministic narrative based on health score, trend, staleness, and friction signals. On error, the UI keeps existing seed data and shows toast feedback.

UI behavior: diagnosis state is seeded from `relationship.aiDiagnosis` and `relationship.watchPoints` on mount. Refreshing replaces with live Gemini output. `recommendation` is blank on initial load (not in seed data) and populated after first refresh.

---

### `POST /api/ai/cohort-summary`

**Trigger:** "Generate Report" button on `/program/[cohortId]`  
**Model:** `gemini-3-flash-preview`

Request:
```ts
{ cohortId: string }
```

Response:
```ts
{
  narrative: string;
  keyRisks: string[];
  recommendedActions: string[];
  generatedAt: string;
}
```

Fallback: deterministic local report computed from cohort metrics already rendered on screen. The UI shows toast feedback and a fallback indicator when the local report is used. "Copy report" button available after generation.

---

## Other API Routes

### `POST /api/relationships/confirm-match`

Creates a Relationship entity and attempts Firestore persistence.

Request:
```ts
{
  startupId: string;
  mentorId: string;
  programId: string;
  cohortId: string;
  matchScore: number;
  matchReason: string;
  matchBreakdown: Relationship["matchBreakdown"];
}
```

Response:
```ts
{
  relationshipId: string;
  status: "active";
  createdAt: string;
  persisted: boolean;
  persistenceMode: "firestore" | "local-fallback";
}
```

Initial values: `healthScore: 60`, `healthTrend: "stable"`, `meetingCount: 0`.

---

## Planned but Not Yet Implemented

These routes are documented in the PRD and data flow but have no route handler yet:

| Route | Purpose |
|---|---|
| `POST /api/programs` | Persist programme creation from wizard |
| `PATCH /api/programs/[id]` | Persist programme edits from detail page |
| `DELETE /api/programs/[id]` | Persist programme deletion |
| `POST /api/applications` | Persist submitted application to Firestore |
| `PATCH /api/applications/[id]/decision` | Persist coordinator decision to Firestore |
| `GET /api/relationships` | List relationships with summary counts |

All of the above currently operate on local state only. Firestore persistence requires wiring `safeWrite` into each route.

---

## Dead Code

- `app/api/ai/route.ts` — scaffold-level `POST /api/ai` accepting `{ prompt: string }`. Not called by any UI component. Safe to remove.
- `lib/gemini.ts` — exports `analyzeWithGemini()` and `generateContent()`. Never imported by any route. All AI routes instantiate `GoogleGenerativeAI` directly inline. Safe to remove or repurpose.

---

## Gemini Model Reference

| Route | Model |
|---|---|
| `analyze-meeting` | `gemini-2.0-flash` |
| `program-fit` | `gemini-3-flash-preview` |
| `match` | `gemini-3-flash-preview` |
| `diagnose` | `gemini-3-flash-preview` |
| `cohort-summary` | `gemini-3-flash-preview` |

All calls use `responseMimeType: "application/json"` in `generationConfig`. All routes validate and sanitize AI output before returning. All routes have deterministic fallbacks.

---

## Malaysia Context Guardrail

All prompts include the instruction: *"Evaluate only on professional and business criteria — do not assess on race, religion, or royalty."* This applies to programme fit, mentor matching, meeting analysis, diagnosis, and cohort summary.
