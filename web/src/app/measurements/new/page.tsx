import { PageHeader } from "@/components/ui";
import { toDateTimeInput } from "@/lib/form";
import { MeasurementForm } from "../MeasurementForm";
import { createMeasurement } from "../actions";
import { getMeasurementFormData } from "../data";

export default async function NewMeasurementPage({
  searchParams,
}: {
  searchParams: Promise<{ experimentId?: string }>;
}) {
  const { experimentId } = await searchParams;
  const { experiments, types } = await getMeasurementFormData();

  return (
    <div>
      <PageHeader title="New measurement" backHref="/measurements" />
      <MeasurementForm
        action={createMeasurement}
        experiments={experiments}
        types={types}
        measuredAtDefault={toDateTimeInput(new Date())}
        defaultExperimentId={experimentId ? Number(experimentId) : undefined}
        cancelHref={experimentId ? `/experiments/${experimentId}` : "/measurements"}
      />
    </div>
  );
}
