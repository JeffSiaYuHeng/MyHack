"use client";

import { useState, useEffect } from "react";
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
  const styles = {
    critical: {
      background: "var(--status-critical-bg)",
      color: "var(--status-critical)",
    },
    "at-risk": {
      background: "var(--status-risk-bg)",
      color: "var(--status-risk)",
    },
    healthy: {
      background: "var(--status-healthy-bg)",
      color: "var(--status-healthy)",
    },
  };
  const labels = { critical: "Critical", "at-risk": "At Risk", healthy: "Healthy" };
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={styles[status]}
    >
      {labels[status]}
    </span>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const isPositive = signal === "Positive";
  const isFriction = signal === "Friction detected";
  const style = isPositive
    ? { background: "var(--status-healthy-bg)", color: "var(--status-healthy)" }
    : isFriction
      ? { background: "var(--status-critical-bg)", color: "var(--status-critical)" }
      : undefined;
  const className = `text-[10px] font-medium px-2 py-0.5 rounded-full ${
    !isPositive && !isFriction ? "bg-muted text-muted-foreground" : ""
  }`;
  return (
    <span className={className} style={style}>
      {signal}
    </span>
  );
}

function HealthBar({ score }: { score: number }) {
  const color =
    score < 40
      ? "var(--status-critical)"
      : score < 70
        ? "var(--status-risk)"
        : "var(--status-healthy)";
  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">Health Score</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold w-6 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function AiBadge() {
  return (
    <span
      className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
      style={{
        background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
        color: "var(--status-ai)",
      }}
    >
      ✦ AI
    </span>
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
      {/* Stat Bar */}
      <div className="bg-card border-b border-border py-4 px-4 md:px-8 flex items-center justify-between">
        {/* Group A */}
        <div className="flex items-center gap-8">
          {[
            { label: "Programmes", value: summary.activeProgramCount },
            { label: "Cohorts", value: summary.activeCohortCount },
            { label: "Applications", value: summary.submittedApplicationCount },
            { label: "Approved", value: summary.approvedApplicationCount },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-semibold text-foreground tabular-nums leading-none">
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border mx-4 shrink-0" />

        {/* Group B */}
        <div className="flex items-center gap-8">
          <div>
            <p
              className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: "var(--status-healthy)" }}
            >
              {summary.healthyRelationshipCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Healthy</p>
          </div>
          <div>
            <p
              className="text-3xl font-bold tabular-nums leading-none"
              style={{ color: "var(--status-risk)" }}
            >
              {atRiskCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">At Risk</p>
          </div>
          <div>
            {criticalCount > 0 ? (
              <span className="relative inline-block">
                <span
                  className="absolute -inset-1 rounded-full animate-ping"
                  style={{ background: "color-mix(in srgb, var(--status-critical) 10%, transparent)" }}
                />
                <p
                  className="text-3xl font-bold tabular-nums leading-none relative"
                  style={{ color: "var(--status-critical)" }}
                >
                  {criticalCount}
                </p>
              </span>
            ) : (
              <p
                className="text-3xl font-bold tabular-nums leading-none"
                style={{ color: "var(--status-critical)" }}
              >
                {criticalCount}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">Critical</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground tabular-nums leading-none">
              {summary.activeRelationshipCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Relationships</p>
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
              const accentColor =
                status === "critical"
                  ? "var(--status-critical)"
                  : status === "at-risk"
                    ? "var(--status-risk)"
                    : "var(--status-healthy)";

              return (
                <div
                  key={relationship.id}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={
                    {
                      "--hover-border": "var(--status-ai)",
                    } as React.CSSProperties
                  }
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ background: accentColor }}
                  />

                  <div className="pl-5 pr-4 py-4">
                    {/* Row 1 */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground text-[15px]">
                          {company.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{mentor.name}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Row 2 — health bar */}
                    <HealthBar score={relationship.healthScore} />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">
                        · {urgency.daysSinceLastMeeting}d ago
                      </span>
                    </div>

                    {/* Row 3 — AI reason */}
                    {relationship.aiDiagnosis && (
                      <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-2">
                        <AiBadge />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {relationship.aiDiagnosis}
                        </p>
                      </div>
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
