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
      return {
        ...state,
        matchState: "loading",
        matches: [],
        errorMessage: null,
        selectedMentorId: null,
        confirmState: "idle",
        confirmError: null,
        isFallback: false,
      };
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
      return {
        ...state,
        selectedMentorId: action.mentorId,
        confirmState: "idle",
        confirmError: null,
      };
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
  const [confirmedStartupIds, setConfirmedStartupIds] = useState<Set<string>>(
    new Set()
  );

  const displayQueue = initialQueue.filter(
    (item) => !confirmedStartupIds.has(item.company.id)
  );

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
      signal: controller.signal,
      body: JSON.stringify({
        startupId: selectedStartupId,
        programId,
        cohortId,
      }),
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (cancelled) return;

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as Record<
            string,
            unknown
          >;
          throw new Error(
            typeof data.error === "string" ? data.error : "API Error"
          );
        }

        const data = (await res.json()) as { matches: MatchResult[] };
        if (!data.matches || data.matches.length === 0) {
          throw new Error("Empty matches");
        }

        if (!cancelled) {
          dispatch({ type: "SUCCESS", matches: data.matches });
        }
      })
      .catch((err: unknown) => {
        clearTimeout(timeoutId);
        if (cancelled) return;

        // Deterministic local fallback
        const startup = initialQueue.find((q) => q.company.id === selectedStartupId);
        if (!startup) {
          dispatch({ type: "ERROR", message: "Startup not found." });
          return;
        }

        const fallbackMatches: MatchResult[] = initialMentorPool
          .map((poolItem) => {
            const m = poolItem.mentor;
            const c = startup.company;

            // Industry Match (0-100)
            const matchingCount = m.industries.filter((ind) =>
              c.industry.map((ci) => ci.toLowerCase()).includes(ind.toLowerCase())
            ).length;
            const industryMatch =
              m.industries.length > 0
                ? Math.max(0, Math.min(100, Math.round((matchingCount / m.industries.length) * 100)))
                : 0;

            // Stage Fit (100 or 35)
            const stageFit = m.preferredStages.includes(c.stage) ? 100 : 35;

            // Availability (0-100)
            const availableSlots = m.availabilitySlots.filter((s) => s.status === "available").length;
            const availability = m.availabilitySlots.length > 0
              ? Math.max(0, Math.min(100, Math.round((availableSlots / m.availabilitySlots.length) * 100)))
              : 0;

            // Style (0-100)
            const styleCompatibility = Math.max(0, Math.min(100, Math.round((m.availabilityHoursPerMonth * 8 + m.pastSuccessCount * 5) / 2)));

            const overallScore = Math.max(0, Math.min(100, Math.round(
              industryMatch * 0.35 +
              stageFit * 0.3 +
              availability * 0.2 +
              styleCompatibility * 0.15
            )));

            let reason = `${m.name} is a programme mentor with relevant expertise in ${m.expertise.slice(0, 2).join(" and ")}.`;
            if (industryMatch >= 70) reason = `Strong industry alignment in ${c.industry.slice(0, 2).join(" and ")}.`;
            else if (stageFit === 100) reason = `Specialises in mentoring ${c.stage}-stage startups.`;

            return {
              mentorId: m.id,
              mentorName: m.name,
              overallScore,
              reason,
              breakdown: { industryMatch, stageFit, availability, styleCompatibility },
            };
          })
          .sort((a, b) => b.overallScore - a.overallScore || a.mentorId.localeCompare(b.mentorId))
          .slice(0, 3);

        const isTimeout = err instanceof Error && err.name === "AbortError";
        const msg = isTimeout 
          ? "Match request timed out. Using local fallback recommendations."
          : "AI matching is currently unavailable. Using local fallback recommendations.";

        dispatch({ type: "SUCCESS", matches: fallbackMatches, isFallback: true });
        // Optional: show a transient error or just let the "fallback active" UI handle it
        console.warn(msg);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedStartupId, programId, cohortId, initialMentorPool, initialQueue]);

  async function handleConfirm() {
    if (
      !selectedStartupId ||
      !store.selectedMentorId ||
      store.confirmState === "confirming"
    )
      return;

    const match = store.matches.find(
      (m) => m.mentorId === store.selectedMentorId
    );
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
        const data = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        dispatch({
          type: "CONFIRM_ERROR",
          message:
            typeof data.error === "string"
              ? data.error
              : "Confirmation failed.",
        });
        return;
      }

      dispatch({ type: "CONFIRM_SUCCESS" });

      const nextQueue = displayQueue.filter(
        (item) => item.company.id !== selectedStartupId
      );
      setConfirmedStartupIds((prev) => new Set([...prev, selectedStartupId]));
      setSelectedStartupId(nextQueue[0]?.company.id ?? null);
    } catch {
      dispatch({
        type: "CONFIRM_ERROR",
        message: "Network error during confirmation.",
      });
    }
  }

  function selectStartup(id: string) {
    if (id === selectedStartupId) return;
    setSelectedStartupId(id);
  }

  const {
    matchState,
    matches,
    errorMessage,
    selectedMentorId,
    confirmState,
    confirmError,
    isFallback,
  } = store;

  const selectedStartup =
    displayQueue.find((item) => item.company.id === selectedStartupId) ?? null;

  if (displayQueue.length === 0) {
    return (
      <div className="px-4 md:px-12 py-6">
        <div className="border border-border rounded p-6 text-sm text-muted-foreground">
          No approved unmatched startups in the queue. All startups have been
          matched or none have been approved yet.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-6 flex flex-col lg:flex-row gap-4">
      {/* Left panel: startup queue */}
      <div className="lg:w-72 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Unmatched startups ({displayQueue.length})
        </p>
        <div className="border border-border rounded overflow-hidden">
          <ul className="divide-y divide-border">
            {displayQueue.map((item) => {
              const isSelected = item.company.id === selectedStartupId;
              return (
                <li key={item.company.id}>
                  <button
                    onClick={() => selectStartup(item.company.id)}
                    className={`w-full text-left px-3 py-3 transition-colors ${
                      isSelected ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium truncate">
                        {item.company.name}
                      </p>
                      <span
                        className="text-[10px] font-medium border rounded px-1.5 py-0.5 shrink-0"
                        style={{
                          color: "var(--status-ai)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {item.company.stage}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {item.company.industry.join(", ")}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        Fit {item.fitScore}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {item.supportNeeds.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Right panel: mentor match results */}
      <div className="flex-1 min-w-0 space-y-3">
        {selectedStartup && (
          <div className="border border-border rounded px-4 py-3 bg-muted/40">
            <p className="text-xs font-medium">{selectedStartup.company.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {selectedStartup.supportNeeds.join(" · ")} &mdash;{" "}
              {selectedStartup.founderSummary}
            </p>
          </div>
        )}

        {matchState === "idle" && (
          <div className="border border-border rounded p-6 text-sm text-muted-foreground">
            Select a startup to view mentor matches.
          </div>
        )}

        {matchState === "loading" && (
          <div className="border border-border rounded p-6 text-sm text-muted-foreground">
            Finding best matches...
          </div>
        )}

        {matchState === "error" && (
          <div className="border border-border rounded px-4 py-3">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--status-critical)" }}
            >
              {errorMessage}
            </p>
          </div>
        )}

        {(matchState === "done" || matchState === "error") &&
          matches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Ranked matches ({matches.length})
                </p>
                {isFallback && (
                  <span className="text-[10px] font-medium border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                    Fallback active
                  </span>
                )}
              </div>
              {isFallback && (
                <p className="text-[10px] text-muted-foreground bg-muted/30 px-3 py-1.5 rounded border border-border/50">
                  AI matching encountered a network issue. Using local
                  deterministic recommendations based on industry and stage.
                </p>
              )}
              {matches.map((match, idx) => {
                const poolItem = mentorPoolMap.get(match.mentorId);
                const isSelected = match.mentorId === selectedMentorId;
                return (
                  <div
                    key={match.mentorId}
                    className={`border rounded p-4 transition-colors ${
                      isSelected
                        ? "border-primary bg-muted/40"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-muted-foreground w-5 shrink-0">
                            #{idx + 1}
                          </span>
                          <p className="text-sm font-semibold truncate">
                            {match.mentorName}
                          </p>
                          {poolItem && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {poolItem.mentor.mentorshipStyle}
                            </span>
                          )}
                        </div>
                        {poolItem && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 ml-5 truncate">
                            {poolItem.mentor.currentRole} &middot;{" "}
                            {poolItem.mentor.company}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--primary)" }}
                          >
                            {match.overallScore}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-none">
                            score
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            dispatch({
                              type: "SELECT_MENTOR",
                              mentorId: isSelected ? null : match.mentorId,
                            })
                          }
                          className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                            isSelected
                              ? "border-primary text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 ml-5">
                      {match.reason}
                    </p>

                    <div className="mt-3 ml-5 space-y-1.5">
                      {BREAKDOWN_LABELS.map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-20 shrink-0">
                            {label}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${match.breakdown[key]}%`,
                                backgroundColor: "var(--primary)",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-6 text-right">
                            {match.breakdown[key]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {poolItem && poolItem.warnings.length > 0 && (
                      <div className="mt-2 ml-5 flex flex-wrap gap-1.5">
                        {poolItem.warnings.map((w) => (
                          <span
                            key={w.code}
                            className="text-[10px] border rounded px-1.5 py-0.5"
                            style={{
                              color: "var(--status-risk)",
                              borderColor: "var(--status-risk)",
                            }}
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
                <div className="border-t border-border mt-6 pt-6">
                  {confirmState === "confirmed" ? (
                    <div className="flex items-center gap-2 text-[var(--status-healthy)]">
                      <span className="text-sm font-medium">
                        Match confirmed.
                      </span>
                    </div>
                  ) : confirmState === "error" ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-[var(--status-critical)]">
                        {confirmError}
                      </p>
                      <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirm}
                      disabled={confirmState === "confirming"}
                      className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirmState === "confirming"
                        ? "Confirming..."
                        : "Confirm Match"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        {matchState === "done" && matches.length === 0 && (
          <div className="border border-border rounded p-6 text-sm text-muted-foreground">
            No mentor matches returned for this startup.
          </div>
        )}
      </div>
    </div>
  );
}
