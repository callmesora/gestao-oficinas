import { expect, type Locator, type Page } from "@playwright/test";
import type { Client } from "pg";
import { proofTables, type ProofTable } from "./proof-tables-source";

export { proofTables };

export async function seedProofTables(database: Client) {
  await database.query(`INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','Unidade');
    INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES
      ('A','Alfa artigo','BAR-A','UN',2,2.125,false),('Z','Zulu artigo','BAR-Z','UN',10,1234567890123.1234567890123456789,false);
    INSERT INTO app."documentos" ("Codigo","Descricao","stock","obriga_macanico") VALUES ('E','Entrada Alfa',1,false),('S','Saída Zulu',2,false);
    INSERT INTO app."Terminais" ("Codigo","Descricao","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim","nome_ficheiro") VALUES ('P01','Leitor sintético',1,8,9,50,'proof-tables.txt');
    INSERT INTO app."postos" ("Codigo","Descricao","terminal") VALUES (1,'Posto sintético','P01');
    INSERT INTO app."cab_stocks" ("cab_stocksID","documento_codigo","documento_numero","data","Descricao") VALUES
      (1,'E',2,'20261026','Alfa cabeçalho'),(2,'S',10,'20261027','Zulu cabeçalho');
    INSERT INTO app."lin_stocks" ("lin_stocksID","documento_codigo","documento_numero","linha","artigo","descricao_artigo","quantidade","preco") VALUES
      (1,'E',2,1,'A','Alfa linha',2.125,2.25),(2,'E',2,2,'Z','Zulu linha',10.25,10.5)`);
}

export async function openProofTable(page: Page, origin: string, route: string, launch: string, unit: string, table: string) {
  await page.goto(`${origin}/?workflow=${route}`); await page.getByTestId(launch).click();
  const screen = page.getByTestId(unit), grid = screen.getByTestId(table);
  await expect(grid).toBeVisible(); return { screen, grid };
}

/** Source values above are literals, while these checks inspect rendered production cells. */
export async function proofTableContract(grid: Locator, source: ProofTable, options: { headers?: boolean; editable?: string[] } = {}) {
  const headers = options.headers !== false, columns = source.columns.filter(column => column.visible);
  await expect(grid).toBeVisible(); await expect(grid).toHaveAttribute("tabindex", "0");
  if (source.caption) await expect(grid.locator("table")).toHaveAttribute("aria-label", source.caption);
  for (const [property, value] of Object.entries({ left: source.x, top: source.y, width: source.width, height: source.height })) {
    if (value !== undefined) await expect(grid, source.id + " " + property).toHaveCSS(property, `${value}px`);
  }
  if (headers) await expect(grid.locator("thead")).toBeVisible();
  else await expect(grid.locator("thead")).toBeHidden();
  // Source-hidden fields never become an exposed header, editor or settings option.
  for (const column of source.columns.filter(column => !column.visible)) {
    await expect(grid.getByTestId(column.name), column.id).toHaveCount(0);
    await expect(grid.getByTestId(`${column.name}__search`)).toHaveCount(0);
    await expect(grid.getByTestId(`${column.name}__resize`)).toHaveCount(0);
  }
  const th = grid.locator("thead th"); await expect(th).toHaveCount(columns.length);
  for (const [index, column] of columns.entries()) {
    const header = grid.getByTestId(column.name);
    await expect(th.nth(index), column.id + " source order").toHaveAttribute("data-testid", column.name);
    await expect(header, column.id + " title").toHaveText(column.title);
    if (column.width !== undefined) await expect(header, column.id + " width").toHaveCSS("width", `${column.width}px`);
    await expect(header.locator("[draggable]")).toHaveAttribute("draggable", String(column.movable));
    await expect(header.getByRole("separator", { includeHidden: true })).toHaveCount(column.resize ? 1 : 0);
    await expect(header.getByTestId(`${column.name}__search`)).toHaveCount(column.search ? 1 : 0);
    if (column.sort) { await expect(header.locator("button").first()).toHaveText(column.title); await expect(header.locator("button").first()).toBeEnabled(); }
    else await expect(header.locator(".wd-searchable-caption")).toHaveCount(0);
    const cells = grid.locator(`tbody tr:not([aria-hidden]) td:nth-child(${index + 1})`);
    expect(await cells.count(), column.id + " loaded binding").toBeGreaterThan(0);
    for (const cell of await cells.all()) {
      if (column.h_align) await expect(cell, column.id + " alignment").toHaveCSS("text-align", column.h_align.toLowerCase());
      if (column.v_align) await expect(cell, column.id + " vertical alignment").toHaveCSS("vertical-align", column.v_align === "Center" ? "middle" : column.v_align.toLowerCase());
      await expect(cell).toHaveCSS("white-space", "nowrap");
      await expect(cell.locator("textarea,[contenteditable='true']")).toHaveCount(0);
      if (!options.editable?.includes(column.name)) await expect(cell.locator("input,select")).toHaveCount(0);
    }
  }
  // Selection is a single complete row and navigation changes identity, not cell content.
  const rows = grid.locator("tbody tr:not([aria-hidden])");
  const before = await rows.allTextContents();
  await rows.first().click(); await expect(grid.locator('tbody tr[aria-selected="true"]')).toHaveCount(1);
  await expect(grid.locator('tbody tr[aria-selected="true"]')).toHaveText(before[0]);
  if (before.length > 1) {
    await grid.press("ArrowDown"); await expect(grid.locator('tbody tr[aria-selected="true"]')).toHaveText(before[1]);
    await grid.press("ArrowUp"); await expect(grid.locator('tbody tr[aria-selected="true"]')).toHaveText(before[0]);
  }
  expect(await rows.allTextContents()).toEqual(before);
}

