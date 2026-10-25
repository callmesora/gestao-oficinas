import type { Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."estados_reparacao" SET "tipo"=CASE "Codigo" WHEN 'R' THEN 3 WHEN 'X' THEN 6 ELSE 4 END;
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade") VALUES
      (77,10,'AA-00-AA',1,'R',2,1),(78,20,'BB-00-BB',2,'R',10,1),(79,30,'AA-00-AA',1,'X',2,1),(80,40,'AA-00-AA',1,'N',2,1)`);
});
async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao"); await expect(screen.getByTestId("TABLE_tempos_reparacao").locator("tbody tr")).toHaveCount(4);
  await expect(screen.getByTestId("LIST_mecanicos")).toBeEnabled(); return screen;
}
const numbers = (page: Page) => page.getByTestId("WIN_Tempos_Reparacao").getByTestId("TABLE_tempos_reparacao").locator("tbody tr").evaluateAll(rows => rows.map(row => row.querySelector("td")?.textContent));

test("SRC-f21eabb3c2 actual current-mechanic pointer release refreshes its existing checked-state filter and retains the selected state row", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao"), states = screen.getByTestId("TABLE_Estados_reparacao");
  await screen.getByTestId("LIST_mecanicos").selectOption("2"); await expect(table.locator("tbody tr")).toHaveCount(3);
  for (const code of ["X", "N", ""]) {
    await states.getByRole("checkbox", { name: `Selecionar estado ${code}`.trim(), exact: true }).click(); await expect(screen.getByTestId("LIST_mecanicos")).toBeEnabled();
  }
  await expect(table.locator("tbody tr")).toHaveCount(1); await expect(states.locator('tr[aria-selected="true"]')).toContainText("Sem código");
  const requests: unknown[] = []; page.on("request", request => { if (request.method() === "POST" && request.url().endsWith("/api/repair-labor/list")) requests.push(request.postDataJSON()); });
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "recepcao_prioridade"=2 WHERE "numero"=10;
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES
      (81,11,'AA-00-AA',1,'R',2),(82,12,'BB-00-BB',2,'R',10),(83,13,'AA-00-AA',1,'X',2)`);
  // Actual pointer click on the currently selected visible option emits no change event.
  await screen.getByTestId("LIST_mecanicos").getByRole("option", { name: "ANA", exact: true }).click();
  await expect(table.locator("tbody tr")).toHaveCount(2); await expect(table.getByRole("row").filter({ has: page.getByRole("cell", { name: "10", exact: true }) })).toContainText("Elevada");
  expect(await numbers(page)).toEqual(["10", "11"]); expect(requests).toContainEqual({ mechanic: 2, states: ["R"] });
  await expect(screen.getByTestId("STC_filtro_atual")).toHaveText("ANA"); await expect(states.locator('tr[aria-selected="true"]')).toContainText("Sem código");
  await expect(states.getByRole("checkbox", { checked: true })).toHaveCount(1);
});

test("SRC-97dd4aa47f actual plain state row click and double click refresh the current mechanic filter with no checked-state restriction or checkbox mutation", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao"), states = screen.getByTestId("TABLE_Estados_reparacao");
  await screen.getByTestId("LIST_mecanicos").selectOption("2"); await expect(table.locator("tbody tr")).toHaveCount(3);
  for (const checkbox of await states.getByRole("checkbox").all()) { await checkbox.click(); await expect(screen.getByTestId("LIST_mecanicos")).toBeEnabled(); }
  await expect(states.getByRole("checkbox", { checked: true })).toHaveCount(0); await expect(table.locator("tbody tr")).toHaveCount(3);
  await table.getByTestId("COL_numero").getByRole("button").first().click(); await expect(screen.getByTestId("LIST_mecanicos")).toBeEnabled();
  await table.getByTestId("COL_numero").getByRole("button").first().click(); await expect.poll(() => numbers(page)).toEqual(["40", "30", "10"]);
  const requests: unknown[] = []; page.on("request", request => { if (request.method() === "POST" && request.url().endsWith("/api/repair-labor/list")) requests.push(request.postDataJSON()); });
  await repairDatabase.query(`INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES
    (81,11,'AA-00-AA',1,'R',2),(82,12,'BB-00-BB',2,'R',10),(83,13,'AA-00-AA',1,'X',2)`);
  await states.getByRole("cell", { name: "Concluído", exact: true }).click();
  await expect(table.locator("tbody tr")).toHaveCount(5); expect(await numbers(page)).toEqual(["10", "11", "13", "30", "40"]);
  expect(requests).toContainEqual({ mechanic: 2, states: [] }); await expect(states.locator('tr[aria-selected="true"]')).toContainText("Concluído");
  await expect(states.getByRole("checkbox", { checked: true })).toHaveCount(0); await expect(screen.getByTestId("STC_filtro_atual")).toHaveText("ANA");
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "recepcao_prioridade"=3 WHERE "numero"=10`);
  await states.getByRole("cell", { name: "Em reparação", exact: true }).dblclick();
  await expect(table.getByRole("row").filter({ has: page.getByRole("cell", { name: "10", exact: true }) })).toContainText("Urgente");
  await expect(states.locator('tr[aria-selected="true"]')).toContainText("Em reparação"); await expect(states.getByRole("checkbox", { checked: true })).toHaveCount(0);
  await expect(page.getByTestId("WIN_Tempos_Reparacao_Estado")).toHaveCount(0); await expect(page.getByTestId("WIN_Tempos_Reparacao_Tempo")).toHaveCount(0);
});
