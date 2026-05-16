"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  Relationship,
  Company,
  Mentor,
  Meeting,
  Cohort,
  Program,
  TimestampLike,
} from "@/lib/types";
import type { RelationshipUrgencyLevel } from "@/lib/verrier-analytics";
import {
  getHealthBand,
  getHealthBandLabel,
  getRelationshipUrgency,
} from "@/lib/verrier-analytics";

const MILESTONE_LABELS = ["Discovery", "Alignment", "Execution", "Scaling", "Completion"];

const HEALTH_COLORS: Record<"healthy" | "at-risk" | "critical", string> = {
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

const SIGNAL_COLOR: Record<Meeting["signal"], string> = {
  Positive: "var(--status-healthy)",
  Neutral: "var(--muted-foreground)",
  "Friction detected": "var(--status-critical)",
};

const SIGNAL_BG: Record<Meeting["signal"], string> = {
  Positive: "var(--status-healthy-bg)",
  Neutral: "var(--muted)",
  "Friction detected": "var(--status-critical-bg)",
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

interface RelationshipDetailProps {
  relationship: Relationship;
  company: Company;
  mentor: Mentor;
  cohort: Cohort;
  program: Program;
  meetings: Meeting[];
}

export function RelationshipDetail({
  relationship,
  company,
  mentor,
  cohort,
  program,
  meetings,
}: RelationshipDetailProps) {
  const [uploadOpen, setUploadOpen] = useState(false);

  const band = getHealthBand(relationship.healthScore);
  const healthColor = HEALTH_COLORS[band];
  const urgency = getRelationshipUrgency(relationship, meetings);

  const sortedMeetings = [...meetings].sort((a, b) => a.meetingNumber - b.meetingNumber);

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Back link */}
      <Link
        href="/relationships"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Relationships
      </Link>

      {/* Pair header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div
          className="h-1 w-full"
          style={{ background: healthColor }}
        />
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-foreground">{company.name}</h1>
                <span className="text-muted-foreground text-sm">×</span>
                <p className="text-base font-medium text-muted-foreground">{mentor.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: healthColor, background: `color-mix(in srgb, ${healthColor} 12%, transparent)` }}
                >
                  {getHealthBandLabel(band)}
                </span>
                {urgency.level !== "healthy" && (
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: urgencyLevelColor(urgency.level),
                      background: `color-mix(in srgb, ${urgencyLevelColor(urgency.level)} 10%, transparent)`,
                    }}
                  >
                    {urgency.label}
                  </span>
                )}
                <span className="text-[10px] border border-border rounded-full px-2 py-0.5 text-muted-foreground capitalize">
                  {relationship.status}
                </span>
                <span className="text-[10px] border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                  {cohort.name}
                </span>
                <span className="text-[10px] text-muted-foreground">{program.name}</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-4xl font-bold leading-none" style={{ color: healthColor }}>
                  {relationship.healthScore}
                </span>
                <span className="text-lg font-semibold" style={{ color: TREND_COLOR[relationship.healthTrend] }}>
                  {TREND_SYMBOL[relationship.healthTrend]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Health Score</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { label: "Meetings", value: relationship.meetingCount },
              { label: "Days since last", value: `${urgency.daysSinceLastMeeting}d` },
              { label: "Match score", value: relationship.matchScore },
              { label: "Milestone", value: `${relationship.currentMilestone} / 5` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-semibold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* AI diagnosis */}
          {relationship.aiDiagnosis && (
            <div className="mt-4 pt-4 border-t border-border flex items-start gap-2">
              <span
                className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                style={{
                  background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                  color: "var(--status-ai)",
                }}
              >
                ✦ AI
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{relationship.aiDiagnosis}</p>
            </div>
          )}

          {/* Watch points */}
          {relationship.watchPoints.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {relationship.watchPoints.map((w, i) => (
                <span
                  key={i}
                  className="text-[10px] border rounded-full px-2.5 py-0.5"
                  style={{ color: "var(--status-risk)", borderColor: "var(--status-risk)" }}
                >
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-column: milestones + match breakdown | meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Milestones */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-4">
              Milestones
            </p>
            <div className="flex items-start gap-0">
              {MILESTONE_LABELS.map((label, index) => {
                const num = index + 1;
                const completed = relationship.milestonesCompleted.includes(num);
                const current = !completed && num === relationship.currentMilestone;
                const completedAt = relationship.milestoneCompletedAt[num];

                return (
                  <div key={num} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-center">
                      {index > 0 && (
                        <div
                          className="flex-1 h-0.5"
                          style={{ backgroundColor: completed ? "var(--status-healthy)" : "var(--border)" }}
                        />
                      )}
                      <div
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold"
                        style={{
                          borderColor: completed ? "var(--status-healthy)" : current ? "var(--primary)" : "var(--border)",
                          backgroundColor: completed ? "var(--status-healthy)" : current ? "var(--primary)" : "transparent",
                          color: completed || current ? "#fff" : "var(--muted-foreground)",
                        }}
                      >
                        {completed ? "✓" : num}
                      </div>
                      {index < MILESTONE_LABELS.length - 1 && (
                        <div
                          className="flex-1 h-0.5"
                          style={{
                            backgroundColor:
                              completed && relationship.milestonesCompleted.includes(num + 1)
                                ? "var(--status-healthy)"
                                : "var(--border)",
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="text-[9px] mt-1.5 text-center leading-tight font-medium"
                      style={{
                        color: completed ? "var(--status-healthy)" : current ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      {label}
                    </p>
                    {completedAt && (
                      <p className="text-[8px] text-muted-foreground mt-0.5 text-center">
                        {formatDate(completedAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
              Match Breakdown
            </p>
            <p className="text-xs text-muted-foreground italic mb-3 leading-relaxed">
              {relationship.matchReason}
            </p>
            <div className="space-y-2.5">
              {(
                [
                  ["industryMatch", "Industry"],
                  ["stageFit", "Stage"],
                  ["availability", "Availability"],
                  ["styleCompatibility", "Style"],
                ] as [keyof Relationship["matchBreakdown"], string][]
              ).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${relationship.matchBreakdown[key]}%`, backgroundColor: "var(--primary)" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">
                    {relationship.matchBreakdown[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
              Mentor
            </p>
            <p className="text-sm font-semibold text-foreground">{mentor.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mentor.currentRole} at {mentor.company}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {mentor.mentorshipStyle} · {mentor.availabilityHoursPerMonth}h/month
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 4).map((e) => (
                <span key={e} className="text-[10px] bg-muted border border-border rounded-full px-2 py-0.5">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: meeting timeline */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Meeting Timeline
                <span className="ml-2 normal-case font-normal">({sortedMeetings.length})</span>
              </p>
              <button
                onClick={() => setUploadOpen((prev) => !prev)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                {uploadOpen ? "Cancel" : "Log Meeting"}
              </button>
            </div>

            {uploadOpen && (
              <div className="border-b border-border px-5 py-4 space-y-3 bg-muted/30">
                <p className="text-xs font-medium text-foreground">Log a meeting</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Date</label>
                    <input
                      type="date"
                      disabled
                      className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Duration (min)</label>
                    <input
                      type="number"
                      disabled
                      placeholder="45"
                      className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Meeting notes</label>
                  <textarea
                    disabled
                    rows={3}
                    placeholder="Describe what was discussed, decisions made, and next steps..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-muted text-muted-foreground cursor-not-allowed resize-none"
                  />
                </div>
                <button
                  disabled
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground cursor-not-allowed"
                >
                  Submit & Analyze — AI analysis coming in Block B
                </button>
              </div>
            )}

            {sortedMeetings.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">
                No meetings recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedMeetings.map((meeting) => (
                  <div key={meeting.id} className="px-5 py-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground w-6 shrink-0 mt-0.5">
                          #{meeting.meetingNumber}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {formatDate(meeting.date)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {meeting.durationMinutes} min · {meeting.submittedBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            color: SIGNAL_COLOR[meeting.signal],
                            background: SIGNAL_BG[meeting.signal],
                          }}
                        >
                          {meeting.signal}
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: meeting.healthScoreDelta >= 0 ? "var(--status-healthy)" : "var(--status-critical)",
                          }}
                        >
                          {meeting.healthScoreDelta >= 0 ? "+" : ""}
                          {meeting.healthScoreDelta}
                        </span>
                      </div>
                    </div>

                    <div className="ml-9 flex items-start gap-2">
                      <span
                        className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                        style={{
                          background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                          color: "var(--status-ai)",
                        }}
                      >
                        ✦ AI
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{meeting.aiSummary}</p>
                    </div>

                    {meeting.signalReason && (
                      <p className="ml-9 text-[10px] text-muted-foreground italic">{meeting.signalReason}</p>
                    )}

                    {meeting.actionItems.length > 0 && (
                      <div className="ml-9 space-y-1.5">
                        {meeting.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span
                              className="text-[10px] shrink-0 mt-0.5 font-bold"
                              style={{ color: item.completed ? "var(--status-healthy)" : "var(--muted-foreground)" }}
                            >
                              {item.completed ? "✓" : "○"}
                            </span>
                            <div className="min-w-0">
                              <p
                                className="text-[10px] leading-snug"
                                style={{
                                  color: item.completed ? "var(--muted-foreground)" : "var(--foreground)",
                                  textDecoration: item.completed ? "line-through" : "none",
                                }}
                              >
                                {item.task}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {item.owner}{item.dueDate && ` · due ${item.dueDate}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {meeting.watchPoints.length > 0 && (
                      <div className="ml-9 flex flex-wrap gap-1.5">
                        {meeting.watchPoints.map((w, i) => (
                          <span
                            key={i}
                            className="text-[9px] border rounded-full px-2 py-0.5"
                            style={{ color: "var(--status-risk)", borderColor: "var(--status-risk)" }}
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
