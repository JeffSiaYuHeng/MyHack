# System Data Flow and Stage Data Types

## Purpose

This document translates the Verrier PRD into a concrete data flow so the team can see:

- how data moves through the system,
- which collection is touched at each stage,
- which payload enters and leaves each stage,
- and which TypeScript/domain types are required.

Primary references:

- `DB_Module/Resource/prd.md`
- `DB_Module/_DOCS/00_SRS.md`
- `DB_Module/_DOCS/01_DB_SCHEMA.md`
- `DB_Module/_DOCS/03_SERVER_ACTIONS.md`
- `lib/types.ts`

---

## Type Conventions Used Across All Stages

| Type | Meaning |
|---|---|
| `string` | IDs, names, labels, free text, emails, URLs |
| `number` | scores, weights, counts, durations, milestone indexes |
| `boolean` | true/false state such as `isMatched`, `aiProcessed` |
| `string[]` | lists such as industries, needs, watch points, mentor IDs |
| `Record<string, string>` | key-value document map such as uploaded files |
| `TimestampLike` | any date/time field in app code; currently `string \| number \| Date \| { seconds; nanoseconds }` |
| `unknown` | older schema doc placeholder for Firestore timestamps; in implementation prefer `TimestampLike` |

Shared domain models:

- `Program`
- `Application`
- `Company`
- `Cohort`
- `Mentor`
- `Relationship`
- `Meeting`
- `ActionItem`
- `VerrierUser`

---

## End-to-End Flow Summary

```text
Admin creates Program
-> public application page opens
-> founder submits Company/Application data
-> Gemini returns fit analysis
-> Application saved to applicant pool
-> Admin reviews and decides
-> approved applicant becomes Company in Cohort
-> Gemini ranks Mentor matches
-> Admin confirms match
-> Relationship created
-> Mentor submits Meeting notes
-> Gemini analyzes meeting
-> Meeting saved + Relationship health updated
-> Dashboard and Cohort summary read aggregated data
```

---

## Stage 1. Programme Setup

**Actor:** Coordinator/Admin  
**UI/API:** `/programs/new` -> `POST /api/programs`  
**Writes:** `programs`  
**Reads:** `users`, optionally `mentors`

### Input data

```ts
{
  name: string;
  type: ProgramType;
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: SelectionCriteria;
  requiredDocuments: string[];
  applicationOpenAt: string;
  applicationCloseAt: string;
  startDate: string;
  endDate: string;
}
```

### Internal data type required

- `Program`
- `SelectionCriteria`
- `ProgramType`
- `ProgramStatus`
- `TimestampLike`

### Output data

```ts
{
  programId: string;
  applicationUrl: string;
}
```

### Stored record shape

- `Program.id: string`
- `Program.organizerId: string`
- `Program.status: "draft" | "open" | "reviewing" | "matching" | "active" | "completed"`
- `Program.mentorIds: string[]`
- `Program.selectedCompanyIds: string[]`

---

## Stage 2. Public Application Data Capture

**Actor:** Startup Founder  
**UI/API:** `/apply/[programId]` -> `POST /api/applications`  
**Writes:** `applications`, may create/update `companies` draft data  
**Reads:** `programs`

### Input data from founder

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

### Company sub-structure required in this stage

```ts
type PartialCompanyForApplication = {
  name?: string;
  stage?: StartupStage;
  industry?: string[];
  country?: string;
  city?: string;
  businessModel?: BusinessModel;
  needsHelp?: string[];
  founders?: Founder[];
  teamSize?: number;
  revenueMonthly?: number;
};
```

### Internal data type required

- `Company`
- `Founder`
- `StartupStage`
- `BusinessModel`
- `Application`

### Output data

```ts
{
  applicationId: string;
  status: "submitted";
  fitScore: number;
  fitLabel: string;
}
```

---

## Stage 3. AI Programme-Fit Scoring

**Actor:** System + Gemini  
**UI/API:** `POST /api/ai/program-fit`  
**Reads:** `programs`, in-memory application payload  
**Writes:** fit result back into `applications`

### Input data

```ts
{
  programId: string;
  companyProfile: Partial<Company>;
  founderSummary: string;
  supportNeeds: string[];
  submittedDocumentTypes: string[];
}
```

### AI output data

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

### Internal data type required

- `Application.fitScore: number`
- `Application.fitLabel`
- `Application.fitBreakdown`
- `Application.aiRecommendation`
- `Application.aiInsight`
- `Application.eligibilityFlags: string[]`

### Persistence result

The application becomes a full `Application` record with:

- identity data: `id`, `programId`, `companyId`
- founder/application data: `founderContactEmail`, `founderSummary`, `supportNeeds`, `documentUrls`
- AI result data: `fitScore`, `fitLabel`, `fitBreakdown`, `aiInsight`, `aiRecommendation`, `eligibilityFlags`
- lifecycle data: `status`, `submittedAt`, `createdAt`, `updatedAt`

