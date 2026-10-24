import { expect, it } from "vitest";
import { mnemonicCaption } from "./mnemonics";
import { resourceButtonGeometry } from "./dialog-metrics";

it("parses caption markers and literal ampersands under the ADR-003 defaults", () => {
  expect(mnemonicCaption("&Validar && manter")).toEqual({ text: "Validar & manter", letter: "V", before: "", after: "alidar & manter" });
  expect(mnemonicCaption("A&&B &Cancelar")).toEqual({ text: "A&B Cancelar", letter: "C", before: "A&B ", after: "ancelar" });
  expect(mnemonicCaption("A&B&")).toEqual({ text: "AB&", letter: "B", before: "A", after: "&" });
  expect(mnemonicCaption("&&").letter).toBe("");
  expect(mnemonicCaption("Aceitar").text).toBe("Aceitar");
  expect(mnemonicCaption("&Água").letter).toBe("Á");
});

it("measures displayed resource captions rather than their shortcut markers", () => {
  const measured: string[] = [];
  resourceButtonGeometry(["&Validar && manter"], "Título", text => { measured.push(text); return { width: 100, height: 14 }; }, 1024);
  expect(measured).toEqual(["Validar & manter", "Título"]);
});
