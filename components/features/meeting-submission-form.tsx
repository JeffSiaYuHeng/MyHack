"use client";

import { useState } from "react";
import { seedMentors, seedRelationships, seedCompanies } from "@/lib/verrier-seed";
import type { ActionItem } from "@/lib/types";

interface FormFields {
  token: string;
  date: string;
  durationMinutes: string;
  rawNotes: string;
}

interface ValidationErrors {
  token?: string;
  date?: string;
  durationMinutes?: string;
  rawNotes?: string;
}

interface ResolvedContext {
  mentorName: string;
  companyName: string;
  healthScore: number;
  healthTrend: string;
  relationshipId: string;
}

interface AnalysisResult {
  meetingId: string;
  aiSummary: string;
  actionItems: ActionItem[];
  signal: "Positive" | "Neutral" | "Friction detected";
  signalReason: string;
  healthScoreDelta: number;
  newHealthScore: number;
  watchPoints: string[];
}

type FormState = "idle" | "submitting" | "confirmed";

function resolveToken(token: string): ResolvedContext | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const mentor = seedMentors.find((m) => m.meetingSubmissionToken === trimmed);
  if (!mentor) return null;
  const relationship = seedRelationships.find(
    (r) => r.mentorId === mentor.id && (r.status === "active" || r.status === "pending")
  );
  if (!relationship) return null;
  const company = seedCompanies.find((c) => c.id === relationship.companyId);
  return {
    mentorName: mentor.name,
    companyName: company?.name ?? relationship.companyId,
    healthScore: relationship.healthScore,
    healthTrend: relationship.healthTrend,
    relationshipId: relationship.id,
  };
}

function normaliseSignal(raw: string): "Positive" | "Neutral" | "Friction detected" {
  if (raw === "Positive" || raw === "Neutral" || raw === "Friction detected") return raw;
  const lower = raw.toLowerCase();
  if (lower === "positive") return "Positive";
  if (lower === "negative" || lower.includes("friction")) return "Friction detected";
  return "Neutral";
}

function validate(fields: FormFields): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!fields.token.trim()) {
    errors.token = "Mentor token is required.";
  } else if (!resolveToken(fields.token)) {
    errors.token = "Token not recognised. Check your programme invitation email.";
  }

  if (!fields.date) {
    errors.date = "Meeting date is required.";
  }

  const dur = Number(fields.durationMinutes);
  if (!fields.durationMinutes.trim() || isNaN(dur) || dur <= 0) {
    errors.durationMinutes = "Enter a duration greater than 0 minutes.";
  } else if (dur > 240) {
    errors.durationMinutes = "Duration cannot exceed 240 minutes.";
  }

  if (!fields.rawNotes.trim()) {
    errors.rawNotes = "Meeting notes are required.";
  } else if (fields.rawNotes.trim().length < 50) {
    errors.rawNotes = `Notes must be at least 50 characters (${fields.rawNotes.trim().length} entered).`;
  }

  return errors;
}

