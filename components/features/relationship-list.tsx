"use client";

import { useState } from "react";
import Link from "next/link";
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

const STATUS_STYLES: Record<RelationshipStatus, { color: string; bg: string }> = {
  active: { color: "var(--status-healthy)", bg: "var(--status-healthy-bg)" },
  pending: { color: "var(--status-ai)", bg: "var(--muted)" },
  paused: { color: "var(--status-risk)", bg: "var(--status-risk-bg)" },
  completed: { color: "var(--primary)", bg: "var(--muted)" },
  terminated: { color: "var(--status-critical)", bg: "var(--status-critical-bg)" },
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

const BREAKDOWN_KEYS: [keyof Relationship["matchBreakdown"], string][] = [
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
    if (healthFilter !== "all" && getHealthBand(r.healthScore) !== healthFilter)
      return false;
    return true;
  });

  const totalHealthy = relationships.filter((r) => getHealthBand(r.healthScore) === "healthy").length;
  const totalAtRisk = relationships.filter((r) => getHealthBand(r.healthScore) === "at-risk").length;
  const totalCritical = relationships.filter((r) => getHealthBand(r.healthScore) === "critical").length;

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Relationships</h1>
        <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
          <span>{relationships.length} total</span>
          <span style={{ color: "var(--status-healthy)" }}>{totalHealthy} healthy</span>
          <span style={{ color: "var(--status-risk)" }}>{totalAtRisk} at risk</span>
          <span style={{ color: "var(--status-critical)" }}>{totalCritical} critical</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const count =
              f === "all"
                ? relationships.length
                : relationships.filter((r) => r.status === f).length;
            const isActive = statusFilter === f;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                }`}
              >
                {f}
                {count > 0 && (
                  <span className={`ml-1.5 ${isActive ? "opacity-70" : "opacity-50"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center">
          <div className="w-px h-5 bg-border" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {HEALTH_FILTERS.map((f) => {
            const count =
              f === "all"
                ? relationships.length
                : relationships.filter((r) => getHealthBand(r.healthScore) === f).length;
            const isActive = healthFilter === f;
            const color =
              f === "healthy"
                ? "var(--status-healthy)"
                : f === "at-risk"
                  ? "var(--status-risk)"
                  : f === "critical"
                    ? "var(--status-critical)"
                    : undefined;
            return (
              <button
                key={f}
                onClick={() => setHealthFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
                style={!isActive && color ? { color } : undefined}
              >
                {f === "at-risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
                {count > 0 && (
                  <span className="ml-1.5 opacity-50">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Relationship cards */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
          No relationships match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const company = companyMap.get(r.companyId);
            const mentor = mentorMap.get(r.mentorId);
            const band = getHealthBand(r.healthScore);
            const statusStyle = STATUS_STYLES[r.status];
            const healthColor = HEALTH_COLORS[band];

            return (
              <Link
                key={r.id}
                href={`/relationships/${r.id}`}
                className="group relative block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-foreground/20 transition-all duration-200"
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: healthColor }}
                />

                <div className="pl-5 pr-5 py-4">
                  {/* Row 1: company + status + health score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-semibold text-foreground truncate">
                          {company?.name ?? r.companyId}
                        </p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: statusStyle.color, background: statusStyle.bg }}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {mentor?.name ?? r.mentorId}
                        {mentor && (
                          <span className="mx-1.5 opacity-40">·</span>
                        )}
                        {mentor?.currentRole} at {mentor?.company}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span
                          className="text-2xl font-bold leading-none"
                          style={{ color: healthColor }}
                        >
                          {r.healthScore}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: TREND_COLOR[r.healthTrend] }}
                        >
                          {TREND_SYMBOL[r.healthTrend]}
                        </span>
                      </div>
                      <p
                        className="text-[10px] font-medium capitalize mt-0.5"
                        style={{ color: healthColor }}
                      >
                        {band === "at-risk" ? "At Risk" : band.charAt(0).toUpperCase() + band.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: health bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${r.healthScore}%`, background: healthColor }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {r.meetingCount} meetings · {r.daysSinceLastMeeting}d ago · Match {r.matchScore}
                    </span>
                  </div>

                  {/* Row 3: AI diagnosis */}
                  {r.aiDiagnosis && (
                    <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-2">
                      <span
                        className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                        style={{
                          background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                          color: "var(--status-ai)",
                        }}
                      >
                        ✦ AI
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {r.aiDiagnosis}
                      </p>
                    </div>
                  )}

                  {/* Row 4: match breakdown + watch points */}
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                    {BREAKDOWN_KEYS.map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-12 shrink-0">
                          {label}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.matchBreakdown[key]}%`, backgroundColor: "var(--primary)" }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">
                          {r.matchBreakdown[key]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {r.watchPoints.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {r.watchPoints.map((w, i) => (
                        <span
                          key={i}
                          className="text-[10px] border rounded-full px-2 py-0.5"
                          style={{ color: "var(--status-risk)", borderColor: "var(--status-risk)" }}
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
