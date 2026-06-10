import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ResearcherForm } from "../../ResearcherForm";
import { updateResearcher } from "../../actions";

export default async function EditResearcherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [researcher, roles] = await Promise.all([
    prisma.researcher.findUnique({ where: { id: Number(id) } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!researcher) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${researcher.firstName} ${researcher.lastName}`} backHref="/researchers" />
      <ResearcherForm action={updateResearcher.bind(null, researcher.id)} roles={roles} defaults={researcher} />
    </div>
  );
}
