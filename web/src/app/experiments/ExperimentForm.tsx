"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { EXPERIMENT_STATUSES } from "@/lib/enums";
import { enumLabel } from "@/lib/format";

type Defaults = {
  projectId: number;
  title: string;
  hypothesis: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  parentExperimentId: number | null;
};

function toDateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function ExperimentForm({
  action,
  projects,
  experiments,
  defaults,
  currentId,
  defaultProjectId,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: { id: number; title: string }[];
  experiments: { id: number; title: string; projectId: number }[];
  defaults?: Defaults;
  currentId?: number;
  defaultProjectId?: number;
  cancelHref: string;
}) {
  const [projectId, setProjectId] = useState<string>(
    String(defaults?.projectId ?? defaultProjectId ?? ""),
  );

  // A follow-up parent must be another experiment in the same project.
  const parentOptions = experiments.filter(
    (e) => e.projectId === Number(projectId) && e.id !== currentId,
  );

  return (
    <Card className="max-w-xl p-5">
      <form action={action} className="space-y-4">
        <Field label="Project" htmlFor="projectId" required>
          <Select
            id="projectId"
            name="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a project…
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={defaults?.title ?? ""} required />
        </Field>

        <Field label="Hypothesis" htmlFor="hypothesis">
          <Textarea id="hypothesis" name="hypothesis" defaultValue={defaults?.hypothesis ?? ""} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={toDateInput(defaults?.startDate)} />
          </Field>
          <Field label="End date" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={toDateInput(defaults?.endDate)} />
          </Field>
        </div>

        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={defaults?.status ?? "PLANNING"}>
            {EXPERIMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {enumLabel(s)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Follow-up of"
          htmlFor="parentExperimentId"
          hint="Optional — an earlier experiment in the same project that this one replicates or iterates on."
        >
          <Select
            id="parentExperimentId"
            name="parentExperimentId"
            // Remount when project changes so a stale parent selection clears.
            key={projectId}
            defaultValue={String(defaults?.parentExperimentId ?? "")}
            disabled={!projectId}
          >
            <option value="">— none —</option>
            {parentOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-2">
          <SubmitButton>Save experiment</SubmitButton>
          <Link href={cancelHref} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
