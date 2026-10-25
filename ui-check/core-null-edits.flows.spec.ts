import { expect, test, type APIRequestContext } from "@playwright/test";

async function authenticated(request: APIRequestContext) {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(session.ok()).toBe(true);
  return { Authorization: `Bearer ${(await session.json()).token}` };
}

// Source ScreenToFile writes the actual accepted blank control; ADR002 preserves NULL only while untouched.
test("ADR002 customer optional contacts and memo retain untouched NULL and save accepted NULL-to-text-to-blank as empty strings", async ({ page, request }) => {
  const headers = await authenticated(request), stamp = String(Date.now());
  const optional = { Morada1: "EDT_Morada1", Morada2: "EDT_Morada2", codpostal: "EDT_Codpostal", Telefone1: "EDT_Telefone1", Telemovel: "EDT_Telemovel", observacao: "EDT_Observacao" };
  const nullable = Object.fromEntries(Object.keys(optional).map(key => [key, null]));
  const created = await (await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo: stamp, Descricao: `Null customer ${stamp}`, ...nullable } } })).json();
  expect(created.kind).toBe("saved");
  const id = created.customer.id;
  const read = async () => (await (await request.post("/api/customers/list", { headers, data: { mode: "codigo", term: stamp } })).json()).customers.find((row: { id: string }) => row.id === id);
  try {
    await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
    const list = page.getByTestId("WIN_Table_Clientes"), form = page.getByTestId("WIN_Form_Clientes");
    const row = list.getByRole("row").filter({ hasText: `Null customer ${stamp}` });
    await row.click(); await list.getByTestId("BTN_Modificar").click();
    for (const control of Object.values(optional)) await expect(form.getByTestId(control)).toHaveValue("");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read()).toMatchObject(nullable);
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await list.getByTestId("BTN_Modificar").click();
    for (const control of Object.values(optional)) { await form.getByTestId(control).fill("x"); await form.getByTestId(control).fill(""); }
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read()).toMatchObject(Object.fromEntries(Object.keys(optional).map(key => [key, ""])));
  } finally { expect((await (await request.post("/api/customers/delete", { headers, data: { id } })).json()).kind).toBe("deleted"); }
});

for (const consumer of [
  { route: "units", open: "units-open", list: "WIN_Table_unidades", form: "WIN_Form_unidades", collection: "units", entity: "unit" },
  { route: "descriptive-states", open: "descriptive-states-open", list: "WIN_Table_estados_descritivos", form: "WIN_Form_estados_descritivos", collection: "descriptiveStates", entity: "descriptiveState" },
] as const) {
  test(`ADR002 ${consumer.route} description retains untouched NULL and saves accepted NULL-to-text-to-blank as empty text`, async ({ page, request }) => {
    const headers = await authenticated(request), code = "V" + (Date.now() % 1296).toString(36).padStart(2, "0");
    const created = await (await request.post(`/api/${consumer.route}/save`, { headers, data: { mode: "create", values: { Codigo: code, Descricao: null } } })).json(); expect(created.kind).toBe("saved");
    const id = created[consumer.entity].id;
    const read = async () => (await (await request.post(`/api/${consumer.route}/list`, { headers, data: {} })).json())[consumer.collection].find((row: { id: string }) => row.id === id);
    try {
      await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(consumer.open).click();
      const list = page.getByTestId(consumer.list), form = page.getByTestId(consumer.form);
      await list.getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) }).click();
      await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("");
      await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await read()).Descricao).toBeNull();
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await list.getByTestId("BTN_Modificar").click();
      await form.getByTestId("EDT_Descricao").fill("x"); await form.getByTestId("EDT_Descricao").fill("");
      await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await read()).Descricao).toBe("");
    } finally { expect((await (await request.post(`/api/${consumer.route}/delete`, { headers, data: { id } })).json()).kind).toBe("deleted"); }
  });
}

test("ADR002 terminal filename retains untouched NULL and saves accepted NULL-to-text-to-blank as empty text", async ({ page, request }) => {
  const headers = await authenticated(request), code = "V" + (Date.now() % 1296).toString(36).padStart(2, "0");
  const values = { Codigo: code, Descricao: `Null terminal ${code}`, codbarras_inicio: null, codbarras_fim: null, quant_inicio: null, quant_fim: null, pasta_localizacao: null, nome_ficheiro: null };
  const created = await (await request.post("/api/terminals/save", { headers, data: { mode: "create", values } })).json(); expect(created.kind).toBe("saved");
  const id = created.terminal.id;
  const read = async () => (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((row: { id: string }) => row.id === id);
  try {
    await page.goto("/?workflow=terminals"); await page.getByTestId("terminals-open").click();
    const list = page.getByTestId("WIN_Table_Terminais"), form = page.getByTestId("WIN_Form_Terminais");
    await list.getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) }).click();
    await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Nome_do_ficheiro")).toHaveValue("");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read()).toMatchObject({ nome_ficheiro: null, pasta_localizacao: null, codbarras_inicio: null, codbarras_fim: null, quant_inicio: null, quant_fim: null });
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await list.getByTestId("BTN_Modificar").click();
    await form.getByTestId("EDT_Nome_do_ficheiro").fill("x"); await form.getByTestId("EDT_Nome_do_ficheiro").fill("");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read()).toMatchObject({ nome_ficheiro: "", pasta_localizacao: null, codbarras_inicio: null, codbarras_fim: null, quant_inicio: null, quant_fim: null });
  } finally { expect((await (await request.post("/api/terminals/delete", { headers, data: { id } })).json()).kind).toBe("deleted"); }
});
