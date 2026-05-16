"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Company, StartupStage } from "@/lib/types";

const STAGES: { value: StartupStage | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "idea",     label: "Idea" },
  { value: "pre-seed", label: "Pre-seed" },
  { value: "seed",     label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "growth",   label: "Growth" },
];

const STAGE_COLORS: Record<string, { color: string; bg: string }> = {
  idea:      { color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "pre-seed":{ color: "#d97706", bg: "#fef3c7" },
  seed:      { color: "#0891b2", bg: "#e0f2fe" },
  "series-a":{ color: "#16a34a", bg: "#dcfce7" },
  "series-b":{ color: "#166534", bg: "#bbf7d0" },
  growth:    { color: "#1d4ed8", bg: "#dbeafe" },
};

function stageStyle(stage: string) {
  return STAGE_COLORS[stage] ?? { color: "#64748b", bg: "#f1f5f9" };
}

interface StartupListProps {
  companies: Company[];
}

export function StartupList({ companies: initial }: StartupListProps) {
  const [companies, setCompanies] = useState<Company[]>(initial);
  const [query, setQuery]         = useState("");
  const [stageFilter, setStage]   = useState<StartupStage | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const visible = companies.filter((c) => {
    const matchesStage = stageFilter === "all" || c.stage === stageFilter;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.industry.some((i) => i.toLowerCase().includes(q)) ||
      c.city?.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q);
    return matchesStage && matchesQuery;
  });

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE) || 1;
  const paginated = visible.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Startups</h1>
          <p className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
            {companies.length} companies
          </p>
        </div>
        <button
          onClick={() => toast.error("Operation restricted in Demo Mode.")}
          className="px-6 py-3 rounded-full text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + Add Startup
        </button>
      </div>

      {/* Search + stage filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, industry, city…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1 flex-wrap">
          {STAGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setStage(value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                stageFilter === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm font-semibold text-foreground">No startups found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Industry</th>
                  <th className="p-4">Needs Help</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((company) => {
                  const ss = stageStyle(company.stage);
                  return (
                    <tr key={company.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="p-4 text-sm text-foreground">
                        <div className="font-bold flex items-center gap-2">
                          {company.name}
                          {company.revenueMonthly !== undefined && company.revenueMonthly > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-800 font-medium whitespace-nowrap">
                              Revenue
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {company.city ? `${company.city}, ` : ""}{company.country}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium capitalize whitespace-nowrap"
                          style={{ color: ss.color, background: ss.bg }}
                        >
                          {company.stage}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {company.industry.slice(0, 2).map((ind) => (
                            <span key={ind} className="text-[10px] bg-muted border border-border rounded px-2 py-0.5 text-muted-foreground whitespace-nowrap">
                              {ind}
                            </span>
                          ))}
                          {company.industry.length > 2 && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">+{company.industry.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate align-middle">
                        {company.needsHelp.join(", ") || "None specified"}
                      </td>
                      <td className="p-4 align-middle text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.error("Operation restricted in Demo Mode."); }}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.success("Startup removed locally."); setCompanies(prev => prev.filter(c => c.id !== company.id)); }}
                          className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors px-2 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && visible.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
