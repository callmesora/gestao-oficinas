import { expect, it } from "vitest";
import { buttonSkin, controlOf, skinImage } from "./layout";
import order from "./WIN_Ordens_Reparacao.layout.json";

it("requires qualified paths for repeated controls instead of overwriting one", () => {
  expect(() => controlOf(order, "SHA_cor")).toThrow("qualified path");
  const first = controlOf(order, "TABLE_QRY_select_ordens_reparacao.COL_imagem.SHA_cor");
  const second = controlOf(order, "TABLE_Estados_reparacao.COL_imagem.SHA_cor");
  expect(first.path).not.toBe(second.path);
  expect(first.y).not.toBe(second.y);
});

it("SRC-ca4828ceb2 actual two-state keyboard sprites supply all shared button states without requesting missing crops", () => {
  const control = { name: "BTN_a", path: "BTN_a", kind: "Button", x: 0, y: 0, width: 68, height: 61, background_image: "CA_WidgetVista.png" };
  const style = buttonSkin(control) as Record<string, string>;
  expect(style["--wd-background-0"]).toContain("CA_WidgetVista.0.png");
  expect(style["--wd-background-1"]).toContain("CA_WidgetVista.1.png");
  expect(style["--wd-background-2"]).toBe(style["--wd-background-1"]);
  expect(style["--wd-background-3"]).toBe(style["--wd-background-0"]);
});

it("uses actual single-state files and declared cropped animation states", () => {
  expect(skinImage("MediaPlayer_Btn_Close.gif", 4)).toBe("/skin/MediaPlayer_Btn_Close.png");
  expect(skinImage("Btn_OK.gif", 3)).toBe("/skin/Btn_OK.3.png");
  expect(() => skinImage("Btn_OK.gif", 5)).toThrow("Undeclared skin state");
  expect(() => skinImage("Btn_OK.gif", 0.5)).toThrow("Invalid skin state");
  expect(() => skinImage("missing.gif")).toThrow("checked inventory");
});
