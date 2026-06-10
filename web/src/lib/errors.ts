import { Prisma } from "@prisma/client";

/** Turn Prisma errors into short, user-facing messages. */
export function prismaErrorMessage(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case "P2002":
        return "That value must be unique — it already exists.";
      case "P2003":
        return "Can't delete this record: it's still referenced by other records.";
      case "P2025":
        return "Record not found.";
    }
  }
  return e instanceof Error ? e.message : "Something went wrong.";
}
