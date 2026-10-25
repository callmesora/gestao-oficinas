import { expect, test, type APIRequestContext } from "@playwright/test";
import type { Customer } from "../packages/domain/src/customers";
import type { Unit } from "../packages/domain/src/units";
import type { DescriptiveState } from "../packages/domain/src/descriptive-states";
import type { Terminal } from "../packages/domain/src/terminals";

type Headers = { Authorization: string };
async function session(request: APIRequestContext): Promise<Headers> {
  const response = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(response.ok()).toBe(true);
  return { Authorization: `Bearer ${(await response.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, path: string, data: unknown): Promise<T> {
  const response = await request.post(`/api/${path}`, { headers, data });
  expect(response.ok()).toBe(true);
  return response.json() as Promise<T>;
}
async function remove(request: APIRequestContext, headers: Headers, path: string, ids: readonly string[]) {
  for (const id of ids) expect((await api<{ kind: string }>(request, headers, `${path}/delete`, { id })).kind).toBe("deleted");
}
function freeCodes(rows: readonly { Codigo: string | null }[], prefix: string, count: number): string[] {
  const used = new Set(rows.map(row => row.Codigo));
  const codes: string[] = [];
  for (let offset = 0; offset < 1296 && codes.length < count; offset++) {
    const code = prefix + ((Date.now() + offset) % 1296).toString(36).padStart(2, "0");
    if (!used.has(code) && !codes.includes(code)) codes.push(code);
  }
  expect(codes).toHaveLength(count);
  return codes;
}

test("RULE-C286277B-011 customer assistance uses current HFilter rows, deduplicates exact text and preserves deliberate free entry", async ({ page, request }) => {
  const headers = await session(request), marker = String(Date.now()), prefix = `Assist ${marker} `;
  const shared = `${prefix}shared`, other = `${prefix}other`, outside = `${prefix}outside`, oversized = prefix + "x".repeat(101);
  const scope = `Assistance scope ${marker}`, newCode = String(Date.now() % 10000000000), ids: string[] = [];
  const customerRows = async () => {
    const result = await api<{ customers: Customer[] }>(request, headers, "customers/list", { mode: "codigo", term: newCode });
    return result.customers.filter(row => row.Codigo === newCode);
  };
  try {
    for (const [index, [Descricao, Morada1]] of [[shared, scope], [shared, scope], [other, scope], [outside, "Outside assistance scope"], [oversized, scope]].entries()) {
      const seeded = await api<{ kind: string; customer: Customer }>(request, headers, "customers/save", { mode: "create", values: {
        Codigo: String(BigInt(marker) * 1000n + BigInt(index + 1)), Descricao, Morada1, Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "",
      } });
      expect(seeded.kind).toBe("saved"); ids.push(seeded.customer.id);
    }
    await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
    const list = page.getByTestId("WIN_Table_Clientes");
    await list.getByTestId("BTN_morada").click(); await list.getByTestId("EDT_termo_pesquisa").fill(scope);
    await expect(list.getByTestId("TABLE_Clientes").locator("tbody tr")).toHaveCount(4);
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await list.getByTestId("Btn_New").click();
    const form = page.getByTestId("WIN_Form_Clientes"), input = form.getByTestId("EDT_Descricao"), popup = form.getByTestId("EDT_Descricao__suggestions");
    let writes = 0;
    page.on("request", value => { if (new URL(value.url()).pathname === "/api/customers/save") writes++; });
    await form.getByTestId("EDT_Codigo").fill(newCode);
    await expect(input).toHaveAttribute("maxlength", "100"); await input.fill("x".repeat(100));
    await expect(input).toBeFocused(); // Source End of automatic input=false; capacity never advances Tab focus.
    await input.fill(prefix.toLowerCase());
    await expect(popup.getByRole("option")).toHaveCount(2);
    await expect(popup.getByRole("option", { name: shared, exact: true })).toHaveCount(1);
    await expect(popup.getByRole("option", { name: other, exact: true })).toBeVisible();
    await expect(popup.getByRole("option", { name: outside, exact: true })).toHaveCount(0);
    await expect(popup.getByRole("option", { name: oversized, exact: true })).toHaveCount(0);
    const chosen = (await popup.getByRole("option").first().textContent())!;
    await input.press("ArrowDown"); await expect(input).toHaveValue(prefix.toLowerCase());
    await input.press("Enter"); await expect(input).toHaveValue(chosen); await expect(input).toBeFocused();
    await expect(form).toBeVisible(); await expect(popup).toHaveCount(0); expect(writes).toBe(0);
    expect(await customerRows()).toEqual([]);
    await input.fill(prefix.toLowerCase()); await expect(popup).toBeVisible(); await input.press("Escape");
    await expect(popup).toHaveCount(0); await expect(form).toBeVisible(); await expect(input).toHaveValue(prefix.toLowerCase());
    expect(writes).toBe(0);
    const freeText = `${prefix}free value  `;
    await input.fill(freeText); await expect(popup).toHaveCount(0);
    const address = form.getByTestId("EDT_Morada1"); await address.fill(prefix);
    await expect(address).not.toHaveAttribute("aria-autocomplete"); await expect(form.getByRole("listbox")).toHaveCount(0);
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(writes).toBe(1);
    expect(await customerRows()).toMatchObject([{ Codigo: newCode, Descricao: freeText, Morada1: prefix }]);
    await page.reload(); await page.getByTestId("customers-open").click();
    await list.getByTestId("BTN_descricao").click(); await list.getByTestId("EDT_termo_pesquisa").fill(`${prefix}free value`);
    await expect(list.getByTestId("TABLE_Clientes").locator("tbody tr")).toHaveCount(1);
    await list.getByTestId("TABLE_Clientes").locator("tbody tr").click(); await list.getByTestId("BTN_Modificar").click();
    await expect(input).toHaveValue(freeText); await form.getByTestId("BTN_Cancelar").click();
  } finally {
    const created = (await customerRows())[0];
    await remove(request, headers, "customers", [...ids, ...(created ? [created.id] : [])]);
  }
});

test("RULE-C77806F9-010 unit pointer assistance escapes the 104px frame and marks a NULL description dirty for persistence", async ({ page, request }) => {
  const headers = await session(request), prefix = `Unit assist ${Date.now()} `;
  const rows = () => api<{ units: Unit[] }>(request, headers, "units/list", {});
  const codes = freeCodes((await rows()).units, "U", 3), ids: string[] = [];
  try {
    for (const [index, Descricao] of [`${prefix}A d'Agua  `, `${prefix}B d'Agua  `, null].entries()) {
      const saved = await api<{ kind: string; unit: Unit }>(request, headers, "units/save", { mode: "create", values: { Codigo: codes[index], Descricao } });
      expect(saved.kind).toBe("saved"); ids.push(saved.unit.id);
    }
    await page.goto("/?workflow=units"); await page.getByTestId("units-open").click();
    const list = page.getByTestId("WIN_Table_unidades"), form = page.getByTestId("WIN_Form_unidades");
    const target = list.getByRole("row").filter({ has: page.getByRole("cell", { name: codes[2], exact: true }) });
    await target.click(); await list.getByTestId("BTN_Modificar").click();
    const input = form.getByTestId("EDT_Descricao"), popup = form.getByTestId("EDT_Descricao__suggestions");
    await expect(input).toHaveValue(""); await input.focus(); await expect(popup).toHaveCount(0);
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await rows()).units.find(row => row.id === ids[2])?.Descricao).toBeNull();
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await target.click(); await list.getByTestId("BTN_Modificar").click();
    await expect(input).toHaveAttribute("maxlength", "50"); await input.fill(prefix.toLowerCase());
    await expect(popup.getByRole("option")).toHaveCount(2);
    const option = popup.getByRole("option").nth(1), accepted = (await option.textContent())!;
    const frameBounds = (await form.locator(".wd-frame").boundingBox())!, optionBounds = (await option.boundingBox())!;
    expect(frameBounds.height).toBe(104);
    expect(optionBounds.y + optionBounds.height / 2).toBeGreaterThan(frameBounds.y + frameBounds.height);
    await page.screenshot({ path: "analysis-local/c2-unit-input-suggestions.png" });
    await option.click(); // An actual hit outside the source frame; no force or DOM value setter.
    await expect(input).toHaveValue(accepted); await expect(input).toBeFocused(); await expect(popup).toHaveCount(0); await expect(form).toBeVisible();
    expect((await rows()).units.find(row => row.id === ids[2])?.Descricao).toBeNull();
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await rows()).units.find(row => row.id === ids[2])?.Descricao).toBe(accepted);
    await page.reload(); await page.getByTestId("units-open").click(); await target.click(); await list.getByTestId("BTN_Modificar").click();
    await expect(input).toHaveValue(accepted); await form.getByTestId("BTN_Cancelar").click();
  } finally { await remove(request, headers, "units", ids); }
});

test("RULE-CB7C31CC-011 descriptive-state keyboard assistance accepts exact text without validating or closing its form", async ({ page, request }) => {
  const headers = await session(request), prefix = `State assist ${Date.now()} `, accepted = `${prefix}d'Agua  `;
  const rows = () => api<{ descriptiveStates: DescriptiveState[] }>(request, headers, "descriptive-states/list", {});
  const codes = freeCodes((await rows()).descriptiveStates, "D", 2), ids: string[] = [];
  try {
    for (const [index, Descricao] of [accepted, null].entries()) {
      const saved = await api<{ kind: string; descriptiveState: DescriptiveState }>(request, headers, "descriptive-states/save", { mode: "create", values: { Codigo: codes[index], Descricao } });
      expect(saved.kind).toBe("saved"); ids.push(saved.descriptiveState.id);
    }
    await page.goto("/?workflow=descriptive-states"); await page.getByTestId("descriptive-states-open").click();
    const list = page.getByTestId("WIN_Table_estados_descritivos"), form = page.getByTestId("WIN_Form_estados_descritivos");
    const target = list.getByRole("row").filter({ has: page.getByRole("cell", { name: codes[1], exact: true }) });
    await target.click(); await list.getByTestId("BTN_Modificar").click();
    const input = form.getByTestId("EDT_Descricao"), popup = form.getByTestId("EDT_Descricao__suggestions");
    let writes = 0;
    page.on("request", value => { if (new URL(value.url()).pathname === "/api/descriptive-states/save") writes++; });
    await expect(input).toHaveAttribute("maxlength", "100"); await input.fill(prefix.toLowerCase());
    await expect(popup.getByRole("option", { name: accepted.trim(), exact: true })).toBeVisible();
    await input.press("ArrowDown"); await expect(input).toHaveValue(prefix.toLowerCase());
    await input.press("Enter"); await expect(input).toHaveValue(accepted); await expect(input).toBeFocused();
    await expect(popup).toHaveCount(0); await expect(form).toBeVisible(); expect(writes).toBe(0);
    expect((await rows()).descriptiveStates.find(row => row.id === ids[1])?.Descricao).toBeNull();
    await input.fill(prefix.toLowerCase()); await expect(popup).toBeVisible(); await input.press("Escape");
    await expect(popup).toHaveCount(0); await expect(form).toBeVisible(); await expect(input).toHaveValue(prefix.toLowerCase()); expect(writes).toBe(0);
    // Escape dismissed the list; an actual edit reopens it (filling the identical value emits no change).
    await input.press("Backspace"); await input.pressSequentially(" "); await expect(popup).toBeVisible();
    await expect(input).toHaveValue(prefix.toLowerCase()); await input.press("ArrowDown"); await input.press("Enter");
    await expect(input).toHaveValue(accepted); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(writes).toBe(1);
    expect((await rows()).descriptiveStates.find(row => row.id === ids[1])?.Descricao).toBe(accepted);
    await page.reload(); await page.getByTestId("descriptive-states-open").click(); await target.click(); await list.getByTestId("BTN_Modificar").click();
    await expect(input).toHaveValue(accepted); await form.getByTestId("BTN_Cancelar").click();
  } finally { await remove(request, headers, "descriptive-states", ids); }
});

