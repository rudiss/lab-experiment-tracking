import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Badge,
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
import { enumLabel, formatDate, formatDateTime, measurementValue, statusColor, valueKindColor } from "@/lib/format";
import { addExperimentSample, deleteExperiment, removeExperimentSample } from "../actions";

export default async function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experimentId = Number(id);

  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: {
      project: { select: { id: true, title: true } },
      parent: { select: { id: true, title: true } },
      followUps: { select: { id: true, title: true, status: true }, orderBy: { createdAt: "asc" } },
      samples: { include: { sample: { include: { specimenType: true } } }, orderBy: { sampleId: "asc" } },
      measurements: {
        orderBy: { measuredAt: "desc" },
        include: { measurementType: true, sample: { select: { id: true, sampleCode: true } } },
      },
    },
  });
  if (!experiment) notFound();

  const linkedSampleIds = new Set(experiment.samples.map((s) => s.sampleId));
  const candidateSamples = await prisma.sample.findMany({
    where: { id: { notIn: [...linkedSampleIds] } },
    orderBy: { sampleCode: "asc" },
    include: { specimenType: true },
  });

  return (
    <div>
      <PageHeader
        title={experiment.title}
        backHref="/experiments"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge color={statusColor(experiment.status)}>{enumLabel(experiment.status)}</Badge>
            <span className="text-slate-400">in</span>
            <Link href={`/projects/${experiment.project.id}`} className="text-slate-600 hover:underline">
              {experiment.project.title}
            </Link>
          </span>
        }
        action={
          <div className="flex gap-2">
            <LinkButton href={`/measurements/new?experimentId=${experiment.id}`}>+ Measurement</LinkButton>
            <LinkButton href={`/experiments/${experiment.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <DeleteButton
              action={deleteExperiment.bind(null, experiment.id)}
              confirmMessage={`Delete "${experiment.title}"? Its measurements will also be deleted.`}
            />
          </div>
        }
      />

      <Card className="mb-6 max-w-3xl p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Hypothesis</dt>
            <dd className="mt-0.5 text-slate-700">{experiment.hypothesis ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Start date</dt>
            <dd className="mt-0.5 text-slate-700">{formatDate(experiment.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">End date</dt>
            <dd className="mt-0.5 text-slate-700">{formatDate(experiment.endDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Follow-up of</dt>
            <dd className="mt-0.5 text-slate-700">
              {experiment.parent ? (
                <Link href={`/experiments/${experiment.parent.id}`} className="hover:underline">
                  {experiment.parent.title}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Follow-ups</dt>
            <dd className="mt-0.5 flex flex-col gap-0.5">
              {experiment.followUps.length === 0
                ? "—"
                : experiment.followUps.map((f) => (
                    <Link key={f.id} href={`/experiments/${f.id}`} className="text-slate-700 hover:underline">
                      {f.title}
                    </Link>
                  ))}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Samples */}
        <Card>
          <CardHeader title={`Samples (${experiment.samples.length})`} />
          {experiment.samples.length === 0 ? (
            <EmptyState>No samples linked.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {experiment.samples.map((es) => (
                  <tr key={es.sampleId}>
                    <Td>
                      <Link href={`/samples/${es.sample.id}`} className="font-medium text-slate-900 hover:underline">
                        {es.sample.sampleCode}
                      </Link>
                    </Td>
                    <Td className="text-slate-500">{es.sample.specimenType.name}</Td>
                    <Td className="text-right">
                      <DeleteButton
                        action={removeExperimentSample.bind(null, experiment.id, es.sampleId)}
                        label="Unlink"
                        variant="ghost"
                        confirmMessage={`Unlink ${es.sample.sampleCode} from this experiment?`}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {candidateSamples.length > 0 && (
            <form action={addExperimentSample.bind(null, experiment.id)} className="flex items-end gap-2 border-t border-slate-100 p-4">
              <div className="flex-1">
                <Field label="Link a sample" htmlFor="sampleId">
                  <Select id="sampleId" name="sampleId" defaultValue="" required>
                    <option value="" disabled>
                      Select a sample…
                    </option>
                    {candidateSamples.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sampleCode} — {s.specimenType.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="pb-0.5">
                <SubmitButton variant="secondary">Link</SubmitButton>
              </div>
            </form>
          )}
        </Card>

        {/* Measurements */}
        <Card>
          <CardHeader
            title={`Measurements (${experiment.measurements.length})`}
            action={
              <Link href={`/measurements/new?experimentId=${experiment.id}`} className="text-sm text-slate-500 hover:text-slate-900">
                + New
              </Link>
            }
          />
          {experiment.measurements.length === 0 ? (
            <EmptyState>No measurements recorded.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Value</Th>
                  <Th>Sample</Th>
                  <Th>Measured</Th>
                </tr>
              </thead>
              <tbody>
                {experiment.measurements.map((m) => (
                  <tr key={m.id}>
                    <Td>
                      <Link href={`/measurements/${m.id}/edit`} className="font-medium text-slate-900 hover:underline">
                        {m.measurementType.name}
                      </Link>{" "}
                      <Badge color={valueKindColor(m.valueKind)}>{enumLabel(m.valueKind)}</Badge>
                    </Td>
                    <Td className="font-medium text-slate-900">{measurementValue(m)}</Td>
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
