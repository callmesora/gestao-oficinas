import { createHash } from "node:crypto";
import { columnMapping, updateTypedHash, type Cell, type ExportManifest, type LegacySource } from "../src/db/legacy-import";

// Synthetic only. No fixture is copied from the legacy records or credentials.
export function legacyFixture(invalid = false, embeddedNul = false): LegacySource {
  const records: Record<string, Cell[][]> = {};
  const row = (table: string, values: Record<string, Cell>) => {
    const definition = columnMapping.tables.find(item => item.name === table);
    if (!definition) throw new Error("Unknown fixture table");
    return definition.columns.map(column => values[column.name] ?? null);
  };
  for (const table of columnMapping.tables) records[table.name] = [];
  records.Clientes = [row("Clientes", { ClientesID: "9223372036854775807", Codigo: invalid ? "18446744073709551616" : "18446744073709551615", Descricao: "  Oficina Açores  ", Morada1: "", observacao: embeddedNul ? "a\0b" : "linha 1\r\nlinha 2" })];
  records.Viaturas = [row("Viaturas", { matricula: "00-AA-00", Cliente: "18446744073709551615", Ano: "0", mes: "0" })];
  records.artigos = [row("artigos", { Codigo: "0001", stock: "-12.34567890123456789", preco: "0.10000000000000001", inativo: "0" })];
  records.tempos_reparacao = [row("tempos_reparacao", { tempos_reparacaoID: "7", inicio: "00000000000000000", fim: "" }), row("tempos_reparacao", { tempos_reparacaoID: "7", inicio: "20261024123045000", fim: null })];
  records.lin_stocks = [row("lin_stocks", { documento_codigo: "E01", documento_numero: "18446744073709551615", linha: "4294967295", quantidade: "1.20E-5", Documento_codigodocumento_numero: Buffer.alloc(0) })];
  records.cab_stocks = [row("cab_stocks", { documento_codigo: "E01", documento_numero: "18446744073709551615", data: "", mecanico: "0" })];
  const manifest: ExportManifest = { tables: {} };
  for (const table of columnMapping.tables) {
    const hash = createHash("sha256"); records[table.name].forEach(cells => updateTypedHash(hash, cells));
    manifest.tables[table.name] = { rows: records[table.name].length, columns: table.columns.map(column => ({ name: column.sourceName })), sha256_typed_rows: hash.digest("hex") };
  }
  return { manifest, fingerprint: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"), assertUnchanged() {},
    *rows(table: string) { for (const [index, values] of records[table].entries()) yield { sourceRow: String(index + 1), values }; },
  };
}
