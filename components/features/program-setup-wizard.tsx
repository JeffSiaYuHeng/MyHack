"use client";

import { useState } from "react";
import type { Program, ProgramType, SelectionCriteria } from "@/lib/types";
import { seedMentors } from "@/lib/verrier-seed";

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
  { value: "accelerator", label: "Accelerator" },
  { value: "incubator", label: "Incubator" },
  { value: "grant", label: "Grant" },
  { value: "corporate-innovation", label: "Corporate innovation" },
  { value: "university", label: "University" },
  { value: "challenge", label: "Challenge" },
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

export function ProgramSetupWizard() {
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);

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

  const completionFlags: string[] = [];
  if (!state.name.trim()) completionFlags.push("Programme name required");
  if (state.targetStages.length === 0) completionFlags.push("At least one target stage required");
  if (weightTotal !== 100) completionFlags.push(`Criteria weights must total 100 (current: ${weightTotal})`);

  function updateCriteria(key: keyof SelectionCriteria, raw: string) {
    const value = Math.max(0, Math.min(100, Number(raw) || 0));
    setState((s) => ({
      ...s,
      selectionCriteria: { ...s.selectionCriteria, [key]: value },
    }));
  }

  const inputCls =
    "w-full border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="px-4 md:px-12 py-8">
      <div className="flex gap-8 items-start">
        {/* Left: form sections */}
        <div className="flex-1 min-w-0 space-y-10">
          {/* Basics */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Basics
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Programme name
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. Cradle Startup Accelerator 2026"
                  value={state.name}
                  onChange={(e) =>
                    setState((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Type
                </label>
                <select
                  className={inputCls}
                  value={state.type}
                  onChange={(e) =>
                    setState((s) => ({ ...s, type: e.target.value as ProgramType }))
                  }
                >
                  {PROGRAM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Programme goals, format, and context"
                  value={state.description}
                  onChange={(e) =>
                    setState((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Target Profile */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Target Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Target stages
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {STAGE_OPTIONS.map((stage) => (
                    <label key={stage} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.targetStages.includes(stage)}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            targetStages: toggle(s.targetStages, stage),
                          }))
                        }
                      />
                      {stage}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Target industries
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <label key={ind} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.targetIndustries.includes(ind)}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            targetIndustries: toggle(s.targetIndustries, ind),
                          }))
                        }
                      />
                      {ind}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Target markets
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {MARKET_OPTIONS.map((market) => (
                    <label key={market} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.targetMarkets.includes(market)}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            targetMarkets: toggle(s.targetMarkets, market),
                          }))
                        }
                      />
                      {market}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Criteria Weights */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Criteria Weights
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Weights must total 100.
            </p>
            <div className="space-y-2">
              {CRITERIA_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-24 shrink-0">{label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-14 border border-border rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-right"
                    value={state.selectionCriteria[key]}
                    onChange={(e) => updateCriteria(key, e.target.value)}
                  />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(state.selectionCriteria[key], 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p
              className={`mt-3 text-xs font-medium ${
                weightTotal === 100
                  ? "text-[var(--status-healthy)]"
                  : "text-[var(--status-critical)]"
              }`}
            >
              Total: {weightTotal} / 100
            </p>
          </section>

          {/* Application Setup */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Application Setup
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">
                  Required documents
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {DOC_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.requiredDocuments.includes(key)}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            requiredDocuments: toggle(s.requiredDocuments, key),
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Application opens
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.applicationOpenAt}
                    onChange={(e) =>
                      setState((s) => ({ ...s, applicationOpenAt: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Application closes
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.applicationCloseAt}
                    onChange={(e) =>
                      setState((s) => ({ ...s, applicationCloseAt: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Programme start
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.startDate}
                    onChange={(e) =>
                      setState((s) => ({ ...s, startDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Programme end
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={state.endDate}
                    onChange={(e) =>
                      setState((s) => ({ ...s, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Mentor Setup */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Mentor Setup
            </h2>
            <div className="border border-border rounded divide-y divide-border">
              {seedMentors.map((mentor) => {
                const selected = state.mentorIds.includes(mentor.id);
                return (
                  <label
                    key={mentor.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors ${
                      selected ? "bg-muted/50" : ""
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
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{mentor.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mentor.currentRole} &middot; {mentor.company}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {mentor.expertise.slice(0, 2).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mentor.availabilityHoursPerMonth}h/mo
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: preview panel */}
        <div className="w-60 shrink-0 sticky top-6">
          <div className="border border-border rounded bg-card p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Preview
              </p>
              <p className="text-sm font-medium truncate">{previewProgram.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                {previewProgram.type}
              </p>
            </div>
            <div className="space-y-2 text-xs border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{previewProgram.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mentors</span>
                <span className="font-medium">{previewProgram.mentorIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criteria total</span>
                <span
                  className={`font-medium ${
                    weightTotal === 100
                      ? "text-[var(--status-healthy)]"
                      : "text-[var(--status-critical)]"
                  }`}
                >
                  {weightTotal} / 100
                </span>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground mb-1">Application URL</p>
              <p className="text-xs font-mono text-foreground break-all">
                /apply/{previewProgram.id}
              </p>
            </div>
            {!isReady && completionFlags.length > 0 && (
              <div className="border-t border-border pt-3 space-y-1">
                {completionFlags.map((flag) => (
                  <p key={flag} className="text-[10px] text-[var(--status-critical)]">
                    {flag}
                  </p>
                ))}
              </div>
            )}
            {isReady && (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-medium text-[var(--status-healthy)]">
                  Ready to save
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
