"use server";

import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr, getInt, getBool } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

function parse(formData: FormData) {
  return {
    title: getStr(formData, "title"),
    description: getOptStr(formData, "description"),
    status: getStr(formData, "status") as ProjectStatus,
  };
}

export async function createProject(formData: FormData) {
  const project = await prisma.project.create({ data: parse(formData) });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: number, formData: FormData) {
  await prisma.project.update({ where: { id }, data: parse(formData) });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: number) {
  try {
    await prisma.project.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/projects");
  redirect("/projects");
}

// --- Membership -----------------------------------------------------------

export async function addProjectMember(projectId: number, formData: FormData) {
  const researcherId = getInt(formData, "researcherId");
  const isLead = getBool(formData, "isLead");
  await prisma.projectResearcher.upsert({
    where: { projectId_researcherId: { projectId, researcherId } },
    create: { projectId, researcherId, isLead },
    update: { isLead },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectMember(projectId: number, researcherId: number) {
  await prisma.projectResearcher.delete({
    where: { projectId_researcherId: { projectId, researcherId } },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleProjectLead(projectId: number, researcherId: number) {
  const membership = await prisma.projectResearcher.findUnique({
    where: { projectId_researcherId: { projectId, researcherId } },
  });
  if (membership) {
    await prisma.projectResearcher.update({
      where: { projectId_researcherId: { projectId, researcherId } },
      data: { isLead: !membership.isLead },
    });
  }
  revalidatePath(`/projects/${projectId}`);
}
