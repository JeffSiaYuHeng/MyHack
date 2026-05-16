import { DashboardCommandCenter } from "@/components/features/dashboard-command-center";
import { ProductShell } from "@/components/features/product-shell";
import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";

export default function DashboardPage() {
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
            Seeded dashboard data is missing. Please ensure runtime data is correctly loaded.
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
      <DashboardCommandCenter />
    </ProductShell>
  );
}
