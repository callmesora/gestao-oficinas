import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { StockReadResult } from "../packages/domain/src/stock";
import type { Terminal } from "../packages/domain/src/terminals";
import type { Posto } from "../packages/domain/src/postos";

type Result = { kind: string; id: string; rows: { id: string }[]; documentTypes: { Codigo: string }[]; documentType: { id: string }; mechanics: { Codigo: number }[]; mechanic: { id: string }; terminals: Terminal[]; terminal: Terminal; postos: Posto[]; posto: Posto };
async function apiFor(request: APIRequestContext) {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } }); expect(session.ok()).toBe(true);
  const { token } = await session.json();
  return async (resource: string, action: string, data: unknown): Promise<Result> => {
    const response = await request.post(`/api/${resource}/${action}`, { headers: { Authorization: `Bearer ${token}` }, data }); expect(response.ok()).toBe(true); return response.json();
  };
}
type Api = Awaited<ReturnType<typeof apiFor>>;
async function scannerFixture(api: Api) {
  const existing = await api("terminals", "list", {}), used = new Set(existing.terminals.map(row => row.Codigo));
  const code = Array.from({ length: 1296 }, (_, index) => `P${index.toString(36).padStart(2, "0")}`).find(value => !used.has(value))!;
  const terminal = await api("terminals", "save", { mode: "create", values: { Codigo: code, Descricao: "Proof scanner", codbarras_inicio: 1, codbarras_fim: 8, quant_inicio: 9, quant_fim: 5, pasta_localizacao: "", nome_ficheiro: "proof.txt" } }); expect(terminal.kind).toBe("saved");
  const posts = await api("postos", "list", {}), original = posts.postos.find(row => row.Codigo === 1);
  const posto = await api("postos", "save", { mode: original ? "update" : "create", ...(original ? { id: original.id } : {}), values: { Codigo: 1, Descricao: "Proof scanner", terminal: code } }); expect(posto.kind).toBe("saved");
  return async () => {
    if (original) await api("postos", "save", { mode: "update", id: original.id, values: { Codigo: original.Codigo, Descricao: original.Descricao, terminal: original.terminal } });
    else await api("postos", "delete", { id: posto.posto.id });
    await api("terminals", "delete", { id: terminal.terminal.id });
  };
}
async function scanner(page: Page, unknown: boolean) {
  await page.goto("/?workflow=stock-scanner");
  await page.getByTestId("stock-scanner-file").setInputFiles({ name: "proof.txt", mimeType: "text/plain", buffer: Buffer.from("UNKNOWN 2.125\r\nUNKNOWN 0.125\r\n\r\nignored 9.999") });
  const reader = page.getByTestId("WIN_Leitor_cod_barras"); await expect(reader.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(2);
  if (unknown) { await reader.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("WIN_Leitor_cod_barras_desconhecidos")).toBeVisible(); }
}
const modalCases = [
  { unit: "WIN_Extrato_Artigos", route: "stock-statement", launch: "stock-statement-open", restore: "stock-statement-restore", width: 370, height: 262, focus: "EDT_Do_artigo", draft: "Proof Ω", title: "Extrato de Artigos" },
  { unit: "WIN_Inventario", route: "inventory", launch: "inventory-open", restore: "stock-inventory-restore", width: 634, height: 530, focus: "TABLE_Artigos", title: "Inventário" },
  { unit: "WIN_Inventario_Reconstrucao", route: "inventory", launch: "inventory-open", restore: "WIN_Inventario_Reconstrucao-restore", width: 318, height: 192, focus: "BTN_Reconstruir1", title: "Reconstrução de Stocks" },
  { unit: "WIN_Reconstrucao_Stocks", route: "stock-rebuild", launch: "stock-rebuild-open", restore: "WIN_Reconstrucao_Stocks-restore", width: 285, height: 173, focus: "BTN_Reconstruir", title: "Reconstrução de Stocks" },
  { unit: "WIN_Table_Lin_Stocks", route: "stock", launch: "stock-open", restore: "stock-document-restore", width: 800, height: 600, focus: "EDT_descricao", draft: "Unsaved proof Ω", title: "Movimentos de Stocks" },
  { unit: "WIN_Leitor_cod_barras", route: "stock-scanner", restore: "stock-scanner-restore", width: 388, height: 600, focus: "TABLE_Leitura", title: "Códigos de barras" },
  { unit: "WIN_Leitor_cod_barras_desconhecidos", route: "stock-scanner", restore: "stock-scanner-unknown-restore", width: 388, height: 600, focus: "TABLE_Leitura", title: "Códigos de barras" },
] as const;
async function frameBounds(screen: Locator) { const box = await screen.locator(".wd-frame").boundingBox(); expect(box).not.toBeNull(); return box!; }
for (const item of modalCases) test(`stock proof ${item.unit} actual minimize maximize restore and close preserve live state and normal geometry`, async ({ page, request }) => {
  const api = await apiFor(request), cleanup = item.route === "stock-scanner" ? await scannerFixture(api) : async () => {};
  try {
    if (item.route === "stock-scanner") await scanner(page, item.unit.endsWith("desconhecidos"));
    else {
      await page.goto(`/?workflow=${item.route}`); await page.getByTestId(item.launch).click();
      if (item.unit === "WIN_Inventario") await page.getByTestId("WIN_Inventario_Reconstrucao").getByTestId("BTN_Reconstruir1").click();
      if (item.unit === "WIN_Table_Lin_Stocks") await page.getByTestId("WIN_Table_cab_stocks").getByTestId("BTN_novo").click();
    }
    const screen = page.getByTestId(item.unit); await expect(screen).toBeVisible();
    await designerProperties(screen.locator(".wd-frame"), item.unit, item.title);
    const original = await frameBounds(screen); expect(original.width).toBe(item.width); expect(original.height).toBe(item.height);
    await expect(screen.getByTestId("RADTitle")).toHaveText(item.title);
    const content = screen.getByTestId(item.focus); if ("draft" in item) await content.fill(item.draft); await content.focus();
    const tableBefore = item.focus.startsWith("TABLE") ? await content.innerText() : null;
    for (const [name, width] of [["BTN_SYST_MINIMIZE", 26], ["BTN_Syst_Maximize", 25], ["BTN_SYST_FERMER", 44]] as const) {
      const button = screen.getByTestId(name); await expect(button).toBeVisible(); await expect(button).toHaveAttribute("tabindex", "-1");
      const box = await button.boundingBox(); expect(box!.width).toBe(width); expect(box!.height).toBe(19);
      await expect(button.locator(".wd-button-icon")).toHaveCount(1);
    }
    await expect(screen.getByTestId("BTN_UMC")).toBeHidden();
    await screen.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(screen.locator(".wd-frame")).toBeHidden();
    await screen.getByTestId(item.restore).click(); await expect(content).toBeFocused(); expect(await frameBounds(screen)).toEqual(original);
    if ("draft" in item) await expect(content).toHaveValue(item.draft);
    if (tableBefore !== null) expect(await content.innerText()).toBe(tableBefore);
    await screen.getByTestId("BTN_Syst_Maximize").click(); const maximum = await frameBounds(screen);
    await designerProperties(screen.locator(".wd-frame"), item.unit, item.title, { width: maximum.width - original.width, height: maximum.height - original.height });
    expect(maximum.width).toBe(984); expect(maximum.height).toBe(728); expect(maximum.x).toBe(20); expect(maximum.y).toBe(20);
    await expect(screen.getByTestId("RADTitle")).toHaveText(item.title); await expect(screen.getByTestId("BTN_SYST_FERMER")).toBeVisible();
    await screen.getByTestId("BTN_Syst_Maximize").click(); expect(await frameBounds(screen)).toEqual(original);
    if ("draft" in item) await expect(content).toHaveValue(item.draft);
    await screen.getByTestId("BTN_SYST_FERMER").click();
    if (item.unit === "WIN_Table_Lin_Stocks") await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click();
    await expect(screen).toHaveCount(0);
    const saved = await page.evaluate(name => JSON.parse(localStorage.getItem(`gestao-oficinas:window-geometry:v1:${name}`)!), item.unit);
    expect(saved).toMatchObject({ width: original.width, height: original.height, x: original.x, y: original.y, maximized: false });
    if (item.unit === "WIN_Inventario_Reconstrucao") await expect(page.getByTestId("WIN_Inventario")).toBeVisible();
    else if (item.unit === "WIN_Table_Lin_Stocks") await expect(page.getByTestId("WIN_Table_cab_stocks").getByTestId("BTN_novo")).toBeEnabled();
    else if (item.unit === "WIN_Leitor_cod_barras") await expect(page.getByTestId("stock-scanner-returned")).toHaveCount(0);
    else if (item.unit.endsWith("desconhecidos")) { await expect(page.getByTestId("stock-scanner-returned")).toContainText('"unknown":[{"barcode":"UNKNOWN","quantity":"2.125"}'); }
    else if ("launch" in item) await expect(page.getByTestId(item.launch)).toBeEnabled();
  } finally { await cleanup(); }
});

