import { expect, test } from "@playwright/test";

const consumers = [
  { route: "units", endpoint: "units", collection: "units", entity: "unit", open: "units-open", list: "WIN_Table_unidades", table: "TABLE_unidades", form: "WIN_Form_unidades", events: "SRC-a4f72efa83 SRC-1d9610dd46", refreshBeforeEdit: false },
  { route: "descriptive-states", endpoint: "descriptive-states", collection: "descriptiveStates", entity: "descriptiveState", open: "descriptive-states-open", list: "WIN_Table_estados_descritivos", table: "TABLE_estados_descritivos", form: "WIN_Form_estados_descritivos", events: "SRC-46ddae1d70 SRC-15f5980a65", refreshBeforeEdit: false },
  { route: "terminals", endpoint: "terminals", collection: "terminals", entity: "terminal", open: "terminals-open", list: "WIN_Table_Terminais", table: "TABLE_Terminais", form: "WIN_Form_Terminais", events: "SRC-114a90da1b SRC-03e7cd854a", refreshBeforeEdit: true },
] as const;

for (const consumer of consumers) {
  test(`${consumer.events} real ${consumer.route} refresh occurs after edit cancellation and successful creation only`, async ({ page, request }) => {
    const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
    const headers = { Authorization: `Bearer ${(await session.json()).token}` }, marker = String(Date.now());
    const suffix = (Date.now() % 1296).toString(36).padStart(2, "0"), Codigo = `L${suffix}`;
    const values = { Codigo, Descricao: `Initial ${marker}`, ...(consumer.route === "terminals" ? { codbarras_inicio: 0, codbarras_fim: 0, quant_inicio: 0, quant_fim: 0, pasta_localizacao: "", nome_ficheiro: "" } : {}) };
    const created = await (await request.post(`/api/${consumer.endpoint}/save`, { headers, data: { mode: "create", values } })).json(); expect(created.kind).toBe("saved");
    const id = created[consumer.entity].id;
    await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(consumer.open).click();
    const list = page.getByTestId(consumer.list), table = list.getByTestId(consumer.table), form = page.getByTestId(consumer.form);
    const row = table.getByRole("row").filter({ has: page.getByRole("cell", { name: Codigo, exact: true }) });
    await row.click(); await list.getByTestId("Btn_New").click();
    await expect(form.getByTestId("EDT_Codigo")).toBeEditable(); await expect(form.getByTestId("EDT_Codigo")).toHaveValue("");
    const live = { ...values, Descricao: `Before edit ${marker}` };
    expect((await (await request.post(`/api/${consumer.endpoint}/save`, { headers, data: { mode: "update", id, values: live } })).json()).kind).toBe("saved");
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
    await expect(row).toContainText(values.Descricao);
    await list.getByTestId("BTN_Modificar").click();
    await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue(consumer.refreshBeforeEdit ? live.Descricao : values.Descricao);
    const after = { ...values, Descricao: `After cancel ${marker}` };
    expect((await (await request.post(`/api/${consumer.endpoint}/save`, { headers, data: { mode: "update", id, values: after } })).json()).kind).toBe("saved");
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
    await expect(row).toContainText(after.Descricao); await expect(row).toHaveAttribute("aria-selected", "true");
    await list.getByTestId("Btn_New").click();
    const secondCode = `P${suffix}`;
    await form.getByTestId("EDT_Codigo").fill(secondCode); await form.getByTestId("EDT_Descricao").fill(`Created ${marker}`);
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    await expect(table.getByRole("row").filter({ hasText: `Created ${marker}` })).toBeVisible();
    const loaded = await (await request.post(`/api/${consumer.endpoint}/list`, { headers, data: {} })).json();
    for (const record of loaded[consumer.collection].filter((value: { Codigo: string }) => value.Codigo === Codigo || value.Codigo === secondCode)) {
      expect((await (await request.post(`/api/${consumer.endpoint}/delete`, { headers, data: { id: record.id } })).json()).kind).toBe("deleted");
    }
  });
}
