"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application, ApplicationStatus, Company } from "@/lib/types";
import { seedApplications, seedCompanies } from "@/lib/verrier-seed";

function ApplicantPoolSkeleton() {
  return (
    <div className="flex gap-6" style={{ height: 640 }}>
      {/* Left skeleton */}
      <div className="w-[380px] shrink-0 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      {/* Right skeleton */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex gap-4 items-center">
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6 flex-1">
          <div className="space-y-4 col-span-1">
            <Skeleton className="h-3 w-32" />
            <div className="space-y-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex gap-2 items-center">
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 col-span-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

type Filter = ApplicationStatus | "all";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Approved", value: "approved" },
  { label: "Waitlisted", value: "waitlisted" },
  { label: "Declined", value: "declined" },
];

const DECISION_LABELS: Record<ApplicationStatus, string> = {
  approved: "Approve",
  shortlisted: "Shortlist",
  waitlisted: "Waitlist",
  declined: "Decline",
  submitted: "Submit",
  draft: "Draft",
};

function getStatusStyle(status: ApplicationStatus): { color: string; bg: string } {
  switch (status) {
    case "approved":
      return { color: "var(--status-healthy)", bg: "var(--status-healthy-bg)" };
    case "shortlisted":
      return { color: "var(--status-risk)", bg: "var(--status-risk-bg)" };
    case "waitlisted":
      return { color: "var(--status-risk)", bg: "var(--status-risk-bg)" };
    case "declined":
      return { color: "var(--status-critical)", bg: "var(--status-critical-bg)" };
    default:
      return { color: "var(--status-ai)", bg: "rgba(124,58,237,0.08)" };
  }
}

function getRecommendationColor(rec: Application["aiRecommendation"]): string {
  if (rec === "approve") return "var(--status-healthy)";
  if (rec === "decline") return "var(--status-critical)";
  return "var(--status-risk)";
}

function applyLocalDecision(
  applications: Application[],
  applicationId: string,
  status: ApplicationStatus
): Application[] {
  return applications.map((app) =>
    app.id === applicationId ? { ...app, status } : app
  );
}

export function ApplicantReviewPool() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(seedApplications[0]?.id ?? null);
  const [isScoring, setIsScoring] = useState(false);
  const [lastApprovedId, setLastApprovedId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{
    applicationId: string;
    status: ApplicationStatus;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const companyMap = new Map<string, Company>(seedCompanies.map((c) => [c.id, c]));

  const filtered = applications.filter(
    (app) => activeFilter === "all" || app.status === activeFilter
  );

  const selected = applications.find((app) => app.id === selectedId) ?? null;
  const selectedCompany = selected ? companyMap.get(selected.companyId) : null;

  function applyDecision(applicationId: string, status: ApplicationStatus) {
    setApplications((prev) => applyLocalDecision(prev, applicationId, status));
    if (status === "approved") setLastApprovedId(applicationId);
    toast.success(`Applicant marked as ${status}.`);
  }

  function handleDecision(applicationId: string, status: ApplicationStatus) {
    if (status === "approved" || status === "declined") {
      setPendingDecision({ applicationId, status });
      return;
    }
    applyDecision(applicationId, status);
  }

  return (
    <div className="px-8 py-8 space-y-6 max-w-full">
      {/* Page header + filter tabs */}
      <div className="space-y-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Applicant Review Pool</h1>
            <p className="text-xs text-muted-foreground mt-1">{applications.length} total applications</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-end gap-0 border-b border-border overflow-x-auto">
          {FILTERS.map(({ label, value }) => {
            const count =
              value === "all"
                ? applications.length
                : applications.filter((a) => a.status === value).length;
            const isActive = activeFilter === value;
            return (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {label}{" "}
                <span className={isActive ? "opacity-60" : "opacity-40"}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split panel */}
      {!mounted ? (
        <ApplicantPoolSkeleton />
      ) : (
        <div className="flex gap-6 min-h-0">
          {/* List panel */}
          <div className="w-[380px] shrink-0 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {filtered.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-foreground">No applicants match this filter</p>
                <p className="text-xs text-muted-foreground">Change or clear the filter to see more applications.</p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              filtered.map((app) => {
                const company = companyMap.get(app.companyId);
                const isSelected = app.id === selectedId;
                const style = getStatusStyle(app.status);
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      if (selectedId !== app.id) {
                        setIsScoring(true);
                        setSelectedId(app.id);
                        setTimeout(() => setIsScoring(false), 1500);
                      }
                    }}
                    className={`w-full text-left rounded-xl transition-all duration-150 ${
                      isSelected
                        ? "bg-card border-y border-r border-border border-l-4 shadow-sm rounded-l-none"
                        : "bg-card border border-border hover:bg-muted/30"
                    }`}
                    style={isSelected ? { borderLeftColor: "var(--primary)" } : undefined}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-medium capitalize"
                          style={{ color: style.color, background: style.bg }}
                        >
                          {app.status}
                        </span>
                        <div className="text-right">
                          <p
                            className="text-base font-semibold leading-none"
                            style={{ color: isSelected ? "var(--primary)" : undefined }}
                          >
                            {app.fitScore}
                          </p>
                          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                            Fit Score
                          </p>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1 text-left leading-tight">
                        {company?.name ?? app.companyId}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 text-left leading-relaxed mb-4">
                        {app.founderSummary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                          {company?.stage ?? "—"}
                          {company?.industry?.[0] ? ` · ${company.industry[0]}` : ""}
                        </span>
                        <span
                          className="text-[11px] font-semibold capitalize"
                          style={{ color: getRecommendationColor(app.aiRecommendation) }}
                        >
                          {app.aiRecommendation}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
              
              {/* Simulated AI Loading Overlay */}
              {isScoring && (
                <div className="absolute inset-0 z-10 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="bg-background border border-[var(--status-ai)]/30 shadow-xl rounded-2xl p-8 flex flex-col items-center w-80 max-w-full space-y-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--status-ai)]/10 flex items-center justify-center animate-pulse">
                      <span className="text-xl">✦</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground mb-1">AI analyzing applicant...</p>
                      <p className="text-xs text-muted-foreground">Evaluating fit across 5 dimensions.</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="h-full w-full ai-loading-scan" />
                    </div>
                  </div>
                </div>
              )}

              {/* Detail header */}
              <div className="px-8 py-6 border-b border-border flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "rgba(243,100,88,0.1)", color: "var(--primary)" }}
                  >
                    {(selectedCompany?.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                      {selectedCompany?.name ?? selected.companyId}
                    </h2>
                    {selectedCompany && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selectedCompany.industry.join(", ")} · {selectedCompany.city},{" "}
                        {selectedCompany.country}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize shrink-0"
                  style={{
                    color: getStatusStyle(selected.status).color,
                    background: getStatusStyle(selected.status).bg,
                  }}
                >
                  {selected.status}
                </span>
              </div>

              {/* Approved banner */}
              {lastApprovedId === selected.id && (
                <div
                  className="mx-6 mt-4 flex items-center justify-between text-sm px-4 py-2.5 rounded-xl"
                  style={{
                    background: "var(--status-healthy-bg)",
                    color: "var(--status-healthy)",
                  }}
                >
                  <span className="font-medium">✓ Approved — ready for mentor matching</span>
                  <button
                    onClick={() => router.push("/matching")}
                    className="font-semibold underline underline-offset-2 ml-4"
                  >
                    Go to Matching →
                  </button>
                </div>
              )}

              {/* Decision bar */}
              <div className="border-b border-border px-8 py-4 flex gap-3 flex-wrap">
                {(["approved", "shortlisted", "waitlisted", "declined"] as ApplicationStatus[]).map(
                  (action) => {
                    const s = getStatusStyle(action);
                    const isCurrent = selected.status === action;
                    return (
                      <button
                        key={action}
                        onClick={() => handleDecision(selected.id, action)}
                        disabled={isCurrent}
                        className="px-5 py-2 text-xs font-semibold rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          color: s.color,
                          borderColor: s.color,
                          background: isCurrent ? s.bg : "transparent",
                        }}
                      >
                        {DECISION_LABELS[action]}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Content: main (8/12) + sidebar (4/12) */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8 grid grid-cols-12 gap-8">
                  {/* Main column */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    {/* Fit score breakdown */}
                    <section>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                        Fit Score Breakdown
                      </h3>
                      <div className="grid grid-cols-2 gap-5 bg-muted/50 p-5 rounded-xl border border-border">
                        {(
                          [
                            ["Stage", selected.fitBreakdown.stageFit],
                            ["Industry", selected.fitBreakdown.industryFit],
                            ["Traction", selected.fitBreakdown.tractionFit],
                            ["Team", selected.fitBreakdown.teamFit],
                            ["Needs", selected.fitBreakdown.needsFit],
                          ] as [string, number][]
                        ).map(([label, score]) => (
                          <div key={label}>
                            <div className="flex justify-between mb-1.5">
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="text-xs font-bold text-foreground">{score}%</p>
                            </div>
                            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${score}%`, background: "var(--primary)" }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="col-span-2 flex items-center gap-3 pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">Overall</span>
                          <span className="text-xl font-bold text-foreground">{selected.fitScore}</span>
                          <span className="text-xs text-muted-foreground capitalize">— {selected.fitLabel}</span>
                        </div>
                      </div>
                    </section>

                    {/* Company profile */}
                    <section>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                        Company Profile
                      </h3>
                      {selectedCompany ? (
                        <div className="space-y-4">
                          <p className="text-sm text-foreground leading-relaxed">
                            {selected.founderSummary}
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              ["Business model", selectedCompany.businessModel],
                              ["Team size", String(selectedCompany.teamSize)],
                              ...(selectedCompany.revenueMonthly !== undefined
                                ? [["MRR", `MYR ${selectedCompany.revenueMonthly.toLocaleString()}`]]
                                : []),
                              ["Contact", selected.founderContactEmail],
                            ].map(([label, value]) => (
                              <div key={label} className="p-3 border border-border rounded-lg">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                                  {label}
                                </p>
                                <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Company data unavailable.</p>
                      )}
                    </section>

                    {/* Support needs */}
                    <section>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                        Support Needs
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.supportNeeds.map((need) => (
                          <span
                            key={need}
                            className="px-4 py-2 bg-muted border border-border rounded-lg text-xs text-foreground"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Founder background */}
                    {selectedCompany?.founderBackground && (
                      <section>
                        <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                          Founder Background
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedCompany.founderBackground}
                        </p>
                      </section>
                    )}

                    {/* Documents */}
                    {Object.keys(selected.documentUrls).length > 0 && (
                      <section>
                        <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                          Documents
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selected.documentUrls).map(([docType, url]) => (
                            <span
                              key={docType}
                              className="text-xs font-mono bg-muted border border-border rounded-lg px-3 py-1.5 text-muted-foreground"
                            >
                              {docType}
                              <span className="ml-1 opacity-50">
                                {url.replace("seed://documents/", "")}
                              </span>
                            </span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Sidebar column */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                    {/* AI Insight panel */}
                    <div
                      className="rounded-2xl p-5 border"
                      style={{
                        background: "rgba(124,58,237,0.04)",
                        borderColor: "rgba(124,58,237,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: "var(--status-ai)", color: "#ffffff" }}
                        >
                          ✦ AI INSIGHT
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 capitalize">
                        Recommendation: {selected.aiRecommendation}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">
                        &ldquo;{selected.aiInsight}&rdquo;
                      </p>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          background: "rgba(124,58,237,0.06)",
                          border: "1px solid rgba(124,58,237,0.1)",
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: "var(--status-ai)" }}
                        >
                          → {selected.aiRecommendation}
                        </p>
                        <p
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: getRecommendationColor(selected.aiRecommendation) }}
                        >
                          {selected.fitLabel}
                        </p>
                      </div>
                    </div>

                    {/* Eligibility flags */}
                    <div className="bg-muted rounded-2xl p-5 border border-border">
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                        Eligibility Flags
                      </h3>
                      {selected.eligibilityFlags.length === 0 ? (
                        <div className="flex items-start gap-3">
                          <span
                            className="text-base mt-0.5 shrink-0"
                            style={{ color: "var(--status-healthy)" }}
                          >
                            ✓
                          </span>
                          <p className="text-sm font-medium text-foreground">No eligibility flags</p>
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {selected.eligibilityFlags.map((flag) => (
                            <li key={flag} className="flex items-start gap-3">
                              <span
                                className="text-base mt-0.5 shrink-0"
                                style={{ color: "var(--status-risk)" }}
                              >
                                ⚠
                              </span>
                              <p className="text-sm text-foreground">{flag}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-card border border-border rounded-2xl flex items-center justify-center text-center p-8">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Select an applicant</p>
                <p className="text-xs text-muted-foreground">
                  Choose a startup from the review queue to inspect fit score, documents, and AI recommendation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDecision}
        title={
          pendingDecision?.status === "approved"
            ? "Approve this applicant?"
            : "Decline this applicant?"
        }
        description={
          pendingDecision?.status === "approved"
            ? "Approved applicants become eligible for mentor matching in the coordinator workflow."
            : "Declined applicants will be removed from the active review path."
        }
        confirmLabel={pendingDecision ? DECISION_LABELS[pendingDecision.status] : "Confirm"}
        destructive={pendingDecision?.status === "declined"}
        onCancel={() => setPendingDecision(null)}
        onConfirm={() => {
          if (!pendingDecision) return;
          applyDecision(pendingDecision.applicationId, pendingDecision.status);
          setPendingDecision(null);
        }}
      >
        {pendingDecision && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span>Applicant</span>
              <span className="font-medium text-foreground">
                {companyMap.get(
                  applications.find((app) => app.id === pendingDecision.applicationId)?.companyId ?? ""
                )?.name ?? pendingDecision.applicationId}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span>Decision</span>
              <span className="font-medium capitalize text-foreground">{pendingDecision.status}</span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
