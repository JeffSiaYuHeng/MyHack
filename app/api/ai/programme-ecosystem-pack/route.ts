import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { seedEcosystemEntities, seedEcosystemLinkages } from "@/lib/verrier-seed";
import type { EcosystemEntity, ProgramType, SelectionCriteria } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type DraftDocumentType =
  | "programme-brief"
  | "grant-readiness"
  | "partner-outreach"
  | "service-provider-scope"
  | "application-requirements";

type ServiceProviderCategory = "cloud" | "legal" | "market-access" | "finance" | "technical";

interface ProgrammeProfile {
  name: string;
  type: ProgramType;
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: SelectionCriteria;
  requiredDocuments: string[];
  applicationOpenAt: string;
  applicationCloseAt: string;
  startDate: string;
  endDate: string;
  mentorIds: string[];
}

interface GrantRecommendation {
  name: string;
  provider: string;
  fitScore: number;
  rationale: string;
  eligibilityNotes: string[];
}

interface ServiceProviderRecommendation {
  name: string;
  category: ServiceProviderCategory;
  fitScore: number;
  rationale: string;
  suggestedUse: string;
}

interface PartnerLinkageRecommendation {
  source: string;
  target: string;
  linkageType: string;
  fitScore: number;
  rationale: string;
  reusableSignals: string[];
}

interface DraftDocument {
  title: string;
  type: DraftDocumentType;
  markdown: string;
}

interface EcosystemPack {
  summary: string;
  recommendedGrants: GrantRecommendation[];
  recommendedServiceProviders: ServiceProviderRecommendation[];
  recommendedPartnerLinkages: PartnerLinkageRecommendation[];
  draftDocuments: DraftDocument[];
  fallbackUsed: boolean;
}

function clamp(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeProgramme(value: unknown): ProgrammeProfile | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const p = value as Record<string, unknown>;
  const selectionCriteria =
    typeof p.selectionCriteria === "object" && p.selectionCriteria !== null && !Array.isArray(p.selectionCriteria)
      ? (p.selectionCriteria as Partial<SelectionCriteria>)
      : {};

  return {
    name: typeof p.name === "string" && p.name.trim() ? p.name : "Untitled Programme",
    type:
      p.type === "accelerator" ||
      p.type === "incubator" ||
      p.type === "grant" ||
      p.type === "corporate-innovation" ||
      p.type === "university" ||
      p.type === "challenge"
        ? p.type
        : "accelerator",
    description: typeof p.description === "string" ? p.description : "",
    targetStages: asStringArray(p.targetStages),
    targetIndustries: asStringArray(p.targetIndustries),
    targetMarkets: asStringArray(p.targetMarkets),
    selectionCriteria: {
      stageWeight: clamp(selectionCriteria.stageWeight),
      industryWeight: clamp(selectionCriteria.industryWeight),
      tractionWeight: clamp(selectionCriteria.tractionWeight),
      teamWeight: clamp(selectionCriteria.teamWeight),
      needsFitWeight: clamp(selectionCriteria.needsFitWeight),
    },
    requiredDocuments: asStringArray(p.requiredDocuments),
    applicationOpenAt: typeof p.applicationOpenAt === "string" ? p.applicationOpenAt : "",
    applicationCloseAt: typeof p.applicationCloseAt === "string" ? p.applicationCloseAt : "",
    startDate: typeof p.startDate === "string" ? p.startDate : "",
    endDate: typeof p.endDate === "string" ? p.endDate : "",
    mentorIds: asStringArray(p.mentorIds),
  };
}

function labelList(items: string[], fallback: string): string {
  return items.length > 0 ? items.join(", ") : fallback;
}

function entityScore(entity: EcosystemEntity, programme: ProgrammeProfile): number {
  const entityText = [...entity.focusAreas, ...entity.geography, entity.description].join(" ").toLowerCase();
  const programmeSignals = [
    ...programme.targetIndustries,
    ...programme.targetMarkets,
    ...programme.targetStages,
    programme.type,
    programme.description,
  ].map((item) => item.toLowerCase());
  const overlap = programmeSignals.filter((signal) => signal && entityText.includes(signal)).length;
  const marketOverlap = programme.targetMarkets.filter((market) => entity.geography.includes(market)).length;
  return Math.min(95, 68 + overlap * 5 + marketOverlap * 4);
}

