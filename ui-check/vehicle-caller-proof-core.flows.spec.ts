import { test, expect } from "./support/startup";

test("SRC-dc10131505 actual production vehicle editor returns Boolean false and source NOVO registration to its awaited caller", async ({ page, startupServer }) => {
  const retainedId = "9007199254740901";
  await startupServer.database.query('INSERT INTO app."Viaturas" ("ViaturasID","matricula","marca") VALUES ($1,$2,$3)', [retainedId, "PF-CANCEL-KEEP", "Retained original"]);
  try {
    const before = (await startupServer.database.query('SELECT * FROM app."Viaturas" ORDER BY "ViaturasID"')).rows;
    await page.goto(`${startupServer.origin}/?skin=controls`);
    await page.evaluate(async () => {
      const path = "/ui-check/support/proof-core-dialog-host.fixture.tsx";
      const host = await import(path); await host.mountVehicleCaller("pf'Ç-123");
    });
    let writes = 0; page.on("request", request => { if (request.url().endsWith("/api/vehicles/save")) writes++; });
    await page.getByTestId("proof-core-vehicle-open").click(); const form = page.getByTestId("WIN_Form_Viaturas");
    await expect(form.getByTestId("EDT_Matricula")).toHaveValue("pf'Ç-123"); await expect(form.getByTestId("EDT_Matricula")).toBeEditable();
    for (const name of ["EDT_Marca", "EDT_Modelo"]) await expect(form.getByTestId(name)).toHaveValue("");
    await expect(form.getByTestId("COMBO_Codigo")).toHaveValue(""); await expect(form.getByTestId("EDT_Ano")).toHaveValue("0"); await expect(form.getByTestId("EDT_Mes")).toHaveValue("0");
    await form.getByTestId("EDT_Marca").fill("Draft retained until cancel"); await form.getByTestId("BTN_Cancelar").click();
    await expect(form).toHaveCount(0); await expect(page.getByTestId("proof-core-vehicle-result")).toHaveText("false"); expect(writes).toBe(0);
    await page.getByTestId("proof-core-vehicle-open").click(); await expect(form.getByTestId("EDT_Matricula")).toHaveValue("pf'Ç-123"); await expect(form.getByTestId("EDT_Marca")).toHaveValue("");
    await form.getByTestId("BTN_Cancelar").press("Enter"); await expect(page.getByTestId("proof-core-vehicle-result")).toHaveText("false");
    expect(writes).toBe(0);
    expect((await startupServer.database.query('SELECT * FROM app."Viaturas" ORDER BY "ViaturasID"')).rows).toEqual(before);
  } finally { await startupServer.database.query('DELETE FROM app."Viaturas" WHERE "ViaturasID"=$1', [retainedId]); }
});

test("SRC-cbded69d95 actual selected vehicle lookup binds every query field and vanished query keeps the list without a fabricated editor", async ({ page, request, startupServer }) => {
  const { origin, database } = startupServer;
  const session = await request.post(`${origin}/api/development/session`, { headers: { Origin: origin, "X-Isolated-Development": "1" } }); const headers = { Authorization: `Bearer ${(await session.json()).token}` };
  const customer = await (await request.post(`${origin}/api/customers/save`, { headers, data: { mode: "create", values: { Codigo: "9007199254740993", Descricao: "  d'Água owner Ç  ", Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null } } })).json(); expect(customer.kind).toBe("saved");
  await database.query('INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES (91,$1,$2,$3,$4,$5,$6)', ["PF-LOOKUP", "9007199254740993", "  Marca d'Água  ", "  Modelo Ç  ", 65535, 255]);
  try {
    await page.goto(`${origin}/?workflow=vehicles`); await page.getByTestId("vehicles-open").click();
    const list = page.getByTestId("WIN_Table_Viaturas"), row = list.locator("tbody tr").filter({ hasText: "PF-LOOKUP" }), form = page.getByTestId("WIN_Form_Viaturas");
    await row.click(); await list.getByTestId("BTN_Modificar").click();
    for (const [name, value] of [["EDT_Matricula", "PF-LOOKUP"], ["COMBO_Codigo", "9007199254740993"], ["EDT_Marca", "  Marca d'Água  "], ["EDT_Modelo", "  Modelo Ç  "], ["EDT_Ano", "65535"], ["EDT_Mes", "255"]]) await expect(form.getByTestId(name)).toHaveValue(value);
    await expect(form.getByTestId("EDT_Matricula")).toHaveAttribute("readonly", ""); await expect(form.getByTestId("COMBO_Codigo").getByRole("option", { name: "d'Água owner Ç", exact: true })).toHaveAttribute("value", "9007199254740993");
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
    await database.query('DELETE FROM app."Viaturas" WHERE "matricula"=$1', ["PF-LOOKUP"]);
    await list.getByTestId("BTN_Modificar").click(); await expect(list.getByTestId("vehicle-list-diagnostic")).toHaveText("missing"); await expect(form).toHaveCount(0);
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(row).toHaveAttribute("aria-selected", "true");
  } finally { await database.query('DELETE FROM app."Viaturas" WHERE "matricula"=$1', ["PF-LOOKUP"]); }
});