for (const action of ["enter", "escape", "chrome"] as const) test(`stock proof ${action} safely dismisses actual cancel and line-delete resources without losing the draft`, async ({ page, request }) => {
  const api = await apiFor(request); const docs = await api("document-types", "list", {}), used = new Set(docs.documentTypes.map(row => row.Codigo));
  const code = Array.from({ length: 1296 }, (_, index) => `P${index.toString(36).padStart(2, "0")}`).find(value => !used.has(value))!;
  const doc = await api("document-types", "save", { mode: "create", values: { Codigo: code, Descricao: "Proof safe dismissal", stock: 1, obriga_macanico: false } }); expect(doc.kind).toBe("saved");
  const created = await api("stock", "save", { mode: "create", document: code, number: "1", description: "Saved source header", date: "20261026", mechanic: null,
    lines: [{ linha: "1", artigo: "orphan-proof", descricao_artigo: "Original line", quantidade: "2.125", preco: "3.25" }] }); expect(created.kind).toBe("saved");
  try {
    await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click(); const list = page.getByTestId("WIN_Table_cab_stocks");
    await list.getByTestId("COMBO_tipo_doc").selectOption(code); await list.getByTestId("TABLE_cab_stocks").locator("tbody tr").first().dblclick();
    const screen = page.getByTestId("WIN_Table_Lin_Stocks"); await screen.getByTestId("EDT_descricao").fill("Retain unsaved Ω"); await screen.getByTestId("COL_Quant-0").fill("7,125");
    for (const button of ["BTN_Cancelar", "BTN_Adicionar1"] as const) {
      if (button === "BTN_Adicionar1") await screen.getByTestId("TABLE_lin_Stocks").locator("tbody tr").first().click();
      await screen.getByTestId(button).click(); const resource = page.getByTestId("WINDEVDIALOGBOX");
      await expect(resource.getByRole("button", { name: "Não", exact: true })).toBeFocused();
      await expect(resource.getByTestId("LIB_INFO")).toHaveText(button === "BTN_Cancelar" ? "Confirma o cancelamento das alterações?" : "Confirma a eliminação da linha?");
      if (action === "enter") await page.keyboard.press("Enter"); else if (action === "escape") await page.keyboard.press("Escape"); else await resource.getByTestId("BTN_SYST_FERMER").click();
      await expect(resource).toHaveCount(0); await expect(screen.getByTestId("EDT_descricao")).toHaveValue("Retain unsaved Ω"); await expect(screen.getByTestId("COL_Quant-0")).toHaveValue("7,125");
    }
    await screen.getByTestId("BTN_Confirmar").click(); await expect(screen).toHaveCount(0);
    const read = await api("stock", "read", { id: created.id }) as unknown as Extract<StockReadResult, { kind: "loaded" }>;
    expect(read.header.Descricao).toBe("Retain unsaved Ω"); expect(read.lines[0].quantidade).toBe("7.125");
  } finally { await api("stock", "delete", { id: created.id }); await api("document-types", "delete", { id: doc.documentType.id }); }
});

