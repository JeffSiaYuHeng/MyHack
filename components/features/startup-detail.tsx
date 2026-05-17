"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Company, StartupStage, BusinessModel } from "@/lib/types";
import { seedPrograms, seedRelationships, seedMentors } from "@/lib/verrier-seed";

const STAGE_OPTIONS: StartupStage[] = ["idea","pre-seed","seed","series-a","series-b","growth"];
const BM_OPTIONS: BusinessModel[] = ["B2B","B2C","B2B2C","Marketplace","Other"];
const INDUSTRY_OPTIONS = ["AI/ML","Fintech","Healthtech","Climate","SaaS","AgriTech","FoodTech","EdTech","Logistics","Marketplace"];

const STAGE_COLORS: Record<string, { color: string; bg: string }> = {
  idea:       { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "pre-seed": { color: "#d97706", bg: "#fef3c7" },
  seed:       { color: "#0891b2", bg: "#e0f2fe" },
  "series-a": { color: "#16a34a", bg: "#dcfce7" },
  "series-b": { color: "#166534", bg: "#bbf7d0" },
  growth:     { color: "#1d4ed8", bg: "#dbeafe" },
};

function stageStyle(stage: string) {
  return STAGE_COLORS[stage] ?? { color: "#64748b", bg: "#f1f5f9" };
}

const SECTION = "bg-card border border-border rounded-xl p-6";
const HDR     = "text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-5";
const INPUT   = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

interface StartupDetailProps {
  company: Company;
}

export function StartupDetail({ company: init }: StartupDetailProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company>(init);
  const [draft,   setDraft]   = useState<Company>(init);
  const [editing, setEditing] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const programMap  = new Map(seedPrograms.map((p) => [p.id, p]));
  const mentorMap   = new Map(seedMentors.map((m) => [m.id, m]));
  const rels = seedRelationships.filter((r) => r.companyId === company.id);
  const ss = stageStyle(company.stage);

  function save() {
    setCompany(draft);
    setEditing(false);
    toast.success("Startup saved locally.");
  }

  function cancelEdit() {
    setDraft(company);
    setEditing(false);
  }

  function handleDelete() {
    setDeleted(true);
    toast.success("Startup removed locally.");
    setTimeout(() => router.push("/startups"), 1100);
  }

  if (deleted) return (
    <div className="px-8 py-16 text-center">
      <p className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>Removed. Redirecting…</p>
    </div>
  );

  return (
    <div className="px-8 py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/startups" className="text-sm w-fit hover:underline" style={{ color: "var(--primary)" }}>
          ← Startups
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
              style={{ background: ss.bg, color: ss.color }}
            >
              {company.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize" style={{ color: ss.color, background: ss.bg }}>
                  {company.stage}
                </span>
                {company.industry.map((i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border text-muted-foreground">
                    {i}
                  </span>
                ))}
                {company.isMatched && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ color: "var(--status-healthy)", background: "var(--status-healthy-bg)" }}>
                    Matched
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editing ? (
              <>
                <button onClick={() => { setDraft(company); setEditing(true); }} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Edit</button>
                <button onClick={() => setShowDel(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--status-critical)" }}>Delete</button>
              </>
            ) : (
              <>
                <button onClick={cancelEdit} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancel</button>
                <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--primary)" }}>Save</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <p className="text-2xl font-bold text-foreground">{company.teamSize}</p>
            <p className="text-xs text-muted-foreground mt-1">Team size</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: company.revenueMonthly ? "var(--status-healthy)" : undefined }}>
              {company.revenueMonthly !== undefined ? `MYR ${(company.revenueMonthly / 1000).toFixed(0)}k` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Monthly revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{rels.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Mentor relationships</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{company.programIds.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Programmes</p>
          </div>
        </div>
      </div>

      {!editing ? (
        <>
          {/* Read layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business info */}
            <section className={SECTION}>
              <h3 className={HDR}>Business Profile</h3>
              <div className="flex flex-col gap-3">
                {[
                  ["Name",           company.name],
                  ["Stage",          company.stage],
                  ["Business model", company.businessModel],
                  ["Location",       `${company.city ? company.city + ", " : ""}${company.country}`],
                  ["Reg. number",    company.registrationNumber ?? "—"],
                ].map(([l, v]) => (
                  <div key={l} className="grid grid-cols-3 gap-3">
                    <span className="text-sm text-muted-foreground">{l}</span>
                    <span className="col-span-2 text-sm text-foreground capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Founders */}
            <section className={SECTION}>
              <h3 className={HDR}>Founders ({company.founders.length})</h3>
              <div className="space-y-4">
                {company.founders.map((f) => (
                  <div key={f.name} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                      {f.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.role}</p>
                      {f.email && <p className="text-xs text-muted-foreground font-mono">{f.email}</p>}
                      {f.background && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.background}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Support needs */}
            <section className={SECTION}>
              <h3 className={HDR}>Support Needs</h3>
              <div className="flex flex-wrap gap-2">
                {company.needsHelp.length > 0
                  ? company.needsHelp.map((n) => (
                      <span key={n} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground">{n}</span>
                    ))
                  : <p className="text-sm text-muted-foreground">None listed.</p>
                }
              </div>
            </section>

            {/* Industries */}
            <section className={SECTION}>
              <h3 className={HDR}>Industries</h3>
              <div className="flex flex-wrap gap-2">
                {company.industry.map((i) => (
                  <span key={i} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground">{i}</span>
                ))}
              </div>
              {company.founderBackground && (
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{company.founderBackground}</p>
              )}
            </section>
          </div>

          {/* Programmes + Mentor rels — full width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className={SECTION}>
              <h3 className={HDR}>Programmes</h3>
              {company.programIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enrolled in any programme.</p>
              ) : (
                <div className="space-y-2">
                  {company.programIds.map((pid) => {
                    const p = programMap.get(pid);
                    return p ? (
                      <Link key={pid} href={`/programs/${pid}`} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors group">
                        <span className="text-sm font-medium text-foreground group-hover:underline">{p.name}</span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground capitalize">{p.status}</span>
                      </Link>
                    ) : (
                      <p key={pid} className="text-xs text-muted-foreground">{pid}</p>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={SECTION}>
              <h3 className={HDR}>Assigned Mentors ({rels.length})</h3>
              {rels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mentor relationships yet.</p>
              ) : (
                <div className="space-y-2">
                  {rels.map((r) => {
                    const m = mentorMap.get(r.mentorId);
                    return m ? (
                      <Link key={r.id} href={`/mentors/${m.id}`} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors group">
                        <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold shrink-0">{m.name[0]}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:underline">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.currentRole}</p>
                        </div>
                        <span
                          className="text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0 capitalize"
                          style={{
                            color: r.status === "active" ? "var(--status-healthy)" : "var(--muted-foreground)",
                            background: r.status === "active" ? "var(--status-healthy-bg)" : "var(--muted)",
                          }}
                        >
                          {r.status}
                        </span>
                      </Link>
                    ) : null;
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        /* Edit layout */
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            <section className={`${SECTION} space-y-4`}>
              <h3 className={HDR}>Business Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Company name</label>
                  <input className={INPUT} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Stage</label>
                  <select className={INPUT} value={draft.stage} onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value as StartupStage }))}>
                    {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Business model</label>
                  <select className={INPUT} value={draft.businessModel} onChange={(e) => setDraft((d) => ({ ...d, businessModel: e.target.value as BusinessModel }))}>
                    {BM_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">City</label>
                  <input className={INPUT} value={draft.city ?? ""} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Country</label>
                  <input className={INPUT} value={draft.country} onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Team size</label>
                  <input type="number" min={1} className={INPUT} value={draft.teamSize} onChange={(e) => setDraft((d) => ({ ...d, teamSize: Number(e.target.value) || 1 }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Monthly revenue (MYR)</label>
                  <input type="number" min={0} className={INPUT} value={draft.revenueMonthly ?? ""} onChange={(e) => setDraft((d) => ({ ...d, revenueMonthly: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
              </div>
            </section>

            <section className={`${SECTION} space-y-3`}>
              <h3 className={HDR}>Industries</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <label key={ind} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.industry.includes(ind)} onChange={() => setDraft((d) => ({ ...d, industry: toggle(d.industry, ind) }))} />
                    {ind}
                  </label>
                ))}
              </div>
            </section>

            <section className={`${SECTION} space-y-3`}>
              <h3 className={HDR}>Founder Background</h3>
              <textarea
                className={`${INPUT} resize-none`}
                rows={3}
                value={draft.founderBackground ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, founderBackground: e.target.value }))}
                placeholder="Brief background about the founding team…"
              />
            </section>
          </div>

          {/* Sticky save */}
          <div className="w-52 shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Editing</p>
              <p className="text-sm font-semibold text-foreground truncate">{draft.name || "Untitled"}</p>
              <div className="border-t border-border pt-4 space-y-2">
                <button onClick={save} className="w-full px-3 py-2 text-sm font-semibold rounded-lg text-white hover:opacity-90" style={{ background: "var(--primary)" }}>Save</button>
                <button onClick={cancelEdit} className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <p className="text-sm font-semibold">Delete &ldquo;{company.name}&rdquo;?</p>
            <p className="text-xs text-muted-foreground">This removes the startup locally and cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDel(false)} className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-xs font-semibold rounded-lg text-white" style={{ background: "var(--status-critical)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
