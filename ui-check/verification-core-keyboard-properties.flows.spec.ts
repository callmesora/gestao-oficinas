import { expect, test } from "@playwright/test";
import buttons from "./support/verification-core-keyboard-properties.json" with { type: "json" };

// Literal dossier properties copied from per-unit source parity rows, independently
// of the generated layouts used by the UI. Runtime caption overrides follow the source caller/ADR003.
for (const [unit, kind, instance, title] of [
  ["WIN_Teclado_Alfa", "alpha", "alpha-keyboard-frame", "Texto"],
  ["WIN_Teclado_numerico", "numeric", "numeric-keyboard-frame", "Quantidade"],
] as const) {
  test(`${unit} real source button geometry flags captions assets and traversal remain intact in both viewport sizes`, async ({ page }) => {
    await page.goto(`/?workflow=touch-keyboards&kind=${kind}&value=${kind === "alpha" ? "" : "0"}`); await page.getByTestId("touch-keyboard-open").click();
    const dialog = page.getByTestId(unit), frame = page.getByTestId(instance), expected = buttons.filter(button => button.unit === unit);
    const overrides: Record<string, string> = unit === "WIN_Teclado_Alfa" ? { BTN_c_cedilha: "Ç", BTN_euro: "€", BTN_a_cima: "ª", BTN_o_cima: "º", BTN_acento_grave: "`", BTN_acento_agudo: "´", BTN_acento_circunflexo: "^", BTN_i_comercial: "&" } : {};
    for (const viewport of [{ width: 1024, height: 768 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport);
      const bounds = (await frame.locator(":scope > .wd-client").boundingBox())!;
      for (const source of expected) {
        const button = dialog.getByTestId(source.name); await expect(button, source.id).toBeVisible(); await expect(button, source.id).toBeEnabled();
        const box = (await button.boundingBox())!;
        expect({ x: box.x - bounds.x, y: box.y - bounds.y, width: box.width, height: box.height }, source.id).toEqual({ x: source.x, y: source.y, width: source.width, height: source.height });
        await expect(button, source.id).toHaveAttribute("type", "button");
        expect(await button.evaluate(node => (node as HTMLButtonElement).tabIndex), source.id).toBe(source.flags["TAB Key"] && String(source.tab_order) !== "-1" ? 0 : -1);
        await expect(button.locator(":scope > span").first(), source.id).toHaveText(source.name === "BTN_Caption" ? title : overrides[source.name] ?? source.caption);
        for (const [property, asset] of [["--wd-background-0", source.background_image], ["--wd-icon-0", source.image]] as const) {
          if (!asset) continue;
          const stem = asset.replace(/\.[^.]+$/, "");
          expect(await button.evaluate((node, key) => (node as HTMLElement).style.getPropertyValue(key), property), source.id).toContain(`/skin/${stem}.0.png`);
        }
      }
      const order = await dialog.locator("button").evaluateAll(nodes => nodes.filter(node => node.tabIndex >= 0).map(node => node.dataset.testid));
      expect(order).toEqual(expected.filter(button => button.flags["TAB Key"] && String(button.tab_order) !== "-1").sort((a, b) => Number(a.tab_order) - Number(b.tab_order)).map(button => button.name));
    }
    await dialog.getByTestId("BTN_cancelar").click(); await expect(dialog).toHaveCount(0);
  });
}
