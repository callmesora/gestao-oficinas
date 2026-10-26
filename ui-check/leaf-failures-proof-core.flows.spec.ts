import { test, expect } from "./support/startup";

type Values = Record<string, string | number | boolean | null>;
type Row = { id: string; Codigo?: string | number | null; matricula?: string | null; Descricao?: string | null; marca?: string | null };
const consumers = [
  { route: "customers", suffix: "Clientes", entity: "customer", collection: "customers", table: "Clientes", values: { Codigo: "81", Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null } },
  { route: "vehicles", suffix: "Viaturas", entity: "vehicle", collection: "vehicles", table: "Viaturas", values: { matricula: "PROOF-CORE", Cliente: "1", modelo: "  Modelo Ç  ", Ano: 2026, mes: 10 } },
  { route: "units", suffix: "unidades", entity: "unit", collection: "units", table: "unidades", values: { Codigo: "P01" } },
  { route: "descriptive-states", suffix: "estados_descritivos", entity: "descriptiveState", collection: "descriptiveStates", table: "estados_descritivos", values: { Codigo: "P01" } },
  { route: "terminals", suffix: "Terminais", entity: "terminal", collection: "terminals", table: "Terminais", values: { Codigo: "P01", codbarras_inicio: null, codbarras_fim: null, quant_inicio: null, quant_fim: null, pasta_localizacao: null, nome_ficheiro: null } },
  { route: "postos", suffix: "postos", entity: "posto", collection: "postos", table: "postos", values: { Codigo: 81, terminal: null } },
  { route: "mechanics", suffix: "mecanicos", entity: "mechanic", collection: "mechanics", table: "mecanicos", values: { Codigo: 81, palavra_passe: "Pr00f Ç", inativo: false } },
  { route: "repair-states", suffix: "estados_reparacao", entity: "repair-state", collection: "repairStates", table: "estados_reparacao", values: { Codigo: "P01", tipo: 1, Cor: 0, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null } },
  { route: "document-types", suffix: "documentos", entity: "document-type", collection: "documentTypes", table: "documentos", values: { Codigo: "P01", stock: 1, obriga_macanico: null } },
  { route: "articles", suffix: "artigos", entity: "article", collection: "articles", table: "artigos", values: { Codigo: "PROOF-CORE", codbarras: null, unidade: "U01", preco: "123456789.123456", inativo: false } },
  { route: "users", suffix: "utilizadores", entity: "user", collection: "users", table: "utilizadores", values: { Codigo: 81, palavra_passe: "Pr00f Ç" } },
] as const;

