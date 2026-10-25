import { afterEach, expect, it, vi } from "vitest";
import { clearBusinessSession, configureBusinessTransport, isolatedWorkflowPost, setBusinessSession, validatedApiBase } from "./workflow-http";
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
it("ADR004 API configuration accepts only exact HTTPS/loopback origins and rejects embedded credentials or paths", () => {
  expect(validatedApiBase("")).toBe(""); expect(validatedApiBase("http://127.0.0.1:3210")).toBe("http://127.0.0.1:3210"); expect(validatedApiBase("https://service.example")).toBe("https://service.example");
  for (const value of ["http://remote.example", "https://user:secret@remote.example", "https://remote.example/api", "https://remote.example/?x=1", "https://remote.example/#token", "javascript:alert(1)"]) expect(() => validatedApiBase(value)).toThrow("Invalid workshop API configuration");
});
it("ADR004 actual workflow posts require RAM token and take the current token on every request;401 clears only that session", async () => {
  const fetch_ = vi.fn().mockResolvedValue(new Response('{"kind":"loaded"}')); vi.stubGlobal("fetch", fetch_); const dispatchEvent = vi.fn(); vi.stubGlobal("window", { dispatchEvent });
  configureBusinessTransport("https://service.example"); const post = await isolatedWorkflowPost("reports", "Failed"); await expect(post("render", {})).rejects.toThrow("session required"); expect(fetch_).not.toHaveBeenCalled();
  setBusinessSession("a".repeat(64)); await post("render", { report: "synthetic" }); expect(fetch_).toHaveBeenLastCalledWith("https://service.example/api/reports/render", expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${"a".repeat(64)}` }) }));
  setBusinessSession("b".repeat(64)); fetch_.mockResolvedValueOnce(new Response('{"kind":"unauthenticated"}', { status: 401 })); await expect(post("render", {})).rejects.toThrow("Failed"); expect(dispatchEvent).toHaveBeenCalledTimes(1); await expect(post("render", {})).rejects.toThrow("session required");
  clearBusinessSession();
});
it("ADR009 explicit isolated mode retains its actual development handshake", async () => {
  const isolated = await import(`./workflow-http`); const fetch_ = vi.fn().mockResolvedValueOnce(new Response('{"token":"synthetic-dev"}')).mockResolvedValueOnce(new Response('{"kind":"loaded"}')); vi.stubGlobal("fetch", fetch_);
  const post = await isolated.isolatedWorkflowPost("report-filters", "Failed"); await post("states", {}); expect(fetch_.mock.calls[0][0]).toBe("/api/development/session"); expect(fetch_.mock.calls[1][1].headers.Authorization).toBe("Bearer synthetic-dev");
});
