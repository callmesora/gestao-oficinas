import { expect, test } from "@playwright/test";

test("SRC-a5097f5947 actual unit form requires only code, saves blank description, edits, cancels and reloads", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` };
  const code = "Z" + (Date.now() % 1296).toString(36).padStart(2, "0");
  await page.goto("/?workflow=units"); await page.getByTestId("units-open").click();
  const list = page.getByTestId("WIN_Table_unidades"), form = page.getByTestId("WIN_Form_unidades");
  await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await form.getByTestId("EDT_Codigo").fill(code);
  await expect(form.getByTestId("EDT_Descricao")).toHaveValue("");
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  const row = list.getByTestId("TABLE_unidades").getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) });
  await row.click(); await list.getByTestId("BTN_Modificar").click();
  await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
  await form.getByTestId("EDT_Descricao").fill("Cancelado"); await page.keyboard.press("Escape");
  await expect(form).toHaveCount(0); await expect(list).toBeVisible(); await expect(row).not.toContainText("Cancelado");
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await list.getByTestId("BTN_Modificar").click();
  await form.getByTestId("EDT_Descricao").fill("Final d'Água  "); await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0); await expect(row).toContainText("Final d'Água");
  await page.reload(); await page.getByTestId("units-open").click(); await expect(row).toContainText("Final d'Água");
  const persisted = (await (await request.post("/api/units/list", { headers, data: {} })).json()).units.find((unit: { Codigo: string }) => unit.Codigo === code);
  expect(persisted.Descricao).toBe("Final d'Água  ");
  expect((await (await request.post("/api/units/delete", { headers, data: { id: persisted.id } })).json()).kind).toBe("deleted");
});

test("SRC-226f5f62f3 real unit duplicate dialog preserves record and explicit delete controls persistence", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` };
  const code = "Y" + (Date.now() % 1296).toString(36).padStart(2, "0"), description = `Synthetic unit ${Date.now()}`;
  const created = (await (await request.post("/api/units/save", { headers, data: { mode: "create", values: { Codigo: code, Descricao: description } } })).json());
  expect(created.kind).toBe("saved");
  await page.goto("/?workflow=units"); await page.getByTestId("units-open").click(); await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_unidades"), list = page.getByTestId("WIN_Table_unidades");
  await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText(`Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`);
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await form.getByTestId("BTN_Cancelar").click();
  const row = list.getByTestId("TABLE_unidades").getByRole("row").filter({ hasText: description });
  await row.click(); await list.getByTestId("BTN_Delete").click();
  const confirm = page.getByTestId("WINDEVDIALOGBOX");
  await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(row).toBeVisible();
  await list.getByTestId("BTN_Delete").click(); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(row).toHaveCount(0);
  const loaded = (await (await request.post("/api/units/list", { headers, data: {} })).json());
  expect(loaded.units.some((unit: { id: string }) => unit.id === created.unit.id)).toBe(false);
});
