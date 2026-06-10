import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SampleForm } from "../SampleForm";
import { createSample } from "../actions";

export default async function NewSamplePage() {
  const specimenTypes = await prisma.specimenType.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <PageHeader title="New sample" backHref="/samples" />
      <SampleForm action={createSample} specimenTypes={specimenTypes} cancelHref="/samples" />
    </div>
  );
}
