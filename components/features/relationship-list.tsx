"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Rocket, 
  CloudSync, 
  Zap,
} from "lucide-react";
import type { Relationship, Company, Mentor } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

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

// Design-system aligned color tokens
const HEALTH_COLORS: Record<HealthBand, string> = {
  healthy: "var(--status-healthy)",
  "at-risk": "var(--status-risk)",
  critical: "var(--status-critical)",
};

const STATUS_BG: Record<HealthBand, string> = {
  healthy: "var(--status-healthy-bg)",
  "at-risk": "var(--status-risk-bg)",
  critical: "var(--status-critical-bg)",
};

const STATUS_TEXT: Record<HealthBand, string> = {
  healthy: "var(--status-healthy)",
  "at-risk": "var(--status-risk)",
  critical: "var(--status-critical)",
};

const TREND_ICON = {
  improving: TrendingUp,
  stable: Minus,
  deteriorating: TrendingDown,
};

const BREAKDOWN_KEYS: [keyof Relationship["matchBreakdown"], string][] = [
  ["industryMatch", "Industry Fit"],
  ["stageFit", "Stage Alignment"],
  ["availability", "Availability"],
  ["styleCompatibility", "Style Comp."],
];

interface RelationshipListProps {
  relationships: Relationship[];
  companies: Company[];
  mentors: Mentor[];
}

function RelationshipSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-8 w-12 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
          <div className="py-4 border-y border-gray-100 flex justify-between">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="space-y-1"><Skeleton className="h-4 w-8" /><Skeleton className="h-2 w-12" /></div>
              <div className="space-y-1"><Skeleton className="h-4 w-8" /><Skeleton className="h-2 w-12" /></div>
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function RelationshipList({
  relationships,
  companies,
  mentors,
}: RelationshipListProps) {
  return (
    <Suspense fallback={<RelationshipSkeleton />}>
      <RelationshipListContent 
        relationships={relationships} 
        companies={companies} 
        mentors={mentors} 
      />
    </Suspense>
  );
}

function RelationshipListContent({
  relationships,
  companies,
  mentors,
}: RelationshipListProps) {
  const searchParams = useSearchParams();
  const initialHealth = searchParams.get("health") as HealthFilter;
  const initialStatus = searchParams.get("status") as StatusFilter;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    STATUS_FILTERS.includes(initialStatus) ? initialStatus : "all"
  );
  const [healthFilter, setHealthFilter] = useState<HealthFilter>(
    HEALTH_FILTERS.includes(initialHealth) ? initialHealth : "all"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const companyMap = useMemo(
    () => new Map<string, Company>(companies.map((c) => [c.id, c])),
    [companies]
  );
  const mentorMap = useMemo(
    () => new Map<string, Mentor>(mentors.map((m) => [m.id, m])),
    [mentors]
  );

  const filtered = useMemo(
    () =>
      relationships.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (healthFilter !== "all" && getHealthBand(r.healthScore) !== healthFilter)
          return false;

        return true;
      }),
    [healthFilter, relationships, statusFilter]
  );

  const { totalHealthy, totalAtRisk, totalCritical } = useMemo(() => {
    let healthy = 0;
    let atRisk = 0;
    let critical = 0;

    for (const relationship of relationships) {
      const band = getHealthBand(relationship.healthScore);
      if (band === "healthy") healthy++;
      else if (band === "at-risk") atRisk++;
      else critical++;
    }

    return {
      totalHealthy: healthy,
      totalAtRisk: atRisk,
      totalCritical: critical,
    };
  }, [relationships]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Summary Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2" style={{ letterSpacing: "-0.02em" }}>
              Relationships
            </h2>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5"><strong className="text-foreground">{relationships.length}</strong> Total</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--status-healthy)" }}><strong>{totalHealthy}</strong> Healthy</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="flex items-center gap-1.5" style={{ color: "var(--status-risk)" }}><strong>{totalAtRisk}</strong> At Risk</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span className="flex items-center gap-1.5 font-bold" style={{ color: "var(--status-critical)" }}><strong>{totalCritical}</strong> Critical</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-wrap items-center gap-8 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <div className="flex gap-2">
            {["all", "active", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as StatusFilter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${
                  statusFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="h-8 w-px bg-border hidden md:block"></div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Health</span>
          <div className="flex gap-2">
            {HEALTH_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setHealthFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${
                  healthFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {f === "at-risk" ? "At Risk" : f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Relationship Grid */}
      {!mounted ? (
        <RelationshipSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No relationships match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const company = companyMap.get(r.companyId);
            const mentor = mentorMap.get(r.mentorId);
            const band = getHealthBand(r.healthScore);
            const healthColor = HEALTH_COLORS[band];
            const TrendIcon = TREND_ICON[r.healthTrend];

            return (
              <Link
                key={r.id}
                href={`/relationships/${r.id}`}
                className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30 border-l-4"
                style={{ borderLeftColor: healthColor }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center border border-border"
                      style={{ background: STATUS_BG[band] }}
                    >
                      {band === "healthy" ? (
                        <Rocket size={32} style={{ color: healthColor }} />
                      ) : band === "at-risk" ? (
                        <CloudSync size={32} style={{ color: healthColor }} />
                      ) : (
                        <Zap size={32} style={{ color: healthColor }} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {company?.name ?? r.companyId}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            background: STATUS_BG[band],
                            color: STATUS_TEXT[band],
                          }}
                        >
                          {band === "at-risk" ? "At Risk" : band}
                        </span>
                        <span className="text-xs text-muted-foreground">{company?.stage ?? "Series A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1" style={{ color: healthColor }}>
                      <span className="text-3xl font-bold">{r.healthScore}</span>
                      <TrendIcon size={20} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Health Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{mentor?.name ?? r.mentorId}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {mentor?.currentRole ?? "Lead Mentor"} · {mentor?.company ?? "Expert"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <div className="flex justify-end gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.meetingCount}</p>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Meetings</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: healthColor }}>{r.daysSinceLastMeeting}d</p>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Activity</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insight Block */}
                {r.aiDiagnosis && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      background: "rgba(124,58,237,0.04)",
                      borderColor: "rgba(124,58,237,0.2)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ background: "var(--status-ai)", color: "#ffffff" }}
                      >
                        ✦ AI Insight
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "var(--status-ai)" }}>Intelligence Summary</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      &quot;{r.aiDiagnosis}&quot;
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {BREAKDOWN_KEYS.slice(0, 2).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{r.matchBreakdown[key]}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.matchBreakdown[key]}%`,
                            background: r.matchBreakdown[key] < 40 ? "var(--status-risk)" : "var(--primary)",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {r.watchPoints.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-[11px] rounded-full font-medium"
                      style={{ background: "var(--status-risk-bg)", color: "var(--status-risk)" }}
                    >
                      {w}
                    </span>
                  ))}
                  {r.watchPoints.length === 0 && (
                    <span
                      className="px-2 py-1 text-[11px] rounded-full font-medium"
                      style={{ background: "var(--status-healthy-bg)", color: "var(--status-healthy)" }}
                    >
                      Active Collaboration
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          
          {/* Add New Placeholder */}
          <Link
            href="/matching"
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-muted-foreground">
              <Zap size={24} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Establish New Relationship</p>
              <p className="text-sm text-muted-foreground">Match a startup with a specialized mentor</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