test("stock proof modify restores the original nondefault mechanic and disables document date plus picker", async ({ page, request }) => {
  const api = await apiFor(request), docs = await api("document-types", "list", {}), used = new Set(docs.documentTypes.map(row => row.Codigo));
  const code = Array.from({ length: 1296 }, (_, index) => `P${index.toString(36).padStart(2, "0")}`).find(value => !used.has(value))!;
  const doc = await api("document-types", "save", { mode: "create", values: { Codigo: code, Descricao: "Proof mechanic document", stock: 2, obriga_macanico: true } });
  const mechanics = await api("mechanics", "list", {}), mechanicCode = Array.from({ length: 255 }, (_, index) => 255 - index).find(value => !mechanics.mechanics.some(row => row.Codigo === value))!;
  const mechanic = await api("mechanics", "save", { mode: "create", values: { Codigo: mechanicCode, Descricao: "Proof original mechanic", palavra_passe: "Synthetic", inativo: false } }); expect(mechanic.kind).toBe("saved");
  const created = await api("stock", "save", { mode: "create", document: code, number: "7", description: "Original header Ω  ", date: "20240229", mechanic: String(mechanicCode), lines: [{ linha: "9", artigo: "orphan-proof", descricao_artigo: null, quantidade: "-1.125", preco: null }] }); expect(created.kind).toBe("saved");
  try {
    await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click(); const list = page.getByTestId("WIN_Table_cab_stocks");
    await list.getByTestId("COMBO_tipo_doc").selectOption(code);
    await list.getByTestId("TABLE_cab_stocks").locator("tbody tr").first().dblclick(); const form = page.getByTestId("WIN_Table_Lin_Stocks");
    await expect(form.getByTestId("EDT_Numero")).toHaveValue("7"); await expect(form.getByTestId("EDT_Numero")).toHaveAttribute("readonly", "");
    await expect(form.getByTestId("EDT_Data")).toHaveValue("29/02/2024"); await expect(form.getByTestId("EDT_Data")).toBeDisabled();
    await expect(form.getByTestId("COMBO_tipo_doc")).toBeDisabled(); await expect(form.getByTestId("BTN_VISION")).toBeDisabled();
    await expect(form.getByTestId("COMBO_mecanico")).toHaveValue(String(mechanicCode)); await expect(form.getByTestId("COMBO_mecanico")).toBeEnabled();
    await expect(form.getByTestId("EDT_descricao")).toHaveValue("Original header Ω  "); await expect(form.getByTestId("COL_Quant-0")).toHaveValue("-1,125");
    await form.getByTestId("BTN_SYST_FERMER").click(); await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click(); await expect(form).toHaveCount(0);
  } finally { await api("stock", "delete", { id: created.id }); await api("mechanics", "delete", { id: mechanic.mechanic.id }); await api("document-types", "delete", { id: doc.documentType.id }); }
});

