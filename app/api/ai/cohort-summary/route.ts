import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  seedCohorts,
  seedCompanies,
  seedMeetings,
  seedMentors,
  seedPrograms,
  seedRelationships,
} from "@/lib/verrier-seed";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const STALE_THRESHOLD_DAYS = 14;

const MILESTONE_LABELS = [
  "Discovery",
  "Alignment",
  "Execution",
  "Scaling",
  "Completion",
];

function getHealthBand(score: number): "healthy" | "at-risk" | "critical" {
  if (score >= 70) return "healthy";
  if (score >= 40) return "at-risk";
  return "critical";
}

interface CohortNums {
  cohortName: string;
  programName: string;
  totalCompanies: number;
  totalMentors: number;
  totalRelationships: number;
  activeRelationships: number;
  totalMeetings: number;
  avgHealthScore: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  staleCount: number;
  milestoneDistribution: Array<{
    milestone: number;
    label: string;
    count: number;
  }>;
}

function buildFallbackSummary(nums: CohortNums): {
  narrative: string;
  keyRisks: string[];
  recommendedActions: string[];
} {
  const staleNote =
    nums.staleCount > 0
      ? `${nums.staleCount} relationship${nums.staleCount > 1 ? "s have" : " has"} not logged a meeting in over ${STALE_THRESHOLD_DAYS} days.`
      : "All relationships have maintained recent meeting activity.";

  const narrative =
    `${nums.cohortName} has ${nums.totalRelationships} mentorship relationship${nums.totalRelationships !== 1 ? "s" : ""} across ` +
    `${nums.totalCompanies} ${nums.totalCompanies !== 1 ? "companies" : "company"} and ${nums.totalMentors} ${nums.totalMentors !== 1 ? "mentors" : "mentor"}. ` +
    `Average health score is ${nums.avgHealthScore}/100, with ${nums.healthyCount} healthy, ${nums.atRiskCount} at-risk, ` +
    `and ${nums.criticalCount} critical. ${staleNote} ` +
    `${nums.totalMeetings} meeting${nums.totalMeetings !== 1 ? "s" : ""} have been recorded to date.`;

  const keyRisks: string[] = [];
  if (nums.criticalCount > 0) {
    keyRisks.push(
      `${nums.criticalCount} relationship${nums.criticalCount > 1 ? "s are" : " is"} in critical health and require immediate coordinator review.`
    );
  }
  if (nums.staleCount > 0) {
    keyRisks.push(
      `${nums.staleCount} relationship${nums.staleCount > 1 ? "s have" : " has"} stalled with no meeting logged in over ${STALE_THRESHOLD_DAYS} days.`
    );
  }
  if (nums.atRiskCount > 0) {
    keyRisks.push(
      `${nums.atRiskCount} relationship${nums.atRiskCount > 1 ? "s are" : " is"} at risk and require active monitoring.`
    );
  }
  if (keyRisks.length === 0) {
    keyRisks.push("No critical risks detected. Continue monitoring all relationships.");
  }

  const recommendedActions: string[] = [
    nums.criticalCount + nums.atRiskCount > 0
      ? `Schedule coordinator check-ins for the ${nums.criticalCount + nums.atRiskCount} at-risk and critical relationship${nums.criticalCount + nums.atRiskCount > 1 ? "s" : ""}.`
      : "Maintain regular check-ins across all relationships.",
    nums.staleCount > 0
      ? `Send re-engagement prompts to stalled relationship${nums.staleCount > 1 ? "s" : ""} and request updated meeting logs.`
      : "Encourage all relationships to maintain their meeting cadence.",
    "Ensure all action items from the last meeting cycle are tracked before the next cohort review.",
  ];

  return { narrative, keyRisks, recommendedActions };
}

