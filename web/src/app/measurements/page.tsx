import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  buttonClasses,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { enumLabel, formatDateTime, measurementValue, valueKindColor } from "@/lib/format";
import { deleteMeasurement } from "./actions";

export default async function MeasurementsPage({
  searchParams,
}: {
  searchParams: Promise<{ experimentId?: string; typeId?: string }>;
}) {
  const { experimentId, typeId } = await searchParams;
  const where = {
    ...(experimentId ? { experimentId: Number(experimentId) } : {}),
    ...(typeId ? { measurementTypeId: Number(typeId) } : {}),
  };

  const [measurements, experiments, types] = await Promise.all([
    prisma.measurement.findMany({
      where,
      orderBy: { measuredAt: "desc" },
      include: {
        measurementType: true,
        experiment: { select: { id: true, title: true } },
        sample: { select: { id: true, sampleCode: true } },
      },
    }),
    prisma.experiment.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.measurementType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Measurements"
        description="Data points produced by experiments — numeric, categorical, or free text."
        action={<LinkButton href="/measurements/new">+ New measurement</LinkButton>}
      />

      <Card className="mb-4 p-3">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <label className="mb-1 block text-xs font-medium text-slate-500">Experiment</label>
            <Select name="experimentId" defaultValue={experimentId ?? ""}>
              <option value="">All experiments</option>
              {experiments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
            <Select name="typeId" defaultValue={typeId ?? ""}>
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <button type="submit" className={buttonClasses("secondary")}>
            Apply
          </button>
          {(experimentId || typeId) && (
            <Link href="/measurements" className="px-2 py-1.5 text-sm text-slate-500 hover:text-slate-800">
              Clear
            </Link>
          )}
        </form>
      </Card>

      <Card>
        {measurements.length === 0 ? (
          <EmptyState>No measurements match.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Type</Th>
                <Th>Value</Th>
                <Th>Experiment</Th>
                <Th>Sample</Th>
                <Th>Measured</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr key={m.id}>
                  <Td>
                    {m.measurementType.name}{" "}
                    <Badge color={valueKindColor(m.valueKind)}>{enumLabel(m.valueKind)}</Badge>
                  </Td>
                  <Td className="font-medium text-slate-900">{measurementValue(m)}</Td>
                  <Td>
                    <Link href={`/experiments/${m.experiment.id}`} className="text-slate-500 hover:underline">
                      {m.experiment.title}
                    </Link>
                  </Td>
                  <Td className="text-slate-500">
                    {m.sample ? (
                      <Link href={`/samples/${m.sample.id}`} className="hover:underline">
                        {m.sample.sampleCode}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="text-slate-500">{formatDateTime(m.measuredAt)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/measurements/${m.id}/edit`} className="text-xs text-slate-500 hover:text-slate-900">
                        Edit
                      </Link>
                      <DeleteButton action={deleteMeasurement.bind(null, m.id)} confirmMessage="Delete this measurement?" />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
