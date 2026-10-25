import { expect, test } from "@playwright/test";

test("MIG-7C4.3 customer header prefix selects the first numeric server result with exact large codes", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(session.ok()).toBe(true); const headers = { Authorization: `Bearer ${(await session.json()).token}` };
  const prefix = `8${Date.now()}`, codes = [prefix + "2", prefix + "10"], owned: string[] = [];
  try {
    for (const Codigo of [...codes].reverse()) {
      const reply = await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo, Descricao: `Numeric order ${prefix}`, Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } });
      expect(reply.ok()).toBe(true); const result = await reply.json(); expect(result.kind).toBe("saved"); owned.push(result.customer.id);
    }
    await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
    const list = page.getByTestId("WIN_Table_Clientes"), table = list.getByTestId("TABLE_Clientes");
    await expect(list.getByTestId("Btn_New")).toBeEnabled();
    const before = await table.locator("tbody tr").count();
    await table.getByTestId("COL_Codigo__search").click();
    const read = page.waitForResponse(response => response.url().endsWith("/api/customers/list") && response.request().postDataJSON().sort === "Codigo");
    await table.getByRole("textbox").fill(prefix);
    const response = await read; expect(response.ok()).toBe(true);
    const result = await response.json(); expect(result.kind).toBe("loaded");
    expect(result.customers.filter((row: { Codigo: string | null }) => codes.includes(row.Codigo ?? "")).map((row: { Codigo: string }) => row.Codigo)).toEqual(codes);
    const displayed = codes.map(code => code.replace(/\B(?=(\d{3})+(?!\d))/g, " "));
    await expect(table.locator('tbody tr[aria-selected="true"]').getByRole("cell").first()).toHaveText(displayed[0]);
    await expect(table.locator("tbody tr")).toHaveCount(before);
    const rendered = await table.locator("tbody tr").evaluateAll(elements => elements.map(row => row.querySelector("td")?.textContent ?? ""));
    expect(rendered.filter(code => displayed.includes(code))).toEqual(displayed);
  } finally {
    for (const id of owned) {
      const reply = await request.post("/api/customers/delete", { headers, data: { id } });
      expect(reply.ok()).toBe(true); expect((await reply.json()).kind).toBe("deleted");
    }
  }
});
