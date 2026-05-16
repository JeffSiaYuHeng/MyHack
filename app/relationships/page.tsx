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

  return (
    <ProductShell
      activeNav="Relationships"
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
