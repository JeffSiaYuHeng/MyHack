import { ProductShell } from "@/components/features/product-shell";
import { StartupList } from "@/components/features/startup-list";
import { seedCohorts, seedCompanies } from "@/lib/verrier-seed";

export default function StartupsPage() {
  const cohort = seedCohorts[0];
  return (
    <ProductShell
      programName="Verrier"
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
    >
      <StartupList companies={seedCompanies} />
    </ProductShell>
  );
}
