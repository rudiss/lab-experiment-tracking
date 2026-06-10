import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  buttonClasses,
  Card,
  CardHeader,
  EmptyState,
  Field,
  LinkButton,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { enumLabel, formatDate, statusColor } from "@/lib/format";
import { addProjectMember, deleteProject, removeProjectMember, toggleProjectLead } from "../actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      researchers: { include: { researcher: { include: { role: true } } }, orderBy: { researcherId: "asc" } },
      experiments: { orderBy: { createdAt: "asc" }, include: { _count: { select: { measurements: true } } } },
    },
  });
  if (!project) notFound();

  const memberIds = new Set(project.researchers.map((m) => m.researcherId));
  const candidates = await prisma.researcher.findMany({
    where: { id: { notIn: [...memberIds] } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { role: true },
  });

  return (
    <div>
      <PageHeader
        title={project.title}
        backHref="/projects"
        description={<Badge color={statusColor(project.status)}>{enumLabel(project.status)}</Badge>}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/projects/${project.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <DeleteButton
              action={deleteProject.bind(null, project.id)}
              label="Delete"
              confirmMessage={`Delete project "${project.title}"? Its experiments and their measurements will also be deleted.`}
            />
          </div>
        }
      />

      {project.description && <p className="mb-6 max-w-2xl text-sm text-slate-600">{project.description}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader title={`Members (${project.researchers.length})`} />
          {project.researchers.length === 0 ? (
            <EmptyState>No members yet.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Researcher</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {project.researchers.map((m) => (
                  <tr key={m.researcherId}>
                    <Td className="font-medium text-slate-900">
                      {m.researcher.firstName} {m.researcher.lastName}
                      {m.isLead && (
                        <span className="ml-2">
                          <Badge color="amber">Lead</Badge>
                        </span>
                      )}
                    </Td>
                    <Td className="text-slate-500">{m.researcher.role.name}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={toggleProjectLead.bind(null, project.id, m.researcherId)}>
                          <button type="submit" className={buttonClasses("ghost", "text-xs px-2 py-1")}>
                            {m.isLead ? "Unset lead" : "Make lead"}
                          </button>
                        </form>
                        <DeleteButton
                          action={removeProjectMember.bind(null, project.id, m.researcherId)}
                          label="Remove"
                          variant="ghost"
                          confirmMessage={`Remove ${m.researcher.firstName} ${m.researcher.lastName} from this project?`}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {candidates.length > 0 && (
            <form action={addProjectMember.bind(null, project.id)} className="flex items-end gap-2 border-t border-slate-100 p-4">
              <div className="flex-1">
                <Field label="Add member" htmlFor="researcherId">
                  <Select id="researcherId" name="researcherId" defaultValue="" required>
                    <option value="" disabled>
                      Select a researcher…
                    </option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} — {c.role.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <label className="flex items-center gap-1.5 pb-2 text-sm text-slate-600">
                <input type="checkbox" name="isLead" /> Lead
              </label>
              <div className="pb-0.5">
                <SubmitButton variant="secondary">Add</SubmitButton>
              </div>
            </form>
          )}
        </Card>

        {/* Experiments */}
        <Card>
          <CardHeader
            title={`Experiments (${project.experiments.length})`}
            action={
              <Link href={`/experiments/new?projectId=${project.id}`} className="text-sm text-slate-500 hover:text-slate-900">
                + New
              </Link>
            }
          />
          {project.experiments.length === 0 ? (
            <EmptyState>No experiments yet.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Status</Th>
                  <Th>Started</Th>
                  <Th>Measurements</Th>
                </tr>
              </thead>
              <tbody>
                {project.experiments.map((e) => (
                  <tr key={e.id}>
                    <Td>
                      <Link href={`/experiments/${e.id}`} className="font-medium text-slate-900 hover:underline">
                        {e.title}
                      </Link>
                    </Td>
                    <Td>
                      <Badge color={statusColor(e.status)}>{enumLabel(e.status)}</Badge>
                    </Td>
                    <Td>{formatDate(e.startDate)}</Td>
                    <Td>{e._count.measurements}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
