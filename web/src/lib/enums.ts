// Mirrors the Postgres enums in the Prisma schema, for use in <select> options.
export const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export const EXPERIMENT_STATUSES = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export const VALUE_KINDS = ["NUMERIC", "CATEGORICAL", "TEXT"] as const;
