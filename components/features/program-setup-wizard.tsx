"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Program, ProgramType, SelectionCriteria } from "@/lib/types";
import { seedMentors } from "@/lib/verrier-seed";

const PROGRAM_TYPES: { value: ProgramType; label: string; description: string }[] = [
  { value: "accelerator", label: "Accelerator", description: "Equity-based, cohort model" },
  { value: "incubator", label: "Incubator", description: "Long-term nurturing support" },
  { value: "grant", label: "Grant", description: "Non-dilutive funding" },
  { value: "corporate-innovation", label: "Corporate Innovation", description: "Enterprise-backed" },
  { value: "university", label: "University", description: "Academic institution" },
  { value: "challenge", label: "Challenge", description: "Competition format" },
];

const STAGE_OPTIONS = ["idea", "pre-seed", "seed", "series-a", "series-b", "growth"];

const INDUSTRY_OPTIONS = [
  "AI/ML", "Fintech", "Healthtech", "Climate",
  "SaaS", "AgriTech", "FoodTech", "EdTech",
];

const MARKET_OPTIONS = [
  "Malaysia", "Singapore", "Indonesia",
  "Thailand", "Vietnam", "Philippines",
];

const DOC_OPTIONS: { key: string; label: string }[] = [
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

const DRAFT_PROGRAM_ID = "program-draft-local";
const SESSION_ISO = new Date().toISOString();

interface WizardState {
  name: string;
  type: ProgramType;
  description: string;
  targetStages: string[];
  targetIndustries: string[];
  targetMarkets: string[];
  selectionCriteria: SelectionCriteria;
  requiredDocuments: string[];
  applicationOpenAt: string;
  applicationCloseAt: string;
  startDate: string;
  endDate: string;
  mentorIds: string[];
}

const DEFAULT_STATE: WizardState = {
  name: "",
  type: "accelerator",
  description: "",
  targetStages: [],
  targetIndustries: [],
  targetMarkets: [],
  selectionCriteria: {
    stageWeight: 25,
    industryWeight: 20,
    tractionWeight: 20,
    teamWeight: 20,
    needsFitWeight: 15,
  },
  requiredDocuments: [],
  applicationOpenAt: "",
  applicationCloseAt: "",
  startDate: "",
  endDate: "",
  mentorIds: [],
};

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-foreground mb-2">
      {children}
      {required && <span className="text-[#f36458] ml-0.5">*</span>}
    </label>
  );
}

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
              active
                ? "bg-[#f36458] border-[#f36458] text-white"
                : "bg-background border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function ProgramSetupWizard() {
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);

  const weightTotal =
    state.selectionCriteria.stageWeight +
    state.selectionCriteria.industryWeight +
    state.selectionCriteria.tractionWeight +
    state.selectionCriteria.teamWeight +
    state.selectionCriteria.needsFitWeight;

  const previewProgram: Program = {
    id: DRAFT_PROGRAM_ID,
    name: state.name || "Untitled Programme",
    organizerName: "Demo Organizer",
    organizerId: "user-admin-01",
    type: state.type,
    description: state.description,
    targetStages: state.targetStages,
    targetIndustries: state.targetIndustries,
    targetMarkets: state.targetMarkets,
    selectionCriteria: state.selectionCriteria,
    requiredDocuments: state.requiredDocuments,
    applicationOpenAt: state.applicationOpenAt || SESSION_ISO,
    applicationCloseAt: state.applicationCloseAt || SESSION_ISO,
    startDate: state.startDate || SESSION_ISO,
    endDate: state.endDate || SESSION_ISO,
    status: "draft",
    mentorIds: state.mentorIds,
    selectedCompanyIds: [],
    createdAt: SESSION_ISO,
    updatedAt: SESSION_ISO,
  };

  const isReady =
    state.name.trim().length > 0 &&
    state.targetStages.length > 0 &&
    weightTotal === 100;

  const completionFlags = [
    { done: state.name.trim().length > 0, label: "Programme name" },
    { done: state.targetStages.length > 0, label: "At least one stage" },
    { done: weightTotal === 100, label: `Criteria totals 100 (${weightTotal} now)` },
  ];

  function updateCriteria(key: keyof SelectionCriteria, raw: string) {
    const value = Math.max(0, Math.min(100, Number(raw) || 0));
    setState((s) => ({
      ...s,
      selectionCriteria: { ...s.selectionCriteria, [key]: value },
    }));
  }

  function saveProgramme() {
    setSaved(true);
    toast.success("Programme saved locally.");
  }

  function resetProgramme() {
    setState(DEFAULT_STATE);
    setSaved(false);
    toast.success("Ready for a new programme.");
  }

  const inputCls =
    "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/60 transition-colors";

  return (
    <div className="px-4 md:px-12 py-8">
      <div className="flex gap-8 items-start">
        {/* Left: form */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Basics */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <SectionTitle title="Basics" />
            <div className="space-y-5">
              <div>
                <FieldLabel required>Programme name</FieldLabel>
                <input
                  className={inputCls}
                  placeholder="e.g. Cradle Startup Accelerator 2026"
                  value={state.name}
                  onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div>
                <FieldLabel>Programme type</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {PROGRAM_TYPES.map(({ value, label, description }) => {
                    const active = state.type === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, type: value }))}
                        className={`rounded-xl px-3.5 py-3 text-left transition-all border ${
                          active
                            ? "border-[#f36458] bg-[rgba(243,100,88,0.06)]"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                              active ? "border-[#f36458]" : "border-border"
                            }`}
                          >
                            {active && (
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: "#f36458" }}
                              />
                            )}
                          </span>
                          <p className={`text-xs font-semibold leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>
                            {label}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground pl-4.5 leading-snug">
                          {description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Programme goals, format, and context…"
                  value={state.description}
                  onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Target Profile */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <SectionTitle title="Target Profile" />
            <div className="space-y-5">
              <div>
                <FieldLabel required>Target stages</FieldLabel>
                <PillGroup
                  options={STAGE_OPTIONS}
                  selected={state.targetStages}
                  onToggle={(s) =>
                    setState((prev) => ({ ...prev, targetStages: toggle(prev.targetStages, s) }))
                  }
                />
              </div>
              <div>
                <FieldLabel>Target industries</FieldLabel>
                <PillGroup
                  options={INDUSTRY_OPTIONS}
                  selected={state.targetIndustries}
                  onToggle={(s) =>
                    setState((prev) => ({ ...prev, targetIndustries: toggle(prev.targetIndustries, s) }))
                  }
                />
              </div>
              <div>
                <FieldLabel>Target markets</FieldLabel>
                <PillGroup
                  options={MARKET_OPTIONS}
                  selected={state.targetMarkets}
                  onToggle={(s) =>
                    setState((prev) => ({ ...prev, targetMarkets: toggle(prev.targetMarkets, s) }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Criteria Weights */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <SectionTitle title="Criteria Weights" />
            <p className="text-xs text-muted-foreground mb-5">
              Weights must total exactly 100. Adjust each dimension to reflect your programme priorities.
            </p>
            <div className="space-y-4">
              {CRITERIA_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-sm text-foreground w-24 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(state.selectionCriteria[key], 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-14 border border-border rounded-lg px-2 py-1.5 text-sm bg-background text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/60 transition-colors tabular-nums"
                      value={state.selectionCriteria[key]}
                      onChange={(e) => updateCriteria(key, e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-5 flex items-center gap-2 text-xs font-semibold ${
                weightTotal === 100 ? "text-[var(--status-healthy)]" : "text-[var(--status-critical)]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] ${
                  weightTotal === 100
                    ? "border-[var(--status-healthy)] text-[var(--status-healthy)]"
                    : "border-[var(--status-critical)] text-[var(--status-critical)]"
                }`}
              >
                {weightTotal === 100 ? "✓" : "!"}
              </span>
              Total: {weightTotal} / 100
            </div>
          </section>

          {/* Application Setup */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <SectionTitle title="Application Setup" />
            <div className="space-y-5">
              <div>
                <FieldLabel>Required documents</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {DOC_OPTIONS.map(({ key, label }) => {
                    const active = state.requiredDocuments.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            requiredDocuments: toggle(s.requiredDocuments, key),
                          }))
                        }
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all ${
                          active
                            ? "bg-[#f36458] border-[#f36458] text-white"
                            : "bg-background border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Application opens</FieldLabel>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.applicationOpenAt}
                    onChange={(e) => setState((s) => ({ ...s, applicationOpenAt: e.target.value }))}
                  />
                </div>
                <div>
                  <FieldLabel>Application closes</FieldLabel>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.applicationCloseAt}
                    onChange={(e) => setState((s) => ({ ...s, applicationCloseAt: e.target.value }))}
                  />
                </div>
                <div>
                  <FieldLabel>Programme start</FieldLabel>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.startDate}
                    onChange={(e) => setState((s) => ({ ...s, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <FieldLabel>Programme end</FieldLabel>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.endDate}
                    onChange={(e) => setState((s) => ({ ...s, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Mentor Setup */}
          <section className="bg-card rounded-2xl border border-border p-6">
            <SectionTitle title="Mentor Setup" />
            <div className="space-y-2">
              {seedMentors.map((mentor) => {
                const selected = state.mentorIds.includes(mentor.id);
                return (
                  <label
                    key={mentor.id}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer border transition-all ${
                      selected
                        ? "border-[rgba(243,100,88,0.4)] bg-[rgba(243,100,88,0.04)]"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        setState((s) => ({
                          ...s,
                          mentorIds: toggle(s.mentorIds, mentor.id),
                        }))
                      }
                      className="sr-only"
                    />
                    {/* Custom checkbox */}
                    <span
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                        selected ? "bg-[#f36458] border-[#f36458]" : "bg-background border-border"
                      }`}
                    >
                      {selected && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white stroke-[2] stroke-linecap-round stroke-linejoin-round">
                          <polyline points="1,4 3.5,6.5 9,1" />
                        </svg>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${selected ? "text-foreground" : "text-foreground"}`}>
                        {mentor.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mentor.currentRole} · {mentor.company}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {mentor.expertise.slice(0, 2).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mentor.availabilityHoursPerMonth}h / mo
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: preview panel */}
        <div className="w-64 shrink-0 sticky top-6 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4 font-mono">
              Live Preview
            </p>

            <div className="mb-4">
              <p className="text-base font-bold leading-tight text-foreground">{previewProgram.name}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{previewProgram.type.replace("-", " ")}</p>
            </div>

            <div className="space-y-2.5 text-xs border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize px-2 py-0.5 bg-muted rounded-full text-foreground">
                  {previewProgram.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mentors</span>
                <span className="font-semibold">{previewProgram.mentorIds.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Stages</span>
                <span className="font-semibold">{state.targetStages.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Criteria total</span>
                <span
                  className={`font-semibold ${
                    weightTotal === 100
                      ? "text-[var(--status-healthy)]"
                      : "text-[var(--status-critical)]"
                  }`}
                >
                  {weightTotal} / 100
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {completionFlags.map(({ done, label }) => (
                <div key={label} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 text-[10px] w-3.5 h-3.5 rounded-full border flex items-center justify-center font-bold ${
                      done
                        ? "border-[var(--status-healthy)] text-[var(--status-healthy)]"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {done ? "✓" : "·"}
                  </span>
                  <p className={`text-[11px] leading-tight ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Application URL */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-widest">
                Application URL
              </p>
              <p className="text-xs font-mono text-foreground break-all bg-background rounded-lg px-3 py-2 border border-border">
                /apply/{previewProgram.id}
              </p>
            </div>

            {/* Actions */}
            {!saved && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={saveProgramme}
                  disabled={!isReady}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    isReady
                      ? { background: "#f36458", color: "#ffffff" }
                      : { background: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                >
                  Save Programme
                </button>
                {!isReady && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Complete the checklist above
                  </p>
                )}
              </div>
            )}
            {saved && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <p className="text-xs font-semibold text-[var(--status-healthy)] flex items-center gap-1.5">
                  <span>✓</span> Programme saved
                </p>
                <button
                  onClick={resetProgramme}
                  className="w-full px-4 py-2 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  Create another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