function buildCohortSummaryPrompt(nums: CohortNums): string {
  const milestoneLines = nums.milestoneDistribution
    .map(
      ({ milestone, label, count }) =>
        `  Milestone ${milestone} (${label}): ${count} relationship${count !== 1 ? "s" : ""} at or past this stage`
    )
    .join("\n");

  return `You are a mentorship programme analyst generating a management-ready cohort summary for a Malaysian innovation accelerator.

Cohort: ${nums.cohortName}
Programme: ${nums.programName}

Cohort metrics:
- Total companies: ${nums.totalCompanies}
- Total mentors: ${nums.totalMentors}
- Total relationships: ${nums.totalRelationships}
- Active relationships: ${nums.activeRelationships}
- Total meetings recorded: ${nums.totalMeetings}
- Average health score: ${nums.avgHealthScore}/100
- Healthy (≥70): ${nums.healthyCount}
- At-risk (40–69): ${nums.atRiskCount}
- Critical (<40): ${nums.criticalCount}
- Stale (no meeting in ${STALE_THRESHOLD_DAYS}+ days): ${nums.staleCount}

Milestone distribution:
${milestoneLines}

Write a concise management-level cohort summary. Evaluate only on professional and business criteria — do not assess on race, religion, or royalty.

Return a JSON object with exactly these fields:
{
  "narrative": "<2-4 sentence management summary of cohort health, milestone progress, and momentum, referencing specific numbers>",
  "keyRisks": ["<specific risk visible in the data>"],
  "recommendedActions": ["<concrete action for the programme coordinator>"]
}

Rules:
- narrative must reference the specific cohort numbers above.
- keyRisks: 2-4 strings, each naming a specific data-supported risk.
- recommendedActions: 2-4 strings, each naming a concrete coordinator action.
- Return only the JSON object, no surrounding explanation.`;
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

  if (!b.cohortId || typeof b.cohortId !== "string") {
    return NextResponse.json(
      { error: "cohortId is required" },
      { status: 400 }
    );
  }

  const cohort = seedCohorts.find((c) => c.id === b.cohortId);
  if (!cohort) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  const program = seedPrograms[0];
  const companies = seedCompanies.filter((c) =>
    cohort.companyIds.includes(c.id)
  );
  const mentors = seedMentors.filter((m) => cohort.mentorIds.includes(m.id));
  const relationships = seedRelationships.filter(
    (r) => r.cohortId === cohort.id
  );
  const meetings = seedMeetings.filter((m) =>
    relationships.some((r) => r.id === m.relationshipId)
  );

  const activeRelationships = relationships.filter(
    (r) => r.status === "active"
  ).length;
  const avgHealthScore =
    relationships.length > 0
      ? Math.round(
          relationships.reduce((sum, r) => sum + r.healthScore, 0) /
            relationships.length
        )
      : 0;
  const healthyCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "healthy"
  ).length;
  const atRiskCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "at-risk"
  ).length;
  const criticalCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "critical"
  ).length;
  const staleCount = relationships.filter(
    (r) => r.daysSinceLastMeeting > STALE_THRESHOLD_DAYS
  ).length;

  const milestoneDistribution = [1, 2, 3, 4, 5].map((num) => ({
    milestone: num,
    label: MILESTONE_LABELS[num - 1],
    count: relationships.filter(
      (r) =>
        r.currentMilestone >= num || r.milestonesCompleted.includes(num)
    ).length,
  }));

  const nums: CohortNums = {
    cohortName: cohort.name,
    programName: program.name,
    totalCompanies: companies.length,
    totalMentors: mentors.length,
    totalRelationships: relationships.length,
    activeRelationships,
    totalMeetings: meetings.length,
    avgHealthScore,
    healthyCount,
    atRiskCount,
    criticalCount,
    staleCount,
    milestoneDistribution,
  };

  const fallback = buildFallbackSummary(nums);
  const generatedAt = new Date().toISOString();
  const prompt = buildCohortSummaryPrompt(nums);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash-preview" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      console.error("cohort-summary: malformed JSON from Gemini");
      return NextResponse.json({ ...fallback, generatedAt });
    }

    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json({ ...fallback, generatedAt });
    }

    const r = parsed as Record<string, unknown>;

    const narrative =
      typeof r.narrative === "string" && r.narrative.trim()
        ? r.narrative.trim()
        : fallback.narrative;

    const keyRisks = Array.isArray(r.keyRisks)
      ? (r.keyRisks as unknown[]).filter(
          (k): k is string => typeof k === "string" && k.trim().length > 0
        )
      : fallback.keyRisks;

    const recommendedActions = Array.isArray(r.recommendedActions)
      ? (r.recommendedActions as unknown[]).filter(
          (a): a is string => typeof a === "string" && a.trim().length > 0
        )
      : fallback.recommendedActions;

    return NextResponse.json({
      narrative,
      keyRisks,
      recommendedActions,
      generatedAt,
    });
  } catch (error) {
    console.error("cohort-summary: Gemini call failed", error);
    return NextResponse.json({ ...fallback, generatedAt });
  }
}
