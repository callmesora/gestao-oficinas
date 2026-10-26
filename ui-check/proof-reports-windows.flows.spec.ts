import { expect, test, type Locator } from "@playwright/test";

// Literal source dimensions and source caller titles; no runtime layout import.
const cases = [
  { group: "material", mode: "resumo", unit: "WIN_Filtro_Mapas_Artigos", width: 424, height: 343, title: "Consumo Material (Resumo)", field: "EDT_Do_artigo", draft: "ART Ω" },
  { group: "material", mode: "descriminado", unit: "WIN_Filtro_Mapas_Artigos", width: 424, height: 343, title: "Consumo Material (Descriminado)", field: "EDT_Descrição", draft: "Descrição Ω" },
  { group: "material", mode: "resumo_viatura", unit: "WIN_Filtro_Mapas_Artigos", width: 424, height: 343, title: "Consumo Material (Resumo por viatura)", field: "EDT_Da_viatura", draft: "AA-00-AA" },
  { group: "material", mode: "descriminado_viatura", unit: "WIN_Filtro_Mapas_Artigos", width: 424, height: 343, title: "Consumo Material (Descriminado por viatura)", field: "EDT_Do_artigo1", draft: "ART Ω" },
  { group: "labor", mode: "ordem_reparacao", unit: "WIN_Filtro_Mapas_Tempos", width: 400, height: 281, title: "Tempos por ordem reparação (Descriminado)", field: "EDT_Da_ordem", draft: "12" },
  { group: "labor", mode: "mecanico_descriminado", unit: "WIN_Filtro_Mapas_Tempos", width: 400, height: 281, title: "Tempos por mecânico (Descriminado)", field: "EDT_Do_mecanico", draft: "7" },
  { group: "labor", mode: "mecanico_resumo", unit: "WIN_Filtro_Mapas_Tempos", width: 400, height: 281, title: "Tempos por mecânico (Resumo)", field: "EDT_Ao_mecanico", draft: "9" },
  { group: "labor", mode: "viatura", unit: "WIN_Filtro_Mapas_Tempos", width: 400, height: 281, title: "Tempos por viatura (Descriminado)", field: "EDT_Da_viatura", draft: "AA-00-AA" },
  { group: "sales", mode: "vendas", unit: "WIN_Mapa_Vendas", width: 345, height: 395, title: "Mapa de Vendas", field: "EDT_Da_data", draft: "25/10/2026" },
  { group: "sales", mode: "recebimentos", unit: "WIN_Mapa_Vendas", width: 345, height: 395, title: "Mapa de Recebimentos", field: "EDT_A_data", draft: "25/10/2026" },
] as const;
for (const item of cases) test(`reports proof ${item.unit} ${item.mode} actual chrome preserves draft focus source frame and saved geometry`, async ({ page }) => {
  await page.goto("/?workflow=report-filters"); const launch = page.getByTestId(`report-filter-${item.group}-${item.mode}`); await launch.click();
  const host = page.getByTestId("workspace-window-1"), frame = page.getByTestId("workspace-window-1-frame"), screen = page.getByTestId(item.unit);
  await expect(screen).toBeVisible(); const original = await workspaceBounds(frame); expect(original.width).toBe(item.width); expect(original.height).toBe(item.height);
  await expect(frame.getByTestId("RADTitle")).toHaveText(item.title); const edit = screen.getByTestId(item.field), initial = await edit.inputValue();
  const vehicle = item.mode.endsWith("viatura"), detail = item.mode === "descriminado";
  const active = item.group === "material" ? vehicle ? ["BTN_VISION1", "BTN_VISION2", "BTN_VISION3", "BTN_VISION4", "BTN_Visualizar_impressão1"] : detail ? ["BTN_VISION7", "BTN_VISION8", "BTN_Visualizar_impressão"] : ["BTN_VISION5", "BTN_VISION6", "BTN_Visualizar_impressão"] : item.group === "labor" ? ["BTN_Visualizar_impressão", ...(vehicle ? ["BTN_VISION1", "BTN_VISION2"] : item.mode.startsWith("mecanico") ? ["BTN_VISION3", "BTN_VISION4"] : [])] : ["BTN_Visualizar_impressão1", "STC_Titulo_Tabela"];
  await designerProperties(frame, item.unit, item.title, { width: 0, height: 0 }, active);
  await edit.fill(item.draft); await edit.focus();
  await frame.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(host).toBeHidden();
  const task = page.getByTestId("workspace-window-1-task"); await expect(task).toContainText("minimizada"); await task.click();
  await expect(edit).toBeFocused(); await expect(edit).toHaveValue(item.draft); expect(await workspaceBounds(frame)).toEqual(original);
  await frame.getByTestId("BTN_Syst_Maximize").click(); const maximum = (await frame.boundingBox())!; expect(maximum.width).toBeGreaterThan(original.width);
  await designerProperties(frame, item.unit, item.title, { width: maximum.width - original.width, height: maximum.height - original.height }, active);
  await expect(frame.getByTestId("RADTitle")).toHaveText(item.title); await expect(edit).toHaveValue(item.draft);
  await frame.getByTestId("BTN_Syst_Maximize").click(); expect(await workspaceBounds(frame)).toEqual(original);
  for (const [name, width] of [["BTN_SYST_MINIMIZE", 26], ["BTN_Syst_Maximize", 25], ["BTN_SYST_FERMER", 44]] as const) {
    const chrome = frame.getByTestId(name); await expect(chrome).toHaveAttribute("tabindex", "-1"); const bounds = (await chrome.boundingBox())!;
    expect(bounds.width).toBe(width); expect(bounds.height).toBe(19); await expect(chrome.locator(".wd-button-icon")).toHaveCount(1);
  }
  await expect(frame.getByTestId("BTN_UMC")).toBeHidden(); await frame.getByTestId("BTN_SYST_FERMER").click(); await expect(host).toHaveCount(0); await expect(task).toHaveCount(0); await expect(launch).toBeEnabled();
  const saved = await page.evaluate(unit => JSON.parse(localStorage.getItem(`gestao-oficinas:window-geometry:v1:${unit}`)!), item.unit);
  expect(saved).toMatchObject({ width: item.width, height: item.height, maximized: false });
  await launch.click(); const reopened = page.getByTestId("workspace-window-2-frame"); const bounds = await workspaceBounds(reopened);
  expect(bounds.width).toBe(original.width); expect(bounds.height).toBe(original.height); expect(bounds.x).toBe(original.x); expect(bounds.y).toBe(original.y);
  await expect(page.getByTestId(item.unit).getByTestId(item.field)).toHaveValue(initial);
});

