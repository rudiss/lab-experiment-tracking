import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { enumLabel, formatDateTime, measurementValue, valueKindColor } from "@/lib/format";
import { deleteSample } from "../actions";

export default async function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id: Number(id) },
    include: {
      specimenType: true,
      experiments: { include: { experiment: { select: { id: true, title: true, status: true } } } },
      measurements: {
        orderBy: { measuredAt: "desc" },
        include: { measurementType: true, experiment: { select: { id: true, title: true } } },
      },
    },
  });
  if (!sample) notFound();

  return (
    <div>
      <PageHeader
        title={sample.sampleCode}
        backHref="/samples"
        description={<Badge color="gray">{sample.specimenType.name}</Badge>}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/samples/${sample.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <DeleteButton action={deleteSample.bind(null, sample.id)} confirmMessage={`Delete sample ${sample.sampleCode}?`} />
          </div>
        }
      />

      <Card className="mb-6 max-w-2xl p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Detail label="Collected at" value={formatDateTime(sample.collectedAt)} />
          <Detail label="Storage location" value={sample.storageLocation ?? "—"} />
          <div className="col-span-2">
            <Detail label="Notes" value={sample.notes ?? "—"} />
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Used in experiments (${sample.experiments.length})`} />
          {sample.experiments.length === 0 ? (
            <EmptyState>Not used in any experiment.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-50">
              {sample.experiments.map((es) => (
                <li key={es.experimentId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <Link href={`/experiments/${es.experiment.id}`} className="font-medium text-slate-900 hover:underline">
                    {es.experiment.title}
                  </Link>
                  <Badge color="gray">{enumLabel(es.experiment.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={`Measurements from this sample (${sample.measurements.length})`} />
          {sample.measurements.length === 0 ? (
            <EmptyState>No measurements recorded.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Value</Th>
                  <Th>Experiment</Th>
                </tr>
              </thead>
              <tbody>
                {sample.measurements.map((m) => (
                  <tr key={m.id}>
                    <Td>
                      <Badge color={valueKindColor(m.valueKind)}>{m.measurementType.name}</Badge>
                    </Td>
                    <Td className="font-medium text-slate-900">{measurementValue(m)}</Td>
                    <Td>
                      <Link href={`/experiments/${m.experiment.id}`} className="text-slate-500 hover:underline">
                        {m.experiment.title}
                      </Link>
                    </Td>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
