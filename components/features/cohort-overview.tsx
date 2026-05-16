"use client";

import { useState } from "react";
import type {
  Cohort,
  Company,
  Meeting,
  Mentor,
  Program,
  Relationship,
  TimestampLike,
} from "@/lib/types";
import {
  getHealthBand,
  getHealthBandLabel,
  getRelationshipUrgency,
  type RelationshipUrgencyLevel,
} from "@/lib/verrier-analytics";

const MILESTONE_LABELS = ["Discovery", "Alignment", "Execution", "Scaling", "Completion"];

const HEALTH_COLORS: Record<"healthy" | "at-risk" | "critical", string> = {
  healthy: "var(--status-healthy)",
  "at-risk": "var(--status-risk)",
  critical: "var(--status-critical)",
};

function urgencyLevelColor(level: RelationshipUrgencyLevel): string {
  if (level === "critical") return "var(--status-critical)";
  if (level === "stale" || level === "watch") return "var(--status-risk)";
  if (level === "healthy") return "var(--status-healthy)";
  return "";
}

function formatDate(ts: TimestampLike): string {
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  if (typeof ts === "number") return new Date(ts).toISOString().slice(0, 10);
  if (typeof ts === "object" && "seconds" in ts)
    return new Date((ts as { seconds: number }).seconds * 1000).toISOString().slice(0, 10);
  return String(ts);
}

interface CohortReport {
  narrative: string;
  keyRisks: string[];
  recommendedActions: string[];
  generatedAt: string;
}

interface CohortOverviewProps {
  cohort: Cohort;
  program: Program;
  relationships: Relationship[];
  companies: Company[];
  mentors: Mentor[];
  meetings: Meeting[];
}

