export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ResultType {
  id?: string;
  title: string;
  data: unknown;
  createdAt: unknown;
}

export interface AppState {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  user: unknown | null;
  setUser: (user: unknown | null) => void;
}

export type TimestampLike =
  | string
  | number
  | Date
  | {
      seconds: number;
      nanoseconds: number;
    };

export type ProgramType =
  | "accelerator"
  | "incubator"
  | "grant"
  | "corporate-innovation"
  | "university"
  | "challenge";

export type ProgramStatus =
  | "draft"
  | "open"
  | "reviewing"
  | "matching"
  | "active"
  | "completed";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "shortlisted"
  | "approved"
  | "declined"
  | "waitlisted";

export type StartupStage =
  | "idea"
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "growth";

export type BusinessModel = "B2B" | "B2C" | "B2B2C" | "Marketplace" | "Other";

export type MentorshipStyle = "hands-on" | "advisory" | "mixed";

export type AvailabilitySlotStatus = "available" | "held" | "booked";

export type AvailabilityMode = "online" | "in-person";

export type RelationshipStatus =
  | "pending"
  | "active"
  | "paused"
  | "completed"
  | "terminated";

export type HealthTrend = "improving" | "stable" | "deteriorating";

export type MeetingSignal = "Positive" | "Neutral" | "Friction detected";

export type ActionItemOwner = "startup" | "mentor";

export type UserRole = "admin" | "viewer";

export interface SelectionCriteria {
  stageWeight: number;
  industryWeight: number;
  tractionWeight: number;
  teamWeight: number;
  needsFitWeight: number;
}

export interface Program {
  id: string;
  name: string;
  organizerName: string;
  organizerId: string;
  type: ProgramType;
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: SelectionCriteria;
  requiredDocuments: string[];
  applicationOpenAt: TimestampLike;
  applicationCloseAt: TimestampLike;
  startDate: TimestampLike;
  endDate: TimestampLike;
  status: ProgramStatus;
  mentorIds: string[];
  selectedCompanyIds: string[];
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface Application {
  id: string;
  programId: string;
  companyId: string;
  founderContactEmail: string;
  status: ApplicationStatus;
  supportNeeds: string[];
  founderSummary: string;
  documentUrls: Record<string, string>;
  submittedAt: TimestampLike | null;
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
  reviewedAt?: TimestampLike;
  decisionReason?: string;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface Cohort {
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

export interface Company {
  id: string;
  cohortId?: string;
  programIds: string[];
  name: string;
  registrationNumber?: string;
  stage: StartupStage;
  industry: string[];
  country: string;
  city?: string;
  businessModel: BusinessModel;
  needsHelp: string[];
  founderBackground?: string;
  founders: Founder[];
  teamSize: number;
  revenueMonthly?: number;
  isMatched: boolean;
  createdAt: TimestampLike;
}

export interface Founder {
  name: string;
  role: string;
  email?: string;
  background: string;
  linkedInUrl?: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  company: string;
  expertise: string[];
  industries: string[];
  preferredStages: string[];
  mentorshipStyle: MentorshipStyle;
  availabilityHoursPerMonth: number;
  availabilitySlots: AvailabilitySlot[];
  hasFounderExperience: boolean;
  hasInvestorExperience: boolean;
  geographies: string[];
  languages: string[];
  pastSuccessCount: number;
  cohortIds: string[];
  meetingSubmissionToken: string;
  createdAt: TimestampLike;
}

export interface AvailabilitySlot {
  id: string;
  startsAt: TimestampLike;
  endsAt: TimestampLike;
  mode: AvailabilityMode;
  status: AvailabilitySlotStatus;
  programId?: string;
}

export interface MatchBreakdown {
  industryMatch: number;
  stageFit: number;
  availability: number;
  styleCompatibility: number;
}

export interface Relationship {
  id: string;
  programId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;
  status: RelationshipStatus;
  matchScore: number;
  matchReason: string;
  matchBreakdown: MatchBreakdown;
  confirmedBy: string;
  matchedAt: TimestampLike;
  healthScore: number;
  healthTrend: HealthTrend;
  lastMeetingAt: TimestampLike | null;
  meetingCount: number;
  daysSinceLastMeeting: number;
  aiDiagnosis: string;
  watchPoints: string[];
  currentMilestone: number;
  milestonesCompleted: number[];
  milestoneCompletedAt: Record<number, TimestampLike>;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface Meeting {
  id: string;
  relationshipId: string;
  cohortId: string;
  companyId: string;
  mentorId: string;
  date: TimestampLike;
  durationMinutes: number;
  meetingNumber: number;
  rawNotes: string;
  submittedBy: "admin" | "mentor";
  submittedAt: TimestampLike;
  aiSummary: string;
  actionItems: ActionItem[];
  signal: MeetingSignal;
  signalReason: string;
  healthScoreDelta: number;
  watchPoints: string[];
  aiProcessed: boolean;
  aiProcessedAt: TimestampLike | null;
}

export interface ActionItem {
  owner: ActionItemOwner;
  task: string;
  dueDate: string | null;
  completed: boolean;
  completedAt: TimestampLike | null;
}

export type EcosystemEntityType =
  | "programme"
  | "company"
  | "mentor"
  | "partner"
  | "service-provider"
  | "grant"
  | "initiative";

export type EcosystemLinkageType =
  | "company-programme"
  | "mentor-company"
  | "partner-initiative"
  | "service-provider-company"
  | "programme-initiative";

export type EcosystemLinkageStatus =
  | "proposed"
  | "active"
  | "monitoring"
  | "completed";

export interface EcosystemEntity {
  id: string;
  type: EcosystemEntityType;
  name: string;
  organizationName?: string;
  focusAreas: string[];
  geography: string[];
  description: string;
  createdAt: TimestampLike;
}

export interface EcosystemLinkage {
  id: string;
  type: EcosystemLinkageType;
  sourceEntityId: string;
  targetEntityId: string;
  programmeId?: string;
  companyId?: string;
  status: EcosystemLinkageStatus;
  fitScore: number;
  rationale: string;
  reusableSignals: string[];
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface VerrierUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  organizationId: string;
  createdAt: TimestampLike;
  lastLoginAt: TimestampLike;
}
