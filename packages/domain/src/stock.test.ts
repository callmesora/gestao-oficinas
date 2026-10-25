import { expect, it } from "vitest";
import { nextStockLine, parseScannerText, stockSaveSchema, type StockLine } from "./stock";
it("scanner uses one-based starts and lengths, removes literal spaces and stops at the first empty row", () => {
  expect(parseScannerText(" 123 004.5\r\nABCD  002\r\n\r\nIGNORED", { barcodeStart: 1, barcodeLength: 5, quantityStart: 6, quantityLength: 5, filename: null })).toEqual([{ barcode: "123", quantity: "004.5" }, { barcode: "ABCD", quantity: "002" }]);
});
it("source line counter starts at zero and keeps integers above the JavaScript boundary exact", () => {
  const row = (linha: string | null): StockLine => ({ linha, artigo: "A", descricao_artigo: "", quantidade: "1", preco: "0" });
  expect(nextStockLine([])).toBe("1"); expect(nextStockLine([row("9007199254740993"), row("2"), row(null)])).toBe("9007199254740994");
});
it("save refuses nonfinite decimal transport and an update without its read baseline", () => {
  const command = { mode: "create", document: "E", number: "1", description: "", date: "20261025", mechanic: null, lines: [{ linha: "1", artigo: "A", descricao_artigo: "", quantidade: "1.0000000000000000000000001", preco: "0" }] };
  expect(stockSaveSchema.safeParse(command).success).toBe(true);
  expect(stockSaveSchema.safeParse({ ...command, mode: "update", id: "1" }).success).toBe(false);
  expect(stockSaveSchema.safeParse({ ...command, lines: [{ ...command.lines[0], quantidade: "NaN" }] }).success).toBe(false);
  expect(stockSaveSchema.safeParse({ ...command, lines: [{ ...command.lines[0], quantidade: "1\n" }] }).success).toBe(false);
});
