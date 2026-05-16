"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Rocket, 
  CloudSync, 
  Zap,
  ArrowLeft,
  Copy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const HEALTH_COLORS: Record<"healthy" | "at-risk" | "critical", string> = {
  healthy: COLORS.primary,
  "at-risk": COLORS.secondary,
  critical: COLORS.error,
};

const STATUS_BG: Record<"healthy" | "at-risk" | "critical", string> = {
  healthy: "#e9ddff", // primary-fixed
  "at-risk": "#ffdad8", // secondary-fixed
  critical: "#ffdad6", // error-container
};

const STATUS_TEXT: Record<"healthy" | "at-risk" | "critical", string> = {
  healthy: "#23005c", // on-primary-fixed
  "at-risk": "#410007", // on-secondary-fixed
  critical: "#93000a", // on-error-container
};

const TREND_ICON = {
  improving: TrendingUp,
  stable: Minus,
  deteriorating: TrendingDown,
};

const SIGNAL_ICON = {
  Positive: CheckCircle2,
  Neutral: Minus,
  "Friction detected": AlertCircle,
};

function urgencyLevelColor(level: RelationshipUrgencyLevel): string {
  if (level === "critical") return COLORS.error;
  if (level === "stale" || level === "watch") return COLORS.secondary;
  if (level === "healthy") return COLORS.primary;
  return COLORS.outline;
}

function formatDate(ts: TimestampLike): string {
  if (!ts) return "—";
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  if (typeof ts === "number") return new Date(ts).toISOString().slice(0, 10);
  if (typeof ts === "object" && "seconds" in ts) {
    return new Date(ts.seconds * 1000).toISOString().slice(0, 10);
  }
  return String(ts);
}

function DetailSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="bg-white border border-[#cbc3d7] rounded-xl p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-6">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-7 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-12 w-20 ml-auto" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
        <div className="border-t border-[#cbc3d7] pt-6 grid grid-cols-4 gap-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const band = getHealthBand(liveHealthScore);
  const healthColor = HEALTH_COLORS[band];
  const urgency = getRelationshipUrgency(relationship, meetings);
  const sortedMeetings = [...meetings].sort((a, b) => b.meetingNumber - a.meetingNumber);
  const TrendIcon = TREND_ICON[relationship.healthTrend];

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

  if (!mounted) return <DetailSkeleton />;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Link
        href="/relationships"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#494454] hover:text-[#6b38d4] transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Relationships
      </Link>

      <section className="bg-white border border-[#cbc3d7] rounded-xl overflow-hidden shadow-sm border-l-4" style={{ borderLeftColor: healthColor }}>
        <div className="px-8 py-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex gap-6">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center border border-[#cbc3d7]"
                style={{ background: STATUS_BG[band] }}
              >
                {band === "healthy" ? (
                  <Rocket size={40} style={{ color: COLORS.primary }} />
                ) : band === "at-risk" ? (
                  <CloudSync size={40} style={{ color: COLORS.secondary }} />
                ) : (
                  <Zap size={40} style={{ color: COLORS.error }} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#1b1c1a]" style={{ fontFamily: "Source Serif 4, serif" }}>
                    {company.name}
                  </h1>
                  <span className="text-[#cbc3d7] text-lg">×</span>
                  <p className="text-xl font-medium text-[#494454]">{mentor.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap mt-3">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      color: STATUS_TEXT[band],
                      background: STATUS_BG[band],
                    }}
                  >
                    {getHealthBandLabel(band)}
                  </span>
                  {urgency.level !== "healthy" && (
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        color: urgencyLevelColor(urgency.level),
                        background: `${urgencyLevelColor(urgency.level)}1A`,
                      }}
                    >
                      {urgency.label}
                    </span>
                  )}
                  <span className="text-xs text-[#494454] border border-[#cbc3d7] rounded-full px-3 py-1 bg-[#f5f4f0]">
                    {cohort.name} · {program.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-baseline gap-2 justify-end" style={{ color: healthColor }}>
                <span className="text-5xl font-bold tracking-tighter">
                  {liveHealthScore}
                </span>
                <TrendIcon size={24} />
              </div>
              <p className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider mt-1">Health Score</p>
              
              <div className="mt-4 flex flex-col items-end gap-2">
                <button
                  onClick={() => {
                    const token = relationship.mentorId;
                    const url = `${window.location.origin}/submit-meeting?token=${token}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Mentor link copied to clipboard");
                  }}
                  className="text-xs px-4 py-2 border border-[#cbc3d7] rounded-full text-[#494454] hover:text-[#6b38d4] hover:border-[#6b38d4] transition-all flex items-center gap-2 bg-[#f5f4f0]"
                >
                  <Copy size={14} />
                  Copy Mentor Link
                </button>
                <code className="text-[10px] text-[#7b7486] bg-[#efeeea] px-2 py-0.5 rounded">
                  /submit-meeting?token={relationship.mentorId.slice(0, 8)}...
                </code>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#cbc3d7] grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: "Meetings", value: relationship.meetingCount, icon: Calendar },
              { label: "Last Activity", value: `${urgency.daysSinceLastMeeting}d ago`, icon: Clock },
              { label: "Match Score", value: `${relationship.matchScore}%`, icon: Zap },
              { label: "Current Phase", value: MILESTONE_LABELS[relationship.currentMilestone - 1] || "Discovery", icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-medium text-[#7b7486] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon size={12} className="text-[#cbc3d7]" />
                  {label}
                </p>
                <p className="text-lg font-bold text-[#1b1c1a]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-8">
          <section className="bg-white border border-[#cbc3d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#7b7486] uppercase tracking-widest mb-6">Relationship Milestones</h3>
            <div className="space-y-4">
              {MILESTONE_LABELS.map((label, index) => {
                const num = index + 1;
                const completed = relationship.milestonesCompleted.includes(num);
                const current = !completed && num === relationship.currentMilestone;
                return (
                  <div key={num} className="flex items-center gap-4 group">
                    <div 
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        borderColor: completed ? COLORS.primary : current ? COLORS.primary : "#efeeea",
                        backgroundColor: completed ? COLORS.primary : "transparent",
                        color: completed ? "#fff" : current ? COLORS.primary : "#cbc3d7",
                      }}
                    >
                      {completed ? <CheckCircle2 size={16} /> : num}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${completed || current ? "text-[#1b1c1a]" : "text-[#cbc3d7]"}`}>
                        {label}
                      </p>
                      {relationship.milestoneCompletedAt[num] && (
                        <p className="text-[10px] text-[#7b7486]">
                          {formatDate(relationship.milestoneCompletedAt[num])}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-[#cbc3d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-[#7b7486] uppercase tracking-widest mb-4">Match Breakdown</h3>
            <p className="text-xs text-[#494454] italic mb-6 leading-relaxed bg-[#f5f4f0] p-3 rounded-lg border border-[#cbc3d7]">
              &quot;{relationship.matchReason}&quot;
            </p>
            <div className="space-y-4">
              {(
                [
                  ["industryMatch", "Industry Fit"],
                  ["stageFit", "Stage Alignment"],
                  ["availability", "Availability"],
                  ["styleCompatibility", "Style Compatibility"],
                ] as [keyof Relationship["matchBreakdown"], string][]
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-[#494454]">{label}</span>
                    <span className="text-xs font-bold text-[#1b1c1a]">{relationship.matchBreakdown[key]}%</span>
                  </div>
                  <div className="h-1.5 bg-[#efeeea] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${relationship.matchBreakdown[key]}%`, 
                        backgroundColor: relationship.matchBreakdown[key] < 50 ? COLORS.secondary : COLORS.primary 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#cbc3d7] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-[11px] font-bold text-[#7b7486] uppercase tracking-widest">AI Intelligence</h3>
              <button
                onClick={() => { void handleRefreshDiagnosis(); }}
                disabled={diagnosisState === "loading"}
                className="px-4 py-1.5 text-xs font-bold rounded-full transition-all disabled:opacity-50 border border-[#6b38d4] text-[#6b38d4] hover:bg-[#6b38d4] hover:text-white"
              >
                {diagnosisState === "loading" ? "Analysing…" : "Refresh"}
              </button>
            </div>
            
            <div className="bg-[#F5F3FF] border border-[#e9ddff] p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#6b38d4] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Insight</span>
                <span className="text-xs font-semibold text-[#6b38d4]">Intelligence Summary</span>
              </div>
              
              <p className="text-sm leading-relaxed text-[#494454] italic">
                &quot;{diagnosis.narrative}&quot;
              </p>
              
              {diagnosis.recommendation && (
                <div className="pt-3 border-t border-[#e9ddff]">
                  <p className="text-[10px] font-bold text-[#6b38d4] uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-xs text-[#494454] leading-relaxed">
                    {diagnosis.recommendation}
                  </p>
                </div>
              )}
            </div>

            {diagnosis.watchPoints.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider">Watch Points</p>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.watchPoints.map((wp) => (
                    <span
                      key={wp}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#ffdad8] text-[#ba1a1a] border border-[#ffdad6]"
                    >
                      {wp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="lg:col-span-2 bg-white border border-[#cbc3d7] rounded-xl overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-[#cbc3d7] flex items-center justify-between bg-[#f5f4f0]">
            <div>
              <h3 className="text-lg font-bold text-[#1b1c1a]" style={{ fontFamily: "Source Serif 4, serif" }}>Meeting Timeline</h3>
              <p className="text-xs text-[#494454] mt-0.5">{sortedMeetings.length} sessions recorded</p>
            </div>
            <button
              onClick={() => {
                if (uploadOpen) resetForm();
                else setUploadOpen(true);
              }}
              className={`px-5 py-2 text-xs font-bold rounded-full border transition-all ${
                uploadOpen 
                  ? "bg-[#efeeea] border-[#cbc3d7] text-[#494454]" 
                  : "bg-[#6b38d4] border-[#6b38d4] text-white shadow-sm hover:opacity-90"
              }`}
            >
              {uploadOpen ? "Cancel" : "Log New Meeting"}
            </button>
          </div>

          {uploadOpen && !meetingResult && (
            <div className="px-8 py-8 space-y-6 bg-[#f5f4f0]/50 border-b border-[#cbc3d7]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6b38d4] flex items-center justify-center text-white">
                  <Calendar size={16} />
                </div>
                <h4 className="font-bold text-[#1b1c1a]">New Session Entry</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider">Date of Meeting</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full border border-[#cbc3d7] rounded-xl px-4 py-2.5 text-sm bg-white text-[#1b1c1a] focus:ring-2 focus:ring-[#6b38d4] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full border border-[#cbc3d7] rounded-xl px-4 py-2.5 text-sm bg-white text-[#1b1c1a] focus:ring-2 focus:ring-[#6b38d4] transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#7b7486] uppercase tracking-wider">Session Notes & Observations</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Summarize the core discussion, milestones reached, and any friction points observed..."
                  className="w-full border border-[#cbc3d7] rounded-xl px-4 py-3 text-sm bg-white text-[#1b1c1a] focus:ring-2 focus:ring-[#6b38d4] transition-all resize-none leading-relaxed"
                />
                <p className="text-[10px] text-[#7b7486] flex justify-end">
                  {notes.length} / 50 min. characters
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { void handleLogMeeting(); }}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-[#6b38d4] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Performing AI Analysis...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Analyze & Save Session
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {meetingResult && (
            <div className="p-8 bg-[#F5F3FF] border-b border-[#e9ddff] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#6b38d4] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">AI Analysis Complete</span>
                  <div 
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ 
                      background: meetingResult.signal === "Positive" ? "#e9ddff" : "#ffdad6",
                      color: meetingResult.signal === "Positive" ? "#23005c" : "#93000a"
                    }}
                  >
                    {meetingResult.signal}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#494454]">Health Impact</span>
                  <span className={`text-xl font-bold ${meetingResult.healthScoreDelta >= 0 ? "text-[#6b38d4]" : "text-[#ba1a1a]"}`}>
                    {meetingResult.healthScoreDelta >= 0 ? "+" : ""}{meetingResult.healthScoreDelta}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-[#494454] leading-relaxed italic border-l-4 border-[#6b38d4] pl-4">
                  {meetingResult.aiSummary}
                </p>
                
                {meetingResult.actionItems.length > 0 && (
                  <div className="bg-white/50 border border-[#e9ddff] rounded-xl p-5">
                    <h5 className="text-[10px] font-bold text-[#6b38d4] uppercase tracking-widest mb-4">Extracted Action Items</h5>
                    <ul className="space-y-3">
                      {meetingResult.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#494454]">
                          <CheckCircle2 size={16} className="mt-0.5 text-[#cbc3d7]" />
                          <span>
                            <strong className="text-[#1b1c1a] capitalize">{item.owner}</strong>: {item.task}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 text-xs font-bold rounded-full bg-white border border-[#cbc3d7] text-[#494454] hover:bg-[#f5f4f0] transition-all"
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          )}

          {sortedMeetings.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-[#f5f4f0] rounded-full flex items-center justify-center mx-auto text-[#cbc3d7]">
                <Calendar size={32} />
              </div>
              <p className="text-sm text-[#494454]">No mentorship sessions have been recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#cbc3d7]">
              {sortedMeetings.map((meeting) => {
                const SignalIcon = SIGNAL_ICON[meeting.signal] || Minus;
                const signalColor = meeting.signal === "Positive" ? COLORS.primary : meeting.signal === "Neutral" ? COLORS.outline : COLORS.error;
                
                return (
                  <article key={meeting.id} className="p-8 hover:bg-[#f5f4f0]/30 transition-colors space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1b1c1a]">Session #{meeting.meetingNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-[#cbc3d7]"></span>
                          <span className="text-xs text-[#494454]">{formatDate(meeting.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#7b7486] font-medium uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Clock size={10} /> {meeting.durationMinutes} min</span>
                          <span className="flex items-center gap-1"><User size={10} /> {meeting.submittedBy}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border"
                          style={{ color: signalColor, borderColor: `${signalColor}4D`, backgroundColor: `${signalColor}0D` }}
                        >
                          <SignalIcon size={12} />
                          {meeting.signal}
                        </div>
                        <div 
                          className={`text-sm font-bold ${meeting.healthScoreDelta >= 0 ? "text-[#6b38d4]" : "text-[#ba1a1a]"}`}
                        >
                          {meeting.healthScoreDelta >= 0 ? "+" : ""}{meeting.healthScoreDelta}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#494454] leading-relaxed line-clamp-3">
                      {meeting.aiSummary}
                    </p>
                    
                    {meeting.actionItems.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {meeting.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-[#494454]">
                            <div 
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                item.completed ? "bg-[#6b38d4] border-[#6b38d4] text-white" : "border-[#cbc3d7] text-[#cbc3d7]"
                              }`}
                            >
                              {item.completed ? <CheckCircle2 size={10} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                            </div>
                            <span className="truncate">
                              <span className="font-bold text-[#1b1c1a] capitalize">{item.owner}</span>: {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
