import {
  seedCohorts,
  seedCompanies,
  seedMeetings,
  seedMentors,
  seedPrograms,
  seedRelationships,
} from "@/lib/verrier-seed";
import { ProductShell } from "@/components/features/product-shell";
import { RelationshipDetail } from "@/components/features/relationship-detail";

export default async function RelationshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  const relationship = seedRelationships.find((r) => r.id === id) ?? null;

  if (!relationship) {
    return (
      <ProductShell
        activeNav="Relationships"
        programName={program.name}
        cohortName={cohort.name}
        cohortWeeks={cohort.totalWeeks}
        cohortStatus={cohort.status}
      >
        <div className="px-4 md:px-12 py-6">
          <div className="border border-border rounded p-6">
            <p className="text-sm font-medium">Relationship not found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No relationship with id <code className="font-mono">{id}</code> exists in the current cohort.
            </p>
          </div>
        </div>
      </ProductShell>
    );
  }

  const company =
    seedCompanies.find((c) => c.id === relationship.companyId) ??
    seedCompanies[0];
  const mentor =
    seedMentors.find((m) => m.id === relationship.mentorId) ?? seedMentors[0];
  const meetings = seedMeetings.filter(
    (m) => m.relationshipId === relationship.id
  );

  return (
    <ProductShell
      activeNav="Relationships"
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <RelationshipDetail
        relationship={relationship}
        company={company}
        mentor={mentor}
        cohort={cohort}
        program={program}
        meetings={meetings}
      />
    </ProductShell>
  );
}
