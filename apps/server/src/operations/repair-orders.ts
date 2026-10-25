import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { repairOrderDefaultsSchema, repairOrderInitialiseSchema, repairOrderListSchema, repairOrderWithinBounds,
  type RepairOrderDefaultsResult, type RepairOrderInitialiseResult, type RepairOrderListRow, type RepairOrderListResult,
  type RepairOrderMechanic, type RepairOrderSettings, type RepairOrderStateFilter } from "../../../../packages/domain/src/repair-orders";
import { dateOnlyComparisonKey, dateTimeComparisonKey } from "../../../../packages/domain/src/date-time";

export async function initialiseRepairOrders(connect: DatabaseConnection, input: unknown): Promise<RepairOrderInitialiseResult> {
  if (!repairOrderInitialiseSchema.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // SRC-9b6239c2c7 / ADR-006: first source row is represented by deterministic internal order.
    const settings = await client.query<RepairOrderSettings>('SELECT "Data_inicio","Tempo_ordem_reparacao"::text FROM app."sistema" ORDER BY _row_id LIMIT 1');
    const states = await client.query<RepairOrderStateFilter>('SELECT _row_id::text AS id,"Codigo","Descricao","tipo","Cor"::double precision AS "Cor","lancar_defa" FROM app."estados_reparacao" ORDER BY "tipo" ASC NULLS LAST,_row_id');
    // Source browsed file/item is mecanicos.Codigo, with no inactive filter or credential projection.
    const mechanics = await client.query<RepairOrderMechanic>('SELECT _row_id::text AS id,"Codigo","Descricao" FROM app."mecanicos" ORDER BY "Codigo" ASC NULLS LAST,_row_id');
    return { kind: "loaded", settings: settings.rows[0] ?? { Data_inicio: null, Tempo_ordem_reparacao: null }, states: states.rows, mechanics: mechanics.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

const sourceSorts = {
  numero: 'o."numero"', matricula: 'o."matricula"', Descricao_Cliente: 'c."Descricao"', Descricao_Terceiro: 't."Descricao"',
  marcamodelo: `(v."marca"||' ')||v."modelo"`, recepcao_datahora: 'o."recepcao_datahora"', recepcao_entrega_prevista: 'o."recepcao_entrega_prevista"',
  Descricao: 's."Descricao"', recepcao_prioridade: `CASE o."recepcao_prioridade" WHEN 1 THEN 'Normal' WHEN 2 THEN 'Elevada' WHEN 3 THEN 'Urgente' ELSE o."recepcao_prioridade"::text END`,
  Descricao_me: 'm."Descricao"', Cor: 's."Cor"',
} as const;
const identityOrder = 'o._row_id,c._row_id,v._row_id,s._row_id,m._row_id,t._row_id';

export async function listRepairOrders(connect: DatabaseConnection, input: unknown): Promise<RepairOrderListResult> {
  const parsed = repairOrderListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const filter = parsed.data, registration = filter.registration.toLocaleUpperCase("pt-PT");
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const values: unknown[] = [], conditions: string[] = [];
    const bind = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (filter.priority > 0) conditions.push(`o."recepcao_prioridade"=${bind(filter.priority)}`);
    if (filter.mechanic >= 1) conditions.push(`o."reparacao_mecanico"=${bind(filter.mechanic)}`);
    if (filter.customer !== "" && filter.customer !== "0") {
      const parameter = bind(filter.customer);
      conditions.push(`(o."recepcao_cliente"=${parameter} OR o."recepcao_terceiro"=${parameter})`);
    }
    if (registration !== "") {
      const parameter = bind(`%${registration}%`);
      conditions.push(`(o."matricula" LIKE ${parameter} OR ((v."marca"||' ')||v."modelo") LIKE ${parameter})`);
    }
    if (filter.states.length > 0) conditions.push(`o."reparacao_estado"=ANY(${bind(filter.states)}::text[])`);
    const dateSort = filter.sort === "recepcao_datahora" || filter.sort === "recepcao_entrega_prevista" ? filter.sort : null;
    // SRC-a2f17b1885 / ADR-012: source refresh sorts typed numero DESC before string transport.
    const order = dateSort ? identityOrder : `${filter.sort ? sourceSorts[filter.sort] : sourceSorts.numero} ${filter.sort ? filter.descending ? "DESC" : "ASC" : "DESC"} NULLS LAST,${identityOrder}`;
    const result = await client.query<RepairOrderListRow>(`SELECT
      json_build_array(o._row_id::text,c._row_id::text,v._row_id::text,s._row_id::text,m._row_id::text,t._row_id::text)::text AS id,
      o._row_id::text AS "orderId",o."numero"::text,o."matricula",c."Descricao" AS "Descricao_Cliente",t."Descricao" AS "Descricao_Terceiro",
      (v."marca"||' ')||v."modelo" AS marcamodelo,o."recepcao_datahora",o."recepcao_entrega_prevista",s."Descricao",
      o."recepcao_prioridade",m."Descricao" AS "Descricao_me",s."Cor"::double precision AS "Cor"
      FROM app."ordem_reparacao" o
      INNER JOIN app."Clientes" c ON o."recepcao_cliente"=c."Codigo"
      INNER JOIN app."Viaturas" v ON o."matricula"=v."matricula"
      INNER JOIN app."estados_reparacao" s ON o."reparacao_estado"=s."Codigo"
      LEFT JOIN app."mecanicos" m ON o."reparacao_mecanico"=m."Codigo"
      LEFT JOIN app."Clientes" t ON o."recepcao_terceiro"=t."Codigo"
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""} ORDER BY ${order}`, values);
    // ADR-002: recognize date representations only in this comparison projection, preserving raw DTOs.
    const orders = result.rows.filter(row => repairOrderWithinBounds(row, filter));
    if (dateSort) {
      const key = dateSort === "recepcao_datahora" ? dateTimeComparisonKey : dateOnlyComparisonKey;
      orders.sort((left, right) => {
        const a = key(left[dateSort]), b = key(right[dateSort]);
        if (a === null) return b === null ? 0 : 1;
        if (b === null) return -1;
        return (a < b ? -1 : a > b ? 1 : 0) * (filter.descending ? -1 : 1);
      });
    }
    return { kind: "loaded", orders };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveRepairOrderDefaults(connect: DatabaseConnection, input: unknown): Promise<RepairOrderDefaultsResult> {
  const parsed = repairOrderDefaultsSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-006/011: serialize with state maintenance and change only the flag, never its stale other values.
    await client.query('LOCK TABLE app."estados_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    for (const state of parsed.data.states) {
      if (state.Codigo === null) continue;
      // SRC-974f184730: missing source keys are skipped. First duplicate is an explicit U03 target default.
      await client.query('UPDATE app."estados_reparacao" SET "lancar_defa"=$2 WHERE _row_id=(SELECT _row_id FROM app."estados_reparacao" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1)', [state.Codigo, state.checked]);
    }
    await client.query("COMMIT");
    return { kind: "saved" };
  } catch {
    await rollbackAfterFailure(client);
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
