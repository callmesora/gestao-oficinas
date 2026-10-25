import { createHash } from "node:crypto";
import type { Client } from "pg";
import type { MechanicCredentialPolicy } from "../security/mechanics";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { repairMaterialsReadSchema, repairMaterialsListSchema, repairMaterialsArticleSchema, repairMaterialsMechanicSchema, repairMaterialsSaveSchema,
  type RepairMaterialsListResult, type RepairMaterialsOrder, type RepairMaterialsMechanic, type RepairMaterialsReadResult, type RepairMaterialLine,
  type RepairMaterialsArticleResult, type RepairMaterialsArticle, type RepairMaterialsMechanicResult, type RepairMaterialsSaveResult } from "../../../../packages/domain/src/repair-materials";

type Order = { orderId: string; numero: string | null; matricula: string | null; state: string | null; mechanicCode: number | null };
type StoredMaterial = RepairMaterialLine & { material_reparacaoID: string | null; reparacao_estado: string | null; extra: boolean | null; _import_id: string | null; _source_row: string | null };
const storedFields = '_row_id::text AS id,"material_reparacaoID"::text,"data_hora","mecanico","artigo","descricao_artigo","quantidade"::text,"preco"::text,"lancado","reparacao_estado","extra",_import_id::text,_source_row::text';
const publicLine = (row: StoredMaterial): RepairMaterialLine => ({ id: row.id, data_hora: row.data_hora, mecanico: row.mecanico, artigo: row.artigo,
  descricao_artigo: row.descricao_artigo, quantidade: row.quantidade, preco: row.preco, lancado: row.lancado });
const revision = (state: string | null, rows: StoredMaterial[]) => createHash("sha256").update(JSON.stringify({ state, rows })).digest("hex");
const orderFields = '_row_id::text AS "orderId","numero"::text,"matricula","reparacao_estado" AS state,"reparacao_mecanico" AS "mechanicCode"';
async function materialRows(client: Client, numero: string | null) {
  return (await client.query<StoredMaterial>(`SELECT ${storedFields} FROM app."material_reparacao" WHERE "numero"=$1 ORDER BY "data_hora" ASC NULLS LAST,_row_id`, [numero])).rows;
}

export async function listRepairMaterials(connect: DatabaseConnection, input: unknown): Promise<RepairMaterialsListResult> {
  const parsed = repairMaterialsListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Verified dossier: QRY_select_ordens_reparacao_matricula/sql; preserve duplicate joins and typed numero ASC.
    const result = await client.query<RepairMaterialsOrder>(`SELECT json_build_array(o._row_id::text,s._row_id::text,v._row_id::text,m._row_id::text)::text AS id,
      o._row_id::text AS "orderId",o."numero"::text,o."matricula",(v."marca"||' ')||v."modelo" AS marcamodelo,o."reparacao_mecanico"
      FROM app."ordem_reparacao" o INNER JOIN app."estados_reparacao" s ON o."reparacao_estado"=s."Codigo"
      INNER JOIN app."Viaturas" v ON o."matricula"=v."matricula" LEFT JOIN app."mecanicos" m ON m."Codigo"=o."reparacao_mecanico"
      WHERE s."tipo"=ANY($1::smallint[]) AND s."lancar_material"=TRUE${parsed.data.mechanic !== undefined ? ' AND o."reparacao_mecanico"=$2' : ""}
      ORDER BY o."numero" ASC NULLS LAST,o._row_id,s._row_id,v._row_id,m._row_id`,
      parsed.data.mechanic !== undefined ? [parsed.data.restricted ? [3, 5, 2] : [1, 2, 3, 4, 5, 6, 7, 8], parsed.data.mechanic] : [parsed.data.restricted ? [3, 5, 2] : [1, 2, 3, 4, 5, 6, 7, 8]]);
    const mechanics = await client.query<RepairMaterialsMechanic>('SELECT "Codigo","Descricao","inativo" FROM app."mecanicos" ORDER BY "Codigo" ASC NULLS LAST,_row_id');
    const settings = await client.query<{ timer: string | null }>('SELECT "Tempo_materiais"::text AS timer FROM app."sistema" ORDER BY _row_id LIMIT 1');
    return { kind: "loaded", orders: result.rows, mechanics: mechanics.rows, timer: settings.rows[0]?.timer ?? null };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function readRepairMaterials(connect: DatabaseConnection, input: unknown): Promise<RepairMaterialsReadResult> {
  const parsed = repairMaterialsReadSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Source WIN_Material_Reparacao483–513: refuse an existing writer before opening.
    // ADR006: release this short consistency check before any user interaction.
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    const lookup = "orderId" in parsed.data ? { field: "_row_id", value: parsed.data.orderId } : { field: '"numero"', value: parsed.data.numero };
    const order = (await client.query<Order>(`SELECT ${orderFields} FROM app."ordem_reparacao" WHERE ${lookup.field}=$1 ORDER BY _row_id LIMIT 1 FOR UPDATE NOWAIT`, [lookup.value])).rows[0];
    if (!order || order.numero === null) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const rows = await materialRows(client, order.numero);
    const mechanics = (await client.query<RepairMaterialsMechanic>('SELECT "Codigo","Descricao","inativo" FROM app."mecanicos" ORDER BY _row_id')).rows;
    const vehicle = (await client.query<{ marcamodelo: string | null }>('SELECT ("marca"||\' \')||"modelo" AS marcamodelo FROM app."Viaturas" WHERE "matricula"=$1 ORDER BY _row_id LIMIT 1', [order.matricula])).rows[0];
    await client.query("COMMIT");
    return { kind: "loaded", document: { orderId: order.orderId, numero: order.numero, matricula: order.matricula, marcamodelo: vehicle?.marcamodelo ?? null,
      state: order.state, mechanic: mechanics.find(value => value.Codigo !== null && value.Codigo === order.mechanicCode) ?? null, baseline: revision(order.state, rows),
      rows: rows.map(row => ({ ...publicLine(row), mechanicDescription: mechanics.find(value => value.Codigo !== null && value.Codigo === row.mecanico)?.Descricao ?? null })) } };
  } catch (error) {
    await rollbackAfterFailure(client);
    return { kind: (error as { code?: string }).code === "55P03" ? "inUse" : "failed" };
  }
  finally { await closeOperationClient(client); }
}