---

## Stage 4. Applicant Pool Review and Decision

**Actor:** Coordinator/Admin  
**UI/API:** `/programs/[programId]/applicants` -> `PATCH /api/applications/[applicationId]/decision`  
**Reads:** `applications`, `programs`, `companies`  
**Writes:** `applications`, `companies`, `programs`

### Input decision payload

```ts
{
  status: "shortlisted" | "approved" | "declined" | "waitlisted";
  decisionReason?: string;
}
```

### Internal data type required

- `ApplicationStatus`
- `Application.reviewedBy?: string`
- `Application.reviewedAt?: TimestampLike`
- `Application.decisionReason?: string`
- `VerrierUser`

### Output data

```ts
{
  applicationId: string;
  status: string;
  companyId: string;
}
```

### Data movement by decision

| Decision | Data effect |
|---|---|
| `approved` | update `applications.status`; create/update `companies`; append company ID to `programs.selectedCompanyIds` |
| `shortlisted` | update `applications.status` only |
| `waitlisted` | update `applications.status` only |
| `declined` | update `applications.status` and optional `decisionReason` |

---

## Stage 5. Cohort Formation

**Actor:** Coordinator/Admin  
**UI/API:** internal admin flow after approvals  
**Reads:** `programs`, `applications`, `companies`, `mentors`  
**Writes:** `cohorts`, `companies`, `programs`

### Input data

- approved company IDs: `string[]`
- mentor pool IDs: `string[]`
- programme dates: `TimestampLike`
- cohort config: name, total weeks, status

### Internal data type required

```ts
interface Cohort {
  id: string;
  name: string;
  organizerName: string;
  organizerId: string;
  startDate: TimestampLike;
  endDate: TimestampLike;
  totalWeeks: number;
  status: "setup" | "matching" | "active" | "completed";
  companyIds: string[];
  mentorIds: string[];
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}
```

### Output data

- new `cohortId: string`
- updated `Company.cohortId`
- updated `Program.status`

---

## Stage 6. Mentor Matching Analysis

**Actor:** System + Gemini  
**UI/API:** `/matching` -> `POST /api/ai/match`  
**Reads:** `companies`, `programs`, `cohorts`, `mentors`  
**Writes:** no permanent write required for ranking response itself

### Input data

```ts
{
  startupId: string;
  programId: string;
  cohortId?: string;
}
```

### Candidate mentor data required

- `Mentor.id: string`
- `Mentor.expertise: string[]`
- `Mentor.industries: string[]`
- `Mentor.preferredStages: string[]`
- `Mentor.mentorshipStyle: "hands-on" | "advisory" | "mixed"`
- `Mentor.availabilityHoursPerMonth: number`
- `Mentor.availabilitySlots: AvailabilitySlot[]`
- `Mentor.geographies: string[]`
- `Mentor.languages: string[]`
- `Mentor.hasFounderExperience: boolean`
- `Mentor.hasInvestorExperience: boolean`

### Match output data

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

### Internal data type required

- `Mentor`
- `AvailabilitySlot`
- `MatchBreakdown`
- `Company`
- `Program`

---

## Stage 7. Match Confirmation and Relationship Creation

**Actor:** Coordinator/Admin  
**UI/API:** `POST /api/relationships/confirm-match`  
**Reads:** `companies`, `mentors`, `cohorts`, `programs`  
**Writes:** `relationships`, `companies`

### Input data

```ts
{
  startupId: string;
  mentorId: string;
  cohortId: string;
  matchScore: number;
  matchReason: string;
  matchBreakdown: MatchBreakdown;
}
```

### Internal data type required

- `Relationship`
- `RelationshipStatus`
- `MatchBreakdown`
- `HealthTrend`

### Output data

```ts
{
  relationshipId: string;
  status: "active";
  createdAt: string;
}
```

### Default relationship values created here

- `healthScore: number = 60`
- `healthTrend: "stable"`
- `meetingCount: number = 0`
- `lastMeetingAt: null`
- `watchPoints: string[] = []`
- `aiDiagnosis: string = ""`
- `currentMilestone: number`
- `milestonesCompleted: number[]`
- `milestoneCompletedAt: Record<number, TimestampLike>`

### Additional side effects

- set `Company.isMatched = true`
- optional status shift for `Program` or `Cohort` into `"active"`

---

## Stage 8. Mentor Meeting Submission

**Actor:** Mentor or Admin  
**UI/API:** `/submit-meeting` -> `POST /api/meetings/submit` or `POST /api/ai/analyze-meeting`  
**Reads:** `mentors`, `relationships`  
**Writes:** temporary request object, then `meetings`

### Public mentor submission input

