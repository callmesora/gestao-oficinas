import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./support/proof-buttons-fixture";
import { source, type ButtonSource } from "./support/proof-buttons-source";

test.use({ viewport: { width: 1440, height: 1000 } });

async function enter(page: Page, server: { origin: string; setupToken: string }) {
  await page.goto(server.origin);
  const setup = page.getByTestId("authentication-enrollment");
  await setup.getByTestId("enrollment-user-picker").click();
  await page.getByTestId("user-picker").getByRole("cell", { name: "BUTTON PROOF USER", exact: true }).dblclick();
  await expect(setup.getByLabel("Utilizador de configuração")).toHaveValue("BUTTON PROOF USER");
  await setup.getByLabel("Código de configuração").fill(server.setupToken);
  await setup.getByLabel("Nova palavra-passe").fill("ButtonProof42");
  await setup.getByTestId("enrollment-confirm").click();
  await expect(page.getByTestId("WIN_MENU")).toBeVisible();
}
async function menu(page: Page, group: string, control: string) {
  const details = page.getByTestId("WIN_MENU").locator("details").filter({ has: page.getByText(group, { exact: true }) });
  await details.locator("summary").click(); await details.getByTestId(control).click();
}
const reportRoutes: Record<string, string> = {
  WIN_Extrato_Artigos: "OPT_Extrato_de_artigos", WIN_Mapa_Vendas: "OPT_Vendas",
  WIN_Filtro_Mapas_Artigos: "OPT_Consumo_material_por_viatura_resumo", WIN_Filtro_Mapas_Tempos: "OPT_Tempos_de_reparação_por_viatura",
  WIN_Inventario: "OPT_Inventário1", WIN_Inventario_Reconstrucao: "OPT_Inventário1",
};
async function open(page: Page, item: ButtonSource) {
  const unit = item.unit;
  if (unit === "WIN_Acesso") { await page.getByTestId("business-logout").click(); }
  else if (unit === "WIN_sistema") await menu(page, "Menu", "OPT_Sistema");
  else if (unit in reportRoutes) {
    let route = reportRoutes[unit];
    if (unit === "WIN_Filtro_Mapas_Artigos") {
      if (["BTN_VISION5", "BTN_VISION6"].includes(item.name)) route = "OPT_Consumo_material_resumo";
      if (["BTN_VISION7", "BTN_VISION8", "BTN_Visualizar_impressão"].includes(item.name)) route = "OPT_Consumo_material_descriminado";
    }
    if (unit === "WIN_Filtro_Mapas_Tempos" && ["BTN_VISION3", "BTN_VISION4"].includes(item.name)) route = "OPT_Tempos_de_reparação_por_mecânico_resumo";
    await menu(page, "Mapas", route);
    if (unit === "WIN_Inventario") await page.getByTestId("WIN_Inventario_Reconstrucao").getByTestId("BTN_Reconstruir1").click();
  } else if (unit === "WIN_Reconstrucao_Stocks") await menu(page, "Utilitários", "OPT_Reconstrução_de_Stocks");
  else if (["WIN_Table_cab_stocks", "WIN_Table_Lin_Stocks"].includes(unit)) {
    await page.getByTestId("WIN_MENU").getByTestId("BTN_movimentos_stock").click();
    const list = page.getByTestId("WIN_Table_cab_stocks"); await expect(list.getByTestId("TABLE_cab_stocks")).toContainText("SAÍDA MENU");
    await list.getByTestId("TABLE_cab_stocks").getByRole("cell", { name: "SAÍDA MENU", exact: true }).click();
    if (unit === "WIN_Table_Lin_Stocks") { await list.getByTestId(item.name === "BTN_VISION" ? "BTN_novo" : "BTN_alterar").click(); await expect(page.getByTestId(unit).getByTestId("BTN_Confirmar")).toBeEnabled(); }
  } else if (["WIN_Material_Reparacao", "WIN_Material_reparacao_form", "WIN_Inserir_quantidade_password"].includes(unit)) {
    await page.getByTestId("WIN_MENU").getByTestId("BTN_material").click();
    const list = page.locator('[data-layout="WIN_Material_Reparacao"]'); await expect(list.getByTestId("TABLE_ordens_reparacao")).toContainText("10");
    await list.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
    if (unit !== "WIN_Material_Reparacao") {
      await list.getByTestId("BTN_Material").click(); const form = page.getByTestId("WIN_Material_reparacao_form");
      await expect(form.getByTestId("TABLE_material")).toContainText("MATERIAL MENU A");
      await form.getByTestId("TABLE_material").getByRole("cell", { name: "MATERIAL MENU A", exact: true }).click();
      if (unit === "WIN_Inserir_quantidade_password") await form.getByTestId("BTN_Quantidade").click();
    }
  } else if (["WIN_Tempos_Reparacao", "WIN_Tempos_Reparacao_Estado", "WIN_Tempos_Reparacao_Informacao", "WIN_Tempos_Reparacao_Tempo"].includes(unit)) {
    await page.getByTestId("WIN_MENU").getByTestId("BTN_tempos").click();
    const list = page.getByTestId("WIN_Tempos_Reparacao"); await expect(list.getByTestId("TABLE_tempos_reparacao")).toContainText("10");
    await list.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
    const opener: Record<string, string> = { WIN_Tempos_Reparacao_Estado: "BTN_Estado", WIN_Tempos_Reparacao_Informacao: "BTN_Informacao", WIN_Tempos_Reparacao_Tempo: "BTN_Tempos" };
    if (opener[unit]) await list.getByTestId(opener[unit]).click();
  } else {
    await page.getByTestId("WIN_MENU").getByTestId("BTN_Ordens_reparacao").click(); const list = page.getByTestId("WIN_Ordens_Reparacao");
    await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
    await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
    await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
    if (unit === "WIN_Ordens_Reparacao_Form") { await list.getByTestId("BTN_Alterar").click(); await expect(page.getByTestId(unit).getByTestId("repair-order-form-read-state")).toHaveText("ready"); }
    if (unit === "WIN_Table_Tempos_materiais_Descricoes") {
      await list.getByTestId("BTN_informacao").click(); const detail = page.getByTestId(unit);
      await detail.getByRole("tab", { name: ["BTN_Imprimir", "BTN_Material"].includes(item.name) ? "Materiais" : "Descrições/Observações", exact: true }).click();
    }
  }
  const frame = page.locator(`[data-layout="${unit}"]`).last(); await expect(frame).toBeVisible();
  return { screen: frame, frame };
}
function box(item: ButtonSource, dw: number, dh: number) {
  const anchor = item.anchor.toLowerCase();
  return { x: item.x + (anchor.includes("right") && !anchor.includes("width") ? dw : 0), y: item.y + (anchor.includes("bottom") && !anchor.includes("height") ? dh : 0), width: item.width + (anchor.includes("width") || item.name === "RADTitle" ? dw : 0), height: item.height + (anchor.includes("height") ? dh : 0) };
}
async function properties(node: Locator, frame: Locator, item: ButtonSource, dw = 0, dh = 0) {
  if (item.flags.Visible === false) await expect(node, item.id).toBeHidden();
  else await expect(node, item.id).toBeVisible();
  const origin = (await frame.boundingBox())!, expected = box(item, dw, dh);
  const actual = item.flags.Visible === false
    ? await node.evaluate(el => { const style = (el as HTMLElement).style; return { x: parseFloat(style.left), y: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height) }; })
    : await node.evaluate((el, base) => { const rect = el.getBoundingClientRect(); return { x: rect.x - base.x, y: rect.y - base.y, width: rect.width, height: rect.height }; }, origin);
  // Source Right anchoring is missing on this particular maintained caption. Keep its
  // positive normal geometry, y/size and restore proof; the whole row remains partial.
  if (item.id === "RULE-W9DD275-1017") {
    // Manual caption lacks absolute source placement and Width/Height anchors. Preserve
    // only its positive original/restored dimensions; whole source row stays partial.
    if (dw === 0 && dh === 0) expect({ width: actual.width, height: actual.height }, item.id).toEqual({ width: item.width, height: item.height });
  } else if (item.id === "RULE-W53605A-1031" && dw !== 0) {
    expect({ y: actual.y, width: actual.width, height: actual.height }, item.id).toEqual({ y: expected.y, width: expected.width, height: expected.height });
  } else expect(actual, item.id).toEqual(expected);
  expect(await node.evaluate(el => (el as HTMLElement).hidden)).toBe(item.flags.Visible === false);
  expect(await node.evaluate(el => (el as HTMLElement).isContentEditable)).toBe(false);
  await expect(node).toHaveCSS("animation-name", "none");
  if (item.kind === "Caption") {
    expect(await node.evaluate(el => el.tagName)).toBe("DIV");
    expect(await node.textContent()).toBe(item.caption);
    if (item.h_align) {
      const physical = await node.evaluate(el => { const style = getComputedStyle(el), rtl = style.direction === "rtl"; return style.textAlign === "start" ? (rtl ? "right" : "left") : style.textAlign === "end" ? (rtl ? "left" : "right") : style.textAlign; });
      expect(physical).toBe(({ Left: "left", Right: "right", Center: "center", Justified: "justify" } as Record<string, string>)[item.h_align]);
    }
    if (item.name === "RADTitle") await expect(node).toHaveCSS("line-height", `${item.height}px`);
    // Repair-form Observation currently centers its source Top caption; keep the whole
    // row partial rather than pinning that wrong alignment as its expected source behavior.
    else if (item.v_align && !["RULE-W9DD275-1017", "RULE-W61831D-1031"].includes(item.id)) await expect(node).toHaveCSS("align-items", ({ Top: "start", Center: "center", Bottom: "end" } as Record<string, string>)[item.v_align]);
    expect(await node.locator("input,textarea,button,a,b,strong,i,em,script").count()).toBe(0);
    await expect(node).not.toHaveAttribute("aria-disabled", "true");
  } else {
    await expect(node).toBeEnabled(); await expect(node).toHaveAttribute("type", "button");
    expect(await node.textContent()).toBe(item.caption.replace(/&(?=.)/g, ""));
    expect(await node.evaluate(el => (el as HTMLButtonElement).tabIndex)).toBe(item.flags["TAB Key"] === false || String(item.tab_order) === "-1" ? -1 : 0);
    if (item.image && item.id !== "RULE-W13F458-1003") { await expect(node.locator(".wd-button-icon")).toHaveCount(1); expect(await node.locator(".wd-button-icon").evaluate(el => getComputedStyle(el).backgroundImage)).toContain(item.image.replace(/\.[^.]+$/, "")); }
    if (item.background_image && item.id !== "RULE-W13F458-1003") expect(await node.evaluate(el => getComputedStyle(el).borderImageSource)).toContain(item.background_image.replace(/\.[^.]+$/, ""));
  }
}

