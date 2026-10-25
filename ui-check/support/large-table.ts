import { test as base, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";

export const test = base.extend<object, { largeTableOrigin: string }>({
  largeTableOrigin: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Installed Chromium required");
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const cache = await mkdtemp(resolve(root, "analysis-local/large-table-vite-"));
    const server = await createServer({ root, cacheDir: cache, logLevel: "error", server: { host: "127.0.0.1", port: 0, strictPort: false },
      plugins: [{ name: "synthetic-large-table-entry", configureServer(instance) {
        instance.middlewares.use((request, response, next) => {
          if (request.url?.split("?")[0] !== "/large-table") { next(); return; }
          response.setHeader("content-type", "text/html; charset=utf-8");
          void instance.transformIndexHtml("/large-table", '<!doctype html><html><head><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module" src="/ui-check/support/large-table.fixture.tsx"></script></body></html>')
            .then(html => response.end(html)).catch(error => { response.statusCode = 500; response.end(String(error)); });
        });
      } }],
    });
    try {
      await server.listen();
      const address = server.httpServer!.address();
      if (!address || typeof address === "string") throw new Error("Missing isolated browser fixture address");
      await use(`http://127.0.0.1:${address.port}`);
    } finally { await server.close(); await rm(cache, { recursive: true }); }
  }, { scope: "worker" }],
});
export { expect };
