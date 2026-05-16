"use client";

import { useState, useReducer } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type {
  ApprovedStartupQueueItem,
  MentorPoolItem,
} from "@/lib/verrier-analytics";

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

const MATCH_LOADING_STEPS = [
  "Reading startup needs",
  "Scanning mentor expertise",
  "Checking load and availability",
  "Ranking compatibility",
];

export function MatchingWorkbench({
  initialQueue,
  initialMentorPool,
  programId,
  cohortId,
}: MatchingWorkbenchProps) {
  const router = useRouter();
  const [confirmedStartupIds, setConfirmedStartupIds] = useState<Set<string>>(new Set());

  const displayQueue = initialQueue.filter((item) => !confirmedStartupIds.has(item.company.id));

  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    displayQueue[0]?.company.id ?? null
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [store, dispatch] = useReducer(matchReducer, INITIAL_STORE);

  const mentorPoolMap = new Map<string, MentorPoolItem>(
    initialMentorPool.map((p) => [p.mentor.id, p])
  );

  async function handleGenerateMatches() {
    if (!selectedStartupId) return;
    dispatch({ type: "START" });
    const toastId = toast.loading("Generating mentor matches...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ startupId: selectedStartupId, programId, cohortId }),
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
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
    setSelectedStartupId(id);
    dispatch({ type: "RESET" });
  }

  const { matchState, matches, errorMessage, selectedMentorId, confirmState, confirmError } = store;
  const selectedStartup = displayQueue.find((item) => item.company.id === selectedStartupId) ?? null;
  const selectedMatch = matches.find((match) => match.mentorId === selectedMentorId) ?? null;

  if (displayQueue.length === 0) {
    return (
      <div className="px-6 md:px-10 py-8">
        <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
          All startups have been matched or none have been approved yet.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Matching Workbench</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {displayQueue.length} startup{displayQueue.length !== 1 ? "s" : ""} awaiting mentor match
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left panel: startup queue */}
        <div className="lg:w-64 shrink-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Queue
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <ul className="divide-y divide-border">
              {displayQueue.map((item) => {
                const isSelected = item.company.id === selectedStartupId;
                return (
                  <li key={item.company.id}>
                    <button
                      onClick={() => selectStartup(item.company.id)}
                      className={`w-full text-left px-4 py-3.5 transition-colors ${
                        isSelected ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {item.company.name}
                        </p>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                            color: "var(--status-ai)",
                          }}
                        >
                          {item.company.stage}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">
                        {item.company.industry.join(", ")}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${item.fitScore}%`, backgroundColor: "var(--primary)" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">Fit {item.fitScore}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Selected startup summary */}
          {selectedStartup && (
            <div className="bg-card border border-border rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {selectedStartup.company.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedStartup.company.industry.join(", ")} · {selectedStartup.company.stage}
                  </p>
                </div>
                <div
                  className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                    color: "var(--status-ai)",
                  }}
                >
                  Fit {selectedStartup.fitScore}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                {selectedStartup.supportNeeds.join(" · ")} — {selectedStartup.founderSummary}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => { void handleGenerateMatches(); }}
                  disabled={matchState === "loading"}
                  className="px-5 py-2 text-xs font-bold rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: matchState === "loading" ? "transparent" : "#f36458",
                    color: matchState === "loading" ? "#797979" : "#ffffff",
                    border: matchState === "loading" ? "1px solid #e5e5e5" : "1px solid #f36458",
                  }}
                >
                  {matchState === "loading" ? "Generating matches…" : "✦ Generate AI Matches"}
                </button>
              </div>
            </div>
          )}

          {/* Match states */}
          {matchState === "idle" && (
            <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
              Select a startup, then click Generate AI matches.
            </div>
          )}

          {matchState === "loading" && (
            <div className="bg-card border border-border rounded-xl p-6 overflow-hidden">
              <div className="flex items-center gap-3">
                <div
                  className="relative size-10 rounded-full"
                  style={{ background: "rgba(243,100,88,0.08)", border: "1px solid #353535" }}
                >
                  <span
                    className="absolute inset-1 rounded-full border-2 border-transparent animate-spin"
                    style={{ borderTopColor: "#f36458" }}
                  />
                  <span
                    className="absolute inset-3 rounded-full"
                    style={{ background: "#f36458" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#f36458" }}>
                    Finding best mentor matches
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI is comparing the startup against {initialMentorPool.length} mentor profiles.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {MATCH_LOADING_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className="size-5 rounded-full border border-border flex items-center justify-center text-[10px] font-semibold"
                      style={{ color: "var(--status-ai)" }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>{step}</span>
                        <span>{25 * (index + 1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden ai-loading-scan" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchState === "error" && errorMessage && (
            <div
              className="bg-card border border-border rounded-xl px-5 py-4 text-xs font-medium"
              style={{ color: "var(--status-critical)" }}
            >
              {errorMessage}
            </div>
          )}

          {/* Match results */}
          {(matchState === "done" || matchState === "error") && matches.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
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
                    data-selected={isSelected}
                    onClick={() =>
                      dispatch({ type: "SELECT_MENTOR", mentorId: isSelected ? null : match.mentorId })
                    }
                    className="relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer data-[selected=true]:border-[var(--status-ai)] data-[selected=true]:shadow-md"
                  >
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[var(--status-ai)]/10 text-[var(--status-ai)] text-xs font-bold flex items-center justify-center">
                      {rank}
                    </div>

                    <div className="p-4 pl-11">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-[15px] truncate">
                            {match.mentorName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {mentorRole} · {mentorCompany}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-foreground leading-none">
                            {match.overallScore}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            match score
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                      {BREAKDOWN_LABELS.map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-12 shrink-0">
                              {label}
                            </span>
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[var(--status-ai)]/60 transition-all duration-700"
                                style={{ width: `${match.breakdown[key]}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-6 text-right">
                            {match.breakdown[key]}
                          </span>
                        </div>
                      ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/60">
                        <div className="rounded-md p-2.5" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--status-ai)]/10 text-[var(--status-ai)]">✦ AI</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest font-mono" style={{ color: "var(--status-ai)" }}>
                              Reasoning
                            </p>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground italic">
                            {match.reason}
                          </p>
                        </div>
                      </div>

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

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          dispatch({ type: "SELECT_MENTOR", mentorId: isSelected ? null : match.mentorId });
                        }}
                        data-selected={isSelected}
                        className="mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all duration-150 bg-[var(--status-ai)]/10 text-[var(--status-ai)] hover:bg-[var(--status-ai)]/20 data-[selected=true]:bg-[var(--status-ai)] data-[selected=true]:text-white"
                      >
                        {isSelected ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedMentorId !== null && matchState === "done" && (
                <div className="pt-2">
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
                      className="w-full md:w-auto px-8 py-2.5 text-sm font-bold rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "#f36458", color: "#ffffff" }}
                    >
                      {confirmState === "confirming" ? "Confirming…" : "Confirm Match"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {matchState === "done" && matches.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
              No mentor matches returned for this startup.
            </div>
          )}
        </div>
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
    </div>
  );
}
