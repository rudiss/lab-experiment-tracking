import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function SamplesPage() {
  const samples = await prisma.sample.findMany({
    orderBy: { sampleCode: "asc" },
    include: {
      specimenType: true,
      _count: { select: { experiments: true, measurements: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Samples"
        description="Physical specimens used in experiments. A sample can be used across many experiments."
        action={<LinkButton href="/samples/new">+ New sample</LinkButton>}
      />
      <Card>
        {samples.length === 0 ? (
          <EmptyState>No samples yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Storage</Th>
                <Th>Collected</Th>
                <Th>Experiments</Th>
                <Th>Measurements</Th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s) => (
                <tr key={s.id}>
                  <Td>
                    <Link href={`/samples/${s.id}`} className="font-medium text-slate-900 hover:underline">
                      {s.sampleCode}
                    </Link>
                  </Td>
                  <Td>
                    <Badge color="gray">{s.specimenType.name}</Badge>
                  </Td>
                  <Td className="text-slate-500">{s.storageLocation ?? "—"}</Td>
                  <Td className="text-slate-500">{formatDateTime(s.collectedAt)}</Td>
                  <Td>{s._count.experiments}</Td>
                  <Td>{s._count.measurements}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
