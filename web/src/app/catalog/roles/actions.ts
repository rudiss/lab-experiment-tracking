"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

export async function createRole(formData: FormData) {
  await prisma.role.create({
    data: { name: getStr(formData, "name"), description: getOptStr(formData, "description") },
  });
  revalidatePath("/catalog/roles");
  redirect("/catalog/roles");
}

export async function updateRole(id: number, formData: FormData) {
  await prisma.role.update({
    where: { id },
    data: { name: getStr(formData, "name"), description: getOptStr(formData, "description") },
  });
  revalidatePath("/catalog/roles");
  redirect("/catalog/roles");
}

export async function deleteRole(id: number) {
  try {
    await prisma.role.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/catalog/roles");
}
