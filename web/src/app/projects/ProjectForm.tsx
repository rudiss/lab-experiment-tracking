import Link from "next/link";
import { Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { PROJECT_STATUSES } from "@/lib/enums";
import { enumLabel } from "@/lib/format";

type Defaults = { title: string; description: string | null; status: string };

export function ProjectForm({
  action,
  defaults,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Defaults;
  cancelHref: string;
}) {
  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={defaults?.title ?? ""} required />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={defaults?.description ?? ""} />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={defaults?.status ?? "PLANNING"}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {enumLabel(s)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2">
          <SubmitButton>Save project</SubmitButton>
          <Link href={cancelHref} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
