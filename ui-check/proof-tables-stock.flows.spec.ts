import { test, expect } from "./support/functional-operations";
import { openProofTable, proofColumnConfiguration, proofSortAndSeek, proofTableContract, proofTables, seedProofTables } from "./support/proof-tables";

test.setTimeout(120_000);
test.beforeEach(async ({ operations }) => { await seedProofTables(operations.database); });

for (const behavior of ["bindings and source geometry", "sorting search and saved configuration"] as const) {
  test(`proof tables inventory actual ${behavior}`, async ({ page, operations }) => {
    const open = async () => {
      await page.goto(`${operations.origin}/?workflow=inventory`); await page.getByTestId("inventory-open").click();
      await page.getByTestId("WIN_Inventario_Reconstrucao").getByTestId("BTN_Reconstruir1").click();
      await expect(page.getByTestId("WIN_Inventario").getByTestId("TABLE_Artigos").locator("tbody tr")).toHaveCount(2);
    };
    await open(); const grid = page.getByTestId("WIN_Inventario").getByTestId("TABLE_Artigos"), source = proofTables["WIN_Inventario/TABLE_Artigos"];
    if (behavior === "bindings and source geometry") {
      await proofTableContract(grid, source);
      expect(await grid.locator("tbody tr").allTextContents()).toEqual(["AAlfa artigo2,125", "ZZulu artigo1 234 567 890 123,1234567890123456789"]);
      const before = (await grid.boundingBox())!; await page.getByTestId("WIN_Inventario").getByTestId("BTN_Syst_Maximize").click();
      const after = (await grid.boundingBox())!; expect(after.width).toBe(before.width + 350); expect(after.height).toBe(before.height + 198);
      await expect(grid.getByTestId("COL_Codigo")).toHaveCSS("width", "160px");
      await expect(grid.getByTestId("COL_Descricao")).toHaveCSS("width", "327px");
      await expect(grid.getByTestId("COL_Stock")).toHaveCSS("width", "86px");
    } else {
      await proofSortAndSeek(grid, "COL_Codigo", ["A", "Z"], "Z", "Zulu artigo");
      await proofSortAndSeek(grid, "COL_Descricao", ["Alfa artigo", "Zulu artigo"], "Zulu", "Zulu artigo");
      await proofSortAndSeek(grid, "COL_Stock", ["2,125", "1 234 567 890 123,1234567890123456789"], "1234567890123.123", "Zulu artigo");
      await proofColumnConfiguration(grid, source, open);
    }
    expect((await operations.database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: "A", stock: "2.125" }, { Codigo: "Z", stock: "1234567890123.1234567890123456789" }]);
  });
}

