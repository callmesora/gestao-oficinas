import { expect, test } from "@playwright/test";
import buttons from "./support/verification-core-startup-buttons.json" with { type: "json" };

// Literal child-anchor rules from each unit's complete Designer properties rows.
// Chrome children use <None> inside the existing right-aligned MediaPlayer chrome
// adapter (ADR003). These checks do not promote the groups' missing source metadata.
const literalAnchors: Record<string, "<None>" | "Right"> = {
  "RULE-W9D7053-1000": "<None>", "RULE-W9D7053-1001": "<None>", "RULE-W9D7053-1002": "<None>",
  "RULE-W9D7053-1009": "<None>", "RULE-W9D7053-1010": "<None>", "RULE-W9D7053-1011": "<None>",
  "RULE-W3BC89B-1000": "Right", "RULE-W3BC89B-1001": "Right",
  "RULE-W3BC89B-1012": "<None>", "RULE-W3BC89B-1013": "<None>", "RULE-W3BC89B-1014": "<None>",
  "RULE-WCB13D1-1011": "<None>", "RULE-WCB13D1-1012": "<None>", "RULE-WCB13D1-1013": "<None>",
};
const chromeButtons = new Set(["BTN_SYST_FERMER", "BTN_SYST_MINIMIZE", "BTN_Syst_Maximize"]);

for (const unit of ["WIN_Acesso", "WIN_sistema", "WIN_MENU"]) {
  test(`${unit} source ordinary and chrome buttons preserve literal geometry flags captions and assets`, async ({ page }) => {
    await page.goto("/?workflow=menu");
    if (unit === "WIN_Acesso") await page.getByTestId("startup-access-open").click();
    else {
      await page.getByTestId("startup-development-open").click(); const menu = page.getByTestId("WIN_MENU");
      if (unit === "WIN_sistema") { await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click(); await expect(page.getByTestId(unit).getByTestId("BTN_Guardar")).toBeEnabled(); }
      else await page.getByTestId("startup-menu-frame").getByTestId("BTN_Syst_Maximize").click();
    }
    const owner = unit === "WIN_MENU" ? page.getByTestId("startup-menu-frame") : page.getByTestId(unit), source = buttons.filter(button => button.unit === unit && (unit !== "WIN_MENU" || !["BTN_Artigos", "BTN_Clientes", "BTN_Ordens_reparacao", "BTN_Viaturas", "BTN_material", "BTN_movimentos_stock", "BTN_tempos"].includes(button.name)));
    for (const viewport of [{ width: 1024, height: 768 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport); const bounds = (await owner.locator(".wd-client").first().boundingBox())!;
      for (const expected of source) {
        const button = owner.getByTestId(expected.name); await expect(button, expected.id).toBeVisible(); await expect(button, expected.id).toBeEnabled();
        const box = (await button.boundingBox())!; expect({ x: box.x - bounds.x, y: box.y - bounds.y, width: box.width, height: box.height }, expected.id).toEqual({ x: expected.x, y: expected.y, width: expected.width, height: expected.height });
        await expect(button).toHaveAttribute("type", "button");
        expect(await button.evaluate(node => (node as HTMLButtonElement).tabIndex)).toBe(expected.flags["TAB Key"] === false || String(expected.tab_order) === "-1" ? -1 : 0);
        await expect(button).toHaveText(("caption" in expected ? expected.caption?.PT ?? "" : "").replace(/&&/g, "__AMPERSAND__").replace(/&(?=.)/, "").replaceAll("__AMPERSAND__", "&"));
        for (const [key, property] of [["background_image", "--wd-background-0"], ["image", "--wd-icon-0"]] as const) {
          const value = (expected as Record<string, unknown>)[key]; const asset = typeof value === "string" ? value : value && typeof value === "object" && "PT" in value ? String(value.PT) : undefined;
          if (asset) expect(await button.evaluate((node, name) => (node as HTMLElement).style.getPropertyValue(name), property)).toContain(asset.split("\\").at(-1)!.replace(/\.[^.]+$/, ""));
        }
      }
      // Change the actual owner size; viewport changes alone cannot prove anchoring.
      await owner.getByTestId("BTN_Syst_Maximize").click();
      const enlarged = (await owner.locator(".wd-client").first().boundingBox())!;
      const delta = { width: enlarged.width - bounds.width, height: enlarged.height - bounds.height };
      expect(delta.width).toBeGreaterThan(0); expect(delta.height).toBeGreaterThan(0);
      for (const expected of source) {
        const rule = literalAnchors[expected.id]; expect(rule, expected.id).toBeDefined();
        const button = owner.getByTestId(expected.name), box = (await button.boundingBox())!;
        const parentRight = chromeButtons.has(expected.name) ? delta.width : 0;
        const localRight = rule === "Right" ? delta.width : 0;
        expect({ x: box.x - enlarged.x, y: box.y - enlarged.y, width: box.width, height: box.height }, expected.id).toEqual({
          x: expected.x + parentRight + localRight, y: expected.y, width: expected.width, height: expected.height,
        });
        // A chrome <None> child remains fixed inside its right-moving logical parent.
        if (chromeButtons.has(expected.name)) expect(box.x - enlarged.x - parentRight, expected.id).toBe(expected.x);
      }
      await owner.getByTestId("BTN_Syst_Maximize").click();
      const restored = (await owner.locator(".wd-client").first().boundingBox())!;
      expect({ width: restored.width, height: restored.height }).toEqual({ width: bounds.width, height: bounds.height });
      for (const expected of source) {
        const box = (await owner.getByTestId(expected.name).boundingBox())!;
        expect({ x: box.x - restored.x, y: box.y - restored.y, width: box.width, height: box.height }, expected.id).toEqual({
          x: expected.x, y: expected.y, width: expected.width, height: expected.height,
        });
      }
    }
    if (unit === "WIN_Acesso") {
      const password = owner.getByTestId("EDT_palavra_passe"); await password.fill("aB'ç");
      const submitted = page.waitForRequest(request => request.url().endsWith("/api/startup/access")); await password.press("Enter");
      expect((await submitted).postDataJSON()).toEqual({ code: 0, password: "AB'Ç" }); await expect(owner.getByTestId("BTN_Confirmar")).toBeEnabled(); await expect(password).toHaveValue("AB'Ç");
      await password.press("Escape"); await expect(page.getByTestId("startup-terminated")).toBeVisible();
    }
  });
}
