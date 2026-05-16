"use client";

import { useState } from "react";
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

function statusStyle(status: Program["status"]): { color: string; bg: string } {
  switch (status) {
    case "active": return { color: "var(--status-healthy)", bg: "var(--status-healthy-bg)" };
    case "open": case "reviewing": case "matching":
      return { color: "var(--status-risk)", bg: "var(--status-risk-bg)" };
    case "completed": return { color: "var(--muted-foreground)", bg: "var(--muted)" };
    default: return { color: "var(--status-ai)", bg: "var(--muted)" };
  }
}

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

  const applications = seedApplications.filter((a) => a.programId === program.id);
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const mentors = seedMentors.filter((m) => program.mentorIds.includes(m.id));

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
    setTimeout(() => router.push("/programs"), 1200);
  }

  const inputCls = "w-full border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const { color, bg } = statusStyle(program.status);

  if (deleted) {
    return (
      <div className="px-4 md:px-12 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>
          Programme deleted. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/programs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Programmes
            </Link>
          </div>
          <h1 className="text-xl font-bold text-foreground mt-1 truncate" style={{ letterSpacing: "-0.02em" }}>{program.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize" style={{ color, background: bg }}>
              {program.status}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize border border-border rounded-full px-2 py-0.5">
              {program.type}
            </span>
            <span className="text-[10px] text-muted-foreground">{program.organizerName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!editing && (
            <>
              <Link
                href={`/programs/${program.id}/applicants`}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                Applicants ({applications.length})
              </Link>
              <button
                onClick={() => { setDraft(program); setEditing(true); }}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                onClick={cancelEdit}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={weightTotal !== 100}
                className="px-4 py-1.5 text-xs font-bold rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#f36458", color: "#ffffff" }}
              >
                Save changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {!editing && (
        <div className="bg-card border border-border rounded-xl px-6 py-4 flex flex-wrap gap-8 text-[10px] text-muted-foreground">
          <div><span className="text-2xl font-semibold text-foreground">{applications.length}</span><p className="mt-0.5">Applications</p></div>
          <div><span className="text-2xl font-semibold text-green-600">{approvedCount}</span><p className="mt-0.5">Approved</p></div>
          <div><span className="text-2xl font-semibold text-foreground">{mentors.length}</span><p className="mt-0.5">Mentors</p></div>
          <div><span className="text-sm font-medium text-foreground">{formatDate(program.applicationOpenAt)}</span><p className="mt-0.5">Opens</p></div>
          <div><span className="text-sm font-medium text-foreground">{formatDate(program.applicationCloseAt)}</span><p className="mt-0.5">Closes</p></div>
          <div><span className="text-sm font-medium text-foreground">{formatDate(program.startDate)}</span><p className="mt-0.5">Starts</p></div>
          <div><span className="text-sm font-medium text-foreground">{formatDate(program.endDate)}</span><p className="mt-0.5">Ends</p></div>
        </div>
      )}

      {/* READ VIEW */}
      {!editing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basics */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Basics</p>
            <dl className="space-y-2 text-xs">
              {[
                ["Name", program.name],
                ["Type", program.type],
                ["Description", program.description || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="text-muted-foreground w-24 shrink-0">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Target profile */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Target Profile</p>
            <dl className="space-y-2 text-xs">
              <div className="flex gap-3"><dt className="text-muted-foreground w-24 shrink-0">Stages</dt><dd className="text-foreground">{program.targetStages.join(", ") || "—"}</dd></div>
              <div className="flex gap-3"><dt className="text-muted-foreground w-24 shrink-0">Industries</dt><dd className="text-foreground">{program.targetIndustries.join(", ") || "—"}</dd></div>
              <div className="flex gap-3"><dt className="text-muted-foreground w-24 shrink-0">Markets</dt><dd className="text-foreground">{program.targetMarkets.join(", ") || "—"}</dd></div>
            </dl>
          </div>

          {/* Criteria weights */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Criteria Weights</p>
            <div className="space-y-2">
              {CRITERIA_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${program.selectionCriteria[key]}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">{program.selectionCriteria[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application setup */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Application Setup</p>
            <dl className="space-y-2 text-xs">
              <div className="flex gap-3"><dt className="text-muted-foreground w-24 shrink-0">Documents</dt><dd className="text-foreground">{program.requiredDocuments.join(", ") || "None"}</dd></div>
              <div className="flex gap-3"><dt className="text-muted-foreground w-24 shrink-0">App URL</dt><dd className="font-mono text-foreground">/apply/{program.id}</dd></div>
            </dl>
          </div>

          {/* Mentors */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 lg:col-span-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Mentors ({mentors.length})</p>
            <div className="flex flex-wrap gap-2">
              {mentors.map((m) => (
                <span key={m.id} className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5">
                  <span className="font-medium text-foreground">{m.name}</span>
                  <span className="text-muted-foreground ml-1">· {m.currentRole}</span>
                </span>
              ))}
              {mentors.length === 0 && <p className="text-xs text-muted-foreground">No mentors assigned.</p>}
            </div>
          </div>
        </div>
      )}

      {/* EDIT VIEW */}
      {editing && (
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-8">
            {/* Basics */}
            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Basics</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Programme name</label>
                  <input className={inputCls} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Type</label>
                  <select className={inputCls} value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as ProgramType }))}>
                    {PROGRAM_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Status</label>
                  <select className={inputCls} value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Program["status"] }))}>
                    {(["draft","open","reviewing","matching","active","completed"] as Program["status"][]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
                </div>
              </div>
            </section>

            {/* Target profile */}
            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Target Profile</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Target stages</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {STAGE_OPTIONS.map((s) => (
                      <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={draft.targetStages.includes(s)} onChange={() => setDraft((d) => ({ ...d, targetStages: toggle(d.targetStages, s) }))} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Target industries</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <label key={ind} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={draft.targetIndustries.includes(ind)} onChange={() => setDraft((d) => ({ ...d, targetIndustries: toggle(d.targetIndustries, ind) }))} />
                        {ind}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Target markets</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {MARKET_OPTIONS.map((m) => (
                      <label key={m} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={draft.targetMarkets.includes(m)} onChange={() => setDraft((d) => ({ ...d, targetMarkets: toggle(d.targetMarkets, m) }))} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Criteria weights */}
            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Criteria Weights</p>
              <p className="text-xs text-muted-foreground">Must total 100.</p>
              <div className="space-y-2">
                {CRITERIA_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-24 shrink-0">{label}</span>
                    <input type="number" min={0} max={100} className="w-14 border border-border rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-right" value={draft.selectionCriteria[key]} onChange={(e) => updateCriteria(key, e.target.value)} />
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(draft.selectionCriteria[key], 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className={`text-xs font-medium ${weightTotal === 100 ? "text-[var(--status-healthy)]" : "text-[var(--status-critical)]"}`}>
                Total: {weightTotal} / 100
              </p>
            </section>

            {/* Application setup */}
            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Application Setup</p>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Required documents</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {DOC_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={draft.requiredDocuments.includes(key)} onChange={() => setDraft((d) => ({ ...d, requiredDocuments: toggle(d.requiredDocuments, key) }))} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Application opens</label>
                  <input type="date" className={inputCls} value={typeof draft.applicationOpenAt === "string" ? draft.applicationOpenAt.slice(0,10) : ""} onChange={(e) => setDraft((d) => ({ ...d, applicationOpenAt: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Application closes</label>
                  <input type="date" className={inputCls} value={typeof draft.applicationCloseAt === "string" ? draft.applicationCloseAt.slice(0,10) : ""} onChange={(e) => setDraft((d) => ({ ...d, applicationCloseAt: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Programme start</label>
                  <input type="date" className={inputCls} value={typeof draft.startDate === "string" ? draft.startDate.slice(0,10) : ""} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Programme end</label>
                  <input type="date" className={inputCls} value={typeof draft.endDate === "string" ? draft.endDate.slice(0,10) : ""} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
                </div>
              </div>
            </section>

            {/* Mentor assignment */}
            <section className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Mentors</p>
              <div className="border border-border rounded divide-y divide-border">
                {seedMentors.map((mentor) => {
                  const selected = draft.mentorIds.includes(mentor.id);
                  return (
                    <label key={mentor.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors ${selected ? "bg-muted/50" : ""}`}>
                      <input type="checkbox" checked={selected} onChange={() => setDraft((d) => ({ ...d, mentorIds: toggle(d.mentorIds, mentor.id) }))} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{mentor.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{mentor.currentRole} · {mentor.company}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{mentor.availabilityHoursPerMonth}h/mo</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sticky save panel */}
          <div className="w-56 shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Editing</p>
              <p className="text-sm font-medium truncate">{draft.name || "Untitled"}</p>
              <div className="border-t border-border pt-3 space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Mentors</span><span className="font-medium">{draft.mentorIds.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Criteria</span>
                  <span className={`font-medium ${weightTotal === 100 ? "text-[var(--status-healthy)]" : "text-[var(--status-critical)]"}`}>{weightTotal}/100</span>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <button onClick={saveEdit} disabled={weightTotal !== 100} className="w-full px-3 py-2 text-xs font-bold rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#f36458", color: "#ffffff" }}>
                  Save changes
                </button>
                <button onClick={cancelEdit} className="w-full px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors">
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
              <button onClick={() => setShowDelete(false)} className="px-4 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-1.5 text-xs font-semibold rounded" style={{ color: "#fff", background: "var(--status-critical)" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
