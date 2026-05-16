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

interface AnalysisResult {
  meetingId: string;
  aiSummary: string;
  actionItems: Array<{
    task: string;
    owner: "mentor" | "startup";
    dueDate: string | null;
    completed: boolean;
    completedAt: string | null;
  }>;
  signal: Meeting["signal"];
  signalReason: string;
  healthScoreDelta: number;
  newHealthScore: number;
  watchPoints: string[];
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

  // Diagnosis state — seeded from static data, refreshable via AI
  const [diagnosis, setDiagnosis] = useState<{
    narrative: string;
    watchPoints: string[];
    recommendation: string;
  }>({
    narrative: relationship.aiDiagnosis ?? "",
    watchPoints: relationship.watchPoints ?? [],
    recommendation: "",
  });
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  async function handleRefreshDiagnosis() {
    setIsDiagnosing(true);
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationshipId: relationship.id }),
      });
      const data = (await res.json()) as {
        narrative: string;
        watchPoints: string[];
        recommendation: string;
      };
      setDiagnosis({
        narrative: data.narrative ?? diagnosis.narrative,
        watchPoints: data.watchPoints ?? diagnosis.watchPoints,
        recommendation: data.recommendation ?? "",
      });
    } catch {
      // Silent fail — keep existing data
    } finally {
      setIsDiagnosing(false);
    }
  }

  // Log meeting form state
  const [meetingDate, setMeetingDate] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meetingResult, setMeetingResult] = useState<AnalysisResult | null>(null);
  const [liveHealthScore, setLiveHealthScore] = useState(relationship.healthScore);

  const band = getHealthBand(liveHealthScore);
  const healthColor = HEALTH_COLORS[band];
  const urgency = getRelationshipUrgency(relationship, meetings);

  const sortedMeetings = [...meetings].sort(
    (a, b) => a.meetingNumber - b.meetingNumber
  );

  async function handleLogMeeting() {
    setFormError(null);

    // Validate
    if (!meetingDate) { setFormError("Date is required."); return; }
    const durationNum = Number(duration);
    if (!duration || !Number.isFinite(durationNum) || durationNum <= 0) {
      setFormError("Duration must be a positive number.");
      return;
    }
    if (notes.trim().length < 50) {
      setFormError("Meeting notes must be at least 50 characters.");
      return;
    }

    setIsAnalyzing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/ai/analyze-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          relationshipId: relationship.id,
          date: meetingDate,
          durationMinutes: durationNum,
          rawNotes: notes,
          submittedBy: "admin",
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const msg = typeof errBody.error === "string" ? errBody.error : "Analysis failed.";
        setFormError(msg);
        return;
      }

      const data = (await res.json()) as AnalysisResult;
      setMeetingResult(data);
      setLiveHealthScore((prev) => Math.min(100, Math.max(0, prev + data.healthScoreDelta)));
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      setFormError(
        isTimeout
          ? "Request timed out. Please try again."
          : "Network error. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function resetForm() {
    setMeetingDate("");
    setDuration("");
    setNotes("");
    setFormError(null);
    setMeetingResult(null);
    setUploadOpen(false);
  }

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
              {liveHealthScore}
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
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              AI Diagnosis
            </span>
            <button
              onClick={handleRefreshDiagnosis}
              disabled={isDiagnosing}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
            >
              <span className={isDiagnosing ? "animate-spin inline-block" : "inline-block"}>
                ✦
              </span>
              {isDiagnosing ? "Analyzing..." : "Refresh Diagnosis"}
            </button>
          </div>

          {diagnosis.narrative && (
            <p className="text-xs text-muted-foreground">{diagnosis.narrative}</p>
          )}

          {diagnosis.watchPoints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {diagnosis.watchPoints.map((w, i) => (
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

          {diagnosis.recommendation && (
            <p className="text-xs text-muted-foreground">
              → {diagnosis.recommendation}
            </p>
          )}
        </div>
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
            onClick={() => {
              if (uploadOpen) resetForm();
              else setUploadOpen(true);
            }}
            className="px-2.5 py-1 text-[10px] font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {uploadOpen ? "Cancel" : "Log Meeting"}
          </button>
        </div>

        {/* Meeting log form */}
        {uploadOpen && !meetingResult && (
          <div className="border border-border rounded p-4 mb-3 space-y-3">
            <p className="text-xs font-medium">Log a meeting</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder="45"
                  min={1}
                  className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">
                Meeting notes{" "}
                <span
                  className="ml-1"
                  style={{
                    color:
                      notes.trim().length >= 50
                        ? "var(--status-healthy)"
                        : "var(--muted-foreground)",
                  }}
                >
                  ({notes.trim().length}/50 min)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isAnalyzing}
                rows={4}
                placeholder="Describe what was discussed, decisions made, and next steps..."
                className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed resize-none"
              />
            </div>
            {formError && (
              <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
                {formError}
              </p>
            )}
            <button
              onClick={handleLogMeeting}
              disabled={isAnalyzing}
              className="px-3 py-1.5 text-xs font-medium rounded border border-border transition-colors disabled:cursor-not-allowed"
              style={
                isAnalyzing
                  ? { color: "var(--muted-foreground)", borderColor: "var(--border)" }
                  : { color: "var(--foreground)", borderColor: "var(--foreground)" }
              }
            >
              {isAnalyzing ? (
                <span className="animate-pulse">✦ Analyzing...</span>
              ) : (
                "✦ Submit & Analyze"
              )}
            </button>
          </div>
        )}

        {/* AI result after submission */}
        {uploadOpen && meetingResult && (
          <div className="border border-border rounded p-4 mb-3 space-y-3">
            {/* Result header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    color: "var(--primary)",
                    backgroundColor: "var(--muted)",
                  }}
                >
                  ✦ AI
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: SIGNAL_COLOR[meetingResult.signal] }}
                >
                  {meetingResult.signal}
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color:
                      meetingResult.healthScoreDelta > 0
                        ? "var(--status-healthy)"
                        : meetingResult.healthScoreDelta < 0
                        ? "var(--status-critical)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {meetingResult.healthScoreDelta > 0 ? "+" : ""}
                  {meetingResult.healthScoreDelta} health
                </span>
              </div>
              <button
                onClick={resetForm}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Log another
              </button>
            </div>

            {/* AI summary */}
            <p className="text-xs text-muted-foreground">{meetingResult.aiSummary}</p>

            {/* Signal reason */}
            {meetingResult.signalReason && (
              <p className="text-[10px] text-muted-foreground italic">
                {meetingResult.signalReason}
              </p>
            )}

            {/* Action items */}
            {meetingResult.actionItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Action items
                </p>
                {meetingResult.actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] shrink-0 mt-0.5 text-muted-foreground">○</span>
                    <div className="min-w-0">
                      <p className="text-[10px] leading-snug text-foreground">{item.task}</p>
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
            {meetingResult.watchPoints.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {meetingResult.watchPoints.map((w, i) => (
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
