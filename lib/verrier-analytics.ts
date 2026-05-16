import type {
  Application,
  Cohort,
  Company,
  Meeting,
  Mentor,
  Program,
  Relationship,
} from "./types";

import {
  seedApplications,
  seedCohorts,
  seedCompanies,
  seedMeetings,
  seedMentors,
  seedPrograms,
  seedRelationships,
} from "./verrier-seed";

export type HealthBand = "healthy" | "at-risk" | "critical";

export function getHealthBand(score: number): HealthBand {
  if (score >= 70) return "healthy";
  if (score >= 40) return "at-risk";
  return "critical";
}

export function getHealthBandLabel(band: HealthBand): string {
  if (band === "healthy") return "Healthy";
  if (band === "at-risk") return "At Risk";
  return "Critical";
}

export interface DashboardSummary {
  activeProgramCount: number;
  activeCohortCount: number;
  submittedApplicationCount: number;
  approvedApplicationCount: number;
  activeRelationshipCount: number;
  healthyRelationshipCount: number;
  atRiskRelationshipCount: number;
  criticalRelationshipCount: number;
  unmatchedApprovedCompanyCount: number;
  meetingCount: number;
}

export function getDashboardSummary(): DashboardSummary {
  const activeProgramCount = seedPrograms.filter(
    (p) => p.status === "active"
  ).length;

  const activeCohortCount = seedCohorts.filter(
    (c) => c.status === "active"
  ).length;

  const submittedApplicationCount = seedApplications.filter(
    (a) => a.submittedAt !== null
  ).length;

  const approvedApplicationCount = seedApplications.filter(
    (a) => a.status === "approved"
  ).length;

  const activeRelationships = seedRelationships.filter(
    (r) => r.status === "active"
  );

  const activeRelationshipCount = activeRelationships.length;

  const healthyRelationshipCount = activeRelationships.filter(
    (r) => getHealthBand(r.healthScore) === "healthy"
  ).length;

  const atRiskRelationshipCount = activeRelationships.filter(
    (r) => getHealthBand(r.healthScore) === "at-risk"
  ).length;

  const criticalRelationshipCount = activeRelationships.filter(
    (r) => getHealthBand(r.healthScore) === "critical"
  ).length;

  const approvedCompanyIds = new Set(
    seedApplications
      .filter((a) => a.status === "approved")
      .map((a) => a.companyId)
  );

  const unmatchedApprovedCompanyCount = seedCompanies.filter(
    (c) => !c.isMatched && approvedCompanyIds.has(c.id)
  ).length;

  const meetingCount = seedMeetings.length;

  return {
    activeProgramCount,
    activeCohortCount,
    submittedApplicationCount,
    approvedApplicationCount,
    activeRelationshipCount,
    healthyRelationshipCount,
    atRiskRelationshipCount,
    criticalRelationshipCount,
    unmatchedApprovedCompanyCount,
    meetingCount,
  };
}

export interface AttentionFeedEntry {
  relationship: Relationship;
  company: Company;
  mentor: Mentor;
  band: HealthBand;
}

const BAND_RANK: Record<HealthBand, number> = {
  critical: 0,
  "at-risk": 1,
  healthy: 2,
};

export function getAttentionFeed(): AttentionFeedEntry[] {
  const companyMap = new Map(seedCompanies.map((c) => [c.id, c]));
  const mentorMap = new Map(seedMentors.map((m) => [m.id, m]));

  const entries: AttentionFeedEntry[] = seedRelationships
    .filter((r) => r.status === "active")
    .map((r) => ({
      relationship: r,
      company: companyMap.get(r.companyId) as Company,
      mentor: mentorMap.get(r.mentorId) as Mentor,
      band: getHealthBand(r.healthScore),
    }));

  return entries.sort((a, b) => {
    const bandDiff = BAND_RANK[a.band] - BAND_RANK[b.band];
    if (bandDiff !== 0) return bandDiff;

    const daysDiff =
      b.relationship.daysSinceLastMeeting -
      a.relationship.daysSinceLastMeeting;
    if (daysDiff !== 0) return daysDiff;

    const scoreDiff = a.relationship.healthScore - b.relationship.healthScore;
    if (scoreDiff !== 0) return scoreDiff;

    return a.relationship.id < b.relationship.id ? -1 : 1;
  });
}