export async function lookupRepairMaterialArticle(connect: DatabaseConnection, input: unknown): Promise<RepairMaterialsArticleResult> {
  const parsed = repairMaterialsArticleSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Verified source1286–1313: barcode wins over a matching article code; no inactive guard.
    const result = await client.query<RepairMaterialsArticle>(`SELECT "Codigo","Descricao","preco"::text FROM app."artigos"
      WHERE "Codigo"=$1${parsed.data.barcodeFirst ? ' OR "codbarras"=$1' : ""}
      ORDER BY ${parsed.data.barcodeFirst ? 'CASE WHEN "codbarras"=$1 THEN 0 ELSE 1 END,' : ""}_row_id LIMIT 1`, [parsed.data.value]);
    return result.rows[0] ? { kind: "loaded", article: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

async function authenticateMechanic(client: Client, code: number | null, password: string, credentials?: MechanicCredentialPolicy, revision?: string, revalidate = false): Promise<RepairMaterialsMechanicResult> {
  // Verified source284–308/758–783: source case-sensitive equality, no trim/upper/hash conversion.
  const record = (await client.query<RepairMaterialsMechanic & { id: string; palavra_passe?: string | null }>(`SELECT _row_id::text AS id,"Codigo","Descricao","inativo"${credentials ? "" : ',"palavra_passe"'} FROM app."mecanicos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1`, [code])).rows[0];
  if (!record) return { kind: "missing" };
  if (record.inativo === true) return { kind: "inactive" };
  if (password === "") return { kind: "cancelled", mechanic: { Codigo: record.Codigo, Descricao: record.Descricao, inativo: record.inativo } };
  const checked = credentials ? await credentials.verify(client, record.id, password, revision, revalidate) : { valid: record.palavra_passe !== null && password === record.palavra_passe };
  if (!checked.valid) return { kind: "incorrect" };
  return { kind: "authenticated", mechanic: { Codigo: record.Codigo, Descricao: record.Descricao, inativo: record.inativo }, ...("revision" in checked && checked.revision ? { credentialRevision: checked.revision } : {}) };
}

export async function authenticateRepairMaterialMechanic(connect: DatabaseConnection, input: unknown, credentials?: MechanicCredentialPolicy): Promise<RepairMaterialsMechanicResult> {
  const parsed = repairMaterialsMechanicSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    if (credentials) { await client.query("BEGIN"); await credentials.lock(client, false); }
    const result = await authenticateMechanic(client, parsed.data.code, parsed.data.password, credentials);
    if (credentials) await client.query("COMMIT");
    return result;
  }
  catch { await rollbackAfterFailure(client); return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveRepairMaterials(connect: DatabaseConnection, input: unknown, credentials?: MechanicCredentialPolicy): Promise<RepairMaterialsSaveResult> {
  const parsed = repairMaterialsSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, ids = command.rows.flatMap(row => row.id === null ? [] : [row.id]);
  if (new Set(ids).size !== ids.length) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    if (credentials) await credentials.lock(client, true);
    // ADR-006 MIG-9/ADR-011: order first; articles precede materials, matching article deletion.
    const order = (await client.query<Order>(`SELECT ${orderFields} FROM app."ordem_reparacao" WHERE _row_id=$1 FOR UPDATE NOWAIT`, [command.orderId])).rows[0];
    if (!order) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query('LOCK TABLE app."artigos",app."material_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    const old = await materialRows(client, order.numero);
    if (order.numero !== command.numero || order.state !== command.state || revision(order.state, old) !== command.baseline) { await client.query("ROLLBACK"); return { kind: "stale" }; }
    const retained = new Map(command.rows.filter(row => row.id !== null).map(row => [row.id!, row]));
    for (const row of old) {
      const next = retained.get(row.id!);
      if (row.lancado === true && (!next || JSON.stringify(publicLine(row)) !== JSON.stringify(next))) { await client.query("ROLLBACK"); return { kind: "launched" }; }
      if (next && (next.data_hora !== row.data_hora || next.mecanico !== row.mecanico || next.artigo !== row.artigo || next.lancado === true && row.lancado !== true)) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
    }
    if (ids.some(id => !old.some(row => row.id === id))) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
    const authenticatedCodes = new Set<number | null>();
    for (const row of command.rows.filter(row => row.id === null)) {
      if (row.lancado !== false) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
      const proof = command.proofs.find(value => value.code === row.mecanico);
      if (!proof) { await client.query("ROLLBACK"); return { kind: "incorrect" }; }
      if (authenticatedCodes.has(row.mecanico)) continue;
      const authenticated = await authenticateMechanic(client, proof.code, proof.password, credentials, proof.credentialRevision, true);
      if (authenticated.kind !== "authenticated") { await client.query("ROLLBACK"); return { kind: authenticated.kind === "inactive" ? "inactive" : "incorrect" }; }
      authenticatedCodes.add(row.mecanico);
    }
    let nextIdentity = BigInt((await client.query<{ maximum: string }>('SELECT GREATEST(COALESCE(MAX("material_reparacaoID"),0),0)::text AS maximum FROM app."material_reparacao"')).rows[0].maximum);
    if (nextIdentity + BigInt(command.rows.filter(row => row.id === null).length) > 9223372036854775807n) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    // Verified SRC-eb5a859599: restore ALL old quantities, even launched/orphan/negative rows.
    // ADR-006/U-W27273E-05: SQL NULL arithmetic stays NULL; missing article skips only stock.
    for (const row of old) await client.query('UPDATE app."artigos" SET "stock"="stock"+$2::numeric WHERE _row_id=(SELECT _row_id FROM app."artigos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1)', [row.artigo, row.quantidade]);
    for (const row of old) if (!retained.has(row.id!)) await client.query('DELETE FROM app."material_reparacao" WHERE _row_id=$1', [row.id]);
    for (const row of command.rows) {
      const fields = [row.mecanico, row.artigo, row.descricao_artigo, row.quantidade, row.data_hora, command.state, row.preco, row.lancado];
      if (row.id !== null) {
        // ADR-006 target preservation default: retain identity/provenance/current extra on existing rows.
        await client.query('UPDATE app."material_reparacao" SET "mecanico"=$1,"artigo"=$2,"descricao_artigo"=$3,"quantidade"=$4,"data_hora"=$5,"reparacao_estado"=$6,"preco"=$7,"lancado"=$8 WHERE _row_id=$9', [...fields, row.id]);
      } else {
        nextIdentity += 1n;
        await client.query(`INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","data_hora","reparacao_estado","preco","lancado","extra")
          VALUES ($10,$9,$1,$2,$3,$4,$5,$6,$7,$8,FALSE)`, [...fields, command.numero, nextIdentity.toString()]);
      }
      // Source876–880: same first matching article, exact subtraction, no nonnegative stock guard.
      await client.query('UPDATE app."artigos" SET "stock"="stock"-$2::numeric WHERE _row_id=(SELECT _row_id FROM app."artigos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1)', [row.artigo, row.quantidade]);
    }
    await client.query("COMMIT");
    return { kind: "saved" };
  } catch (error) {
    await rollbackAfterFailure(client);
    return { kind: (error as { code?: string }).code === "55P03" ? "inUse" : "failed" };
  } finally { await closeOperationClient(client); }
}
