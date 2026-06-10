-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "experiment_status" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "measurement_value_kind" AS ENUM ('NUMERIC', 'CATEGORICAL', 'TEXT');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specimen_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "specimen_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value_kind" "measurement_value_kind" NOT NULL,
    "default_unit" TEXT,
    "allowed_categories" TEXT[],
    "description" TEXT,

    CONSTRAINT "measurement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researchers" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "researchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "project_status" NOT NULL DEFAULT 'PLANNING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_researchers" (
    "project_id" INTEGER NOT NULL,
    "researcher_id" INTEGER NOT NULL,
    "is_lead" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_researchers_pkey" PRIMARY KEY ("project_id","researcher_id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" "experiment_status" NOT NULL DEFAULT 'PLANNING',
    "parent_experiment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" SERIAL NOT NULL,
    "sample_code" TEXT NOT NULL,
    "specimen_type_id" INTEGER NOT NULL,
    "collected_at" TIMESTAMP(3),
    "storage_location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_samples" (
    "experiment_id" INTEGER NOT NULL,
    "sample_id" INTEGER NOT NULL,

    CONSTRAINT "experiment_samples_pkey" PRIMARY KEY ("experiment_id","sample_id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" SERIAL NOT NULL,
    "experiment_id" INTEGER NOT NULL,
    "sample_id" INTEGER,
    "measurement_type_id" INTEGER NOT NULL,
    "value_kind" "measurement_value_kind" NOT NULL,
    "numeric_value" DECIMAL(18,6),
    "unit" TEXT,
    "categorical_value" TEXT,
    "text_value" TEXT,
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specimen_types_name_key" ON "specimen_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_types_name_key" ON "measurement_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_types_id_value_kind_key" ON "measurement_types"("id", "value_kind");

-- CreateIndex
CREATE UNIQUE INDEX "researchers_email_key" ON "researchers"("email");

-- CreateIndex
CREATE INDEX "researchers_role_id_idx" ON "researchers"("role_id");

-- CreateIndex
CREATE INDEX "project_researchers_researcher_id_idx" ON "project_researchers"("researcher_id");

-- CreateIndex
CREATE INDEX "experiments_project_id_idx" ON "experiments"("project_id");

-- CreateIndex
CREATE INDEX "experiments_parent_experiment_id_idx" ON "experiments"("parent_experiment_id");

-- CreateIndex
CREATE UNIQUE INDEX "samples_sample_code_key" ON "samples"("sample_code");

-- CreateIndex
CREATE INDEX "samples_specimen_type_id_idx" ON "samples"("specimen_type_id");

-- CreateIndex
CREATE INDEX "experiment_samples_sample_id_idx" ON "experiment_samples"("sample_id");

-- CreateIndex
CREATE INDEX "measurements_experiment_id_idx" ON "measurements"("experiment_id");

-- CreateIndex
CREATE INDEX "measurements_sample_id_idx" ON "measurements"("sample_id");

-- CreateIndex
CREATE INDEX "measurements_measurement_type_id_idx" ON "measurements"("measurement_type_id");

-- CreateIndex
CREATE INDEX "measurements_measured_at_idx" ON "measurements"("measured_at");

-- AddForeignKey
ALTER TABLE "researchers" ADD CONSTRAINT "researchers_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_researchers" ADD CONSTRAINT "project_researchers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_researchers" ADD CONSTRAINT "project_researchers_researcher_id_fkey" FOREIGN KEY ("researcher_id") REFERENCES "researchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_parent_experiment_id_fkey" FOREIGN KEY ("parent_experiment_id") REFERENCES "experiments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_specimen_type_id_fkey" FOREIGN KEY ("specimen_type_id") REFERENCES "specimen_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_measurement_type_id_value_kind_fkey" FOREIGN KEY ("measurement_type_id", "value_kind") REFERENCES "measurement_types"("id", "value_kind") ON DELETE RESTRICT ON UPDATE CASCADE;
