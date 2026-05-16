import type {
  Cohort,
  Company,
  Meeting,
  Mentor,
  Program,
  Relationship,
  TimestampLike,
} from "@/lib/types";
import {
  getHealthBand,
  getHealthBandLabel,
  getRelationshipUrgency,
  type RelationshipUrgencyLevel,
} from "@/lib/verrier-analytics";

const MILESTONE_LABELS = [
  "Discovery",
  "Alignment",
  "Execution",
  "Scaling",
  "Completion",
];

const HEALTH_COLORS: Record<"healthy" | "at-risk" | "critical", string> = {
  healthy: "var(--status-healthy)",
  "at-risk": "var(--status-risk)",
  critical: "var(--status-critical)",
};

function urgencyLevelColor(level: RelationshipUrgencyLevel): string {
  if (level === "critical") return "var(--status-critical)";
  if (level === "stale" || level === "watch") return "var(--status-risk)";
  if (level === "healthy") return "var(--status-healthy)";
  return "";
}

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
  meetings,
}: CohortOverviewProps) {
  const companyMap = new Map(companies.map((c) => [c.id, c]));

  const relWithMeta = relationships.map((r) => ({
    relationship: r,
    company: companyMap.get(r.companyId),
    urgency: getRelationshipUrgency(r, meetings),
    band: getHealthBand(r.healthScore),
  }));

  // Stats
  const totalRelationships = relationships.length;
  const activeCount = relationships.filter((r) => r.status === "active").length;
  const avgHealthScore =
    totalRelationships > 0
      ? Math.round(
          relationships.reduce((sum, r) => sum + r.healthScore, 0) /
            totalRelationships
        )
      : 0;
  const healthyCount = relWithMeta.filter((x) => x.band === "healthy").length;
  const atRiskCount = relWithMeta.filter((x) => x.band === "at-risk").length;
  const criticalCount = relWithMeta.filter((x) => x.band === "critical").length;
  const staleCount = relWithMeta.filter(
    (x) => x.urgency.level === "stale"
  ).length;
  const totalMeetings = meetings.length;

  // Heatmap sorted: urgency priority ASC → days since last DESC → health score ASC → company name ASC
  const heatmap = [...relWithMeta].sort((a, b) => {
    if (a.urgency.priority !== b.urgency.priority)
      return a.urgency.priority - b.urgency.priority;
    if (b.urgency.daysSinceLastMeeting !== a.urgency.daysSinceLastMeeting)
      return b.urgency.daysSinceLastMeeting - a.urgency.daysSinceLastMeeting;
    if (a.relationship.healthScore !== b.relationship.healthScore)
      return a.relationship.healthScore - b.relationship.healthScore;
    const nameA = a.company?.name ?? "";
    const nameB = b.company?.name ?? "";
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  // Milestone distribution: count relationships at or past each milestone
  const milestoneDistribution = [1, 2, 3, 4, 5].map((num) => ({
    num,
    completed: relationships.filter((r) =>
      r.milestonesCompleted.includes(num)
    ).length,
    current: relationships.filter(
      (r) =>
        r.currentMilestone === num && !r.milestonesCompleted.includes(num)
    ).length,
  }));

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
            <span className="font-medium text-foreground">
              {companies.length}
            </span>{" "}
            {companies.length === 1 ? "company" : "companies"}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{mentors.length}</span>{" "}
            {mentors.length === 1 ? "mentor" : "mentors"}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {totalRelationships}
            </span>{" "}
            {totalRelationships === 1 ? "relationship" : "relationships"}
          </div>
        </div>
      </div>

      {/* Health overview */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Health Overview
        </p>
        <div className="border border-border rounded px-4 py-4 space-y-3">
          {/* Summary stats */}
          <div className="flex flex-wrap gap-6 text-[10px]">
            <div>
              <span className="text-lg font-bold leading-none text-foreground">
                {totalRelationships}
              </span>
              <span className="ml-1 text-muted-foreground">total</span>
            </div>
            <div>
              <span className="text-lg font-bold leading-none text-foreground">
                {activeCount}
              </span>
              <span className="ml-1 text-muted-foreground">active</span>
            </div>
            <div>
              <span
                className="text-lg font-bold leading-none"
                style={{
                  color: HEALTH_COLORS[getHealthBand(avgHealthScore)],
                }}
              >
                {avgHealthScore}
              </span>
              <span className="ml-1 text-muted-foreground">avg health</span>
            </div>
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
            <div>
              <span
                className="text-lg font-bold leading-none"
                style={{ color: "var(--status-risk)" }}
              >
                {staleCount}
              </span>
              <span className="ml-1 text-muted-foreground">stale</span>
            </div>
            <div>
              <span className="text-lg font-bold leading-none text-foreground">
                {totalMeetings}
              </span>
              <span className="ml-1 text-muted-foreground">meetings</span>
            </div>
          </div>

          {/* Health heatmap */}
          {heatmap.length > 0 && (
            <div className="pt-1">
              <p className="text-[10px] text-muted-foreground mb-1.5">
                Relationship heatmap
              </p>
              <div className="space-y-1">
                {heatmap.map(({ relationship, company, urgency, band }) => (
                  <div
                    key={relationship.id}
                    className="flex items-center gap-2 text-[10px]"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: HEALTH_COLORS[band] }}
                    />
                    <span className="font-medium text-foreground truncate min-w-0 w-28 shrink-0">
                      {company?.name ?? relationship.companyId}
                    </span>
                    <span
                      className="font-semibold shrink-0 w-6 text-right"
                      style={{ color: HEALTH_COLORS[band] }}
                    >
                      {relationship.healthScore}
                    </span>
                    <span
                      className="shrink-0"
                      style={{ color: HEALTH_COLORS[band] }}
                    >
                      {getHealthBandLabel(band)}
                    </span>
                    {urgency.level !== "healthy" && (
                      <span
                        className="shrink-0"
                        style={{ color: urgencyLevelColor(urgency.level) }}
                      >
                        {urgency.label}
                      </span>
                    )}
                    <span className="text-muted-foreground shrink-0">
                      {urgency.daysSinceLastMeeting}d ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestone distribution */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Milestone Distribution
        </p>
        <div className="border border-border rounded px-4 py-4 space-y-2">
          {milestoneDistribution.map(({ num, completed, current }) => {
            const label = MILESTONE_LABELS[num - 1];
            const atOrPast = completed + current;
            const barWidth =
              totalRelationships > 0
                ? Math.round((atOrPast / totalRelationships) * 100)
                : 0;
            return (
              <div key={num} className="flex items-center gap-3 text-[10px]">
                <span className="text-muted-foreground w-4 shrink-0 text-right">
                  {num}
                </span>
                <span className="text-muted-foreground w-16 shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: "var(--status-healthy)",
                    }}
                  />
                </div>
                <span className="text-foreground font-medium shrink-0 w-4 text-right">
                  {atOrPast}
                </span>
                {completed > 0 && (
                  <span
                    className="shrink-0"
                    style={{ color: "var(--status-healthy)" }}
                  >
                    ({completed} done)
                  </span>
                )}
                {current > 0 && (
                  <span className="text-muted-foreground shrink-0">
                    ({current} active)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cohort report action */}
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
            AI-generated cohort narrative and programme health report — coming
            in Block D.
          </p>
        </div>
      </div>
    </div>
  );
}
