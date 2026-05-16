"use client";

import { useState } from "react";
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

function getStatusStyle(status: ApplicationStatus): React.CSSProperties {
  switch (status) {
    case "approved":
      return {
        color: "var(--status-healthy)",
        backgroundColor: "var(--status-healthy-bg)",
        borderColor: "var(--status-healthy)",
      };
    case "shortlisted":
      return {
        color: "var(--status-risk)",
        backgroundColor: "var(--status-risk-bg)",
        borderColor: "var(--status-risk)",
      };
    case "waitlisted":
      return {
        color: "var(--status-risk)",
        backgroundColor: "var(--status-risk-bg)",
        borderColor: "var(--status-risk)",
      };
    case "declined":
      return {
        color: "var(--status-critical)",
        backgroundColor: "var(--status-critical-bg)",
        borderColor: "var(--status-critical)",
      };
    default:
      return {
        color: "var(--status-ai)",
        backgroundColor: "var(--muted)",
        borderColor: "var(--border)",
      };
  }
}

function getRecommendationColor(rec: Application["aiRecommendation"]): string {
  if (rec === "approve") return "var(--status-healthy)";
  if (rec === "decline") return "var(--status-critical)";
  return "var(--status-risk)";
}

// Future Firestore action boundary: replace local state update with PATCH /api/applications/[applicationId]/decision
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
  const [applications, setApplications] =
    useState<Application[]>(seedApplications);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    seedApplications[0]?.id ?? null
  );
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const companyMap = new Map<string, Company>(
    seedCompanies.map((c) => [c.id, c])
  );

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
      if (c) {
        approvedCompanies.push(c);
        seenIds.add(app.companyId);
      }
    }
  }

  function handleDecision(applicationId: string, status: ApplicationStatus) {
    setApplications((prev) => applyLocalDecision(prev, applicationId, status));
  }

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading applicant pool...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--status-critical)" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-6">
      {approvedCompanies.length > 0 && (
        <div className="mb-4 border border-border rounded bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Approved for matching ({approvedCompanies.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {approvedCompanies.map((company) => (
              <span
                key={company.id}
                className="inline-flex items-center text-[10px] font-medium border rounded px-2 py-0.5"
                style={{
                  color: "var(--status-healthy)",
                  backgroundColor: "var(--status-healthy-bg)",
                  borderColor: "var(--status-healthy)",
                }}
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-border">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "all"
              ? applications.length
              : applications.filter((a) => a.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeFilter === value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <div className="w-72 shrink-0 border border-border rounded overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No applicants match this filter.
            </div>
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
                      className={`w-full text-left px-3 py-3 transition-colors ${
                        isSelected ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {company?.name ?? app.companyId}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {app.founderContactEmail}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-medium border rounded px-1.5 py-0.5 shrink-0"
                          style={statusStyle}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {app.fitScore} · {app.fitLabel}
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{
                            color: getRecommendationColor(app.aiRecommendation),
                          }}
                        >
                          AI: {app.aiRecommendation}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected ? (
          <div className="flex-1 min-w-0 border border-border rounded overflow-hidden">
            <div className="border-b border-border px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">
                  {selectedCompany?.name ?? selected.companyId}
                </h2>
                {selectedCompany && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCompany.industry.join(", ")} &middot;{" "}
                    {selectedCompany.stage} &middot; {selectedCompany.city},{" "}
                    {selectedCompany.country}
                  </p>
                )}
              </div>
              <span
                className="text-xs font-medium border rounded px-2 py-1 shrink-0"
                style={getStatusStyle(selected.status)}
              >
                {selected.status}
              </span>
            </div>

            <div className="px-5 py-3 border-b border-border flex gap-2 flex-wrap">
              <button
                onClick={() => handleDecision(selected.id, "approved")}
                disabled={selected.status === "approved"}
                className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: "var(--status-healthy)",
                  borderColor: "var(--status-healthy)",
                  backgroundColor:
                    selected.status === "approved"
                      ? "var(--status-healthy-bg)"
                      : "transparent",
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(selected.id, "shortlisted")}
                disabled={selected.status === "shortlisted"}
                className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: "var(--status-risk)",
                  borderColor: "var(--status-risk)",
                  backgroundColor:
                    selected.status === "shortlisted"
                      ? "var(--status-risk-bg)"
                      : "transparent",
                }}
              >
                Shortlist
              </button>
              <button
                onClick={() => handleDecision(selected.id, "waitlisted")}
                disabled={selected.status === "waitlisted"}
                className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: "var(--status-risk)",
                  borderColor: "var(--status-risk)",
                  backgroundColor:
                    selected.status === "waitlisted"
                      ? "var(--status-risk-bg)"
                      : "transparent",
                }}
              >
                Waitlist
              </button>
              <button
                onClick={() => handleDecision(selected.id, "declined")}
                disabled={selected.status === "declined"}
                className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: "var(--status-critical)",
                  borderColor: "var(--status-critical)",
                  backgroundColor:
                    selected.status === "declined"
                      ? "var(--status-critical-bg)"
                      : "transparent",
                }}
              >
                Decline
              </button>
            </div>

            <div className="p-5 grid grid-cols-2 gap-5">
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Company profile
                </h3>
                {selectedCompany ? (
                  <dl className="space-y-1 text-xs">
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground w-24 shrink-0">
                        Business model
                      </dt>
                      <dd>{selectedCompany.businessModel}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground w-24 shrink-0">
                        Team size
                      </dt>
                      <dd>{selectedCompany.teamSize}</dd>
                    </div>
                    {selectedCompany.revenueMonthly !== undefined && (
                      <div className="flex gap-1.5">
                        <dt className="text-muted-foreground w-24 shrink-0">
                          MRR
                        </dt>
                        <dd>
                          MYR {selectedCompany.revenueMonthly.toLocaleString()}
                        </dd>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <dt className="text-muted-foreground w-24 shrink-0">
                        Contact
                      </dt>
                      <dd className="truncate">{selected.founderContactEmail}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Company data unavailable.
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Fit score &mdash; {selected.fitScore}{" "}
                  <span className="normal-case font-normal">
                    ({selected.fitLabel})
                  </span>
                </h3>
                <dl className="space-y-1.5">
                  {(
                    [
                      ["Stage", selected.fitBreakdown.stageFit],
                      ["Industry", selected.fitBreakdown.industryFit],
                      ["Traction", selected.fitBreakdown.tractionFit],
                      ["Team", selected.fitBreakdown.teamFit],
                      ["Needs fit", selected.fitBreakdown.needsFit],
                    ] as [string, number][]
                  ).map(([label, score]) => (
                    <div key={label} className="flex items-center gap-2">
                      <dt className="text-[10px] text-muted-foreground w-16 shrink-0">
                        {label}
                      </dt>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${score}%`,
                            backgroundColor: "var(--primary)",
                          }}
                        />
                      </div>
                      <dd className="text-[10px] w-6 text-right">{score}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Founder summary
                </h3>
                <p className="text-xs">{selected.founderSummary}</p>
                {selectedCompany?.founderBackground && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCompany.founderBackground}
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  AI insight
                </h3>
                <p className="text-xs">{selected.aiInsight}</p>
                <p
                  className="text-[10px] font-medium mt-1"
                  style={{
                    color: getRecommendationColor(selected.aiRecommendation),
                  }}
                >
                  Recommendation: {selected.aiRecommendation}
                </p>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Support needs
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.supportNeeds.map((need) => (
                    <span
                      key={need}
                      className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Eligibility flags
                </h3>
                {selected.eligibilityFlags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No flags</p>
                ) : (
                  <ul className="space-y-1">
                    {selected.eligibilityFlags.map((flag) => (
                      <li
                        key={flag}
                        className="text-xs flex items-center gap-1.5"
                        style={{ color: "var(--status-risk)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--status-risk)" }}
                        />
                        {flag}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {Object.keys(selected.documentUrls).length > 0 && (
              <div className="px-5 pb-5">
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Documents
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selected.documentUrls).map(
                    ([docType, url]) => (
                      <span
                        key={docType}
                        className="text-[10px] bg-muted border border-border rounded px-2 py-1 font-mono text-muted-foreground"
                      >
                        {docType}
                        <span className="ml-1 opacity-50">
                          {url.replace("seed://documents/", "")}
                        </span>
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 border border-border rounded p-5 text-sm text-muted-foreground">
            Select an applicant to view details.
          </div>
        )}
      </div>
    </div>
  );
}
