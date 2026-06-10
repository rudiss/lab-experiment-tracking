"use server";

import { ExperimentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStr, getOptStr, getInt, getOptInt, getOptDate } from "@/lib/form";
import { prismaErrorMessage } from "@/lib/errors";

function parse(formData: FormData) {
  return {
    projectId: getInt(formData, "projectId"),
    title: getStr(formData, "title"),
    hypothesis: getOptStr(formData, "hypothesis"),
    startDate: getOptDate(formData, "startDate"),
    endDate: getOptDate(formData, "endDate"),
    status: getStr(formData, "status") as ExperimentStatus,
    parentExperimentId: getOptInt(formData, "parentExperimentId"),
  };
}

export async function createExperiment(formData: FormData) {
  const experiment = await prisma.experiment.create({ data: parse(formData) });
  revalidatePath("/experiments");
  redirect(`/experiments/${experiment.id}`);
}

export async function updateExperiment(id: number, formData: FormData) {
  await prisma.experiment.update({ where: { id }, data: parse(formData) });
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${id}`);
  redirect(`/experiments/${id}`);
}

export async function deleteExperiment(id: number) {
  try {
    await prisma.experiment.delete({ where: { id } });
  } catch (e) {
    return { error: prismaErrorMessage(e) };
  }
  revalidatePath("/experiments");
  redirect("/experiments");
}

// --- Sample links ---------------------------------------------------------

export async function addExperimentSample(experimentId: number, formData: FormData) {
  const sampleId = getInt(formData, "sampleId");
  await prisma.experimentSample.upsert({
    where: { experimentId_sampleId: { experimentId, sampleId } },
    create: { experimentId, sampleId },
    update: {},
  });
  revalidatePath(`/experiments/${experimentId}`);
}

export async function removeExperimentSample(experimentId: number, sampleId: number) {
  await prisma.experimentSample.delete({
    where: { experimentId_sampleId: { experimentId, sampleId } },
  });
  revalidatePath(`/experiments/${experimentId}`);
}