test("RULE-CDF1C34F-012 terminal assistance accepts exact text code, preserves duplicate rules and never prepares the folder buffer", async ({ page, request }) => {
  const headers = await session(request), rows = () => api<{ terminals: Terminal[] }>(request, headers, "terminals/list", {});
  const Codigo = freeCodes((await rows()).terminals, "0", 1)[0], Descricao = "Assistance original", ids: string[] = [];
  const values = { Codigo, Descricao, codbarras_inicio: 1, codbarras_fim: 2, quant_inicio: 3, quant_fim: 4, pasta_localizacao: "", nome_ficheiro: "original.txt" };
  try {
    const saved = await api<{ kind: string; terminal: Terminal }>(request, headers, "terminals/save", { mode: "create", values });
    expect(saved.kind).toBe("saved"); ids.push(saved.terminal.id);
    let prepared = 0, writes = 0;
    page.on("request", value => {
      const path = new URL(value.url()).pathname;
      if (path === "/api/terminals/prepare-folder") prepared++;
      if (path === "/api/terminals/save") writes++;
    });
    await page.goto("/?workflow=terminals"); await page.getByTestId("terminals-open").click();
    const list = page.getByTestId("WIN_Table_Terminais"), form = page.getByTestId("WIN_Form_Terminais");
    await list.getByTestId("Btn_New").click();
    const code = form.getByTestId("EDT_Codigo"), popup = form.getByTestId("EDT_Codigo__suggestions");
    await expect(code).toHaveAttribute("maxlength", "3"); await code.fill(Codigo.slice(0, 2));
    await popup.getByRole("option", { name: Codigo, exact: true }).click();
    await expect(code).toHaveValue(Codigo); await expect(code).toBeFocused(); await expect(popup).toHaveCount(0);
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue(""); expect(prepared).toBe(0); expect(writes).toBe(0);
    await form.getByTestId("EDT_Descricao").fill("Assistance duplicate"); await form.getByTestId("BTN_Validar").click();
    await expect(page.getByTestId("LIB_INFO")).toHaveText(`Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${Codigo}`);
    await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(form).toBeVisible(); expect(prepared).toBe(0); expect(writes).toBe(1);
    expect((await rows()).terminals.find(row => row.id === ids[0])).toMatchObject(values);
    await form.getByTestId("BTN_Cancelar").click();
    const target = list.getByRole("row").filter({ has: page.getByRole("cell", { name: Codigo, exact: true }) });
    await target.click(); await list.getByTestId("BTN_Modificar").click();
    await expect(code).toHaveAttribute("readonly", ""); await code.focus();
    await expect(code).not.toHaveAttribute("aria-autocomplete"); await expect(popup).toHaveCount(0);
    for (const name of ["EDT_Descricao", "EDT_Nome_do_ficheiro", "EDT_Posicao_Inicial_do_Codigo_de_Barras"]) {
      const input = form.getByTestId(name); await input.fill("0");
      await expect(input).not.toHaveAttribute("aria-autocomplete"); await expect(form.getByRole("listbox")).toHaveCount(0);
    }
    await form.getByTestId("BTN_Cancelar").click(); await page.reload(); await page.getByTestId("terminals-open").click();
    await expect(target).toContainText(Descricao); expect(prepared).toBe(0);
    expect((await rows()).terminals.find(row => row.id === ids[0])).toMatchObject(values);
  } finally { await remove(request, headers, "terminals", ids); }
});