for (const consumer of consumers) {
  test(`${consumer.suffix} actual form retains identity draft and pending ownership across real rollback transport and vanished-record writes`, async ({ page, request, startupServer }) => {
    const { origin, database } = startupServer;
    const session = await request.post(`${origin}/api/development/session`, { headers: { Origin: origin, "X-Isolated-Development": "1" } });
    expect(session.ok()).toBe(true); const headers = { Authorization: `Bearer ${(await session.json()).token}` };
    const api = async (route: string, operation: string, data: unknown) => {
      const response = await request.post(`${origin}/api/${route}/${operation}`, { headers, data }); expect(response.ok()).toBe(true); return await response.json() as { kind: string; [key: string]: unknown };
    };
    const listInput = consumer.route === "customers" || consumer.route === "vehicles" ? { mode: "todos", term: "" } : consumer.route === "articles" ? { mode: "todos", term: "", active: true, inactive: true } : {};
    const read = async () => (await api(consumer.route, "list", listInput))[consumer.collection] as Row[];
    if (consumer.route === "vehicles") expect((await api("customers", "save", { mode: "create", values: { Codigo: "1", Descricao: "Proof vehicle owner", Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null } })).kind).toBe("saved");
    if (consumer.route === "articles") expect((await api("units", "save", { mode: "create", values: { Codigo: "U01", Descricao: "Proof unit" } })).kind).toBe("saved");
    const field = consumer.route === "vehicles" ? "marca" : "Descricao", original = `Original ${consumer.route}`, draft = `  d'Água ${consumer.route}  `;
    const values: Values = { ...consumer.values, [field]: original };
    expect((await api(consumer.route, "save", { mode: "create", values })).kind).toBe("saved");
    const owned = (await read()).find(row => row[field] === original)!; expect(owned).toBeDefined();
    let release: () => void = () => undefined, saves = 0, held = false;
    const remove = async () => api(consumer.route, "delete", consumer.route === "vehicles" ? { registration: owned.matricula } : { id: owned.id });
    try {
      await page.goto(`${origin}/?workflow=${consumer.route}`); await page.getByTestId(`${consumer.route}-open`).click();
      const list = page.getByTestId(`WIN_Table_${consumer.suffix}`), form = page.getByTestId(`WIN_Form_${consumer.suffix}`);
      await list.locator("tbody tr").filter({ hasText: original }).click(); await list.getByTestId("BTN_Modificar").click();
      const input = form.getByTestId(consumer.route === "vehicles" ? "EDT_Marca" : "EDT_Descricao"), diagnostic = form.getByTestId(`${consumer.entity}-form-diagnostic`);
      await expect(input).toHaveValue(original); await input.fill(draft);
      await database.query("CREATE FUNCTION app.proof_core_reject_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic rollback proof'; END $$");
      await database.query(`CREATE TRIGGER proof_core_reject_write BEFORE UPDATE ON app."${consumer.table}" FOR EACH ROW EXECUTE FUNCTION app.proof_core_reject_write()`);
      const gate = new Promise<void>(resolve => { release = resolve; });
      await page.route(`**/api/${consumer.route}/save`, async route => { saves++; const response = await route.fetch(); expect((await response.json()).kind).toBe("failed"); held = true; await gate; await route.fulfill({ response }); });
      await form.getByTestId("BTN_Validar").click(); await expect.poll(() => held).toBe(true);
      await expect(input).toBeDisabled(); await expect(form.getByTestId("BTN_Validar")).toBeDisabled(); await expect(form.getByTestId("BTN_Cancelar")).toBeDisabled();
      await page.keyboard.press("Enter"); await page.keyboard.press("Escape"); await form.getByTestId("BTN_SYST_FERMER").click();
      await expect(form).toBeVisible(); await expect(input).toHaveValue(draft); expect(saves).toBe(1);
      release(); await expect(diagnostic).toHaveText("failed"); await expect(input).toBeEnabled(); await expect(form.getByTestId("BTN_Cancelar")).toBeEnabled();
      expect((await read()).find(row => row.id === owned.id)![field]).toBe(original); expect(saves).toBe(1);
      await page.unroute(`**/api/${consumer.route}/save`);
      await database.query(`DROP TRIGGER proof_core_reject_write ON app."${consumer.table}"`); await database.query("DROP FUNCTION app.proof_core_reject_write()");
      const saved = page.waitForResponse(response => response.url().endsWith(`/api/${consumer.route}/save`)); await form.getByTestId("BTN_Validar").click(); expect((await (await saved).json()).kind).toBe("saved");
      await expect(form).toHaveCount(0); expect((await read()).filter(row => row.id === owned.id)).toHaveLength(1); expect((await read()).find(row => row.id === owned.id)![field]).toBe(draft);
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await list.getByTestId("BTN_Modificar").click(); await input.fill(`Transport ${consumer.route}`);
      await page.route(`**/api/${consumer.route}/save`, route => route.abort("connectionreset"));
      await form.getByTestId("BTN_Validar").click(); await expect(diagnostic).toHaveText("transport"); await expect(form.getByTestId("BTN_Validar")).toBeEnabled(); await expect(input).toHaveValue(`Transport ${consumer.route}`);
      expect((await read()).find(row => row.id === owned.id)![field]).toBe(draft); await page.unroute(`**/api/${consumer.route}/save`);
      expect((await remove()).kind).toBe("deleted");
      const missing = page.waitForResponse(response => response.url().endsWith(`/api/${consumer.route}/save`)); await form.getByTestId("BTN_Validar").click(); expect((await (await missing).json()).kind).toBe("missing");
      await expect(diagnostic).toHaveText("missing"); await expect(input).toHaveValue(`Transport ${consumer.route}`); await expect(form.getByTestId("BTN_Cancelar")).toBeEnabled();
      expect((await read()).some(row => row.id === owned.id)).toBe(false);
      await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled();
      await expect(list.locator('tbody tr[aria-selected="true"]')).toHaveCount(0); await expect(list.locator("tbody tr").filter({ hasText: draft })).toHaveCount(0);
    } finally {
      release(); await page.unroute(`**/api/${consumer.route}/save`);
      await database.query(`DROP TRIGGER IF EXISTS proof_core_reject_write ON app."${consumer.table}"`); await database.query("DROP FUNCTION IF EXISTS app.proof_core_reject_write()");
      expect(["deleted", "missing"]).toContain((await remove()).kind);
      if (consumer.route === "articles") { const units = (await api("units", "list", {})).units as Row[]; for (const unit of units.filter(row => row.Codigo === "U01")) expect((await api("units", "delete", { id: unit.id })).kind).toBe("deleted"); }
    }
  });
}
