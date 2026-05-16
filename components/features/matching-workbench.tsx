"use client";

import { useState, useEffect, useReducer } from "react";
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
  | { type: "START" }
  | { type: "SUCCESS"; matches: MatchResult[]; isFallback?: boolean }
  | { type: "ERROR"; message: string }
  | { type: "SELECT_MENTOR"; mentorId: string | null }
  | { type: "CONFIRM_START" }
  | { type: "CONFIRM_SUCCESS" }
  | { type: "CONFIRM_ERROR"; message: string };

function matchReducer(state: MatchStore, action: MatchAction): MatchStore {
  switch (action.type) {
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
  ["availability", "Availability"],
  ["styleCompatibility", "Style"],
];

export function MatchingWorkbench({
  initialQueue,
  initialMentorPool,
  programId,
  cohortId,
}: MatchingWorkbenchProps) {
  const [confirmedStartupIds, setConfirmedStartupIds] = useState<Set<string>>(new Set());

  const displayQueue = initialQueue.filter((item) => !confirmedStartupIds.has(item.company.id));

  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    displayQueue[0]?.company.id ?? null
  );
  const [store, dispatch] = useReducer(matchReducer, INITIAL_STORE);

  const mentorPoolMap = new Map<string, MentorPoolItem>(
    initialMentorPool.map((p) => [p.mentor.id, p])
  );

  useEffect(() => {
    if (!selectedStartupId) return;
    let cancelled = false;
    dispatch({ type: "START" });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    fetch("/api/ai/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId: selectedStartupId, programId, cohortId }),
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (cancelled) return;

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
          dispatch({ type: "ERROR", message: typeof data.error === "string" ? data.error : "Match request failed." });
          return;
        }

        const data = (await res.json()) as { matches: MatchResult[] };
        if (!cancelled) dispatch({ type: "SUCCESS", matches: data.matches ?? [] });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "ERROR", message: "Network error. Manual selection is available below." });
      });

    return () => { cancelled = true; };
  }, [selectedStartupId, programId, cohortId]);

  async function handleConfirm() {
    if (!selectedStartupId || !store.selectedMentorId || store.confirmState === "confirming") return;
    const match = store.matches.find((m) => m.mentorId === store.selectedMentorId);
    if (!match) return;
    dispatch({ type: "CONFIRM_START" });

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
        dispatch({ type: "CONFIRM_ERROR", message: typeof data.error === "string" ? data.error : "Confirmation failed." });
        return;
      }
      dispatch({ type: "CONFIRM_SUCCESS" });
      const nextQueue = displayQueue.filter((item) => item.company.id !== selectedStartupId);
      setConfirmedStartupIds((prev) => new Set([...prev, selectedStartupId]));
      setSelectedStartupId(nextQueue[0]?.company.id ?? null);
    } catch {
      dispatch({ type: "CONFIRM_ERROR", message: "Network error during confirmation." });
    }
  }

  function selectStartup(id: string) {
    if (id === selectedStartupId) return;
    setSelectedStartupId(id);
  }

  const { matchState, matches, errorMessage, selectedMentorId, confirmState, confirmError } = store;
  const selectedStartup = displayQueue.find((item) => item.company.id === selectedStartupId) ?? null;

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
        <h1 className="text-xl font-semibold text-foreground">Matching Workbench</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {displayQueue.length} startup{displayQueue.length !== 1 ? "s" : ""} awaiting mentor match
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left panel: startup queue */}
        <div className="lg:w-64 shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">
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
            </div>
          )}

          {/* Match states */}
          {matchState === "idle" && (
            <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
              Select a startup to view mentor matches.
            </div>
          )}

          {matchState === "loading" && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--status-ai)" }}
              >
                ✦ Finding best mentor matches…
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI is analyzing compatibility</p>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Ranked Matches ({matches.length})
              </p>
              {matches.map((match, idx) => {
                const poolItem = mentorPoolMap.get(match.mentorId);
                const isSelected = match.mentorId === selectedMentorId;
                return (
                  <div
                    key={match.mentorId}
                    className={`bg-card border rounded-xl p-5 transition-all duration-200 ${
                      isSelected ? "border-primary shadow-sm" : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                            #{idx + 1}
                          </span>
                          <p className="text-[15px] font-semibold text-foreground truncate">
                            {match.mentorName}
                          </p>
                          {poolItem && (
                            <span className="text-[10px] text-muted-foreground shrink-0 capitalize">
                              {poolItem.mentor.mentorshipStyle}
                            </span>
                          )}
                        </div>
                        {poolItem && (
                          <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                            {poolItem.mentor.currentRole} · {poolItem.mentor.company}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className="text-2xl font-bold leading-none"
                            style={{ color: "var(--primary)" }}
                          >
                            {match.overallScore}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">score</p>
                        </div>
                        <button
                          onClick={() =>
                            dispatch({ type: "SELECT_MENTOR", mentorId: isSelected ? null : match.mentorId })
                          }
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 ml-6 flex items-start gap-2">
                      <span
                        className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                        style={{
                          background: "color-mix(in srgb, var(--status-ai) 10%, transparent)",
                          color: "var(--status-ai)",
                        }}
                      >
                        ✦ AI
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{match.reason}</p>
                    </div>

                    <div className="mt-4 ml-6 space-y-2">
                      {BREAKDOWN_LABELS.map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${match.breakdown[key]}%`, backgroundColor: "var(--primary)" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-6 text-right">
                            {match.breakdown[key]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {poolItem && poolItem.warnings.length > 0 && (
                      <div className="mt-3 ml-6 flex flex-wrap gap-1.5">
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
                        onClick={handleConfirm}
                        className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      disabled={confirmState === "confirming"}
                      className="w-full md:w-auto px-8 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
