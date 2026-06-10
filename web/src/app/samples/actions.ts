"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr, getInt, getOptDate } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

function parse(formData: FormData) {
  return {
    sampleCode: getStr(formData, "sampleCode"),
    specimenTypeId: getInt(formData, "specimenTypeId"),
    collectedAt: getOptDate(formData, "collectedAt"),
    storageLocation: getOptStr(formData, "storageLocation"),
    notes: getOptStr(formData, "notes"),
  };
}

export async function createSample(formData: FormData) {
  const sample = await prisma.sample.create({ data: parse(formData) });
  revalidatePath("/samples");
  redirect(`/samples/${sample.id}`);
}

export async function updateSample(id: number, formData: FormData) {
  await prisma.sample.update({ where: { id }, data: parse(formData) });
  revalidatePath("/samples");
  revalidatePath(`/samples/${id}`);
  redirect(`/samples/${id}`);
}

export async function deleteSample(id: number) {
  try {
    await prisma.sample.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/samples");
  redirect("/samples");
}
