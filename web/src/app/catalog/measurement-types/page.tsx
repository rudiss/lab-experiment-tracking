import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { enumLabel, valueKindColor } from "@/lib/format";
import { deleteMeasurementType } from "./actions";

export default async function MeasurementTypesPage() {
  const types = await prisma.measurementType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { measurements: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Measurement Types"
        description="The measurement catalog. Adding a new kind is a row here — never a schema change."
        action={<LinkButton href="/catalog/measurement-types/new">+ New measurement type</LinkButton>}
      />
      <Card>
        {types.length === 0 ? (
          <EmptyState>No measurement types yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Kind</Th>
                <Th>Unit / Categories</Th>
                <Th>Used</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium text-slate-900">{t.name}</Td>
                  <Td>
                    <Badge color={valueKindColor(t.valueKind)}>{enumLabel(t.valueKind)}</Badge>
                  </Td>
                  <Td className="text-slate-500">
                    {t.valueKind === "NUMERIC" && (t.defaultUnit || "—")}
                    {t.valueKind === "CATEGORICAL" &&
                      (t.allowedCategories.length ? t.allowedCategories.join(", ") : "any")}
                    {t.valueKind === "TEXT" && "—"}
                  </Td>
                  <Td>
                    <Badge color={t._count.measurements > 0 ? "blue" : "gray"}>{t._count.measurements}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalog/measurement-types/${t.id}/edit`} className="text-xs text-slate-500 hover:text-slate-900">
                        Edit
                      </Link>
                      <DeleteButton action={deleteMeasurementType.bind(null, t.id)} confirmMessage={`Delete "${t.name}"?`} />
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
