"use client";

import { useState, type ReactNode } from "react";
import type { Application, Company, Founder } from "@/lib/types";

const STAGE_OPTIONS = [
  "idea", "pre-seed", "seed", "series-a", "series-b", "growth",
] as const;

const BUSINESS_MODEL_OPTIONS = [
  "B2B", "B2C", "B2B2C", "Marketplace", "Other",
] as const;

const INDUSTRY_OPTIONS = [
  "AI/ML", "Fintech", "Healthtech", "Climate",
  "SaaS", "AgriTech", "FoodTech", "EdTech",
];

const SUPPORT_OPTIONS = [
  "Enterprise sales", "Pricing", "GTM strategy", "Fundraising",
  "Pilot design", "Hardware partnerships", "Unit economics",
  "B2B partnerships", "Technical mentorship", "Legal & compliance",
  "Product-market fit", "Marketing",
];

const DOC_FIELDS: { key: string; label: string; required: boolean }[] = [
  { key: "pitchDeck", label: "Pitch deck URL", required: true },
  { key: "companyRegistration", label: "Company registration URL", required: true },
  { key: "tractionSummary", label: "Traction summary URL", required: false },
  { key: "founderProfiles", label: "Founder profiles URL", required: false },
];

const SESSION_ISO = new Date().toISOString();

// Leverages imported Founder type to enforce name/role/background field shape
type FounderFormState = Pick<Founder, "name" | "role" | "background"> & {
  email: string;
  linkedInUrl: string;
};

// Leverages imported Company type to enforce stage and businessModel literal types
type CompanyFormState = {
  name: string;
  registrationNumber: string;
  stage: Company["stage"];
  industry: string[];
  country: string;
  city: string;
  businessModel: Company["businessModel"];
  teamSize: string;
  revenueMonthly: string;
  needsHelp: string[];
};

interface AppFormFields {
  founderContactEmail: string;
  founderSummary: string;
  supportNeeds: string[];
  documentUrls: Record<string, string>;
}

interface FitResult {
  fitScore: number;
  fitLabel: "Strong fit" | "Potential fit" | "Low fit";
  aiRecommendation: "approve" | "review" | "decline";
  aiInsight: string;
  breakdown: {
    stageFit: number;
    industryFit: number;
    tractionFit: number;
    teamFit: number;
    needsFit: number;
  };
  eligibilityFlags: string[];
  status: "scored" | "pending";
}

type FitState = "idle" | "loading" | "scored" | "pending" | "error";

interface Props {
  programId: string;
  programName: string;
  programType: string;
  programDescription: string;
  targetStages: string[];
}

