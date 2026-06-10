import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { enumLabel, formatDate, statusColor } from "@/lib/format";

export default async function ExperimentsPage() {
  const experiments = await prisma.experiment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, title: true } },
      parent: { select: { id: true, title: true } },
      _count: { select: { samples: true, measurements: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Experiments"
        description="Individual scientific tests. Each belongs to a project and can follow up on an earlier experiment."
        action={<LinkButton href="/experiments/new">+ New experiment</LinkButton>}
      />
      <Card>
        {experiments.length === 0 ? (
          <EmptyState>No experiments yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Follow-up of</Th>
                <Th>Samples</Th>
                <Th>Measurements</Th>
                <Th>Started</Th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((e) => (
                <tr key={e.id}>
                  <Td>
                    <Link href={`/experiments/${e.id}`} className="font-medium text-slate-900 hover:underline">
                      {e.title}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/projects/${e.project.id}`} className="text-slate-500 hover:underline">
                      {e.project.title}
                    </Link>
                  </Td>
                  <Td>
                    <Badge color={statusColor(e.status)}>{enumLabel(e.status)}</Badge>
                  </Td>
                  <Td className="text-slate-500">
                    {e.parent ? (
                      <Link href={`/experiments/${e.parent.id}`} className="hover:underline">
                        {e.parent.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>{e._count.samples}</Td>
                  <Td>{e._count.measurements}</Td>
                  <Td className="text-slate-500">{formatDate(e.startDate)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
