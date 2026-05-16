import { seedCohorts, seedPrograms } from "@/lib/verrier-seed";
import { ProductShell } from "@/components/features/product-shell";
import { ProgramDetail } from "@/components/features/program-detail";
import { notFound } from "next/navigation";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const program = seedPrograms.find((p) => p.id === programId);
  const cohort = seedCohorts[0];

  if (!program) notFound();

  return (
    <ProductShell
      programName={program.name}
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
    >
      <ProgramDetail program={program} />
    </ProductShell>
  );
}