function inferProviderCategory(entity: EcosystemEntity): ServiceProviderCategory {
  const text = [...entity.focusAreas, entity.description, entity.name].join(" ").toLowerCase();
  if (text.includes("cloud") || text.includes("security") || text.includes("architecture")) return "cloud";
  if (text.includes("legal") || text.includes("ip") || text.includes("regulatory") || text.includes("compliance")) {
    return "legal";
  }
  if (text.includes("market") || text.includes("pilot") || text.includes("customer") || text.includes("regional")) {
    return "market-access";
  }
  if (text.includes("fund") || text.includes("grant") || text.includes("finance") || text.includes("investment")) {
    return "finance";
  }
  return "technical";
}

function buildMarkdownDocuments(programme: ProgrammeProfile): DraftDocument[] {
  const programmeName = programme.name || "Untitled Programme";
  const markets = labelList(programme.targetMarkets, "Malaysia and Southeast Asia");
  const industries = labelList(programme.targetIndustries, "priority innovation sectors");
  const stages = labelList(programme.targetStages, "early-stage startups");
  const requiredDocs = programme.requiredDocuments.length
    ? programme.requiredDocuments.map((doc) => `- ${doc}`).join("\n")
    : "- Pitch deck\n- Company registration\n- Traction summary";

  return [
    {
      title: `${programmeName} Programme Brief`,
      type: "programme-brief",
      markdown: `# ${programmeName} Programme Brief

## Purpose
${programme.description || `Support ${stages} operating in ${industries}.`}

## Target Profile
- Stages: ${stages}
- Industries: ${industries}
- Markets: ${markets}

## Selection Criteria
- Stage fit: ${programme.selectionCriteria.stageWeight}%
- Industry fit: ${programme.selectionCriteria.industryWeight}%
- Traction fit: ${programme.selectionCriteria.tractionWeight}%
- Team fit: ${programme.selectionCriteria.teamWeight}%
- Needs fit: ${programme.selectionCriteria.needsFitWeight}%

## Ecosystem Linkage Goal
Use Verrier to connect selected companies to mentors, grants, partners, and service providers as reusable relationship entities.`,
    },
    {
      title: `${programmeName} Grant Readiness Checklist`,
      type: "grant-readiness",
      markdown: `# Grant Readiness Checklist

## Required Applicant Materials
${requiredDocs}

## Readiness Checks
- Confirm company registration and founder ownership details.
- Prepare a concise use-of-funds plan.
- Map requested support to programme outcomes.
- Identify whether the startup needs cloud credits, legal readiness, market access, or technical validation.

## Coordinator Notes
Prioritize applicants whose support needs can be connected to existing ecosystem partners or service providers.`,
    },
    {
      title: `${programmeName} Service Provider Scope`,
      type: "service-provider-scope",
      markdown: `# Service Provider Scope

## Recommended Support Categories
- Cloud and technical architecture readiness.
- Legal, IP, and fundraising documentation.
- Market access and pilot partner discovery.

## Operating Model
Each provider engagement should be tracked as a reusable linkage with fit score, rationale, signals, owner, and status.

## Expected Outputs
- Startup-specific support plan.
- Follow-up actions.
- Outcome notes reusable for future matching.`,
    },
    {
      title: `${programmeName} Partner Outreach Email`,
      type: "partner-outreach",
      markdown: `# Partner Outreach Email

Subject: Partnership opportunity for ${programmeName}

Hi [Partner Name],

We are preparing ${programmeName}, focused on ${industries} startups targeting ${markets}. We are using Verrier to map programme relationships as reusable ecosystem linkages, including company-programme, partner-initiative, and service-provider-company relationships.

We would like to explore how your organization could support selected startups through grants, market access, service credits, or expert clinics.

Proposed next step: a 30-minute coordination call to identify the strongest linkage opportunities.

Best,
[Programme Coordinator]`,
    },
    {
      title: `${programmeName} Application Requirements`,
      type: "application-requirements",
      markdown: `# Application Requirements

## Applicant Documents
${requiredDocs}

## Founder Inputs
- Company profile.
- Founder background.
- Support needs.
- Target markets.
- Current traction.

## AI Review Transparency
Applicants should be told that AI may assist with fit scoring and support pathway recommendations, while final decisions remain with programme coordinators.`,
    },
  ];
}

