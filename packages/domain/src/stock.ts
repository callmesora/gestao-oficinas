import { z } from "zod";

// ADR002: exact transport; masks constrain entry only, never imported numeric capacity.
const id = z.string().regex(/^[1-9][0-9]*(?![\s\S])/).max(19).refine(value => BigInt(value) <= 9223372036854775807n);
const integer = z.string().regex(/^[+-]?[0-9]+(?![\s\S])/).max(21);
const decimal = z.string().regex(/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?![\s\S])/);
export const stockIdentitySchema = z.strictObject({ id });
export const stockLineSchema = z.strictObject({ linha: integer.nullable(), artigo: z.string().nullable(), descricao_artigo: z.string().nullable(), quantidade: decimal.nullable(), preco: decimal.nullable() });
export type StockLine = z.infer<typeof stockLineSchema>;
export interface StockHeader { id: string; documento_codigo: string | null; documento_numero: string | null; Descricao: string | null; data: string | null; mecanico: string | null }
export interface StockListRow extends StockHeader { documentId: string; documentDescription: string | null; stock: number | null }
export const stockListSchema = z.strictObject({ document: z.string().optional(), from: integer.optional(), to: integer.optional(), description: z.string().optional(), sort: z.enum(["document", "number", "date", "description"]).optional(), descending: z.boolean().optional() });
export type StockList = z.infer<typeof stockListSchema>;
export const stockSaveSchema = z.strictObject({ mode: z.enum(["create", "update"]), id: id.optional(), baseline: z.string().optional(), document: z.string(), number: integer, description: z.string().nullable(), date: z.string().nullable(), mechanic: integer.nullable(), lines: z.array(stockLineSchema) }).refine(value => value.mode === "create" || !!value.id && value.baseline !== undefined);
export type StockSave = z.infer<typeof stockSaveSchema>;
export interface StockDocumentType { id: string; Codigo: string | null; Descricao: string | null; stock: number | null; obriga_macanico: boolean | null }
export interface StockMechanic { Codigo: string | null; Descricao: string | null }
export interface StockArticle { id: string; Codigo: string | null; Descricao: string | null; preco: string | null; stock: string | null }
export type StockFailure = { kind: "invalid" | "failed" | "missing" | "stale" | "duplicate" | "unresolved" };
export type StockListResult = { kind: "loaded"; rows: StockListRow[]; documents: StockDocumentType[]; mechanics: StockMechanic[] } | StockFailure;
export type StockReadResult = { kind: "loaded"; header: StockHeader; lines: StockLine[]; baseline: string } | StockFailure;
export type StockSaveResult = { kind: "saved"; id: string } | { kind: "empty"; message: "Documento sem linhas" } | StockFailure;
export type StockDeleteResult = { kind: "deleted" } | StockFailure;
export type StockInventoryResult = { kind: "loaded"; articles: StockArticle[] } | StockFailure;
export type StockRebuildResult = { kind: "rebuilt"; articles: string } | StockFailure;
export type StockLookupResult = { kind: "found"; article: StockArticle } | StockFailure;
export interface ScannerConfig { barcodeStart: number; barcodeLength: number; quantityStart: number; quantityLength: number; filename: string | null }
export interface ScannerRow { barcode: string; quantity: string }
export interface ScannerKnown extends ScannerRow { code: string | null; description: string | null; price: string | null }
export type ScannerResult = { kind: "partitioned"; known: ScannerKnown[]; unknown: ScannerRow[] } | StockFailure;
export type ScannerConfigResult = { kind: "loaded"; config: ScannerConfig } | StockFailure;
export const scannerRowsSchema = z.strictObject({ rows: z.array(z.strictObject({ barcode: z.string(), quantity: z.string() })) });
export const stockLookupSchema = z.strictObject({ code: z.string(), barcode: z.boolean().optional() });
export const stockNextSchema = z.strictObject({ document: z.string() });
export type StockNextResult = { kind: "loaded"; number: string } | StockFailure;

// Verified: WIN_Leitor_cod_barras412–427; Middle is 1-based position+length, stop first empty.
// U-WAFCFDF-05: text decoder/native NoSpace behavior outside literal spaces remains open.
export function parseScannerText(text: string, config: ScannerConfig): ScannerRow[] {
  if (![config.barcodeStart, config.quantityStart].every(value => Number.isInteger(value) && value >= 1)
    || ![config.barcodeLength, config.quantityLength].every(value => Number.isInteger(value) && value >= 0)) throw new Error("unresolved");
  const rows: ScannerRow[] = [];
  for (const line of text.split(/\r\n|\n|\r/)) {
    if (line === "") break;
    rows.push({ barcode: line.slice(config.barcodeStart - 1, config.barcodeStart - 1 + config.barcodeLength).replaceAll(" ", ""), quantity: line.slice(config.quantityStart - 1, config.quantityStart - 1 + config.quantityLength).replaceAll(" ", "") });
  }
  return rows;
}
// Verified max+1 without Number narrowing; explicit source zero-initialized counter.
export function nextStockLine(lines: readonly StockLine[]): string {
  return (lines.reduce((max, line) => line.linha !== null && BigInt(line.linha) > max ? BigInt(line.linha) : max, 0n) + 1n).toString();
}
