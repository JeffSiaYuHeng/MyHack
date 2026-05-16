import { ProductShell } from "@/components/features/product-shell";
import { MentorList } from "@/components/features/mentor-list";
import { seedCohorts, seedMentors } from "@/lib/verrier-seed";

export default function MentorsPage() {
  const cohort = seedCohorts[0];
  return (
    <ProductShell
      programName="Verrier"
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
    >
      <MentorList mentors={seedMentors} />
    </ProductShell>
  );
}
