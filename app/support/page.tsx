import { ProductShell } from "@/components/features/product-shell";
import { SupportCenter } from "@/components/features/support-center";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

export default function SupportPage() {
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];
  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <SupportCenter />
    </ProductShell>
  );
}
