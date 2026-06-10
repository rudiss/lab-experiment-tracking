import { PageHeader } from "@/components/ui";
import { ProjectForm } from "../ProjectForm";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader title="New project" backHref="/projects" description="You can add members after creating it." />
      <ProjectForm action={createProject} cancelHref="/projects" />
    </div>
  );
}
