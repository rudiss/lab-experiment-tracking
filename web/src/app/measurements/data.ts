import { prisma } from "@/lib/prisma";

/** Experiments (each with their linked samples) and the measurement-type catalog,
 *  as needed to drive the type-aware measurement form. */
export async function getMeasurementFormData() {
  const [experimentsRaw, types] = await Promise.all([
    prisma.experiment.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        samples: { select: { sample: { select: { id: true, sampleCode: true } } } },
      },
    }),
    prisma.measurementType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, valueKind: true, defaultUnit: true, allowedCategories: true },
    }),
  ]);

  const experiments = experimentsRaw.map((e) => ({
    id: e.id,
    title: e.title,
    samples: e.samples.map((s) => s.sample),
  }));

  return { experiments, types };
}