export async function proofSortAndSeek(grid: Locator, name: string, ascending: string[], seek: string, selectedText: string) {
  const header = grid.getByTestId(name), caption = header.locator(".wd-searchable-caption");
  const values = async () => {
    const index = await header.evaluate(element => Array.from(element.parentElement!.children).indexOf(element));
    return grid.locator(`tbody tr:not([aria-hidden]) td:nth-child(${index + 1})`).allTextContents();
  };
  const descending = [...ascending].reverse(); await caption.click();
  await expect.poll(async () => { const actual = await values(); return JSON.stringify(actual) === JSON.stringify(ascending) || JSON.stringify(actual) === JSON.stringify(descending); }).toBe(true);
  const first = await values(); await caption.click();
  await expect.poll(values).toEqual([...first].reverse());
  await header.getByTestId(`${name}__search`).click(); await header.getByRole("textbox").fill(seek);
  await expect(grid.locator('tbody tr[aria-selected="true"]')).toContainText(selectedText);
  const count = ascending.length; await expect(grid.locator("tbody tr:not([aria-hidden])")).toHaveCount(count);
  await header.getByRole("textbox").press("Enter"); await expect(grid).toBeFocused();
}

export async function proofColumnConfiguration(grid: Locator, source: ProofTable, reopen: () => Promise<void>) {
  const columns = source.columns.filter(column => column.visible), movable = columns.filter(column => column.movable), resizable = columns.filter(column => column.resize && column.width !== undefined);
  const snapshots = async () => ({ order: await grid.locator("thead th").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-testid"))), cells: await grid.locator("tbody tr:not([aria-hidden])").first().locator("td").allTextContents() });
  for (const column of resizable) {
    const header = grid.getByTestId(column.name), separator = header.getByRole("separator");
    await separator.press("ArrowRight"); await expect(header).toHaveCSS("width", `${column.width! + 8}px`);
    await separator.press("Shift+ArrowLeft"); await expect(header).toHaveCSS("width", `${column.width! + 7}px`);
  }
  if (movable.length > 1) {
    const first = grid.getByTestId(movable[0].name), second = grid.getByTestId(movable[1].name);
    const firstCell = (await snapshots()).cells[columns.indexOf(movable[0])];
    await first.locator("[draggable]").press("Control+Shift+ArrowRight");
    const moved = await snapshots(); expect(moved.order.indexOf(movable[0].name)).toBe(columns.indexOf(movable[0]) + 1);
    expect(moved.cells[columns.indexOf(movable[0]) + 1]).toBe(firstCell);
    await second.locator("[draggable]").dragTo(first.locator("[draggable]"));
    expect((await snapshots()).order).toEqual(columns.map(column => column.name));
    await first.locator("[draggable]").press("Control+Shift+ArrowRight");
    expect((await snapshots()).order).not.toEqual(columns.map(column => column.name));
  }
  const before = await snapshots();
  await reopen();
  expect((await snapshots()).order).toEqual(source.save ? before.order : columns.map(column => column.name));
  for (const column of resizable) await expect(grid.getByTestId(column.name)).toHaveCSS("width", `${column.width! + (source.save ? 7 : 0)}px`);
  if (source.save) {
    await grid.getByRole("button", { name: "Colunas", exact: true }).click();
    const settings = grid.getByRole("group", { name: "Colunas", exact: true });
    await expect(settings.getByRole("checkbox")).toHaveCount(columns.length);
    // Change visibility through actual settings and prove both header and cell disappear.
    if (columns.length > 1) {
      await settings.locator("label").last().getByRole("checkbox").uncheck();
      await expect(grid.locator("thead th")).toHaveCount(columns.length - 1);
      await expect(grid.locator("tbody tr:not([aria-hidden])").first().locator("td")).toHaveCount(columns.length - 1);
      await settings.locator("label").last().getByRole("checkbox").check();
    }
    await settings.getByRole("button", { name: "Repor", exact: true }).click();
    expect((await snapshots()).order).toEqual(columns.map(column => column.name));
    for (const column of resizable) await expect(grid.getByTestId(column.name)).toHaveCSS("width", `${column.width}px`);
  } else await expect(grid.getByRole("button", { name: "Colunas", exact: true })).toHaveCount(0);
}
