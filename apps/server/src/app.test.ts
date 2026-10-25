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

it("ADR-004 protects every repair form operation before database access and reports unavailable persistence honestly", async () => {
  const anonymous = createApp(), authenticated = createApp({ authenticate: async () => ({ userId: "synthetic-auth-boundary" }) });
  try {
    for (const action of ["form-initialise", "resolve-vehicle", "lookup-customer", "check-vehicle-change", "check-state-change", "prepare-save", "save", "delete"]) {
      const denied = await anonymous.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} });
      expect(denied.statusCode).toBe(401); expect(denied.json()).toEqual({ kind: "unauthenticated" });
      const unavailable = await authenticated.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} });
      expect(unavailable.statusCode).toBe(503); expect(unavailable.json()).toEqual({ kind: "unavailable" });
    }
  } finally { await anonymous.close(); await authenticated.close(); }
});
