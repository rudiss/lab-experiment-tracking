import { PageHeader } from "@/components/ui";
import { MeasurementTypeForm } from "../MeasurementTypeForm";
import { createMeasurementType } from "../actions";

export default function NewMeasurementTypePage() {
  return (
    <div>
      <PageHeader title="New measurement type" backHref="/catalog/measurement-types" />
      <MeasurementTypeForm action={createMeasurementType} />
    </div>
  );
}