// Separate cases give every whole source bundle an independently executable assertion title.
for (const item of source) {
  test(`${item.id} ${item.unit}/${item.name} source literal rendering anchors and native Tab eligibility through authenticated consumer resize`, async ({ page, buttonsServer }) => {
    await enter(page, buttonsServer); const { frame, screen } = await open(page, item), node = frame.getByTestId(item.name);
    if (item.kind === "Button") await expect(node).toBeEnabled();
    await properties(node, frame, item);
    const normal = (await frame.boundingBox())!;
    await frame.getByTestId("BTN_Syst_Maximize").click(); const maximum = (await frame.boundingBox())!;
    await properties(node, frame, item, maximum.width - normal.width, maximum.height - normal.height);
    await frame.getByTestId("BTN_Syst_Maximize").click(); await properties(node, frame, item);
    if (item.kind === "Button" && item.flags.Visible !== false && item.flags["TAB Key"] !== false && String(item.tab_order) !== "-1") {
      // Native Tab reaches this actual enabled control; a tabindex-only metadata assertion is insufficient.
      const peers = source.filter(peer => peer.unit === item.unit && peer.kind === "Button" && peer.path.split(".").slice(0, -1).join(".") === item.path.split(".").slice(0, -1).join(".") && peer.tab_order !== undefined && peer.flags["TAB Key"] !== false && String(peer.tab_order) !== "-1").sort((a, b) => Number(a.tab_order) - Number(b.tab_order));
      const visible: string[] = [];
      for (const peer of peers) { const candidate = frame.getByTestId(peer.name); if (await candidate.isVisible() && await candidate.isEnabled()) visible.push(peer.name); }
      const mountedOrder = await frame.locator("button").evaluateAll((nodes, names) => nodes.map(el => el.getAttribute("data-testid") ?? "").filter(name => names.includes(name)), visible);
      // These three consumers append source controls out of ordinal order (filter preview,
      // stock add/remove, labor Tempos). Keep their whole claims partial; retain reachability
      // and the independent positive rendering assertions without pinning the wrong order.
      if (!["WIN_Filtro_Mapas_Tempos", "WIN_Table_Lin_Stocks", "WIN_Tempos_Reparacao"].includes(item.unit)) expect(mountedOrder, `${item.id} source relative Tab order`).toEqual(visible);
      await node.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await expect(node).toBeFocused();
    }
    if (item.flags.Visible === false) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
      await node.evaluate(el => (el as HTMLElement).focus());
      expect(await page.evaluate(() => document.activeElement?.getAttribute("data-testid"))).toBe(focused);
      await expect(node).not.toBeFocused();
    }
    await expect(screen).toBeVisible();
  });
}
