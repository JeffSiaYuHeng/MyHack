"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Program, ProgramType, SelectionCriteria } from "@/lib/types";
import { seedApplications, seedMentors } from "@/lib/verrier-seed";

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
  { value: "accelerator", label: "Accelerator" },
  { value: "incubator", label: "Incubator" },
  { value: "grant", label: "Grant" },
  { value: "corporate-innovation", label: "Corporate innovation" },
  { value: "university", label: "University" },
  { value: "challenge", label: "Challenge" },
];

const STAGE_OPTIONS = ["idea", "pre-seed", "seed", "series-a", "series-b", "growth"];
const INDUSTRY_OPTIONS = ["AI/ML", "Fintech", "Healthtech", "Climate", "SaaS", "AgriTech", "FoodTech", "EdTech"];
const MARKET_OPTIONS = ["Malaysia", "Singapore", "Indonesia", "Thailand", "Vietnam", "Philippines"];
const DOC_OPTIONS = [
  { key: "pitchDeck", label: "Pitch deck" },
  { key: "companyRegistration", label: "Company registration" },
  { key: "tractionSummary", label: "Traction summary" },
  { key: "founderProfiles", label: "Founder profiles" },
];
const CRITERIA_FIELDS: { key: keyof SelectionCriteria; label: string }[] = [
  { key: "stageWeight", label: "Stage fit" },
  { key: "industryWeight", label: "Industry fit" },
  { key: "tractionWeight", label: "Traction fit" },
  { key: "teamWeight", label: "Team fit" },
  { key: "needsFitWeight", label: "Needs fit" },
];

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  if (typeof ts === "string") return ts.slice(0, 10);
  return String(ts).slice(0, 10);
}

function statusBadge(status: Program["status"]): { color: string; bg: string } {
  switch (status) {
    case "active": return { color: "#166534", bg: "#dcfce7" };
    case "open": case "reviewing": case "matching": return { color: "#92400e", bg: "#fef3c7" };
    case "completed": return { color: "#475569", bg: "#f1f5f9" };
    default: return { color: "var(--status-ai)", bg: "rgba(124,58,237,0.08)" };
  }
}

const SECTION_HEADER = "text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-6";
const CARD = "bg-card border border-border rounded-xl p-6";

interface ProgramDetailProps {
  program: Program;
}

