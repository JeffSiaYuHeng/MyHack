import {
  seedCohorts,
  seedCompanies,
  seedMeetings,
  seedMentors,
  seedPrograms,
  seedRelationships,
} from "@/lib/verrier-seed";
import { ProductShell } from "@/components/features/product-shell";
import { CohortOverview } from "@/components/features/cohort-overview";

export default async function CohortOverviewPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;

  const cohort = seedCohorts.find((c) => c.id === cohortId) ?? null;
  const program = seedPrograms[0];

  if (!cohort) {
    return (
      <ProductShell
        activeNav="Programmes"
        programName={program.name}
        cohortName="—"
        cohortWeeks={0}
        cohortStatus="unknown"
      >
        <div className="px-4 md:px-12 py-6">
          <div className="border border-border rounded p-6">
            <p className="text-sm font-medium">Cohort not found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No cohort with id <code className="font-mono">{cohortId}</code>{" "}
              exists.
            </p>
          </div>
        </div>
      </ProductShell>
    );
  }

  const cohortRelationships = seedRelationships.filter(
    (r) => r.cohortId === cohort.id
  );
  const cohortCompanies = seedCompanies.filter((c) =>
    cohort.companyIds.includes(c.id)
  );
  const cohortMentors = seedMentors.filter((m) =>
    cohort.mentorIds.includes(m.id)
  );
  const cohortMeetings = seedMeetings.filter((m) =>
    cohortRelationships.some((r) => r.id === m.relationshipId)
  );

  return (
    <ProductShell
      activeNav="Programmes"
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <CohortOverview
        cohort={cohort}
        program={program}
        relationships={cohortRelationships}
        companies={cohortCompanies}
        mentors={cohortMentors}
        meetings={cohortMeetings}
      />
    </ProductShell>
  );
}
