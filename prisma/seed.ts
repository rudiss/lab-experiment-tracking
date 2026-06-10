/**
 * Seed data for the Laboratory Experiment Tracking System.
 *
 * Deliberately exercises every interesting part of the model:
 *   - a project with multiple researchers (and a researcher on multiple projects),
 *   - a follow-up chain of experiments (E1 <- E2 <- E3) via parent_experiment_id,
 *   - a sample (S-001) reused across multiple experiments,
 *   - measurements of all three kinds: NUMERIC, CATEGORICAL, TEXT,
 *   - a measurement with no sample (an instrument/ambient reading) — sample is optional.
 *
 * Idempotent: if the database already has researchers, seeding is skipped, so
 * `docker compose up` is safe to re-run. Use `docker compose down -v` for a clean slate.
 */
import { PrismaClient, MeasurementValueKind } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.researcher.count()) > 0) {
    console.log("⏭  Database already seeded — skipping. (Run `docker compose down -v` to reset.)");
    return;
  }

  // --- Reference data -------------------------------------------------------
  // Roles and specimen types are open-ended ("...and so on"), so they are rows.
  const roleNames = [
    "Principal Investigator",
    "Lab Technician",
    "Graduate Student",
    "Postdoc",
    "Research Assistant",
  ];
  await prisma.role.createMany({ data: roleNames.map((name) => ({ name })) });
  const roles = Object.fromEntries(
    (await prisma.role.findMany()).map((r) => [r.name, r.id]),
  );

  const specimenNames = ["Blood", "Tissue", "Chemical Compound", "Soil", "Water", "Cell Culture"];
  await prisma.specimenType.createMany({ data: specimenNames.map((name) => ({ name })) });
  const specimens = Object.fromEntries(
    (await prisma.specimenType.findMany()).map((s) => [s.name, s.id]),
  );

  // The measurement catalog. Adding a new kind later is just another row here.
  await prisma.measurementType.createMany({
    data: [
      { name: "Concentration", valueKind: "NUMERIC", defaultUnit: "mg/L", allowedCategories: [], description: "Analyte concentration." },
      { name: "Temperature", valueKind: "NUMERIC", defaultUnit: "°C", allowedCategories: [], description: "Temperature reading." },
      { name: "pH", valueKind: "NUMERIC", defaultUnit: null, allowedCategories: [], description: "Acidity (dimensionless)." },
      { name: "PCR Result", valueKind: "CATEGORICAL", defaultUnit: null, allowedCategories: ["positive", "negative"], description: "Qualitative PCR outcome." },
      { name: "QC Outcome", valueKind: "CATEGORICAL", defaultUnit: null, allowedCategories: ["pass", "fail"], description: "Quality-control pass/fail." },
      { name: "Observation", valueKind: "TEXT", defaultUnit: null, allowedCategories: [], description: "Free-text observation." },
    ],
  });
  const mt = Object.fromEntries(
    (await prisma.measurementType.findMany()).map((t) => [t.name, t]),
  );

  // --- Researchers ----------------------------------------------------------
  const alice = await prisma.researcher.create({
    data: { firstName: "Alice", lastName: "Chen", email: "alice.chen@lab.example", phone: "+1-555-0100", roleId: roles["Principal Investigator"] },
  });
  const bob = await prisma.researcher.create({
    data: { firstName: "Bob", lastName: "Martins", email: "bob.martins@lab.example", roleId: roles["Lab Technician"] },
  });
  const carol = await prisma.researcher.create({
    data: { firstName: "Carol", lastName: "Singh", email: "carol.singh@lab.example", roleId: roles["Graduate Student"] },
  });
  const david = await prisma.researcher.create({
    data: { firstName: "David", lastName: "Okoye", email: "david.okoye@lab.example", roleId: roles["Postdoc"] },
  });
  const eve = await prisma.researcher.create({
    data: { firstName: "Eve", lastName: "Larsson", email: "eve.larsson@lab.example", roleId: roles["Research Assistant"] },
  });

  // --- Projects (multiple researchers; Alice collaborates on both) ----------
  const soilProject = await prisma.project.create({
    data: {
      title: "Soil Microbiome & Heavy Metals",
      description: "Characterising heavy-metal load and microbial response across field plots.",
      status: "ACTIVE",
      researchers: {
        create: [
          { researcherId: alice.id, isLead: true },
          { researcherId: carol.id },
          { researcherId: bob.id },
        ],
      },
    },
  });

  const bloodProject = await prisma.project.create({
    data: {
      title: "Blood Biomarker Panel",
      description: "Screening inflammatory biomarkers in patient blood samples.",
      status: "PLANNING",
      researchers: {
        create: [
          { researcherId: david.id, isLead: true },
          { researcherId: alice.id }, // Alice is on two projects
          { researcherId: eve.id },
        ],
      },
    },
  });

  // --- Samples --------------------------------------------------------------
  const mkSample = (sampleCode: string, specimen: string, storage: string, collectedAt: string) =>
    prisma.sample.create({
      data: { sampleCode, specimenTypeId: specimens[specimen], storageLocation: storage, collectedAt: new Date(collectedAt) },
    });

  const s001 = await mkSample("SOIL-2026-001", "Soil", "Freezer A / Shelf 2", "2026-03-01T09:00:00Z");
  const s002 = await mkSample("SOIL-2026-002", "Soil", "Freezer A / Shelf 2", "2026-03-01T09:10:00Z");
  const s003 = await mkSample("SOIL-2026-003", "Soil", "Freezer A / Shelf 3", "2026-03-08T09:00:00Z");
  const s101 = await mkSample("BLOOD-2026-101", "Blood", "Fridge B / Rack 1", "2026-04-02T11:00:00Z");
  const s102 = await mkSample("BLOOD-2026-102", "Blood", "Fridge B / Rack 1", "2026-04-02T11:05:00Z");

  // --- Experiments (follow-up chain in the soil project) --------------------
  const e1 = await prisma.experiment.create({
    data: {
      projectId: soilProject.id,
      title: "Baseline heavy-metal concentration in plot soils",
      hypothesis: "Lead concentration exceeds the regulatory threshold in plots near the access road.",
      status: "COMPLETED",
      startDate: new Date("2026-03-02"),
      endDate: new Date("2026-03-06"),
      samples: { create: [{ sampleId: s001.id }, { sampleId: s002.id }] },
    },
  });
  const e2 = await prisma.experiment.create({
    data: {
      projectId: soilProject.id,
      title: "Replication with refined acid-digestion extraction",
      hypothesis: "A refined extraction reproduces the baseline lead concentration within 10%.",
      status: "COMPLETED",
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-03-14"),
      parentExperimentId: e1.id, // follow-up to E1
      samples: { create: [{ sampleId: s001.id }, { sampleId: s003.id }] }, // S-001 reused
    },
  });
  const e3 = await prisma.experiment.create({
    data: {
      projectId: soilProject.id,
      title: "Iterate: lower lead detection threshold",
      hypothesis: "A lower detection threshold resolves trace lead missed by the baseline assay.",
      status: "ACTIVE",
      startDate: new Date("2026-03-18"),
      parentExperimentId: e2.id, // follow-up to E2 -> chain E1 <- E2 <- E3
      samples: { create: [{ sampleId: s001.id }, { sampleId: s003.id }] }, // S-001 reused again
    },
  });

  const e4 = await prisma.experiment.create({
    data: {
      projectId: bloodProject.id,
      title: "Inflammatory marker PCR screen",
      hypothesis: "Marker X is detectable in a majority of the patient cohort.",
      status: "ACTIVE",
      startDate: new Date("2026-04-05"),
      samples: { create: [{ sampleId: s101.id }, { sampleId: s102.id }] },
    },
  });

  // --- Measurements (helpers keep value_kind aligned with the catalog type) -
  const numeric = (experimentId: number, typeName: string, value: number, sampleId: number | null, measuredAt: string, opts: { unit?: string | null; notes?: string } = {}) =>
    prisma.measurement.create({
      data: {
        experimentId,
        sampleId,
        measurementTypeId: mt[typeName].id,
        valueKind: MeasurementValueKind.NUMERIC,
        numericValue: value,
        unit: opts.unit !== undefined ? opts.unit : mt[typeName].defaultUnit,
        notes: opts.notes,
        measuredAt: new Date(measuredAt),
      },
    });

  const categorical = (experimentId: number, typeName: string, value: string, sampleId: number | null, measuredAt: string, notes?: string) =>
    prisma.measurement.create({
      data: {
        experimentId,
        sampleId,
        measurementTypeId: mt[typeName].id,
        valueKind: MeasurementValueKind.CATEGORICAL,
        categoricalValue: value,
        notes,
        measuredAt: new Date(measuredAt),
      },
    });

  const text = (experimentId: number, typeName: string, value: string, sampleId: number | null, measuredAt: string) =>
    prisma.measurement.create({
      data: {
        experimentId,
        sampleId,
        measurementTypeId: mt[typeName].id,
        valueKind: MeasurementValueKind.TEXT,
        textValue: value,
        measuredAt: new Date(measuredAt),
      },
    });

  // E1 — numeric + text, plus an ambient reading with no sample.
  await numeric(e1.id, "Concentration", 12.4, s001.id, "2026-03-03T10:15:00Z");
  await numeric(e1.id, "Concentration", 8.7, s002.id, "2026-03-03T10:40:00Z");
  await numeric(e1.id, "Temperature", 21.5, null, "2026-03-03T10:00:00Z", { notes: "Ambient lab temperature during assay." });
  await text(e1.id, "Observation", "Sample SOIL-2026-001 slightly discoloured on arrival.", s001.id, "2026-03-02T16:00:00Z");

  // E2 — numeric (replication) + categorical QC + text.
  await numeric(e2.id, "Concentration", 11.9, s001.id, "2026-03-12T09:30:00Z", { notes: "Within 10% of baseline." });
  await categorical(e2.id, "QC Outcome", "pass", s003.id, "2026-03-12T09:45:00Z");
  await text(e2.id, "Observation", "Digestion complete, no visible residue.", s003.id, "2026-03-12T10:00:00Z");

  // E3 — pH (numeric, no unit) + low-threshold concentration.
  await numeric(e3.id, "pH", 6.8, s001.id, "2026-03-19T11:00:00Z", { unit: null });
  await numeric(e3.id, "Concentration", 0.42, s003.id, "2026-03-19T11:20:00Z");

  // E4 — categorical PCR results + a numeric biomarker concentration.
  await categorical(e4.id, "PCR Result", "positive", s101.id, "2026-04-06T13:00:00Z");
  await categorical(e4.id, "PCR Result", "negative", s102.id, "2026-04-06T13:10:00Z");
  await numeric(e4.id, "Concentration", 3.2, s101.id, "2026-04-06T13:30:00Z", { notes: "Marker X." });

  const counts = {
    researchers: await prisma.researcher.count(),
    projects: await prisma.project.count(),
    experiments: await prisma.experiment.count(),
    samples: await prisma.sample.count(),
    measurements: await prisma.measurement.count(),
  };
  console.log("✅ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
