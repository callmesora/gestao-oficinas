import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { legacyFixture } from "../../test-support/legacy-fixture";
import { columnMapping, importLegacy, reconcileLegacy } from "./legacy-import";
import { migrate } from "./migrate";
import { exportComparison } from "./csv-exports";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { updateTypedHash, type Cell, type ExportManifest } from "./legacy-import";

function signedProvenanceSource() {
  const base = legacyFixture();
  return { ...base, *rows(table: string) {
    let index = 0;
    for (const row of base.rows(table)) yield { ...row, sourceRow: index++ === 0 ? "-9223372036854775808" : "0" };
  } };
}

describe("MIG-4 real PostgreSQL schema/import", () => {
  let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>;
  let client: Client;
  beforeAll(async () => { engine = await startIsolatedPostgres(); }, 60000);
  afterAll(async () => { await engine?.stop(); }, 60000);
  beforeEach(async () => { client = await engine.database(); await migrate(client); }, 30000);
  afterEach(async () => { await client?.end(); });

  it("creates every mapped field and refuses migration checksum drift", async () => {
    const columns = await client.query<{ table_name: string; column_name: string; type: string; nullable: boolean }>(`SELECT c.relname AS table_name,a.attname AS column_name,format_type(a.atttypid,a.atttypmod) AS type,NOT a.attnotnull AS nullable
      FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='app' AND a.attnum>0 AND NOT a.attisdropped`);
    expect(columnMapping.tables).toHaveLength(17);
    expect(columnMapping.tables.reduce((sum, table) => sum + table.columns.length, 0)).toBe(135);
    for (const table of columnMapping.tables) for (const column of table.columns) {
      expect(columns.rows.find(row => row.table_name === table.name && row.column_name === column.name)).toEqual({ table_name: table.name, column_name: column.name, type: column.postgresType, nullable: column.nullable });
    }
    await migrate(client);
    await client.query("UPDATE public.schema_migrations SET sha256='changed'");
    await expect(migrate(client)).rejects.toThrow("checksum changed");
  });

  it("dry run rolls back, real import preserves exact boundaries and duplicate IDs, retry refuses overwrite", async () => {
    const source = legacyFixture();
    const dry = await importLegacy(client, source, { dryRun: true });
    expect(dry.tables.Clientes).toMatchObject({ rows: 1, imported: 1, quarantined: 0, mismatches: 0 });
    expect((await client.query("SELECT count(*) FROM app.\"Clientes\"")).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
    await importLegacy(client, source);
    await reconcileLegacy(client, source);
    const customer = (await client.query('SELECT "ClientesID","Codigo","Descricao","Morada1","Morada2","observacao" FROM app."Clientes"')).rows[0];
    expect(customer).toEqual({ ClientesID: "9223372036854775807", Codigo: "18446744073709551615", Descricao: "  Oficina Açores  ", Morada1: "", Morada2: null, observacao: "linha 1\r\nlinha 2" });
    expect((await client.query('SELECT stock,preco,inativo FROM app.artigos')).rows[0]).toEqual({ stock: "-12.34567890123456789", preco: "0.10000000000000001", inativo: false });
    expect((await client.query('SELECT count(*),count(DISTINCT _row_id) AS identities FROM app.tempos_reparacao WHERE "tempos_reparacaoID"=7')).rows[0]).toEqual({ count: "2", identities: "2" });
    expect((await client.query('SELECT "Documento_codigodocumento_numero" AS binary,linha,quantidade FROM app.lin_stocks')).rows[0]).toEqual({ binary: Buffer.alloc(0), linha: "4294967295", quantidade: "0.0000120" });
    await expect(importLegacy(client, source)).rejects.toThrow("already imported");
    await client.query('UPDATE app."Clientes" SET "Descricao"=\'changed\'');
    await expect(reconcileLegacy(client, source)).rejects.toThrow("reconciliation failed");
  });

  it("interruption rolls back all rows and provenance, then a clean retry succeeds", async () => {
    const source = legacyFixture();
    let batches = 0;
    await expect(importLegacy(client, source, { afterBatch() { if (++batches === 4) throw new Error("simulated interruption"); } })).rejects.toThrow("simulated interruption");
    expect((await client.query('SELECT count(*) FROM app."Clientes"')).rows[0].count).toBe("0");
    expect((await client.query('SELECT count(*) FROM app."Viaturas"')).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.rows")).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
    await importLegacy(client, source); await reconcileLegacy(client, source);
  });

  it("quarantines an out-of-range value without rounding or losing its original", async () => {
    const result = await importLegacy(client, legacyFixture(true));
    expect(result.tables.Clientes).toMatchObject({ rows: 1, imported: 0, quarantined: 1, mismatches: 0 });
    expect((await client.query('SELECT count(*) FROM app."Clientes"')).rows[0].count).toBe("0");
    const item = (await client.query("SELECT reason,original_values FROM import_audit.quarantine")).rows[0];
    expect(item.reason).toBe("integer-out-of-range");
    expect(item.original_values[1]).toEqual({ utf8: Buffer.from("18446744073709551616").toString("base64") });
  });

  it("restores a complete stopped-cluster backup and reconciles persisted data", async () => {
    const source = signedProvenanceSource(); await importLegacy(client, source);
    const name = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    await client.end();
    await engine.backupAndRestore();
    client = await engine.connect(name);
    await reconcileLegacy(client, source);
    const exports = await exportComparison(client, source, engine.directory);
    const comparison = await promisify(execFile)(process.execPath, ["scripts/py.mjs", "scripts/compare_exports.py", "--config", exports.config, "--legacy", exports.legacy, "--target", exports.target, "--limit", "0"], { windowsHide: true });
    expect(JSON.parse(comparison.stdout).equal).toBe(true);
    expect((await client.query("SELECT count(*) FROM app.tempos_reparacao")).rows[0].count).toBe("2");
  }, 60000);

  it("retains actual embedded NUL text in quarantine without treating it as an empty value", async () => {
    const source = legacyFixture(false, true);
    const report = await importLegacy(client, source);
    expect(report.tables.Clientes).toMatchObject({ imported: 0, quarantined: 1 });
    const item = (await client.query("SELECT reason,original_values FROM import_audit.quarantine")).rows[0];
    expect(item.reason).toBe("postgres-text-nul");
    expect(item.original_values[8]).toEqual({ utf8: Buffer.from("a\0b").toString("base64") });
    await reconcileLegacy(client, source);
  });

  it("refuses a populated target even without a previous import record", async () => {
    await client.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (17,\'synthetic existing row\')');
    await expect(importLegacy(client, legacyFixture())).rejects.toThrow("Target is not empty");
    expect((await client.query('SELECT "Codigo" FROM app."Clientes"')).rows).toEqual([{ Codigo: "17" }]);
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
  });

  it("serializes simultaneous imports and rejects the second instead of duplicating or overwriting", async () => {
    const name = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    const other = await engine.connect(name);
    try {
      const results = await Promise.allSettled([importLegacy(client, legacyFixture()), importLegacy(other, legacyFixture())]);
      expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find(result => result.status === "rejected");
      expect(rejected?.status === "rejected" && rejected.reason.message).toBe("Target already imported");
      await reconcileLegacy(client, legacyFixture());
    } finally { await other.end(); }
  });

  it("RULE-T01-002 RULE-T06-003 preserves signed64 negative/zero source-row provenance and duplicate business IDs", async () => {
    const source = signedProvenanceSource();
    await importLegacy(client, source); await reconcileLegacy(client, source);
    expect((await client.query('SELECT _source_row::text,"tempos_reparacaoID"::text,"inicio","fim" FROM app."tempos_reparacao" ORDER BY _source_row')).rows)
      .toEqual([{ _source_row: "-9223372036854775808", tempos_reparacaoID: "7", inicio: "00000000000000000", fim: "" }, { _source_row: "0", tempos_reparacaoID: "7", inicio: "20261024123045000", fim: null }]);
    expect((await client.query('SELECT count(*)::text AS count,count(DISTINCT _row_id)::text AS identities FROM app."tempos_reparacao"')).rows[0]).toEqual({ count: "2", identities: "2" });
  });

  it.each(["01", "-0", "1.0", "9223372036854775808", "-9223372036854775809"])("RULE-T01-002 invalid source row identity %s aborts without provenance or target writes", async identity => {
    const base = legacyFixture();
    const source = { ...base, *rows(table: string) { for (const row of base.rows(table)) yield { ...row, sourceRow: identity }; } };
    await expect(importLegacy(client, source)).rejects.toThrow(/Source row identity|Invalid source row identity/);
    expect((await client.query("SELECT count(*)::text AS count FROM import_audit.runs")).rows[0].count).toBe("0");
    expect((await client.query('SELECT count(*)::text AS count FROM app."Clientes"')).rows[0].count).toBe("0");
  });

  it("RULE-T06-002 repeated source row identity aborts the entire import while duplicate business identifiers stay supported", async () => {
    const base = legacyFixture();
    const source = { ...base, *rows(table: string) { for (const row of base.rows(table)) yield { ...row, sourceRow: "1" }; } };
    await expect(importLegacy(client, source)).rejects.toThrow("not strictly increasing");
    expect((await client.query("SELECT count(*)::text AS count FROM import_audit.runs")).rows[0].count).toBe("0");
    expect((await client.query('SELECT count(*)::text AS count FROM app."Clientes"')).rows[0].count).toBe("0");
    await importLegacy(client, base); await reconcileLegacy(client, base);
    expect((await client.query('SELECT count(*)::text AS count FROM app."tempos_reparacao" WHERE "tempos_reparacaoID"=7')).rows[0].count).toBe("2");
  });

  it("import interruption retains its original failure when the actual connection closes before rollback", async () => {
    const name = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    const interrupted = new Error("Synthetic source interruption");
    const closing: Promise<void>[] = [];
    await expect(importLegacy(client, legacyFixture(), { afterBatch() { closing.push(client.end()); throw interrupted; } })).rejects.toBe(interrupted);
    await Promise.all(closing);
    client = await engine.connect(name);
    expect((await client.query("SELECT count(*)::text AS count FROM import_audit.runs")).rows[0].count).toBe("0");
    expect((await client.query('SELECT count(*)::text AS count FROM app."Clientes"')).rows[0].count).toBe("0");
    await importLegacy(client, legacyFixture()); await reconcileLegacy(client, legacyFixture());
  });

  it("RULE-T01..T17-002/003 all seventeen tables retain raw NULL/empty/anomalies and opaque binary provenance", async () => {
    const samples: Record<string, Record<string, Cell>[]> = {
      Clientes: [{ ClientesID: "9223372036854775807", Codigo: "18446744073709551615", Descricao: "  ÁÇORES  ", Morada1: "", Morada2: null, observacao: "A\r\nB" }],
      Viaturas: [{ ViaturasID: "-1", matricula: " imported registration beyond 15 ", Cliente: "999", marca: " ÁÇ ", Ano: "0", mes: "255" }],
      mecanicos: [{ mecanicosID: "1", Codigo: "0", Descricao: "Mecânico", palavra_passe: "SyntheticOnly", inativo: "1" }],
      artigos: [{ artigosID: "1", Codigo: " a ", unidade: "???", preco: "0.10000000000000001", stock: "-123456789.123456789123456789", inativo: null }],
      ordem_reparacao: [{ ordem_reparacaoID: "1", numero: "18446744073709551615", matricula: "ORPHAN", recepcao_cliente: "777", recepcao_datahora: "00000000000000000", recepcao_entrega_prevista: "", total_pago: "-1.234567890123456789" }],
      tempos_reparacao: [{ tempos_reparacaoID: "7", numero: "999", mecanico: "255", inicio: "00000000000000000", fim: "" }, { tempos_reparacaoID: "7", numero: "999", inicio: "", fim: null }],
      material_reparacao: [{ material_reparacaoID: "1", numero: "999", artigo: "ORPHAN", quantidade: "-2.123456789123456789", data_hora: "", lancado: "0", extra: null }],
      utilizadores: [{ utilizadoresID: "1", Codigo: "255", Descricao: " Utilizador ", palavra_passe: "SyntheticOnly" }],
      unidades: [{ unidadesID: "1", Codigo: "u", Descricao: "" }, { unidadesID: "2", Codigo: "u", Descricao: null }],
      documentos: [{ documentosID: "1", Codigo: "???", Descricao: " Documento ", stock: "255", obriga_macanico: null }],
      cab_stocks: [{ cab_stocksID: "1", documento_codigo: "ORPHAN", documento_numero: "18446744073709551615", data: "", mecanico: "255", DocumentosID: "-9223372036854775808", MecanicosID: "9007199254740993" }],
      lin_stocks: [{ lin_stocksID: "1", documento_codigo: "???", documento_numero: "2", linha: "4294967295", artigo: "ORPHAN", quantidade: "-1.20E-5", preco: "0.000000000000000001", Documento_codigodocumento_numero: Buffer.from([0, 255, 1]) }, { lin_stocksID: "2", Documento_codigodocumento_numero: Buffer.alloc(0) }],
      estados_reparacao: [{ estados_reparacaoID: "1", Codigo: "R", tipo: "255", Cor: "4294967295", lancar_defa: "0", lancar_material: null, confirmacao: "1" }],
      estados_descritivos: [{ estados_descritivosID: "1", Codigo: "É", Descricao: " A\r\nB " }],
      Terminais: [{ Codigo: " t ", Descricao: "", codbarras_inicio: "255", codbarras_fim: "0", quant_inicio: null, pasta_localizacao: "", nome_ficheiro: null }],
      sistema: [{ Tempo_ordem_reparacao: "18446744073709551615", Tempo_materiais: "0", Tempo_tempos: null, Data_inicio: "65535", encerrar_tempos1: "", encerrar_tempos2: null }],
      postos: [{ Codigo: "255", Descricao: null, terminal: "ORPHAN", teste: "  kept  " }],
    };
    const manifest: ExportManifest = { tables: {} }, records: Record<string, Cell[][]> = {};
    for (const table of columnMapping.tables) {
      records[table.name] = samples[table.name].map(sample => table.columns.map(column => sample[column.name] ?? null));
      const hash = createHash("sha256"); records[table.name].forEach(cells => updateTypedHash(hash, cells));
      manifest.tables[table.name] = { rows: records[table.name].length, columns: table.columns.map(column => ({ name: column.sourceName })), sha256_typed_rows: hash.digest("hex") };
    }
    const source = { manifest, fingerprint: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"), assertUnchanged() {},
      *rows(table: string) { for (const [index, values] of records[table].entries()) yield { sourceRow: index === 0 ? "-1" : "0", values }; } };
    const report = await importLegacy(client, source); await reconcileLegacy(client, source);
    expect(Object.keys(report.tables)).toHaveLength(17);
    for (const [name, rows] of Object.entries(samples)) expect(report.tables[name]).toMatchObject({ rows: rows.length, imported: rows.length, quarantined: 0, mismatches: 0 });
    expect((await client.query('SELECT "stock"::text,"preco"::text,"unidade","inativo" FROM app."artigos"')).rows[0]).toEqual({ stock: "-123456789.123456789123456789", preco: "0.10000000000000001", unidade: "???", inativo: null });
    expect((await client.query('SELECT "DocumentosID"::text,"MecanicosID"::text FROM app."cab_stocks"')).rows[0]).toEqual({ DocumentosID: "-9223372036854775808", MecanicosID: "9007199254740993" });
    expect((await client.query('SELECT "Documento_codigodocumento_numero" AS binary FROM app."lin_stocks" ORDER BY _row_id')).rows).toEqual([{ binary: Buffer.from([0, 255, 1]) }, { binary: Buffer.alloc(0) }]);
    expect((await client.query('SELECT "Descricao" FROM app."unidades" ORDER BY _row_id')).rows).toEqual([{ Descricao: "" }, { Descricao: null }]);
    expect((await client.query('SELECT "Tempo_ordem_reparacao"::text,"encerrar_tempos1","encerrar_tempos2" FROM app."sistema"')).rows[0]).toEqual({ Tempo_ordem_reparacao: "18446744073709551615", encerrar_tempos1: "", encerrar_tempos2: null });
  });
});
