import Link from "next/link";
import { Card, Field, Input, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export function SpecimenTypeForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: { name: string; description: string | null };
}) {
  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required placeholder="e.g. Blood, Soil, Tissue" />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={defaults?.description ?? ""} />
        </Field>
        <div className="flex gap-2">
          <SubmitButton>Save specimen type</SubmitButton>
          <Link href="/catalog/specimen-types" className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
