"use client";

import { useState, useEffect } from "react";
import type { HealthBand } from "@/lib/verrier-analytics";
import {
  getAttentionFeed,
  getDashboardSummary,
  getHealthBandLabel,
  getRecentMeetings,
} from "@/lib/verrier-analytics";

// ─── Skeleton primitive ───────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className ?? ""}`}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bandStyle(band: HealthBand): { color: string; background: string } {
  if (band === "healthy")
    return {
      color: "var(--status-healthy)",
      background: "var(--status-healthy-bg)",
    };
  if (band === "at-risk")
    return {
      color: "var(--status-risk)",
      background: "var(--status-risk-bg)",
    };
  return {
    color: "var(--status-critical)",
    background: "var(--status-critical-bg)",
  };
}

function signalStyle(signal: string): { color: string; background: string } {
  if (signal === "Positive")
    return {
      color: "var(--status-healthy)",
      background: "var(--status-healthy-bg)",
    };
  if (signal === "Friction detected")
    return {
      color: "var(--status-critical)",
      background: "var(--status-critical-bg)",
    };
  return { color: "var(--muted-foreground)", background: "var(--muted)" };
}

function scoreBarColor(score: number): string {
  if (score < 40) return "var(--status-critical)";
  if (score < 70) return "var(--status-risk)";
  return "var(--status-healthy)";
}

// ─── Stat bar ─────────────────────────────────────────────────────────────────

interface StatCellProps {
  label: string;
  value: number;
  size?: "base" | "lg";
  color?: string;
  pulse?: boolean;
}

function StatCell({ label, value, size = "base", color, pulse }: StatCellProps) {
  const numClass =
    size === "lg" ? "text-3xl font-bold leading-none" : "text-2xl font-semibold leading-none";

  const numberEl = (
    <span className={numClass} style={color ? { color } : undefined}>
      {value}
    </span>
  );

  return (
    <div>
      {pulse && value > 0 ? (
        <span className="relative inline-flex">
          <span
            className="absolute -inset-1 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: "var(--status-critical)" }}
          />
          {numberEl}
        </span>
      ) : (
        numberEl
      )}
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function AttentionSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 overflow-hidden relative">
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
  );
}

function MeetingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted whitespace-nowrap">
        {badge}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
      {/* ── Stat bar ── */}
      <div className="bg-card border-b border-border py-4 px-4 md:px-8 flex items-center justify-between gap-6 flex-wrap">
        {/* Group A */}
        <div className="flex items-center gap-8">
          <StatCell label="Programmes" value={summary.activeProgramCount} />
          <StatCell label="Cohorts" value={summary.activeCohortCount} />
          <StatCell label="Applications" value={summary.submittedApplicationCount} />
          <StatCell label="Approved" value={summary.approvedApplicationCount} />
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border mx-4 hidden sm:block" />

        {/* Group B */}
        <div className="flex items-center gap-8">
          <StatCell
            label="Relationships"
            value={summary.activeRelationshipCount}
            size="lg"
          />
          <StatCell
            label="Healthy"
            value={summary.healthyRelationshipCount}
            size="lg"
            color="var(--status-healthy)"
          />
          <StatCell
            label="At Risk"
            value={atRiskCount}
            size="lg"
            color="var(--status-risk)"
          />
          <StatCell
            label="Critical"
            value={criticalCount}
            size="lg"
            color="var(--status-critical)"
            pulse
          />
        </div>
      </div>

      {/* ── Main grid ── */}
      <main className="px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Attention Feed */}
        <section className="lg:col-span-2">
          <SectionHeader
            title="Attention Feed"
            badge={`${atRiskCount + criticalCount} need review`}
          />

          <div className="space-y-3">
            {!mounted
              ? [0, 1, 2].map((i) => <AttentionSkeleton key={i} />)
              : feed.map(({ relationship, company, mentor, band, urgency }) => {
                  const { color, background } = bandStyle(band);
                  const score = relationship.healthScore;
                  const barColor = scoreBarColor(score);
                  const aiText =
                    relationship.aiDiagnosis || urgency.reason;

                  return (
                    <div
                      key={relationship.id}
                      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                      style={{
                        ["--hover-border" as string]: "var(--status-ai)",
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ background: color }}
                      />

                      <div className="pl-5 pr-4 py-4 space-y-3">
                        {/* Row 1 — name + badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-[15px] truncate">
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {mentor.name}
                            </p>
                          </div>
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                            style={{ color, background }}
                          >
                            {getHealthBandLabel(band)}
                          </span>
                        </div>

                        {/* Row 2 — health score bar */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20 shrink-0">
                            Health Score
                          </span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${score}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-semibold w-6 text-right"
                            style={{ color: barColor }}
                          >
                            {score}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 shrink-0">
                            &middot; {urgency.daysSinceLastMeeting}d ago
                          </span>
                        </div>

                        {/* Row 3 — AI reason */}
                        {aiText && (
                          <div className="flex items-start gap-2 pt-3 border-t border-border/60">
                            <span
                              className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                              style={{
                                color: "var(--status-ai)",
                                background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                              }}
                            >
                              ✦ AI
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {aiText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </section>

        {/* Recent Meetings */}
        <section>
          <SectionHeader
            title="Recent Meetings"
            badge={`${meetings.length} this week`}
          />

          <div className="space-y-3">
            {!mounted
              ? [0, 1, 2].map((i) => <MeetingSkeleton key={i} />)
              : meetings.map(({ meeting, company, mentor }) => {
                  const { color, background } = signalStyle(meeting.signal);

                  return (
                    <div
                      key={meeting.id}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      {/* Row 1 — name + signal badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-[15px] truncate">
                            {company.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {mentor.name} &middot; {String(meeting.date).slice(0, 10)}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                          style={{ color, background }}
                        >
                          {meeting.signal}
                        </span>
                      </div>

                      {/* Row 2 — AI summary */}
                      {meeting.aiSummary && (
                        <div className="flex items-start gap-2 mt-3">
                          <span
                            className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                            style={{
                              color: "var(--status-ai)",
                              background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                            }}
                          >
                            ✦ AI
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {meeting.aiSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        </section>
      </main>
    </>
  );
}
