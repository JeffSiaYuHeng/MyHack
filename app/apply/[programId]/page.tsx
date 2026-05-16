import { seedPrograms } from "@/lib/verrier-seed";
import { PublicApplicationForm } from "@/components/features/public-application-form";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const program = seedPrograms.find((p) => p.id === programId) ?? seedPrograms[0];

  return (
    <PublicApplicationForm
      programId={program.id}
      programName={program.name}
      programType={program.type}
      programDescription={program.description}
      targetStages={program.targetStages}
    />
  );
}
