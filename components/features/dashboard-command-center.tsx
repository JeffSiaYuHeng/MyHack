"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Folder,
  Layers,
  FileText,
  CheckCircle,
  ArrowRight,
  Plus,
  X,
  BarChart2,
  Search,
  Network,
  Handshake,
  Wrench,
  Building2,
  Coins,
} from "lucide-react";
import type { HealthBand } from "@/lib/verrier-analytics";
import type { EcosystemLinkageType } from "@/lib/types";
import {
  getAttentionFeed,
  getDashboardSummary,
  getRecentMeetings,
} from "@/lib/verrier-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  seedCompanies,
  seedEcosystemEntities,
  seedEcosystemLinkages,
  seedRelationships,
} from "@/lib/verrier-seed";

function bandToStatus(band: HealthBand): "critical" | "at-risk" | "healthy" {
  if (band === "critical") return "critical";
  if (band === "at-risk") return "at-risk";
  return "healthy";
}

function StatusBadge({ status }: { status: "critical" | "at-risk" | "healthy" }) {
  const cls = {
    critical: "bg-red-100 text-red-700 border border-red-400",
    "at-risk": "bg-amber-100 text-amber-700 border border-amber-400",
    healthy: "bg-green-100 text-green-700 border border-green-400",
  };
  const labels = { critical: "🚨 CRITICAL", "at-risk": "⚠ At Risk", healthy: "✓ Healthy" };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls[status]}`}>
      {labels[status]}
    </span>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const cls =
    signal === "Positive"
      ? "bg-green-100 text-green-700"
      : signal === "Friction detected"
        ? "bg-red-100 text-red-700"
        : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{signal}</span>;
}

function AiBadge() {
  return (
    <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">
      ✦ AI
    </span>
  );
}

function AiInsightBox({ text }: { text: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/40 flex items-start gap-2">
      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)] mt-0.5">
        ✦ AI
      </span>
      <p className="text-xs text-muted-foreground leading-relaxed italic">{text}</p>
    </div>
  );
}

function AttentionFeedSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 space-y-3 overflow-hidden relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-l-xl" />
          <div className="pl-2 flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </>
  );
}

function RecentMeetingsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </>
  );
}

type LinkageFilter = "all" | EcosystemLinkageType;

const LINKAGE_FILTERS: Array<{ value: LinkageFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "company-programme", label: "Company to Programme" },
  { value: "partner-initiative", label: "Partner to Initiative" },
  { value: "service-provider-company", label: "Provider to Company" },
  { value: "programme-initiative", label: "Programme to Initiative" },
];

function formatLinkageType(type: EcosystemLinkageType): string {
  const match = LINKAGE_FILTERS.find((filter) => filter.value === type);
  return match?.label ?? type;
}

function statusClass(status: string): string {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "monitoring") return "bg-amber-100 text-amber-700";
  if (status === "proposed") return "bg-purple-100 text-purple-700";
  return "bg-muted text-muted-foreground";
}

export function DashboardCommandCenter() {
  const [mounted, setMounted] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "critical" | "at-risk" | "healthy">("all");
  const [linkageFilter, setLinkageFilter] = useState<LinkageFilter>("all");
  const [selectedLinkageId, setSelectedLinkageId] = useState(seedEcosystemLinkages[0]?.id ?? "");

  // ── Watchlist (localStorage) ──────────────────────────────────────────
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("verrier_watchlist");
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [watchlistDialogOpen, setWatchlistDialogOpen] = useState(false);
  const [watchlistSearch, setWatchlistSearch] = useState("");

  const saveWatchlist = useCallback((ids: string[]) => {
    setWatchlist(ids);
    localStorage.setItem("verrier_watchlist", JSON.stringify(ids));
  }, []);

  const addToWatchlist = (id: string) => {
    if (!watchlist.includes(id)) saveWatchlist([...watchlist, id]);
  };
  const removeFromWatchlist = (id: string) => saveWatchlist(watchlist.filter((w) => w !== id));

  const seedCompanyById = useMemo(
    () => new Map(seedCompanies.map((company) => [company.id, company])),
    []
  );

  const watchlistCompanies = useMemo(
    () => watchlist.map((id) => seedCompanyById.get(id)).filter(Boolean) as typeof seedCompanies,
    [seedCompanyById, watchlist]
  );

  // Get health score for a company via its relationship
  const activeRelationshipScoreByCompany = useMemo(() => {
    const scores = new Map<string, number>();
    for (const rel of seedRelationships) {
      if (rel.status === "active") scores.set(rel.companyId, rel.healthScore);
    }
    return scores;
  }, []);

  const getCompanyScore = useCallback(
    (companyId: string) => activeRelationshipScoreByCompany.get(companyId) ?? null,
    [activeRelationshipScoreByCompany]
  );

  const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const avatarColor = (name: string) => {
    const colors = [
      { bg: "#ede9fe", text: "#6b38d4" },
      { bg: "#fee2e2", text: "#dc2626" },
      { bg: "#fef3c7", text: "#92400e" },
      { bg: "#dcfce7", text: "#166534" },
      { bg: "#e0f2fe", text: "#075985" },
      { bg: "#f1f5f9", text: "#475569" },
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const miniBar = (score: number | null) => {
    if (score === null) return null;
    const pct = score / 100;
    const bars = [0.3, 0.5, 0.7, 0.85, 1.0];
    return (
      <div className="flex items-end gap-[2px] h-5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-sm"
            style={{
              height: `${h * 100}%`,
              opacity: i / bars.length < pct ? 1 : 0.2,
              background: "var(--status-ai)",
            }}
          />
        ))}
      </div>
    );
  };

  const dialogCandidates = useMemo(() => {
    const q = watchlistSearch.toLowerCase();
    return seedCompanies.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.industry ?? []).join(",").toLowerCase().includes(q)
    );
  }, [watchlistSearch]);
  // ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Simulate a brief loading state so skeletons are visible
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const summary = useMemo(() => getDashboardSummary(), []);
  const feed = useMemo(() => getAttentionFeed(), []);
  const meetings = useMemo(() => getRecentMeetings(5), []);

  const atRiskCount = summary.atRiskRelationshipCount;
  const criticalCount = summary.criticalRelationshipCount;

  // Chart Data preparation
  const chartData = useMemo(() => {
    const rows = [
      { name: "0-20", count: 0, fill: "var(--status-critical)" },
      { name: "21-40", count: 0, fill: "var(--status-critical)" },
      { name: "41-60", count: 0, fill: "var(--status-risk)" },
      { name: "61-80", count: 0, fill: "var(--status-healthy)" },
      { name: "81-100", count: 0, fill: "var(--status-healthy)" },
    ];

    seedRelationships.forEach((rel) => {
      if (rel.status !== "active") return;
      const score = rel.healthScore;
      if (score <= 20) rows[0].count++;
      else if (score <= 40) rows[1].count++;
      else if (score <= 60) rows[2].count++;
      else if (score <= 80) rows[3].count++;
      else rows[4].count++;
    });

    return rows;
  }, []);

  const ecosystemEntityCounts = useMemo(
    () => ({
      partners: seedEcosystemEntities.filter((entity) => entity.type === "partner").length,
      serviceProviders: seedEcosystemEntities.filter((entity) => entity.type === "service-provider").length,
      grants: seedEcosystemEntities.filter((entity) => entity.type === "grant").length,
      initiatives: seedEcosystemEntities.filter((entity) => entity.type === "initiative").length,
    }),
    []
  );
  const ecosystemLinkageCounts = {
    total: seedEcosystemLinkages.length,
  };
  const entityNameById = useMemo(
    () =>
      new Map<string, string>([
        ...seedEcosystemEntities.map((entity) => [entity.id, entity.name] as const),
        ...seedCompanies.map((company) => [company.id, company.name] as const),
      ]),
    []
  );
  const filteredEcosystemLinkages = useMemo(
    () =>
      seedEcosystemLinkages.filter(
        (linkage) => linkageFilter === "all" || linkage.type === linkageFilter
      ),
    [linkageFilter]
  );
  const selectedLinkage =
    seedEcosystemLinkages.find((linkage) => linkage.id === selectedLinkageId) ??
    filteredEcosystemLinkages[0] ??
    seedEcosystemLinkages[0];
  const averageLinkageScore = useMemo(
    () =>
      seedEcosystemLinkages.length > 0
        ? Math.round(
            seedEcosystemLinkages.reduce((sum, linkage) => sum + linkage.fitScore, 0) /
              seedEcosystemLinkages.length
          )
        : 0,
    []
  );

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="px-4 md:px-12 py-6 space-y-4">

        {/* Group A — Programme Pipeline */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Programme Pipeline & Ecosystem Linkages
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Programmes", value: summary.activeProgramCount, icon: Folder, href: "/programs" },
              { label: "Active Cohorts", value: summary.activeCohortCount, icon: Layers, href: "/programs" },
              { label: "New Applications", value: summary.submittedApplicationCount, icon: FileText, href: "/programs/program-cradle-accelerator-2026/applicants" },
              { label: "Approved Startups", value: summary.approvedApplicationCount, icon: CheckCircle, href: "/programs/program-cradle-accelerator-2026/applicants" },
            ].map(({ label, value, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl font-bold text-foreground tabular-nums leading-none mt-2">
                    {value}
                  </span>
                  <Icon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5"
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-3">
                  {label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Group B — Relationship Health */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            First-class Relationship Entities
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Healthy */}
            <Link
              href="/relationships?health=healthy"
              className="group relative bg-[var(--status-healthy-bg)]/30 border border-[var(--status-healthy)]/20 hover:border-[var(--status-healthy)]/50 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md"
            >
              <span
                className="text-3xl font-bold tabular-nums leading-none mt-2"
                style={{ color: "var(--status-healthy)" }}
              >
                {summary.healthyRelationshipCount}
              </span>
              <div className="flex items-end justify-between mt-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--status-healthy) 80%, transparent)" }}
                >
                  Healthy Pairs
                </p>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform shrink-0"
                  style={{ color: "var(--status-healthy)" }}
                />
              </div>
            </Link>

            {/* At Risk */}
            <Link
              href="/relationships?health=at-risk"
              className="group relative bg-[var(--status-risk-bg)]/30 border border-[var(--status-risk)]/20 hover:border-[var(--status-risk)]/50 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md"
            >
              <span
                className="text-3xl font-bold tabular-nums leading-none mt-2"
                style={{ color: "var(--status-risk)" }}
              >
                {atRiskCount}
              </span>
              <div className="flex items-end justify-between mt-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--status-risk) 80%, transparent)" }}
                >
                  At Risk Pairs
                </p>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform shrink-0"
                  style={{ color: "var(--status-risk)" }}
                />
              </div>
            </Link>

            {/* Critical */}
            <Link
              href="/relationships?health=critical"
              className="group relative bg-[var(--status-critical-bg)]/30 border border-[var(--status-critical)]/20 hover:border-[var(--status-critical)]/50 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer hover:shadow-md"
            >
              <div className="flex items-start gap-2 mt-2">
                <span
                  className="text-3xl font-bold tabular-nums leading-none"
                  style={{ color: "var(--status-critical)" }}
                >
                  {criticalCount}
                </span>
                {criticalCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5 mt-1.5">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: "var(--status-critical)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: "var(--status-critical)" }}
                    />
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between mt-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--status-critical) 80%, transparent)" }}
                >
                  Critical Intervention
                </p>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform shrink-0"
                  style={{ color: "var(--status-critical)" }}
                />
              </div>
            </Link>

            {/* Total */}
            <Link
              href="/relationships"
              className="group bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
            >
              <span className="text-3xl font-bold text-foreground tabular-nums leading-none mt-2">
                {summary.activeRelationshipCount}
              </span>
              <div className="flex items-end justify-between mt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Active Pairs
                </p>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Ecosystem graph layer */}
      <div className="px-4 md:px-12 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.18fr] gap-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Ecosystem Linkage Layer
                </p>
                <h2 className="text-xl font-bold text-foreground mt-2">
                  Beyond mentor matching
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Partners, service providers, grants, initiatives, programmes, mentors, and companies are represented as reusable linkage entities.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[var(--status-ai)]/10 flex items-center justify-center shrink-0">
                <Network size={22} style={{ color: "var(--status-ai)" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { label: "Partners", value: ecosystemEntityCounts.partners, icon: Handshake },
                { label: "Service Providers", value: ecosystemEntityCounts.serviceProviders, icon: Wrench },
                { label: "Grant Pathways", value: ecosystemEntityCounts.grants, icon: Coins },
                { label: "Initiatives", value: ecosystemEntityCounts.initiatives, icon: Building2 },
                { label: "Ecosystem Linkages", value: ecosystemLinkageCounts.total, icon: Network },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
                    <Icon size={17} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Average linkage fit
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-foreground mt-1">
                    {averageLinkageScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Governance states
                  </p>
                  <div className="flex flex-wrap justify-end gap-1.5 mt-2">
                    {["proposed", "monitoring", "active"].map((status) => (
                      <span key={status} className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusClass(status)}`}>
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Reusable Linkage Workbench
                  </p>
                  <h3 className="text-base font-bold text-foreground mt-1">
                    Partner and service-provider graph
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">
                  First-class entities
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LINKAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setLinkageFilter(filter.value);
                      const next = seedEcosystemLinkages.find(
                        (linkage) => filter.value === "all" || linkage.type === filter.value
                      );
                      if (next) setSelectedLinkageId(next.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                      linkageFilter === filter.value
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4">
              <div className="space-y-3">
                {filteredEcosystemLinkages.map((linkage) => {
                  const active = linkage.id === selectedLinkage?.id;
                  return (
                    <button
                      key={linkage.id}
                      onClick={() => setSelectedLinkageId(linkage.id)}
                      className={`w-full text-left border rounded-lg p-4 transition-all ${
                        active
                          ? "border-[var(--status-ai)] bg-[var(--status-ai)]/5"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {entityNameById.get(linkage.sourceEntityId) ?? linkage.sourceEntityId}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            to {entityNameById.get(linkage.targetEntityId) ?? linkage.targetEntityId}
                          </p>
                        </div>
                        <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: "var(--status-ai)" }}>
                          {linkage.fitScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusClass(linkage.status)}`}>
                          {linkage.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatLinkageType(linkage.type)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedLinkage && (
                <div className="border border-border rounded-lg p-5 bg-background min-h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Selected linkage
                      </p>
                      <h4 className="text-base font-bold text-foreground mt-1">
                        {formatLinkageType(selectedLinkage.type)}
                      </h4>
                    </div>
                    <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--status-ai)" }}>
                      {selectedLinkage.fitScore}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Source
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {entityNameById.get(selectedLinkage.sourceEntityId) ?? selectedLinkage.sourceEntityId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Target
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {entityNameById.get(selectedLinkage.targetEntityId) ?? selectedLinkage.targetEntityId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Why this linkage exists
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedLinkage.rationale}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Reusable signals
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLinkage.reusableSignals.map((signal) => (
                          <span key={signal} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Cohort Intelligence CTA */}
      <div className="px-4 md:px-12 pb-2">
        <Link
          href="/program/cohort-cradle-q2-2026"
          className="group flex items-center justify-between bg-gradient-to-r from-[var(--status-ai)]/10 to-[var(--status-ai)]/5 border border-[var(--status-ai)]/20 hover:border-[var(--status-ai)]/50 rounded-xl px-6 py-4 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✦</span>
            <div>
              <p className="text-sm font-bold text-foreground">Instant Cohort Intelligence</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generate an AI board report for Cradle Q2 2026 — one click.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0" style={{ color: "var(--status-ai)" }}>
            View Cohort
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="px-4 md:px-12 pb-6">
        {/* Group C — 2-col: Health Score Distribution + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: chart */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Health Score Distribution
            </p>
            <div className="bg-card border border-border rounded-xl p-6 h-[250px] flex items-center justify-center">
              {!mounted ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor" }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "currentColor" }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right: Watchlist */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Watchlist
            </p>
            <div className="bg-card border border-border rounded-xl overflow-hidden h-[250px] flex flex-col">
              {/* Watchlist header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Watchlist</span>
                <button
                  onClick={() => { setWatchlistDialogOpen(true); setWatchlistSearch(""); }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Plus size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Watchlist items */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {watchlistCompanies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
                    <BarChart2 size={24} className="text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">No companies on watchlist.</p>
                    <button
                      onClick={() => { setWatchlistDialogOpen(true); setWatchlistSearch(""); }}
                      className="text-xs font-medium underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Add a company +
                    </button>
                  </div>
                ) : (
                  watchlistCompanies.map((company) => {
                    const score = getCompanyScore(company.id);
                    const { bg, text } = avatarColor(company.name);
                    return (
                      <div key={company.id} className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: bg, color: text }}
                        >
                          {initials(company.name)}
                        </div>
                        {/* Name + industry */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{company.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {(company.industry ?? [])[0] ?? "—"}
                          </p>
                        </div>
                        {/* Mini bar + score */}
                        <div className="flex items-center gap-2 shrink-0">
                          {miniBar(score)}
                          <span className={`text-base font-bold tabular-nums ${scoreColor(score)}`}>
                            {score ?? "—"}
                          </span>
                        </div>
                        {/* Remove (visible on hover) */}
                        <button
                          onClick={() => removeFromWatchlist(company.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add to Watchlist Dialog ─────────────────────────────────────── */}
      {watchlistDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setWatchlistDialogOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">Add to Watchlist</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select companies to monitor on your dashboard.</p>
              </div>
              <button
                onClick={() => setWatchlistDialogOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={watchlistSearch}
                  onChange={(e) => setWatchlistSearch(e.target.value)}
                  placeholder="Search by name or industry…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* Company list */}
            <div className="px-6 pb-4 max-h-72 overflow-y-auto space-y-1 mt-2">
              {dialogCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No companies found.</p>
              ) : (
                dialogCandidates.map((company) => {
                  const added = watchlist.includes(company.id);
                  const { bg, text } = avatarColor(company.name);
                  const score = getCompanyScore(company.id);
                  return (
                    <button
                      key={company.id}
                      onClick={() => added ? removeFromWatchlist(company.id) : addToWatchlist(company.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                        added
                          ? "bg-primary/8 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: bg, color: text }}
                      >
                        {initials(company.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {(company.industry ?? [])[0] ?? "—"}
                        </p>
                      </div>
                      {score !== null && (
                        <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}</span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          added ? "border-primary bg-primary" : "border-border"
                        }`}
                      >
                        {added && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Dialog footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{watchlist.length} on watchlist · saved to browser</span>
              <button
                onClick={() => setWatchlistDialogOpen(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attention Feed */}
        <section className="lg:col-span-2 space-y-3">
          {/* Header + chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                Attention Feed
              </span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                {atRiskCount + criticalCount} need review
              </span>
            </div>
            {/* Filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {([
                { key: "all",      label: "All",      dot: "bg-muted-foreground" },
                { key: "critical", label: "Critical",  dot: "bg-red-500" },
                { key: "at-risk",  label: "At Risk",   dot: "bg-amber-500" },
                { key: "healthy",  label: "Healthy",   dot: "bg-green-500" },
              ] as const).map(({ key, label, dot }) => (
                <button
                  key={key}
                  onClick={() => setFeedFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    feedFilter === key
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!mounted ? (
            <AttentionFeedSkeleton />
          ) : feed.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
              No relationships need review.
            </div>
          ) : (() => {
            const filtered = feedFilter === "all"
              ? feed
              : feed.filter(({ band }) => {
                  if (feedFilter === "critical") return band === "critical";
                  if (feedFilter === "at-risk")  return band === "at-risk";
                  return band === "healthy";
                });
            const visible = filtered.slice(0, 5);
            const overflow = filtered.length - visible.length;

            return (
              <>
                {visible.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
                    No {feedFilter === "at-risk" ? "at-risk" : feedFilter} relationships.
                  </div>
                ) : (
                  visible.map(({ relationship, company, mentor, band, urgency }) => {
                    const status = bandToStatus(band);
                    const accentBg =
                      status === "critical" ? "#dc2626" : status === "at-risk" ? "#d97706" : "#16a34a";
                    const scoreCls =
                      status === "critical"
                        ? "text-[var(--status-critical)]"
                        : status === "at-risk"
                          ? "text-[var(--status-risk)]"
                          : "text-[var(--status-healthy)]";
                    const cardBorder =
                      status === "critical"
                        ? "border-red-200"
                        : status === "at-risk"
                          ? "border-amber-200"
                          : "border-border";

                    return (
                      <Link
                        key={relationship.id}
                        href={`/relationships/${relationship.id}`}
                        className={`group relative block bg-card border ${cardBorder} rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                          style={{ background: accentBg }}
                        />
                        <div className="pl-5 pr-4 py-4">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-bold text-foreground text-[15px]">🏢 {company.name}</span>
                              <span className="text-gray-400 font-light text-lg">↔</span>
                              <span className="font-semibold text-muted-foreground text-[14px]">👤 {mentor.name}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={`text-3xl font-black leading-none tabular-nums ${scoreCls}`}>
                                {relationship.healthScore}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">score</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <StatusBadge status={status} />
                            <span className="text-xs text-muted-foreground">
                              {urgency.daysSinceLastMeeting}d since last meeting
                            </span>
                          </div>
                          {relationship.aiDiagnosis && (
                            <AiInsightBox text={relationship.aiDiagnosis} />
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
                {overflow > 0 && (
                  <Link
                    href="/relationships"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    +{overflow} more relationship{overflow !== 1 ? "s" : ""} → View all
                  </Link>
                )}
              </>
            );
          })()}
        </section>

        {/* Recent Meetings */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Recent Meetings
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {meetings.length} this week
            </span>
          </div>

          {!mounted ? (
            <RecentMeetingsSkeleton />
          ) : meetings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
              No recent meetings recorded.
            </div>
          ) : (
            meetings.map(({ meeting, company, mentor }) => (
              <Link
                key={meeting.id}
                href={`/relationships/${meeting.relationshipId}`}
                className="block bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                {/* Row 1 */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground text-[15px]">
                      {company.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mentor.name} · {String(meeting.date).slice(0, 10)}
                    </p>
                  </div>
                  <SignalBadge signal={meeting.signal} />
                </div>

                {/* Row 2 — AI summary */}
                <div className="mt-3 flex items-start gap-2">
                  <AiBadge />
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {meeting.aiSummary}
                  </p>
                </div>
              </Link>
            ))
          )}
        </section>
      </main>
    </>
  );
}
