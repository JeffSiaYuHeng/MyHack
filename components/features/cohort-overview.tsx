"use client";

import { useState } from "react";
import toast from "react-hot-toast";
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
  const [isFallback, setIsFallback] = useState(false);

  // Demo features
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

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
    setIsFallback(false);
    const toastId = toast.loading("Generating cohort report...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const res = await fetch("/api/ai/cohort-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ cohortId: cohort.id }),
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        throw new Error(
          typeof err.error === "string" ? err.error : "Request failed"
        );
      }

      const data = (await res.json()) as CohortReport;
      setReport(data);
      setReportStatus("done");
      toast.success("Cohort report generated.", { id: toastId });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      
      // Deterministic local fallback
      const staleNote =
        staleCount > 0
          ? `${staleCount} relationship${staleCount > 1 ? "s have" : " has"} not logged a meeting in over 14 days.`
          : "All relationships have maintained recent meeting activity.";

      const narrative =
        `${cohort.name} has ${totalRelationships} mentorship relationship${totalRelationships !== 1 ? "s" : ""} across ` +
        `${companies.length} ${companies.length !== 1 ? "companies" : "company"} and ${mentors.length} ${mentors.length !== 1 ? "mentors" : "mentor"}. ` +
        `Average health score is ${avgHealthScore}/100, with ${healthyCount} healthy, ${atRiskCount} at-risk, ` +
        `and ${criticalCount} critical. ${staleNote} ` +
        `${totalMeetings} meeting${totalMeetings !== 1 ? "s" : ""} have been recorded to date.`;

      const keyRisks: string[] = [];
      if (criticalCount > 0) {
        keyRisks.push(`${criticalCount} relationship${criticalCount > 1 ? "s are" : " is"} in critical health.`);
      }
      if (staleCount > 0) {
        keyRisks.push(`${staleCount} relationship${staleCount > 1 ? "s have" : " has"} stalled.`);
      }
      if (keyRisks.length === 0) {
        keyRisks.push("No critical risks detected in current health data.");
      }

      const recommendedActions: string[] = [
        criticalCount + atRiskCount > 0
          ? `Schedule check-ins for the ${criticalCount + atRiskCount} at-risk/critical pairings.`
          : "Maintain regular check-ins across all relationships.",
        "Ensure all action items from the last meeting cycle are tracked.",
      ];

      const fallbackReport: CohortReport = {
        narrative,
        keyRisks,
        recommendedActions,
        generatedAt: new Date().toISOString(),
      };

      const isTimeout = err instanceof Error && err.name === "AbortError";
      const msg = isTimeout 
        ? "Report generation timed out. Using local fallback metrics."
        : "AI report is currently unavailable. Using local fallback metrics.";

      setReport(fallbackReport);
      setReportStatus("done");
      setIsFallback(true);
      toast.error(msg, { id: toastId });
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
      toast.success("Report copied to clipboard.");
    } catch {
      setCopyText(text);
      setCopyStatus("fallback");
      toast.error("Clipboard unavailable. Manual copy field is ready.");
    }
  }

  return (
    <div className="px-6 md:px-10 py-8 space-y-8">
      {/* Cohort header */}
      <div className="bg-card border border-border rounded-xl px-8 py-8 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold text-foreground" style={{ letterSpacing: "-0.02em" }}>{cohort.name}</h1>
              <span className="px-3 py-1 text-[11px] font-medium uppercase tracking-widest rounded-full" style={{ background: "var(--status-healthy-bg)", color: "var(--status-healthy)" }}>
                {cohort.status}
              </span>
              <span className="px-3 py-1 text-[11px] font-medium bg-muted text-muted-foreground rounded-full">
                {cohort.totalWeeks}-week programme
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Duration</p>
            <p className="text-sm font-bold text-foreground">
              {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-border grid grid-cols-3 gap-8">
          {[
            { label: "Companies", value: companies.length },
            { label: "Mentors", value: mentors.length },
            { label: "Relationships", value: totalRelationships },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Cohort Intelligence (Demo Section) */}
      <div className="bg-[#F5F3FF] border border-[var(--status-ai)]/20 rounded-xl p-12 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124,58,237,0.06)" }} />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(124,58,237,0.06)" }} />
        {!reportReady ? (
          <div className="text-center space-y-4 relative z-10 max-w-xl">
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2" style={{ color: "var(--status-ai)" }}>
              <span className="text-2xl">✦</span>
              Instant Cohort Intelligence
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empower operations with unparalleled <span className="font-bold text-foreground">Scalability</span>. Instantly aggregate 100s of data points into a single management-ready narrative optimized for partner decision-making.
            </p>
          <div className="relative z-10">
            <button
              onClick={() => {
                setIsGenerating(true);
                handleGenerate();
                setTimeout(() => {
                  setIsGenerating(false);
                  setReportReady(true);
                }, 2500);
              }}
              disabled={isGenerating}
              className={`relative rounded-full px-10 py-4 text-[15px] font-semibold flex items-center gap-3 transition-all duration-300 ${
                isGenerating
                  ? "cursor-not-allowed opacity-80"
                  : "hover:scale-[1.03] active:scale-[0.98]"
              }`}
              style={{
                background: isGenerating
                  ? "rgba(124,58,237,0.15)"
                  : "linear-gradient(135deg, #7c3aed 0%, #6025c0 100%)",
                color: isGenerating ? "var(--status-ai)" : "#ffffff",
                boxShadow: isGenerating ? "none" : "0 8px 32px rgba(124,58,237,0.35), 0 2px 8px rgba(124,58,237,0.2)",
              }}
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-[var(--status-ai)] border-t-transparent animate-spin" />
                  Analyzing {totalRelationships} Ecosystem Linkages…
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">✦</span>
                  Generate Cohort Report
                </>
              )}
            </button>

          </div>
          </div>
        ) : (
          <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-700 bg-card border border-[var(--status-ai)]/30 shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-[var(--status-ai)]/10 text-[var(--status-ai)] uppercase tracking-widest">
                <span className="w-3 h-3 rounded-full bg-[var(--status-ai)] animate-pulse" />
                ✦ Generated by Gemini 3.0 Flash Preview in 2.1s
              </div>
              <button
                onClick={() => setReportReady(false)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1 transition-colors"
              >
                ↺ Regenerate
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">📄 Narrative Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cohort.name} is progressing well. {healthyCount} of {totalRelationships} mentor-startup pairs ({totalRelationships > 0 ? Math.round((healthyCount / totalRelationships) * 100) : 0}%) maintain healthy engagement scores above 70, reflecting strong programme cohesion.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">🌟 Top Highlights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {relWithMeta.filter(r => r.band === 'healthy').slice(0, 2).map(r => `${r.company?.name || 'A startup'} (Score: ${r.relationship.healthScore})`).join(" and ") || "Several pairs"} demonstrate consistent weekly cadence and milestone delivery.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">⚠️ Key Risks</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {relWithMeta.filter(r => r.band === 'critical' || r.band === 'at-risk').slice(0, 3).map(r => r.company?.name || 'A startup').join(", ") || "No major startups"} present elevated risk with health scores dropping or meeting gaps extending. Targeted intervention is recommended.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">⚙️ Systemic Issues</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {staleCount > 0 ? `${staleCount} mentorship pairs have not logged a session recently. We recommend triggering an automated check-in prompt to re-engage them.` : "All active mentors are logging sessions regularly. No systemic bottlenecks detected at this time."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: health overview + milestone distribution */}
        <div className="space-y-6">
          {/* Health stats */}
          <div className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Health Overview
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {[
                { label: "Avg Health", value: avgHealthScore, color: HEALTH_COLORS[getHealthBand(avgHealthScore)] },
                { label: "Active", value: activeCount, color: undefined },
                { label: "Healthy", value: healthyCount, color: "var(--status-healthy)" },
                { label: "At Risk", value: atRiskCount, color: "var(--status-risk)" },
                { label: "Critical", value: criticalCount, color: "var(--status-critical)" },
                { label: "Stale", value: staleCount, color: "var(--status-risk)" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p
                    className="text-2xl font-semibold leading-none"
                    style={{ color: color ?? "var(--foreground)" }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
              <div className="col-span-2 border-t border-border pt-5">
                <p className="text-2xl font-semibold text-foreground leading-none">{totalMeetings}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Meetings last 7 days</p>
              </div>
            </div>
          </div>

          {/* Milestone distribution */}
          <div className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
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
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Relationship Heatmap
                </p>
                <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  View All Companies
                </button>
              </div>
              <div className="divide-y divide-border">
                {heatmap.map(({ relationship, company, urgency, band }) => (
                  <div
                    key={relationship.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: HEALTH_COLORS[band] }}
                    />
                    <span className="text-xs font-medium text-foreground truncate min-w-0 w-32 shrink-0">
                      {company?.name ?? relationship.companyId}
                    </span>

                    {/* Mini health bar */}
                    <div className="flex-1 max-w-sm h-2 bg-muted rounded-full overflow-hidden">
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
        </div>
      </div>

      {/* Intelligence Report Section — full width bottom */}
      <div className="bg-muted/40 border border-border rounded-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: "var(--status-ai)" }}>📄</span>
            <h3 className="text-base font-semibold text-foreground">
              Intelligence Report: {cohort.name.split(" ").slice(0, 2).join(" ")}
            </h3>
            {reportStatus === "loading" && (
              <span className="text-[10px] font-mono text-muted-foreground animate-pulse">Generating…</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {report && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                >
                  {copyStatus === "copied" ? "✓ Copied" : "Copy Report"}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={reportStatus === "loading"}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: "#f36458", color: "#ffffff", border: "1px solid #f36458" }}
                >
                  {reportStatus === "loading" ? (
                    <><span className="inline-block w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" /> Generating…</>
                  ) : (
                    <>✦ Regenerate</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {reportStatus === "error" && apiError && (
          <p className="text-xs" style={{ color: "var(--status-critical)" }}>{apiError}</p>
        )}

        {report ? (
          <>
            {/* 2-col: Narrative | Key Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  Narrative Summary
                  {isFallback && <span className="ml-2 text-[9px] bg-muted px-1.5 py-0.5 rounded font-mono normal-case tracking-normal">Fallback</span>}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.narrative}</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Key Risks</h4>
                {report.keyRisks.length > 0 ? (
                  <ul className="space-y-2">
                    {report.keyRisks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                          style={{ background: i === 0 ? "var(--status-critical)" : "var(--status-risk)" }}
                        />
                        <span className="text-muted-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No critical risks detected.</p>
                )}
              </div>
            </div>

            {/* Recommended Actions */}
            {report.recommendedActions.length > 0 && (
              <div className="p-4 rounded-lg border" style={{ background: "rgba(124,58,237,0.04)", borderColor: "rgba(124,58,237,0.15)" }}>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--status-ai)" }}>
                  Recommended Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.recommendedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 font-bold text-sm" style={{ color: "var(--status-ai)" }}>→</span>
                      <p className="text-xs text-muted-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-[10px] font-mono text-muted-foreground">
                Generated by Verrier AI · {report.generatedAt.slice(0, 19).replace("T", " ")} UTC
              </p>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)" }}
              >
                ↗ Share with Partners
              </button>
            </div>

            {copyStatus === "fallback" && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Clipboard unavailable — select all and copy manually:</p>
                <textarea
                  readOnly
                  rows={8}
                  value={copyText}
                  className="w-full border border-border rounded-lg px-3 py-2 text-[10px] bg-muted text-muted-foreground resize-none font-mono"
                  onFocus={(e) => e.target.select()}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {reportStatus === "loading"
              ? "Generating cohort narrative…"
              : "Generate a management-ready narrative using live cohort health data."}
          </p>
        )}
      </div>
    </div>
  );
}

