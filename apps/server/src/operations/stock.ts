import type { Client } from "pg";
import { z } from "zod";
import { connectOperationClient, closeOperationClient, rollbackAfterFailure, type DatabaseConnection } from "../db/connection";
import { stockListSchema, stockIdentitySchema, stockSaveSchema, stockLookupSchema, stockNextSchema, scannerRowsSchema,
  type StockHeader, type StockLine, type StockArticle, type StockDocumentType, type StockMechanic, type StockListRow,
  type StockListResult, type StockReadResult, type StockSaveResult, type StockDeleteResult, type StockInventoryResult,
  type StockRebuildResult, type StockLookupResult, type StockNextResult, type ScannerConfigResult, type ScannerResult } from "../../../../packages/domain/src/stock";

const header = `c._row_id::text AS id,c."documento_codigo",c."documento_numero"::text,c."Descricao",c."data",c."mecanico"::text`;
const line = `"linha"::text,"artigo","descricao_artigo","quantidade"::text,"preco"::text`;
const article = `_row_id::text AS id,"Codigo","Descricao","preco"::text,"stock"::text`;
const empty = z.strictObject({});
// ADR006/porting: honor existing documentos→cab and artigos→material→lin edges.
const locks = 'LOCK TABLE app."documentos",app."cab_stocks",app."artigos",app."lin_stocks" IN SHARE ROW EXCLUSIVE MODE';
const rebuildLocks = 'LOCK TABLE app."documentos",app."cab_stocks",app."artigos",app."material_reparacao",app."lin_stocks" IN SHARE ROW EXCLUSIVE MODE';
async function selected(client: Client, id: string): Promise<{ header: StockHeader; lines: StockLine[]; baseline: string } | null> {
  const found = await client.query<StockHeader>(`SELECT ${header} FROM app."cab_stocks" c WHERE c._row_id=$1`, [id]);
  if (!found.rowCount) return null;
  const h = found.rows[0];
  const lines = await client.query<StockLine>(`SELECT ${line} FROM app."lin_stocks" WHERE "documento_codigo"=$1 AND "documento_numero"=$2 ORDER BY "documento_numero",_row_id`, [h.documento_codigo, h.documento_numero]);
  // U-W7E91C1-03: baseline is a concurrency token, never proof of authorization.
  return { header: h, lines: lines.rows, baseline: JSON.stringify([h, lines.rows]) };
}
async function movement(client: Client, code: string | null) {
  const docs = await client.query<{ stock: number | null }>('SELECT "stock" FROM app."documentos" WHERE "Codigo"=$1 ORDER BY _row_id', [code]);
  return docs.rows;
}
async function applyLine(client: Client, row: StockLine, sign: 1 | -1) {
  // Source exact seek chooses one current article; orphan lines skip stock only.
  await client.query(`UPDATE app."artigos" SET "stock"="stock"+$2::numeric*$3::numeric WHERE _row_id=(SELECT _row_id FROM app."artigos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1)`, [row.artigo, row.quantidade, sign]);
}
async function allocate(client: Client, table: "cab_stocks" | "lin_stocks") {
  const result = await client.query<{ id: string }>(`SELECT (GREATEST(COALESCE(MAX("${table}ID"),0),0)+1)::text AS id FROM app."${table}" HAVING GREATEST(COALESCE(MAX("${table}ID"),0),0)<9223372036854775807`);
  if (!result.rowCount) throw new Error("capacity");
  return result.rows[0].id;
}

