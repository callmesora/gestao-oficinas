import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { createBusinessApp } from "../business-app";
import { readServiceConfiguration, ServiceConfigurationError } from "../configuration";
import { createReportRenderer } from "./renderer";
import { createApp } from "../app";
import type { FamilyReportRequest, OrderReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, databaseUrl: string;
const company = "  OFICINA AÇÃO & FILHOS <Lda>  ", renderer = createReportRenderer();
const context = { company: "", dateText: "25/10/2026" };
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database();
  const url = new URL(`postgresql://127.0.0.1:${database.port}/${database.database}`); url.username = database.user!; url.password = database.password!; databaseUrl = url.href;
}, 60_000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60_000);
function pdfText(base64: string): string {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps(' '.join(p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages)))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`Report ${result.kind}`);
  return result;
}
function header(html: string) { return /data-control="STC_Empresa"[^>]*>([^<]*)<\/div>/.exec(html)?.[1]; }
const emptyOrders: OrderReportRequest = { reportId: "RPT_Ordens_Reparacao", context, source: { kind: "window-table", window: "WIN_Ordens_Reparacao", table: "TABLE_QRY_select_ordens_reparacao", rows: [], filter: { entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "", priority: 0, mechanic: 0, customer: "", registration: "", states: [], sort: "numero", descending: true } } };

it("configured report company preserves exact text/intentional blank and refuses invalid host configuration without leaking it", async () => {
  const base = { WORKSHOP_DATABASE_URL: databaseUrl };
  expect((await readServiceConfiguration(base)).reportCompany).toBeUndefined();
  expect((await readServiceConfiguration({ ...base, WORKSHOP_REPORT_COMPANY: company })).reportCompany).toBe(company);
  expect((await readServiceConfiguration({ ...base, WORKSHOP_REPORT_COMPANY: "" })).reportCompany).toBe("");
  for (const value of ["PRIVATE\0VALUE", "PRIVATE\ud800VALUE", "PRIVATE\udfffVALUE", "AÇÃO".repeat(1500)]) {
    const result = await readServiceConfiguration({ ...base, WORKSHOP_REPORT_COMPANY: value }).catch(error => error);
    expect(result).toBeInstanceOf(ServiceConfigurationError);
    expect(result).toMatchObject({ code: "report_company_invalid", message: "Workshop service configuration: report_company_invalid" });
  }
});

it("ordinary authenticated list, live-table and programmatic reports inherit the configured project company across service restart", async () => {
  const configuration = { ...await readServiceConfiguration({ WORKSHOP_DATABASE_URL: databaseUrl, WORKSHOP_REPORT_COMPANY: company }), setupToken: "c".repeat(64) };
  let app = await createBusinessApp(configuration, renderer);
  try {
    const enrolled = await app.inject({ method: "POST", url: "/api/auth/enroll", payload: { code: 1, password: "Company42", token: configuration.setupToken } });
    expect(enrolled.json().kind).toBe("continuar"); const headers = { Authorization: `Bearer ${enrolled.json().session.token}` };
    await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (861,\'NORMAL CLIENTE\'); INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","recepcao_servico") VALUES (10,\'AA\',861,\'SERVIÇO NORMAL\')');
    const requests: (OrderReportRequest | FamilyReportRequest)[] = [
      { reportId: "RPT_List_Clientes", context, source: { kind: "embedded-query" } },
      emptyOrders,
      { reportId: "RPT_Servico_Avaria", context, source: { kind: "programmatic", orderNumber: "10" } },
    ];
    for (let launch = 0; launch < 2; launch++) {
      if (launch) { await app.close(); app = await createBusinessApp(configuration, renderer); }
      for (const request of requests) {
        const original = structuredClone(request), response = await app.inject({ method: "POST", url: "/api/reports/render", headers, payload: request });
        expect(response.statusCode).toBe(200); expect(response.headers["cache-control"]).toBe("no-store");
        const result = rendered(response.json<ReportRenderResult>());
        expect(header(result.html)).toBe("  OFICINA AÇÃO &amp; FILHOS &lt;Lda&gt;  ");
        expect(result.html).not.toContain("<Lda>"); expect(pdfText(result.pdfBase64)).toContain("OFICINA AÇÃO & FILHOS <Lda>");
        expect(result.html).toContain(context.dateText); expect(request).toEqual(original);
      }
    }
    // Configured project state wins over a forged/old caller caption.
    const overridden = rendered((await app.inject({ method: "POST", url: "/api/reports/render", headers, payload: { ...emptyOrders, context: { ...context, company: "CALLER CAPTION" } } })).json());
    expect(header(overridden.html)).toContain("OFICINA AÇÃO"); expect(overridden.html).not.toContain("CALLER CAPTION");
    expect((await database.query('SELECT "Descricao" FROM app."Clientes" WHERE "Codigo"=861')).rows).toEqual([{ Descricao: "NORMAL CLIENTE" }]);
  } finally { await app.close(); }
}, 120_000);

it("omitted company preserves caller context while explicitly configured blank overrides it, with no replacement live-table read", async () => {
  for (const reportCompany of [undefined, ""]) {
    let reads = 0;
    const app = createApp({ reportCompany, reportConnect: async () => { reads++; throw new Error("No replacement query"); }, reportRenderer: renderer, authenticate: async () => ({ userId: "synthetic-company" }) });
    try {
      const input = { ...emptyOrders, context: { ...context, company: "CALLER COMPANY" } };
      const result = rendered((await app.inject({ method: "POST", url: "/api/reports/render", payload: input })).json());
      expect(header(result.html)).toBe(reportCompany === undefined ? "CALLER COMPANY" : ""); expect(reads).toBe(0); expect(input.context.company).toBe("CALLER COMPANY");
    } finally { await app.close(); }
  }
}, 60_000);
