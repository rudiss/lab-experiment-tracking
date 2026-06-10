import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ExperimentForm } from "../../ExperimentForm";
import { updateExperiment } from "../../actions";

export default async function EditExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experimentId = Number(id);
  const [experiment, projects, experiments] = await Promise.all([
    prisma.experiment.findUnique({ where: { id: experimentId } }),
    prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.experiment.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, projectId: true } }),
  ]);
  if (!experiment) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${experiment.title}`} backHref={`/experiments/${experiment.id}`} />
      <ExperimentForm
        action={updateExperiment.bind(null, experiment.id)}
        projects={projects}
        experiments={experiments}
        defaults={experiment}
        currentId={experiment.id}
        cancelHref={`/experiments/${experiment.id}`}
      />
    </div>
  );
}
