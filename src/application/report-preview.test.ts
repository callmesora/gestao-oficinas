import { expect, it } from "vitest";
import { createReportPreviewSession, type ReportPreviewState } from "./report-preview";
import type { ReportRequest, ReportRenderResult } from "../../packages/domain/src/reports";

const request: ReportRequest = { reportId: "RPT_List_Clientes", context: { company: "CALLER  ", dateText: "25/10/2026" }, source: { kind: "embedded-query" } };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; }

it("report runtime U-02/03 cancellation resolves its caller immediately, freezes inputs and discards a late service result", async () => {
  const pending = deferred<ReportRenderResult>(), states: ReportPreviewState[] = [], inputs: ReportRequest[] = [];
  const session = createReportPreviewSession(async () => async input => { inputs.push(input); return pending.promise; }, state => states.push(state));
  const input = structuredClone(request), running = session.preview(input); input.context.company = "CHANGED AFTER CLICK";
  await Promise.resolve(); expect(inputs[0].context.company).toBe("CALLER  ");
  session.cancel(); await running;
  expect(states.at(-1)).toEqual({ busy: false, result: null });
  pending.resolve({ kind: "unavailable" }); await Promise.resolve(); await Promise.resolve();
  expect(states).toEqual([{ busy: true, result: null }, { busy: false, result: null }]);
});

it("report runtime U-02 cancellation while transport initializes prevents dispatch and detached failures cannot replace the next preview", async () => {
  const loading = deferred<(request: ReportRequest) => Promise<ReportRenderResult>>(), states: ReportPreviewState[] = [];
  let calls = 0, attempts = 0;
  const session = createReportPreviewSession(async () => ++attempts === 1 ? loading.promise : async () => ({ kind: "invalid" }), state => states.push(state));
  const first = session.preview(request); session.cancel(); await first;
  await session.preview(request);
  loading.resolve(async () => { calls++; throw new Error("Late failure"); }); await Promise.resolve(); await Promise.resolve();
  expect(calls).toBe(0); expect(states.at(-1)).toEqual({ busy: false, result: { kind: "invalid" } });
});

it("report runtime U-02 transport failure clears busy and abandon suppresses all detached updates", async () => {
  const states: ReportPreviewState[] = [], pending = deferred<ReportRenderResult>();
  const session = createReportPreviewSession(async () => async () => { throw new Error("private transport detail"); }, state => states.push(state));
  await session.preview(request); expect(states.at(-1)).toEqual({ busy: false, result: { kind: "failed" } });
  const detached = createReportPreviewSession(async () => async () => pending.promise, state => states.push(state));
  const running = detached.preview(request); await Promise.resolve(); detached.abandon(); await running;
  const count = states.length; pending.resolve({ kind: "failed" }); await Promise.resolve(); await Promise.resolve(); expect(states).toHaveLength(count);
});
