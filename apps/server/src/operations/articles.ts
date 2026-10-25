import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { articleIdentitySchema, articleListSchema, articleSaveSchema, articleRequiredMessage, articleDuplicateMessage, isArticlePrice,
  type Article, type ArticleListResult, type ArticleSaveResult, type ArticleDeleteResult } from "../../../../packages/domain/src/articles";
import type { Client } from "pg";

const returning = `_row_id::text AS id,"artigosID"::text,"Codigo","Descricao","codbarras","unidade","preco"::text,"inativo","stock"::text`;
const materialMessage = "Artigo usado em ordens de reparação, não pode ser eliminado";
const stockMessage = "Artigo usado em documentos, não pode ser eliminado";
const barcodeMessage = "Código de barras já associado a outro artigo";

export async function listArticles(connect: DatabaseConnection, input: unknown): Promise<ArticleListResult> {
  const parsed = articleListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const filter = parsed.data;
    const predicates: string[] = [], bindings: string[] = [];
    if (filter.active !== filter.inactive) predicates.push(`a."inativo"=${filter.inactive ? "TRUE" : "FALSE"}`);
    const field = { todos: undefined, codigo: "Codigo", descricao: "Descricao", codigobarras: "codbarras" }[filter.mode];
    if (field && filter.term !== "") {
      predicates.push(`position(lower($1) in lower(a."${field}"))>0`);
      bindings.push(filter.term);
    }
    const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
    // ADR-012: order typed source values, before lossless numeric string transport.
    const result = await client.query<Article>(`SELECT ${returning} FROM app."artigos" a${where} ORDER BY a."${filter.sort ?? "artigosID"}" ${filter.descending ? "DESC" : "ASC"} NULLS LAST,a._row_id`, bindings);
    return { kind: "loaded", articles: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveArticle(connect: DatabaseConnection, input: unknown): Promise<ArticleSaveResult> {
  const parsed = articleSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = articleRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: match unit deletion's order; source has no unit-existence guard.
    await client.query('LOCK TABLE app."unidades",app."artigos" IN SHARE ROW EXCLUSIVE MODE');
    if (command.mode === "update") {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."artigos" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
    }
    // Verified: source38–98 checks barcode before HAdd/HModify's Codigo duplicate error.
    if (values.codbarras !== null && values.codbarras !== "") {
      const barcode = await client.query(`SELECT 1 FROM app."artigos" WHERE "codbarras"=$1${command.mode === "update" ? ' AND "Codigo"<>$2' : ""} LIMIT 1`, command.mode === "update" ? [values.codbarras, values.Codigo] : [values.codbarras]);
      if (barcode.rowCount) { await client.query("ROLLBACK"); return { kind: "barcodeDuplicate", message: barcodeMessage }; }
    }
    // ADR-002: malformed transient drafts never bypass earlier source messages or write.
    if (!isArticlePrice(values.preco)) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
    const bindings = [values.Descricao, values.codbarras, values.unidade, values.preco, values.inativo];
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."artigos" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: articleDuplicateMessage(values.Codigo) }; }
      result = await client.query<Article>(`INSERT INTO app."artigos" ("artigosID","Descricao","codbarras","unidade","preco","inativo","Codigo","stock")
        SELECT GREATEST(COALESCE(MAX("artigosID"),0),0)+1,$1,$2,$3,$4,$5,$6,0 FROM app."artigos"
        HAVING GREATEST(COALESCE(MAX("artigosID"),0),0)<9223372036854775807 RETURNING ${returning}`, [...bindings, values.Codigo]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      // Readonly stock is deliberately absent: preserve the CURRENT database quantity.
      result = await client.query<Article>(`UPDATE app."artigos" SET "Descricao"=$1,"codbarras"=$2,"unidade"=$3,"preco"=$4,"inativo"=$5 WHERE _row_id=$6 RETURNING ${returning}`, [...bindings, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", article: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CAA44622-03: typed rollback replaces unchecked source success fallthrough.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

// Verified: WIN_Table_artigos.wdw:320–343. Earlier material hit wins, without a later query.
async function articleAssociation(client: Client, code: string | null): Promise<Extract<ArticleDeleteResult, { kind: "associated" }> | { kind: "ready" }> {
  const material = await client.query('SELECT 1 FROM app."material_reparacao" WHERE "artigo"=$1 LIMIT 1', [code]);
  if (material.rowCount) return { kind: "associated", message: materialMessage };
  const stock = await client.query('SELECT 1 FROM app."lin_stocks" WHERE "artigo"=$1 LIMIT 1', [code]);
  return stock.rowCount ? { kind: "associated", message: stockMessage } : { kind: "ready" };
}

export async function checkArticleDelete(connect: DatabaseConnection, input: unknown): Promise<ArticleDeleteResult | { kind: "ready" }> {
  const parsed = articleIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."artigos" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) return { kind: "missing" };
    return await articleAssociation(client, existing.rows[0].Codigo);
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteArticle(connect: DatabaseConnection, input: unknown): Promise<ArticleDeleteResult> {
  const parsed = articleIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: future movement writers honor articles→materials→stock lines.
    await client.query('LOCK TABLE app."artigos",app."material_reparacao",app."lin_stocks" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."artigos" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const associated = await articleAssociation(client, existing.rows[0].Codigo);
    if (associated.kind !== "ready") { await client.query("ROLLBACK"); return associated; }
    await client.query('DELETE FROM app."artigos" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C7738076-03: no invented failure text or committed-success claim.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
