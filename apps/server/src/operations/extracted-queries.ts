import { z } from "zod";
import { Buffer } from "node:buffer";
import { dateOnlyComparisonKey, dateTimeComparisonKey, isDateOnlyBound, isDateTimeBound } from "../../../../packages/domain/src/date-time";
import { connectOperationClient, closeOperationClient, rollbackAfterFailure, type DatabaseConnection } from "../db/connection";

/** Internal, fixed-name equivalents of the25 dossier SQL queries. Never expose this adapter as
 * arbitrary SQL or as an unauthenticated route. In particular the mechanic lookup contains the
 * source credential field for trusted server callers only (ADR004); do not log its result.
 * Exact SQL/parameters: docs/mapping/<query>.md. ADR002 keeps numbers/date text lossless;
 * ADR005 NULL range/list conditions are omitted, while exact key NULL seeks remain nonmatching.
 * Runtime omission/collation/current-buffer behavior remains each query's U-Qxx-03/04.
 */
const text = z.string().nullable();
const unsigned = z.string().refine(value => /^(?:0|[1-9][0-9]{0,19})$/.test(value) && BigInt(value) <= 18446744073709551615n).nullable();
const byte = z.string().refine(value => /^(?:0|[1-9][0-9]{0,2})$/.test(value) && BigInt(value) <= 255n).nullable();
const decimal = z.string().regex(/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/).nullable();
const dateTime = z.string().refine(isDateTimeBound).nullable();
const dateOnly = z.string().refine(isDateOnlyBound).nullable();
type DateRule = { field: string; dateOnly: boolean };
type DateSort = DateRule & { group: string | null; descending: boolean };
type Definition = { schema: z.ZodObject; parameters: readonly string[]; sql: string; operation: "read" | "insert-material" | "insert-order" | "update-order"; date?: DateRule; sort?: DateSort };

