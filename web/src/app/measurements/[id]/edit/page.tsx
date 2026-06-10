import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { toDateTimeInput } from "@/lib/form";
import { MeasurementForm } from "../../MeasurementForm";
import { updateMeasurement } from "../../actions";
import { getMeasurementFormData } from "../../data";

export default async function EditMeasurementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const measurement = await prisma.measurement.findUnique({ where: { id: Number(id) } });
  if (!measurement) notFound();

  const { experiments, types } = await getMeasurementFormData();

  return (
    <div>
      <PageHeader title="Edit measurement" backHref={`/experiments/${measurement.experimentId}`} />
      <MeasurementForm
        action={updateMeasurement.bind(null, measurement.id)}
        experiments={experiments}
        types={types}
        measuredAtDefault={toDateTimeInput(measurement.measuredAt)}
        defaults={{
          experimentId: measurement.experimentId,
          sampleId: measurement.sampleId,
          measurementTypeId: measurement.measurementTypeId,
          numericValue: measurement.numericValue == null ? null : String(measurement.numericValue),
          unit: measurement.unit,
          categoricalValue: measurement.categoricalValue,
          textValue: measurement.textValue,
          notes: measurement.notes,
        }}
        cancelHref={`/experiments/${measurement.experimentId}`}
      />
    </div>
  );
}
