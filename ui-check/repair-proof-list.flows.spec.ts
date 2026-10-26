import type { Locator, Page, Response } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

const endpoint = (name: string) => (response: Response) => response.url().endsWith(`/api/repair-orders/${name}`);
const orderTable = "TABLE_QRY_select_ordens_reparacao";

async function open(page: Page, origin: string): Promise<Locator> {
  await page.goto(`${origin}/?workflow=repair-orders`);
  await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  return screen;
}

test("SRC-98518984e2 actual state initialization retains nullable codes, flags and duplicate rows in source tipo order", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."estados_reparacao" RESTART IDENTITY;
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa") VALUES
    (1,'R','DUPLICADO',2,255,true),(2,'R',NULL,1,NULL,NULL),
    (3,NULL,'SEM CÓDIGO',NULL,16777215,true),(4,'','CÓDIGO VAZIO',3,0,false)`);
  const initialized = page.waitForResponse(endpoint("initialise"));
  const screen = await open(page, repairServer.origin);
  const body = await (await initialized).json();
  expect(body.kind).toBe("loaded");
  expect(body.states).toEqual([
    { id: "2", Codigo: "R", Descricao: null, tipo: 1, Cor: null, lancar_defa: null },
    { id: "1", Codigo: "R", Descricao: "DUPLICADO", tipo: 2, Cor: 255, lancar_defa: true },
    { id: "4", Codigo: "", Descricao: "CÓDIGO VAZIO", tipo: 3, Cor: 0, lancar_defa: false },
    { id: "3", Codigo: null, Descricao: "SEM CÓDIGO", tipo: null, Cor: 16777215, lancar_defa: true },
  ]);
  const rows = screen.getByTestId("TABLE_Estados_reparacao").locator("tbody tr");
  await expect(rows).toHaveCount(4);
  await expect(rows.locator("td:nth-child(2)")).toHaveText(["", "DUPLICADO", "CÓDIGO VAZIO", "SEM CÓDIGO"]);
  expect(await rows.getByRole("checkbox").evaluateAll(nodes => nodes.map(node => node.getAttribute("aria-checked")))).toEqual(["false", "true", "false", "true"]);
  expect(await rows.locator('[data-testid="SHA_cor"]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor))).toEqual([
    "rgb(255, 255, 255)", "rgb(255, 0, 0)", "rgb(0, 0, 0)", "rgb(255, 255, 255)",
  ]);
  const refreshed = page.waitForResponse(endpoint("list"));
  await screen.getByTestId("BTN_Actualizar_Dados").click();
  expect((await refreshed).request().postDataJSON().states).toEqual(["R", null]);
  await expect(rows).toHaveCount(4);
});

for (const operation of ["initialise", "list"] as const) {
  test(`SRC-bf1d967f4f close releases the actual ${operation} owner before a detached result reaches a reopened list`, async ({ page, repairServer, repairDatabase }) => {
    await repairDatabase.query('UPDATE app."sistema" SET "Tempo_ordem_reparacao"=18446744073709551615');
    let screen: Locator;
    if (operation === "list") screen = await open(page, repairServer.origin);
    else await page.goto(`${repairServer.origin}/?workflow=repair-orders`);
    let release!: () => void, fetched!: () => void, finished!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const captured = new Promise<void>(resolve => { fetched = resolve; });
    const completed = new Promise<void>(resolve => { finished = resolve; });
    let intercept = true;
    await page.route(`**/api/repair-orders/${operation}`, async route => {
      if (!intercept) { await route.continue(); return; }
      intercept = false;
      try {
        const actual = await route.fetch();
        expect((await actual.json()).kind).toBe("loaded");
        fetched();
        await gate;
        await route.fulfill({ response: actual });
      } finally { finished(); }
    });
    try {
      if (operation === "list") await screen!.getByTestId("BTN_Actualizar_Dados").click();
      else await page.getByTestId("repair-orders-open").click();
      await captured;
      await page.getByTestId("workspace-window-1").getByTestId("BTN_SYST_FERMER").click();
      await expect(page.getByTestId("WIN_Ordens_Reparacao")).toHaveCount(0);
      await repairDatabase.query(`UPDATE app."Clientes" SET "Descricao"='CURRENT REOPENED CUSTOMER' WHERE "Codigo"=1;
        UPDATE app."estados_reparacao" SET "Descricao"='CURRENT REOPENED STATE' WHERE "Codigo"='R'`);
      await page.getByTestId("repair-orders-open").click();
      const reopened = page.getByTestId("WIN_Ordens_Reparacao");
      await expect(reopened.getByTestId("repair-order-read-state")).toHaveText("ready");
      const table = reopened.getByTestId(orderTable);
      await expect(table).toContainText("CURRENT REOPENED CUSTOMER");
      await expect(table).toContainText("CURRENT REOPENED STATE");
      const before = await table.locator("tbody").innerText();
      const selection = await reopened.getByTestId("repair-order-selected").innerText();
      release();
      await completed;
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      await expect(table.locator("tbody")).toHaveText(before, { useInnerText: true });
      await expect(reopened.getByTestId("repair-order-selected")).toHaveText(selection);
      await expect(reopened.getByTestId("TABLE_Estados_reparacao")).toContainText("CURRENT REOPENED STATE");
      await expect(page.getByTestId("workspace-window-2")).toHaveAttribute("data-active", "true");
      await expect(page.getByTestId("workspace-window-1")).toHaveCount(0);
    } finally { release(); await page.unroute(`**/api/repair-orders/${operation}`); }
  });
}

for (const [priority, label, numbers] of [
  [0, "Todos", ["18446744073709551615", "9007199254740993", "9007199254740992", "20", "11", "10", "2"]],
  [1, "Normal", ["9007199254740993", "9007199254740992", "20", "2"]],
  [2, "Elevada", ["18446744073709551615", "10"]],
  [3, "Urgente", ["11"]],
] as const) {
  test(`repair list priority ${priority} ${label} filters real joined rows only after refresh and retains the draft`, async ({ page, repairServer }) => {
    const screen = await open(page, repairServer.origin);
    await screen.getByTestId("BTN_Nenhum").click();
    for (const [name, value] of Object.entries({ EDT_data_entrada_inicio: "28/02/2024 00:00", EDT_data_entrada_fim: "01/03/2024 23:59", EDT_data_entrega_inicio: "28/02/2024", EDT_data_entrega_fim: "08/03/2024" })) {
      await screen.getByTestId(name).fill(value);
    }
    await screen.getByTestId("EDT_matricula").fill("_");
    const before = await screen.getByTestId(orderTable).locator("tbody").innerText();
    const radio = screen.getByTestId("RADIO_prioridade").getByRole("radio", { name: label, exact: true });
    await radio.click(); await expect(radio).toBeChecked();
    await expect(screen.getByTestId(orderTable).locator("tbody")).toHaveText(before, { useInnerText: true });
    const request = page.waitForResponse(endpoint("list"));
    await screen.getByTestId("BTN_Actualizar_Dados").click();
    const response = await request;
    expect(response.request().postDataJSON()).toMatchObject({ priority, registration: "_", states: [] });
    expect((await response.json()).orders.map((row: { numero: string }) => row.numero)).toEqual(numbers);
    await expect(screen.getByTestId(orderTable).locator("tbody tr td:nth-child(2)")).toHaveText([...numbers]);
    await expect(radio).toBeChecked();
    await expect(screen.getByTestId("EDT_matricula")).toHaveValue("_");
  });
}
