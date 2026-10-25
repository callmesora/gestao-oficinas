import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { chromium, type Browser } from "playwright-core";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { renderReport } from "../operations/reports";
import { createReportRenderer } from "./renderer";
import type { FamilyReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection, browser: Browser;
const renderer = createReportRenderer();
const context = { company: "OFICINA TEXTO AÇÃO", dateText: "25/10/2026" };
const lines = (prefix: string, count: number) => Array.from({ length: count }, (_, index) => `${prefix} ${String(index + 1).padStart(2, "0")} AÇÃO`).join("\r\n");
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
  browser = await chromium.launch({ channel: "chrome", headless: true });
}, 60_000);
afterAll(async () => { await browser?.close(); await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Clientes",app."Viaturas",app."ordem_reparacao",app."material_reparacao" RESTART IDENTITY');
});
async function seed(service: string | null, observation: string | null, customer: string | null, contacts: string | null) {
  await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (2,$1)', [customer]);
  await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES (\'AA\',99,\'MARCA\',\'MODELO\')');
  await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","recepcao_servico","recepcao_obs","recepacao_contatos") VALUES (9007199254740993,\'AA\',2,$1,$2,$3)', [service, observation, contacts]);
}
async function render(reportId: FamilyReportRequest["reportId"], source: FamilyReportRequest["source"]) {
  return renderReport(connect, renderer, { reportId, context, source });
}
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`Report ${result.kind}`);
  return result;
}
function pdfPages(base64: string): string[] {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps([p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages]))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
function firstCompanyTop(base64: string): number {
  const script = `import sys,io,json
from pypdf import PdfReader
p=PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages[0]; positions=[]
def visit(text,cm,tm,font,size):
 if 'OFICINA TEXTO AÇÃO' in text:
  y=tm[4]*cm[1]+tm[5]*cm[3]+cm[5]
  positions.append((float(p.mediabox.height)-y)*25.4/72)
p.extract_text(visitor_text=visit)
print(json.dumps(positions[0]))`;
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", script], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
type Box = { top: number; bottom: number; height: number; page: number; text: string };
async function boxes(html: string): Promise<Record<string, Box[]>> {
  const page = await browser.newPage();
  try {
    await page.route("**/*", route => route.abort());
    await page.setContent(html); await page.evaluate(() => document.fonts.ready);
    return await page.evaluate(() => {
      const output: Record<string, { top: number; bottom: number; height: number; page: number; text: string }[]> = {};
      for (const control of document.querySelectorAll<HTMLElement>(".pagedjs_page [data-control]")) {
        const rect = control.getBoundingClientRect(), name = control.dataset.control!;
        (output[name] ??= []).push({ top: rect.top, bottom: rect.bottom, height: rect.height, page: Number(control.closest<HTMLElement>(".pagedjs_page")!.dataset.pageNumber), text: control.textContent ?? "" });
      }
      return output;
    });
  } finally { await page.close(); }
}
function before(first: Box, second: Box) {
  expect(first.page).toBeLessThanOrEqual(second.page);
  if (first.page === second.page) expect(first.bottom).toBeLessThanOrEqual(second.top + 0.5);
}

it("service source auto-height text grows before subsequent fields, preserving every line in the actual offline PDF", async () => {
  const service = lines("SERVIÇO", 9), observation = lines("OBSERVAÇÃO", 5), customer = lines("CLIENTE", 3), contacts = lines("CONTACTO", 3);
  await seed(service, observation, customer, contacts);
  const result = rendered(await render("RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "9007199254740993" }));
  const controls = await boxes(result.html), pdf = pdfPages(result.pdfBase64).join("\n");
  before(controls.ITEM_Servico_Avaria[0], controls["STC_Observação"][0]);
  before(controls.ITEM_Observacao[0], controls.STC_Cliente[0]);
  before(controls.ITEM_Cliente[0], controls.STC_Contactos_do_cliente[0]);
  before(controls.ITEM_Contactos[0], controls.PoweredWx1[0]);
  for (const value of [service, observation, customer, contacts]) for (const line of value.split("\r\n")) expect(pdf).toContain(line);
  expect(controls.ITEM_marca_modelo[0].text).toBe("MARCA  MODELO");
  expect(firstCompanyTop(result.pdfBase64)).toBeGreaterThanOrEqual(20);
  expect(firstCompanyTop(result.pdfBase64)).toBeLessThan(25);
  expect(result.unresolved).toContain("U-R23-01"); expect(result.unresolved).toContain("U-R23-02");
  await writeFile("analysis-local/report-long-service.html", result.html);
  await writeFile("analysis-local/report-long-service.pdf", Buffer.from(result.pdfBase64, "base64"));
}, 60_000);

it("material source information and caller total grow outside the live rows with physical repeated headers and no recalculation", async () => {
  await seed("SERVICE", "OBS", lines("CLIENTE", 5), "CONTACT");
  await database.query('INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade") VALUES (9007199254740993,\'DB\',\'UNRELATED DATABASE ROW\',99)');
  const total = lines("TOTAL DO CHAMADOR", 8), rows = Array.from({ length: 70 }, (_, index) => ({ COL_cod_art: `LIVE${String(index).padStart(3, "0")}`, COL_desc_artigo: `AÇÃO ${index}`, COL_quant: "0.123456789", COL_preco: "999", COL_lancado: "1" }));
  const result = rendered(await render("RPT_Materiais", { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "9007199254740993", formattedTotal: total, rows }));
  const controls = await boxes(result.html), pages = pdfPages(result.pdfBase64);
  before(controls.STC_informacao[0], controls.ITEM_COL_cod_art[0]);
  before(controls.ITEM_COL_cod_art.at(-1)!, controls.STC_Total_material[0]);
  before(controls.STC_Total_material[0], controls.COUNTER[0]);
  expect(controls.ITEM_COL_cod_art.map(control => control.text)).toEqual(rows.map(row => row.COL_cod_art));
  expect(controls.STC_Total_material.map(control => control.text)).toEqual([total.replaceAll("\r\n", "\n")]);
  expect(result.html).not.toContain("UNRELATED DATABASE ROW");
  expect(pages).toHaveLength(result.pageCount); expect(pages.length).toBeGreaterThan(1);
  for (const row of rows) expect(pages.join("\n")).toContain(row.COL_cod_art);
  for (const line of total.split("\r\n")) expect(pages.join("\n")).toContain(line);
  for (const [index, page] of pages.entries()) { expect(page).toContain("Artigo"); expect(page).toContain(`${index + 1}/${pages.length}`); }
  expect(result.unresolved).toContain("U-R19-01");
  await writeFile("analysis-local/report-long-materials.html", result.html);
  await writeFile("analysis-local/report-long-materials.pdf", Buffer.from(result.pdfBase64, "base64"));
}, 60_000);

it("short, empty and NULL service assignments retain source minimum heights and fixed controls", async () => {
  await seed(null, "", null, "SHORT");
  const result = rendered(await render("RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "9007199254740993" })), controls = await boxes(result.html);
  for (const [name, minimum] of [["ITEM_Servico_Avaria", 6.625], ["ITEM_Observacao", 6.625], ["ITEM_Cliente", 6.879], ["ITEM_Contactos", 6.614]] as const) expect(controls[name][0].height).toBeGreaterThanOrEqual(minimum * 96 / 25.4 - 0.1);
  expect(controls.ITEM_Servico_Avaria[0].text).toBe(""); expect(controls.ITEM_Observacao[0].text).toBe(""); expect(controls.ITEM_Cliente[0].text).toBe("");
  expect(controls.ITEM_matricula[0].height).toBeCloseTo(6.879 * 96 / 25.4, 0);
  for (const [name, sourceY] of [["ITEM_Servico_Avaria", 28.098], ["ITEM_Observacao", 45.825], ["ITEM_Cliente", 56.356], ["ITEM_Contactos", 74.390]] as const) expect(controls[name][0].top - controls.ITEM_matricula[0].top).toBeCloseTo(sourceY * 96 / 25.4, 0);
  const unchanged = await database.query('SELECT "recepcao_servico","recepcao_obs" FROM app."ordem_reparacao"');
  expect(unchanged.rows).toEqual([{ recepcao_servico: null, recepcao_obs: "" }]);
}, 60_000);

it("an indivisible service block that exceeds the actual A5 printable page is unresolved without a clipped PDF", async () => {
  await seed(lines("SERVIÇO INTEIRO", 90), "OBS", "CLIENTE", "CONTACT");
  expect(await render("RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "9007199254740993" })).toEqual({ kind: "unresolved", unresolved: ["U-R23-01: indivisible report content exceeds the printable page"] });
}, 60_000);

it("an indivisible material information block that exceeds the actual A5 printable page is unresolved", async () => {
  await seed("SERVICE", "OBS", lines("CLIENTE INTEIRO", 90), "CONTACT");
  expect(await render("RPT_Materiais", { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "9007199254740993", formattedTotal: "TOTAL", rows: [] })).toEqual({ kind: "unresolved", unresolved: ["U-R19-01: indivisible report content exceeds the printable page"] });
}, 60_000);

it("the material caller total marked Divisible=True flows across physical pages before the final count", async () => {
  await seed("SERVICE", "OBS", "CLIENTE", "CONTACT");
  const total = lines("TOTAL DIVISÍVEL", 100);
  const result = rendered(await render("RPT_Materiais", { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "9007199254740993", formattedTotal: total, rows: [] }));
  await writeFile("analysis-local/report-divisible-material-total.html", result.html);
  await writeFile("analysis-local/report-divisible-material-total.pdf", Buffer.from(result.pdfBase64, "base64"));
  const pages = pdfPages(result.pdfBase64), controls = await boxes(result.html);
  expect(pages).toHaveLength(result.pageCount); expect(pages.length).toBeGreaterThan(1);
  for (const line of total.split("\r\n")) expect(pages.join("\n")).toContain(line);
  for (const [index, page] of pages.entries()) { expect(page).toContain("Artigo"); expect(page).toContain(`${index + 1}/${pages.length}`); }
  before(controls.STC_Total_material.at(-1)!, controls.COUNTER[0]);
  expect(controls.COUNTER[0].text).toBe("0");
  expect(pages.at(-1)).toContain("Golfinho Software, Lda");
}, 60_000);
