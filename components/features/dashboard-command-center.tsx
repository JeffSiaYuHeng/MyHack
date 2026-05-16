import type { HealthBand } from "@/lib/verrier-analytics";
import {
  getAttentionFeed,
  getDashboardSummary,
  getHealthBandLabel,
  getRecentMeetings,
} from "@/lib/verrier-analytics";

function bandBadgeClass(band: HealthBand): string {
  if (band === "healthy") return "text-[#55624f] bg-[#d6e4cc]";
  if (band === "at-risk") return "text-amber-800 bg-amber-100";
  return "text-[#ba1a1a] bg-red-50";
}

function signalDotClass(signal: string): string {
  if (signal === "Positive") return "bg-[#55624f]";
  if (signal === "Friction detected") return "bg-[#ba1a1a]";
  return "bg-amber-500";
}

function MetricCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: HealthBand;
}) {
  const valueColor =
    accent === "healthy"
      ? "text-[#55624f]"
      : accent === "at-risk"
        ? "text-amber-600"
        : accent === "critical"
          ? "text-[#ba1a1a]"
          : "text-foreground";

  return (
    <div>
      <p className={`text-xl font-semibold tabular-nums leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function DashboardCommandCenter() {
  const summary = getDashboardSummary();
  const feed = getAttentionFeed();
  const meetings = getRecentMeetings(5);

  return (
    <>
      <div className="border-b border-border px-4 md:px-12 py-4 grid grid-cols-4 sm:grid-cols-8 gap-6">
        <MetricCell label="Programmes" value={summary.activeProgramCount} />
        <MetricCell label="Cohorts" value={summary.activeCohortCount} />
        <MetricCell label="Applications" value={summary.submittedApplicationCount} />
        <MetricCell label="Approved" value={summary.approvedApplicationCount} />
        <MetricCell label="Relationships" value={summary.activeRelationshipCount} />
        <MetricCell
          label="Healthy"
          value={summary.healthyRelationshipCount}
          accent="healthy"
        />
        <MetricCell
          label="At Risk"
          value={summary.atRiskRelationshipCount}
          accent="at-risk"
        />
        <MetricCell
          label="Critical"
          value={summary.criticalRelationshipCount}
          accent="critical"
        />
      </div>

      <main className="px-4 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Attention Feed
          </h2>
          {feed.map(({ relationship, company, mentor, band }) => (
            <div
              key={relationship.id}
              className="border border-border rounded-lg bg-card px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold">{company.name}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${bandBadgeClass(band)}`}
                >
                  {getHealthBandLabel(band)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {mentor.name} &middot; Score {relationship.healthScore} &middot;{" "}
                {relationship.daysSinceLastMeeting}d since last meeting
              </p>
              {relationship.watchPoints.length > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  {relationship.watchPoints[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{relationship.aiDiagnosis}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Meetings
          </h2>
          {meetings.map(({ meeting, company, mentor }) => (
            <div
              key={meeting.id}
              className="border border-border rounded-lg bg-card px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">{company.name}</span>
                <span
                  className={`inline-block h-2 w-2 rounded-full shrink-0 ${signalDotClass(meeting.signal)}`}
                  title={meeting.signal}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {mentor.name} &middot; {String(meeting.date).slice(0, 10)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {meeting.aiSummary}
              </p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
