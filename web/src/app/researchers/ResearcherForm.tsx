import Link from "next/link";
import { Card, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

type Defaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId: number;
};

export function ResearcherForm({
  action,
  roles,
  defaults,
}: {
  action: (formData: FormData) => void | Promise<void>;
  roles: { id: number; name: string }[];
  defaults?: Defaults;
}) {
  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName" required>
            <Input id="firstName" name="firstName" defaultValue={defaults?.firstName ?? ""} required />
          </Field>
          <Field label="Last name" htmlFor="lastName" required>
            <Input id="lastName" name="lastName" defaultValue={defaults?.lastName ?? ""} required />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" defaultValue={defaults?.email ?? ""} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
        </Field>
        <Field label="Role" htmlFor="roleId" required>
          <Select id="roleId" name="roleId" defaultValue={defaults?.roleId ?? ""} required>
            <option value="" disabled>
              Select a role…
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2">
          <SubmitButton>Save researcher</SubmitButton>
          <Link href="/researchers" className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
