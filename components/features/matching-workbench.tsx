"use client";

import { useState, useReducer, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Brain } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ApprovedStartupQueueItem,
  MentorPoolItem,
} from "@/lib/verrier-analytics";

function WorkbenchSkeleton() {
  return (
    <div className="flex gap-6 items-start h-[70vh]">
      <div className="w-64 shrink-0 space-y-3">
        <Skeleton className="h-3 w-16 mb-4" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex-1 bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="bg-background border border-border rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="py-20 text-center space-y-2">
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

interface MatchBreakdown {
  industryMatch: number;
  stageFit: number;
  availability: number;
  styleCompatibility: number;
}

interface MatchResult {
  mentorId: string;
  mentorName: string;
  overallScore: number;
  reason: string;
  breakdown: MatchBreakdown;
}

type MatchState = "idle" | "loading" | "done" | "error";

interface MatchStore {
  matchState: MatchState;
  matches: MatchResult[];
  errorMessage: string | null;
  selectedMentorId: string | null;
  confirmState: "idle" | "confirming" | "confirmed" | "error";
  confirmError: string | null;
  isFallback: boolean;
}

type MatchAction =
  | { type: "RESET" }
  | { type: "START" }
  | { type: "SUCCESS"; matches: MatchResult[]; isFallback?: boolean }
  | { type: "ERROR"; message: string }
  | { type: "SELECT_MENTOR"; mentorId: string | null }
  | { type: "CONFIRM_START" }
  | { type: "CONFIRM_SUCCESS" }
  | { type: "CONFIRM_ERROR"; message: string };

function matchReducer(state: MatchStore, action: MatchAction): MatchStore {
  switch (action.type) {
    case "RESET":
      return INITIAL_STORE;
    case "START":
      return { ...state, matchState: "loading", matches: [], errorMessage: null, selectedMentorId: null, confirmState: "idle", confirmError: null };
    case "SUCCESS":
      return {
        ...state,
        matchState: "done",
        matches: action.matches,
        isFallback: !!action.isFallback,
      };
    case "ERROR":
      return { ...state, matchState: "error", errorMessage: action.message };
    case "SELECT_MENTOR":
      return { ...state, selectedMentorId: action.mentorId, confirmState: "idle", confirmError: null };
    case "CONFIRM_START":
      return { ...state, confirmState: "confirming", confirmError: null };
    case "CONFIRM_SUCCESS":
      return { ...state, confirmState: "confirmed" };
    case "CONFIRM_ERROR":
      return { ...state, confirmState: "error", confirmError: action.message };
  }
}

const INITIAL_STORE: MatchStore = {
  matchState: "idle",
  matches: [],
  errorMessage: null,
  selectedMentorId: null,
  confirmState: "idle",
  confirmError: null,
  isFallback: false,
};

interface MatchingWorkbenchProps {
  initialQueue: ApprovedStartupQueueItem[];
  initialMentorPool: MentorPoolItem[];
  programId: string;
  cohortId: string;
}

const BREAKDOWN_LABELS: [keyof MatchBreakdown, string][] = [
  ["industryMatch", "Industry"],
  ["stageFit", "Stage"],
  ["availability", "Avail."],
  ["styleCompatibility", "Style"],
];

const MATCH_LOADING_STEPS: { label: string; detail: string }[] = [
  { label: "Reading startup profile",   detail: "Goals, stage & industry signals" },
  { label: "Scanning mentor network",   detail: "Skills, sectors & track record" },
  { label: "Evaluating fit",            detail: "Compatibility, style & capacity" },
  { label: "Ranking best matches",      detail: "Scoring by criteria weight" },
];

export function MatchingWorkbench({
  initialQueue,
  initialMentorPool,
  programId,
  cohortId,
}: MatchingWorkbenchProps) {
  const [confirmedStartupIds, setConfirmedStartupIds] = useState<Set<string>>(new Set());
  const [loadingStep, setLoadingStep] = useState(0);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const displayQueue = initialQueue.filter((item) => !confirmedStartupIds.has(item.company.id));

  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    displayQueue[0]?.company.id ?? null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [store, dispatch] = useReducer(matchReducer, INITIAL_STORE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const mentorPoolMap = new Map<string, MentorPoolItem>(
    initialMentorPool.map((p) => [p.mentor.id, p])
  );

  function clearStepTimers() {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
  }

  async function handleGenerateMatches() {
    if (!selectedStartupId) return;

    clearStepTimers();
    dispatch({ type: "START" });
    setLoadingStep(0);

    const STEP_MS = 800;
    const totalSteps = MATCH_LOADING_STEPS.length;

    // Advance one step every STEP_MS — each step "completes" sequentially
    for (let i = 1; i <= totalSteps; i++) {
      stepTimers.current.push(setTimeout(() => setLoadingStep(i), i * STEP_MS));
    }

    // Hold the "finalising" state briefly after all steps finish
    const minDelay = new Promise<void>((resolve) => {
      stepTimers.current.push(setTimeout(resolve, totalSteps * STEP_MS + 600));
    });

    const toastId = toast.loading("Generating mentor matches…");
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 15000);

    try {
      const [res] = await Promise.all([
        fetch("/api/ai/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ startupId: selectedStartupId, programId, cohortId }),
        }),
        minDelay,
      ]);

      clearTimeout(abortTimer);
      clearStepTimers();
      setLoadingStep(totalSteps);

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const message = typeof data.error === "string" ? data.error : "Match request failed.";
        dispatch({ type: "ERROR", message });
        toast.error(message, { id: toastId });
        return;
      }

      const data = (await res.json()) as { matches: MatchResult[] };
      dispatch({ type: "SUCCESS", matches: data.matches ?? [] });
      toast.success(`Generated ${data.matches?.length ?? 0} mentor matches.`, { id: toastId });
    } catch {
      clearTimeout(abortTimer);
      clearStepTimers();
      const message = "Network error. Manual selection is available below.";
      dispatch({ type: "ERROR", message });
      toast.error(message, { id: toastId });
    }
  }

  async function handleConfirm() {
    if (!selectedStartupId || !store.selectedMentorId || store.confirmState === "confirming") return;
    const match = store.matches.find((m) => m.mentorId === store.selectedMentorId);
    if (!match) return;
    setConfirmDialogOpen(false);
    dispatch({ type: "CONFIRM_START" });
    const toastId = toast.loading("Confirming mentor match...");

    try {
      const res = await fetch("/api/relationships/confirm-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupId: selectedStartupId,
          mentorId: store.selectedMentorId,
          programId,
          cohortId,
          matchScore: match.overallScore,
          matchReason: match.reason,
          matchBreakdown: match.breakdown,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const message = typeof data.error === "string" ? data.error : "Confirmation failed.";
        dispatch({ type: "CONFIRM_ERROR", message });
        toast.error(message, { id: toastId });
        return;
      }
      dispatch({ type: "CONFIRM_SUCCESS" });
      toast.success("Match confirmed — relationship created", { id: toastId });
      const nextQueue = displayQueue.filter((item) => item.company.id !== selectedStartupId);
      setConfirmedStartupIds((prev) => new Set([...prev, selectedStartupId]));
      setSelectedStartupId(nextQueue[0]?.company.id ?? null);
      dispatch({ type: "RESET" });
      setTimeout(() => {
        router.push("/relationships");
      }, 1500);
    } catch {
      const message = "Network error during confirmation.";
      dispatch({ type: "CONFIRM_ERROR", message });
      toast.error(message, { id: toastId });
    }
  }

  function selectStartup(id: string) {
    if (id === selectedStartupId) return;
    clearStepTimers();
    setLoadingStep(0);
    setSelectedStartupId(id);
    dispatch({ type: "RESET" });
  }

  const { matchState, matches, errorMessage, selectedMentorId, confirmState, confirmError } = store;
  const selectedStartup = displayQueue.find((item) => item.company.id === selectedStartupId) ?? null;
  const selectedMatch = matches.find((match) => match.mentorId === selectedMentorId) ?? null;

  if (displayQueue.length === 0) {
    return (
      <div className="px-8 md:px-10 py-10">
        <div className="bg-card border border-border rounded-xl p-10 text-sm text-muted-foreground text-center">
          All startups have been matched or none have been approved yet.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Page header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold text-[#1b1c1a] mb-2" style={{ fontFamily: "Source Serif 4, serif" }}>
              Matching Workbench
            </h2>
            <div className="flex items-center gap-4 text-[#494454] text-sm">
              <span className="flex items-center gap-1.5">
                <strong className="text-[#1b1c1a]">{displayQueue.length}</strong> Startups Queue
              </span>
              <span className="w-1 h-1 rounded-full bg-[#cbc3d7]"></span>
              <span className="text-[#6b38d4] font-medium uppercase tracking-widest text-[10px]">
                AI-Assisted Mentor Search
              </span>
            </div>
          </div>
        </div>
      </section>

      {!mounted ? (
        <WorkbenchSkeleton />
      ) : (
        <div className="flex gap-8 items-start">

          {/* Left: Queue column */}
          <div className="w-72 shrink-0 space-y-4">
            <h3 className="text-[11px] font-bold text-[#7b7486] uppercase tracking-widest">Awaiting Match</h3>
            <div className="space-y-3">
              {displayQueue.map((item) => {
                const isSelected = item.company.id === selectedStartupId;
                return (
                  <button
                    key={item.company.id}
                    onClick={() => selectStartup(item.company.id)}
                    className={`w-full text-left p-5 rounded-xl border transition-all hover:shadow-md bg-white ${
                      isSelected 
                        ? "border-[#6b38d4] ring-1 ring-[#6b38d4]" 
                        : "border-[#cbc3d7]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-[#1b1c1a] truncate">{item.company.name}</p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "#e9ddff",
                          color: "#23005c",
                        }}
                      >
                        {item.company.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#494454] mb-4 truncate">
                      {item.company.industry.join(", ")}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#494454]">
                        <span>Fit Score</span>
                        <span>{item.fitScore}%</span>
                      </div>
                      <div className="h-1 bg-[#efeeea] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6b38d4] transition-all duration-500"
                          style={{ width: `${item.fitScore}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Main panel */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#cbc3d7] p-8 space-y-8 min-h-[70vh] shadow-sm">

            {/* Selected startup summary */}
            {selectedStartup && (
              <div className="bg-[#f5f4f0] border border-[#cbc3d7] rounded-xl p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1b1c1a]" style={{ fontFamily: "Source Serif 4, serif" }}>
                      {selectedStartup.company.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-lg"
                        style={{
                          background: "#e9ddff",
                          color: "#23005c",
                        }}
                      >
                        {selectedStartup.company.stage}
                      </span>
                      <span className="text-xs text-[#494454] font-medium">
                        · {selectedStartup.company.industry.join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-3xl font-bold tracking-tighter text-[#6b38d4]">
                    {selectedStartup.fitScore}%
                    <p className="text-[10px] font-bold text-[#7b7486] uppercase tracking-wider text-right">Fit</p>
                  </div>
                </div>
                <p className="text-sm text-[#494454] leading-relaxed mb-8 italic border-l-4 border-[#6b38d4] pl-4">
                  {selectedStartup.supportNeeds.join(" · ")} — {selectedStartup.founderSummary}
                </p>
                <button
                  onClick={() => { void handleGenerateMatches(); }}
                  disabled={matchState === "loading"}
                  className="flex items-center gap-3 px-8 py-3 text-sm font-bold rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
                  style={{
                    background: matchState === "loading" ? "#efeeea" : "#6b38d4",
                    color: matchState === "loading" ? "#7b7486" : "#ffffff",
                  }}
                >
                  <Brain size={18} />
                  {matchState === "loading" ? "Generating Intelligent Matches…" : "Generate AI Matches"}
                </button>
              </div>
            )}

            {/* Idle */}
            {matchState === "idle" && (
              <div className="py-16 text-sm text-muted-foreground text-center">
                Select a startup from the queue, then click Generate AI Matches.
              </div>
            )}

              {/* Loading */}
              {matchState === "loading" && (
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  {/* Top accent bar */}
                  <div
                    className="h-[3px] w-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, var(--status-ai) 40%, var(--status-ai) 60%, transparent 100%)",
                    }}
                  />

                  <div className="px-8 py-8">
                    {/* Orb + headline */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                        {/* Outer ping */}
                        <span
                          className="absolute inset-0 rounded-full animate-ping opacity-[0.08]"
                          style={{ background: "var(--status-ai)" }}
                        />
                        {/* Spinning ring */}
                        <span
                          className="absolute inset-0 rounded-full border-[2.5px] animate-spin"
                          style={{
                            borderColor: "rgba(124,58,237,0.12)",
                            borderTopColor: "var(--status-ai)",
                            animationDuration: "1.1s",
                          }}
                        />
                        {/* Inner pulse ring */}
                        <span
                          className="absolute inset-3 rounded-full animate-pulse opacity-20"
                          style={{ background: "var(--status-ai)" }}
                        />
                        {/* Centre glyph */}
                        <span
                          className="relative text-xl font-bold leading-none select-none"
                          style={{ color: "var(--status-ai)" }}
                        >
                          ✦
                        </span>
                      </div>

                      <p className="text-base font-semibold text-foreground" style={{ letterSpacing: "-0.02em" }}>
                        Finding your ideal mentors
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analysing {initialMentorPool.length} mentor profiles
                      </p>

                      {/* Overall progress bar */}
                      <div className="mt-4 w-48 h-1 rounded-full overflow-hidden bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${(loadingStep / MATCH_LOADING_STEPS.length) * 100}%`,
                            background: "var(--status-ai)",
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                        {Math.round((loadingStep / MATCH_LOADING_STEPS.length) * 100)}%
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="max-w-xs mx-auto">
                      {MATCH_LOADING_STEPS.map(({ label, detail }, index) => {
                        const isDone = loadingStep > index;
                        const isActive = loadingStep === index;
                        const isLast = index === MATCH_LOADING_STEPS.length - 1;

                        return (
                          <div key={label} className="flex gap-4">
                            {/* Track column */}
                            <div className="flex flex-col items-center">
                              {/* Dot */}
                              <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                                {isActive && (
                                  <span
                                    className="absolute inset-0 rounded-full animate-ping opacity-25"
                                    style={{ background: "var(--status-ai)" }}
                                  />
                                )}
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 z-10"
                                  style={
                                    isDone
                                      ? { background: "var(--status-healthy)", color: "#ffffff" }
                                      : isActive
                                      ? { background: "var(--status-ai)", color: "#ffffff" }
                                      : { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }
                                  }
                                >
                                  {isDone ? "✓" : index + 1}
                                </div>
                              </div>
                              {/* Connector */}
                              {!isLast && (
                                <div className="w-px flex-1 my-1 min-h-[28px] rounded-full overflow-hidden bg-border">
                                  <div
                                    className="w-full rounded-full transition-all duration-700 ease-in-out"
                                    style={{
                                      height: isDone ? "100%" : "0%",
                                      background: "var(--status-healthy)",
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                              <p
                                className="text-sm font-semibold leading-tight transition-colors duration-300"
                                style={{
                                  color: isDone
                                    ? "var(--muted-foreground)"
                                    : isActive
                                    ? "var(--foreground)"
                                    : "var(--muted-foreground)",
                                }}
                              >
                                {label}
                              </p>
                              <p
                                className="text-[11px] mt-0.5 transition-colors duration-300"
                                style={{
                                  color: isActive ? "var(--status-ai)" : "var(--muted-foreground)",
                                  opacity: isDone ? 0.5 : 1,
                                }}
                              >
                                {detail}
                              </p>
                              {isActive && (
                                <div className="mt-2 h-1 rounded-full overflow-hidden ai-loading-scan" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Finalising */}
                    {loadingStep >= MATCH_LOADING_STEPS.length && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--status-ai)" }}
                        >
                          Preparing your results
                        </span>
                        <span className="flex items-center gap-1">
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: "var(--status-ai)", animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {matchState === "error" && errorMessage && (
                <div
                  className="bg-background border border-border rounded-xl px-5 py-4 text-xs font-medium"
                  style={{ color: "var(--status-critical)" }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Match results */}
              {(matchState === "done" || matchState === "error") && matches.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Ranked Matches ({matches.length})
                  </p>

                  {matches.map((match, idx) => {
                    const poolItem = mentorPoolMap.get(match.mentorId);
                    const isSelected = match.mentorId === selectedMentorId;
                    const mentorRole = poolItem?.mentor.currentRole ?? "Mentor";
                    const mentorCompany = poolItem?.mentor.company ?? "Mentor network";
                    const rank = idx + 1;

                    return (
                      <div
                        key={match.mentorId}
                        className="bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        style={{ borderColor: isSelected ? "var(--status-ai)" : "var(--border)" }}
                      >
                        {/* Card body — clickable */}
                        <div
                          className="p-6 cursor-pointer"
                          onClick={() =>
                            dispatch({ type: "SELECT_MENTOR", mentorId: isSelected ? null : match.mentorId })
                          }
                        >
                          {/* Header row */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                              {/* Rank badge */}
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                                style={
                                  rank === 1
                                    ? { background: "var(--status-ai)", color: "#ffffff" }
                                    : { background: "color-mix(in srgb, var(--status-ai) 10%, transparent)", color: "var(--status-ai)" }
                                }
                              >
                                {rank}
                              </div>
                              <div>
                                <h4 className="font-bold text-[17px] text-foreground leading-none">
                                  {match.mentorName}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wide">
                                  {mentorRole} · {mentorCompany}
                                </p>
                              </div>
                            </div>

                            {/* Score box */}
                            <div className="text-right bg-muted px-4 py-2 rounded-lg border border-border shrink-0">
                              <div
                                className="text-3xl font-bold leading-none tabular-nums"
                                style={{ color: rank === 1 ? "var(--status-ai)" : "var(--foreground)" }}
                              >
                                {match.overallScore}
                              </div>
                              <div className="text-[9px] text-muted-foreground uppercase font-bold mt-1">
                                match score
                              </div>
                            </div>
                          </div>

                          {/* Breakdown bars */}
                          <div className="space-y-3 mb-5 max-w-xl">
                            {BREAKDOWN_LABELS.map(([key, label]) => (
                              <div key={key} className="flex items-center">
                                <span className="w-20 text-xs font-medium text-muted-foreground shrink-0">
                                  {label}
                                </span>
                                <div className="flex-1 h-2 bg-muted rounded-full mx-4 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${match.breakdown[key]}%`,
                                      background: rank === 1 ? "var(--status-ai)" : "color-mix(in srgb, var(--status-ai) 50%, transparent)",
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-foreground w-8 text-right tabular-nums">
                                  {match.breakdown[key]}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* AI Reasoning */}
                          <div
                            className="rounded-xl p-4"
                            style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.12)" }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{
                                  background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                                  color: "var(--status-ai)",
                                }}
                              >
                                ✦ AI
                              </span>
                              <span
                                className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "var(--status-ai)" }}
                              >
                                Matching Insight
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                              {match.reason}
                            </p>
                          </div>

                          {/* Warnings */}
                          {poolItem && poolItem.warnings.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {poolItem.warnings.map((w) => (
                                <span
                                  key={w.code}
                                  className="text-[10px] border rounded-full px-2 py-0.5"
                                  style={{ color: "var(--status-risk)", borderColor: "var(--status-risk)" }}
                                >
                                  {w.code}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Select button — full-width card footer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: "SELECT_MENTOR", mentorId: isSelected ? null : match.mentorId });
                          }}
                          className="w-full py-3.5 text-sm font-bold transition-all border-t"
                          style={
                            isSelected
                              ? { background: "var(--status-ai)", color: "#ffffff", borderColor: "var(--status-ai)" }
                              : { background: "color-mix(in srgb, var(--status-ai) 6%, transparent)", color: "var(--status-ai)", borderColor: "color-mix(in srgb, var(--status-ai) 12%, transparent)" }
                          }
                        >
                          {isSelected
                            ? `✓ Selected`
                            : `Select ${match.mentorName.split(" ")[0]} as Mentor`}
                        </button>
                      </div>
                    );
                  })}

                  {/* Confirm match */}
                  {selectedMentorId !== null && matchState === "done" && (
                    <div className="pt-1">
                      {confirmState === "confirmed" ? (
                        <div
                          className="flex items-center gap-2 text-sm font-medium"
                          style={{ color: "var(--status-healthy)" }}
                        >
                          ✓ Match confirmed successfully.
                        </div>
                      ) : confirmState === "error" ? (
                        <div className="space-y-3">
                          <p className="text-xs font-medium" style={{ color: "var(--status-critical)" }}>
                            {confirmError}
                          </p>
                          <button
                            onClick={() => setConfirmDialogOpen(true)}
                            className="px-5 py-2.5 text-sm font-bold rounded-full transition-opacity hover:opacity-90"
                            style={{ background: "#f36458", color: "#ffffff" }}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDialogOpen(true)}
                          disabled={confirmState === "confirming"}
                          className="w-full md:w-auto px-8 py-3 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          style={{ background: "#f36458", color: "#ffffff" }}
                        >
                          {confirmState === "confirming" ? "Confirming…" : "Confirm Match →"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {matchState === "done" && matches.length === 0 && (
                <div className="py-16 text-sm text-muted-foreground text-center">
                  No mentor matches returned for this startup.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirm this mentor match?"
        description="A relationship record will be created for this startup and mentor using the current AI match score and explanation."
        confirmLabel={confirmState === "confirming" ? "Confirming..." : "Confirm match"}
        disabled={confirmState === "confirming"}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={() => { void handleConfirm(); }}
      >
        <div className="space-y-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span>Startup</span>
            <span className="font-medium text-foreground">
              {selectedStartup?.company.name ?? selectedStartupId}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Mentor</span>
            <span className="font-medium text-foreground">
              {selectedMatch?.mentorName ?? selectedMentorId}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Match score</span>
            <span className="font-medium text-foreground">
              {selectedMatch?.overallScore ?? 0}/100
            </span>
          </div>
          {selectedMatch?.reason && (
            <p className="border-t border-border pt-2 leading-relaxed">
              {selectedMatch.reason}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
}

