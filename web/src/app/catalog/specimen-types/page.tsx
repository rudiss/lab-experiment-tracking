import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteSpecimenType } from "./actions";

export default async function SpecimenTypesPage() {
  const types = await prisma.specimenType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { samples: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Specimen Types"
        description="Kinds of specimen a sample can be (blood, soil, …). Reference table."
        action={<LinkButton href="/catalog/specimen-types/new">+ New specimen type</LinkButton>}
      />
      <Card>
        {types.length === 0 ? (
          <EmptyState>No specimen types yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Samples</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium text-slate-900">{t.name}</Td>
                  <Td className="text-slate-500">{t.description ?? "—"}</Td>
                  <Td>
                    <Badge color={t._count.samples > 0 ? "blue" : "gray"}>{t._count.samples}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalog/specimen-types/${t.id}/edit`} className="text-xs text-slate-500 hover:text-slate-900">
                        Edit
                      </Link>
                      <DeleteButton action={deleteSpecimenType.bind(null, t.id)} confirmMessage={`Delete "${t.name}"?`} />
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
