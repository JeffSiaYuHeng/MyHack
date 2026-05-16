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

  const initialQueue = getApprovedStartupQueue(program.id, cohort.id);
  const initialMentorPool = getMentorPool(program.id, cohort.id);

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
