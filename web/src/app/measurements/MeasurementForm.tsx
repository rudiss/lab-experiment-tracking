"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/ui";
import { enumLabel, valueKindColor } from "@/lib/format";

type SampleLite = { id: number; sampleCode: string };
type ExperimentLite = { id: number; title: string; samples: SampleLite[] };
type TypeLite = { id: number; name: string; valueKind: string; defaultUnit: string | null; allowedCategories: string[] };

type Defaults = {
  experimentId: number;
  sampleId: number | null;
  measurementTypeId: number;
  numericValue: string | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
  notes: string | null;
};

export function MeasurementForm({
  action,
  experiments,
  types,
  measuredAtDefault,
  defaults,
  defaultExperimentId,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  experiments: ExperimentLite[];
  types: TypeLite[];
  measuredAtDefault: string;
  defaults?: Defaults;
  defaultExperimentId?: number;
  cancelHref: string;
}) {
  const [experimentId, setExperimentId] = useState(String(defaults?.experimentId ?? defaultExperimentId ?? ""));
  const [typeId, setTypeId] = useState(String(defaults?.measurementTypeId ?? ""));

  const selectedExperiment = experiments.find((e) => e.id === Number(experimentId));
  const sampleOptions = selectedExperiment?.samples ?? [];
  const selectedType = types.find((t) => t.id === Number(typeId));
  const valueKind = selectedType?.valueKind;

  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Experiment" htmlFor="experimentId" required>
          <Select
            id="experimentId"
            name="experimentId"
            value={experimentId}
            onChange={(e) => setExperimentId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select an experiment…
            </option>
            {experiments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Sample" htmlFor="sampleId" hint="Optional — usually a sample linked to the experiment.">
          <Select
            id="sampleId"
            name="sampleId"
            key={experimentId}
            defaultValue={String(defaults?.sampleId ?? "")}
            disabled={!experimentId}
          >
            <option value="">— none —</option>
            {sampleOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sampleCode}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Measurement type" htmlFor="measurementTypeId" required>
          <Select
            id="measurementTypeId"
            name="measurementTypeId"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a type…
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.valueKind})
              </option>
            ))}
          </Select>
        </Field>

        {/* Value input adapts to the selected type's kind. */}
        {valueKind && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
              Value <Badge color={valueKindColor(valueKind)}>{enumLabel(valueKind)}</Badge>
            </div>

            {valueKind === "NUMERIC" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field label="Numeric value" htmlFor="numericValue" required>
                    <Input
                      id="numericValue"
                      name="numericValue"
                      type="number"
                      step="any"
                      defaultValue={defaults?.numericValue ?? ""}
                      required
                    />
                  </Field>
                </div>
                <Field label="Unit" htmlFor="unit">
                  <Input
                    id="unit"
                    name="unit"
                    key={typeId}
                    defaultValue={defaults?.unit ?? selectedType?.defaultUnit ?? ""}
                  />
                </Field>
              </div>
            )}

            {valueKind === "CATEGORICAL" &&
              (selectedType!.allowedCategories.length > 0 ? (
                <Field label="Category" htmlFor="categoricalValue" required>
                  <Select id="categoricalValue" name="categoricalValue" defaultValue={defaults?.categoricalValue ?? ""} required>
                    <option value="" disabled>
                      Select…
                    </option>
                    {selectedType!.allowedCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Category" htmlFor="categoricalValue" required hint="No fixed domain — free categorical value.">
                  <Input id="categoricalValue" name="categoricalValue" defaultValue={defaults?.categoricalValue ?? ""} required />
                </Field>
              ))}

            {valueKind === "TEXT" && (
              <Field label="Text value" htmlFor="textValue" required>
                <Textarea id="textValue" name="textValue" defaultValue={defaults?.textValue ?? ""} required />
              </Field>
            )}
          </div>
        )}

        <Field label="Measured at" htmlFor="measuredAt" required>
          <Input id="measuredAt" name="measuredAt" type="datetime-local" defaultValue={measuredAtDefault} required />
        </Field>

        <Field label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" defaultValue={defaults?.notes ?? ""} />
        </Field>

        <div className="flex gap-2">
          <SubmitButton>Save measurement</SubmitButton>
          <Link href={cancelHref} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
