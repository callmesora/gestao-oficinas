// Runs the isolated Vite/API/PostgreSQL workflow server with installed Chrome (no download).
// Business flows use the real API/database; native preview metadata never proves Rust commands.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["ui-check.spec.ts", "*.flows.spec.ts"], // structure and look; click-throughs of golden scenarios
  workers: 1,
  use: { baseURL: "http://localhost:1431", channel: "chrome", viewport: { width: 1024, height: 768 } },
  webServer: { command: "npm run dev:workflows", url: "http://localhost:1431", reuseExistingServer: true, timeout: 90000 },
});