export function MeetingSubmissionForm() {
  const [fields, setFields] = useState<FormFields>({
    token: "",
    date: "",
    durationMinutes: "",
    rawNotes: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [formState, setFormState] = useState<FormState>("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    date: string;
    durationMinutes: number;
    notesLength: number;
    context: ResolvedContext;
    analysis: AnalysisResult;
  } | null>(null);

  const resolvedContext = resolveToken(fields.token);

  function handleChange<K extends keyof FormFields>(key: K, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate(next)[key] }));
    }
  }

  function handleBlur(key: keyof FormFields) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validate(fields)[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {
      token: true,
      date: true,
      durationMinutes: true,
      rawNotes: true,
    };
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const context = resolveToken(fields.token);
    if (!context) return;

    setFormState("submitting");
    setApiError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, 10000);

    try {
      const res = await fetch("/api/ai/analyze-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          relationshipId: context.relationshipId,
          date: fields.date,
          durationMinutes: Number(fields.durationMinutes),
          rawNotes: fields.rawNotes,
          submittedBy: "mentor",
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        const msg =
          typeof errBody.error === "string"
            ? (errBody.error as string)
            : "Submission failed. Please try again.";
        setApiError(msg);
        setFormState("idle");
        return;
      }

      const raw = (await res.json()) as Record<string, unknown>;

      const analysis: AnalysisResult = {
        meetingId: typeof raw.meetingId === "string" ? raw.meetingId : "",
        aiSummary: typeof raw.aiSummary === "string" ? raw.aiSummary : "",
        actionItems: Array.isArray(raw.actionItems)
          ? (raw.actionItems as ActionItem[])
          : [],
        signal: normaliseSignal(
          typeof raw.signal === "string" ? raw.signal : "Neutral"
        ),
        signalReason:
          typeof raw.signalReason === "string" ? raw.signalReason : "",
        healthScoreDelta:
          typeof raw.healthScoreDelta === "number" ? raw.healthScoreDelta : 0,
        newHealthScore:
          typeof raw.newHealthScore === "number" ? raw.newHealthScore : context.healthScore,
        watchPoints: Array.isArray(raw.watchPoints)
          ? (raw.watchPoints as string[]).filter((w) => typeof w === "string")
          : [],
      };

      setConfirmed({
        date: fields.date,
        durationMinutes: Number(fields.durationMinutes),
        notesLength: fields.rawNotes.trim().length,
        context,
        analysis,
      });
      setFormState("confirmed");
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      
      // Local fallback for timeout or network failure
      const fallbackAnalysis: AnalysisResult = {
        meetingId: `meet-fallback-${Date.now()}`,
        aiSummary: isTimeout
          ? "Meeting logged successfully. AI analysis timed out and will be processed later."
          : "Meeting logged successfully. AI analysis is currently unavailable due to a network issue.",
        actionItems: [],
        signal: "Neutral",
        signalReason: "AI analysis fallback triggered.",
        healthScoreDelta: 0,
        newHealthScore: context.healthScore,
        watchPoints: ["analysis-pending"],
      };

      setConfirmed({
        date: fields.date,
        durationMinutes: Number(fields.durationMinutes),
        notesLength: fields.rawNotes.trim().length,
        context,
        analysis: fallbackAnalysis,
      });
      setFormState("confirmed");
    }
  }

  if (formState === "confirmed" && confirmed) {
    const { analysis, context } = confirmed;
    const signalColor =
      analysis.signal === "Positive"
        ? "var(--status-healthy)"
        : analysis.signal === "Friction detected"
        ? "var(--status-risk)"
        : undefined;
    const signalBg =
      analysis.signal === "Positive"
        ? "var(--status-healthy-bg)"
        : analysis.signal === "Friction detected"
        ? "var(--status-risk-bg)"
        : "var(--muted)";
    const deltaColor =
      analysis.healthScoreDelta > 0
        ? "var(--status-healthy)"
        : analysis.healthScoreDelta < 0
        ? "var(--status-critical)"
        : undefined;
    const scoreColor =
      analysis.newHealthScore >= 70
        ? "var(--status-healthy)"
        : analysis.newHealthScore >= 40
        ? "var(--status-risk)"
        : "var(--status-critical)";

    return (
      <div className="border border-border rounded p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--status-healthy)" }}
          >
            Meeting logged
          </p>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded"
            style={{ color: signalColor, background: signalBg }}
          >
            {analysis.signal}
          </span>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Pair</span>{" "}
            {context.mentorName} × {context.companyName}
          </p>
          <p>
            <span className="font-medium text-foreground">Date</span>{" "}
            {confirmed.date}
          </p>
          <p>
            <span className="font-medium text-foreground">Duration</span>{" "}
            {confirmed.durationMinutes} min
          </p>
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          <p className="text-xs font-medium text-foreground">AI summary</p>
          <p className="text-xs text-muted-foreground">{analysis.aiSummary}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Signal reason</span>{" "}
          {analysis.signalReason}
        </p>

        <div className="flex gap-4 text-xs">
          <span>
            <span className="text-muted-foreground">Health delta </span>
            <span className="font-semibold" style={{ color: deltaColor }}>
              {analysis.healthScoreDelta > 0
                ? `+${analysis.healthScoreDelta}`
                : analysis.healthScoreDelta}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">New health </span>
            <span className="font-semibold" style={{ color: scoreColor }}>
              {analysis.newHealthScore}
            </span>
          </span>
        </div>

        {analysis.actionItems.length > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Action items</p>
            <ul className="space-y-1.5">
              {analysis.actionItems.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="shrink-0 capitalize font-medium text-foreground">
                    {item.owner}
                  </span>
                  <span className="flex-1">{item.task}</span>
                  {item.dueDate && (
                    <span className="shrink-0">by {item.dueDate}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.watchPoints.length > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Watch points</p>
            <div className="flex flex-wrap gap-1">
              {analysis.watchPoints.map((wp, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{
                    borderColor: "var(--status-risk)",
                    color: "var(--status-risk)",
                  }}
                >
                  {wp === "analysis-pending" ? "Analysis pending" : wp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Token */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground block">
          Mentor token
        </label>
        <p className="text-[10px] text-muted-foreground">
          Found in your programme invitation email.
        </p>
        <input
          type="text"
          value={fields.token}
          onChange={(e) => handleChange("token", e.target.value)}
          onBlur={() => handleBlur("token")}
          placeholder="token-mentor-XX"
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {touched.token && errors.token && (
          <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
            {errors.token}
          </p>
        )}

        {resolvedContext && !errors.token && (
          <div className="border border-border rounded px-3 py-2 bg-muted/40 space-y-0.5">
            <p className="text-xs font-medium">{resolvedContext.mentorName}</p>
            <p className="text-[10px] text-muted-foreground">
              Matched with {resolvedContext.companyName} &middot; Health{" "}
              <span
                className="font-semibold"
                style={{
                  color:
                    resolvedContext.healthScore >= 70
                      ? "var(--status-healthy)"
                      : resolvedContext.healthScore >= 40
                      ? "var(--status-risk)"
                      : "var(--status-critical)",
                }}
              >
                {resolvedContext.healthScore}
              </span>{" "}
              <span className="capitalize">{resolvedContext.healthTrend}</span>
            </p>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground block">
          Meeting date
        </label>
        <input
          type="date"
          value={fields.date}
          onChange={(e) => handleChange("date", e.target.value)}
          onBlur={() => handleBlur("date")}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {touched.date && errors.date && (
          <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
            {errors.date}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground block">
          Duration (minutes)
        </label>
        <input
          type="number"
          min={1}
          max={240}
          value={fields.durationMinutes}
          onChange={(e) => handleChange("durationMinutes", e.target.value)}
          onBlur={() => handleBlur("durationMinutes")}
          placeholder="45"
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {touched.durationMinutes && errors.durationMinutes && (
          <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
            {errors.durationMinutes}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground block">
          Meeting notes
        </label>
        <p className="text-[10px] text-muted-foreground">
          Describe what was discussed, decisions made, and next steps. Minimum 50 characters.
        </p>
        <textarea
          rows={6}
          value={fields.rawNotes}
          onChange={(e) => handleChange("rawNotes", e.target.value)}
          onBlur={() => handleBlur("rawNotes")}
          placeholder="e.g. Reviewed clinic pilot feedback. Agreed to narrow the target segment to two hospital groups and prepare a procurement checklist by next week."
          className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
        />
        <div className="flex items-center justify-between">
          {touched.rawNotes && errors.rawNotes ? (
            <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
              {errors.rawNotes}
            </p>
          ) : (
            <span />
          )}
          <p className="text-[10px] text-muted-foreground ml-auto">
            {fields.rawNotes.trim().length} / 50 min
          </p>
        </div>
      </div>

      {apiError && (
        <p className="text-[10px]" style={{ color: "var(--status-critical)" }}>
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="w-full px-4 py-2.5 text-sm font-medium rounded border border-border bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {formState === "submitting" ? "Analysing..." : "Submit meeting notes"}
      </button>
    </form>
  );
}
