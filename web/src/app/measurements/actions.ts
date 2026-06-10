"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getInt, getOptInt, getOptStr, getOptDate } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

/**
 * Builds the measurement payload. value_kind is derived from the catalog type (not
 * trusted from the client), the matching value column is populated and the others are
 * nulled, and categorical values are validated against allowed_categories — the one
 * rule the database can't enforce declaratively. The composite FK + CHECK in the schema
 * are the final backstop.
 */
async function buildData(formData: FormData) {
  const measurementTypeId = getInt(formData, "measurementTypeId");
  const type = await prisma.measurementType.findUnique({ where: { id: measurementTypeId } });
  if (!type) throw new Error("Measurement type not found.");

  const base = {
    experimentId: getInt(formData, "experimentId"),
    sampleId: getOptInt(formData, "sampleId"),
    measurementTypeId,
    valueKind: type.valueKind,
    measuredAt: getOptDate(formData, "measuredAt") ?? new Date(),
    notes: getOptStr(formData, "notes"),
    numericValue: null as Prisma.Decimal | number | null,
    unit: null as string | null,
    categoricalValue: null as string | null,
    textValue: null as string | null,
  };

  if (type.valueKind === "NUMERIC") {
    const raw = getStr(formData, "numericValue");
    const n = Number(raw);
    if (raw === "" || Number.isNaN(n)) throw new Error("A numeric value is required.");
    base.numericValue = n;
    base.unit = getOptStr(formData, "unit");
  } else if (type.valueKind === "CATEGORICAL") {
    const value = getStr(formData, "categoricalValue");
    if (value === "") throw new Error("A categorical value is required.");
    if (type.allowedCategories.length > 0 && !type.allowedCategories.includes(value)) {
      throw new Error(`"${value}" is not an allowed category for ${type.name}.`);
    }
    base.categoricalValue = value;
  } else {
    const value = getStr(formData, "textValue");
    if (value === "") throw new Error("A text value is required.");
    base.textValue = value;
  }

  return base;
}

export async function createMeasurement(formData: FormData) {
  const data = await buildData(formData);
  await prisma.measurement.create({ data });
  revalidatePath("/measurements");
  revalidatePath(`/experiments/${data.experimentId}`);
  redirect(`/experiments/${data.experimentId}`);
}

export async function updateMeasurement(id: number, formData: FormData) {
  const data = await buildData(formData);
  await prisma.measurement.update({ where: { id }, data });
  revalidatePath("/measurements");
  revalidatePath(`/experiments/${data.experimentId}`);
  redirect(`/experiments/${data.experimentId}`);
}

export async function deleteMeasurement(id: number) {
  try {
    await prisma.measurement.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/measurements");
}
