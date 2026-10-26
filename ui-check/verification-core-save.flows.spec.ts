import { expect, test } from "@playwright/test";

const forms = [
  ["customers", "WIN_Table_Clientes", "WIN_Form_Clientes", "customers", "Falta indicar o código"],
  ["vehicles", "WIN_Table_Viaturas", "WIN_Form_Viaturas", "vehicles", "Falta indicar a matrícula"],
  ["units", "WIN_Table_unidades", "WIN_Form_unidades", "units", "Falta indicar o código"],
  ["descriptive-states", "WIN_Table_estados_descritivos", "WIN_Form_estados_descritivos", "descriptiveStates", "Falta indicar o código"],
  ["terminals", "WIN_Table_Terminais", "WIN_Form_Terminais", "terminals", "Indique um código"],
  ["postos", "WIN_Table_postos", "WIN_Form_postos", "postos", "Indique um código"],
  ["mechanics", "WIN_Table_mecanicos", "WIN_Form_mecanicos", "mechanics", "Falta indicar o código"],
  ["repair-states", "WIN_Table_estados_reparacao", "WIN_Form_estados_reparacao", "repairStates", "Falta indicar o código"],
  ["document-types", "WIN_Table_documentos", "WIN_Form_documentos", "documentTypes", "Falta indicar o código"],
  ["articles", "WIN_Table_artigos", "WIN_Form_artigos", "articles", "Indique um código"],
  ["users", "WIN_Table_utilizadores", "WIN_Form_utilizadores", "users", "Falta indicar o código"],
] as const;
type RecordRow = { id: string; Codigo?: string | number | null; matricula?: string | null; Descricao?: string | null; marca?: string | null };
for (const [index, [route, listName, formName, collection, required]] of forms.entries()) {
  test(`${formName} real required guard create edit duplicate and cancel preserve one persisted identity`, async ({ page, request, baseURL }) => {
    const session = await request.post("/api/development/session", { headers: { Origin: new URL(baseURL!).origin, "X-Isolated-Development": "1" } });
    expect(session.ok()).toBe(true); const headers = { Authorization: `Bearer ${(await session.json()).token}` };
    const api = async (resource: string, operation: string, data: unknown) => { const response = await request.post(`/api/${resource}/${operation}`, { headers, data }); expect(response.ok()).toBe(true); return response.json(); };
    const filter = route === "customers" || route === "vehicles" ? { mode: "todos", term: "" } : route === "articles" ? { mode: "todos", term: "", active: true, inactive: true } : {};
    const read = async (): Promise<RecordRow[]> => (await api(route, "list", filter))[collection];
    const before = await read(), used = new Set(before.map(row => String(row.Codigo ?? row.matricula)));
    const numeric = ["customers", "postos", "mechanics", "users"].includes(route);
    const code = route === "vehicles" ? `VERIFY-${Date.now() % 1000000}` : numeric ? String(Array.from({ length: 98 }, (_, i) => 99 - i).find(value => !used.has(String(value)))!) : Array.from({ length: 1296 }, (_, i) => `V${i.toString(36).padStart(2, "0")}`).find(value => !used.has(value))!;
    const marker = ` V d'Água ${index}  `, changed = ` E d'Água ${index}  `, keyName = route === "vehicles" ? "EDT_Matricula" : "EDT_Codigo", fieldName = route === "vehicles" ? "EDT_Marca" : "EDT_Descricao";
    const dependencies: { resource: string; id: string }[] = []; let dependencyCode = ""; let owned: RecordRow | undefined;
    if (route === "vehicles") {
      const existing = (await api("customers", "list", { mode: "todos", term: "" })).customers as RecordRow[];
      const usedCodes = new Set(existing.map(row => String(row.Codigo)));
      dependencyCode = Array.from({ length: 100 }, (_, i) => String(9007199254740993n + BigInt(i))).find(value => !usedCodes.has(value))!;
      const value = await api("customers", "save", { mode: "create", values: { Codigo: dependencyCode, Descricao: "Vehicle verification owner", Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null } });
      expect(value.kind).toBe("saved"); dependencies.push({ resource: "customers", id: value.customer.id });
    }
    if (route === "articles") {
      const existing = (await api("units", "list", {})).units as RecordRow[];
      const usedCodes = new Set(existing.map(row => String(row.Codigo)));
      dependencyCode = Array.from({ length: 1296 }, (_, i) => `F${i.toString(36).padStart(2, "0")}`).find(value => !usedCodes.has(value))!;
      const value = await api("units", "save", { mode: "create", values: { Codigo: dependencyCode, Descricao: "Article verification unit" } });
      expect(value.kind).toBe("saved"); dependencies.push({ resource: "units", id: value.unit.id });
    }
    let saves = 0; page.on("request", item => { if (new URL(item.url()).pathname === `/api/${route}/save`) saves++; });
    try {
      await page.goto(`/?workflow=${route}`); await page.getByTestId(`${route}-open`).click(); const list = page.getByTestId(listName), form = page.getByTestId(formName);
      if (route === "postos") { await page.getByTestId("terminals-open").click(); const terminals = page.getByTestId("WIN_Table_Terminais"); await terminals.getByTestId("Btn_New").click(); await page.getByTestId("WIN_Form_Terminais").getByTestId("BTN_Cancelar").click(); await terminals.getByTestId("BTN_Fechar").click(); }
      await list.getByTestId("Btn_New").click(); await form.getByTestId(keyName).fill(numeric ? "0" : "");
      await form.getByTestId("BTN_Validar").click(); const info = page.getByTestId("WINDEVMESSAGEBOX"); await expect(info.getByTestId("LIB_INFO")).toHaveText(required); await info.getByTestId("BTN_OK").click(); const guardSaves = saves; expect((await read()).length).toBe(before.length);
      const fill = async (description: string) => {
        await form.getByTestId(keyName).fill(code); await form.getByTestId(fieldName).fill(description);
        if (route === "vehicles") { await form.getByTestId("EDT_Modelo").fill("Model  "); await form.getByTestId("COMBO_Codigo").selectOption(dependencyCode); }
        if (route === "articles") await form.getByTestId("COMBO_Unidade").selectOption(dependencyCode);
        if (route === "mechanics" || route === "users") await form.getByTestId("EDT_Palavra_passe").fill("aB'Ç 9 ");
      };
      await fill(marker); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(saves).toBe(guardSaves + 1);
      const after = await read(); owned = after.find(row => String(row.Codigo ?? row.matricula) === code); expect(owned).toBeDefined(); expect(after.length).toBe(before.length + 1); expect(owned![route === "vehicles" ? "marca" : "Descricao"]).toBe(marker);
      const row = list.locator('tbody tr').filter({ hasText: marker }); await expect(row).toBeVisible(); await row.click(); await list.getByTestId("BTN_Modificar").click(); if (route !== "postos") await expect(form.getByTestId(keyName)).toHaveAttribute("readonly", ""); await expect(form.getByTestId(fieldName)).toHaveValue(marker);
      if (route === "mechanics" || route === "users") await expect(form.getByTestId("EDT_Palavra_passe")).toHaveValue(route === "users" ? "AB'Ç 9 " : "aB'Ç 9 ");
      await form.getByTestId(fieldName).fill(changed); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(saves).toBe(guardSaves + 2);
      const edited = (await read()).find(value => value.id === owned!.id)!; expect(edited[route === "vehicles" ? "marca" : "Descricao"]).toBe(changed); expect(String(edited.Codigo ?? edited.matricula)).toBe(code);
      await list.getByTestId("Btn_New").click(); await fill(marker); await form.getByTestId("BTN_Validar").click(); await expect(info.getByTestId("LIB_INFO")).toHaveText(`Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: ${route === "vehicles" ? "matricula" : "Codigo"}\nValor do campo duplicado: ${code}`);
      await info.getByTestId("BTN_OK").click(); await expect(form.getByTestId(fieldName)).toHaveValue(marker); if (route === "users") await expect(form.getByTestId("EDT_Palavra_passe")).toHaveValue("AB'Ç 9 "); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
      const final = await read(); expect(final.filter(value => String(value.Codigo ?? value.matricula) === code)).toHaveLength(1); expect(final.find(value => value.id === owned!.id)![route === "vehicles" ? "marca" : "Descricao"]).toBe(changed);
    } finally {
      const records = await read(); for (const row of records.filter(value => String(value.Codigo ?? value.matricula) === code)) {
        expect((await api(route, "delete", route === "vehicles" ? { registration: code } : { id: row.id })).kind).toBe("deleted");
      }
      for (const dependency of dependencies.reverse()) expect((await api(dependency.resource, "delete", { id: dependency.id })).kind).toBe("deleted");
    }
  });
}
