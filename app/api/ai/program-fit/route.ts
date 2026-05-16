import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PENDING_RESPONSE = {
  fitScore: 0,
  fitLabel: "Potential fit" as const,
  aiRecommendation: "review" as const,
  aiInsight:
    "AI scoring is currently unavailable. This application has been recorded and will be scored in the next review cycle.",
  breakdown: {
    stageFit: 0,
    industryFit: 0,
    tractionFit: 0,
    teamFit: 0,
    needsFit: 0,
  },
  eligibilityFlags: ["scoring-pending"],
  status: "pending" as const,
};

function clamp(val: unknown): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeFitLabel(
  val: unknown
): "Strong fit" | "Potential fit" | "Low fit" {
  if (val === "Strong fit" || val === "Potential fit" || val === "Low fit")
    return val;
  return "Potential fit";
}

function normalizeRecommendation(
  val: unknown
): "approve" | "review" | "decline" {
  if (val === "approve" || val === "review" || val === "decline") return val;
  return "review";
}

function buildPrompt(
  programId: string,
  companyProfile: unknown,
  founderSummary: string,
  supportNeeds: string[],
  submittedDocumentTypes: string[]
): string {
  return `You are an innovation programme evaluator assessing a startup application for a Malaysian accelerator.

Programme ID: ${programId}

Company Profile:
${JSON.stringify(companyProfile, null, 2)}

Founder Summary:
${founderSummary}

Support Needs: ${supportNeeds.join(", ")}
Submitted Document Types: ${submittedDocumentTypes.length > 0 ? submittedDocumentTypes.join(", ") : "none"}

Score this startup on programme fit. Evaluate only on professional and business criteria — do not assess on race, religion, or royalty.

Return a JSON object with exactly these fields:
{
  "fitScore": <integer 0-100>,
  "fitLabel": <"Strong fit" | "Potential fit" | "Low fit">,
  "aiRecommendation": <"approve" | "review" | "decline">,
  "aiInsight": "<1-2 sentences on fit rationale>",
  "breakdown": {
    "stageFit": <integer 0-100>,
    "industryFit": <integer 0-100>,
    "tractionFit": <integer 0-100>,
    "teamFit": <integer 0-100>,
    "needsFit": <integer 0-100>
  },
  "eligibilityFlags": ["<string>"]
}

Scoring rules:
- fitScore >= 70 maps to "Strong fit"; 40-69 maps to "Potential fit"; below 40 maps to "Low fit".
- aiRecommendation: "approve" for strong fit, "review" for potential fit, "decline" for low fit.
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
  const { programId, companyProfile, founderSummary, supportNeeds, submittedDocumentTypes } = b;

  if (!programId || typeof programId !== "string") {
    return NextResponse.json({ error: "programId is required" }, { status: 400 });
  }
  if (!companyProfile || typeof companyProfile !== "object" || Array.isArray(companyProfile)) {
    return NextResponse.json({ error: "companyProfile is required" }, { status: 400 });
  }
  if (!founderSummary || typeof founderSummary !== "string" || !founderSummary.trim()) {
    return NextResponse.json({ error: "founderSummary is required" }, { status: 400 });
  }
  if (!Array.isArray(supportNeeds) || supportNeeds.length === 0) {
    return NextResponse.json(
      { error: "supportNeeds must be a non-empty array" },
      { status: 400 }
    );
  }
  if (!Array.isArray(submittedDocumentTypes)) {
    return NextResponse.json(
      { error: "submittedDocumentTypes must be an array" },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(
    programId,
    companyProfile,
    founderSummary,
    supportNeeds as string[],
    submittedDocumentTypes as string[]
  );

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
      console.error("program-fit: malformed JSON from Gemini");
      return NextResponse.json(PENDING_RESPONSE);
    }

    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json(PENDING_RESPONSE);
    }

    const r = parsed as Record<string, unknown>;
    const bd =
      typeof r.breakdown === "object" && r.breakdown !== null && !Array.isArray(r.breakdown)
        ? (r.breakdown as Record<string, unknown>)
        : {};

    const fitScore = clamp(r.fitScore);
    const fitLabel = normalizeFitLabel(r.fitLabel);

    return NextResponse.json({
      fitScore,
      fitLabel,
      aiRecommendation: normalizeRecommendation(r.aiRecommendation),
      aiInsight: typeof r.aiInsight === "string" ? r.aiInsight : "",
      breakdown: {
        stageFit: clamp(bd.stageFit),
        industryFit: clamp(bd.industryFit),
        tractionFit: clamp(bd.tractionFit),
        teamFit: clamp(bd.teamFit),
        needsFit: clamp(bd.needsFit),
      },
      eligibilityFlags: Array.isArray(r.eligibilityFlags)
        ? (r.eligibilityFlags as unknown[]).filter((f): f is string => typeof f === "string")
        : [],
      status: "scored" as const,
    });
  } catch (error) {
    console.error("program-fit: Gemini call failed", error);
    return NextResponse.json(PENDING_RESPONSE);
  }
}
