import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ExperimentForm } from "../ExperimentForm";
import { createExperiment } from "../actions";

export default async function NewExperimentPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const [projects, experiments] = await Promise.all([
    prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.experiment.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, projectId: true } }),
  ]);

  return (
    <div>
      <PageHeader title="New experiment" backHref="/experiments" />
      <ExperimentForm
        action={createExperiment}
        projects={projects}
        experiments={experiments}
        defaultProjectId={projectId ? Number(projectId) : undefined}
        cancelHref="/experiments"
      />
    </div>
  );
}
