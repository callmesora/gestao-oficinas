// Runs the isolated Vite/API/PostgreSQL workflow server with installed Chrome (no download).
// Business flows use the real API/database; native preview metadata never proves Rust commands.
import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const results = process.env.WORKSHOP_VERIFICATION_RESULTS;

export default defineConfig({
  testDir: ".",
  testMatch: ["ui-check.spec.ts", "*.flows.spec.ts"], // structure and look; click-throughs of golden scenarios
  workers: 1,
  reporter: results ? [["list"], ["json", { outputFile: resolve(results, "playwright.json") }]] : undefined,
  use: { baseURL: "http://localhost:1431", channel: "chrome", viewport: { width: 1024, height: 768 },
    // Headless Playwright otherwise hides even source-required always-visible scrollbars.
    launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } },
  webServer: { command: "npm run dev:workflows", url: "http://localhost:1431", reuseExistingServer: true, timeout: 90000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 10000 } },
});
