"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

export async function createSpecimenType(formData: FormData) {
  await prisma.specimenType.create({
    data: { name: getStr(formData, "name"), description: getOptStr(formData, "description") },
  });
  revalidatePath("/catalog/specimen-types");
  redirect("/catalog/specimen-types");
}

export async function updateSpecimenType(id: number, formData: FormData) {
  await prisma.specimenType.update({
    where: { id },
    data: { name: getStr(formData, "name"), description: getOptStr(formData, "description") },
  });
  revalidatePath("/catalog/specimen-types");
  redirect("/catalog/specimen-types");
}

export async function deleteSpecimenType(id: number) {
  try {
    await prisma.specimenType.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/catalog/specimen-types");
}
