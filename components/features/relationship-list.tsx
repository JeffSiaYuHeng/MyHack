"use client";

import { useState } from "react";
import type { Relationship, Company, Mentor } from "@/lib/types";

type StatusFilter =
  | "all"
  | "pending"
  | "active"
  | "paused"
  | "completed"
  | "terminated";

type HealthFilter = "all" | "healthy" | "at-risk" | "critical";

type HealthBand = "healthy" | "at-risk" | "critical";

function getHealthBand(score: number): HealthBand {
  if (score >= 70) return "healthy";
  if (score >= 40) return "at-risk";
  return "critical";
}

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "active",
  "pending",
  "paused",
  "completed",
  "terminated",
];

const HEALTH_FILTERS: HealthFilter[] = ["all", "healthy", "at-risk", "critical"];

type RelationshipStatus = Relationship["status"];

const STATUS_COLORS: Record<RelationshipStatus, string> = {
  active: "var(--status-healthy)",
  pending: "var(--status-pending)",
  paused: "var(--status-risk)",
  completed: "var(--primary)",
  terminated: "var(--status-critical)",
};

const HEALTH_COLORS: Record<HealthBand, string> = {
  healthy: "var(--status-healthy)",
  "at-risk": "var(--status-risk)",
  critical: "var(--status-critical)",
};

const TREND_SYMBOL: Record<Relationship["healthTrend"], string> = {
  improving: "↑",
  stable: "→",
  deteriorating: "↓",
};

const TREND_COLOR: Record<Relationship["healthTrend"], string> = {
  improving: "var(--status-healthy)",
  stable: "var(--muted-foreground)",
  deteriorating: "var(--status-critical)",
};

const BREAKDOWN_KEYS: [
  keyof Relationship["matchBreakdown"],
  string
][] = [
  ["industryMatch", "Industry"],
  ["stageFit", "Stage"],
  ["availability", "Avail."],
  ["styleCompatibility", "Style"],
];

interface RelationshipListProps {
  relationships: Relationship[];
  companies: Company[];
  mentors: Mentor[];
}

export function RelationshipList({
  relationships,
  companies,
  mentors,
}: RelationshipListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");

  const companyMap = new Map<string, Company>(companies.map((c) => [c.id, c]));
  const mentorMap = new Map<string, Mentor>(mentors.map((m) => [m.id, m]));

  const filtered = relationships.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (
      healthFilter !== "all" &&
      getHealthBand(r.healthScore) !== healthFilter
    )
      return false;
    return true;
  });

  const totalHealthy = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "healthy"
  ).length;
  const totalAtRisk = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "at-risk"
  ).length;
  const totalCritical = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "critical"
  ).length;

  return (
    <div className="px-4 md:px-12 py-6 space-y-4">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide">
          {relationships.length} relationships
        </span>
        <span style={{ color: "var(--status-healthy)" }}>
          {totalHealthy} healthy
        </span>
        <span style={{ color: "var(--status-risk)" }}>
          {totalAtRisk} at risk
        </span>
        <span style={{ color: "var(--status-critical)" }}>
          {totalCritical} critical
        </span>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => {
            const count =
              f === "all"
                ? relationships.length
                : relationships.filter((r) => r.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded border transition-colors capitalize ${
                  statusFilter === f
                    ? "border-primary text-foreground bg-muted"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {f} {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block w-px bg-border mx-1" />

        {/* Health filters */}
        <div className="flex flex-wrap gap-1">
          {HEALTH_FILTERS.map((f) => {
            const count =
              f === "all"
                ? relationships.length
                : relationships.filter(
                    (r) => getHealthBand(r.healthScore) === f
                  ).length;
            return (
              <button
                key={f}
                onClick={() => setHealthFilter(f)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded border transition-colors capitalize ${
                  healthFilter === f
                    ? "border-primary text-foreground bg-muted"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {f} {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Relationship list */}
      {filtered.length === 0 ? (
        <div className="border border-border rounded p-6 text-sm text-muted-foreground">
          No relationships match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const company = companyMap.get(r.companyId);
            const mentor = mentorMap.get(r.mentorId);
            const band = getHealthBand(r.healthScore);
            const statusColor = STATUS_COLORS[r.status];
            const healthColor = HEALTH_COLORS[band];

            return (
              <div
                key={r.id}
                className="border border-border rounded p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">
                        {company?.name ?? r.companyId}
                      </p>
                      <span
                        className="text-[10px] font-medium border rounded px-1.5 py-0.5 capitalize shrink-0"
                        style={{
                          color: statusColor,
                          borderColor: statusColor,
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {mentor?.name ?? r.mentorId}
                      {mentor && (
                        <span className="mx-1 opacity-50">&middot;</span>
                      )}
                      {mentor?.currentRole} at {mentor?.company}
                    </p>
                  </div>

                  {/* Health score block */}
                  <div className="shrink-0 text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span
                        className="text-lg font-bold leading-none"
                        style={{ color: healthColor }}
                      >
                        {r.healthScore}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: TREND_COLOR[r.healthTrend] }}
                      >
                        {TREND_SYMBOL[r.healthTrend]}
                      </span>
                    </div>
                    <p
                      className="text-[10px] font-medium capitalize leading-none mt-0.5"
                      style={{ color: healthColor }}
                    >
                      {band === "at-risk" ? "At Risk" : band.charAt(0).toUpperCase() + band.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Cadence row */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">
                      {r.meetingCount}
                    </span>{" "}
                    meeting{r.meetingCount !== 1 ? "s" : ""}
                  </span>
                  <span>
                    <span className="font-medium text-foreground">
                      {r.daysSinceLastMeeting}d
                    </span>{" "}
                    since last
                  </span>
                  <span>
                    Match{" "}
                    <span className="font-medium text-foreground">
                      {r.matchScore}
                    </span>
                  </span>
                  <span>
                    Milestone{" "}
                    <span className="font-medium text-foreground">
                      {r.currentMilestone}
                    </span>
                  </span>
                </div>

                {/* AI diagnosis */}
                {r.aiDiagnosis && (
                  <p className="text-xs text-muted-foreground">
                    {r.aiDiagnosis}
                  </p>
                )}

                {/* Watch points */}
                {r.watchPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.watchPoints.map((w, i) => (
                      <span
                        key={i}
                        className="text-[10px] border rounded px-1.5 py-0.5"
                        style={{
                          color: "var(--status-risk)",
                          borderColor: "var(--status-risk)",
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}

                {/* Match reason */}
                <p className="text-[10px] text-muted-foreground italic">
                  {r.matchReason}
                </p>

                {/* Match breakdown bars */}
                <div className="space-y-1">
                  {BREAKDOWN_KEYS.map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-14 shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.matchBreakdown[key]}%`,
                            backgroundColor: "var(--primary)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">
                        {r.matchBreakdown[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
