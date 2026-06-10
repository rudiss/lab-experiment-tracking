import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { RoleForm } from "../../RoleForm";
import { updateRole } from "../../actions";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id: Number(id) } });
  if (!role) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${role.name}`} backHref="/catalog/roles" />
      <RoleForm action={updateRole.bind(null, role.id)} defaults={role} />
    </div>
  );
}
