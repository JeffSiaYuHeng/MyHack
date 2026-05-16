import type { Company, Meeting, Mentor, Relationship } from "./types";

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
