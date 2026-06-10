import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { enumLabel, statusColor } from "@/lib/format";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { researchers: true, experiments: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Research initiatives that group related experiments."
        action={<LinkButton href="/projects/new">+ New project</LinkButton>}
      />
      <Card>
        {projects.length === 0 ? (
          <EmptyState>No projects yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Members</Th>
                <Th>Experiments</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 hover:underline">
                      {p.title}
                    </Link>
                  </Td>
                  <Td>
                    <Badge color={statusColor(p.status)}>{enumLabel(p.status)}</Badge>
                  </Td>
                  <Td>{p._count.researchers}</Td>
                  <Td>{p._count.experiments}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
