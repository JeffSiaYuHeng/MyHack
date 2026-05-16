import { NextResponse } from "next/server";
import type { Relationship } from "@/lib/types";

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
  const {
    startupId,
    mentorId,
    programId,
    cohortId,
    matchScore,
    matchReason,
    matchBreakdown,
  } = b;

  // Validation
  if (!startupId || typeof startupId !== "string") {
    return NextResponse.json(
      { error: "startupId is required and must be a string" },
      { status: 400 }
    );
  }
  if (!mentorId || typeof mentorId !== "string") {
    return NextResponse.json(
      { error: "mentorId is required and must be a string" },
      { status: 400 }
    );
  }
  if (!programId || typeof programId !== "string") {
    return NextResponse.json(
      { error: "programId is required and must be a string" },
      { status: 400 }
    );
  }
  if (!cohortId || typeof cohortId !== "string") {
    return NextResponse.json(
      { error: "cohortId is required and must be a string" },
      { status: 400 }
    );
  }
  if (typeof matchScore !== "number") {
    return NextResponse.json(
      { error: "matchScore is required and must be a number" },
      { status: 400 }
    );
  }
  if (!matchReason || typeof matchReason !== "string") {
    return NextResponse.json(
      { error: "matchReason is required and must be a string" },
      { status: 400 }
    );
  }
  if (
    !matchBreakdown ||
    typeof matchBreakdown !== "object" ||
    Array.isArray(matchBreakdown)
  ) {
    return NextResponse.json(
      { error: "matchBreakdown is required and must be an object" },
      { status: 400 }
    );
  }

  const mb = matchBreakdown as Record<string, unknown>;
  const keys = [
    "industryMatch",
    "stageFit",
    "availability",
    "styleCompatibility",
  ];
  for (const key of keys) {
    if (typeof mb[key] !== "number") {
      return NextResponse.json(
        { error: `matchBreakdown.${key} must be a number` },
        { status: 400 }
      );
    }
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(matchScore)));
  const now = new Date().toISOString();

  // Build Relationship record
  const record: Relationship = {
    id: `rel-local-${Date.now()}`,
    programId: programId,
    cohortId: cohortId,
    companyId: startupId,
    mentorId: mentorId,
    status: "active",
    matchScore: clampedScore,
    matchReason: matchReason,
    matchBreakdown: {
      industryMatch: Math.max(
        0,
        Math.min(100, Math.round(mb.industryMatch as number))
      ),
      stageFit: Math.max(0, Math.min(100, Math.round(mb.stageFit as number))),
      availability: Math.max(
        0,
        Math.min(100, Math.round(mb.availability as number))
      ),
      styleCompatibility: Math.max(
        0,
        Math.min(100, Math.round(mb.styleCompatibility as number))
      ),
    },
    confirmedBy: "coordinator-demo",
    matchedAt: now,
    healthScore: 60,
    healthTrend: "stable",
    lastMeetingAt: null,
    meetingCount: 0,
    daysSinceLastMeeting: 0,
    aiDiagnosis: "",
    watchPoints: [],
    currentMilestone: 1,
    milestonesCompleted: [],
    milestoneCompletedAt: {},
    createdAt: now,
    updatedAt: now,
  };

  return NextResponse.json(
    {
      relationshipId: record.id,
      status: record.status,
      createdAt: record.createdAt,
    },
    { status: 201 }
  );
}
