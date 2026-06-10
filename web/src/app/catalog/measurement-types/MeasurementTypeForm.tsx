"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

type Defaults = {
  name: string;
  valueKind: string;
  defaultUnit: string | null;
  allowedCategories: string[];
  description: string | null;
};

export function MeasurementTypeForm({
  action,
  defaults,
  lockValueKind = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Defaults;
  lockValueKind?: boolean;
}) {
  const [valueKind, setValueKind] = useState(defaults?.valueKind ?? "NUMERIC");

  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required placeholder="e.g. Concentration, PCR Result" />
        </Field>

        <Field
          label="Value kind"
          htmlFor="valueKind"
          required
          hint={
            lockValueKind
              ? "Locked: this type already has measurements, so its storage shape can't change."
              : "Determines how values are stored. Numeric values are aggregatable; categorical values can be constrained to a set."
          }
        >
          {lockValueKind ? (
            <>
              <Select id="valueKind" value={valueKind} disabled onChange={() => {}}>
                <option value={valueKind}>{valueKind}</option>
              </Select>
              <input type="hidden" name="valueKind" value={valueKind} />
            </>
          ) : (
            <Select
              id="valueKind"
              name="valueKind"
              value={valueKind}
              onChange={(e) => setValueKind(e.target.value)}
            >
              <option value="NUMERIC">NUMERIC</option>
              <option value="CATEGORICAL">CATEGORICAL</option>
              <option value="TEXT">TEXT</option>
            </Select>
          )}
        </Field>

        {valueKind === "NUMERIC" && (
          <Field label="Default unit" htmlFor="defaultUnit" hint="Optional — e.g. mg/L, °C. Leave blank for dimensionless (pH).">
            <Input id="defaultUnit" name="defaultUnit" defaultValue={defaults?.defaultUnit ?? ""} placeholder="mg/L" />
          </Field>
        )}

        {valueKind === "CATEGORICAL" && (
          <Field
            label="Allowed categories"
            htmlFor="allowedCategories"
            hint="Comma- or newline-separated, e.g. positive, negative. Used by the measurement form."
          >
            <Textarea
              id="allowedCategories"
              name="allowedCategories"
              defaultValue={(defaults?.allowedCategories ?? []).join(", ")}
              placeholder="positive, negative"
            />
          </Field>
        )}

        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={defaults?.description ?? ""} />
        </Field>

        <div className="flex gap-2">
          <SubmitButton>Save measurement type</SubmitButton>
          <Link href="/catalog/measurement-types" className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
