# Server Actions and API Contracts

## Current Backend Surface

Implemented today:

- `POST /api/ai`
- `lib/gemini.ts`
- `lib/firebase.ts`

Target Verrier backend surface is route-handler based under `app/api/`. Server actions may be added later for authenticated form mutations, but the initial plan should favor API routes because the PRD defines public routes for applications and meeting submission.

## Existing Contract: `POST /api/ai`

Source: `app/api/ai/route.ts`

Request:

```ts
{ prompt: string }
```

Success:

```ts
{ text: string }
```

This route is scaffold-level and should not be the final Verrier AI surface.

## Gemini Helper Target

All structured Verrier calls should converge on a helper shaped like:

```ts
async function callGeminiJson<T>(options: {
  systemPrompt: string;
  userContent: unknown;
  schemaName: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<T>
```

Rules:

- Read `GEMINI_API_KEY` only on the server.
- Use JSON response mode.
- Validate and sanitize AI output before writing to Firestore.
- Retry malformed JSON once.
- Preserve a fallback state when Gemini fails.

Current model in code is `gemini-3-flash-preview`. The PRD references `gemini-1.5-flash`. Keep implementation aligned with the installed SDK and actual working model, and update this doc if the model changes.

## Target API Routes

### `POST /api/programs`

Creates a programme and returns the public application URL.

Request:

```ts
{
  name: string;
  type: Program["type"];
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: Program["selectionCriteria"];
  requiredDocuments: string[];
  applicationOpenAt: string;
  applicationCloseAt: string;
  startDate: string;
  endDate: string;
}
```

Response:

```ts
{
  programId: string;
  applicationUrl: string;
}
```

### `POST /api/ai/program-fit`

Scores a startup application against programme criteria.

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
}
```

### `POST /api/applications`

Submits a startup application into the applicant pool.

Request:

```ts
{
  programId: string;
  companyProfile: Partial<Company>;
  founderContactEmail: string;
  founderSummary: string;
  supportNeeds: string[];
  documentUrls: Record<string, string>;
}
```

Response:

```ts
{
  applicationId: string;
  status: "submitted";
  fitScore: number;
  fitLabel: string;
}
```

### `PATCH /api/applications/[applicationId]/decision`

Coordinator decision route.

Request:

```ts
{
  status: "shortlisted" | "approved" | "declined" | "waitlisted";
  decisionReason?: string;
}
```

Response:

```ts
{
  applicationId: string;
  status: string;
  companyId: string;
}
```

Approving should create or update a `companies` document and add the company to the selected list.

### `POST /api/ai/match`

Generates top mentor matches.

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

Validate all returned mentor IDs against the input candidate list.

### `POST /api/relationships/confirm-match`

Creates a first-class `relationships` document.

Request:

```ts
{
  startupId: string;
  mentorId: string;
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
}
```

Initial `healthScore` is `60`, `healthTrend` is `stable`, and `meetingCount` is `0`.

### `GET /api/relationships`

Lists relationship records with summary counts.

Query:

- `cohortId` required.
- `status` optional.
- `healthBand` optional: `healthy`, `at-risk`, `critical`.

Response:

```ts
{
  relationships: Relationship[];
  summary: {
    total: number;
    healthy: number;
    atRisk: number;
    critical: number;
    avgHealthScore: number;
  };
}
```

### `POST /api/ai/analyze-meeting`

Processes meeting notes and updates relationship health.

Request:

```ts
{
  relationshipId: string;
  date: string;
  durationMinutes: number;
  rawNotes: string;
  submittedBy: "admin" | "mentor";
}
```

Response:

```ts
{
  meetingId: string;
  aiSummary: string;
  actionItems: ActionItem[];
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;
  newHealthScore: number;
  watchPoints: string[];
}
```

Validation:

- `rawNotes` minimum 50 characters.
- Relationship must exist.
- Duplicate same-date relationship submissions should warn or return a recoverable state.

### `POST /api/ai/diagnose`

Generates or refreshes relationship diagnosis.

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

### `POST /api/ai/cohort-summary`

Generates a management-ready cohort narrative.

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

### Public Meeting Submission

The PRD names `POST /submit-meeting`, but in Next.js App Router this should be implemented as a page at `/submit-meeting` plus an API route such as:

- `POST /api/meetings/submit`

Request:

```ts
{
  token: string;
  date: string;
  durationMinutes: number;
  rawNotes: string;
}
```

Response:

```ts
{
  success: boolean;
  aiSummary: string;
  actionItems: ActionItem[];
}
```

## Prompt Inventory

Prompt templates must be stored in a reusable server-only module during implementation:

- Programme fit scoring.
- Mentor matching.
- Meeting analysis.
- Relationship diagnosis.
- Cohort narrative.

Malaysia context guardrail: prompts must avoid Race, Religion, and Royalty categories and judge professional/business fit only.

## Auth Expectations

Early demo blocks may operate against seed data and lightweight local helpers. Before final demo:

- Admin API routes validate Firebase ID token.
- Public application route validates programme status and application window.
- Public meeting route validates mentor token.
- Firestore rules match documented collection behavior.
