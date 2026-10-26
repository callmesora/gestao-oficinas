import type { ReportRequest, ReportRenderResult } from "../../packages/domain/src/reports";

export type RenderReport = (request: ReportRequest) => Promise<ReportRenderResult>;
export type ReportPreviewState = { result: ReportRenderResult | null; busy: boolean };

/** ADR005 reversible cancellation default: abandon this UI generation only.
 * The service owns its rendering process; no shared job/global cancellation is implied.
 * Capture caller inputs before awaiting transport, and resolve the caller immediately
 * on cancellation so its own filter/dialog can become interactive again.
 */
export function createReportPreviewSession(load: () => Promise<RenderReport>, publish: (state: ReportPreviewState) => void) {
  let generation = 0, release: (() => void) | undefined;
  const abandon = () => { generation++; release?.(); release = undefined; };
  return {
    abandon,
    cancel() { abandon(); publish({ result: null, busy: false }); },
    async preview(input: ReportRequest) {
      abandon(); const current = generation, snapshot = structuredClone(input);
      const cancelled = new Promise<null>(resolve => { release = () => resolve(null); });
      publish({ result: null, busy: true });
      const render = async () => {
        try {
          const renderer = await load();
          return generation === current ? await renderer(snapshot) : null;
        } catch { return { kind: "failed" } as const; }
      };
      const result = await Promise.race([render(), cancelled]);
      if (generation === current) { release = undefined; publish({ result, busy: false }); }
    },
  };
}
