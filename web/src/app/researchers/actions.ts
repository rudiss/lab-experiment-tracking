"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr, getInt } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

function parse(formData: FormData) {
  return {
    firstName: getStr(formData, "firstName"),
    lastName: getStr(formData, "lastName"),
    email: getStr(formData, "email"),
    phone: getOptStr(formData, "phone"),
    roleId: getInt(formData, "roleId"),
  };
}

export async function createResearcher(formData: FormData) {
  await prisma.researcher.create({ data: parse(formData) });
  revalidatePath("/researchers");
  redirect("/researchers");
}

export async function updateResearcher(id: number, formData: FormData) {
  await prisma.researcher.update({ where: { id }, data: parse(formData) });
  revalidatePath("/researchers");
  redirect("/researchers");
}

export async function deleteResearcher(id: number) {
  try {
    await prisma.researcher.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/researchers");
}
