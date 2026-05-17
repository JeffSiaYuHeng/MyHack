import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { seedMentors } from "@/lib/verrier-seed";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const PROGRAM_TYPES = [
  "accelerator",
  "incubator",
  "grant",
  "corporate-innovation",
  "university",
  "challenge",
] as const;

const STAGE_OPTIONS = ["idea", "pre-seed", "seed", "series-a", "series-b", "growth"];
const INDUSTRY_OPTIONS = ["AI/ML", "Fintech", "Healthtech", "Climate", "SaaS", "AgriTech", "FoodTech", "EdTech"];
const MARKET_OPTIONS = ["Malaysia", "Singapore", "Indonesia", "Thailand", "Vietnam", "Philippines"];
type CriteriaWeights = {
  stageWeight: number;
  industryWeight: number;
  tractionWeight: number;
  teamWeight: number;
  needsFitWeight: number;
};

const DEFAULT_CRITERIA_WEIGHTS: CriteriaWeights = {
  stageWeight: 25,
  industryWeight: 20,
  tractionWeight: 20,
  teamWeight: 20,
  needsFitWeight: 15,
};

function findMatches(text: string, options: string[]): string[] {
  const lowerText = text.toLowerCase();
  return options.filter((option) => lowerText.includes(option.toLowerCase()));
}

function normalizeCriteriaWeights(value: unknown): CriteriaWeights {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const raw = {
    stageWeight: Number(source.stageWeight ?? source.stage ?? DEFAULT_CRITERIA_WEIGHTS.stageWeight),
    industryWeight: Number(source.industryWeight ?? source.industry ?? DEFAULT_CRITERIA_WEIGHTS.industryWeight),
    tractionWeight: Number(source.tractionWeight ?? source.traction ?? DEFAULT_CRITERIA_WEIGHTS.tractionWeight),
    teamWeight: Number(source.teamWeight ?? source.team ?? DEFAULT_CRITERIA_WEIGHTS.teamWeight),
    needsFitWeight: Number(source.needsFitWeight ?? source.needs ?? DEFAULT_CRITERIA_WEIGHTS.needsFitWeight),
  };

  const clamped = Object.fromEntries(
    Object.entries(raw).map(([key, val]) => [
      key,
      Number.isFinite(val) ? Math.max(0, Math.min(100, Math.round(val))) : 0,
    ])
  ) as CriteriaWeights;

  const total = Object.values(clamped).reduce((sum, val) => sum + val, 0);
  if (total !== 100) return DEFAULT_CRITERIA_WEIGHTS;

  return clamped;
}

function normalizeStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeProgramDetails(value: unknown, briefText: string, fallbackUsed = false) {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const lowerBrief = briefText.toLowerCase();
  const typeCandidate = typeof source.type === "string" ? source.type : "";
  const type = PROGRAM_TYPES.includes(typeCandidate as (typeof PROGRAM_TYPES)[number])
    ? typeCandidate
    : lowerBrief.includes("grant")
      ? "grant"
      : lowerBrief.includes("challenge")
        ? "challenge"
        : lowerBrief.includes("university")
          ? "university"
          : lowerBrief.includes("corporate")
            ? "corporate-innovation"
            : "accelerator";

  const fallbackName =
    briefText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && line.length <= 90) ?? "New Programme";

  const targetStages = normalizeStringArray(
    source.targetStages,
    findMatches(briefText, STAGE_OPTIONS)
  );
  const targetIndustries = normalizeStringArray(
    source.targetIndustries,
    findMatches(briefText, INDUSTRY_OPTIONS)
  );
  const targetMarkets = normalizeStringArray(
    source.targetMarkets,
    findMatches(briefText, MARKET_OPTIONS)
  );
  const requiredDocuments = normalizeStringArray(source.requiredDocuments, [
    "pitchDeck",
    "companyRegistration",
  ]);
  const mentorIds = normalizeStringArray(source.mentorIds).filter((id) =>
    seedMentors.some((mentor) => mentor.id === id)
  );

  return {
    name: typeof source.name === "string" && source.name.trim() ? source.name.trim() : fallbackName,
    type,
    description:
      typeof source.description === "string" && source.description.trim()
        ? source.description.trim()
        : briefText.trim().slice(0, 500),
    targetStages: targetStages.length > 0 ? targetStages : ["seed"],
    targetIndustries: targetIndustries.length > 0 ? targetIndustries : ["SaaS"],
    targetMarkets: targetMarkets.length > 0 ? targetMarkets : ["Malaysia"],
    criteriaWeights: normalizeCriteriaWeights(source.criteriaWeights),
    requiredDocuments,
    mentorIds:
      mentorIds.length > 0
        ? mentorIds
        : seedMentors.slice(0, 3).map((mentor) => mentor.id),
    fallbackUsed,
  };
}

function extractJsonObject(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) throw new Error("No JSON object found");
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const briefText =
      typeof body === "object" && body !== null && "briefText" in body
        ? (body as Record<string, unknown>).briefText
        : null;

    if (!briefText || typeof briefText !== "string") {
      return NextResponse.json(
        { error: "A valid 'briefText' string is required." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(normalizeProgramDetails(null, briefText, true));
    }

    const availableMentors = seedMentors.map(m => ({
      id: m.id,
      name: m.name,
      role: m.currentRole,
      industries: m.industries,
      expertise: m.expertise,
      stages: m.preferredStages
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-3.0-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are an expert accelerator program manager. Extract the program details from the provided brief. 
Also, select the most suitable mentors from the provided "Available Mentors" list based on the program's target industries, stages, and focus areas.

Return ONLY a valid JSON object matching this schema exactly:
{
  "name": "string",
  "type": "accelerator" | "incubator" | "grant" | "corporate-innovation" | "university" | "challenge",
  "description": "string",
  "targetStages": ["string"] (e.g. "idea", "pre-seed", "seed", "series-a", "series-b", "growth"),
  "targetIndustries": ["string"],
  "targetMarkets": ["string"],
  "criteriaWeights": { "stage": number, "industry": number, "traction": number, "team": number, "needs": number } (MUST sum to 100),
  "requiredDocuments": ["string"],
  "mentorIds": ["string"] (array of mentor IDs)
}

Available Mentors:
${JSON.stringify(availableMentors, null, 2)}

Program Brief:
${briefText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = extractJsonObject(text);

    return NextResponse.json(normalizeProgramDetails(parsedData, briefText));
  } catch (error) {
    console.error("Error parsing program brief:", error);
    const briefText =
      typeof body === "object" && body !== null && "briefText" in body
        ? (body as Record<string, unknown>).briefText
        : "";
    return NextResponse.json(
      normalizeProgramDetails(null, typeof briefText === "string" ? briefText : "", true)
    );
  }
}
