# Data Schema and Persistence

## Persistence Layer

Verrier uses Firebase Firestore as the primary database and Firebase Authentication for coordinator/admin identity.

Current implementation files:

- `lib/firebase.ts` initializes Firebase app, Firestore, Auth, and `saveResult(collectionName, data)`.
- `lib/types.ts` currently contains scaffold-level message/store types and must be expanded during Phase 1.
- `firestore.rules` currently exists at repo root and must be hardened before final demo.

## Collection Overview

| Collection | Purpose |
|------------|---------|
| `programs` | Programme setup, criteria, dates, application config, mentor pool, selected companies |
| `applications` | Company-programme fit and selection journey |
| `cohorts` | Batch container for selected companies, mentors, and date range |
| `companies` | Startup company profiles and founder data |
| `mentors` | Mentor profile, expertise, availability, tokenized meeting link data |
| `relationships` | First-class mentor-startup pairing entity with match and health state |
| `meetings` | Meeting notes, AI summaries, action items, signals, and health deltas |
| `users` | Firebase Auth user profile, role, and organization |

## Domain Types

### `programs`

```ts
interface Program {
  id: string;
  name: string;
  organizerName: string;
  organizerId: string;
  type: "accelerator" | "incubator" | "grant" | "corporate-innovation" | "university" | "challenge";
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: {
    stageWeight: number;
    industryWeight: number;
    tractionWeight: number;
    teamWeight: number;
    needsFitWeight: number;
  };
  requiredDocuments: string[];
  applicationOpenAt: unknown;
  applicationCloseAt: unknown;
  startDate: unknown;
  endDate: unknown;
  status: "draft" | "open" | "reviewing" | "matching" | "active" | "completed";
  mentorIds: string[];
  selectedCompanyIds: string[];
  createdAt: unknown;
  updatedAt: unknown;
}
```

### `applications`

```ts
interface Application {
  id: string;
  programId: string;
  companyId: string;
  founderContactEmail: string;
  status: "draft" | "submitted" | "shortlisted" | "approved" | "declined" | "waitlisted";
  supportNeeds: string[];
  founderSummary: string;
  documentUrls: Record<string, string>;
  submittedAt: unknown | null;
  fitScore: number;
  fitLabel: "Strong fit" | "Potential fit" | "Low fit";
  fitBreakdown: {
    stageFit: number;
    industryFit: number;
    tractionFit: number;
    teamFit: number;
    needsFit: number;
  };
  eligibilityFlags: string[];
  aiInsight: string;
  aiRecommendation: "approve" | "review" | "decline";
  reviewedBy?: string;
  reviewedAt?: unknown;
  decisionReason?: string;
  createdAt: unknown;
  updatedAt: unknown;
}
```

### `cohorts`

```ts
interface Cohort {
  id: string;
  name: string;
  organizerName: string;
  organizerId: string;
  startDate: unknown;
  endDate: unknown;
  totalWeeks: number;
  status: "setup" | "matching" | "active" | "completed";
  companyIds: string[];
  mentorIds: string[];
  createdAt: unknown;
  updatedAt: unknown;
}
```

### `companies`

```ts
interface Company {
  id: string;
  cohortId?: string;
  programIds: string[];
  name: string;
  registrationNumber?: string;
  stage: "idea" | "pre-seed" | "seed" | "series-a" | "series-b" | "growth";
  industry: string[];
  country: string;
  city?: string;
  businessModel: "B2B" | "B2C" | "B2B2C" | "Marketplace" | "Other";
  needsHelp: string[];
  founderBackground?: string;
  founders: Founder[];
  teamSize: number;
  revenueMonthly?: number;
  isMatched: boolean;
  createdAt: unknown;
}

interface Founder {
  name: string;
  role: string;
  email?: string;
  background: string;
  linkedInUrl?: string;
}
```

### `mentors`

```ts
interface Mentor {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  company: string;
  expertise: string[];
  industries: string[];
  preferredStages: string[];
  mentorshipStyle: "hands-on" | "advisory" | "mixed";
  availabilityHoursPerMonth: number;
  availabilitySlots: AvailabilitySlot[];
  hasFounderExperience: boolean;
  hasInvestorExperience: boolean;
  geographies: string[];
  languages: string[];
  pastSuccessCount: number;
  cohortIds: string[];
  meetingSubmissionToken: string;
  createdAt: unknown;
}

interface AvailabilitySlot {
  id: string;
  startsAt: unknown;
  endsAt: unknown;
  mode: "online" | "in-person";
  status: "available" | "held" | "booked";
  programId?: string;
}
```

