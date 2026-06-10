import { PageHeader } from "@/components/ui";
import { SpecimenTypeForm } from "../SpecimenTypeForm";
import { createSpecimenType } from "../actions";

export default function NewSpecimenTypePage() {
  return (
    <div>
      <PageHeader title="New specimen type" backHref="/catalog/specimen-types" />
      <SpecimenTypeForm action={createSpecimenType} />
    </div>
  );
}
