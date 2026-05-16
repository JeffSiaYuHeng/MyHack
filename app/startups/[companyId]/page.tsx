import { notFound } from "next/navigation";
import { ProductShell } from "@/components/features/product-shell";
import { StartupDetail } from "@/components/features/startup-detail";
import { seedCohorts, seedCompanies } from "@/lib/verrier-seed";

interface Props {
  params: Promise<{ companyId: string }>;
}

export default async function StartupDetailPage({ params }: Props) {
  const { companyId } = await params;
  const company = seedCompanies.find((c) => c.id === companyId);
  if (!company) notFound();

  const cohort = seedCohorts[0];
  return (
    <ProductShell
      programName="Verrier"
      cohortName={cohort?.name ?? ""}
      cohortWeeks={cohort?.totalWeeks ?? 0}
      cohortStatus={cohort?.status ?? ""}
    >
      <StartupDetail company={company} />
    </ProductShell>
  );
}
