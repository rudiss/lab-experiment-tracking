-- Integrity rules that Prisma's schema language cannot express, added as raw SQL.
-- The composite FK measurements(measurement_type_id, value_kind) ->
-- measurement_types(id, value_kind) is already created by the `init` migration; it
-- guarantees a measurement's value_kind matches its catalog type. The CHECKs below add
-- the rules a foreign key alone can't.

-- 1. An experiment's end date cannot precede its start date (when both are set).
ALTER TABLE "experiments"
  ADD CONSTRAINT "experiments_date_order_check"
  CHECK ("end_date" IS NULL OR "start_date" IS NULL OR "end_date" >= "start_date");

-- 2. An experiment cannot be its own follow-up. (Longer cycles are not prevented here;
--    see README open questions.)
ALTER TABLE "experiments"
  ADD CONSTRAINT "experiments_not_self_parent_check"
  CHECK ("parent_experiment_id" IS NULL OR "parent_experiment_id" <> "id");

-- 3. Exactly the one value column that matches value_kind is populated, the others NULL.
--    A unit may only accompany a NUMERIC reading (and is optional even then, e.g. pH).
--    Combined with the composite FK to measurement_types, this makes the stored shape of
--    every measurement provably consistent with its catalog type, with no triggers.
ALTER TABLE "measurements"
  ADD CONSTRAINT "measurements_value_matches_kind_check"
  CHECK (
    (
      "value_kind" = 'NUMERIC'
      AND "numeric_value" IS NOT NULL
      AND "categorical_value" IS NULL
      AND "text_value" IS NULL
    )
    OR (
      "value_kind" = 'CATEGORICAL'
      AND "categorical_value" IS NOT NULL
      AND "numeric_value" IS NULL
      AND "text_value" IS NULL
      AND "unit" IS NULL
    )
    OR (
      "value_kind" = 'TEXT'
      AND "text_value" IS NOT NULL
      AND "numeric_value" IS NULL
      AND "categorical_value" IS NULL
      AND "unit" IS NULL
    )
  );
