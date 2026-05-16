"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StateBlock } from "@/components/ui/state-block";
import type { Application, ApplicationStatus, Company } from "@/lib/types";
import { seedApplications, seedCompanies } from "@/lib/verrier-seed";

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
      return { color: "var(--status-ai)", bg: "var(--muted)" };
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
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [lastApprovedId, setLastApprovedId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{
    applicationId: string;
    status: ApplicationStatus;
  } | null>(null);

  const companyMap = new Map<string, Company>(seedCompanies.map((c) => [c.id, c]));

  const filtered = applications.filter(
    (app) => activeFilter === "all" || app.status === activeFilter
  );

  const selected = applications.find((app) => app.id === selectedId) ?? null;
  const selectedCompany = selected ? companyMap.get(selected.companyId) : null;

  const approvedApps = applications.filter((app) => app.status === "approved");
  const approvedCompanies: Company[] = [];
  const seenIds = new Set<string>();
  for (const app of approvedApps) {
    if (!seenIds.has(app.companyId)) {
      const c = companyMap.get(app.companyId);
      if (c) { approvedCompanies.push(c); seenIds.add(app.companyId); }
    }
  }

  function applyDecision(applicationId: string, status: ApplicationStatus) {
    setApplications((prev) => applyLocalDecision(prev, applicationId, status));
    if (status === "approved") {
      setLastApprovedId(applicationId);
    }
    toast.success(`Applicant marked as ${status}.`);
  }

  function handleDecision(applicationId: string, status: ApplicationStatus) {
    if (status === "approved" || status === "declined") {
      setPendingDecision({ applicationId, status });
      return;
    }

    applyDecision(applicationId, status);
  }

  if (isLoading) {
    return <div className="px-6 md:px-10 py-8 text-sm text-muted-foreground">Loading applicant pool…</div>;
  }

  if (error) {
    return (
      <div className="px-6 md:px-10 py-8 text-sm" style={{ color: "var(--status-critical)" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Applicant Review Pool</h1>
          <p className="text-xs text-muted-foreground mt-1">{applications.length} total applications</p>
        </div>
        <Link
          href="/programs/new"
          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          + New Programme
        </Link>
      </div>

      {/* Approved companies strip */}
      {approvedCompanies.length > 0 && (
        <div className="bg-card border border-border rounded-xl px-5 py-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">
            Approved for Matching ({approvedCompanies.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {approvedCompanies.map((company) => (
              <span
                key={company.id}
                className="inline-flex items-center text-[10px] font-medium rounded-full px-2.5 py-1"
                style={{ color: "var(--status-healthy)", background: "var(--status-healthy-bg)" }}
              >
                ✓ {company.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-border">
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
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-[#f36458] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              <span className={`ml-1.5 ${isActive ? "opacity-60" : "opacity-40"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Split panel */}
      <div className="flex gap-5">
        {/* List */}
        <div className="w-64 shrink-0 bg-card border border-border rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <StateBlock
              className="m-4"
              title="No applicants match this filter"
              description="Clear or change the current review filter to see more applications."
              action={
                <button
                  onClick={() => setActiveFilter("all")}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filter
                </button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((app) => {
                const company = companyMap.get(app.companyId);
                const isSelected = app.id === selectedId;
                const statusStyle = getStatusStyle(app.status);
                return (
                  <li key={app.id}>
                    <button
                      onClick={() => setSelectedId(app.id)}
                      className={`w-full text-left px-4 py-3.5 transition-colors ${
                        isSelected ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {company?.name ?? app.companyId}
                        </p>
                        <span
                          className="text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0"
                          style={{ color: statusStyle.color, background: statusStyle.bg }}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {app.founderContactEmail}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${app.fitScore}%`, backgroundColor: "var(--primary)" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {app.fitScore}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-medium capitalize"
                          style={{ color: getRecommendationColor(app.aiRecommendation) }}
                        >
                          {app.aiRecommendation}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="flex-1 min-w-0 bg-card border border-border rounded-xl overflow-hidden">
            {/* Panel header */}
            <div className="border-b border-border px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedCompany?.name ?? selected.companyId}
                </h2>
                {selectedCompany && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCompany.industry.join(", ")} · {selectedCompany.stage} · {selectedCompany.city}, {selectedCompany.country}
                  </p>
                )}
              </div>
              <span
                className="text-xs font-medium rounded-full px-3 py-1 shrink-0"
                style={{ color: getStatusStyle(selected.status).color, background: getStatusStyle(selected.status).bg }}
              >
                {selected.status}
              </span>
            </div>
            {lastApprovedId === selected.id && (
              <div className="mx-6 mt-3 flex items-center justify-between bg-[var(--status-healthy-bg)] text-[var(--status-healthy)] text-xs px-3 py-2 rounded-lg">
                <span>✓ Approved — ready for mentor matching</span>
                <button
                  onClick={() => router.push("/matching")}
                  className="font-medium underline underline-offset-2"
                >
                  Go to Matching →
                </button>
              </div>
            )}

            {/* Decision actions */}
            <div className="border-b border-border px-6 py-3 flex gap-2 flex-wrap">
              {(["approved", "shortlisted", "waitlisted", "declined"] as ApplicationStatus[]).map((action) => {
                const style = getStatusStyle(action);
                const isCurrentStatus = selected.status === action;
                return (
                  <button
                    key={action}
                    onClick={() => handleDecision(selected.id, action)}
                    disabled={isCurrentStatus}
                    className="px-4 py-1.5 text-xs font-semibold rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: style.color,
                      borderColor: style.color,
                      background: isCurrentStatus ? style.bg : "transparent",
                  }}
                >
                    {DECISION_LABELS[action]}
                  </button>
                );
              })}
            </div>

            {/* Content grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Company profile */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Company Profile
                </p>
                {selectedCompany ? (
                  <dl className="space-y-2 text-xs">
                    {[
                      ["Business model", selectedCompany.businessModel],
                      ["Team size", String(selectedCompany.teamSize)],
                      ...(selectedCompany.revenueMonthly !== undefined
                        ? [["MRR", `MYR ${selectedCompany.revenueMonthly.toLocaleString()}`]]
                        : []),
                      ["Contact", selected.founderContactEmail],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-3">
                        <dt className="text-muted-foreground w-28 shrink-0">{label}</dt>
                        <dd className="font-medium text-foreground truncate">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-xs text-muted-foreground">Company data unavailable.</p>
                )}
              </section>

              {/* Fit score */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Fit Score — <span className="text-foreground normal-case font-bold">{selected.fitScore}</span>
                  <span className="font-normal normal-case ml-1">({selected.fitLabel})</span>
                </p>
                <dl className="space-y-2">
                  {(
                    [
                      ["Stage", selected.fitBreakdown.stageFit],
                      ["Industry", selected.fitBreakdown.industryFit],
                      ["Traction", selected.fitBreakdown.tractionFit],
                      ["Team", selected.fitBreakdown.teamFit],
                      ["Needs", selected.fitBreakdown.needsFit],
                    ] as [string, number][]
                  ).map(([label, score]) => (
                    <div key={label} className="flex items-center gap-2">
                      <dt className="text-[10px] text-muted-foreground w-14 shrink-0">{label}</dt>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${score}%`, backgroundColor: "var(--primary)" }}
                        />
                      </div>
                      <dd className="text-[10px] text-muted-foreground w-6 text-right shrink-0">{score}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Founder summary */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Founder Summary
                </p>
                <p className="text-xs text-foreground leading-relaxed">{selected.founderSummary}</p>
                {selectedCompany?.founderBackground && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {selectedCompany.founderBackground}
                  </p>
                )}
              </section>

              {/* AI insight */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  AI Insight
                </p>
                <div className="rounded-md p-3" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">✦ AI</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: "var(--status-ai)" }}>
                      Insight
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">{selected.aiInsight}</p>
                  <p
                    className="text-xs font-bold mt-2 capitalize font-mono"
                    style={{ color: getRecommendationColor(selected.aiRecommendation) }}
                  >
                    → {selected.aiRecommendation}
                  </p>
                </div>
              </section>

              {/* Support needs */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Support Needs
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.supportNeeds.map((need) => (
                    <span
                      key={need}
                      className="text-[10px] bg-muted border border-border rounded-full px-2.5 py-0.5"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </section>

              {/* Eligibility flags */}
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Eligibility Flags
                </p>
                {selected.eligibilityFlags.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--status-healthy)" }}>
                    ✓ No eligibility flags
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {selected.eligibilityFlags.map((flag) => (
                      <li
                        key={flag}
                        className="flex items-start gap-1.5 text-xs"
                        style={{ color: "var(--status-risk)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "var(--status-risk)" }} />
                        {flag}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Documents */}
            {Object.keys(selected.documentUrls).length > 0 && (
              <div className="px-6 pb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.documentUrls).map(([docType, url]) => (
                    <span
                      key={docType}
                      className="text-[10px] bg-muted border border-border rounded-lg px-3 py-1.5 font-mono text-muted-foreground"
                    >
                      {docType}
                      <span className="ml-1 opacity-50">{url.replace("seed://documents/", "")}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <StateBlock
            className="flex-1"
            title="Select an applicant"
            description="Choose a startup from the review queue to inspect fit score, documents, and AI recommendation."
          />
        )}
      </div>
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
                {companyMap.get(applications.find((app) => app.id === pendingDecision.applicationId)?.companyId ?? "")?.name ??
                  pendingDecision.applicationId}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span>Decision</span>
              <span className="font-medium capitalize text-foreground">
                {pendingDecision.status}
              </span>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
