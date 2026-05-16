import { NextResponse } from "next/server";
import type { Company, Mentor } from "@/lib/types";
import { getApprovedStartupQueue, getMentorPool } from "@/lib/verrier-analytics";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

interface MatchBreakdown {
  industryMatch: number;
  stageFit: number;
  availability: number;
  styleCompatibility: number;
}

interface MatchResult {
  mentorId: string;
  mentorName: string;
  overallScore: number;
  reason: string;
  breakdown: MatchBreakdown;
}

function computeBreakdown(mentor: Mentor, company: Company): MatchBreakdown {
  const companyIndustriesLower = company.industry.map((i) => i.toLowerCase());
  const matchingCount = mentor.industries.filter((i) =>
    companyIndustriesLower.includes(i.toLowerCase())
  ).length;
  const industryMatch =
    mentor.industries.length > 0
      ? clamp((matchingCount / mentor.industries.length) * 100)
      : 0;

  const stageFit = mentor.preferredStages.includes(company.stage) ? 100 : 35;

  const availableSlots = mentor.availabilitySlots.filter(
    (s) => s.status === "available"
  ).length;
  const totalSlots = mentor.availabilitySlots.length;
  const availability =
    totalSlots > 0 ? clamp((availableSlots / totalSlots) * 100) : 0;

  const hoursScore = clamp(mentor.availabilityHoursPerMonth * 8);
  const successScore = clamp(mentor.pastSuccessCount * 5);
  const styleCompatibility = clamp((hoursScore + successScore) / 2);

  return { industryMatch, stageFit, availability, styleCompatibility };
}

function computeOverallScore(bd: MatchBreakdown): number {
  return clamp(
    bd.industryMatch * 0.35 +
      bd.stageFit * 0.3 +
      bd.availability * 0.2 +
      bd.styleCompatibility * 0.15
  );
}

function buildReason(
  mentor: Mentor,
  company: Company,
  bd: MatchBreakdown
): string {
  if (bd.industryMatch >= 70) {
    return `Strong industry alignment: ${mentor.name} has deep expertise in ${company.industry.slice(0, 2).join(" and ")}.`;
  }
  if (bd.stageFit >= 100) {
    return `Stage fit: ${mentor.name} specialises in mentoring ${company.stage}-stage startups.`;
  }
  if (bd.availability >= 80) {
    return `${mentor.name} has ${mentor.availabilityHoursPerMonth}h/month available and a strong programme track record.`;
  }
  return `${mentor.name} is a programme mentor with relevant expertise in ${mentor.expertise.slice(0, 2).join(" and ")}.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 }
    );
  }

  const b = body as Record<string, unknown>;
  const { startupId, programId, cohortId } = b;

  if (!startupId || typeof startupId !== "string") {
    return NextResponse.json(
      { error: "startupId is required and must be a string" },
      { status: 400 }
    );
  }
  if (!programId || typeof programId !== "string") {
    return NextResponse.json(
      { error: "programId is required and must be a string" },
      { status: 400 }
    );
  }

  const resolvedCohortId =
    typeof cohortId === "string" ? cohortId : undefined;

  const startupQueue = getApprovedStartupQueue(programId, resolvedCohortId);
  const startupItem = startupQueue.find((item) => item.company.id === startupId);

  if (!startupItem) {
    return NextResponse.json(
      {
        error:
          "Startup not found in the approved unmatched queue for this programme.",
      },
      { status: 404 }
    );
  }

  const mentorPool = getMentorPool(programId, resolvedCohortId);
  const { company } = startupItem;

  interface ScoredCandidate extends MatchResult {
    _sortKey: string;
  }

  const scoredCandidates: ScoredCandidate[] = mentorPool.map((poolItem) => {
    const bd = computeBreakdown(poolItem.mentor, company);
    const overallScore = computeOverallScore(bd);
    return {
      _sortKey: poolItem.mentor.id,
      mentorId: poolItem.mentor.id,
      mentorName: poolItem.mentor.name,
      overallScore,
      reason: buildReason(poolItem.mentor, company, bd),
      breakdown: bd,
    };
  });

  scoredCandidates.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    return a._sortKey < b._sortKey ? -1 : 1;
  });

  const matches: MatchResult[] = scoredCandidates.slice(0, 3).map((c) => ({
    mentorId: c.mentorId,
    mentorName: c.mentorName,
    overallScore: c.overallScore,
    reason: c.reason,
    breakdown: c.breakdown,
  }));

  return NextResponse.json({ matches });
}
