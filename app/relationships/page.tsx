import {
  seedCohorts,
  seedCompanies,
  seedMentors,
  seedPrograms,
  seedRelationships,
} from "@/lib/verrier-seed";
import { ProductShell } from "@/components/features/product-shell";
import { RelationshipList } from "@/components/features/relationship-list";

export default function RelationshipsPage() {
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  if (!program || !cohort) {
    return (
      <ProductShell
        programName="Verrier Demo"
        cohortName="Seed data unavailable"
        cohortWeeks={0}
        cohortStatus="setup"
      >
        <div className="p-8 text-center border border-dashed border-border rounded-lg m-4">
          <p className="text-sm text-muted-foreground">
            Seeded relationship data is missing.
          </p>
        </div>
      </ProductShell>
    );
  }

  if (
    seedRelationships.length === 0 ||
    seedCompanies.length === 0 ||
    seedMentors.length === 0
  ) {
    return (
      <ProductShell
        programName={program.name}
        cohortName={cohort.name}
        cohortWeeks={cohort.totalWeeks}
        cohortStatus={cohort.status}
      >
        <div className="p-8 text-center border border-dashed border-border rounded-lg m-4">
          <p className="text-sm text-muted-foreground">
            No active relationships found for this cohort.
          </p>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <RelationshipList
        relationships={seedRelationships}
        companies={seedCompanies}
        mentors={seedMentors}
      />
    </ProductShell>
  );
}