function toggleArr(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function PublicApplicationForm({
  programId,
  programName,
  programType,
  programDescription,
  targetStages,
}: Props) {
  const [company, setCompany] = useState<CompanyFormState>({
    name: "",
    registrationNumber: "",
    stage: "seed",
    industry: [],
    country: "Malaysia",
    city: "",
    businessModel: "B2B",
    teamSize: "",
    revenueMonthly: "",
    needsHelp: [],
  });

  const [founder, setFounder] = useState<FounderFormState>({
    name: "",
    role: "",
    email: "",
    background: "",
    linkedInUrl: "",
  });

  const [appFields, setAppFields] = useState<AppFormFields>({
    founderContactEmail: "",
    founderSummary: "",
    supportNeeds: [],
    documentUrls: {
      pitchDeck: "",
      companyRegistration: "",
      tractionSummary: "",
      founderProfiles: "",
    },
  });

  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [fitState, setFitState] = useState<FitState>("idle");
  const [fitResult, setFitResult] = useState<FitResult | null>(null);

  const errors: string[] = [];
  if (!company.name.trim()) errors.push("Company name is required");
  if (!founder.name.trim()) errors.push("Founder name is required");
  if (!appFields.founderContactEmail.trim()) errors.push("Founder contact email is required");
  if (!appFields.founderSummary.trim()) errors.push("Founder summary is required");
  if (appFields.supportNeeds.length === 0) errors.push("At least one support need is required");
  if (!appFields.documentUrls.pitchDeck?.trim()) errors.push("Pitch deck URL is required");
  if (!appFields.documentUrls.companyRegistration?.trim()) errors.push("Company registration URL is required");

  function toggleNeed(need: string) {
    setAppFields((a) => ({ ...a, supportNeeds: toggleArr(a.supportNeeds, need) }));
    setCompany((c) => ({ ...c, needsHelp: toggleArr(c.needsHelp, need) }));
  }

  async function handleSubmit() {
    if (errors.length > 0) return;

    // Phase 1: request fit score when not yet scored
    if (fitState === "idle" || fitState === "error") {
      setFitState("loading");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => { controller.abort(); }, 10000);

      try {
        const res = await fetch("/api/ai/program-fit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            programId,
            companyProfile: {
              name: company.name,
              stage: company.stage,
              industry: company.industry,
              businessModel: company.businessModel,
              country: company.country,
              teamSize: company.teamSize ? Number(company.teamSize) : undefined,
              revenueMonthly: company.revenueMonthly
                ? Number(company.revenueMonthly)
                : undefined,
            },
            founderSummary: appFields.founderSummary,
            supportNeeds: appFields.supportNeeds,
            submittedDocumentTypes: Object.entries(appFields.documentUrls)
              .filter(([, v]) => v.trim().length > 0)
              .map(([k]) => k),
          }),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          setFitState("error");
          return;
        }

        const data = (await res.json()) as FitResult;
        setFitResult(data);
        setFitState(data.status === "pending" ? "pending" : "scored");
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        // Local fallback for timeout or network failure
        const isTimeout = err instanceof Error && err.name === "AbortError";
        const fallback: FitResult = {
          fitScore: 0,
          fitLabel: "Potential fit",
          aiRecommendation: "review",
          aiInsight: isTimeout 
            ? "Fit scoring timed out. Your application has been recorded and will be reviewed manually."
            : "Fit scoring is currently unavailable due to a network issue. Your application will be reviewed manually.",
          breakdown: {
            stageFit: 0,
            industryFit: 0,
            tractionFit: 0,
            teamFit: 0,
            needsFit: 0,
          },
          eligibilityFlags: ["scoring-fallback-active"],
          status: "pending",
        };
        setFitResult(fallback);
        setFitState("pending");
      }
      return;
    }

    // Phase 2: local submit using scored values
    if (fitState === "scored" || fitState === "pending") {
      const application: Application = {
        id: "application-draft-local",
        programId,
        companyId: "company-draft-local",
        founderContactEmail: appFields.founderContactEmail,
        status: "submitted",
        supportNeeds: appFields.supportNeeds,
        founderSummary: appFields.founderSummary,
        documentUrls: appFields.documentUrls,
        submittedAt: SESSION_ISO,
        fitScore: fitResult?.fitScore ?? 0,
        fitLabel: fitResult?.fitLabel ?? "Potential fit",
        fitBreakdown: {
          stageFit: fitResult?.breakdown.stageFit ?? 0,
          industryFit: fitResult?.breakdown.industryFit ?? 0,
          tractionFit: fitResult?.breakdown.tractionFit ?? 0,
          teamFit: fitResult?.breakdown.teamFit ?? 0,
          needsFit: fitResult?.breakdown.needsFit ?? 0,
        },
        eligibilityFlags: fitResult?.eligibilityFlags ?? [],
        aiInsight: fitResult?.aiInsight ?? "",
        aiRecommendation: fitResult?.aiRecommendation ?? "review",
        createdAt: SESSION_ISO,
        updatedAt: SESSION_ISO,
      };
      setSubmittedApp(application);
    }
  }

  const submitDisabled = errors.length > 0 || fitState === "loading";
  const submitLabel =
    fitState === "idle" || fitState === "error"
      ? "Get fit score & submit"
      : fitState === "loading"
      ? "Scoring..."
      : "Confirm & submit";

  if (submittedApp) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm border border-border rounded bg-card p-8">
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-1">{programName}</p>
            <p className="text-base font-semibold">Application submitted</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{submittedApp.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{company.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Contact</span>
              <span className="font-medium truncate">{submittedApp.founderContactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fit label</span>
              <span className="font-medium">{submittedApp.fitLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fit score</span>
              <span className="font-medium">{submittedApp.fitScore}</span>
            </div>
          </div>
          {submittedApp.aiInsight && (
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {submittedApp.aiInsight}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Application</p>
          <h1 className="text-base font-semibold">{programName}</h1>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {programType} &middot; Target stages: {targetStages.join(", ")}
          </p>
        </div>

        {/* Programme Summary */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Programme Summary
          </h2>
          <div className="border border-border rounded bg-card px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">
              {programDescription || "No description provided."}
            </p>
          </div>
        </section>

        {/* Company Profile */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Company Profile
          </h2>
          <div className="space-y-3">
            <Field label="Company name *">
              <input
                className={inputCls}
                placeholder="Registered company name"
                value={company.name}
                onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
              />
            </Field>
            <Field label="Registration number">
              <input
                className={inputCls}
                placeholder="e.g. MY-2026-001"
                value={company.registrationNumber}
                onChange={(e) => setCompany((c) => ({ ...c, registrationNumber: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stage">
                <select
                  className={inputCls}
                  value={company.stage}
                  onChange={(e) =>
                    setCompany((c) => ({ ...c, stage: e.target.value as Company["stage"] }))
                  }
                >
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Business model">
                <select
                  className={inputCls}
                  value={company.businessModel}
                  onChange={(e) =>
                    setCompany((c) => ({
                      ...c,
                      businessModel: e.target.value as Company["businessModel"],
                    }))
                  }
                >
                  {BUSINESS_MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Industries">
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <label key={ind} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={company.industry.includes(ind)}
                      onChange={() =>
                        setCompany((c) => ({ ...c, industry: toggleArr(c.industry, ind) }))
                      }
                    />
                    {ind}
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country">
                <input
                  className={inputCls}
                  value={company.country}
                  onChange={(e) => setCompany((c) => ({ ...c, country: e.target.value }))}
                />
              </Field>
              <Field label="City">
                <input
                  className={inputCls}
                  placeholder="Kuala Lumpur"
                  value={company.city}
                  onChange={(e) => setCompany((c) => ({ ...c, city: e.target.value }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Team size">
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  placeholder="0"
                  value={company.teamSize}
                  onChange={(e) => setCompany((c) => ({ ...c, teamSize: e.target.value }))}
                />
              </Field>
              <Field label="Monthly revenue (MYR)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  placeholder="0"
                  value={company.revenueMonthly}
                  onChange={(e) => setCompany((c) => ({ ...c, revenueMonthly: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Founder Profile */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Founder Profile
          </h2>
          <div className="space-y-3">
            <Field label="Full name *">
              <input
                className={inputCls}
                placeholder="Lead founder"
                value={founder.name}
                onChange={(e) => setFounder((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Role">
              <input
                className={inputCls}
                placeholder="CEO"
                value={founder.role}
                onChange={(e) => setFounder((f) => ({ ...f, role: e.target.value }))}
              />
            </Field>
            <Field label="Founder email">
              <input
                type="email"
                className={inputCls}
                value={founder.email}
                onChange={(e) => setFounder((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Background">
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Previous roles, domain expertise, and relevant experience"
                value={founder.background}
                onChange={(e) => setFounder((f) => ({ ...f, background: e.target.value }))}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className={inputCls}
                placeholder="https://linkedin.com/in/..."
                value={founder.linkedInUrl}
                onChange={(e) => setFounder((f) => ({ ...f, linkedInUrl: e.target.value }))}
              />
            </Field>
            <Field label="Contact email *">
              <input
                type="email"
                className={inputCls}
                placeholder="Primary contact for this application"
                value={appFields.founderContactEmail}
                onChange={(e) =>
                  setAppFields((a) => ({ ...a, founderContactEmail: e.target.value }))
                }
              />
            </Field>
          </div>
        </section>

        {/* Support Needs */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Support Needs
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Areas where you need programme support *
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {SUPPORT_OPTIONS.map((need) => (
                  <label key={need} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appFields.supportNeeds.includes(need)}
                      onChange={() => toggleNeed(need)}
                    />
                    {need}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Founder summary *">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="What are you building, what traction do you have, and why are you applying to this programme?"
                value={appFields.founderSummary}
                onChange={(e) =>
                  setAppFields((a) => ({ ...a, founderSummary: e.target.value }))
                }
              />
            </Field>
          </div>
        </section>

        {/* Document Metadata */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Document Metadata
          </h2>
          <div className="space-y-3">
            {DOC_FIELDS.map(({ key, label, required }) => (
              <Field key={key} label={required ? `${label} *` : label}>
                <input
                  className={inputCls}
                  placeholder="https://..."
                  value={appFields.documentUrls[key] ?? ""}
                  onChange={(e) =>
                    setAppFields((a) => ({
                      ...a,
                      documentUrls: { ...a.documentUrls, [key]: e.target.value },
                    }))
                  }
                />
              </Field>
            ))}
          </div>
        </section>

        {/* Fit Preview */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Fit Preview
          </h2>
          <div className="border border-border rounded bg-card px-4 py-4 space-y-3">
            {fitState === "idle" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fit assessment</span>
                  <span className="text-muted-foreground">Pending AI score</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recommendation</span>
                  <span className="text-muted-foreground">Ready for scoring</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click &ldquo;Get fit score &amp; submit&rdquo; to request an AI assessment before confirming.
                </p>
              </>
            )}

            {fitState === "loading" && (
              <p className="text-sm text-muted-foreground">Calculating fit score&hellip;</p>
            )}

            {fitState === "error" && (
              <p className="text-xs text-[var(--status-critical)]">
                Scoring request failed. Click the button below to retry.
              </p>
            )}

            {(fitState === "scored" || fitState === "pending") && fitResult && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fit score</span>
                  <span className="font-medium">{fitResult.fitScore} / 100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fit label</span>
                  <span className="font-medium">{fitResult.fitLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recommendation</span>
                  <span className="font-medium capitalize">{fitResult.aiRecommendation}</span>
                </div>
                {fitResult.aiInsight && (
                  <p className="text-xs text-foreground leading-relaxed border-t border-border pt-3">
                    {fitResult.aiInsight}
                  </p>
                )}
                {fitResult.eligibilityFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {fitResult.eligibilityFlags.map((flag) => (
                      <span
                        key={flag}
                        className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground"
                      >
                        {flag === "scoring-fallback-active" ? "Fallback active" : flag}
                      </span>
                    ))}
                  </div>
                )}
                {fitState === "pending" && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    {fitResult.eligibilityFlags.includes("scoring-fallback-active")
                      ? "AI scoring encountered a network issue. You may still submit; the score will be applied in the next review cycle."
                      : "AI scoring is currently unavailable. You may still submit; the score will be applied in the next review cycle."}
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* Validation messages */}
        {errors.length > 0 && (
          <div className="border border-border rounded bg-muted px-4 py-3 space-y-1">
            {errors.map((err) => (
              <p key={err} className="text-xs text-[var(--status-critical)]">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pb-10">
          <button
            onClick={() => { void handleSubmit(); }}
            disabled={submitDisabled}
            className={`px-5 py-2 rounded text-sm font-medium transition-opacity ${
              submitDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