export interface RecentMeetingEntry {
  meeting: Meeting;
  relationship: Relationship;
  company: Company;
  mentor: Mentor;
}

export function getRecentMeetings(limit = 5): RecentMeetingEntry[] {
  const relationshipMap = new Map(seedRelationships.map((r) => [r.id, r]));
  const companyMap = new Map(seedCompanies.map((c) => [c.id, c]));
  const mentorMap = new Map(seedMentors.map((m) => [m.id, m]));

  const sorted = [...seedMeetings].sort((a, b) => {
    const da = String(a.date);
    const db = String(b.date);
    if (db > da) return 1;
    if (da > db) return -1;
    return 0;
  });

  return sorted.slice(0, limit).map((m) => ({
    meeting: m,
    relationship: relationshipMap.get(m.relationshipId) as Relationship,
    company: companyMap.get(m.companyId) as Company,
    mentor: mentorMap.get(m.mentorId) as Mentor,
  }));
}

export interface MentorCandidate {
  mentor: Mentor;
  score: number;
  matchingExpertise: string[];
  matchingIndustries: string[];
  hasAvailableSlot: boolean;
}

export function getMentorCandidatesForCompany(
  companyId: string
): MentorCandidate[] {
  const company = seedCompanies.find((c) => c.id === companyId);
  if (!company) return [];

  const companyNeedsLower = company.needsHelp.map((n) => n.toLowerCase());
  const companyIndustriesLower = company.industry.map((i) => i.toLowerCase());

  const candidates: MentorCandidate[] = seedMentors.map((mentor) => {
    let score = 0;

    const matchingExpertise = mentor.expertise.filter((e) =>
      companyNeedsLower.includes(e.toLowerCase())
    );
    score += matchingExpertise.length * 10;

    const matchingIndustries = mentor.industries.filter((i) =>
      companyIndustriesLower.includes(i.toLowerCase())
    );
    score += matchingIndustries.length * 10;

    if (mentor.preferredStages.includes(company.stage)) score += 20;

    const hasAvailableSlot = mentor.availabilitySlots.some(
      (s) => s.status === "available"
    );
    if (hasAvailableSlot) score += 15;

    if (mentor.hasFounderExperience) score += 5;
    if (mentor.hasInvestorExperience) score += 5;

    return {
      mentor,
      score,
      matchingExpertise,
      matchingIndustries,
      hasAvailableSlot,
    };
  });

  return candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.mentor.id < b.mentor.id ? -1 : 1;
  });
}

export function findCompanyById(companyId: string): Company | undefined {
  return seedCompanies.find((c) => c.id === companyId);
}

export function findMentorById(mentorId: string): Mentor | undefined {
  return seedMentors.find((m) => m.id === mentorId);
}

export function findRelationshipById(
  relationshipId: string
): Relationship | undefined {
  return seedRelationships.find((r) => r.id === relationshipId);
}

// ─── Matching: Startup Queue ──────────────────────────────────────────────────

export interface ApprovedStartupQueueItem {
  application: Application;
  company: Company;
  program: Program;
  cohort: Cohort | null;
  fitScore: number;
  supportNeeds: string[];
  founderSummary: string;
}

/**
 * Returns approved unmatched startups for a programme and optional cohort.
 * Startups are unmatched when they have no active or pending relationship.
 * Sorted by fit score descending, company name ascending, company id ascending.
 */