function buildFallbackPack(programme: ProgrammeProfile): EcosystemPack {
  const isGrant = programme.type === "grant";
  const hasRegionalMarkets = programme.targetMarkets.some((market) =>
    ["Singapore", "Indonesia", "Thailand", "Vietnam", "Philippines"].includes(market)
  );
  const technicalIndustries = programme.targetIndustries.some((industry) =>
    ["AI/ML", "SaaS", "Fintech", "Healthtech"].includes(industry)
  );

  const rankedGrants = seedEcosystemEntities
    .filter((entity) => entity.type === "grant" || entity.focusAreas.some((area) => area.toLowerCase().includes("grant")))
    .map((entity) => ({ entity, score: isGrant ? Math.max(entityScore(entity, programme), 88) : entityScore(entity, programme) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const rankedServiceProviders = seedEcosystemEntities
    .filter((entity) => entity.type === "service-provider")
    .map((entity) => ({ entity, score: entityScore(entity, programme) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const rankedInitiatives = seedEcosystemEntities
    .filter((entity) => entity.type === "initiative")
    .map((entity) => ({ entity, score: entityScore(entity, programme) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const recommendedGrants: GrantRecommendation[] = rankedGrants.map(({ entity, score }) => ({
    name: entity.name,
    provider: entity.organizationName ?? "Ecosystem grant partner",
    fitScore: score,
    rationale: `${entity.description} This is relevant to ${programme.name} because the programme targets ${labelList(
      programme.targetIndustries,
      "priority sectors"
    )} in ${labelList(programme.targetMarkets, "Malaysia and Southeast Asia")}.`,
    eligibilityNotes: [
      "Confirm geography, company registration, and founder eligibility before referral.",
      "Prepare use-of-funds, traction evidence, and outcome metrics before sending to the grant owner.",
    ],
  }));

  const recommendedServiceProviders: ServiceProviderRecommendation[] = rankedServiceProviders.map(({ entity, score }) => ({
    name: entity.name,
    category: inferProviderCategory(entity),
    fitScore: score,
    rationale: entity.description,
    suggestedUse:
      inferProviderCategory(entity) === "market-access"
        ? "Route market-ready startups into pilot discovery or partner introduction sessions."
        : "Use this provider as a reusable support pathway for accepted startups with matching needs.",
  }));

  const recommendedPartnerLinkages: PartnerLinkageRecommendation[] = [
    ...rankedInitiatives.map(({ entity, score }) => ({
      source: programme.name,
      target: entity.name,
      linkageType: "programme-initiative",
      fitScore: hasRegionalMarkets ? Math.max(score, 84) : score,
      rationale: `The programme can reuse ${entity.name} as a structured pathway for startups that match its focus areas.`,
      reusableSignals: entity.focusAreas.slice(0, 3),
    })),
    ...rankedServiceProviders.slice(0, 2).map(({ entity, score }) => ({
      source: entity.name,
      target: "Accepted startups",
      linkageType: "service-provider-company",
      fitScore: technicalIndustries ? Math.max(score, 82) : score,
      rationale: `${entity.name} can be attached to multiple startups as a reusable support linkage instead of a one-off referral.`,
      reusableSignals: entity.focusAreas.slice(0, 3),
    })),
  ];

  return {
    summary:
      "Generated a local ecosystem pack covering grant pathways, service-provider support, partner linkages, and export-ready coordination documents.",
    recommendedGrants,
    recommendedServiceProviders,
    recommendedPartnerLinkages,
    draftDocuments: buildMarkdownDocuments(programme),
    fallbackUsed: true,
  };
}

function normalizePack(parsed: unknown, fallback: EcosystemPack): EcosystemPack {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return fallback;
  const p = parsed as Record<string, unknown>;

  const recommendedGrants = Array.isArray(p.recommendedGrants)
    ? p.recommendedGrants.slice(0, 4).map((item) => {
        const g = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
        return {
          name: typeof g.name === "string" ? g.name : "Recommended grant pathway",
          provider: typeof g.provider === "string" ? g.provider : "Ecosystem partner",
          fitScore: clamp(g.fitScore),
          rationale: typeof g.rationale === "string" ? g.rationale : "Relevant to programme goals.",
          eligibilityNotes: asStringArray(g.eligibilityNotes),
        };
      })
    : fallback.recommendedGrants;

  const recommendedServiceProviders = Array.isArray(p.recommendedServiceProviders)
    ? p.recommendedServiceProviders.slice(0, 5).map((item) => {
        const s = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
        const category: ServiceProviderCategory =
          s.category === "cloud" ||
          s.category === "legal" ||
          s.category === "market-access" ||
          s.category === "finance" ||
          s.category === "technical"
            ? s.category
            : "technical";
        return {
          name: typeof s.name === "string" ? s.name : "Recommended service provider",
          category,
          fitScore: clamp(s.fitScore),
          rationale: typeof s.rationale === "string" ? s.rationale : "Relevant to startup support needs.",
          suggestedUse: typeof s.suggestedUse === "string" ? s.suggestedUse : "Use as a support pathway for accepted startups.",
        };
      })
    : fallback.recommendedServiceProviders;

  const recommendedPartnerLinkages = Array.isArray(p.recommendedPartnerLinkages)
    ? p.recommendedPartnerLinkages.slice(0, 5).map((item) => {
        const l = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
        return {
          source: typeof l.source === "string" ? l.source : "Programme",
          target: typeof l.target === "string" ? l.target : "Ecosystem partner",
          linkageType: typeof l.linkageType === "string" ? l.linkageType : "programme-initiative",
          fitScore: clamp(l.fitScore),
          rationale: typeof l.rationale === "string" ? l.rationale : "Reusable ecosystem linkage.",
          reusableSignals: asStringArray(l.reusableSignals),
        };
      })
    : fallback.recommendedPartnerLinkages;

  const draftDocuments = Array.isArray(p.draftDocuments)
    ? p.draftDocuments.slice(0, 6).map((item) => {
        const d = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
        const type: DraftDocumentType =
          d.type === "programme-brief" ||
          d.type === "grant-readiness" ||
          d.type === "partner-outreach" ||
          d.type === "service-provider-scope" ||
          d.type === "application-requirements"
            ? d.type
            : "programme-brief";
        return {
          title: typeof d.title === "string" ? d.title : "Draft document",
          type,
          markdown: typeof d.markdown === "string" && d.markdown.trim() ? d.markdown : "# Draft document\n\nGenerated draft.",
        };
      })
    : fallback.draftDocuments;

  return {
    summary: typeof p.summary === "string" ? p.summary : fallback.summary,
    recommendedGrants,
    recommendedServiceProviders,
    recommendedPartnerLinkages,
    draftDocuments,
    fallbackUsed: false,
  };
}

function buildPrompt(programme: ProgrammeProfile): string {
  return `You are an ecosystem programme architect for Southeast Asian innovation programmes.

Create an ecosystem linkage pack for this programme. Recommend grants, service providers, partner linkages, and draft export-ready documents.

Programme:
${JSON.stringify(programme, null, 2)}

Available ecosystem entities:
${JSON.stringify(seedEcosystemEntities, null, 2)}

Existing reusable linkage examples:
${JSON.stringify(seedEcosystemLinkages, null, 2)}

Return ONLY valid JSON with exactly this shape:
{
  "summary": "string",
  "recommendedGrants": [
    {
      "name": "string",
      "provider": "string",
      "fitScore": 0-100,
      "rationale": "string",
      "eligibilityNotes": ["string"]
    }
  ],
  "recommendedServiceProviders": [
    {
      "name": "string",
      "category": "cloud" | "legal" | "market-access" | "finance" | "technical",
      "fitScore": 0-100,
      "rationale": "string",
      "suggestedUse": "string"
    }
  ],
  "recommendedPartnerLinkages": [
    {
      "source": "string",
      "target": "string",
      "linkageType": "string",
      "fitScore": 0-100,
      "rationale": "string",
      "reusableSignals": ["string"]
    }
  ],
  "draftDocuments": [
    {
      "title": "string",
      "type": "programme-brief" | "grant-readiness" | "partner-outreach" | "service-provider-scope" | "application-requirements",
      "markdown": "full Markdown document"
    }
  ]
}

Rules:
- Draft at least four documents.
- Keep documents operational and ready to export.
- Evaluate only professional and business criteria; do not assess race, religion, or royalty.
- Do not invent personal data.
- Prefer reusable ecosystem linkages over one-off assignments.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }

  const programme = normalizeProgramme((body as Record<string, unknown>).programme);
  if (!programme) {
    return NextResponse.json({ error: "programme is required" }, { status: 400 });
  }

  const fallback = buildFallbackPack(programme);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash-preview" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: buildPrompt(programme) }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return NextResponse.json(fallback);
    }

    return NextResponse.json(normalizePack(parsed, fallback));
  } catch (error) {
    console.error("programme-ecosystem-pack: Gemini call failed", error);
    return NextResponse.json(fallback);
  }
}
