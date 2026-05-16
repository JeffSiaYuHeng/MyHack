import { DashboardCommandCenter } from "@/components/features/dashboard-command-center";
import { ProductShell } from "@/components/features/product-shell";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

export default function Home() {
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <DashboardCommandCenter />
    </ProductShell>
  );
}