type DesignerOracle = { id: string; name: string; kind: string; text: string; x: number; y: number; width: number; height: number; anchor: string; visible: boolean; tab: boolean; icon: string; skin: string };
const designerOracles: Record<string, DesignerOracle[]> = {
  "WIN_Extrato_Artigos": [
    {"id":"RULE-W13F458-1001","name":"BTN_VISION3","kind":"Button","text":"","x":296,"y":159,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W13F458-1002","name":"BTN_VISION4","kind":"Button","text":"","x":296,"y":129,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W13F458-1003","name":"BTN_Visualizar_impressão","kind":"Button","text":"Visualizar impressão","x":99,"y":204,"width":179,"height":37,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W13F458-1008","name":"RADTitle","kind":"Caption","text":"Extrato de Artigos","x":9,"y":4,"width":221,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W13F458-1009","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":320,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-W13F458-1010","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":270,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-W13F458-1011","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":296,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-W13F458-1012","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":236,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Inventario": [
    {"id":"RULE-W450C10-1001","name":"BTN_Imprimir","kind":"Button","text":"Imprimir","x":19,"y":466,"width":94,"height":43,"anchor":"Right and bottom, height and width","visible":true,"tab":true,"icon":"Btn_Print.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W450C10-1002","name":"BTN_Sair","kind":"Button","text":"Sair","x":521,"y":466,"width":94,"height":43,"anchor":"Right and bottom, height and width","visible":true,"tab":true,"icon":"Btn_Close.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W450C10-1004","name":"RADTitle","kind":"Caption","text":"Inventário","x":9,"y":4,"width":485,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W450C10-1005","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":584,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-W450C10-1006","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":534,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-W450C10-1007","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":560,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-W450C10-1008","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":500,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Inventario_Reconstrucao": [
    {"id":"RULE-WB2F707-1000","name":"BTN_Reconstruir","kind":"Button","text":"Sim","x":34,"y":118,"width":117,"height":48,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-WB2F707-1001","name":"BTN_Reconstruir1","kind":"Button","text":"Não","x":164,"y":118,"width":117,"height":48,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_Cancel.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-WB2F707-1003","name":"RADTitle","kind":"Caption","text":"Reconstrução de Stocks","x":9,"y":4,"width":191,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WB2F707-1004","name":"STC_reconstrucao_stocks","kind":"Caption","text":"É aconselhada a reconstrução dos stocks.\r\nPretende fazê-lo agora?","x":19,"y":36,"width":287,"height":79,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WB2F707-1005","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":268,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-WB2F707-1006","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":218,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-WB2F707-1007","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":244,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-WB2F707-1008","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":184,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Leitor_cod_barras": [
    {"id":"RULE-WAFCFDF-1001","name":"BTN_Cancelar","kind":"Button","text":"Cancelar","x":281,"y":541,"width":88,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"Btn_Close.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-WAFCFDF-1002","name":"BTN_Confirmar","kind":"Button","text":"Confirmar","x":187,"y":541,"width":88,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-WAFCFDF-1004","name":"RADTitle","kind":"Caption","text":"Códigos de barras","x":9,"y":4,"width":239,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WAFCFDF-1005","name":"STC_Códigos_de_barras_encontrados","kind":"Caption","text":"Códigos de barras encontrados no ficheiro","x":19,"y":36,"width":350,"height":25,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WAFCFDF-1006","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":338,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-WAFCFDF-1007","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":288,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-WAFCFDF-1008","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":314,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-WAFCFDF-1009","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":254,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Leitor_cod_barras_desconhecidos": [
    {"id":"RULE-WB2879B-1001","name":"BTN_Confirmar","kind":"Button","text":"Confirmar","x":281,"y":541,"width":88,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-WB2879B-1003","name":"RADTitle","kind":"Caption","text":"Códigos de barras","x":9,"y":4,"width":239,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WB2879B-1004","name":"STC_Códigos_de_barras_desconhecidos","kind":"Caption","text":"Códigos de barras desconhecidos","x":19,"y":36,"width":350,"height":25,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-WB2879B-1005","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":338,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-WB2879B-1006","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":288,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-WB2879B-1007","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":314,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-WB2879B-1008","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":254,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Reconstrucao_Stocks": [
    {"id":"RULE-W541EAA-1000","name":"BTN_Reconstruir","kind":"Button","text":"Reconstruir","x":69,"y":64,"width":149,"height":64,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W541EAA-1002","name":"RADTitle","kind":"Caption","text":"Reconstrução de Stocks","x":9,"y":4,"width":169,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W541EAA-1003","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":235,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-W541EAA-1004","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":185,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-W541EAA-1005","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":211,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-W541EAA-1006","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":151,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Table_cab_stocks": [
    {"id":"RULE-W7C9411-1001","name":"BTN_Eliminar","kind":"Button","text":"Eliminar","x":675,"y":208,"width":106,"height":46,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_Delete.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7C9411-1003","name":"BTN_VISION","kind":"Button","text":"","x":187,"y":36,"width":42,"height":24,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7C9411-1004","name":"BTN_alterar","kind":"Button","text":"Alterar","x":675,"y":156,"width":106,"height":46,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_Modif.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7C9411-1005","name":"BTN_novo","kind":"Button","text":"Novo","x":675,"y":104,"width":106,"height":46,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_New.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7C9411-1012","name":"RADTitle","kind":"Caption","text":"Movimentos de Stocks","x":9,"y":4,"width":651,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7C9411-1013","name":"STC_Descricao","kind":"Caption","text":"Descrição","x":556,"y":36,"width":100,"height":20,"anchor":"Right","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7C9411-1014","name":"STC_Tipo_de_Documento","kind":"Caption","text":"Tipo de Documento","x":19,"y":36,"width":100,"height":20,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7C9411-1015","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":750,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-W7C9411-1016","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":700,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-W7C9411-1017","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":726,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-W7C9411-1018","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":666,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ],
  "WIN_Table_Lin_Stocks": [
    {"id":"RULE-W7E91C1-1001","name":"BTN_Adicionar","kind":"Button","text":"Adicionar","x":701,"y":498,"width":80,"height":36,"anchor":"Bottom","visible":true,"tab":true,"icon":"VST01605.png","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1002","name":"BTN_Adicionar1","kind":"Button","text":"Eliminar linha","x":19,"y":450,"width":100,"height":20,"anchor":"Bottom","visible":true,"tab":true,"icon":"Btn_Delete.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1003","name":"BTN_Artigos","kind":"Button","text":"Criar Artigo...","x":19,"y":541,"width":91,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"inventory_categories_16.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1004","name":"BTN_Cancelar","kind":"Button","text":"Cancelar","x":691,"y":547,"width":90,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"Btn_Close.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1005","name":"BTN_Confirmar","kind":"Button","text":"Gravar documento","x":542,"y":547,"width":143,"height":38,"anchor":"Right and bottom","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1006","name":"BTN_NoName1","kind":"Button","text":"...","x":155,"y":498,"width":47,"height":36,"anchor":"Bottom","visible":true,"tab":true,"icon":"","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1008","name":"BTN_VISION","kind":"Button","text":"","x":339,"y":65,"width":42,"height":24,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1009","name":"BTN_VISION2","kind":"Button","text":"","x":710,"y":126,"width":42,"height":24,"anchor":"Right","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif"},
    {"id":"RULE-W7E91C1-1019","name":"RADTitle","kind":"Caption","text":"Movimentos de Stocks","x":9,"y":4,"width":651,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1020","name":"STC_Código","kind":"Caption","text":"Código","x":19,"y":483,"width":100,"height":20,"anchor":"Bottom","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1021","name":"STC_Data","kind":"Caption","text":"Data","x":613,"y":36,"width":100,"height":20,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1022","name":"STC_Descricao","kind":"Caption","text":"Descrição","x":19,"y":104,"width":100,"height":20,"anchor":"Right","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1023","name":"STC_Descrição_do_Artigo","kind":"Caption","text":"Descrição do Artigo","x":208,"y":483,"width":183,"height":20,"anchor":"Bottom","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1024","name":"STC_Mecanico","kind":"Caption","text":"Mecânico","x":503,"y":101,"width":100,"height":20,"anchor":"Right","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1025","name":"STC_Número","kind":"Caption","text":"Número","x":421,"y":36,"width":100,"height":20,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1026","name":"STC_Preço","kind":"Caption","text":"Preço","x":614,"y":483,"width":42,"height":20,"anchor":"Bottom","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1027","name":"STC_Quantidade","kind":"Caption","text":"Quantidade","x":532,"y":483,"width":65,"height":20,"anchor":"Bottom","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1028","name":"STC_Tipo_de_Documento","kind":"Caption","text":"Tipo de Documento","x":19,"y":36,"width":100,"height":20,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":""},
    {"id":"RULE-W7E91C1-1029","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":750,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif"},
    {"id":"RULE-W7E91C1-1030","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":700,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif"},
    {"id":"RULE-W7E91C1-1031","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":726,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif"},
    {"id":"RULE-W7E91C1-1032","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":666,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif"}
  ]
};

/** Frozen dossier/parity oracles read before authoring. These assertions inspect the mounted
 * production DOM, styles, PNG bindings and actual resize, never a layout-to-layout comparison. */
async function designerProperties(frame: Locator, unit: string, title: string, delta = { width: 0, height: 0 }, active?: readonly string[]) {
  const base = (await frame.boundingBox())!;
  for (const source of designerOracles[unit] ?? []) {
    if (active && !active.includes(source.name) && !["RADTitle", "BTN_SYST_MINIMIZE", "BTN_Syst_Maximize", "BTN_SYST_FERMER", "BTN_UMC"].includes(source.name)) continue;
    if (["STC_Mecanico", "BTN_VISION2"].includes(source.name) && unit === "WIN_Table_Lin_Stocks") continue; // separate document-dependent caller case
    const node = frame.getByTestId(source.name);
    await expect(node, source.id).toHaveCount(1);
    if (!source.visible) { await expect(node, source.id).toBeHidden(); if (source.kind === "Button") await expect(node).toHaveAttribute("tabindex", "-1"); continue; }
    await expect(node, source.id).toBeVisible();
    const box = (await node.boundingBox())!;
    const chrome = ["BTN_SYST_MINIMIZE", "BTN_Syst_Maximize", "BTN_SYST_FERMER"].includes(source.name);
    const expected = { x: source.x + (chrome || source.anchor.includes("Right") && !source.anchor.includes("Width") ? delta.width : 0), y: source.y + (source.anchor.includes("Bottom") && !source.anchor.includes("Height") ? delta.height : 0),
      width: source.width + (source.name === "RADTitle" || source.anchor.includes("Width") ? delta.width : 0), height: source.height + (source.anchor.includes("Height") ? delta.height : 0) };
    expect(Math.abs(box.x - base.x - expected.x), source.id + " x").toBeLessThan(0.6); expect(Math.abs(box.y - base.y - expected.y), source.id + " y").toBeLessThan(0.6);
    expect(Math.abs(box.width - expected.width), source.id + " width").toBeLessThan(0.6); expect(Math.abs(box.height - expected.height), source.id + " height").toBeLessThan(0.6);
    if (source.kind === "Caption") {
      await expect(node, source.id).toHaveText(source.name === "RADTitle" ? title : source.name === "STC_Titulo_Tabela" ? `Estados de reparação que pedem data de ${title === "Mapa de Vendas" ? "entrega" : "pagamento"}` : source.text);
      expect(await node.locator("*").count(), source.id + " plain text").toBe(0); await expect(node).toHaveCSS("animation-name", "none");
    } else {
      expect(await node.evaluate(element => (element as HTMLButtonElement).type), source.id + " normal button").toBe("button");
      expect(await node.evaluate(element => element.tabIndex), source.id + " TAB flag").toBe(source.tab ? 0 : -1);
      if (!chrome) await expect(node.locator("span").first(), source.id + " caption").toHaveText(source.text);
      if (source.icon) { await expect(node.locator(".wd-button-icon")).toHaveCount(1); expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-icon-0"))).toContain(source.icon.replace(/\.gif$/i, "")); }
      if (source.skin) expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-background-0"))).toContain(source.skin.replace(/\.gif$/i, ""));
    }
  }
}

test("stock proof actual stock list chrome and static properties retain filters and saved normal frame", async ({ page }) => {
  await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click();
  const frame = page.getByTestId("workspace-window-1-frame"), list = page.getByTestId("WIN_Table_cab_stocks");
  await expect(list.getByTestId("BTN_novo")).toBeEnabled(); await designerProperties(frame, "WIN_Table_cab_stocks", "Movimentos de Stocks");
  const original = (await frame.boundingBox())!; await list.getByTestId("EDT_descricao").fill("Retain filter Ω"); await list.getByTestId("EDT_descricao").focus();
  await frame.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("workspace-window-1-task").click(); await expect(list.getByTestId("EDT_descricao")).toBeFocused();
  await frame.getByTestId("BTN_Syst_Maximize").click(); const maximum = (await frame.boundingBox())!;
  expect(maximum.width).toBeGreaterThan(original.width); await designerProperties(frame, "WIN_Table_cab_stocks", "Movimentos de Stocks", { width: maximum.width - original.width, height: maximum.height - original.height });
  await frame.getByTestId("BTN_Syst_Maximize").click(); expect(await frame.boundingBox()).toEqual(original); await expect(list.getByTestId("EDT_descricao")).toHaveValue("Retain filter Ω");
  await frame.getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Table_cab_stocks")!)); expect(saved).toMatchObject({ width: original.width, height: original.height, maximized: false });
  await page.getByTestId("stock-open").click(); const reopened = page.getByTestId("workspace-window-2-frame"); expect(await reopened.boundingBox()).toEqual(original); await expect(page.getByTestId("WIN_Table_cab_stocks").getByTestId("EDT_descricao")).toHaveValue("");
});
