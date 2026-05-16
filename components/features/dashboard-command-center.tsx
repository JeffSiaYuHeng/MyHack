"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Folder,
  Layers,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { HealthBand } from "@/lib/verrier-analytics";
import {
  getAttentionFeed,
  getDashboardSummary,
  getRecentMeetings,
} from "@/lib/verrier-analytics";
import { Skeleton } from "@/components/ui/skeleton";

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

export function DashboardCommandCenter() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simulate a brief loading state so skeletons are visible
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const summary = getDashboardSummary();
  const feed = getAttentionFeed();
  const meetings = getRecentMeetings(5);

  const atRiskCount = summary.atRiskRelationshipCount;
  const criticalCount = summary.criticalRelationshipCount;

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="px-4 md:px-12 py-6 space-y-4">

        {/* Group A — Programme Pipeline */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Programme Pipeline
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Programmes", value: summary.activeProgramCount, icon: Folder, href: "/programs" },
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
            Relationship Health
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

      <main className="px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attention Feed */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
              Attention Feed
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {atRiskCount + criticalCount} need review
            </span>
          </div>

          {!mounted ? (
            <AttentionFeedSkeleton />
          ) : feed.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
              No relationships need review.
            </div>
          ) : (
            feed.map(({ relationship, company, mentor, band, urgency }) => {
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
                <div
                  key={relationship.id}
                  className={`group relative bg-card border ${cardBorder} rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer`}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                    style={{ background: accentBg }}
                  />

                  <div className="pl-5 pr-4 py-4">
                    {/* Row 1 — relationship connection + score */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-bold text-foreground text-[15px]">
                          🏢 {company.name}
                        </span>
                        <span className="text-gray-400 font-light text-lg">↔</span>
                        <span className="font-semibold text-muted-foreground text-[14px]">
                          👤 {mentor.name}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-3xl font-black leading-none tabular-nums ${scoreCls}`}>
                          {relationship.healthScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">score</p>
                      </div>
                    </div>

                    {/* Row 2 — status badge + days */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <StatusBadge status={status} />
                      <span className="text-xs text-muted-foreground">
                        {urgency.daysSinceLastMeeting}d since last meeting
                      </span>
                    </div>

                    {/* Row 3 — AI insight box */}
                    {relationship.aiDiagnosis && (
                      <AiInsightBox text={relationship.aiDiagnosis} />
                    )}
                  </div>
                </div>
              );
            })
          )}
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
              <div
                key={meeting.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
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
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
