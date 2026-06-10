import { PageHeader } from "@/components/ui";
import { RoleForm } from "../RoleForm";
import { createRole } from "../actions";

export default function NewRolePage() {
  return (
    <div>
      <PageHeader title="New role" backHref="/catalog/roles" />
      <RoleForm action={createRole} />
    </div>
  );
}
