// Copies the canonical Prisma schema from the root project into web/prisma so the
// web app can generate its own client. The root schema (../prisma/schema.prisma) is the
// single source of truth and owns migrations; web/prisma/schema.prisma is a generated,
// gitignored copy. Runs automatically on postinstall / predev / prebuild.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const src = resolve(process.cwd(), "..", "prisma", "schema.prisma");
const dest = resolve(process.cwd(), "prisma", "schema.prisma");

if (!existsSync(src)) {
  console.error(`[pull-schema] Root schema not found at ${src}`);
  console.error("[pull-schema] Run this from the web/ directory of the repo.");
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`[pull-schema] Synced schema: ${src} -> ${dest}`);
