import { z } from "zod";
import type { ReceptionCustomerReassignmentResult } from "../../../../packages/domain/src/startup-utilities";
import { connectOperationClient, closeOperationClient, rollbackAfterFailure, type DatabaseConnection } from "../db/connection";
const empty = z.strictObject({});
/** WIN_MENU899–911 + exact QRY_select_ordens_reparacao / QRY_select_viatura_matricula joins.
 * ADR006 target transaction is deliberate; native partial-write/current-buffer behavior remains U03. */
export async function reassignReceptionCustomers(connect: DatabaseConnection, input: unknown): Promise<ReceptionCustomerReassignmentResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."ordem_reparacao",app."Viaturas",app."Clientes",app."estados_reparacao",app."mecanicos" IN SHARE ROW EXCLUSIVE MODE');
    // Keep mandatory original reception customer/state/vehicle joins and optional mechanic/third-party.
    // Do not replace this with an unrestricted order→vehicle update: it would modify source-hidden orders.
    const orders = await client.query<{ numero: string | null; matricula: string | null }>(`SELECT o."numero"::text,o."matricula" FROM app."ordem_reparacao" o
      LEFT JOIN app."mecanicos" m ON m."Codigo"=o."reparacao_mecanico"
      INNER JOIN app."estados_reparacao" s ON s."Codigo"=o."reparacao_estado"
      INNER JOIN app."Viaturas" v ON v."matricula"=o."matricula"
      INNER JOIN app."Clientes" c ON c."Codigo"=o."recepcao_cliente"
      LEFT JOIN app."Clientes" t ON t."Codigo"=o."recepcao_terceiro"
      ORDER BY o."numero" DESC NULLS LAST,o._row_id,m._row_id,s._row_id,v._row_id,c._row_id,t._row_id`);
    const prepared: { numero: string; customer: string }[] = [], owners = new Map<string, string>();
    for (const order of orders.rows) {
      if (order.numero === null || order.matricula === null) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
      const vehicles = await client.query<{ Cliente: string | null }>('SELECT "Cliente"::text FROM app."Viaturas" WHERE "matricula"=$1 ORDER BY _row_id', [order.matricula]);
      // HReadFirst has no query ORDER BY. Equal candidates produce the same write; competing/NULL owners are unknown.
      if (!vehicles.rowCount || vehicles.rows.some(row => row.Cliente === null || row.Cliente !== vehicles.rows[0].Cliente)) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
      const customer = vehicles.rows[0].Cliente!, previous = owners.get(order.numero);
      if (previous !== undefined && previous !== customer) { await client.query("ROLLBACK"); return { kind: "unresolved" }; }
      owners.set(order.numero, customer); prepared.push({ numero: order.numero, customer });
    }
    // Source writes by numero, not internal identity; retain duplicate query rows and their source order.
    for (const row of prepared) await client.query('UPDATE app."ordem_reparacao" SET "recepcao_cliente"=$1 WHERE "numero"=$2', [row.customer, row.numero]);
    await client.query("COMMIT"); return { kind: "completed" };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}
