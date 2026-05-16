import { ProductShell } from "@/components/features/product-shell";
import { ProgramSetupWizard } from "@/components/features/program-setup-wizard";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

export default function ProgramsNewPage() {
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
      activeNav="Programmes"
    >
      <ProgramSetupWizard />
    </ProductShell>
  );
}
