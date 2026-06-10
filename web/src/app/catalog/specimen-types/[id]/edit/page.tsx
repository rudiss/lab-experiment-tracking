import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SpecimenTypeForm } from "../../SpecimenTypeForm";
import { updateSpecimenType } from "../../actions";

export default async function EditSpecimenTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.specimenType.findUnique({ where: { id: Number(id) } });
  if (!type) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${type.name}`} backHref="/catalog/specimen-types" />
      <SpecimenTypeForm action={updateSpecimenType.bind(null, type.id)} defaults={type} />
    </div>
  );
}
