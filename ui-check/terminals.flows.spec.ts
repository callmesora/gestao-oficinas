import { expect, test } from "@playwright/test";

test("SRC-f62ee211d1 actual terminal form validates in order, persists all fields and refreshes selected record before editing", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` }, code = "Z" + (Date.now() % 1296).toString(36).padStart(2, "0");
  await page.goto("/?workflow=terminals"); await page.getByTestId("terminals-open").click();
  const list = page.getByTestId("WIN_Table_Terminais"), form = page.getByTestId("WIN_Form_Terminais");
  await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Indique um código"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Indique uma descrição"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await form.getByTestId("EDT_Descricao").fill("Synthetic terminal");
  await form.getByTestId("EDT_Posicao_Inicial_do_Codigo_de_Barras").fill("1"); await form.getByTestId("EDT_Posicao_Final_do_Codigo_de_Barras").fill("99");
  await form.getByTestId("EDT_Posicao_Inicial_da_Quantidade").fill("0"); await form.getByTestId("EDT_Posicao_Final_da_Quantidade").fill("2");
  await form.getByTestId("EDT_Nome_do_ficheiro").fill("d'Água.txt  ");
  await expect(form.getByTestId("EDT_Localizacao_da_pasta")).toHaveAttribute("readonly", "");
  await expect(form.getByText("Descrição", { exact: true })).toBeVisible();
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  let row = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((value: { Codigo: string }) => value.Codigo === code);
  expect(row).toMatchObject({ codbarras_inicio: 1, codbarras_fim: 99, quant_inicio: 0, quant_fim: 2, pasta_localizacao: "", nome_ficheiro: "d'Água.txt  " });
  const selected = list.getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) }); await selected.click();
  // Storage permits255 although source entry mask99 permits two digits; bind it via the real API and preserve it on unrelated edits.
  const values = { Codigo: row.Codigo, Descricao: "Refreshed before edit", codbarras_inicio: row.codbarras_inicio, codbarras_fim: 255, quant_inicio: row.quant_inicio, quant_fim: row.quant_fim, pasta_localizacao: row.pasta_localizacao, nome_ficheiro: row.nome_ficheiro };
  expect((await (await request.post("/api/terminals/save", { headers, data: { mode: "update", id: row.id, values } })).json()).kind).toBe("saved");
  await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Refreshed before edit");
  await expect(form.getByTestId("EDT_Posicao_Final_do_Codigo_de_Barras")).toHaveValue("255");
  await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
  await form.getByTestId("EDT_Descricao").fill("Cancelled"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list).toBeVisible();
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await selected.dblclick(); await form.getByTestId("EDT_Descricao").fill("Final"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  await page.reload(); await page.getByTestId("terminals-open").click(); await expect(selected).toContainText("Final");
  row = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((value: { Codigo: string }) => value.Codigo === code);
  expect(row.nome_ficheiro).toBe("d'Água.txt  "); expect(row.Descricao).toBe("Final"); expect(row.codbarras_fim).toBe(255);
  expect((await (await request.post("/api/terminals/delete", { headers, data: { id: row.id } })).json()).kind).toBe("deleted");
});

test("SRC-3ee5a8fb54 SRC-958c07be8f actual terminal selector retains CRUD, returns code and cancellation origin, duplicate/delete use real persistence", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` }, code = "Y" + (Date.now() % 1296).toString(36).padStart(2, "0");
  const values = { Codigo: code, Descricao: "Selector terminal", codbarras_inicio: 0, codbarras_fim: 0, quant_inicio: 0, quant_fim: 0, pasta_localizacao: "", nome_ficheiro: "" };
  const created = (await (await request.post("/api/terminals/save", { headers, data: { mode: "create", values } })).json()); expect(created.kind).toBe("saved");
  await page.goto("/?workflow=terminals&selecting=1&origin=Original"); await page.getByTestId("terminals-select-open").click();
  const list = page.getByTestId("WIN_Table_Terminais"), form = page.getByTestId("WIN_Form_Terminais");
  for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_selecionar"]) await expect(list.getByTestId(id)).toBeVisible();
  await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("EDT_Descricao").fill("Duplicate"); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText(`Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`);
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(list).toBeVisible();
  const selected = list.getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) });
  await expect(list.getByTestId("BTN_selecionar")).toBeEnabled(); await selected.dblclick(); await expect(page.getByTestId("terminals-returned")).toHaveText(code);
  await page.getByTestId("terminals-select-open").click(); await list.getByTestId("BTN_Fechar").click(); await expect(page.getByTestId("terminals-returned")).toHaveText("Original");
  await page.getByTestId("terminals-select-open").click(); await selected.click(); await list.getByTestId("BTN_Delete").click();
  const confirm = page.getByTestId("WINDEVDIALOGBOX"); await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(selected).toBeVisible();
  await list.getByTestId("BTN_Delete").click(); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(selected).toHaveCount(0);
  expect((await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.some((row: { id: string }) => row.id === created.terminal.id)).toBe(false);
});
