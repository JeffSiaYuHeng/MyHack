"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Rocket, 
  CloudSync, 
  Zap,
  Zap as ZapIcon, // Renamed to avoid collision if any
  MoreVertical
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

// Refined Colors based on reference
const COLORS = {
  primary: "#6b38d4", // Healthy
  secondary: "#b52330", // At Risk
  error: "#ba1a1a", // Critical
  surface: "#faf9f5",
  background: "#F5F4F0",
  outline: "#7b7486",
  "on-surface-variant": "#494454",
  "ai-bg": "#F5F3FF",
  "ai-border": "#e9ddff"
};

const HEALTH_COLORS: Record<HealthBand, string> = {
  healthy: COLORS.primary,
  "at-risk": COLORS.secondary,
  critical: COLORS.error,
};

const STATUS_BG: Record<HealthBand, string> = {
  healthy: "#e9ddff", // primary-fixed
  "at-risk": "#ffdad8", // secondary-fixed
  critical: "#ffdad6", // error-container
};

const STATUS_TEXT: Record<HealthBand, string> = {
  healthy: "#23005c", // on-primary-fixed
  "at-risk": "#410007", // on-secondary-fixed
  critical: "#93000a", // on-error-container
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
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const companyMap = new Map<string, Company>(companies.map((c) => [c.id, c]));
  const mentorMap = new Map<string, Mentor>(mentors.map((m) => [m.id, m]));

  const filtered = relationships.filter((r) => {
    const company = companyMap.get(r.companyId);
    const mentor = mentorMap.get(r.mentorId);
    
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (healthFilter !== "all" && getHealthBand(r.healthScore) !== healthFilter)
      return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesCompany = company?.name.toLowerCase().includes(q);
      const matchesMentor = mentor?.name.toLowerCase().includes(q);
      if (!matchesCompany && !matchesMentor) return false;
    }
    
    return true;
  });

  const totalHealthy = relationships.filter((r) => getHealthBand(r.healthScore) === "healthy").length;
  const totalAtRisk = relationships.filter((r) => getHealthBand(r.healthScore) === "at-risk").length;
  const totalCritical = relationships.filter((r) => getHealthBand(r.healthScore) === "critical").length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Summary Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold text-[#1b1c1a] mb-2" style={{ fontFamily: "Source Serif 4, serif" }}>
              Relationships
            </h2>
            <div className="flex items-center gap-4 text-[#494454] text-sm">
              <span className="flex items-center gap-1.5"><strong className="text-[#1b1c1a]">{relationships.length}</strong> Total</span>
              <span className="w-1 h-1 rounded-full bg-[#cbc3d7]"></span>
              <span className="flex items-center gap-1.5 text-[#6b38d4] font-medium"><strong className="text-[#6b38d4]">{totalHealthy}</strong> Healthy</span>
              <span className="w-1 h-1 rounded-full bg-[#cbc3d7]"></span>
              <span className="flex items-center gap-1.5 text-[#b52330]"><strong className="text-[#b52330]">{totalAtRisk}</strong> At Risk</span>
              <span className="w-1 h-1 rounded-full bg-[#cbc3d7]"></span>
              <span className="flex items-center gap-1.5 text-[#ba1a1a] font-bold"><strong className="text-[#ba1a1a]">{totalCritical}</strong> Critical</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="flex flex-wrap items-center gap-8 bg-white p-4 rounded-xl border border-[#cbc3d7]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider">Status</span>
          <div className="flex gap-2">
            {["all", "active", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as StatusFilter)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                  statusFilter === f 
                    ? "bg-[#6b38d4] text-white" 
                    : "bg-[#efeeea] text-[#494454] hover:bg-[#cbc3d7]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="h-8 w-px bg-[#cbc3d7] hidden md:block"></div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider">Health</span>
          <div className="flex gap-2">
            {HEALTH_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setHealthFilter(f)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                  healthFilter === f 
                    ? "bg-[#6b38d4] text-white" 
                    : "bg-[#efeeea] text-[#494454] hover:bg-[#cbc3d7]"
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
        <div className="bg-white border border-[#cbc3d7] rounded-xl p-12 text-center text-[#494454]">
          <p className="text-sm">No relationships match the selected filters.</p>
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
                className="bg-white border border-[#cbc3d7] rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-md border-l-4"
                style={{ borderLeftColor: healthColor }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center border border-[#cbc3d7]"
                      style={{ background: STATUS_BG[band] }}
                    >
                      {band === "healthy" ? (
                        <Rocket size={32} style={{ color: COLORS.primary }} />
                      ) : band === "at-risk" ? (
                        <CloudSync size={32} style={{ color: COLORS.secondary }} />
                      ) : (
                        <Zap size={32} style={{ color: COLORS.error }} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b1c1a]">
                        {company?.name ?? r.companyId}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ 
                            background: STATUS_BG[band], 
                            color: STATUS_TEXT[band] 
                          }}
                        >
                          {band === "at-risk" ? "At Risk" : band}
                        </span>
                        <span className="text-xs text-[#494454]">{company?.stage ?? "Series A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1" style={{ color: healthColor }}>
                      <span className="text-3xl font-bold">{r.healthScore}</span>
                      <TrendIcon size={20} />
                    </div>
                    <span className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider">Health Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-[#cbc3d7] py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#efeeea] flex items-center justify-center">
                      <User size={18} style={{ color: COLORS.primary }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1b1c1a]">{mentor?.name ?? r.mentorId}</p>
                      <p className="text-xs text-[#494454] truncate max-w-[150px]">
                        {mentor?.currentRole ?? "Lead Mentor"} · {mentor?.company ?? "Expert"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <div className="flex justify-end gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#1b1c1a]">{r.meetingCount}</p>
                        <p className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider">Meetings</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: healthColor }}>{r.daysSinceLastMeeting}d</p>
                        <p className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider">Last Activity</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insight Block */}
                {r.aiDiagnosis && (
                  <div className="bg-[#F5F3FF] border border-[#e9ddff] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#6b38d4] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Insight</span>
                      <span className="text-xs font-semibold text-[#6b38d4]">Intelligence Summary</span>
                    </div>
                    <p className="text-sm text-[#494454] italic leading-relaxed">
                      &quot;{r.aiDiagnosis}&quot;
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {BREAKDOWN_KEYS.slice(0, 2).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-[#494454]">{label}</span>
                        <span className="font-semibold">{r.matchBreakdown[key]}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#efeeea] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${r.matchBreakdown[key]}%`,
                            background: r.matchBreakdown[key] < 40 ? COLORS.secondary : COLORS.primary 
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
                      className="px-2 py-1 bg-[#ffdad8] text-[#410007] text-[11px] rounded-full font-medium"
                    >
                      {w}
                    </span>
                  ))}
                  {r.watchPoints.length === 0 && (
                    <span className="px-2 py-1 bg-[#e9ddff] text-[#23005c] text-[11px] rounded-full font-medium">
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
            className="border-2 border-dashed border-[#cbc3d7] rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-[#efeeea] hover:border-[#6b38d4] transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-[#efeeea] flex items-center justify-center group-hover:bg-[#6b38d4] group-hover:text-white transition-colors text-[#494454]">
              <Zap size={24} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-[#1b1c1a]">Establish New Relationship</p>
              <p className="text-sm text-[#494454]">Match a startup with a specialized mentor</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
