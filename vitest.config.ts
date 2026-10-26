import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const results = process.env.WORKSHOP_VERIFICATION_RESULTS;
// Native PostgreSQL filesystem backup/restore must not compete with other cluster fixtures.
// Explicit Promise.all concurrency cases inside each integration file remain unchanged.
export default defineConfig({ test: { include: ["src/**/*.test.ts", "apps/**/*.test.ts", "packages/**/*.test.ts"], environment: "node", fileParallelism: false,
  reporters: results ? ["default", "json"] : ["default"], outputFile: results ? { json: resolve(results, "vitest.json") } : undefined } });