for (const unknown of [false, true]) {
  const unit = unknown ? "WIN_Leitor_cod_barras_desconhecidos" : "WIN_Leitor_cod_barras";
  for (const behavior of ["bindings and source geometry", "sorting search and saved configuration"] as const) test(`proof tables ${unit} actual ${behavior}`, async ({ page, operations }) => {
    const open = async () => {
      await page.goto(`${operations.origin}/?workflow=stock-scanner`);
      const text = `ALFA    2.125 \r\nZULU    10.25 \r\nLONG    1234567.123456\r\n`;
      await page.getByTestId("stock-scanner-file").setInputFiles({ name: "proof-tables.txt", mimeType: "text/plain", buffer: Buffer.from(text) });
      const reader = page.getByTestId("WIN_Leitor_cod_barras"); await expect(reader.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(3);
      if (unknown) await reader.getByTestId("BTN_Confirmar").click();
      await expect(page.getByTestId(unit).getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(3);
    };
    await open(); const grid = page.getByTestId(unit).getByTestId("TABLE_Leitura"), source = proofTables[`${unit}/TABLE_Leitura`];
    if (behavior === "bindings and source geometry") {
      await proofTableContract(grid, source);
      expect(await grid.locator("tbody tr").allTextContents()).toEqual(["ALFA2,125", "ZULU10,250", "LONG1234567,123456"]);
    } else {
      await proofSortAndSeek(grid, "COL_cod_barras", ["ALFA", "LONG", "ZULU"], "ZUL", "ZULU");
      await proofSortAndSeek(grid, "COL_quantidade", ["2,125", "10,250", "1234567,123456"], "1234567.123456", "LONG");
      await proofColumnConfiguration(grid, source, open);
    }
    expect((await operations.database.query('SELECT count(*)::integer AS count FROM app."lin_stocks"')).rows[0].count).toBe(2);
  });
}

for (const behavior of ["bindings and source geometry", "sorting search and saved configuration"] as const) test(`proof tables stock headers actual ${behavior}`, async ({ page, operations }) => {
  const open = async () => { await openProofTable(page, operations.origin, "stock", "stock-open", "WIN_Table_cab_stocks", "TABLE_cab_stocks"); };
  await open(); const grid = page.getByTestId("WIN_Table_cab_stocks").getByTestId("TABLE_cab_stocks"), source = proofTables["WIN_Table_cab_stocks/TABLE_cab_stocks"];
  await expect(grid.locator("tbody tr")).toHaveCount(2);
  if (behavior === "bindings and source geometry") {
    await proofTableContract(grid, source);
    expect((await grid.locator("tbody tr").allTextContents()).sort()).toEqual(["Entrada Alfa226/10/2026Alfa cabeçalho", "Saída Zulu1027/10/2026Zulu cabeçalho"]);
  } else {
    await proofSortAndSeek(grid, "COL_Tipo_doc", ["Entrada Alfa", "Saída Zulu"], "Saída", "Zulu cabeçalho");
    await proofSortAndSeek(grid, "COL_Numero", ["2", "10"], "10", "Zulu cabeçalho");
    await proofSortAndSeek(grid, "COL_data", ["26/10/2026", "27/10/2026"], "27/10", "Zulu cabeçalho");
    await proofSortAndSeek(grid, "COL_descricao", ["Alfa cabeçalho", "Zulu cabeçalho"], "Zulu", "Zulu cabeçalho");
    await proofColumnConfiguration(grid, source, open);
  }
});

for (const behavior of ["bindings and source geometry", "sorting search and saved configuration"] as const) test(`proof tables stock lines actual ${behavior}`, async ({ page, operations }) => {
  const open = async () => {
    await openProofTable(page, operations.origin, "stock", "stock-open", "WIN_Table_cab_stocks", "TABLE_cab_stocks");
    await page.getByTestId("WIN_Table_cab_stocks").getByRole("cell", { name: "Alfa cabeçalho", exact: true }).dblclick();
    await expect(page.getByTestId("WIN_Table_Lin_Stocks").getByTestId("TABLE_lin_Stocks").locator("tbody tr")).toHaveCount(2);
  };
  await open(); const grid = page.getByTestId("WIN_Table_Lin_Stocks").getByTestId("TABLE_lin_Stocks"), source = proofTables["WIN_Table_Lin_Stocks/TABLE_lin_Stocks"];
  if (behavior === "bindings and source geometry") {
    await proofTableContract(grid, source, { editable: ["COL_Quant", "COL_Preco"] });
    expect(await grid.getByRole("textbox").evaluateAll(nodes => nodes.map(node => (node as HTMLInputElement).value))).toEqual(["2,125", "2,25", "10,250", "10,50"]);
  } else {
    await proofSortAndSeek(grid, "COL_Codigo", ["A", "Z"], "Z", "Zulu linha");
    await proofSortAndSeek(grid, "COL_Descricao", ["Alfa linha", "Zulu linha"], "Zulu", "Zulu linha");
    // Inline decimal adapters have their own input semantics; resize/order persistence still exercises the actual editor cells.
    await proofColumnConfiguration(grid, source, open);
    await grid.getByTestId("COL_Quant-0").fill("3,125");
    await grid.getByTestId("COL_Preco-0").fill("4,75");
    await expect(grid.getByTestId("COL_Quant-0")).toHaveValue("3,125");
    expect((await operations.database.query('SELECT "quantidade"::text,"preco"::text FROM app."lin_stocks" ORDER BY "linha"')).rows).toEqual([{ quantidade: "2.125", preco: "2.25" }, { quantidade: "10.25", preco: "10.5" }]);
  }
});

test("proof tables inventory actual 622 row API result virtualizes without losing far seek keyboard identity or exact decimals", async ({ page, operations }) => {
  await operations.database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","stock","inativo")
    SELECT 'F'||lpad(i::text,4,'0'),'Artigo virtual '||i::text,i::numeric+0.125,false FROM generate_series(0,619) AS i`);
  await page.goto(`${operations.origin}/?workflow=inventory`); await page.getByTestId("inventory-open").click();
  await page.getByTestId("WIN_Inventario_Reconstrucao").getByTestId("BTN_Reconstruir1").click();
  const grid = page.getByTestId("WIN_Inventario").getByTestId("TABLE_Artigos");
  await expect(grid.locator("table")).toHaveAttribute("aria-rowcount", "623");
  const rendered = grid.locator('tbody tr[aria-selected]');
  await expect.poll(() => rendered.count()).toBeGreaterThan(1); expect(await rendered.count()).toBeLessThan(80);
  await grid.getByTestId("COL_Codigo").locator(".wd-searchable-caption").click();
  await grid.getByTestId("COL_Codigo__search").click(); await grid.getByRole("textbox").fill("F0619");
  const selected = grid.locator('tbody tr[aria-selected="true"]');
  await expect(selected).toHaveText("F0619Artigo virtual 619619,125");
  await expect(selected).toBeInViewport(); await grid.getByRole("textbox").press("Enter");
  await grid.press("ArrowUp"); await expect(selected).toHaveText("F0618Artigo virtual 618618,125");
  await grid.press("ArrowDown"); await expect(selected).toHaveText("F0619Artigo virtual 619619,125");
  await grid.press("ArrowDown"); await expect(selected).toHaveText("ZZulu artigo1 234 567 890 123,1234567890123456789");
  await expect(selected).toBeInViewport(); expect(await rendered.count()).toBeLessThan(80);
  expect((await operations.database.query('SELECT count(*)::integer AS count FROM app."artigos"')).rows[0].count).toBe(622);
});
