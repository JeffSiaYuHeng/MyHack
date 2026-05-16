import type {
  Cohort,
  Company,
  Meeting,
  Mentor,
  Program,
  Relationship,
  TimestampLike,
} from "@/lib/types";
import { getHealthBand, getHealthBandLabel } from "@/lib/verrier-analytics";

function formatDate(ts: TimestampLike): string {
  if (typeof ts === "string") return ts.slice(0, 10);
  if (ts instanceof Date) return ts.toISOString().slice(0, 10);
  if (typeof ts === "number") return new Date(ts).toISOString().slice(0, 10);
  if (typeof ts === "object" && "seconds" in ts)
    return new Date((ts as { seconds: number }).seconds * 1000)
      .toISOString()
      .slice(0, 10);
  return String(ts);
}

interface CohortOverviewProps {
  cohort: Cohort;
  program: Program;
  relationships: Relationship[];
  companies: Company[];
  mentors: Mentor[];
  meetings: Meeting[];
}

export function CohortOverview({
  cohort,
  relationships,
  companies,
  mentors,
}: CohortOverviewProps) {
  const healthyCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "healthy"
  ).length;
  const atRiskCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "at-risk"
  ).length;
  const criticalCount = relationships.filter(
    (r) => getHealthBand(r.healthScore) === "critical"
  ).length;

  return (
    <div className="px-4 md:px-12 py-6 space-y-6">
      {/* Cohort header */}
      <div className="border border-border rounded px-4 py-4 space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-base font-semibold">{cohort.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground capitalize">
                {cohort.status}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cohort.totalWeeks}-week programme
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Duration</p>
            <p className="text-xs font-medium">
              {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="flex flex-wrap gap-4 pt-1 text-[10px]">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{companies.length}</span>{" "}
            {companies.length === 1 ? "company" : "companies"}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{mentors.length}</span>{" "}
            {mentors.length === 1 ? "mentor" : "mentors"}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {relationships.length}
            </span>{" "}
            {relationships.length === 1 ? "relationship" : "relationships"}
          </div>
        </div>
      </div>

      {/* Health overview shell */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Health Overview
        </p>
        <div className="border border-border rounded px-4 py-4">
          <div className="flex flex-wrap gap-6 text-[10px]">
            <div>
              <span
                className="text-lg font-bold leading-none"
                style={{ color: "var(--status-healthy)" }}
              >
                {healthyCount}
              </span>
              <span className="ml-1 text-muted-foreground">
                {getHealthBandLabel("healthy")}
              </span>
            </div>
            <div>
              <span
                className="text-lg font-bold leading-none"
                style={{ color: "var(--status-risk)" }}
              >
                {atRiskCount}
              </span>
              <span className="ml-1 text-muted-foreground">
                {getHealthBandLabel("at-risk")}
              </span>
            </div>
            <div>
              <span
                className="text-lg font-bold leading-none"
                style={{ color: "var(--status-critical)" }}
              >
                {criticalCount}
              </span>
              <span className="ml-1 text-muted-foreground">
                {getHealthBandLabel("critical")}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Full health heatmap and trend analysis — coming in Block D.
          </p>
        </div>
      </div>

      {/* Milestone distribution shell */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Milestone Distribution
        </p>
        <div className="border border-border rounded px-4 py-4">
          <p className="text-[10px] text-muted-foreground">
            Milestone distribution across all relationships — coming in Block D.
          </p>
        </div>
      </div>

      {/* Report narrative shell */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Cohort Report
          </p>
          <button
            disabled
            className="px-2.5 py-1 text-[10px] font-medium rounded border border-border text-muted-foreground cursor-not-allowed"
          >
            Generate Narrative — coming in Block D
          </button>
        </div>
        <div className="border border-border rounded px-4 py-4">
          <p className="text-[10px] text-muted-foreground">
            AI-generated cohort narrative and programme health report — coming in Block D.
          </p>
        </div>
      </div>
    </div>
  );
}