type DesignerOracle = { id: string; name: string; kind: string; state?: string; tabOrder?: number | string; buttonType?: string; text: string; x: number; y: number; width: number; height: number; anchor: string; visible: boolean; tab: boolean; icon: string; skin: string };
const designerOracles: Record<string, DesignerOracle[]> = {
  "WIN_Filtro_Mapas_Artigos": [
    {"id":"RULE-WCD4890-1001","name":"BTN_VISION1","kind":"Button","text":"","x":318,"y":208,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":17,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1002","name":"BTN_VISION2","kind":"Button","text":"","x":318,"y":238,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":19,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1003","name":"BTN_VISION3","kind":"Button","text":"","x":318,"y":158,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":15,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1004","name":"BTN_VISION4","kind":"Button","text":"","x":318,"y":128,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":13,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1005","name":"BTN_VISION5","kind":"Button","text":"","x":318,"y":158,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":7,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1006","name":"BTN_VISION6","kind":"Button","text":"","x":318,"y":128,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":5,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1007","name":"BTN_VISION7","kind":"Button","text":"","x":318,"y":144,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":24,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1008","name":"BTN_VISION8","kind":"Button","text":"","x":318,"y":114,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":22,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1010","name":"BTN_Visualizar_impressão1","kind":"Button","text":"Visualizar impressão","x":121,"y":283,"width":179,"height":37,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":20,"buttonType":"Normal"},
    {"id":"RULE-WCD4890-1025","name":"RADTitle","kind":"Caption","text":"","x":9,"y":4,"width":309,"height":18,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":"","state":"Active"},
    {"id":"RULE-WCD4890-1026","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":374,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WCD4890-1027","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":324,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WCD4890-1028","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":350,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WCD4890-1029","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":290,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif","state":"Active","tabOrder":1,"buttonType":"Normal"}
  ],
  "WIN_Filtro_Mapas_Tempos": [
    {"id":"RULE-WA6D3FA-1001","name":"BTN_VISION1","kind":"Button","text":"","x":257,"y":51,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":12,"buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1002","name":"BTN_VISION2","kind":"Button","text":"","x":257,"y":81,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":14,"buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1003","name":"BTN_VISION3","kind":"Button","text":"","x":230,"y":81,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":10,"buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1004","name":"BTN_VISION4","kind":"Button","text":"","x":230,"y":51,"width":42,"height":24,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_VisionPlus.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":8,"buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1005","name":"BTN_Visualizar_impressão","kind":"Button","text":"Visualizar impressão","x":111,"y":212,"width":179,"height":37,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":4,"buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1014","name":"RADTitle","kind":"Caption","text":"","x":9,"y":4,"width":284,"height":18,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":"","state":"Active"},
    {"id":"RULE-WA6D3FA-1015","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":349,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1016","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":299,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1017","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":325,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-WA6D3FA-1018","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":265,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif","state":"Active","tabOrder":1,"buttonType":"Normal"}
  ],
  "WIN_Mapa_Vendas": [
    {"id":"RULE-W7DB489-1002","name":"BTN_Visualizar_impressão1","kind":"Button","text":"Visualizar impressão","x":83,"y":342,"width":179,"height":37,"anchor":"<None>","visible":true,"tab":true,"icon":"Btn_OK.gif","skin":"MediaPlayer_Btn_anim.gif","state":"Active","tabOrder":5,"buttonType":"Normal"},
    {"id":"RULE-W7DB489-1005","name":"RADTitle","kind":"Caption","text":"","x":9,"y":4,"width":196,"height":18,"anchor":"Width","visible":true,"tab":true,"icon":"","skin":"","state":"Active"},
    {"id":"RULE-W7DB489-1006","name":"STC_Titulo_Tabela","kind":"Caption","text":"Etiqueta","x":19,"y":108,"width":301,"height":26,"anchor":"<None>","visible":true,"tab":true,"icon":"","skin":"","state":"Active"},
    {"id":"RULE-W7DB489-1007","name":"BTN_SYST_FERMER","kind":"Button","text":"","x":295,"y":0,"width":44,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Close.gif","skin":"MediaPlayer_Btn_Close_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-W7DB489-1008","name":"BTN_SYST_MINIMIZE","kind":"Button","text":"","x":245,"y":0,"width":26,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Minimize.gif","skin":"MediaPlayer_Btn_Minimize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-W7DB489-1009","name":"BTN_Syst_Maximize","kind":"Button","text":"","x":271,"y":0,"width":25,"height":19,"anchor":"<None>","visible":true,"tab":false,"icon":"MediaPlayer_Btn_Maximise.gif","skin":"MediaPlayer_Btn_Maximize_Anim.gif","state":"Active","tabOrder":"-1","buttonType":"Normal"},
    {"id":"RULE-W7DB489-1010","name":"BTN_UMC","kind":"Button","text":"&Bouton","x":211,"y":0,"width":24,"height":19,"anchor":"<None>","visible":false,"tab":true,"icon":"MediaPlayer_Btn_UMC.gif","skin":"MediaPlayer_Btn_UMC_Anim.gif","state":"Active","tabOrder":1,"buttonType":"Normal"}
  ]
};

/** Frozen dossier/parity oracles read before authoring. These assertions inspect the mounted
 * production DOM, styles, PNG bindings and actual resize, never a layout-to-layout comparison. */
const systemGroups: Record<string, [number, number, number, number]> = {"WIN_Extrato_Artigos":[236,1,128,18],"WIN_Filtro_Mapas_Artigos":[290,1,128,18],"WIN_Filtro_Mapas_Tempos":[265,1,128,18],"WIN_Inventario":[500,1,128,18],"WIN_Inventario_Reconstrucao":[184,1,128,18],"WIN_Leitor_cod_barras":[254,1,128,18],"WIN_Leitor_cod_barras_desconhecidos":[254,1,128,18],"WIN_Mapa_Vendas":[211,1,128,18],"WIN_Reconstrucao_Stocks":[151,1,128,18],"WIN_Table_cab_stocks":[666,1,128,18],"WIN_Table_Lin_Stocks":[666,1,128,18]};
async function designerProperties(frame: Locator, unit: string, title: string, delta = { width: 0, height: 0 }, active?: readonly string[]) {
  const base = (await frame.boundingBox())!;
  const groupSource = systemGroups[unit], group = frame.getByTestId("SCSystemButtons");
  await expect(group).toBeVisible(); const groupBox = (await group.boundingBox())!;
  expect(Math.abs(groupBox.x - base.x - groupSource[0] - delta.width)).toBeLessThan(0.6);
  expect(Math.abs(groupBox.y - base.y - groupSource[1])).toBeLessThan(0.6);
  expect(groupBox.width).toBe(groupSource[2]); expect(groupBox.height).toBe(groupSource[3]);
  // The source group owns the four real title actions; only its source-disabled
  // chrome children and hidden macro are excluded from ordinary Tab traversal.
  await expect(group.locator("button")).toHaveCount(4);
  for (const child of await group.locator("button").all()) expect(await child.evaluate(element => element.tabIndex)).toBe(-1);
  for (const source of designerOracles[unit] ?? []) {
    if (active && !active.includes(source.name) && !["RADTitle", "BTN_SYST_MINIMIZE", "BTN_Syst_Maximize", "BTN_SYST_FERMER", "BTN_UMC"].includes(source.name)) continue;
    if (["STC_Mecanico", "BTN_VISION2"].includes(source.name) && unit === "WIN_Table_Lin_Stocks") continue; // separate document-dependent caller case
    const node = frame.getByTestId(source.name);
    await expect(node, source.id).toHaveCount(1);
    if (!source.visible) {
      await expect(node, source.id).toBeHidden(); await expect(node).toHaveAttribute("tabindex", "-1"); await expect(node).toHaveAttribute("aria-hidden", "true");
      await expect(node).toHaveCSS("left", `${source.x - groupSource[0]}px`); await expect(node).toHaveCSS("top", `${source.y - groupSource[1]}px`);
      await expect(node).toHaveCSS("width", `${source.width}px`); await expect(node).toHaveCSS("height", `${source.height}px`);
      if (source.icon) expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-icon-0"))).toContain(source.icon.replace(/\.(?:gif|png)$/i, ""));
      if (source.skin) expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-background-0"))).toContain(source.skin.replace(/\.(?:gif|png)$/i, ""));
      continue;
    }
    await expect(node, source.id).toBeVisible();
    if (source.state === "Active" && source.kind === "Caption") { await expect(node).not.toHaveAttribute("aria-disabled", "true"); expect(await node.evaluate(element => (element as HTMLElement).hidden)).toBe(false); }
    const box = (await node.boundingBox())!;
    const chrome = ["BTN_SYST_MINIMIZE", "BTN_Syst_Maximize", "BTN_SYST_FERMER"].includes(source.name);
    const expected = { x: source.x + (chrome || source.anchor.toLowerCase().includes("right") && !source.anchor.toLowerCase().includes("width") ? delta.width : 0), y: source.y + (source.anchor.toLowerCase().includes("bottom") && !source.anchor.toLowerCase().includes("height") ? delta.height : 0),
      width: source.width + (source.name === "RADTitle" || source.anchor.toLowerCase().includes("width") ? delta.width : 0), height: source.height + (source.anchor.toLowerCase().includes("height") ? delta.height : 0) };
    expect(Math.abs(box.x - base.x - expected.x), source.id + " x").toBeLessThan(0.6); expect(Math.abs(box.y - base.y - expected.y), source.id + " y").toBeLessThan(0.6);
    expect(Math.abs(box.width - expected.width), source.id + " width").toBeLessThan(0.6); expect(Math.abs(box.height - expected.height), source.id + " height").toBeLessThan(0.6);
    if (source.kind === "Caption") {
      await expect(node, source.id).toHaveText(source.name === "RADTitle" ? title : source.name === "STC_Titulo_Tabela" ? `Estados de reparação que pedem data de ${title === "Mapa de Vendas" ? "entrega" : "pagamento"}` : source.text);
      expect(await node.locator("*").count(), source.id + " plain text").toBe(0); await expect(node).toHaveCSS("animation-name", "none");
    } else {
      await expect(node).toBeEnabled();
      expect(await node.evaluate(element => (element as HTMLButtonElement).type), source.id + " normal button").toBe("button");
      expect(await node.evaluate(element => element.tabIndex), source.id + " TAB flag").toBe(source.tab ? 0 : -1);
      if (!chrome) await expect(node.locator("span").first(), source.id + " caption").toHaveText(source.text);
      if (source.icon) { await expect(node.locator(".wd-button-icon")).toHaveCount(1); expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-icon-0"))).toContain(source.icon.replace(/\.(?:gif|png)$/i, "")); }
      if (source.skin) expect(await node.evaluate(element => (element as HTMLElement).style.getPropertyValue("--wd-background-0"))).toContain(source.skin.replace(/\.(?:gif|png)$/i, ""));
    }
  }
}

async function workspaceBounds(frame: Locator) { return frame.evaluate(element => { const box = element.getBoundingClientRect(), canvas = element.closest(".wd-workspace-canvas")!, parent = canvas.getBoundingClientRect(); return { x: box.x - parent.x + canvas.scrollLeft, y: box.y - parent.y + canvas.scrollTop, width: box.width, height: box.height }; }); }
