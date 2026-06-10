import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteRole } from "./actions";

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { researchers: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Lab roles assigned to researchers. A reference table — add new roles as the lab grows."
        action={<LinkButton href="/catalog/roles/new">+ New role</LinkButton>}
      />
      <Card>
        {roles.length === 0 ? (
          <EmptyState>No roles yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Researchers</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">{r.name}</Td>
                  <Td className="text-slate-500">{r.description ?? "—"}</Td>
                  <Td>
                    <Badge color={r._count.researchers > 0 ? "blue" : "gray"}>{r._count.researchers}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/catalog/roles/${r.id}/edit`} className="text-xs text-slate-500 hover:text-slate-900">
                        Edit
                      </Link>
                      <DeleteButton action={deleteRole.bind(null, r.id)} confirmMessage={`Delete role "${r.name}"?`} />
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
