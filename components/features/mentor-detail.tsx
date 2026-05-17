"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Mentor, MentorshipStyle } from "@/lib/types";
import { seedCompanies, seedRelationships } from "@/lib/verrier-seed";

const STYLE_OPTIONS: MentorshipStyle[] = ["hands-on", "advisory", "mixed"];
const EXPERTISE_OPTIONS = ["GTM","Fundraising","Pricing","Enterprise sales","Clinical pilots","Hardware partnerships","Pilot design","Unit economics","B2B partnerships","Regulatory","Product strategy","Engineering","Marketing","Operations","Finance"];
const INDUSTRY_OPTIONS  = ["AI/ML","Fintech","Healthtech","Climate","SaaS","AgriTech","FoodTech","EdTech","Logistics","Marketplace"];
const GEO_OPTIONS       = ["Malaysia","Singapore","Indonesia","Thailand","Vietnam","Philippines","Australia","Europe","Middle East","USA"];

const STYLE_COLORS: Record<MentorshipStyle, { color: string; bg: string }> = {
  "hands-on": { color: "#0891b2", bg: "#e0f2fe" },
  advisory:   { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  mixed:      { color: "#d97706", bg: "#fef3c7" },
};

const SECTION = "bg-card border border-border rounded-xl p-6";
const HDR     = "text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-5";
const INPUT   = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function formatSlotTime(ts: unknown): string {
  try {
    const d = new Date(String(ts));
    return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(ts);
  }
}

interface MentorDetailProps {
  mentor: Mentor;
}

export function MentorDetail({ mentor: init }: MentorDetailProps) {
  const router = useRouter();
  const [mentor,  setMentor]  = useState<Mentor>(init);
  const [draft,   setDraft]   = useState<Mentor>(init);
  const [editing, setEditing] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const companyMap = new Map(seedCompanies.map((c) => [c.id, c]));
  const rels = seedRelationships.filter((r) => r.mentorId === mentor.id);
  const sc = STYLE_COLORS[mentor.mentorshipStyle];

  function save() {
    setMentor(draft);
    setEditing(false);
    toast.success("Mentor saved locally.");
  }

  function cancelEdit() {
    setDraft(mentor);
    setEditing(false);
  }

  function handleDelete() {
    setDeleted(true);
    toast.success("Mentor removed locally.");
    setTimeout(() => router.push("/mentors"), 1100);
  }

  const slotStatusColor: Record<string, string> = {
    available: "var(--status-healthy)",
    held:      "var(--status-risk)",
    booked:    "var(--status-critical)",
  };

  if (deleted) return (
    <div className="px-8 py-16 text-center">
      <p className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>Removed. Redirecting…</p>
    </div>
  );

  return (
    <div className="px-8 py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link href="/mentors" className="text-sm w-fit hover:underline" style={{ color: "var(--primary)" }}>
          ← Mentors
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 border-2"
              style={{ background: sc.bg, color: sc.color, borderColor: sc.color + "44" }}
            >
              {mentor.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{mentor.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{mentor.currentRole} · {mentor.company}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize" style={{ color: sc.color, background: sc.bg }}>
                  {mentor.mentorshipStyle}
                </span>
                {mentor.hasFounderExperience && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border text-muted-foreground">Founder exp.</span>
                )}
                {mentor.hasInvestorExperience && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border text-muted-foreground">Investor exp.</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editing ? (
              <>
                <button onClick={() => { setDraft(mentor); setEditing(true); }} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Edit</button>
                <button onClick={() => setShowDel(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--status-critical)" }}>Remove</button>
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
            <p className="text-2xl font-bold text-foreground">{mentor.availabilityHoursPerMonth}h</p>
            <p className="text-xs text-muted-foreground mt-1">Available / month</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "var(--status-healthy)" }}>{mentor.pastSuccessCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Past successes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{rels.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active relationships</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{mentor.availabilitySlots.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Availability slots</p>
          </div>
        </div>
      </div>

      {!editing ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile */}
            <section className={SECTION}>
              <h3 className={HDR}>Profile</h3>
              <div className="flex flex-col gap-3">
                {[
                  ["Name",   mentor.name],
                  ["Role",   mentor.currentRole],
                  ["Company",mentor.company],
                  ["Email",  mentor.email],
                  ["Style",  mentor.mentorshipStyle],
                  ["Languages", mentor.languages.join(", ")],
                ].map(([l, v]) => (
                  <div key={l} className="grid grid-cols-3 gap-3">
                    <span className="text-sm text-muted-foreground">{l}</span>
                    <span className="col-span-2 text-sm text-foreground capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Expertise */}
            <section className={SECTION}>
              <h3 className={HDR}>Expertise</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {mentor.expertise.map((e) => (
                  <span key={e} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground">{e}</span>
                ))}
              </div>
              <h3 className={HDR}>Industries</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.industries.map((i) => (
                  <span key={i} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground">{i}</span>
                ))}
              </div>
            </section>

            {/* Preferred stages + geographies */}
            <section className={SECTION}>
              <h3 className={HDR}>Preferred Stages</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {mentor.preferredStages.map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground capitalize">{s}</span>
                ))}
              </div>
              <h3 className={HDR}>Geographies</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.geographies.map((g) => (
                  <span key={g} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground">{g}</span>
                ))}
              </div>
            </section>

            {/* Availability slots */}
            <section className={SECTION}>
              <h3 className={HDR}>Availability Slots ({mentor.availabilitySlots.length})</h3>
              {mentor.availabilitySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots configured.</p>
              ) : (
                <div className="space-y-2">
                  {mentor.availabilitySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-xs">
                      <div>
                        <p className="text-foreground font-medium">{formatSlotTime(slot.startsAt)}</p>
                        <p className="text-muted-foreground capitalize">{slot.mode}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
                        style={{ color: slotStatusColor[slot.status] ?? "var(--muted-foreground)", background: "var(--muted)" }}
                      >
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Matched startups — full width */}
          <section className={SECTION}>
            <h3 className={HDR}>Matched Startups ({rels.length})</h3>
            {rels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active startup relationships.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rels.map((r) => {
                  const company = companyMap.get(r.companyId);
                  return company ? (
                    <Link
                      key={r.id}
                      href={`/startups/${company.id}`}
                      className="flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-muted/70 transition-colors group border border-transparent hover:border-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-xs font-bold shrink-0">{company.name[0]}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:underline truncate">{company.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{company.stage} · {r.status}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-foreground">{r.healthScore}</p>
                        <p className="text-[10px] text-muted-foreground">health</p>
                      </div>
                    </Link>
                  ) : null;
                })}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Edit layout */
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-6">
            <section className={`${SECTION} space-y-4`}>
              <h3 className={HDR}>Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Full name</label>
                  <input className={INPUT} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Current role</label>
                  <input className={INPUT} value={draft.currentRole} onChange={(e) => setDraft((d) => ({ ...d, currentRole: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
                  <input className={INPUT} value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
                  <input type="email" className={INPUT} value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Availability (h/mo)</label>
                  <input type="number" min={1} max={40} className={INPUT} value={draft.availabilityHoursPerMonth} onChange={(e) => setDraft((d) => ({ ...d, availabilityHoursPerMonth: Number(e.target.value) || 1 }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1.5">Mentorship style</label>
                  <div className="flex gap-3">
                    {STYLE_OPTIONS.map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="style" checked={draft.mentorshipStyle === s} onChange={() => setDraft((d) => ({ ...d, mentorshipStyle: s }))} />
                        <span className="capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Has founder experience</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.hasFounderExperience} onChange={(e) => setDraft((d) => ({ ...d, hasFounderExperience: e.target.checked }))} />
                    Yes
                  </label>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Has investor experience</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.hasInvestorExperience} onChange={(e) => setDraft((d) => ({ ...d, hasInvestorExperience: e.target.checked }))} />
                    Yes
                  </label>
                </div>
              </div>
            </section>

            <section className={`${SECTION} space-y-3`}>
              <h3 className={HDR}>Expertise</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {EXPERTISE_OPTIONS.map((e) => (
                  <label key={e} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.expertise.includes(e)} onChange={() => setDraft((d) => ({ ...d, expertise: toggle(d.expertise, e) }))} />
                    {e}
                  </label>
                ))}
              </div>
            </section>

            <section className={`${SECTION} space-y-3`}>
              <h3 className={HDR}>Industries</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {INDUSTRY_OPTIONS.map((i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.industries.includes(i)} onChange={() => setDraft((d) => ({ ...d, industries: toggle(d.industries, i) }))} />
                    {i}
                  </label>
                ))}
              </div>
            </section>

            <section className={`${SECTION} space-y-3`}>
              <h3 className={HDR}>Geographies</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {GEO_OPTIONS.map((g) => (
                  <label key={g} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.geographies.includes(g)} onChange={() => setDraft((d) => ({ ...d, geographies: toggle(d.geographies, g) }))} />
                    {g}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky save */}
          <div className="w-52 shrink-0 sticky top-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Editing</p>
              <p className="text-sm font-semibold text-foreground truncate">{draft.name || "Unnamed"}</p>
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
            <p className="text-sm font-semibold">Remove &ldquo;{mentor.name}&rdquo;?</p>
            <p className="text-xs text-muted-foreground">This removes the mentor from the local pool and cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDel(false)} className="px-4 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-xs font-semibold rounded-lg text-white" style={{ background: "var(--status-critical)" }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
