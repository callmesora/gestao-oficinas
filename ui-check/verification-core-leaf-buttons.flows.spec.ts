import { expect, test } from "@playwright/test";
import fixtures from "./support/verification-core-leaf-buttons.json" with { type: "json" };

const consumers = [
  ["customers", "Clientes"], ["vehicles", "Viaturas"], ["units", "unidades"], ["descriptive-states", "estados_descritivos"], ["terminals", "Terminais"], ["postos", "postos"], ["mechanics", "mecanicos"], ["repair-states", "estados_reparacao"], ["document-types", "documentos"], ["articles", "artigos"], ["users", "utilizadores"],
] as const;
for (const [route, suffix] of consumers) for (const kind of ["Table", "Form"]) {
  const unit = `WIN_${kind}_${suffix}`, oracle = fixtures.find(item => item.unit === unit)!;
  test(`${unit} literal source button properties hold in its actual ordinary consumer`, async ({ page }) => {
    await page.goto(`/?workflow=${route}`); await page.getByTestId(`${route}-open`).click();
    const list = page.getByTestId(`WIN_Table_${suffix}`); await expect(list.getByTestId("Btn_New")).toBeEnabled();
    if (kind === "Form") await list.getByTestId("Btn_New").click();
    const owner = kind === "Form" ? page.getByTestId(unit) : page.getByTestId("workspace-window-1-frame");
    for (const viewport of [{ width: 1024, height: 768 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport); const origin = (await owner.locator(".wd-client").first().boundingBox())!;
      for (const source of oracle.buttons) {
        const button = owner.getByTestId(source.name), flags = source.flags as { Visible?: boolean; "TAB Key"?: boolean };
        const ordinaryHidden = ["BTN_selecionar", "BTN_anterior", "BTN_seguinte", "BTN_UMC"].includes(source.name);
        if (flags.Visible === false || ordinaryHidden) { await expect(button).toBeHidden(); continue; }
        await expect(button).toBeVisible(); await expect(button).toBeEnabled(); await expect(button).toHaveAttribute("type", "button");
        const box = (await button.boundingBox())!;
        expect({ x: box.x - origin.x, y: box.y - origin.y, width: box.width, height: box.height }, source.name).toEqual({ x: source.x, y: source.y, width: source.width, height: source.height });
        if ("tab_order" in source) expect(await button.evaluate(node => (node as HTMLButtonElement).tabIndex), source.name).toBe(flags["TAB Key"] === false || String(source.tab_order) === "-1" ? -1 : 0);
        for (const [assetKey, property] of [["background_image", "--wd-background-0"], ["image", "--wd-icon-0"]] as const) {
          const raw = (source as Record<string, unknown>)[assetKey]; const asset = typeof raw === "string" ? raw : raw && typeof raw === "object" && "PT" in raw ? String(raw.PT) : undefined;
          if (asset) expect(await button.evaluate((node, key) => (node as HTMLElement).style.getPropertyValue(key), property)).toContain(asset.split("\\").at(-1)!.replace(/\.[^.]+$/, ""));
        }
        // The committed article JPG resolves the extraction's çª glyph; ADR003 retains this scoped override.
        const caption = unit === "WIN_Table_artigos" && source.name === "BTN_descricao" ? "Pesquisar por descrição" : "caption" in source ? (source.caption as { PT: string }).PT : "";
        await expect(button, source.name).toHaveText(caption.replace(/&&/g, "__AMPERSAND__").replace(/&(?=.)/, "").replaceAll("__AMPERSAND__", "&"));
      }
    }
  });
}
