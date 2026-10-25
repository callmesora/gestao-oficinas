import { defineConfig } from "vitest/config";
// Native PostgreSQL filesystem backup/restore must not compete with other cluster fixtures.
// Explicit Promise.all concurrency cases inside each integration file remain unchanged.
export default defineConfig({ test: { include: ["src/**/*.test.ts", "apps/**/*.test.ts", "packages/**/*.test.ts"], environment: "node", fileParallelism: false } });
