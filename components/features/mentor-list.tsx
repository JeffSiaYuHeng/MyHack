"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Mentor, MentorshipStyle } from "@/lib/types";

const STYLE_FILTERS: { value: MentorshipStyle | "all"; label: string }[] = [
  { value: "all",      label: "All styles" },
  { value: "hands-on", label: "Hands-on" },
  { value: "advisory", label: "Advisory" },
  { value: "mixed",    label: "Mixed" },
];

interface MentorListProps {
  mentors: Mentor[];
}

export function MentorList({ mentors: initial }: MentorListProps) {
  const [mentors,  setMentors]  = useState<Mentor[]>(initial);
  const [query,    setQuery]    = useState("");
  const [style,    setStyle]    = useState<MentorshipStyle | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const visible = mentors.filter((m) => {
    const matchStyle = style === "all" || m.mentorshipStyle === style;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.currentRole.toLowerCase().includes(q) ||
      m.expertise.some((e) => e.toLowerCase().includes(q)) ||
      m.industries.some((i) => i.toLowerCase().includes(q));
    return matchStyle && matchQuery;
  });

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE) || 1;
  const paginated = visible.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mentors</h1>
          <p className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
            {mentors.length} mentors in pool
          </p>
        </div>
        <button
          onClick={() => toast.error("Operation restricted in Demo Mode.")}
          className="px-6 py-3 rounded-full text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + Add Mentor
        </button>
      </div>

      {/* Search + style filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, expertise, company…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1">
          {STYLE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setStyle(value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                style === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm font-semibold text-foreground">No mentors found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or style filter.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Mentor Name</th>
                  <th className="p-4">Role & Company</th>
                  <th className="p-4">Expertise</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((mentor) => {
                  return (
                    <tr key={mentor.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="p-4 text-sm text-foreground">
                        <div className="font-bold flex items-center gap-2">
                          {mentor.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-xs text-muted-foreground">
                          {mentor.currentRole} at {mentor.company}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.slice(0, 2).map((e) => (
                            <span key={e} className="text-[10px] bg-muted border border-border rounded px-2 py-0.5 text-muted-foreground whitespace-nowrap">
                              {e}
                            </span>
                          ))}
                          {mentor.expertise.length > 2 && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">+{mentor.expertise.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 opacity-70" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {mentor.availabilityHoursPerMonth}h / mo
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-1.5">
                          {mentor.hasFounderExperience && (
                            <span className="text-[10px] rounded px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">Founder</span>
                          )}
                          {mentor.hasInvestorExperience && (
                            <span className="text-[10px] rounded px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200">Investor</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.error("Operation restricted in Demo Mode."); }}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.success("Mentor removed locally."); setMentors(prev => prev.filter(m => m.id !== mentor.id)); }}
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
