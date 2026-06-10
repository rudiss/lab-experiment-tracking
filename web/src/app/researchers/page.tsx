import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, Td, Th } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteResearcher } from "./actions";

export default async function ResearchersPage() {
  const researchers = await prisma.researcher.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { role: true, _count: { select: { projects: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Researchers"
        description="Scientists who conduct experiments, with their lab role."
        action={<LinkButton href="/researchers/new">+ New researcher</LinkButton>}
      />
      <Card>
        {researchers.length === 0 ? (
          <EmptyState>No researchers yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Projects</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {researchers.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">
                    {r.firstName} {r.lastName}
                  </Td>
                  <Td className="text-slate-500">{r.email}</Td>
                  <Td>
                    <Badge color="gray">{r.role.name}</Badge>
                  </Td>
                  <Td>{r._count.projects}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/researchers/${r.id}/edit`} className="text-xs text-slate-500 hover:text-slate-900">
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteResearcher.bind(null, r.id)}
                        confirmMessage={`Delete ${r.firstName} ${r.lastName}?`}
                      />
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
