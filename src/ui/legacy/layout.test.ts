import { expect, it } from "vitest";
import { controlOf, skinImage } from "./layout";
import order from "./WIN_Ordens_Reparacao.layout.json";

it("requires qualified paths for repeated controls instead of overwriting one", () => {
  expect(() => controlOf(order, "SHA_cor")).toThrow("qualified path");
  const first = controlOf(order, "TABLE_QRY_select_ordens_reparacao.COL_imagem.SHA_cor");
  const second = controlOf(order, "TABLE_Estados_reparacao.COL_imagem.SHA_cor");
  expect(first.path).not.toBe(second.path);
  expect(first.y).not.toBe(second.y);
});

it("uses actual single-state files and declared cropped animation states", () => {
  expect(skinImage("MediaPlayer_Btn_Close.gif", 4)).toBe("/skin/MediaPlayer_Btn_Close.png");
  expect(skinImage("Btn_OK.gif", 3)).toBe("/skin/Btn_OK.3.png");
  expect(() => skinImage("Btn_OK.gif", 5)).toThrow("Undeclared skin state");
  expect(() => skinImage("Btn_OK.gif", 0.5)).toThrow("Invalid skin state");
  expect(() => skinImage("missing.gif")).toThrow("checked inventory");
});
