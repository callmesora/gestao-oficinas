import { defineConfig } from "@playwright/test";

// Report fixtures own ephemeral API/Vite/PG endpoints. No shared demo or development
// web server is started/reused; the reserved base is only for tests without a fixture.
export default defineConfig({
  testDir: ".", testMatch: ["verification-reports.flows.spec.ts", "report-filters.flows.spec.ts"], workers: 1,
  outputDir: "../analysis-local/verification-reports-browser",
  use: { baseURL: "http://127.0.0.1:1465", channel: "chrome", viewport: { width: 1024, height: 768 },
    launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } },
});
