"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Program } from "@/lib/types";
import { seedApplications } from "@/lib/verrier-seed";
import { Skeleton } from "@/components/ui/skeleton";

function ProgramSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 pl-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function statusStyle(status: Program["status"]): { color: string; bg: string } {
  switch (status) {
    case "active":
      return { color: "var(--status-healthy)", bg: "var(--status-healthy-bg)" };
    case "open":
    case "reviewing":
    case "matching":
      return { color: "var(--status-risk)", bg: "var(--status-risk-bg)" };
    case "completed":
      return { color: "var(--muted-foreground)", bg: "var(--muted)" };
    default: // draft
      return { color: "var(--status-ai)", bg: "var(--muted)" };
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

  return (
    <div className="px-4 md:px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>Programmes</h1>
          <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">
            {programs.length} programme{programs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/programs/new"
          className="shrink-0 px-4 py-1.5 text-xs font-bold rounded-full transition-opacity hover:opacity-90"
          style={{ background: "#f36458", color: "#ffffff" }}
        >
          + New Programme
        </Link>
      </div>

      {/* Empty state */}
      {programs.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No programmes yet.</p>
          <Link
            href="/programs/new"
            className="inline-block mt-3 text-xs font-medium text-foreground underline underline-offset-2"
          >
            Create your first programme →
          </Link>
        </div>
      )}

      {/* Programme cards */}
      {!mounted ? (
        <ProgramSkeleton />
      ) : programs.length > 0 && (
        <div className="space-y-3">
          {programs.map((program) => {
            const { color, bg } = statusStyle(program.status);
            const appCount = appCountMap.get(program.id) ?? 0;
            const approvedCount = seedApplications.filter(
              (a) => a.programId === program.id && a.status === "approved"
            ).length;

            return (
              <div
                key={program.id}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Left accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: color }}
                />

                <div className="pl-5 pr-4 py-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: name + meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[15px] font-semibold text-foreground truncate">
                          {program.name}
                        </h2>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                          style={{ color, background: bg }}
                        >
                          {program.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize border border-border rounded-full px-2 py-0.5">
                          {program.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {program.description || "No description."}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/programs/${program.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/programs/${program.id}/applicants`}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                      >
                        Applicants
                      </Link>
                      <button
                        onClick={() => setDeleteId(program.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-6 mt-3 text-[10px] text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">{appCount}</span> applications
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{approvedCount}</span> approved
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{program.mentorIds.length}</span> mentors
                    </div>
                    <div>
                      Opens{" "}
                      <span className="font-medium text-foreground">
                        {formatDate(program.applicationOpenAt)}
                      </span>
                    </div>
                    <div>
                      Closes{" "}
                      <span className="font-medium text-foreground">
                        {formatDate(program.applicationCloseAt)}
                      </span>
                    </div>
                    <div>
                      Targets:{" "}
                      <span className="font-medium text-foreground">
                        {program.targetStages.join(", ") || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                className="px-4 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="px-4 py-1.5 text-xs font-semibold rounded"
                style={{
                  color: "#fff",
                  background: "var(--status-critical)",
                }}
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