export async function listStock(connect: DatabaseConnection, input: unknown): Promise<StockListResult> {
  const parsed = stockListSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const q = parsed.data, fields = { document: 'd."Descricao"', number: 'c."documento_numero"', date: 'c."data"', description: 'c."Descricao"' };
    // QRY_select_cab_stocks: real INNER JOIN, retain duplicate multiplicity. Dates intentionally absent.
    const result = await client.query<StockListRow>(`SELECT ${header},d._row_id::text AS "documentId",d."Descricao" AS "documentDescription",d."stock" FROM app."documentos" d INNER JOIN app."cab_stocks" c ON c."documento_codigo"=d."Codigo"
      WHERE ($1::text='' OR c."documento_codigo"=$1) AND c."documento_numero">=$2::numeric AND c."documento_numero"<=$3::numeric AND ($4::text='' OR d."Descricao"=$4)
      ORDER BY ${q.sort ? fields[q.sort] : "c._row_id"} ${q.descending ? "DESC" : "ASC"} NULLS LAST,c._row_id,d._row_id`, [q.document ?? "", q.from && BigInt(q.from) !== 0n ? q.from : "1", q.to && BigInt(q.to) !== 0n ? q.to : "9999999999", q.description ?? ""]);
    const documents = await client.query<StockDocumentType>('SELECT _row_id::text AS id,"Codigo","Descricao","stock","obriga_macanico" FROM app."documentos" ORDER BY "Codigo",_row_id');
    const mechanics = await client.query<StockMechanic>('SELECT "Codigo"::text,"Descricao" FROM app."mecanicos" ORDER BY "Codigo",_row_id');
    return { kind: "loaded", rows: result.rows, documents: documents.rows, mechanics: mechanics.rows };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function readStock(connect: DatabaseConnection, input: unknown): Promise<StockReadResult> {
  const parsed = stockIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try { await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY"); const data = await selected(client, parsed.data.id); await client.query("COMMIT"); return data ? { kind: "loaded", ...data } : { kind: "missing" }; }
  catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function nextStockNumber(connect: DatabaseConnection, input: unknown): Promise<StockNextResult> {
  const parsed = stockNextSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try { const value = await client.query<{ number: string }>('SELECT (GREATEST(COALESCE(MAX("documento_numero"),0),0)+1)::text AS number FROM app."cab_stocks" WHERE "documento_codigo"=$1', [parsed.data.document]); return { kind: "loaded", number: value.rows[0].number }; }
  catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function lookupStockArticle(connect: DatabaseConnection, input: unknown): Promise<StockLookupResult> {
  const parsed = stockLookupSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    let found = parsed.data.barcode === false ? null : await client.query<StockArticle>(`SELECT ${article} FROM app."artigos" WHERE "codbarras"=$1 ORDER BY _row_id LIMIT 1`, [parsed.data.code]);
    if (!found?.rowCount) found = await client.query<StockArticle>(`SELECT ${article} FROM app."artigos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1`, [parsed.data.code]);
    return found.rowCount ? { kind: "found", article: found.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function saveStock(connect: DatabaseConnection, input: unknown): Promise<StockSaveResult> {
  const parsed = stockSaveSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data; if (!command.lines.length) return { kind: "empty", message: "Documento sem linhas" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query(locks);
    const docs = await movement(client, command.document);
    // UNRESOLVED U-W7E91C1-03: no unknown shared-buffer movement/ambiguous document write.
    if (docs.length !== 1) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
    const sign = docs[0].stock === 1 ? 1 : -1;
    let id: string;
    const same = await client.query<{ id: string }>('SELECT _row_id::text AS id FROM app."cab_stocks" WHERE "documento_codigo"=$1 AND "documento_numero"=$2', [command.document, command.number]);
    if (command.mode === "update") {
      const current = await selected(client, command.id!);
      if (!current) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (current.baseline !== command.baseline || current.header.documento_codigo !== command.document || current.header.documento_numero !== BigInt(command.number).toString() || current.header.data !== command.date) { await client.query("ROLLBACK"); return { kind: "stale" }; }
      if (same.rowCount !== 1) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
      id = command.id!;
      for (const row of current.lines) await applyLine(client, row, sign === 1 ? -1 : 1);
      await client.query('DELETE FROM app."lin_stocks" WHERE "documento_codigo"=$1 AND "documento_numero"=$2', [command.document, command.number]);
    } else {
      if (same.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate" }; }
      const result = await client.query<{ id: string }>('INSERT INTO app."cab_stocks" ("cab_stocksID","documento_codigo","documento_numero","Descricao","data","mecanico") VALUES ($1,$2,$3,$4,$5,$6) RETURNING _row_id::text AS id', [await allocate(client, "cab_stocks"), command.document, command.number, command.description, command.date, command.mechanic]);
      id = result.rows[0].id;
    }
    for (const row of command.lines) {
      await client.query('INSERT INTO app."lin_stocks" ("lin_stocksID","documento_codigo","documento_numero","linha","artigo","descricao_artigo","quantidade","preco") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [await allocate(client, "lin_stocks"), command.document, command.number, row.linha, row.artigo, row.descricao_artigo, row.quantidade, row.preco]);
      await applyLine(client, row, sign);
    }
    if (command.mode === "update") await client.query('UPDATE app."cab_stocks" SET "Descricao"=$1,"data"=$2,"mecanico"=$3 WHERE _row_id=$4', [command.description, command.date, command.mechanic, id]);
    await client.query("COMMIT"); return { kind: "saved", id };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function deleteStock(connect: DatabaseConnection, input: unknown): Promise<StockDeleteResult> {
  const parsed = stockIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query(locks);
    const current = await selected(client, parsed.data.id); if (!current) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const docs = await movement(client, current.header.documento_codigo);
    if (docs.length > 1 || current.header.documento_codigo === null || current.header.documento_numero === null) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
    // Verified source bug WIN_Table_cab_stocks884–892: DELETE applies the SAVE sign, never reversal.
    for (const row of current.lines) await applyLine(client, row, docs[0]?.stock === 1 ? 1 : -1);
    const key = [current.header.documento_codigo, current.header.documento_numero];
    await client.query('DELETE FROM app."lin_stocks" WHERE "documento_codigo"=$1 AND "documento_numero"=$2', key);
    await client.query('DELETE FROM app."cab_stocks" WHERE "documento_codigo"=$1 AND "documento_numero"=$2', key);
    await client.query("COMMIT"); return { kind: "deleted" };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function stockInventory(connect: DatabaseConnection, input: unknown): Promise<StockInventoryResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try { const found = await client.query<StockArticle>(`SELECT ${article} FROM app."artigos" ORDER BY "Codigo",_row_id`); return { kind: "loaded", articles: found.rows }; }
  catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function rebuildStock(connect: DatabaseConnection, input: unknown): Promise<StockRebuildResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query(rebuildLocks);
    const unknown = await client.query(`SELECT 1 FROM app."lin_stocks" l WHERE l."quantidade" IS NULL OR l."documento_codigo" IS NULL OR l."documento_codigo"='' OR (SELECT COUNT(*) FROM app."documentos" d WHERE d."Codigo"=l."documento_codigo")<>1
      UNION ALL SELECT 1 FROM app."material_reparacao" WHERE "quantidade" IS NULL LIMIT 1`);
    // ADR006/U-W541EAA-03/05: refuse before zeroing unknown orphan-buffer/NULL arithmetic.
    if (unknown.rowCount) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
    const result = await client.query(`UPDATE app."artigos" a SET "stock"=COALESCE((SELECT SUM(CASE d."stock" WHEN 1 THEN l."quantidade" WHEN 2 THEN -l."quantidade" ELSE 0 END) FROM app."lin_stocks" l JOIN app."documentos" d ON d."Codigo"=l."documento_codigo" WHERE l."artigo"=a."Codigo"),0)-COALESCE((SELECT SUM(m."quantidade") FROM app."material_reparacao" m WHERE m."artigo"=a."Codigo"),0)`);
    await client.query("COMMIT"); return { kind: "rebuilt", articles: String(result.rowCount) };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function stockScannerConfig(connect: DatabaseConnection, input: unknown): Promise<ScannerConfigResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ barcodeStart: number | null; barcodeLength: number | null; quantityStart: number | null; quantityLength: number | null; terminalCode: string; folder: string | null; filename: string | null }>(`SELECT t."codbarras_inicio" AS "barcodeStart",t."codbarras_fim" AS "barcodeLength",t."quant_inicio" AS "quantityStart",t."quant_fim" AS "quantityLength",t."Codigo" AS "terminalCode",t."pasta_localizacao" AS folder,t."nome_ficheiro" AS filename FROM app."postos" p JOIN app."Terminais" t ON t."Codigo"=p."terminal" WHERE p."Codigo"=1 ORDER BY p._row_id,t._row_id`);
    if (result.rowCount !== 1) return { kind: "unresolved" };
    const c = result.rows[0];
    if (c.barcodeStart === null || c.barcodeLength === null || c.quantityStart === null || c.quantityLength === null || c.barcodeStart < 1 || c.quantityStart < 1 || c.barcodeLength < 0 || c.quantityLength < 0) return { kind: "unresolved" };
    return { kind: "loaded", config: { barcodeStart: c.barcodeStart, barcodeLength: c.barcodeLength, quantityStart: c.quantityStart, quantityLength: c.quantityLength, terminalCode: c.terminalCode, folder: c.folder, filename: c.filename } };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function partitionStockScanner(connect: DatabaseConnection, input: unknown): Promise<ScannerResult> {
  const parsed = scannerRowsSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const known: Extract<ScannerResult, { kind: "partitioned" }>["known"] = [], unknown: Extract<ScannerResult, { kind: "partitioned" }>["unknown"] = [];
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    for (const row of parsed.data.rows) {
      const found = await client.query<StockArticle>(`SELECT ${article} FROM app."artigos" WHERE "codbarras"=$1 ORDER BY _row_id LIMIT 1`, [row.barcode]);
      if (found.rowCount) known.push({ ...row, code: found.rows[0].Codigo, description: found.rows[0].Descricao, price: found.rows[0].preco }); else unknown.push(row);
    }
    await client.query("COMMIT"); return { kind: "partitioned", known, unknown };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
