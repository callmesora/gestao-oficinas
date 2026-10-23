import { expect, it } from "vitest";
import { createApp } from "./app";

it("foundation API reports process liveness without claiming database readiness", async () => {
  const app = createApp();
  try {
    const result = await app.inject({ method: "GET", url: "/health/live" });
    expect(result.statusCode).toBe(200);
    expect(result.json()).toEqual({ service: "gestao-oficinas-api", status: "alive" });
    const missing = await app.inject({ method: "GET", url: "/customers" });
    expect(missing.statusCode).toBe(404);
  } finally { await app.close(); }
});
