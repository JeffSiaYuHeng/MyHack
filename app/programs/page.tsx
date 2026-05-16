import { ProductShell } from "@/components/features/product-shell";
import { ProgramList } from "@/components/features/program-list";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

export default function ProgramsPage() {
  const cohort = seedCohorts[0];

  return (
    <ProductShell
      programName="Verrier"
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
      activeNav="Programmes"
    >
      <ProgramList programs={seedPrograms} />
    </ProductShell>
  );
}
