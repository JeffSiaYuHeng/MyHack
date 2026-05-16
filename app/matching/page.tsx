import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";
import {
  getApprovedStartupQueue,
  getMentorPool,
} from "@/lib/verrier-analytics";
import { ProductShell } from "@/components/features/product-shell";
import { MatchingWorkbench } from "@/components/features/matching-workbench";

export default function MatchingPage() {
  const program = seedPrograms[0];
  const cohort = seedCohorts[0];

  if (!program || !cohort) {
    return (
      <ProductShell
        programName="Verrier Demo"
        cohortName="Seed data unavailable"
        cohortWeeks={0}
        cohortStatus="setup"
        activeNav="Matching"
      >
        <div className="p-8 text-center border border-dashed border-border rounded-lg m-4">
          <p className="text-sm text-muted-foreground">
            Seeded matching data is missing.
          </p>
        </div>
      </ProductShell>
    );
  }

  const initialQueue = getApprovedStartupQueue(program.id, cohort.id);
  const initialMentorPool = getMentorPool(program.id, cohort.id);

  if (initialQueue.length === 0 || initialMentorPool.length === 0) {
    return (
      <ProductShell
        programName={program.name}
        cohortName={cohort.name}
        cohortWeeks={cohort.totalWeeks}
        cohortStatus={cohort.status}
        activeNav="Matching"
      >
        <div className="p-8 text-center border border-dashed border-border rounded-lg m-4">
          <p className="text-sm text-muted-foreground">
            {initialQueue.length === 0
              ? "No approved unmatched startups available for matching."
              : "No mentors available in the pool for matching."}
          </p>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell
      activeNav="Matching"
      programName={program.name}
      cohortName={cohort.name}
      cohortWeeks={cohort.totalWeeks}
      cohortStatus={cohort.status}
    >
      <MatchingWorkbench
        initialQueue={initialQueue}
        initialMentorPool={initialMentorPool}
        programId={program.id}
        cohortId={cohort.id}
      />
    </ProductShell>
  );
}
