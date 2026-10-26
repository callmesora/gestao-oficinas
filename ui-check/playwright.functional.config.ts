import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const results = process.env.WORKSHOP_VERIFICATION_RESULTS;

// Real fixtures own their API/Vite/PostgreSQL endpoints; no shared development server.
export default defineConfig({
  testDir: ".", testMatch: "functional-*.flows.spec.ts", workers: 1, timeout: 90_000,
  outputDir: "../analysis-local/functional-browser",
  reporter: results ? [["list"], ["json", { outputFile: resolve(results, "playwright.json") }]] : undefined,
  use: { channel: "chrome", launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } },
});
