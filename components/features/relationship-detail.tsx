"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type {
  Cohort,
  Company,
  Meeting,
  Mentor,
  Program,
  Relationship,
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

function urgencyLevelColor(level: RelationshipUrgencyLevel): string {
  if (level === "critical") return "var(--status-critical)";
  if (level === "stale" || level === "watch") return "var(--status-risk)";
  if (level === "healthy") return "var(--status-healthy)";
  return "var(--muted-foreground)";
}

function formatDate(ts: TimestampLike): string {
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  if (typeof ts === "number") return new Date(ts).toISOString().slice(0, 10);
  if (typeof ts === "object" && "seconds" in ts) {
    return new Date(ts.seconds * 1000).toISOString().slice(0, 10);
  }
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

interface DiagnosisResult {
  narrative: string;
  watchPoints: string[];
  recommendation: string;
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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>({
    narrative: relationship.aiDiagnosis,
    watchPoints: relationship.watchPoints,
    recommendation: "",
  });
  const [diagnosisState, setDiagnosisState] = useState<"idle" | "loading" | "error">("idle");
  const [uploadOpen, setUploadOpen] = useState(false);
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
  const sortedMeetings = [...meetings].sort((a, b) => b.meetingNumber - a.meetingNumber);
  const meetingSignalClass =
    meetingResult?.signal === "Positive"
      ? "bg-[var(--status-healthy-bg)] text-[var(--status-healthy)]"
      : meetingResult?.signal === "Friction detected"
        ? "bg-[var(--status-critical-bg)] text-[var(--status-critical)]"
        : "bg-muted text-muted-foreground";

  async function handleRefreshDiagnosis() {
    setDiagnosisState("loading");
    const toastId = toast.loading("Refreshing diagnosis...");
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationshipId: relationship.id }),
      });

      if (!res.ok) {
        setDiagnosisState("error");
        toast.error("Diagnosis request failed.", { id: toastId });
        return;
      }

      const data = (await res.json()) as DiagnosisResult;
      setDiagnosis({
        narrative: data.narrative || diagnosis.narrative,
        watchPoints: data.watchPoints || diagnosis.watchPoints,
        recommendation: data.recommendation || "",
      });
      setDiagnosisState("idle");
      toast.success("Diagnosis refreshed.", { id: toastId });
    } catch {
      setDiagnosisState("error");
      toast.error("Diagnosis request failed.", { id: toastId });
    }
  }

  async function handleLogMeeting() {
    if (notes.length < 50) {
      toast.error("Notes must be at least 50 characters");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipId: relationship.id,
          date: meetingDate,
          durationMinutes: Number(duration),
          rawNotes: notes,
          submittedBy: "admin",
        }),
      });
      const data = (await res.json()) as AnalysisResult;
      setMeetingResult(data);
      setLiveHealthScore((prev) =>
        Math.min(100, Math.max(0, prev + (data.healthScoreDelta ?? 0)))
      );
      toast.success("Meeting analyzed");
    } catch {
      toast.error("Analysis failed, please retry");
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
    <div className="px-6 md:px-10 py-8 space-y-6">
      <Link
        href="/relationships"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Relationships
      </Link>

      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-1 w-full" style={{ background: healthColor }} />
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
                  style={{
                    color: healthColor,
                    background: `color-mix(in srgb, ${healthColor} 12%, transparent)`,
                  }}
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
                <span className="text-[10px] border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                  {cohort.name}
                </span>
                <span className="text-[10px] text-muted-foreground">{program.name}</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-4xl font-bold leading-none" style={{ color: healthColor }}>
                  {liveHealthScore}
                </span>
                <span className="text-lg font-semibold" style={{ color: TREND_COLOR[relationship.healthTrend] }}>
                  {TREND_SYMBOL[relationship.healthTrend]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Health Score</p>
              <button
                onClick={() => {
                  const token = relationship.mentorId;
                  const url = `${window.location.origin}/submit-meeting?token=${token}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Mentor link copied to clipboard");
                }}
                className="mt-3 ml-auto text-xs px-3 py-1.5 border border-border rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 flex items-center gap-1.5"
              >
                ⎘ Copy Mentor Link
              </button>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                /submit-meeting?token={relationship.mentorId}
              </p>
            </div>
          </div>

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
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Milestones
            </p>
            <div className="space-y-2">
              {MILESTONE_LABELS.map((label, index) => {
                const num = index + 1;
                const completed = relationship.milestonesCompleted.includes(num);
                const current = !completed && num === relationship.currentMilestone;
                return (
                  <div key={num} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold"
                      style={{
                        borderColor: completed ? "var(--status-healthy)" : current ? "var(--primary)" : "var(--border)",
                        backgroundColor: completed ? "var(--status-healthy)" : current ? "var(--primary)" : "transparent",
                        color: completed || current ? "#fff" : "var(--muted-foreground)",
                      }}
                    >
                      {completed ? "✓" : num}
                    </span>
                    <span className="text-xs text-foreground">{label}</span>
                    {relationship.milestoneCompletedAt[num] && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {formatDate(relationship.milestoneCompletedAt[num])}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
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
                  <span className="text-[10px] text-muted-foreground w-6 text-right shrink-0">
                    {relationship.matchBreakdown[key]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                AI Diagnosis
              </p>
              <button
                onClick={() => { void handleRefreshDiagnosis(); }}
                disabled={diagnosisState === "loading"}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: diagnosisState === "loading" ? "transparent" : "rgba(243,100,88,0.08)",
                  color: diagnosisState === "loading" ? "#797979" : "#f36458",
                  border: "1px solid",
                  borderColor: diagnosisState === "loading" ? "#e5e5e5" : "rgba(243,100,88,0.3)",
                }}
              >
                {diagnosisState === "loading" ? "Diagnosing…" : "Refresh"}
              </button>
            </div>
            <div className="rounded-md p-3" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">✦ AI</span>
                <p className="text-[9px] font-bold uppercase tracking-widest font-mono" style={{ color: "var(--status-ai)" }}>
                  Diagnosis
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground italic">{diagnosis.narrative}</p>
              {diagnosis.recommendation && (
                <p className="text-xs mt-2 leading-relaxed text-muted-foreground">
                  {diagnosis.recommendation}
                </p>
              )}
            </div>
            {diagnosisState === "error" && (
              <p className="text-[10px] mt-2" style={{ color: "var(--status-critical)" }}>
                Diagnosis request failed. Existing diagnosis shown.
              </p>
            )}
            {diagnosis.watchPoints.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {diagnosis.watchPoints.map((watchPoint) => (
                  <span
                    key={watchPoint}
                    className="text-[10px] border rounded-full px-2 py-0.5"
                    style={{ color: "var(--status-risk)", borderColor: "var(--status-risk)" }}
                  >
                    {watchPoint}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Meeting Timeline <span className="ml-2 normal-case font-normal">({sortedMeetings.length})</span>
            </p>
            <button
              onClick={() => {
                if (uploadOpen) resetForm();
                else setUploadOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
            >
              {uploadOpen ? "Cancel" : "Log Meeting"}
            </button>
          </div>

          {uploadOpen && !meetingResult && (
            <div className="border-b border-border px-5 py-4 space-y-3 bg-muted/30">
              <p className="text-xs font-medium text-foreground">Log a meeting</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] text-muted-foreground block mb-1">Date</span>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-muted-foreground block mb-1">Duration (min)</span>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="45"
                    min={1}
                    className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] text-muted-foreground block mb-1">
                  Meeting notes ({notes.trim().length}/50 min)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe what was discussed, decisions made, and next steps..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-xs bg-background text-foreground resize-none"
                />
              </label>
              {formError && (
                <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
                  {formError}
                </p>
              )}
              <button
                onClick={() => { void handleLogMeeting(); }}
                disabled={isAnalyzing}
                className="px-5 py-2 text-xs font-bold rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: isAnalyzing ? "transparent" : "#f36458",
                  color: isAnalyzing ? "#797979" : "#ffffff",
                  border: isAnalyzing ? "1px solid #e5e5e5" : "1px solid #f36458",
                }}
              >
                {isAnalyzing ? "✦ Analyzing…" : "Submit & Analyze"}
              </button>
            </div>
          )}

          {meetingResult && (
            <div className="border-b border-border px-5 py-4 bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">
                  ✦ AI
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meetingSignalClass}`}>
                  {meetingResult.signal}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: meetingResult.healthScoreDelta >= 0
                      ? "var(--status-healthy)"
                      : "var(--status-critical)",
                  }}
                >
                  {meetingResult.healthScoreDelta >= 0 ? "+" : ""}
                  {meetingResult.healthScoreDelta}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{meetingResult.aiSummary}</p>
              {meetingResult.actionItems.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Action Items
                  </p>
                  <ul className="space-y-1.5">
                    {meetingResult.actionItems.map((item, index) => (
                      <li key={`${item.task}-${index}`} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground capitalize">{item.owner}</span>
                        {" — "}
                        {item.task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={resetForm}
                className="mt-3 px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {sortedMeetings.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">No meetings recorded yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {sortedMeetings.map((meeting) => (
                <article key={meeting.id} className="px-5 py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        #{meeting.meetingNumber} · {formatDate(meeting.date)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {meeting.durationMinutes} min · {meeting.submittedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted"
                        style={{ color: SIGNAL_COLOR[meeting.signal] }}
                      >
                        {meeting.signal}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: meeting.healthScoreDelta >= 0
                            ? "var(--status-healthy)"
                            : "var(--status-critical)",
                        }}
                      >
                        {meeting.healthScoreDelta >= 0 ? "+" : ""}
                        {meeting.healthScoreDelta}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{meeting.aiSummary}</p>
                  {meeting.actionItems.length > 0 && (
                    <div className="space-y-1.5">
                      {meeting.actionItems.map((item) => (
                        <div key={`${meeting.id}-${item.task}`} className="flex items-start gap-2">
                          <span
                            className="text-[10px] shrink-0 mt-0.5 font-bold"
                            style={{ color: item.completed ? "var(--status-healthy)" : "var(--muted-foreground)" }}
                          >
                            {item.completed ? "✓" : "○"}
                          </span>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            {item.task}
                            {item.dueDate ? ` · due ${item.dueDate}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