### `relationships`

```ts
interface Relationship {
  id: string;
  programId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;
  status: "pending" | "active" | "paused" | "completed" | "terminated";
  matchScore: number;
  matchReason: string;
  matchBreakdown: {
    industryMatch: number;
    stageFit: number;
    availability: number;
    styleCompatibility: number;
  };
  confirmedBy: string;
  matchedAt: unknown;
  healthScore: number;
  healthTrend: "improving" | "stable" | "deteriorating";
  lastMeetingAt: unknown | null;
  meetingCount: number;
  daysSinceLastMeeting: number;
  aiDiagnosis: string;
  watchPoints: string[];
  currentMilestone: number;
  milestonesCompleted: number[];
  milestoneCompletedAt: Record<number, unknown>;
  createdAt: unknown;
  updatedAt: unknown;
}
```

### `meetings`

```ts
interface Meeting {
  id: string;
  relationshipId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;
  date: unknown;
  durationMinutes: number;
  meetingNumber: number;
  rawNotes: string;
  submittedBy: "admin" | "mentor";
  submittedAt: unknown;
  aiSummary: string;
  actionItems: ActionItem[];
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;
  watchPoints: string[];
  aiProcessed: boolean;
  aiProcessedAt: unknown | null;
}

interface ActionItem {
  owner: "startup" | "mentor";
  task: string;
  dueDate: string | null;
  completed: boolean;
  completedAt: unknown | null;
}
```

### `users`

```ts
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "viewer";
  organizationId: string;
  createdAt: unknown;
  lastLoginAt: unknown;
}
```

## HealthScore Rules

- New confirmed relationships start at `60`.
- Each AI-processed meeting applies `healthScoreDelta` from `-15` to `+15`.
- Score is clamped between `0` and `100`.
- `healthTrend` is based on the average of recent deltas:
  - `improving`: last 3 average greater than `0`
  - `stable`: last 3 average from `-3` to `0`
  - `deteriorating`: last 3 average less than `-3`
- Demo implementation may compute stale-meeting decay on read if cron is not available.

## Score Bands

| Score | Label | Dashboard Treatment |
|-------|-------|---------------------|
| 70-100 | Healthy | No action needed |
| 40-69 | At Risk | Monitor closely |
| 0-39 | Critical | Intervention required |

## Demo Seed Contract

Create a deterministic seed module during Phase 1 with:

- 1 active program.
- 1 active cohort.
- 12 applications.
- 10 companies.
- 15 mentors.
- 8 relationships.
- 12 meetings.

Seed data must support dashboard, matching, applicant review, relationship detail, and cohort narrative without requiring live data entry before the pitch.

## Security Rules Target

Implemented in `firestore.rules` as of 2026-05-17 (Phase 5 Block A):

- Role source: `users/{uid}` document with `role` field equal to `admin` or `viewer`. Roles are resolved via `get()` on each rule evaluation.
- Admins can read all MVP collections. Admins can create `programs` and `cohorts` with required fields; update/delete is additionally org-scoped via `organizerId == currentUser().organizationId`. Admins can write `mentors`, `relationships`, `applications`, `companies`, `meetings`, and `users` without additional org scoping.
- Viewers can read `programs`, `applications`, `cohorts`, `companies`, `mentors`, `relationships`, and `meetings`. Viewer writes are denied.
- Public create for `applications`: requires `programId`, `companyId`, `founderContactEmail`, and `status` fields; `status` must be `draft` or `submitted`. Public update and delete are denied.
- Public create for `companies`: requires `name`, `programIds`, and `isMatched` fields; `isMatched` must be `false`. Public update and delete are denied.
- Public create for `meetings`: requires `relationshipId`, `mentorId`, `submittedBy`, and `token` fields; `submittedBy` must be `mentor`; `token` must equal the target mentor's `meetingSubmissionToken` (resolved via `get()`). Public update and delete are denied.
- `users` reads: each user can read their own profile; admins can read any user document.
- Unknown collections and unmatched paths are denied. No permissive `match /{document=**}` rule exists.
- **Fallback implication**: admin-only writes made via the client SDK (e.g., `safeWrite` in API routes) will receive a Firestore permission-denied error until Firebase Auth and ID-token enforcement are wired into the API layer. `safeWrite` returns `local-fallback` in this case; seed fallback behavior remains the operational baseline for the demo.
