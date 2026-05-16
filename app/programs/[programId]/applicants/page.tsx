import { seedPrograms, seedCohorts } from "@/lib/verrier-seed";
import { ProductShell } from "@/components/features/product-shell";
import { ApplicantReviewPool } from "@/components/features/applicant-review-pool";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const program =
    seedPrograms.find((p) => p.id === programId) ?? seedPrograms[0];
  const cohort = seedCohorts[0];

  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
      activeNav="Programmes"
    >
      <ApplicantReviewPool />
    </ProductShell>
  );
}
