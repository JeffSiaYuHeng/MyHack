import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { Company, Mentor } from "@/lib/types";
import type {
  ApprovedStartupQueueItem,
  MentorPoolItem,
} from "@/lib/verrier-analytics";
import { getApprovedStartupQueue, getMentorPool } from "@/lib/verrier-analytics";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

// ─── Deterministic fallback scoring ──────────────────────────────────────────

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

function buildDeterministicMatches(
  mentorPool: MentorPoolItem[],
  company: Company
): MatchResult[] {
  interface ScoredCandidate extends MatchResult {
    _sortKey: string;
  }

  const scored: ScoredCandidate[] = mentorPool.map((poolItem) => {
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

  scored.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    return a._sortKey < b._sortKey ? -1 : 1;
  });

  return scored.slice(0, 3).map((c) => ({
    mentorId: c.mentorId,
    mentorName: c.mentorName,
    overallScore: c.overallScore,
    reason: c.reason,
    breakdown: c.breakdown,
  }));
}

// ─── Gemini prompt builder ────────────────────────────────────────────────────

function buildMatchPrompt(
  startupItem: ApprovedStartupQueueItem,
  mentorPool: MentorPoolItem[]
): string {
  const { company, application } = startupItem;

  const candidateLines = mentorPool
    .map(
      (p) =>
        `ID: ${p.mentor.id} | Name: ${p.mentor.name} | Expertise: ${p.mentor.expertise.join(", ")} | Industries: ${p.mentor.industries.join(", ")} | Preferred stages: ${p.mentor.preferredStages.join(", ")} | Style: ${p.mentor.mentorshipStyle} | Hours/month: ${p.mentor.availabilityHoursPerMonth} | Past successes: ${p.mentor.pastSuccessCount}`
    )
    .join("\n");

  return `You are a mentor matching evaluator for a Malaysian innovation accelerator programme.

Startup Profile:
- Name: ${company.name}
- Stage: ${company.stage}
- Industries: ${company.industry.join(", ")}
- Business model: ${company.businessModel}
- Team size: ${company.teamSize}
- Monthly revenue (MYR): ${company.revenueMonthly ?? 0}
- Support needs: ${application.supportNeeds.join(", ")}
- Founder summary: ${application.founderSummary}

Evaluate only on professional and business criteria — do not assess on race, religion, or royalty.

Mentor Candidates:
${candidateLines}

Rank the top 3 mentor candidates by fit for this startup. For each match return:
- mentorId (use the exact ID from the candidate list above)
- overallScore (integer 0–100)
- reason (1–2 sentences on fit rationale)
- breakdown:
  - industryMatch (integer 0–100)
  - stageFit (integer 0–100)
  - availability (integer 0–100)
  - styleCompatibility (integer 0–100)

Return a JSON object with exactly this structure, no surrounding explanation:
{
  "matches": [
    {
      "mentorId": "<id>",
      "overallScore": <integer 0-100>,
      "reason": "<string>",
      "breakdown": {
        "industryMatch": <integer 0-100>,
        "stageFit": <integer 0-100>,
        "availability": <integer 0-100>,
        "styleCompatibility": <integer 0-100>
      }
    }
  ]
}`;
}

// ─── Gemini response parser ───────────────────────────────────────────────────

function parseGeminiMatches(
  output: unknown,
  mentorMap: Map<string, Mentor>
): MatchResult[] | null {
  if (typeof output !== "object" || output === null || Array.isArray(output)) {
    return null;
  }

  const r = output as Record<string, unknown>;
  if (!Array.isArray(r.matches) || r.matches.length === 0) return null;

  const results: MatchResult[] = [];

  for (const item of r.matches) {
    if (typeof item !== "object" || item === null) continue;
    const m = item as Record<string, unknown>;

    const mentorId = typeof m.mentorId === "string" ? m.mentorId : null;
    if (!mentorId) continue;

    const mentor = mentorMap.get(mentorId);
    if (!mentor) continue;

    const overallScore = clamp(Number(m.overallScore));
    const reason =
      typeof m.reason === "string" && m.reason.trim()
        ? m.reason.trim()
        : `${mentor.name} is a strong match for this startup.`;

    const bd =
      typeof m.breakdown === "object" &&
      m.breakdown !== null &&
      !Array.isArray(m.breakdown)
        ? (m.breakdown as Record<string, unknown>)
        : {};

    results.push({
      mentorId,
      mentorName: mentor.name,
      overallScore,
      reason,
      breakdown: {
        industryMatch: clamp(Number(bd.industryMatch)),
        stageFit: clamp(Number(bd.stageFit)),
        availability: clamp(Number(bd.availability)),
        styleCompatibility: clamp(Number(bd.styleCompatibility)),
      },
    });

    if (results.length === 3) break;
  }

  return results.length > 0 ? results : null;
}

// ─── Route handler ────────────────────────────────────────────────────────────

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

  const deterministicMatches = buildDeterministicMatches(mentorPool, company);

  const mentorMap = new Map<string, Mentor>(
    mentorPool.map((p) => [p.mentor.id, p.mentor])
  );

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = buildMatchPrompt(startupItem, mentorPool);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      console.error("match: malformed JSON from Gemini");
      return NextResponse.json({ matches: deterministicMatches });
    }

    const geminiMatches = parseGeminiMatches(parsed, mentorMap);
    if (!geminiMatches) {
      console.error("match: Gemini output failed validation, using fallback");
      return NextResponse.json({ matches: deterministicMatches });
    }

    return NextResponse.json({ matches: geminiMatches });
  } catch (error) {
    console.error("match: Gemini call failed", error);
    return NextResponse.json({ matches: deterministicMatches });
  }
}
