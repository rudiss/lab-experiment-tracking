import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Table, Td, Th } from "@/components/ui";
import { enumLabel, formatDate, statusColor, valueKindColor } from "@/lib/format";

const stats: { href: string; label: string; key: string }[] = [
  { href: "/projects", label: "Projects", key: "projects" },
  { href: "/experiments", label: "Experiments", key: "experiments" },
  { href: "/measurements", label: "Measurements", key: "measurements" },
  { href: "/samples", label: "Samples", key: "samples" },
  { href: "/researchers", label: "Researchers", key: "researchers" },
];

export default async function DashboardPage() {
  const [
    projects,
    experiments,
    measurements,
    samples,
    researchers,
    projectsByStatus,
    measurementsByType,
    recentExperiments,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.experiment.count(),
    prisma.measurement.count(),
    prisma.sample.count(),
    prisma.researcher.count(),
    prisma.project.groupBy({ by: ["status"], _count: true }),
    prisma.measurementType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, valueKind: true, _count: { select: { measurements: true } } },
    }),
    prisma.experiment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { project: { select: { title: true } } },
    }),
  ]);

  const counts: Record<string, number> = { projects, experiments, measurements, samples, researchers };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of the lab's projects, experiments, and data."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.key} href={s.href}>
            <Card className="px-4 py-3 transition-colors hover:border-slate-300">
              <div className="text-2xl font-semibold text-slate-900">{counts[s.key]}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Projects by status" />
          {projectsByStatus.length === 0 ? (
            <EmptyState>No projects yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-50">
              {projectsByStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <Badge color={statusColor(row.status)}>{enumLabel(row.status)}</Badge>
                  <span className="font-medium text-slate-700">{row._count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Measurements by type" />
          {measurementsByType.length === 0 ? (
            <EmptyState>No measurement types defined.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-50">
              {measurementsByType.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    {t.name}
                    <Badge color={valueKindColor(t.valueKind)}>{enumLabel(t.valueKind)}</Badge>
                  </span>
                  <span className="font-medium text-slate-700">{t._count.measurements}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent experiments" />
        {recentExperiments.length === 0 ? (
          <EmptyState>No experiments yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Started</Th>
              </tr>
            </thead>
            <tbody>
              {recentExperiments.map((e) => (
                <tr key={e.id}>
                  <Td>
                    <Link href={`/experiments/${e.id}`} className="font-medium text-slate-900 hover:underline">
                      {e.title}
                    </Link>
                  </Td>
                  <Td>{e.project.title}</Td>
                  <Td>
                    <Badge color={statusColor(e.status)}>{enumLabel(e.status)}</Badge>
                  </Td>
                  <Td>{formatDate(e.startDate)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
