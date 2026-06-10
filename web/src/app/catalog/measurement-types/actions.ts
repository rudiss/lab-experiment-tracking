"use server";

import { MeasurementValueKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr, getList } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

function parse(formData: FormData) {
  const valueKind = getStr(formData, "valueKind") as MeasurementValueKind;
  return {
    name: getStr(formData, "name"),
    valueKind,
    // Only numeric kinds carry a unit; only categorical kinds carry a category domain.
    defaultUnit: valueKind === "NUMERIC" ? getOptStr(formData, "defaultUnit") : null,
    allowedCategories: valueKind === "CATEGORICAL" ? getList(formData, "allowedCategories") : [],
    description: getOptStr(formData, "description"),
  };
}

export async function createMeasurementType(formData: FormData) {
  await prisma.measurementType.create({ data: parse(formData) });
  revalidatePath("/catalog/measurement-types");
  redirect("/catalog/measurement-types");
}

export async function updateMeasurementType(id: number, formData: FormData) {
  await prisma.measurementType.update({ where: { id }, data: parse(formData) });
  revalidatePath("/catalog/measurement-types");
  redirect("/catalog/measurement-types");
}

export async function deleteMeasurementType(id: number) {
  try {
    await prisma.measurementType.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/catalog/measurement-types");
}