```ts
{
  token: string;
  date: string;
  durationMinutes: number;
  rawNotes: string;
}
```

### Admin/internal meeting analysis input

```ts
{
  relationshipId: string;
  date: string;
  durationMinutes: number;
  rawNotes: string;
  submittedBy: "admin" | "mentor";
}
```

### Internal data type required

- `Meeting`
- `MeetingSignal`
- `ActionItem`
- `ActionItemOwner`

### Validation rules

- `token: string` must map to a mentor
- `relationshipId: string` must exist
- `rawNotes: string` minimum 50 characters
- `durationMinutes: number` should be positive integer

---

## Stage 9. AI Meeting Analysis and Health Update

**Actor:** System + Gemini  
**UI/API:** `POST /api/ai/analyze-meeting`  
**Reads:** `relationships`, submitted meeting payload  
**Writes:** `meetings`, `relationships`

### AI output data

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

### Stored `Meeting` data

- `id: string`
- `relationshipId: string`
- `cohortId: string`
- `companyId: string`
- `mentorId: string`
- `date: TimestampLike`
- `durationMinutes: number`
- `meetingNumber: number`
- `rawNotes: string`
- `submittedBy: "admin" | "mentor"`
- `submittedAt: TimestampLike`
- `aiSummary: string`
- `actionItems: ActionItem[]`
- `signal: "Positive" | "Neutral" | "Friction detected"`
- `signalReason: string`
- `healthScoreDelta: number`
- `watchPoints: string[]`
- `aiProcessed: boolean`
- `aiProcessedAt: TimestampLike | null`

### Relationship fields updated here

- `healthScore: number`
- `healthTrend: "improving" | "stable" | "deteriorating"`
- `lastMeetingAt: TimestampLike`
- `meetingCount: number`
- `daysSinceLastMeeting: number`
- `watchPoints: string[]`
- `updatedAt: TimestampLike`

---

## Stage 10. Relationship Diagnosis

**Actor:** System + Gemini  
**UI/API:** `POST /api/ai/diagnose`  
**Reads:** `relationships`, `meetings`, optionally `companies`, `mentors`  
**Writes:** `relationships.aiDiagnosis`, `relationships.watchPoints`

### Input data

```ts
{ relationshipId: string }
```

### Output data

```ts
{
  narrative: string;
  watchPoints: string[];
  recommendation: string;
  updatedAt: string;
}
```

### Internal data type required

- `Relationship.aiDiagnosis: string`
- `Relationship.watchPoints: string[]`

---

## Stage 11. Dashboard Attention Feed and Relationship Monitoring

**Actor:** Coordinator/Admin or Viewer  
**UI/API:** `/dashboard`, `GET /api/relationships`  
**Reads:** `relationships`, `meetings`, `applications`, `cohorts`  
**Writes:** none required for basic read path

### Input query

- `cohortId: string`
- `status?: "active" | "paused" | "completed"`
- `healthBand?: "healthy" | "at-risk" | "critical"`

### Output data

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

### Derived data types used in dashboard cards

- `number` for totals and averages
- `string` for AI reasons, company names, mentor names
- `HealthTrend`
- health band derived from `healthScore`

### Important computed fields

- Healthy: `healthScore >= 70`
- At Risk: `healthScore >= 40 && healthScore <= 69`
- Critical: `healthScore <= 39`
- Attention: critical score or stale meeting threshold

---

## Stage 12. Cohort Narrative Generation

**Actor:** Coordinator/Admin  
**UI/API:** `/program/[cohortId]` -> `POST /api/ai/cohort-summary`  
**Reads:** `cohorts`, `relationships`, `meetings`, `companies`, `applications`  
**Writes:** optional cached report data, if implemented later

### Input data

```ts
{ cohortId: string }
```

### Output data

```ts
{
  narrative: string;
  keyRisks: string[];
  recommendedActions: string[];
  generatedAt: string;
}
```

### Internal data type required

- `Cohort`
- `Relationship[]`
- `Meeting[]`
- `Company[]`
- `Application[]`

---

## Stage-by-Stage Collection Matrix

