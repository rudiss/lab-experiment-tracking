import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ResearcherForm } from "../ResearcherForm";
import { createResearcher } from "../actions";

export default async function NewResearcherPage() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <PageHeader title="New researcher" backHref="/researchers" />
      <ResearcherForm action={createResearcher} roles={roles} />
    </div>
  );
}