const definitions = {
  QRY_insert_material_reparacao: {
    schema: z.strictObject({ ParamNumero: unsigned, ParamMecanico: byte, ParamArtigo: text, ParamDescricaoArtigo: text, ParamQuantidade: decimal, ParamDataHora: text, ParamReparacaoEstado: text, ParamPreco: decimal, ParamLancado: z.boolean().nullable() }),
    parameters: ["ParamNumero", "ParamMecanico", "ParamArtigo", "ParamDescricaoArtigo", "ParamQuantidade", "ParamDataHora", "ParamReparacaoEstado", "ParamPreco", "ParamLancado"], operation: "insert-material",
    sql: `INSERT INTO app."material_reparacao" ("numero","mecanico","artigo","descricao_artigo","quantidade","data_hora","reparacao_estado","preco","lancado","material_reparacaoID","extra") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,FALSE)`,
  },
  QRY_insert_ordens_reparacao: {
    schema: z.strictObject({ ParamNumero: unsigned, ParamMatricula: text, ParamKM: unsigned, ParamRecepcao_util: byte, ParamRecepcao_data_hora: text, ParamRecepcao_cliente: unsigned, ParamRecepcao_Terceiro: unsigned, ParamRecepcao_contactos: text, ParamRecepcao_servico: text, ParamRecepcao_obs: text, ParamRecepcao_entrega: text, ParamRecepcao_prioridade: byte, ParamReparacao_mecanico: byte, ParamReparacao_estado: text, ParamReparacao_estado_obs: text, ParamReparacao_servico: text, ParamReparacao_estado_data: text, ParamReparacao_estado_historico: text, ParamTotal_mao_obra: decimal, ParamTotal_pecas: decimal, ParamTotal_desconto: decimal, ParamTotal_reparacao: decimal, ParamFaturado: z.boolean().nullable(), ParamTotal_pago: decimal, ParamNumero_fatura: text, ParamDataPagamento: text }),
    parameters: ["ParamNumero", "ParamMatricula", "ParamKM", "ParamRecepcao_util", "ParamRecepcao_data_hora", "ParamRecepcao_cliente", "ParamRecepcao_Terceiro", "ParamRecepcao_contactos", "ParamRecepcao_servico", "ParamRecepcao_obs", "ParamRecepcao_entrega", "ParamRecepcao_prioridade", "ParamReparacao_mecanico", "ParamReparacao_estado", "ParamReparacao_estado_obs", "ParamReparacao_servico", "ParamReparacao_estado_data", "ParamReparacao_estado_historico", "ParamTotal_mao_obra", "ParamTotal_pecas", "ParamTotal_desconto", "ParamTotal_reparacao", "ParamFaturado", "ParamTotal_pago", "ParamNumero_fatura", "ParamDataPagamento"], operation: "insert-order",
    sql: `INSERT INTO app."ordem_reparacao" ("numero","matricula","km_viatura","recepcao_util","recepcao_datahora","recepcao_cliente","recepcao_terceiro","recepacao_contatos","recepcao_servico","recepcao_obs","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico","reparacao_estado","reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico","totaL_mao_obra","total_pecas","total_desconto","total_reparacao","faturado","total_pago","numero_fatura","data_pagamento","ordem_reparacaoID","Estados_reparacaoID") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,0)`,
  },
  QRY_select_cab_lin_stocks: {
    schema: z.strictObject({ ParamDaData: dateTime, ParamAData: dateTime, ParamDoArtigo: text, ParamAoArtigo: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo"], operation: "read",
    sql: `SELECT "lin_stocks"."documento_numero" AS "numero", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."descricao_artigo" AS "descricao_artigo", "lin_stocks"."quantidade" AS "quantidade", "documentos"."Descricao" AS "Descricao", "cab_stocks"."data" AS "data", "documentos"."stock" AS "stock" FROM app."documentos", app."cab_stocks", app."lin_stocks" WHERE "cab_stocks"."documento_numero" = "lin_stocks"."documento_numero" AND "cab_stocks"."documento_codigo" = "lin_stocks"."documento_codigo" AND "documentos"."Codigo" = "cab_stocks"."documento_codigo" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "lin_stocks"."artigo" BETWEEN $1 AND $2) ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_select_cab_stocks: {
    schema: z.strictObject({  }),
    parameters: [], operation: "read",
    sql: `SELECT "cab_stocks"."cab_stocksID" AS "cab_stocksID", "cab_stocks"."documento_codigo" AS "documento_codigo", "cab_stocks"."documento_numero" AS "documento_numero", "cab_stocks"."data" AS "data", "cab_stocks"."Descricao" AS "Descricao_ca", "cab_stocks"."mecanico" AS "mecanico", "cab_stocks"."DocumentosID" AS "documentosID", "cab_stocks"."MecanicosID" AS "mecanicosID", "documentos"."documentosID" AS "documentosID_do", "documentos"."Codigo" AS "Codigo", "documentos"."Descricao" AS "Descricao", "documentos"."stock" AS "stock", "documentos"."obriga_macanico" AS "obriga_macanico" FROM app."documentos", app."cab_stocks" WHERE "cab_stocks"."documento_codigo" = "documentos"."Codigo"`,
  },
  QRY_select_cliente_codigo: {
    schema: z.strictObject({ ParamCodigo_Cliente: unsigned }),
    parameters: ["ParamCodigo_Cliente"], operation: "read",
    sql: `SELECT "Clientes"."Codigo" AS "Codigo", "Clientes"."Descricao" AS "Descricao", "Clientes"."Morada1" AS "Morada1", "Clientes"."Morada2" AS "Morada2", "Clientes"."codpostal" AS "codpostal", "Clientes"."Telefone1" AS "Telefone1", "Clientes"."Telemovel" AS "Telemovel", "Clientes"."observacao" AS "observacao" FROM app."Clientes" WHERE "Clientes"."Codigo" = $1`,
  },
  QRY_select_consumo_material_viatura: {
    schema: z.strictObject({ ParamDaData: dateTime, ParamAData: dateTime, ParamDoArtigo: text, ParamAoArtigo: text, ParamDaViatura: text, ParamAViatura: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo", "ParamDaViatura", "ParamAViatura"], operation: "read",
    sql: `SELECT "material_reparacao"."numero" AS "numero", "material_reparacao"."data_hora" AS "data_hora", "material_reparacao"."mecanico" AS "mecanico", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."descricao_artigo" AS "descricao_artigo", "material_reparacao"."quantidade" AS "quantidade", "artigos"."Codigo" AS "Codigo", "artigos"."Descricao" AS "Descricao", "artigos"."codbarras" AS "codbarras", "artigos"."unidade" AS "unidade", "artigos"."preco" AS "preco", "artigos"."inativo" AS "inativo", "ordem_reparacao"."numero" AS "numero_or", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."reparacao_mecanico" AS "reparacao_mecanico", "mecanicos"."Codigo" AS "Codigo_me", "mecanicos"."Descricao" AS "Descricao_me", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora" FROM app."artigos", app."ordem_reparacao", app."mecanicos", app."Viaturas", app."material_reparacao" WHERE "artigos"."Codigo" = "material_reparacao"."artigo" AND "material_reparacao"."numero" = "ordem_reparacao"."numero" AND "material_reparacao"."mecanico" = "mecanicos"."Codigo" AND "ordem_reparacao"."matricula" = "Viaturas"."matricula" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) AND ($3::text IS NULL OR $4::text IS NULL OR "ordem_reparacao"."matricula" BETWEEN $3 AND $4) ) ORDER BY matricula ASC, recepcao_datahora ASC`,
    date: {"field": "data_hora", "dateOnly": false},
    sort: {"field": "recepcao_datahora", "group": "matricula", "descending": false, "dateOnly": false},
  },
  QRY_select_lin_stocks: {
    schema: z.strictObject({ ParamNumero: unsigned, ParamDoc: text }),
    parameters: ["ParamNumero", "ParamDoc"], operation: "read",
    sql: `SELECT "lin_stocks"."lin_stocksID" AS "lin_stocksID", "lin_stocks"."documento_codigo" AS "documento_codigo", "lin_stocks"."documento_numero" AS "documento_numero", "lin_stocks"."linha" AS "linha", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."descricao_artigo" AS "descricao_artigo", "lin_stocks"."quantidade" AS "quantidade", "lin_stocks"."preco" AS "preco", "lin_stocks"."Documento_codigodocumento_numero" AS "documento_codigodocumento_numero" FROM app."lin_stocks" WHERE "lin_stocks"."documento_numero" = $1 AND "lin_stocks"."documento_codigo" = $2 ORDER BY documento_numero ASC`,
  },
  QRY_select_material_ordem_Reparacao: {
    schema: z.strictObject({ ParamDaData: dateTime, ParamAData: dateTime, ParamDoArtigo: text, ParamAoArtigo: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo"], operation: "read",
    sql: `SELECT "material_reparacao"."numero" AS "numero", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."descricao_artigo" AS "descricao_artigo", "material_reparacao"."quantidade" AS "quantidade", 'Ordem de reparaçªo' AS "Descricao", "ordem_reparacao"."recepcao_datahora" AS "data", 2 AS "stock" FROM app."ordem_reparacao", app."material_reparacao" WHERE "material_reparacao"."numero" = "ordem_reparacao"."numero" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_select_material_reparacao: {
    schema: z.strictObject({ ParamNumero: unsigned }),
    parameters: ["ParamNumero"], operation: "read",
    sql: `SELECT "material_reparacao"."numero" AS "numero", "material_reparacao"."mecanico" AS "mecanico", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."descricao_artigo" AS "descricao_artigo", "material_reparacao"."quantidade" AS "quantidade", "material_reparacao"."data_hora" AS "data_hora", "material_reparacao"."reparacao_estado" AS "reparacao_estado", "material_reparacao"."lancado" AS "lancado", "material_reparacao"."preco" AS "preco" FROM app."material_reparacao" WHERE "material_reparacao"."numero" = $1 ORDER BY data_hora ASC`,
  },
  QRY_select_mecanicos_codigo: {
    schema: z.strictObject({ ParamCodigo: byte }),
    parameters: ["ParamCodigo"], operation: "read",
    sql: `SELECT "mecanicos"."Codigo" AS "Codigo", "mecanicos"."Descricao" AS "Descricao", "mecanicos"."palavra_passe" AS "palavra_passe", "mecanicos"."inativo" AS "inativo" FROM app."mecanicos" WHERE "mecanicos"."Codigo" = $1`,
  },
  QRY_select_ordens_reparacao: {
    schema: z.strictObject({  }),
    parameters: [], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."km_viatura" AS "km_viatura", "ordem_reparacao"."recepcao_util" AS "recepcao_util", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "ordem_reparacao"."recepacao_contatos" AS "recepacao_contatos", "ordem_reparacao"."recepcao_servico" AS "recepcao_servico", "ordem_reparacao"."recepcao_obs" AS "recepcao_obs", "ordem_reparacao"."recepcao_entrega_prevista" AS "recepcao_entrega_prevista", "ordem_reparacao"."recepcao_prioridade" AS "recepcao_prioridade", "ordem_reparacao"."reparacao_mecanico" AS "reparacao_mecanico", "ordem_reparacao"."reparacao_estado" AS "reparacao_estado", "ordem_reparacao"."reparacao_estado_obs" AS "reparacao_estado_obs", "ordem_reparacao"."reparacao_servico" AS "reparacao_servico", "ordem_reparacao"."reparacao_estado_data" AS "reparacao_estado_data", "ordem_reparacao"."reparacao_estado_historico" AS "reparacao_estado_historico", "ordem_reparacao"."totaL_mao_obra" AS "totaL_mao_obra", "ordem_reparacao"."total_pecas" AS "total_pecas", "ordem_reparacao"."total_desconto" AS "total_desconto", "ordem_reparacao"."total_reparacao" AS "total_reparacao", "ordem_reparacao"."faturado" AS "faturado", "ordem_reparacao"."total_pago" AS "total_pago", "ordem_reparacao"."Estados_reparacaoID" AS "Estados_reparacaoID", "ordem_reparacao"."numero_fatura" AS "numero_fatura", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."Cliente" AS "Cliente", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "Viaturas"."Ano" AS "Ano", "Viaturas"."mes" AS "mes", ( ( "Viaturas"."marca" || ' ') || "Viaturas"."modelo" ) AS "marcamodelo", "estados_reparacao"."Codigo" AS "Codigo", "estados_reparacao"."Descricao" AS "Descricao", "estados_reparacao"."tipo" AS "tipo", "estados_reparacao"."Cor" AS "Cor", "mecanicos"."Codigo" AS "Codigo_me", "mecanicos"."Descricao" AS "Descricao_me", "Clientes"."Codigo" AS "Codigo_Cliente", "Clientes"."Descricao" AS "Descricao_Cliente", "ordem_reparacao"."recepcao_cliente" AS "recepcao_cliente", "ordem_reparacao"."recepcao_terceiro" AS "recepcao_terceiro", "Terceiro"."Codigo" AS "Codigo_Terceiro", "Terceiro"."Descricao" AS "Descricao_Terceiro" FROM ( app."Clientes" INNER JOIN ( ( ( app."mecanicos" RIGHT OUTER JOIN app."ordem_reparacao" ON "mecanicos"."Codigo" = "ordem_reparacao"."reparacao_mecanico" ) INNER JOIN app."estados_reparacao" ON "ordem_reparacao"."reparacao_estado" = "estados_reparacao"."Codigo" ) INNER JOIN app."Viaturas" ON "ordem_reparacao"."matricula" = "Viaturas"."matricula" ) ON "Clientes"."Codigo" = "ordem_reparacao"."recepcao_cliente" ) LEFT OUTER JOIN app."Clientes" "Terceiro" ON "Terceiro"."Codigo" = "ordem_reparacao"."recepcao_terceiro" ORDER BY numero DESC`,
  },
  QRY_select_ordens_reparacao_data_entrega: {
    schema: z.strictObject({ ParamDaData: dateOnly, ParamAData: dateOnly, ParamEstados: z.array(z.string()).nullable() }),
    parameters: ["ParamEstados"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "ordem_reparacao"."recepcao_entrega_prevista" AS "recepcao_entrega_prevista", "ordem_reparacao"."reparacao_estado" AS "reparacao_estado", "ordem_reparacao"."total_pago" AS "total_pago", "Clientes"."Descricao" AS "Cliente", "estados_reparacao"."Descricao" AS "Estado", ( ( "Viaturas"."marca" || ' ') || "Viaturas"."modelo" ) AS "marcamodelo" FROM app."Clientes", app."Viaturas", app."estados_reparacao", app."ordem_reparacao" WHERE "Clientes"."Codigo" = "Viaturas"."Cliente" AND "ordem_reparacao"."reparacao_estado" = "estados_reparacao"."Codigo" AND "Viaturas"."matricula" = "ordem_reparacao"."matricula" AND ( TRUE AND ($1::text[] IS NULL OR "ordem_reparacao"."reparacao_estado"=ANY($1::text[])) ) ORDER BY recepcao_entrega_prevista DESC`,
    date: {"field": "recepcao_entrega_prevista", "dateOnly": true},
    sort: {"field": "recepcao_entrega_prevista", "group": null, "descending": true, "dateOnly": true},
  },
  QRY_select_ordens_reparacao_data_pag: {
    schema: z.strictObject({ ParamDaData: dateOnly, ParamAData: dateOnly, ParamEstados: z.array(z.string()).nullable() }),
    parameters: ["ParamEstados"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "ordem_reparacao"."data_pagamento" AS "data_pagamento", "ordem_reparacao"."reparacao_estado" AS "reparacao_estado", "ordem_reparacao"."total_pago" AS "total_pago", "Clientes"."Descricao" AS "Cliente", "estados_reparacao"."Descricao" AS "Estado", ( ( "Viaturas"."marca" || ' ') || "Viaturas"."modelo" ) AS "marcamodelo" FROM app."Clientes", app."Viaturas", app."estados_reparacao", app."ordem_reparacao" WHERE "Viaturas"."matricula" = "ordem_reparacao"."matricula" AND "Clientes"."Codigo" = "Viaturas"."Cliente" AND "ordem_reparacao"."reparacao_estado" = "estados_reparacao"."Codigo" AND ( TRUE AND ($1::text[] IS NULL OR "ordem_reparacao"."reparacao_estado"=ANY($1::text[])) )`,
    date: {"field": "data_pagamento", "dateOnly": true},
  },
  QRY_select_ordens_reparacao_matricula: {
    schema: z.strictObject({ ParamTipo: z.array(byte).nullable(), ParamLancarMat: z.boolean().nullable() }),
    parameters: ["ParamTipo", "ParamLancarMat"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."km_viatura" AS "km_viatura", "ordem_reparacao"."recepcao_util" AS "recepcao_util", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "ordem_reparacao"."recepacao_contatos" AS "recepacao_contatos", "ordem_reparacao"."recepcao_servico" AS "recepcao_servico", "ordem_reparacao"."recepcao_obs" AS "recepcao_obs", "ordem_reparacao"."recepcao_entrega_prevista" AS "recepcao_entrega_prevista", "ordem_reparacao"."recepcao_prioridade" AS "recepcao_prioridade", "ordem_reparacao"."reparacao_mecanico" AS "reparacao_mecanico", "ordem_reparacao"."reparacao_estado" AS "reparacao_estado", "ordem_reparacao"."reparacao_estado_obs" AS "reparacao_estado_obs", "ordem_reparacao"."reparacao_servico" AS "reparacao_servico", "ordem_reparacao"."reparacao_estado_data" AS "reparacao_estado_data", "ordem_reparacao"."reparacao_estado_historico" AS "reparacao_estado_historico", "ordem_reparacao"."totaL_mao_obra" AS "totaL_mao_obra", "ordem_reparacao"."total_pecas" AS "total_pecas", "ordem_reparacao"."total_desconto" AS "total_desconto", "ordem_reparacao"."total_reparacao" AS "total_reparacao", "ordem_reparacao"."faturado" AS "faturado", "ordem_reparacao"."total_pago" AS "total_pago", "ordem_reparacao"."Estados_reparacaoID" AS "Estados_reparacaoID", "ordem_reparacao"."numero_fatura" AS "numero_fatura", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."Cliente" AS "Cliente", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "Viaturas"."Ano" AS "Ano", "Viaturas"."mes" AS "mes", ( ( "Viaturas"."marca" || ' ') || "Viaturas"."modelo" ) AS "marcamodelo", "estados_reparacao"."Codigo" AS "Codigo", "estados_reparacao"."Descricao" AS "Descricao", "estados_reparacao"."tipo" AS "tipo", "mecanicos"."Codigo" AS "Codigo_me", "mecanicos"."Descricao" AS "Descricao_me", "estados_reparacao"."lancar_material" AS "lancar_material" FROM ( ( app."ordem_reparacao" INNER JOIN app."estados_reparacao" ON "ordem_reparacao"."reparacao_estado" = "estados_reparacao"."Codigo" ) INNER JOIN app."Viaturas" ON "ordem_reparacao"."matricula" = "Viaturas"."matricula" ) LEFT OUTER JOIN app."mecanicos" ON "mecanicos"."Codigo" = "ordem_reparacao"."reparacao_mecanico" WHERE ( ($1::smallint[] IS NULL OR "estados_reparacao"."tipo"=ANY($1::smallint[])) AND ($2::boolean IS NULL OR "estados_reparacao"."lancar_material"=$2) ) ORDER BY numero ASC`,
  },
  QRY_select_ordens_reparacao_tempos: {
    schema: z.strictObject({  }),
    parameters: [], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."km_viatura" AS "km_viatura", "ordem_reparacao"."recepcao_util" AS "recepcao_util", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "ordem_reparacao"."recepacao_contatos" AS "recepacao_contatos", "ordem_reparacao"."recepcao_servico" AS "recepcao_servico", "ordem_reparacao"."recepcao_obs" AS "recepcao_obs", "ordem_reparacao"."recepcao_entrega_prevista" AS "recepcao_entrega_prevista", "ordem_reparacao"."recepcao_prioridade" AS "recepcao_prioridade", "ordem_reparacao"."reparacao_mecanico" AS "reparacao_mecanico", "ordem_reparacao"."reparacao_estado" AS "reparacao_estado", "ordem_reparacao"."reparacao_estado_obs" AS "reparacao_estado_obs", "ordem_reparacao"."reparacao_servico" AS "reparacao_servico", "ordem_reparacao"."reparacao_estado_data" AS "reparacao_estado_data", "ordem_reparacao"."reparacao_estado_historico" AS "reparacao_estado_historico", "ordem_reparacao"."totaL_mao_obra" AS "totaL_mao_obra", "ordem_reparacao"."total_pecas" AS "total_pecas", "ordem_reparacao"."total_desconto" AS "total_desconto", "ordem_reparacao"."total_reparacao" AS "total_reparacao", "ordem_reparacao"."faturado" AS "faturado", "ordem_reparacao"."total_pago" AS "total_pago", "ordem_reparacao"."Estados_reparacaoID" AS "Estados_reparacaoID", "ordem_reparacao"."numero_fatura" AS "numero_fatura", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."Cliente" AS "Cliente", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "Viaturas"."Ano" AS "Ano", "Viaturas"."mes" AS "mes", ( ( "Viaturas"."marca" || ' ') || "Viaturas"."modelo" ) AS "marcamodelo", "estados_reparacao"."Codigo" AS "Codigo", "estados_reparacao"."Descricao" AS "Descricao", "estados_reparacao"."tipo" AS "tipo", "estados_reparacao"."Cor" AS "Cor", "mecanicos"."Codigo" AS "Codigo_me", "mecanicos"."Descricao" AS "Descricao_me" FROM ( ( app."ordem_reparacao" INNER JOIN app."estados_reparacao" ON "ordem_reparacao"."reparacao_estado" = "estados_reparacao"."Codigo" ) INNER JOIN app."Viaturas" ON "ordem_reparacao"."matricula" = "Viaturas"."matricula" ) LEFT OUTER JOIN app."mecanicos" ON "mecanicos"."Codigo" = "ordem_reparacao"."reparacao_mecanico" WHERE ( "estados_reparacao"."tipo" = 3 OR "estados_reparacao"."tipo" = 2 OR "estados_reparacao"."tipo" = 6 OR "estados_reparacao"."tipo" = 4 OR "estados_reparacao"."tipo" = 5 ) ORDER BY numero ASC`,
  },
  QRY_select_tempos_reparacao_ordem: {
    schema: z.strictObject({ ParamNumero: unsigned }),
    parameters: ["ParamNumero"], operation: "read",
    sql: `SELECT "tempos_reparacao"."numero" AS "numero", "tempos_reparacao"."mecanico" AS "mecanico", "tempos_reparacao"."inicio" AS "inicio", "tempos_reparacao"."fim" AS "fim", "mecanicos"."Codigo" AS "Codigo", "mecanicos"."Descricao" AS "Descricao" FROM app."mecanicos", app."tempos_reparacao" WHERE "mecanicos"."Codigo" = "tempos_reparacao"."mecanico" AND ( "tempos_reparacao"."numero" = $1 AND "tempos_reparacao"."fim" = '00000000000000000' )`,
  },
  QRY_tempos_ordem_reparacao: {
    schema: z.strictObject({ ParamDaOrdem: unsigned, ParamAOrdem: unsigned, ParamDaData: dateTime, ParamAData: dateTime }),
    parameters: ["ParamDaOrdem", "ParamAOrdem"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "tempos_reparacao"."numero" AS "numero_te", "tempos_reparacao"."mecanico" AS "mecanico", "tempos_reparacao"."inicio" AS "inicio", "tempos_reparacao"."fim" AS "fim", "mecanicos"."Codigo" AS "Codigo", "mecanicos"."Descricao" AS "Descricao" FROM app."Viaturas", app."tempos_reparacao", app."mecanicos", app."ordem_reparacao" WHERE "ordem_reparacao"."numero" = "tempos_reparacao"."numero" AND "ordem_reparacao"."matricula" = "Viaturas"."matricula" AND "tempos_reparacao"."mecanico" = "mecanicos"."Codigo" AND ( ($1::numeric IS NULL OR $2::numeric IS NULL OR "ordem_reparacao"."numero" BETWEEN $1 AND $2) AND TRUE ) ORDER BY numero ASC`,
    date: {"field": "inicio", "dateOnly": false},
  },
  QRY_tempos_ordem_reparacao_matricula: {
    schema: z.strictObject({ ParamDaViatura: text, ParamAViatura: text, ParamDaData: dateTime, ParamAData: dateTime }),
    parameters: ["ParamDaViatura", "ParamAViatura"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "tempos_reparacao"."numero" AS "numero_te", "tempos_reparacao"."mecanico" AS "mecanico", "tempos_reparacao"."inicio" AS "inicio", "tempos_reparacao"."fim" AS "fim", "mecanicos"."Codigo" AS "Codigo", "mecanicos"."Descricao" AS "Descricao" FROM app."Viaturas", app."tempos_reparacao", app."mecanicos", app."ordem_reparacao" WHERE "tempos_reparacao"."mecanico" = "mecanicos"."Codigo" AND "ordem_reparacao"."matricula" = "Viaturas"."matricula" AND "ordem_reparacao"."numero" = "tempos_reparacao"."numero" AND ( ($1::text IS NULL OR $2::text IS NULL OR "ordem_reparacao"."matricula" BETWEEN $1 AND $2) AND TRUE ) ORDER BY matricula ASC, numero ASC`,
    date: {"field": "inicio", "dateOnly": false},
  },
  QRY_tempos_ordem_reparacao_mecanico: {
    schema: z.strictObject({ ParamDoMecanico: byte, ParamAoMecanico: byte, ParamDaData: dateTime, ParamAData: dateTime }),
    parameters: ["ParamDoMecanico", "ParamAoMecanico"], operation: "read",
    sql: `SELECT "ordem_reparacao"."numero" AS "numero", "ordem_reparacao"."matricula" AS "matricula", "ordem_reparacao"."recepcao_datahora" AS "recepcao_datahora", "Viaturas"."matricula" AS "matricula_Vi", "Viaturas"."marca" AS "marca", "Viaturas"."modelo" AS "modelo", "tempos_reparacao"."numero" AS "numero_te", "tempos_reparacao"."mecanico" AS "mecanico", "tempos_reparacao"."inicio" AS "inicio", "tempos_reparacao"."fim" AS "fim", "mecanicos"."Codigo" AS "Codigo", "mecanicos"."Descricao" AS "Descricao" FROM app."Viaturas", app."tempos_reparacao", app."mecanicos", app."ordem_reparacao" WHERE "ordem_reparacao"."numero" = "tempos_reparacao"."numero" AND "ordem_reparacao"."matricula" = "Viaturas"."matricula" AND "tempos_reparacao"."mecanico" = "mecanicos"."Codigo" AND ( ($1::numeric IS NULL OR $2::numeric IS NULL OR "mecanicos"."Codigo" BETWEEN $1 AND $2) AND TRUE ) ORDER BY mecanico ASC, recepcao_datahora ASC`,
    date: {"field": "inicio", "dateOnly": false},
    sort: {"field": "recepcao_datahora", "group": "mecanico", "descending": false, "dateOnly": false},
  },
  QRY_union_extrato_artigos: {
    schema: z.strictObject({ ParamDaData: dateTime, ParamAData: dateTime, ParamDoArtigo: text, ParamAoArtigo: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo"], operation: "read",
    sql: `SELECT "lin_stocks"."documento_numero" AS "numero", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."descricao_artigo" AS "descricao_artigo", "lin_stocks"."quantidade" AS "quantidade", "documentos"."Descricao" AS "Descricao", "cab_stocks"."data" AS "data", "documentos"."stock" AS "stock" FROM app."documentos", app."cab_stocks", app."lin_stocks" WHERE "cab_stocks"."documento_numero" = "lin_stocks"."documento_numero" AND "cab_stocks"."documento_codigo" = "lin_stocks"."documento_codigo" AND "documentos"."Codigo" = "cab_stocks"."documento_codigo" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "lin_stocks"."artigo" BETWEEN $1 AND $2) ) UNION ALL SELECT "material_reparacao"."numero" AS "numero", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."descricao_artigo" AS "descricao_artigo", "material_reparacao"."quantidade" AS "quantidade", 'Ordem de reparaçªo' AS "Descricao", "ordem_reparacao"."recepcao_datahora" AS "data", 2 AS "stock" FROM app."ordem_reparacao", app."material_reparacao" WHERE "material_reparacao"."numero" = "ordem_reparacao"."numero" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_union_extrato_artigos_calcular_total: {
    schema: z.strictObject({ ParamDaData: dateTime, ParamAData: dateTime, ParamDoArtigo: text, ParamAoArtigo: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo"], operation: "read",
    sql: `SELECT "lin_stocks"."documento_numero" AS "numero", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."descricao_artigo" AS "descricao_artigo", "lin_stocks"."quantidade" AS "quantidade", "documentos"."Descricao" AS "Descricao", "cab_stocks"."data" AS "data", "documentos"."stock" AS "stock" FROM app."documentos", app."cab_stocks", app."lin_stocks" WHERE "cab_stocks"."documento_numero" = "lin_stocks"."documento_numero" AND "cab_stocks"."documento_codigo" = "lin_stocks"."documento_codigo" AND "documentos"."Codigo" = "cab_stocks"."documento_codigo" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "lin_stocks"."artigo" BETWEEN $1 AND $2) ) UNION ALL SELECT "material_reparacao"."numero" AS "numero", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."descricao_artigo" AS "descricao_artigo", "material_reparacao"."quantidade" AS "quantidade", 'Ordem de reparaçªo' AS "Descricao", "ordem_reparacao"."recepcao_datahora" AS "data", 2 AS "stock" FROM app."ordem_reparacao", app."material_reparacao" WHERE "material_reparacao"."numero" = "ordem_reparacao"."numero" AND ( TRUE AND ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_union_lin_stocks: {
    schema: z.strictObject({ ParamDoArtigo: text, ParamAoArtigo: text, ParamDaData: dateTime, ParamAData: dateTime, ParamDescricao: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo", "ParamDescricao"], operation: "read",
    sql: `SELECT "lin_stocks"."documento_numero" AS "documento_numero", "cab_stocks"."data" AS "data", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."quantidade" AS "quantidade", "artigos"."Codigo" AS "Codigo_artigo", "artigos"."Descricao" AS "Descricao", "artigos"."codbarras" AS "codbarras", "artigos"."unidade" AS "unidade", "artigos"."preco" AS "preco", "artigos"."inativo" AS "inativo", "documentos"."Descricao" AS "descricao_doc", '' AS "matricula", "mecanicos"."Descricao" AS "Descricao_me" FROM ( ( app."cab_stocks" INNER JOIN ( app."lin_stocks" INNER JOIN app."documentos" ON "lin_stocks"."documento_codigo" = "documentos"."Codigo" ) ON "cab_stocks"."documento_numero" = "lin_stocks"."documento_numero" ) INNER JOIN app."artigos" ON "lin_stocks"."artigo" = "artigos"."Codigo" ) LEFT OUTER JOIN app."mecanicos" ON "cab_stocks"."mecanico" = "mecanicos"."Codigo" WHERE ( "documentos"."stock" = 2 AND ($1::text IS NULL OR $2::text IS NULL OR "lin_stocks"."artigo" BETWEEN $1 AND $2) AND TRUE AND ($3::text IS NULL OR "lin_stocks"."descricao_artigo" LIKE '%'||$3||'%') ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_Union_lin_stocks_material_reparacao: {
    schema: z.strictObject({ ParamDoArtigo: text, ParamAoArtigo: text, ParamDaData: dateTime, ParamAData: dateTime, ParamDescricao: text }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo", "ParamDescricao"], operation: "read",
    sql: `SELECT "lin_stocks"."documento_numero" AS "documento_numero", "cab_stocks"."data" AS "data", "lin_stocks"."artigo" AS "artigo", "lin_stocks"."quantidade" AS "quantidade", "artigos"."Codigo" AS "Codigo_artigo", "artigos"."Descricao" AS "Descricao", "artigos"."codbarras" AS "codbarras", "artigos"."unidade" AS "unidade", "artigos"."preco" AS "preco", "artigos"."inativo" AS "inativo", "documentos"."Descricao" AS "descricao_doc", '' AS "matricula", "mecanicos"."Descricao" AS "Descricao_me" FROM ( ( app."cab_stocks" INNER JOIN ( app."lin_stocks" INNER JOIN app."documentos" ON "lin_stocks"."documento_codigo" = "documentos"."Codigo" ) ON "cab_stocks"."documento_numero" = "lin_stocks"."documento_numero" ) INNER JOIN app."artigos" ON "lin_stocks"."artigo" = "artigos"."Codigo" ) LEFT OUTER JOIN app."mecanicos" ON "cab_stocks"."mecanico" = "mecanicos"."Codigo" WHERE ( "documentos"."stock" = 2 AND ($1::text IS NULL OR $2::text IS NULL OR "lin_stocks"."artigo" BETWEEN $1 AND $2) AND TRUE AND ($3::text IS NULL OR "lin_stocks"."descricao_artigo" LIKE '%'||$3||'%') ) UNION ALL SELECT "material_reparacao"."numero" AS "documento_numero", "material_reparacao"."data_hora" AS "data", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."quantidade" AS "quantidade", "artigos"."Codigo" AS "Codigo_artigo", "artigos"."Descricao" AS "Descricao", "artigos"."codbarras" AS "codbarras", "artigos"."unidade" AS "unidade", "artigos"."preco" AS "preco", "artigos"."inativo" AS "inativo", 'Ordem de reparaçªo' AS "descricao_doc", "ordem_reparacao"."matricula" AS "matricula", "mecanicos"."Descricao" AS "Descricao_me" FROM app."mecanicos", app."material_reparacao", app."artigos", app."ordem_reparacao" WHERE "material_reparacao"."artigo" = "artigos"."Codigo" AND "ordem_reparacao"."numero" = "material_reparacao"."numero" AND "ordem_reparacao"."reparacao_mecanico" = "mecanicos"."Codigo" AND ( ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) AND TRUE ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_union_material_reparacao: {
    schema: z.strictObject({ ParamDoArtigo: text, ParamAoArtigo: text, ParamDaData: dateTime, ParamAData: dateTime }),
    parameters: ["ParamDoArtigo", "ParamAoArtigo"], operation: "read",
    sql: `SELECT "material_reparacao"."numero" AS "documento_numero", "material_reparacao"."data_hora" AS "data", "material_reparacao"."artigo" AS "artigo", "material_reparacao"."quantidade" AS "quantidade", "artigos"."Codigo" AS "Codigo_artigo", "artigos"."Descricao" AS "Descricao", "artigos"."codbarras" AS "codbarras", "artigos"."unidade" AS "unidade", "artigos"."preco" AS "preco", "artigos"."inativo" AS "inativo", 'Ordem de reparaçªo' AS "descricao_doc", "ordem_reparacao"."matricula" AS "matricula", "mecanicos"."Descricao" AS "Descricao_me" FROM app."mecanicos", app."material_reparacao", app."artigos", app."ordem_reparacao" WHERE "material_reparacao"."artigo" = "artigos"."Codigo" AND "ordem_reparacao"."numero" = "material_reparacao"."numero" AND "ordem_reparacao"."reparacao_mecanico" = "mecanicos"."Codigo" AND ( ($1::text IS NULL OR $2::text IS NULL OR "material_reparacao"."artigo" BETWEEN $1 AND $2) AND TRUE ) ORDER BY artigo ASC, data ASC`,
    date: {"field": "data", "dateOnly": false},
    sort: {"field": "data", "group": "artigo", "descending": false, "dateOnly": false},
  },
  QRY_update_ordens_reparacao: {
    schema: z.strictObject({ ParamNumero: unsigned, ParamMatricula: text, ParamKM: unsigned, ParamRecepcao_util: byte, ParamRecepcao_data_hora: text, ParamRecepcao_cliente: unsigned, ParamRecepcao_Terceiro: unsigned, ParamRecepcao_contactos: text, ParamRecepcao_servico: text, ParamRecepcao_obs: text, ParamRecepcao_entrega: text, ParamRecepcao_prioridade: byte, ParamReparacao_mecanico: byte, ParamReparacao_estado: text, ParamReparacao_estado_obs: text, ParamReparacao_servico: text, ParamReparacao_estado_data: text, ParamReparacao_estado_historico: text, ParamTotal_mao_obra: decimal, ParamTotal_pecas: decimal, ParamTotal_desconto: decimal, ParamTotal_reparacao: decimal, ParamFaturado: z.boolean().nullable(), ParamTotal_pago: decimal, ParamNumero_fatura: text, ParamDataPagamento: text, ParamNumero_antigo: unsigned }),
    parameters: ["ParamNumero", "ParamMatricula", "ParamKM", "ParamRecepcao_util", "ParamRecepcao_data_hora", "ParamRecepcao_cliente", "ParamRecepcao_Terceiro", "ParamRecepcao_contactos", "ParamRecepcao_servico", "ParamRecepcao_obs", "ParamRecepcao_entrega", "ParamRecepcao_prioridade", "ParamReparacao_mecanico", "ParamReparacao_estado", "ParamReparacao_estado_obs", "ParamReparacao_servico", "ParamReparacao_estado_data", "ParamReparacao_estado_historico", "ParamTotal_mao_obra", "ParamTotal_pecas", "ParamTotal_desconto", "ParamTotal_reparacao", "ParamFaturado", "ParamTotal_pago", "ParamNumero_fatura", "ParamDataPagamento", "ParamNumero_antigo"], operation: "update-order",
    sql: `UPDATE app."ordem_reparacao" SET "numero"=$1,"matricula"=$2,"km_viatura"=$3,"recepcao_util"=$4,"recepcao_datahora"=$5,"recepcao_cliente"=$6,"recepcao_terceiro"=$7,"recepacao_contatos"=$8,"recepcao_servico"=$9,"recepcao_obs"=$10,"recepcao_entrega_prevista"=$11,"recepcao_prioridade"=$12,"reparacao_mecanico"=$13,"reparacao_estado"=$14,"reparacao_estado_obs"=$15,"reparacao_servico"=$16,"reparacao_estado_data"=$17,"reparacao_estado_historico"=$18,"totaL_mao_obra"=$19,"total_pecas"=$20,"total_desconto"=$21,"total_reparacao"=$22,"faturado"=$23,"total_pago"=$24,"numero_fatura"=$25,"data_pagamento"=$26 WHERE "numero"=$27`,
  },
} as const satisfies Record<string, Definition>;
export type ExtractedQueryName = keyof typeof definitions;
export const extractedQueryNames = Object.freeze(Object.keys(definitions) as ExtractedQueryName[]);
export type ExtractedQueryValue = string | boolean | null | { encoding: "base64"; data: string };
export type ExtractedQueryResult = { kind: "loaded"; rows: Record<string, ExtractedQueryValue>[] }
  | { kind: "written"; affected: string } | { kind: "invalid" | "failed" | "in_use" | "exhausted" };
const inputSchema = z.strictObject({ query: z.string(), parameters: z.unknown() });
function raw(value: unknown): string | null { return value === null || value === undefined ? null : String(value); }
function dateKey(value: unknown, only: boolean): string | null { return (only ? dateOnlyComparisonKey : dateTimeComparisonKey)(raw(value)); }
function rowsWithin(rows: Record<string, unknown>[], rule: DateRule, parameters: Record<string, unknown>) {
  const from = raw(parameters.ParamDaData), to = raw(parameters.ParamAData);
  if (from === null || to === null) return rows;
  const first = dateKey(from, rule.dateOnly)!, last = dateKey(to, rule.dateOnly)!;
  return rows.filter(row => { const value = dateKey(row[rule.field], rule.dateOnly); return value !== null && value >= first && value <= last; });
}
function dateOrder(rows: Record<string, unknown>[], rule: DateSort) {
  // Retain database article/mechanic/registration ordering and duplicate multiplicity; only
  // the source-declared Date/DateTime order is projected, never the stored value rewritten.
  const groups = new Map<unknown, number>();
  for (const row of rows) if (!groups.has(rule.group === null ? null : row[rule.group])) groups.set(rule.group === null ? null : row[rule.group], groups.size);
  return rows.sort((left, right) => {
    const group = groups.get(rule.group === null ? null : left[rule.group])! - groups.get(rule.group === null ? null : right[rule.group])!;
    if (group) return group;
    const a = dateKey(left[rule.field], rule.dateOnly), b = dateKey(right[rule.field], rule.dateOnly);
    if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
    return (a < b ? -1 : a > b ? 1 : 0) * (rule.descending ? -1 : 1);
  });
}
function values(row: Record<string, unknown>): Record<string, ExtractedQueryValue> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value === null ? null : Buffer.isBuffer(value)
    ? { encoding: "base64" as const, data: value.toString("base64") } : typeof value === "boolean" ? value : String(value)]));
}

/** One validated fixed query per connection; every write is one protected transaction.
 * Inserts retain the source engine's automatic-ID role using the existing locked signed64 allocator.
 * Full26-field UPDATE intentionally permits numero changes and has NO material/time cascade.
 * ADR002: declared omitted read parameters use the explicit nullable-predicate default;
 * write parameters remain required, avoiding unintended NULL overwrites.
 */
export async function executeExtractedQuery(connect: DatabaseConnection, input: unknown): Promise<ExtractedQueryResult> {
  const outer = inputSchema.safeParse(input);
  if (!outer.success || !Object.hasOwn(definitions, outer.data.query)) return { kind: "invalid" };
  const definition: Definition = definitions[outer.data.query as ExtractedQueryName];
  const supplied = outer.data.parameters;
  const candidate = definition.operation === "read" && supplied !== null && typeof supplied === "object" && !Array.isArray(supplied)
    ? { ...Object.fromEntries(Object.keys(definition.schema.shape).map(name => [name, null])), ...supplied }
    : supplied;
  const parsed = definition.schema.safeParse(candidate);
  if (!parsed.success) return { kind: "invalid" };
  const parameters = parsed.data as Record<string, unknown>, binds = definition.parameters.map(name => parameters[name]);
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    if (definition.operation === "read") {
      let rows = (await client.query<Record<string, unknown>>(definition.sql, binds)).rows;
      if (definition.date) rows = rowsWithin(rows, definition.date, parameters);
      if (definition.sort) rows = dateOrder(rows, definition.sort);
      return { kind: "loaded", rows: rows.map(values) };
    }
    await client.query("BEGIN");
    const table = definition.operation === "insert-material" ? "material_reparacao" : "ordem_reparacao";
    await client.query(`LOCK TABLE app."${table}" IN SHARE ROW EXCLUSIVE MODE NOWAIT`);
    if (definition.operation !== "update-order") {
      const field = definition.operation === "insert-material" ? "material_reparacaoID" : "ordem_reparacaoID";
      const maximum = (await client.query<{ maximum: string }>(`SELECT GREATEST(COALESCE(MAX("${field}"),0),0)::text AS maximum FROM app."${table}"`)).rows[0].maximum;
      if (BigInt(maximum) >= 9223372036854775807n) { await client.query("ROLLBACK"); return { kind: "exhausted" }; }
      binds.push(String(BigInt(maximum) + 1n));
    }
    const result = await client.query(definition.sql, binds);
    await client.query("COMMIT"); return { kind: "written", affected: String(result.rowCount ?? 0) };
  } catch (error) {
    await rollbackAfterFailure(client);
    return { kind: typeof error === "object" && error !== null && "code" in error && error.code === "55P03" ? "in_use" : "failed" };
  } finally { await closeOperationClient(client); }
}
