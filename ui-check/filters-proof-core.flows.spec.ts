import type { Locator } from "@playwright/test";
import { test, expect } from "./support/startup";

async function sourceFonts(list: Locator, modes: readonly string[], selected: string) {
  const family = await list.getByTestId(`BTN_${selected}`).evaluate(node => getComputedStyle(node).fontFamily);
  for (const mode of modes) {
    const button = list.getByTestId(`BTN_${mode}`), active = mode === selected;
    await expect(button).toHaveCSS("font-family", family);
    expect(await button.evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeCloseTo(8 * 96 / 72, 2);
    await expect(button).toHaveCSS("font-weight", active ? "700" : "400");
    await expect(button).toHaveCSS("color", active ? "rgb(0, 0, 139)" : "rgb(0, 0, 0)");
    await expect(button).toHaveCSS("text-decoration-line", active ? "underline" : "none");
  }
}

test("SRC-791c1f6c3f SRC-284e9feb26 actual customer modes reset every font focus and exact multi-field filter without mutating stored strings", async ({ page, request, startupServer }) => {
  const origin = startupServer.origin;
  const response = await request.post(`${origin}/api/development/session`, { headers: { Origin: origin, "X-Isolated-Development": "1" } });
  const headers = { Authorization: `Bearer ${(await response.json()).token}` };
  const records = [
    { Codigo: "81", Descricao: "Açores d'Água", Morada1: "Rua Alfa", Morada2: "Porto", codpostal: "1000-001", Telefone1: "210000001", Telemovel: "910000001", observacao: "Memo Alfa" },
    { Codigo: "82", Descricao: "Beta", Morada1: "Rua Beta", Morada2: "  Açores d'Água  ", codpostal: "2000-002", Telefone1: "220000002", Telemovel: "  Açores d'Água  ", observacao: "Memo Beta" },
    { Codigo: "83", Descricao: "Other", Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null },
  ];
  for (const values of records) expect((await (await request.post(`${origin}/api/customers/save`, { headers, data: { mode: "create", values } })).json()).kind).toBe("saved");
  await page.goto(`${origin}/?workflow=customers`); await page.getByTestId("customers-open").click();
  const list = page.getByTestId("WIN_Table_Clientes"), input = list.getByTestId("EDT_termo_pesquisa"), table = list.getByTestId("TABLE_Clientes"), modes = ["todos", "codigo", "descricao", "morada", "codigopostal", "telefone"];
  await expect(list.getByTestId("Btn_New")).toBeEnabled(); await sourceFonts(list, modes, "todos");
  const cases = [
    ["codigo", "82", ["Beta"]], ["descricao", "d'Água", ["Açores d'Água"]], ["morada", "d'Água", ["Beta"]],
    ["morada", "Alfa", ["Açores d'Água"]], ["codigopostal", "2000-002", ["Beta"]], ["telefone", "d'Água", ["Beta"]],
    ["telefone", "210000001", ["Açores d'Água"]], ["todos", "no matching source text", records.map(row => row.Descricao)],
  ] as const;
  for (const [mode, term, matches] of cases) {
    await list.getByTestId(`BTN_${mode}`).click(); await expect(input).toHaveValue(""); await expect(input).toBeFocused(); await sourceFonts(list, modes, mode);
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(3);
    const loaded = page.waitForResponse(item => item.url().endsWith("/api/customers/list") && item.request().postDataJSON().term === term);
    await input.fill(term); const data = await (await loaded).json(); expect(data.kind).toBe("loaded"); expect(data.customers.map((row: { Descricao: string }) => row.Descricao).sort()).toEqual([...matches].sort());
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect((await table.locator("tbody tr").allTextContents()).length).toBe(matches.length); await expect(input).toHaveValue(term); await expect(input).toBeFocused();
    await input.fill(""); await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(3);
  }
  const live = await (await request.post(`${origin}/api/customers/list`, { headers, data: { mode: "todos", term: "" } })).json();
  for (const original of records) expect(live.customers.find((row: { Codigo: string }) => row.Codigo === original.Codigo)).toMatchObject(original);
});

test("SRC-65d96751d7 actual vehicle mode events reset every font and retain the effective query until the next source input event", async ({ page, request, startupServer }) => {
  const origin = startupServer.origin;
  const response = await request.post(`${origin}/api/development/session`, { headers: { Origin: origin, "X-Isolated-Development": "1" } }); const headers = { Authorization: `Bearer ${(await response.json()).token}` };
  const post = async (path: string, data: unknown) => { const response = await request.post(`${origin}/api/${path}`, { headers, data }); expect(response.ok()).toBe(true); return response.json(); };
  for (const [Codigo, Descricao] of [["1", "  Açores d'Água  "], ["2", "Other owner"]]) expect((await post("customers/save", { mode: "create", values: { Codigo, Descricao, Morada1: null, Morada2: null, codpostal: null, Telefone1: null, Telemovel: null, observacao: null } })).kind).toBe("saved");
  const records = [
    { matricula: "PF-A", Cliente: "1", marca: "Alpha", modelo: "Açores d'Água", Ano: 2020, mes: 1 },
    { matricula: "PF-B", Cliente: "2", marca: "Açores d'Água", modelo: "Beta", Ano: 2021, mes: 2 },
    { matricula: "PF-C", Cliente: "2", marca: "Other", modelo: "Gamma", Ano: 2022, mes: 3 },
  ];
  try {
    for (const values of records) expect((await post("vehicles/save", { mode: "create", values })).kind).toBe("saved");
    await page.goto(`${origin}/?workflow=vehicles`); await page.getByTestId("vehicles-open").click();
    const list = page.getByTestId("WIN_Table_Viaturas"), input = list.getByTestId("EDT_termo_pesquisa"), table = list.getByTestId("TABLE_Viaturas"), modes = ["todos", "matricula", "cliente", "marca_modelo"];
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await sourceFonts(list, modes, "todos"); await expect(input).toBeFocused();
    for (const [mode, term, expected] of [["matricula", "PF-C", ["PF-C"]], ["cliente", "d'Água", ["PF-A"]], ["marca_modelo", "d'Água", ["PF-A", "PF-B"]], ["todos", "d'Água", ["PF-A", "PF-B", "PF-C"]]] as const) {
      const oldRows = await table.locator("tbody tr").allTextContents();
      await list.getByTestId(`BTN_${mode}`).click(); await expect(input).toHaveValue(""); await expect(input).toBeFocused(); await sourceFonts(list, modes, mode); await expect(list.getByTestId("Btn_New")).toBeEnabled();
      if (mode === "todos") await expect(table.locator("tbody tr")).toHaveCount(3); else expect(await table.locator("tbody tr").allTextContents()).toEqual(oldRows);
      const loaded = page.waitForResponse(item => item.url().endsWith("/api/vehicles/list") && item.request().postDataJSON().mode === mode && item.request().postDataJSON().term === term);
      await input.fill(term); const data = await (await loaded).json(); expect(data.kind).toBe("loaded"); expect(data.vehicles.map((row: { matricula: string }) => row.matricula).sort()).toEqual([...expected]);
      await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(expected.length); await expect(input).toHaveValue(term);
    }
    await input.fill(""); await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(3);
    const live = await post("vehicles/list", { mode: "todos", term: "" }); for (const original of records) expect(live.vehicles.find((row: { matricula: string }) => row.matricula === original.matricula)).toMatchObject(original);
  } finally { for (const row of records) expect(["deleted", "missing"]).toContain((await post("vehicles/delete", { registration: row.matricula })).kind); }
});
