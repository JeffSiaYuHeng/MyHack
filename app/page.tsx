import type { HealthBand } from "@/lib/verrier-analytics";
import {
  getAttentionFeed,
  getDashboardSummary,
  getHealthBandLabel,
  getRecentMeetings,
} from "@/lib/verrier-analytics";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

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
          : "text-[#1b1c1a]";

  return (
    <div>
      <p className={`text-xl font-semibold tabular-nums leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="text-xs text-[#43474c] mt-1">{label}</p>
    </div>
  );
}

export default function Home() {
  const summary = getDashboardSummary();
  const feed = getAttentionFeed();
  const meetings = getRecentMeetings(5);
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1b1c1a]">
      <header className="border-b border-[#c3c7cc] px-12 py-4 flex items-start justify-between">
        <div>
          <span className="text-base font-semibold tracking-tight">Verrier</span>
          <p className="text-xs text-[#43474c] mt-0.5">{program.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{cohort.name}</p>
          <p className="text-xs text-[#43474c] mt-0.5 capitalize">
            {cohort.totalWeeks}-week programme · {cohort.status}
          </p>
        </div>
      </header>

      <div className="border-b border-[#c3c7cc] px-12 py-4 grid grid-cols-4 sm:grid-cols-8 gap-6">
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

      <main className="px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1440px] mx-auto">
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold text-[#43474c] uppercase tracking-wider">
            Attention Feed
          </h2>
          {feed.map(({ relationship, company, mentor, band }) => (
            <div
              key={relationship.id}
              className="border border-[#c3c7cc] rounded-lg bg-white px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold">{company.name}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${bandBadgeClass(band)}`}
                >
                  {getHealthBandLabel(band)}
                </span>
              </div>
              <p className="text-xs text-[#43474c]">
                {mentor.name} &middot; Score {relationship.healthScore} &middot;{" "}
                {relationship.daysSinceLastMeeting}d since last meeting
              </p>
              {relationship.watchPoints.length > 0 && (
                <p className="text-xs text-[#73777c] italic">
                  {relationship.watchPoints[0]}
                </p>
              )}
              <p className="text-xs text-[#73777c]">{relationship.aiDiagnosis}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[#43474c] uppercase tracking-wider">
            Recent Meetings
          </h2>
          {meetings.map(({ meeting, company, mentor }) => (
            <div
              key={meeting.id}
              className="border border-[#c3c7cc] rounded-lg bg-white px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">{company.name}</span>
                <span
                  className={`inline-block h-2 w-2 rounded-full shrink-0 ${signalDotClass(meeting.signal)}`}
                  title={meeting.signal}
                />
              </div>
              <p className="text-xs text-[#43474c]">
                {mentor.name} &middot; {String(meeting.date).slice(0, 10)}
              </p>
              <p className="text-xs text-[#73777c] leading-relaxed line-clamp-2">
                {meeting.aiSummary}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
