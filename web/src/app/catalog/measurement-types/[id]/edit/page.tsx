import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { MeasurementTypeForm } from "../../MeasurementTypeForm";
import { updateMeasurementType } from "../../actions";

export default async function EditMeasurementTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.measurementType.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { measurements: true } } },
  });
  if (!type) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${type.name}`} backHref="/catalog/measurement-types" />
      <MeasurementTypeForm
        action={updateMeasurementType.bind(null, type.id)}
        defaults={type}
        lockValueKind={type._count.measurements > 0}
      />
    </div>
  );
}
