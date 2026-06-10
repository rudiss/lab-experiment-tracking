import Link from "next/link";
import { Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { toDateTimeInput } from "@/lib/form";

type Defaults = {
  sampleCode: string;
  specimenTypeId: number;
  collectedAt: Date | null;
  storageLocation: string | null;
  notes: string | null;
};

export function SampleForm({
  action,
  specimenTypes,
  defaults,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  specimenTypes: { id: number; name: string }[];
  defaults?: Defaults;
  cancelHref: string;
}) {
  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Sample code" htmlFor="sampleCode" required hint="Lab-assigned unique identifier.">
          <Input id="sampleCode" name="sampleCode" defaultValue={defaults?.sampleCode ?? ""} required placeholder="SOIL-2026-001" />
        </Field>
        <Field label="Specimen type" htmlFor="specimenTypeId" required>
          <Select id="specimenTypeId" name="specimenTypeId" defaultValue={defaults?.specimenTypeId ?? ""} required>
            <option value="" disabled>
              Select a specimen type…
            </option>
            {specimenTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Collected at" htmlFor="collectedAt">
          <Input id="collectedAt" name="collectedAt" type="datetime-local" defaultValue={toDateTimeInput(defaults?.collectedAt)} />
        </Field>
        <Field label="Storage location" htmlFor="storageLocation">
          <Input id="storageLocation" name="storageLocation" defaultValue={defaults?.storageLocation ?? ""} placeholder="Freezer A / Shelf 2" />
        </Field>
        <Field label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" defaultValue={defaults?.notes ?? ""} />
        </Field>
        <div className="flex gap-2">
          <SubmitButton>Save sample</SubmitButton>
          <Link href={cancelHref} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