export function CohortOverview({
  cohort,
  relationships,
  companies,
  mentors,
  meetings,
}: CohortOverviewProps) {
  const [reportStatus, setReportStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [report, setReport] = useState<CohortReport | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "fallback">("idle");
  const [copyText, setCopyText] = useState("");

  const companyMap = new Map(companies.map((c) => [c.id, c]));

  const relWithMeta = relationships.map((r) => ({
    relationship: r,
    company: companyMap.get(r.companyId),
    urgency: getRelationshipUrgency(r, meetings),
    band: getHealthBand(r.healthScore),
  }));

  const totalRelationships = relationships.length;
  const activeCount = relationships.filter((r) => r.status === "active").length;
  const avgHealthScore =
    totalRelationships > 0
      ? Math.round(relationships.reduce((sum, r) => sum + r.healthScore, 0) / totalRelationships)
      : 0;
  const healthyCount = relWithMeta.filter((x) => x.band === "healthy").length;
  const atRiskCount = relWithMeta.filter((x) => x.band === "at-risk").length;
  const criticalCount = relWithMeta.filter((x) => x.band === "critical").length;
  const staleCount = relWithMeta.filter((x) => x.urgency.level === "stale").length;
  const totalMeetings = meetings.length;

  const heatmap = [...relWithMeta].sort((a, b) => {
    if (a.urgency.priority !== b.urgency.priority) return a.urgency.priority - b.urgency.priority;
    if (b.urgency.daysSinceLastMeeting !== a.urgency.daysSinceLastMeeting)
      return b.urgency.daysSinceLastMeeting - a.urgency.daysSinceLastMeeting;
    if (a.relationship.healthScore !== b.relationship.healthScore)
      return a.relationship.healthScore - b.relationship.healthScore;
    const nameA = a.company?.name ?? "";
    const nameB = b.company?.name ?? "";
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  const milestoneDistribution = [1, 2, 3, 4, 5].map((num) => ({
    num,
    label: MILESTONE_LABELS[num - 1],
    completed: relationships.filter((r) => r.milestonesCompleted.includes(num)).length,
    current: relationships.filter(
      (r) => r.currentMilestone === num && !r.milestonesCompleted.includes(num)
    ).length,
  }));

  async function handleGenerate() {
    setReportStatus("loading");
    setApiError(null);
    setCopyStatus("idle");
    try {
      const res = await fetch("/api/ai/cohort-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId: cohort.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setApiError(typeof err.error === "string" ? err.error : "Request failed");
        setReportStatus("error");
        return;
      }
      const data = (await res.json()) as CohortReport;
      setReport(data);
      setReportStatus("done");
    } catch {
      setApiError("Network error — please try again.");
      setReportStatus("error");
    }
  }

  function buildPlainText(r: CohortReport): string {
    return [
      `COHORT REPORT: ${cohort.name}`,
      `Generated: ${r.generatedAt.slice(0, 19).replace("T", " ")} UTC`,
      "",
      r.narrative,
      "",
      "KEY RISKS:",
      ...r.keyRisks.map((k) => `- ${k}`),
      "",
      "RECOMMENDED ACTIONS:",
      ...r.recommendedActions.map((a) => `- ${a}`),
    ].join("\n");
  }

  async function handleCopy() {
    if (!report) return;
    const text = buildPlainText(report);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyText(text);
      setCopyStatus("fallback");
    }
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Cohort header */}
      <div className="bg-card border border-border rounded-xl px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{cohort.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-[10px] border border-border rounded-full px-2.5 py-0.5 text-muted-foreground capitalize">
                {cohort.status}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cohort.totalWeeks}-week programme
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground mb-0.5">Duration</p>
            <p className="text-xs font-semibold text-foreground">
              {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-xs">
          {[
            { label: "Companies", value: companies.length },
            { label: "Mentors", value: mentors.length },
            { label: "Relationships", value: totalRelationships },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground">{label}</p>
              <p className="text-base font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: health overview + milestone distribution */}
        <div className="space-y-6">
          {/* Health stats */}
          <div className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-4">
              Health Overview
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "Avg Health", value: avgHealthScore, color: HEALTH_COLORS[getHealthBand(avgHealthScore)] },
                { label: "Active", value: activeCount, color: undefined },
                { label: "Healthy", value: healthyCount, color: "var(--status-healthy)" },
                { label: "At Risk", value: atRiskCount, color: "var(--status-risk)" },
                { label: "Critical", value: criticalCount, color: "var(--status-critical)" },
                { label: "Stale", value: staleCount, color: "var(--status-risk)" },
                { label: "Meetings", value: totalMeetings, color: undefined },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ color: color ?? "var(--foreground)" }}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone distribution */}
          <div className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-4">
              Milestone Distribution
            </p>
            <div className="space-y-3">
              {milestoneDistribution.map(({ num, label, completed, current }) => {
                const atOrPast = completed + current;
                const barWidth = totalRelationships > 0
                  ? Math.round((atOrPast / totalRelationships) * 100)
                  : 0;
                return (
                  <div key={num}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        {num}. {label}
                      </span>
                      <span className="text-[10px] text-foreground font-medium">
                        {atOrPast}
                        {completed > 0 && (
                          <span className="ml-1" style={{ color: "var(--status-healthy)" }}>
                            ({completed} done)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barWidth}%`, backgroundColor: "var(--status-healthy)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: heatmap + report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Relationship heatmap */}
          {heatmap.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Relationship Heatmap
                </p>
              </div>
              <div className="divide-y divide-border">
                {heatmap.map(({ relationship, company, urgency, band }) => (
                  <div
                    key={relationship.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: HEALTH_COLORS[band] }}
                    />
                    <span className="text-xs font-medium text-foreground truncate min-w-0 w-32 shrink-0">
                      {company?.name ?? relationship.companyId}
                    </span>

                    {/* Mini health bar */}
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${relationship.healthScore}%`, background: HEALTH_COLORS[band] }}
                      />
                    </div>

                    <span
                      className="text-xs font-bold shrink-0 w-8 text-right"
                      style={{ color: HEALTH_COLORS[band] }}
                    >
                      {relationship.healthScore}
                    </span>
                    <span
                      className="text-[10px] font-medium shrink-0 w-14"
                      style={{ color: HEALTH_COLORS[band] }}
                    >
                      {getHealthBandLabel(band)}
                    </span>
                    {urgency.level !== "healthy" && (
                      <span
                        className="text-[10px] shrink-0"
                        style={{ color: urgencyLevelColor(urgency.level) }}
                      >
                        {urgency.label}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {urgency.daysSinceLastMeeting}d ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cohort report */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Cohort Report
              </p>
              <div className="flex items-center gap-2">
                {report && (
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                  >
                    {copyStatus === "copied" ? "Copied ✓" : "Copy"}
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={reportStatus === "loading"}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    reportStatus === "loading"
                      ? "border-border text-muted-foreground cursor-not-allowed"
                      : "border-foreground/30 text-foreground hover:border-foreground"
                  }`}
                >
                  {reportStatus === "loading"
                    ? "Generating…"
                    : reportStatus === "done"
                      ? "Regenerate"
                      : "Generate Report"}
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              {reportStatus === "error" && apiError && (
                <p className="text-xs mb-3" style={{ color: "var(--status-critical)" }}>
                  {apiError}
                </p>
              )}

              {report ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{report.narrative}</p>

                  {report.keyRisks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-foreground mb-2">Key Risks</p>
                      <ul className="space-y-1.5">
                        {report.keyRisks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 mt-0.5" style={{ color: "var(--status-risk)" }}>·</span>
                            <span className="text-muted-foreground">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.recommendedActions.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-foreground mb-2">Recommended Actions</p>
                      <ul className="space-y-1.5">
                        {report.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-muted-foreground shrink-0 mt-0.5">→</span>
                            <span className="text-muted-foreground">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[9px] text-muted-foreground pt-1 border-t border-border">
                    Generated {report.generatedAt.slice(0, 19).replace("T", " ")} UTC
                  </p>

                  {copyStatus === "fallback" && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">
                        Clipboard unavailable — select all and copy manually:
                      </p>
                      <textarea
                        readOnly
                        rows={8}
                        value={copyText}
                        className="w-full border border-border rounded-lg px-3 py-2 text-[10px] bg-muted text-muted-foreground resize-none font-mono"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {reportStatus === "loading"
                    ? "Generating cohort narrative…"
                    : "Generate a management-ready narrative using live cohort health data."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
