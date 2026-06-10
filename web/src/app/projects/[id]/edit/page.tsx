import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ProjectForm } from "../../ProjectForm";
import { updateProject } from "../../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!project) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${project.title}`} backHref={`/projects/${project.id}`} />
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        defaults={project}
        cancelHref={`/projects/${project.id}`}
      />
    </div>
  );
}
