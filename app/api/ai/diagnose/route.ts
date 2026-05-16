import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  seedRelationships,
  seedCompanies,
  seedMentors,
  seedMeetings,
} from "@/lib/verrier-seed";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function buildFallbackDiagnosis(
  healthScore: number,
  healthTrend: string,
  daysSinceLastMeeting: number,
  hasFriction: boolean,
  currentDiagnosis: string,
  currentWatchPoints: string[]
): { narrative: string; watchPoints: string[]; recommendation: string } {
  const isCritical = healthScore < 40;
  const isAtRisk = healthScore < 70;
  const isStale = daysSinceLastMeeting > 14;
  const isDeterioring = healthTrend === "deteriorating";

  let narrative: string;
  let recommendation: string;

  if (isCritical || (isAtRisk && isDeterioring)) {
    narrative =
      currentDiagnosis ||
      "Relationship health is critically low. Engagement has weakened and risk of disengagement is high. Immediate coordinator review is recommended.";
    recommendation =
      "Escalate to programme coordinator. Schedule a three-way check-in within the next five days.";
  } else if (hasFriction) {
    narrative =
      currentDiagnosis ||
      "Friction signals have been detected in recent meetings. Progress may be stalling on key action items.";
    recommendation =
      "Coordinator should review the latest meeting notes and reach out to both parties to identify blockers.";
  } else if (isStale) {
    narrative =
      currentDiagnosis ||
      "No meeting has been recorded in the past two weeks. Relationship momentum may be at risk.";
    recommendation =
      "Send a check-in prompt to the mentor and startup. Encourage them to log their next meeting.";
  } else if (isDeterioring) {
    narrative =
      currentDiagnosis ||
      "Health trend is deteriorating. While the current score remains acceptable, continued decline could push this relationship into the at-risk band.";
    recommendation =
      "Monitor closely. Prompt both parties to share an update before the next cohort review.";
  } else {
    narrative =
      currentDiagnosis ||
      "Relationship is progressing steadily. Meetings are occurring regularly and no significant friction has been detected.";
    recommendation =
      "Maintain current meeting cadence. Ensure action items from the last meeting are on track.";
  }

  const watchPoints =
    currentWatchPoints.length > 0
      ? currentWatchPoints
      : isStale
      ? ["No recent meeting logged"]
      : hasFriction
      ? ["Friction detected in recent meeting"]
      : [];

  return { narrative, watchPoints, recommendation };
}

function buildDiagnosePrompt(context: {
  companyName: string;
  mentorName: string;
  healthScore: number;
  healthTrend: string;
  meetingCount: number;
  daysSinceLastMeeting: number;
  currentMilestone: number;
  aiDiagnosis: string;
  watchPoints: string[];
  recentSignals: string[];
  recentSummaries: string[];
}): string {
  return `You are a mentorship programme analyst generating a relationship diagnosis for a Malaysian innovation accelerator.

Relationship context:
- Company: ${context.companyName}
- Mentor: ${context.mentorName}
- Health score: ${context.healthScore}/100
- Health trend: ${context.healthTrend}
- Total meetings: ${context.meetingCount}
- Days since last meeting: ${context.daysSinceLastMeeting}
- Current milestone: ${context.currentMilestone}/5
- Existing diagnosis: ${context.aiDiagnosis || "None"}
- Existing watch points: ${context.watchPoints.length > 0 ? context.watchPoints.join("; ") : "None"}
- Recent meeting signals: ${context.recentSignals.length > 0 ? context.recentSignals.join(", ") : "None"}
- Recent meeting summaries:
${context.recentSummaries.length > 0 ? context.recentSummaries.map((s, i) => `  ${i + 1}. ${s}`).join("\n") : "  None"}

Generate an updated relationship diagnosis. Evaluate only on professional and business criteria — do not assess on race, religion, or royalty.

Return a JSON object with exactly these fields:
{
  "narrative": "<2-3 sentence assessment of the relationship health, momentum, and key risks>",
  "watchPoints": ["<brief flag>"],
  "recommendation": "<1-2 sentence action for the programme coordinator>"
}

Rules:
- narrative must be factual, specific to this relationship, and actionable in tone.
- watchPoints: 0-4 brief strings highlighting specific risks or gaps.
- recommendation must address the coordinator directly and specify a concrete next step.
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

  if (!b.relationshipId || typeof b.relationshipId !== "string") {
    return NextResponse.json(
      { error: "relationshipId is required" },
      { status: 400 }
    );
  }

  const relationship = seedRelationships.find(
    (r) => r.id === b.relationshipId
  );
  if (!relationship) {
    return NextResponse.json(
      { error: "Relationship not found" },
      { status: 404 }
    );
  }

  const company = seedCompanies.find((c) => c.id === relationship.companyId);
  const mentor = seedMentors.find((m) => m.id === relationship.mentorId);
  const meetings = seedMeetings
    .filter((m) => m.relationshipId === relationship.id)
    .sort((a, b) => b.meetingNumber - a.meetingNumber)
    .slice(0, 3);

  const companyName = company?.name ?? relationship.companyId;
  const mentorName = mentor?.name ?? relationship.mentorId;
  const recentSignals = meetings.map((m) => m.signal);
  const recentSummaries = meetings.map((m) => m.aiSummary).filter(Boolean);
  const hasFriction = recentSignals.some((s) => s === "Friction detected");

  const fallback = buildFallbackDiagnosis(
    relationship.healthScore,
    relationship.healthTrend,
    relationship.daysSinceLastMeeting,
    hasFriction,
    relationship.aiDiagnosis,
    relationship.watchPoints
  );

  const updatedAt = new Date().toISOString();

  const prompt = buildDiagnosePrompt({
    companyName,
    mentorName,
    healthScore: relationship.healthScore,
    healthTrend: relationship.healthTrend,
    meetingCount: relationship.meetingCount,
    daysSinceLastMeeting: relationship.daysSinceLastMeeting,
    currentMilestone: relationship.currentMilestone,
    aiDiagnosis: relationship.aiDiagnosis,
    watchPoints: relationship.watchPoints,
    recentSignals,
    recentSummaries,
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      console.error("diagnose: malformed JSON from Gemini");
      return NextResponse.json({ ...fallback, updatedAt });
    }

    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json({ ...fallback, updatedAt });
    }

    const r = parsed as Record<string, unknown>;

    const narrative =
      typeof r.narrative === "string" && r.narrative.trim()
        ? r.narrative.trim()
        : fallback.narrative;

    const watchPoints = Array.isArray(r.watchPoints)
      ? (r.watchPoints as unknown[]).filter(
          (w): w is string => typeof w === "string" && w.trim().length > 0
        )
      : fallback.watchPoints;

    const recommendation =
      typeof r.recommendation === "string" && r.recommendation.trim()
        ? r.recommendation.trim()
        : fallback.recommendation;

    return NextResponse.json({ narrative, watchPoints, recommendation, updatedAt });
  } catch (error) {
    console.error("diagnose: Gemini call failed", error);
    return NextResponse.json({ ...fallback, updatedAt });
  }
}
