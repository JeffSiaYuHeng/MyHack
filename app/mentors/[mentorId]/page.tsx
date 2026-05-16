import { notFound } from "next/navigation";
import { ProductShell } from "@/components/features/product-shell";
import { MentorDetail } from "@/components/features/mentor-detail";
import { seedCohorts, seedMentors } from "@/lib/verrier-seed";

interface Props {
  params: Promise<{ mentorId: string }>;
}

export default async function MentorDetailPage({ params }: Props) {
  const { mentorId } = await params;
  const mentor = seedMentors.find((m) => m.id === mentorId);
  if (!mentor) notFound();

  const cohort = seedCohorts[0];
  return (
    <ProductShell
      programName="Verrier"
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
    >
      <MentorDetail mentor={mentor} />
    </ProductShell>
  );
}
