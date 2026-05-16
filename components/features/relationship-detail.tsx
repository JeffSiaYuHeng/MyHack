"use client";

import { useState } from "react";
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

const MILESTONE_LABELS = [
  "Discovery",
  "Alignment",
  "Execution",
  "Scaling",
  "Completion",
];

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
    return new Date((ts as { seconds: number }).seconds * 1000)
      .toISOString()
      .slice(0, 10);
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

  const sortedMeetings = [...meetings].sort(
    (a, b) => a.meetingNumber - b.meetingNumber
  );

  return (
    <div className="px-4 md:px-12 py-6 space-y-6">
      {/* Pair header */}
      <div className="border border-border rounded px-4 py-4 space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold truncate">
                {company.name}
              </h1>
              <span className="text-muted-foreground text-xs">×</span>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {mentor.name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span
                className="text-[10px] font-medium border rounded px-1.5 py-0.5"
                style={{
                  color: healthColor,
                  borderColor: healthColor,
                }}
              >
                {getHealthBandLabel(band)}
              </span>
              {urgency.level !== "healthy" && (
                <span
                  className="text-[10px] font-medium"
                  style={{ color: urgencyLevelColor(urgency.level) }}
                >
                  {urgency.label}
                </span>
              )}
              <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground capitalize">
                {relationship.status}
              </span>
              <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                {cohort.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {program.name}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Matched</p>
            <p className="text-xs font-medium">
              {formatDate(relationship.matchedAt)}
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="flex flex-wrap gap-4 pt-1 text-[10px]">
          <div className="flex items-baseline gap-1">
            <span
              className="text-lg font-bold leading-none"
              style={{ color: healthColor }}
            >
              {relationship.healthScore}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: TREND_COLOR[relationship.healthTrend] }}
            >
              {TREND_SYMBOL[relationship.healthTrend]}
            </span>
            <span className="text-muted-foreground">health</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {relationship.meetingCount}
            </span>{" "}
            meeting{relationship.meetingCount !== 1 ? "s" : ""}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {urgency.daysSinceLastMeeting}d
            </span>{" "}
            since last
          </div>
          <div className="text-muted-foreground">
            Milestone{" "}
            <span className="font-medium text-foreground">
              {relationship.currentMilestone}
            </span>
          </div>
          <div className="text-muted-foreground">
            Match{" "}
            <span className="font-medium text-foreground">
              {relationship.matchScore}
            </span>
          </div>
          <div className="text-muted-foreground">
            {mentor.mentorshipStyle} &middot; {mentor.currentRole} at {mentor.company}
          </div>
        </div>

        {/* Urgency reason */}
        <p className="text-xs text-muted-foreground pt-1">{urgency.reason}</p>

        {/* AI diagnosis */}
        {relationship.aiDiagnosis && (
          <p className="text-xs text-muted-foreground">
            {relationship.aiDiagnosis}
          </p>
        )}

        {/* Watch points */}
        {relationship.watchPoints.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {relationship.watchPoints.map((w, i) => (
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
      </div>

      {/* Milestone tracker */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Milestones
        </p>
        <div className="flex items-start gap-0">
          {MILESTONE_LABELS.map((label, index) => {
            const num = index + 1;
            const completed = relationship.milestonesCompleted.includes(num);
            const current =
              !completed && num === relationship.currentMilestone;
            const completedAt = relationship.milestoneCompletedAt[num];

            return (
              <div key={num} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-center">
                  {index > 0 && (
                    <div
                      className="flex-1 h-0.5"
                      style={{
                        backgroundColor: completed
                          ? "var(--status-healthy)"
                          : "var(--border)",
                      }}
                    />
                  )}
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-semibold"
                    style={{
                      borderColor: completed
                        ? "var(--status-healthy)"
                        : current
                        ? "var(--primary)"
                        : "var(--border)",
                      backgroundColor: completed
                        ? "var(--status-healthy)"
                        : current
                        ? "var(--primary)"
                        : "transparent",
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
                  className="text-[9px] mt-1 text-center leading-tight"
                  style={{
                    color: completed
                      ? "var(--status-healthy)"
                      : current
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
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

      {/* Meeting timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Meeting timeline ({sortedMeetings.length})
          </p>
          <button
            onClick={() => setUploadOpen((prev) => !prev)}
            className="px-2.5 py-1 text-[10px] font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {uploadOpen ? "Cancel" : "Log Meeting"}
          </button>
        </div>

        {/* Meeting upload shell */}
        {uploadOpen && (
          <div className="border border-border rounded p-4 mb-3 space-y-3">
            <p className="text-xs font-medium">Log a meeting</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  disabled
                  className="w-full border border-border rounded px-2 py-1.5 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  disabled
                  placeholder="45"
                  className="w-full border border-border rounded px-2 py-1.5 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">
                Meeting notes
              </label>
              <textarea
                disabled
                rows={3}
                placeholder="Describe what was discussed, decisions made, and next steps..."
                className="w-full border border-border rounded px-2 py-1.5 text-xs bg-muted text-muted-foreground cursor-not-allowed resize-none"
              />
            </div>
            <button
              disabled
              className="px-3 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground cursor-not-allowed"
            >
              Submit & Analyze — AI analysis coming in Block B
            </button>
          </div>
        )}

        {sortedMeetings.length === 0 ? (
          <div className="border border-border rounded p-6 text-sm text-muted-foreground">
            No meetings recorded for this relationship yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-border rounded p-4 space-y-2"
              >
                {/* Meeting header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground w-5 shrink-0">
                      #{meeting.meetingNumber}
                    </span>
                    <div>
                      <p className="text-xs font-medium">
                        {formatDate(meeting.date)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {meeting.durationMinutes} min &middot; by{" "}
                        {meeting.submittedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: SIGNAL_COLOR[meeting.signal] }}
                    >
                      {meeting.signal}
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color:
                          meeting.healthScoreDelta >= 0
                            ? "var(--status-healthy)"
                            : "var(--status-critical)",
                      }}
                    >
                      {meeting.healthScoreDelta >= 0 ? "+" : ""}
                      {meeting.healthScoreDelta}
                    </span>
                  </div>
                </div>

                {/* AI summary */}
                <p className="text-xs text-muted-foreground ml-5">
                  {meeting.aiSummary}
                </p>

                {/* Signal reason */}
                <p className="text-[10px] text-muted-foreground ml-5 italic">
                  {meeting.signalReason}
                </p>

                {/* Action items */}
                {meeting.actionItems.length > 0 && (
                  <div className="ml-5 space-y-1">
                    {meeting.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="text-[10px] shrink-0 mt-0.5"
                          style={{
                            color: item.completed
                              ? "var(--status-healthy)"
                              : "var(--muted-foreground)",
                          }}
                        >
                          {item.completed ? "✓" : "○"}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-[10px] leading-snug"
                            style={{
                              color: item.completed
                                ? "var(--muted-foreground)"
                                : "var(--foreground)",
                              textDecoration: item.completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {item.task}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {item.owner}
                            {item.dueDate && ` · due ${item.dueDate}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Watch points */}
                {meeting.watchPoints.length > 0 && (
                  <div className="ml-5 flex flex-wrap gap-1.5">
                    {meeting.watchPoints.map((w, i) => (
                      <span
                        key={i}
                        className="text-[9px] border rounded px-1 py-0.5"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