| Stage | Reads | Writes | Primary types |
|---|---|---|---|
| 1. Programme Setup | `users`, `mentors` | `programs` | `Program`, `SelectionCriteria`, `VerrierUser` |
| 2. Application Capture | `programs` | `applications`, draft `companies` | `Application`, `Company`, `Founder` |
| 3. Fit Scoring | `programs` | `applications` | `Application`, `Program`, `Company` |
| 4. Review Decision | `applications`, `programs`, `companies` | `applications`, `companies`, `programs` | `Application`, `Company` |
| 5. Cohort Formation | `programs`, `companies`, `mentors` | `cohorts`, `companies` | `Cohort`, `Company`, `Mentor` |
| 6. Mentor Matching | `companies`, `programs`, `cohorts`, `mentors` | none or transient cache | `Mentor`, `Company`, `MatchBreakdown` |
| 7. Confirm Match | `companies`, `mentors`, `cohorts` | `relationships`, `companies` | `Relationship`, `MatchBreakdown` |
| 8. Meeting Submission | `mentors`, `relationships` | request payload, then `meetings` | `Meeting`, `ActionItem` |
| 9. Meeting Analysis | `relationships` | `meetings`, `relationships` | `Meeting`, `Relationship`, `ActionItem` |
| 10. Diagnosis | `relationships`, `meetings` | `relationships` | `Relationship` |
| 11. Dashboard | `relationships`, `meetings`, `applications`, `cohorts` | none | `Relationship`, `Meeting`, `Application` |
| 12. Cohort Summary | `cohorts`, `relationships`, `meetings`, `companies`, `applications` | optional report cache | `Cohort`, `Relationship`, `Meeting` |

---

## Demo Backup Path (Resilience & Fallback)

This section documents the deterministic local fallback behavior established during Phase 5 Block B to ensure the demo remains operational when live API routes, Gemini, or Firestore are slow or unavailable.

### Fallback Implementation Pattern

| Flow | Trigger | Fallback Pattern |
|---|---|---|
| **Public Application** | Timeout (>10s) or Network Fail | Local `FitResult` with `status: "pending"`; allows local submission. |
| **Meeting Submission** | Timeout (>10s) or Network Fail | Local `AnalysisResult` with neutral signal and 0 delta; reaches confirmation. |
| **Mentor Matching** | Timeout (>10s) or Route Error | Local deterministic scoring (Industry + Stage + Availability); shows top 3. |
| **Cohort Summary** | Timeout (>10s) or Route Error | Local `CohortReport` generated from already-rendered metric state. |
| **Match Confirmation** | Firebase Unavailable | `persistenceMode: "local-fallback"`; returns relationship ID and proceeds. |
| **Route Guards** | Missing Seed Data | Branded empty-state shell via `ProductShell`; maintains navigation. |

### Deterministic Demo Sequence

1.  **Dashboard Command Center**:
    - *Live*: Reads aggregated seed data.
    - *Backup*: Missing seed guards render "Seed data unavailable" shell; navigation remains live.
2.  **Public Startup Application**:
    - *Live*: Calls `POST /api/ai/program-fit` for AI scoring.
    - *Backup*: 10s timeout triggers "AI scoring encountered a network issue" notice; enables manual confirmation.
3.  **Coordinator Matching**:
    - *Live*: Calls `POST /api/ai/match` for AI pairing.
    - *Backup*: Failure triggers "Fallback active" badge; ranks mentors using local industry/stage weights.
4.  **Mentor Meeting Submission**:
    - *Live*: Calls `POST /api/ai/analyze-meeting` for AI note extraction.
    - *Backup*: Failure triggers "Analysis pending" state; shows character count and success confirmation.
5.  **Cohort Narrative Report**:
    - *Live*: Calls `POST /api/ai/cohort-summary` for management narrative.
    - *Backup*: Failure triggers local report derived from visible metrics (average health, counts, distribution).

### Persistence & Data Baseline

- **Baseline**: `lib/verrier-seed.ts` is the stable operational baseline for all demo routes.
- **Match Confirmation**: Attempts `safeWrite` to Firestore. If configuration is missing or rules deny access, the route returns `persisted: false` and the UI proceeds with local confirmation state.
- **Report Export**: If `navigator.clipboard` is unavailable during report generation, the UI provides a textarea-based copy fallback.

---

## Minimum Required Data Types by Layer

### Frontend form layer

- `string`
- `number`
- `boolean`
- `string[]`
- `Record<string, string>`

### API contract layer

- request DTOs for each route
- response DTOs for each route
- typed enums for statuses and labels

### Domain layer

- `Program`
- `Application`
- `Company`
- `Founder`
- `Mentor`
- `AvailabilitySlot`
- `Cohort`
- `Relationship`
- `Meeting`
- `ActionItem`
- `VerrierUser`

### Persistence layer

- Firestore document IDs as `string`
- date fields as `TimestampLike`
- arrays for relations such as `mentorIds`, `companyIds`, `watchPoints`

### AI result layer

- numeric scores
- label enums
- explanation strings
- structured breakdown objects
- list outputs such as `eligibilityFlags`, `watchPoints`, `actionItems`

---

## Recommended Next Implementation Use

This flow should be used as the source of truth when:

- creating request/response DTOs,
- expanding `lib/types.ts`,
- designing Firestore document validators,
- and defining server route payload schemas.

If the team wants, this document can be converted next into:

1. Zod schemas for every API route.
2. A sequence diagram.
3. A Firestore relationship map by collection and foreign key.
