"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Program } from "@/lib/types";
import { seedApplications, seedCohorts } from "@/lib/verrier-seed";
import { Skeleton } from "@/components/ui/skeleton";

function ProgramSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-border rounded-lg overflow-hidden flex shadow-sm">
          <div className="w-1.5 shrink-0 bg-muted" />
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-22 rounded-full" />
                </div>
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-9 w-16 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-16 rounded-lg" />
              </div>
            </div>
            <div className="border-t border-border pt-5 grid grid-cols-5 gap-6">
              {[0, 1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-8 w-full" />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function statusAccentColor(status: Program["status"]): string {
  switch (status) {
    case "active": return "#22c55e";
    case "open": case "reviewing": case "matching": return "#f59e0b";
    case "completed": return "#94a3b8";
    default: return "#a78bfa";
  }
}

function statusBadge(status: Program["status"]): { color: string; bg: string } {
  switch (status) {
    case "active": return { color: "#166534", bg: "#dcfce7" };
    case "open": case "reviewing": case "matching": return { color: "#92400e", bg: "#fef3c7" };
    case "completed": return { color: "#475569", bg: "#f1f5f9" };
    default: return { color: "var(--status-ai)", bg: "rgba(124,58,237,0.08)" };
  }
}

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  return String(ts).slice(0, 10);
}

interface ProgramListProps {
  programs: Program[];
}

export function ProgramList({ programs: initialPrograms }: ProgramListProps) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<Program["type"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const types = ["all", "accelerator", "incubator", "grant", "corporate-innovation", "university", "challenge"] as const;

  const filteredPrograms = programs.filter(p => {
    const matchType = filterType === "all" || p.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
    return matchType && matchQuery;
  });

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE) || 1;
  const paginatedPrograms = filteredPrograms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  function confirmDelete(id: string) {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    toast.success("Programme deleted locally.");
  }

  const appCountMap = new Map<string, number>();
  for (const app of seedApplications) {
    appCountMap.set(app.programId, (appCountMap.get(app.programId) ?? 0) + 1);
  }

  // Build a map from programId → cohortId using organizerName matching
  const cohortMap = new Map<string, string>();
  const programCohortPairs: Array<{ programId: string; cohortId: string }> = [
    { programId: "program-cradle-accelerator-2026",  cohortId: "cohort-cradle-q2-2026" },
    { programId: "program-mdec-digital-grant-2026",  cohortId: "cohort-mdec-digital-q3-2026" },
    { programId: "program-sunway-yseali-incubator-2026", cohortId: "cohort-sunway-yseali-q2-2026" },
    { programId: "program-cimb-fintech-challenge-2025", cohortId: "cohort-cimb-fintech-2025" },
  ];
  for (const { programId, cohortId } of programCohortPairs) {
    if (seedCohorts.find((c) => c.id === cohortId)) cohortMap.set(programId, cohortId);
  }

  return (
    <div className="px-8 py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Programmes</h1>
          <p className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">
            {programs.length} programme{programs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/programs/new"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ background: "var(--primary)", color: "#ffffff" }}
        >
          + New Programme
        </Link>
      </div>

      {/* Search and Filter Chips */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search programmes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors border ${
                filterType === t 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {programs.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center opacity-70">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-base font-semibold text-foreground">Launch new initiatives</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            Create and manage multiple cohorts, tracks, and selection processes from a single dashboard.
          </p>
          <Link
            href="/programs/new"
            className="inline-block mt-4 text-sm font-medium text-foreground underline underline-offset-2"
          >
            Create your first programme →
          </Link>
        </div>
      )}

      {/* Programme cards */}
      {!mounted ? (
        <ProgramSkeleton />
      ) : filteredPrograms.length > 0 ? (
        <div className="space-y-5">
          {paginatedPrograms.map((program) => {
            const accent = statusAccentColor(program.status);
            const badge = statusBadge(program.status);
            const appCount = appCountMap.get(program.id) ?? 0;
            const approvedCount = seedApplications.filter(
              (a) => a.programId === program.id && a.status === "approved"
            ).length;

            return (
              <article
                key={program.id}
                className="bg-card border border-border rounded-lg overflow-hidden flex flex-col md:flex-row shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                {/* Left accent bar */}
                <div className="w-full h-1.5 md:h-auto md:w-1.5 shrink-0" style={{ background: accent }} />

                <div className="flex-1 p-6">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      <h2 className="text-[15px] font-semibold text-foreground">{program.name}</h2>
                      <div className="flex gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-medium capitalize"
                          style={{ color: badge.color, background: badge.bg }}
                        >
                          {program.status}
                        </span>
                        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[11px] font-medium capitalize border border-border">
                          {program.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cohortMap.has(program.id) && (
                        <Link
                          href={`/program/${cohortMap.get(program.id)}`}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ background: "var(--status-ai)" }}
                        >
                          ✦ View Cohort
                        </Link>
                      )}
                      <Link
                        href={`/programs/${program.id}`}
                        className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/programs/${program.id}/applicants`}
                        className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Applicants
                      </Link>
                      <button
                        onClick={() => setDeleteId(program.id)}
                        className="px-4 py-2 rounded-lg border text-sm transition-colors"
                        style={{ borderColor: "rgba(220,38,38,0.25)", color: "var(--status-critical)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground max-w-3xl mb-6 line-clamp-1">
                    {program.description || "No description."}
                  </p>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-5 border-t border-border">
                    <div>
                      <p className="text-base font-semibold text-foreground leading-none">
                        {appCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">applications</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground leading-none">
                        {approvedCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">approved</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground leading-none">
                        {program.mentorIds.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">mentors</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                        Timeline
                      </p>
                      <div className="text-xs space-y-0.5">
                        <p>
                          <span className="text-foreground font-medium">Opens:</span>{" "}
                          {formatDate(program.applicationOpenAt)}
                        </p>
                        <p>
                          <span className="text-foreground font-medium">Closes:</span>{" "}
                          {formatDate(program.applicationCloseAt)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                        Targets
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {program.targetStages.length > 0 ? (
                          program.targetStages.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ background: "rgba(243,100,88,0.08)", color: "var(--primary)" }}
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground text-center">
          No programmes found.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && filteredPrograms.length > 0 && (
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <p className="text-sm font-semibold text-foreground">Delete programme?</p>
            <p className="text-xs text-muted-foreground">
              This will remove the programme from the list. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="px-4 py-2 text-xs font-semibold rounded-lg"
                style={{ color: "#fff", background: "var(--status-critical)" }}
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
