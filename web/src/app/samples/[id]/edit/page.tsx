import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SampleForm } from "../../SampleForm";
import { updateSample } from "../../actions";

export default async function EditSamplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sample, specimenTypes] = await Promise.all([
    prisma.sample.findUnique({ where: { id: Number(id) } }),
    prisma.specimenType.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!sample) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${sample.sampleCode}`} backHref={`/samples/${sample.id}`} />
      <SampleForm
        action={updateSample.bind(null, sample.id)}
        specimenTypes={specimenTypes}
        defaults={sample}
        cancelHref={`/samples/${sample.id}`}
      />
    </div>
  );
}