export function ProgramDetail({ program: initialProgram }: ProgramDetailProps) {
  const router = useRouter();
  const [program, setProgram] = useState<Program>(initialProgram);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Program>(initialProgram);
  const [showDelete, setShowDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const applications = useMemo(
    () => seedApplications.filter((a) => a.programId === program.id),
    [program.id]
  );
  const approvedCount = useMemo(
    () => applications.filter((a) => a.status === "approved").length,
    [applications]
  );
  const mentors = useMemo(
    () => seedMentors.filter((m) => program.mentorIds.includes(m.id)),
    [program.mentorIds]
  );

  const weightTotal =
    draft.selectionCriteria.stageWeight +
    draft.selectionCriteria.industryWeight +
    draft.selectionCriteria.tractionWeight +
    draft.selectionCriteria.teamWeight +
    draft.selectionCriteria.needsFitWeight;

  function updateCriteria(key: keyof SelectionCriteria, raw: string) {
    const value = Math.max(0, Math.min(100, Number(raw) || 0));
    setDraft((d) => ({ ...d, selectionCriteria: { ...d.selectionCriteria, [key]: value } }));
  }

  function saveEdit() {
    setProgram(draft);
    setEditing(false);
    toast.success("Programme changes saved locally.");
  }

  function cancelEdit() {
    setDraft(program);
    setEditing(false);
    toast.success("Programme edit discarded.");
  }

  function handleDelete() {
    setDeleted(true);
    toast.success("Programme deleted locally.");
    redirectTimerRef.current = setTimeout(() => router.push("/programs"), 1200);
  }

  const inputCls =
    "w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  const badge = statusBadge(program.status);

  if (deleted) {
    return (
      <div className="px-8 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>
          Programme deleted. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 space-y-8 max-w-7xl">
      {/* Page header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/programs"
          className="flex items-center gap-1.5 text-sm w-fit hover:underline"
          style={{ color: "var(--primary)" }}
        >
          ← Programmes
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{program.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize"
                style={{ color: badge.color, background: badge.bg }}
              >
                {program.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium capitalize border border-border">
                {program.type}
              </span>
              {program.organizerName && (
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium border border-border">
                  {program.organizerName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editing && (
              <>
                <Link
                  href={`/programs/${program.id}/applicants`}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Applicants ({applications.length})
                </Link>
                <button
                  onClick={() => { setDraft(program); setEditing(true); }}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "var(--status-critical)" }}
                >
                  Delete
                </button>
              </>
            )}
            {editing && (
              <>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={weightTotal !== 100}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "var(--primary)" }}
                >
                  Save changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {!editing && (
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">{applications.length}</span>
              <span className="text-xs text-muted-foreground mt-1">Applications</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold" style={{ color: "var(--status-healthy)" }}>
                {approvedCount}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Approved</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">{mentors.length}</span>
              <span className="text-xs text-muted-foreground mt-1">Mentors</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {formatDate(program.applicationOpenAt)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Opens</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {formatDate(program.applicationCloseAt)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Closes</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {formatDate(program.startDate)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Starts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {formatDate(program.endDate)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Ends</span>
            </div>
          </div>
        </div>
      )}

      {/* READ VIEW */}
      {!editing && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basics */}
            <section className={CARD}>
              <h3 className={SECTION_HEADER}>Basics</h3>
              <div className="flex flex-col gap-4">
                {[
                  ["Name", program.name],
                  ["Type", program.type],
                  ["Description", program.description || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-3 gap-4">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="col-span-2 text-sm text-foreground leading-relaxed">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Target profile */}
            <section className={CARD}>
              <h3 className={SECTION_HEADER}>Target Profile</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">Stages</span>
                  <span className="col-span-2 text-sm text-foreground">
                    {program.targetStages.join(", ") || "—"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">Industries</span>
                  <span className="col-span-2 text-sm text-foreground">
                    {program.targetIndustries.join(", ") || "—"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">Markets</span>
                  <span className="col-span-2 text-sm text-foreground">
                    {program.targetMarkets.join(", ") || "—"}
                  </span>
                </div>
              </div>
            </section>

            {/* Criteria weights */}
            <section className={CARD}>
              <h3 className={SECTION_HEADER}>Criteria Weights</h3>
              <div className="space-y-4">
                {CRITERIA_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${program.selectionCriteria[key]}%`, background: "var(--primary)" }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right shrink-0">
                      {program.selectionCriteria[key]}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Application setup */}
            <section className={CARD}>
              <h3 className={SECTION_HEADER}>Application Setup</h3>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <span className="col-span-2 text-sm text-foreground">
                    {program.requiredDocuments.join(", ") || "None"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">App URL</span>
                  <span
                    className="col-span-2 text-sm font-mono truncate"
                    style={{ color: "var(--primary)" }}
                  >
                    /apply/{program.id}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Mentors — full width */}
          <section className={CARD}>
            <h3 className={SECTION_HEADER}>Mentors ({mentors.length})</h3>
            <div className="flex flex-wrap gap-3">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="px-4 py-2 bg-muted border border-border rounded-lg flex items-center gap-2 hover:border-primary transition-colors cursor-default"
                >
                  <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  <span className="text-xs text-muted-foreground">· {m.currentRole}</span>
                </div>
              ))}
              {mentors.length === 0 && (
                <p className="text-sm text-muted-foreground">No mentors assigned.</p>
              )}
            </div>
          </section>
        </>
      )}

      {/* EDIT VIEW */}
      {editing && (
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            {/* Basics */}
            <section className={CARD + " space-y-4"}>
              <h3 className={SECTION_HEADER}>Basics</h3>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Programme name</label>
                <input
                  className={inputCls}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Type</label>
                <select
                  className={inputCls}
                  value={draft.type}
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ProgramType }))}
                >
                  {PROGRAM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Status</label>
                <select
                  className={inputCls}
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Program["status"] }))}
                >
                  {(["draft","open","reviewing","matching","active","completed"] as Program["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Description</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </div>
            </section>

            {/* Target profile */}
            <section className={CARD + " space-y-4"}>
              <h3 className={SECTION_HEADER}>Target Profile</h3>
              {[
                { label: "Target stages", options: STAGE_OPTIONS, field: "targetStages" as const },
                { label: "Target industries", options: INDUSTRY_OPTIONS, field: "targetIndustries" as const },
                { label: "Target markets", options: MARKET_OPTIONS, field: "targetMarkets" as const },
              ].map(({ label, options, field }) => (
                <div key={field}>
                  <label className="block text-xs text-muted-foreground mb-2">{label}</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(draft[field] as string[]).includes(opt)}
                          onChange={() =>
                            setDraft((d) => ({ ...d, [field]: toggle(d[field] as string[], opt) }))
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Criteria weights */}
            <section className={CARD + " space-y-4"}>
              <h3 className={SECTION_HEADER}>Criteria Weights</h3>
              <p className="text-xs text-muted-foreground -mt-2">Must total 100.</p>
              <div className="space-y-3">
                {CRITERIA_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-24 shrink-0">{label}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-right"
                      value={draft.selectionCriteria[key]}
                      onChange={(e) => updateCriteria(key, e.target.value)}
                    />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(draft.selectionCriteria[key], 100)}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: weightTotal === 100 ? "var(--status-healthy)" : "var(--status-critical)" }}
              >
                Total: {weightTotal} / 100
              </p>
            </section>

            {/* Application setup */}
            <section className={CARD + " space-y-4"}>
              <h3 className={SECTION_HEADER}>Application Setup</h3>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Required documents</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {DOC_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.requiredDocuments.includes(key)}
                        onChange={() =>
                          setDraft((d) => ({ ...d, requiredDocuments: toggle(d.requiredDocuments, key) }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Application opens", field: "applicationOpenAt" as const },
                  { label: "Application closes", field: "applicationCloseAt" as const },
                  { label: "Programme start", field: "startDate" as const },
                  { label: "Programme end", field: "endDate" as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={typeof draft[field] === "string" ? String(draft[field]).slice(0, 10) : ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Mentor assignment */}
            <section className={CARD + " space-y-3"}>
              <h3 className={SECTION_HEADER}>Mentors</h3>
              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {seedMentors.map((mentor) => {
                  const selected = draft.mentorIds.includes(mentor.id);
                  return (
                    <label
                      key={mentor.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${selected ? "bg-muted/40" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setDraft((d) => ({ ...d, mentorIds: toggle(d.mentorIds, mentor.id) }))
                        }
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">{mentor.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {mentor.currentRole} · {mentor.company}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {mentor.availabilityHoursPerMonth}h/mo
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sticky save panel */}
          <div className="w-56 shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Editing
              </p>
              <p className="text-sm font-semibold text-foreground truncate">{draft.name || "Untitled"}</p>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mentors</span>
                  <span className="font-semibold">{draft.mentorIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criteria</span>
                  <span
                    className="font-semibold"
                    style={{ color: weightTotal === 100 ? "var(--status-healthy)" : "var(--status-critical)" }}
                  >
                    {weightTotal}/100
                  </span>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <button
                  onClick={saveEdit}
                  disabled={weightTotal !== 100}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "var(--primary)" }}
                >
                  Save changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <p className="text-sm font-semibold text-foreground">Delete &ldquo;{program.name}&rdquo;?</p>
            <p className="text-xs text-muted-foreground">
              This will permanently remove the programme. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white"
                style={{ background: "var(--status-critical)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