export function getApprovedStartupQueue(
  programId: string,
  cohortId?: string
): ApprovedStartupQueueItem[] {
  const program = seedPrograms.find((p) => p.id === programId);
  if (!program) return [];

  const cohort = cohortId
    ? (seedCohorts.find((c) => c.id === cohortId) ?? null)
    : null;

  const matchedCompanyIds = new Set(
    seedRelationships
      .filter((r) => r.status === "active" || r.status === "pending")
      .map((r) => r.companyId)
  );

  const approvedCompanyIds = new Set(
    seedApplications
      .filter((a) => a.programId === programId && a.status === "approved")
      .map((a) => a.companyId)
  );

  const selectedCompanyIds = new Set(program.selectedCompanyIds);
  const qualifiedCompanyIds = new Set([
    ...approvedCompanyIds,
    ...selectedCompanyIds,
  ]);

  const cohortCompanyIds = cohort ? new Set(cohort.companyIds) : null;

  const companyMap = new Map(seedCompanies.map((c) => [c.id, c]));

  const approvedApplications = seedApplications.filter(
    (a) => a.programId === programId && a.status === "approved"
  );

  const bestApplicationByCompany = new Map<string, Application>();
  for (const app of approvedApplications) {
    const existing = bestApplicationByCompany.get(app.companyId);
    if (!existing || app.fitScore > existing.fitScore) {
      bestApplicationByCompany.set(app.companyId, app);
    }
  }

  const queue: ApprovedStartupQueueItem[] = [];

  for (const companyId of qualifiedCompanyIds) {
    if (matchedCompanyIds.has(companyId)) continue;
    if (cohortCompanyIds && !cohortCompanyIds.has(companyId)) continue;

    const company = companyMap.get(companyId);
    if (!company) continue;

    const application = bestApplicationByCompany.get(companyId);
    if (!application) continue;

    queue.push({
      application,
      company,
      program,
      cohort,
      fitScore: application.fitScore,
      supportNeeds: application.supportNeeds,
      founderSummary: application.founderSummary,
    });
  }

  return queue.sort((a, b) => {
    if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
    if (a.company.name < b.company.name) return -1;
    if (a.company.name > b.company.name) return 1;
    if (a.company.id < b.company.id) return -1;
    if (a.company.id > b.company.id) return 1;
    return 0;
  });
}

// ─── Matching: Mentor Pool ────────────────────────────────────────────────────

const HIGH_LOAD_RELATIONSHIP_THRESHOLD = 2;
const MIN_AVAILABLE_SLOTS = 1;

export type MentorPoolWarningCode = "high-load" | "insufficient-availability";

export interface MentorPoolWarning {
  code: MentorPoolWarningCode;
  message: string;
}

export interface MentorPoolItem {
  mentor: Mentor;
  programId: string;
  cohortId: string | null;
  availableSlotCount: number;
  totalSlotCount: number;
  activeRelationshipCount: number;
  warnings: MentorPoolWarning[];
}

/**
 * Returns mentors connected to the programme or cohort, with load and
 * availability metadata and warning flags.
 */
export function getMentorPool(
  programId: string,
  cohortId?: string
): MentorPoolItem[] {
  const program = seedPrograms.find((p) => p.id === programId);
  if (!program) return [];

  const cohort = cohortId
    ? (seedCohorts.find((c) => c.id === cohortId) ?? null)
    : null;

  const programMentorIds = new Set(program.mentorIds);
  const cohortMentorIds = cohort ? new Set(cohort.mentorIds) : null;

  const eligibleMentors = seedMentors.filter((m) => {
    if (cohortMentorIds) {
      return programMentorIds.has(m.id) || cohortMentorIds.has(m.id);
    }
    return programMentorIds.has(m.id);
  });

  return eligibleMentors.map((mentor) => {
    const availableSlotCount = mentor.availabilitySlots.filter(
      (s) => s.status === "available"
    ).length;
    const totalSlotCount = mentor.availabilitySlots.length;

    const activeRelationshipCount = seedRelationships.filter(
      (r) =>
        r.mentorId === mentor.id &&
        (r.status === "active" || r.status === "pending")
    ).length;

    const warnings: MentorPoolWarning[] = [];

    if (activeRelationshipCount > HIGH_LOAD_RELATIONSHIP_THRESHOLD) {
      warnings.push({
        code: "high-load",
        message: `Mentor has ${activeRelationshipCount} active or pending relationships.`,
      });
    }

    if (availableSlotCount < MIN_AVAILABLE_SLOTS) {
      warnings.push({
        code: "insufficient-availability",
        message: "Mentor has no available slots.",
      });
    }

    return {
      mentor,
      programId,
      cohortId: cohortId ?? null,
      availableSlotCount,
      totalSlotCount,
      activeRelationshipCount,
      warnings,
    };
  });
}
