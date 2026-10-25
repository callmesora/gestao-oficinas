import { z } from "zod";
import { dateOnlyComparisonKey, dateTimeComparisonKey, isDateOnlyBound, isDateTimeBound, shiftCalendarDate } from "./date-time";

// Verified source unsigned64 identifiers; source masks are entry limits, not transport ranges.
const unsigned64 = z.string().refine(value => /^(?:0|[1-9][0-9]{0,19})/.exec(value)?.[0] === value && BigInt(value) <= 18446744073709551615n);
export const repairOrderSortKeys = ["numero", "matricula", "Descricao_Cliente", "Descricao_Terceiro", "marcamodelo", "recepcao_datahora", "recepcao_entrega_prevista", "Descricao", "recepcao_prioridade", "Descricao_me", "Cor"] as const;
export const repairOrderListSchema = z.strictObject({
  entryStart: z.string().refine(isDateTimeBound), entryEnd: z.string().refine(isDateTimeBound),
  deliveryStart: z.string().refine(isDateOnlyBound), deliveryEnd: z.string().refine(isDateOnlyBound),
  priority: z.number().int().min(0).max(3), mechanic: z.number().int().min(0).max(255),
  customer: z.union([z.literal(""), unsigned64]), registration: z.string(), states: z.array(z.string().nullable()),
  sort: z.enum(repairOrderSortKeys).optional(), descending: z.boolean().optional(),
});
export const repairOrderInitialiseSchema = z.strictObject({});
export const repairOrderDefaultsSchema = z.strictObject({ states: z.array(z.strictObject({ Codigo: z.string().nullable(), checked: z.boolean().nullable() })) });
export type RepairOrderList = z.infer<typeof repairOrderListSchema>;
export type RepairOrderDefaults = z.infer<typeof repairOrderDefaultsSchema>;
export type RepairOrderStateFilter = { id: string; Codigo: string | null; Descricao: string | null; tipo: number | null; Cor: number | null; lancar_defa: boolean | null };
export type RepairOrderMechanic = { id: string; Codigo: number | null; Descricao: string | null };
export type RepairOrderListRow = {
  id: string; orderId: string; numero: string | null; matricula: string | null;
  Descricao_Cliente: string | null; Descricao_Terceiro: string | null; marcamodelo: string | null;
  recepcao_datahora: string | null; recepcao_entrega_prevista: string | null;
  Descricao: string | null; recepcao_prioridade: number | null; Descricao_me: string | null; Cor: number | null;
};
export type RepairOrderSettings = { Data_inicio: number | null; Tempo_ordem_reparacao: string | null };
export type RepairOrderInitialiseResult = { kind: "loaded"; settings: RepairOrderSettings; states: RepairOrderStateFilter[]; mechanics: RepairOrderMechanic[] } | { kind: "invalid" | "failed" };
export type RepairOrderListResult = { kind: "loaded"; orders: RepairOrderListRow[] } | { kind: "invalid" | "failed" };
export type RepairOrderDefaultsResult = { kind: "saved" | "invalid" | "failed" };

/** SRC-9b6239c2c7 / ADR-002: injected workstation day, Gregorian arithmetic, distinct Date14/Date8 returns. */
export function repairOrderInitialFilters(today: string, dataInicio: number | null): RepairOrderList | null {
  const days = dataInicio ?? 0;
  if (!Number.isInteger(days) || days < 0 || days > 65535) return null;
  const start = shiftCalendarDate(today, -days), end = shiftCalendarDate(today, 7);
  if (start === null || end === null) return null;
  return { entryStart: `${start}000000`, entryEnd: `${today}235959`, deliveryStart: start, deliveryEnd: end, priority: 0, mechanic: 0, customer: "", registration: "", states: [] };
}

/** SRC-9b6239c2c7: Timer's centiseconds interval is setting*100, hence setting*1000 milliseconds. */
export function repairOrderTimerMilliseconds(raw: string | null): string | null {
  if (raw === null || !unsigned64.safeParse(raw).success || raw === "0") return null;
  return (BigInt(raw) * 1000n).toString();
}

/** SRC-a2f17b1885 / ADR-006: initial first; otherwise explicit last fallback before prior-number seek. */
export function repairOrderSelect(rows: readonly Pick<RepairOrderListRow, "id" | "numero">[], previousNumero: string | null, entry: boolean): string | null {
  if (rows.length === 0) return null;
  if (entry || previousNumero === null || previousNumero === "0") return rows[0].id;
  return rows.find(row => row.numero === previousNumero)?.id ?? rows[rows.length - 1].id;
}

/** SRC-a2f17b1885 / ADR-002: SQL NULL is false; canonical projection never rewrites transported raw dates. */
export function repairOrderWithinBounds(row: Pick<RepairOrderListRow, "recepcao_datahora" | "recepcao_entrega_prevista">, bounds: Pick<RepairOrderList, "entryStart" | "entryEnd" | "deliveryStart" | "deliveryEnd">): boolean {
  const entry = dateTimeComparisonKey(row.recepcao_datahora), delivery = dateOnlyComparisonKey(row.recepcao_entrega_prevista);
  if (entry === null || delivery === null) return false;
  return entry >= dateTimeComparisonKey(bounds.entryStart)! && entry <= dateTimeComparisonKey(bounds.entryEnd)!
    && delivery >= dateOnlyComparisonKey(bounds.deliveryStart)! && delivery <= dateOnlyComparisonKey(bounds.deliveryEnd)!;
}

/** SRC-390dd6c737: exact source spelling; unknown byte and NULL presentation remain reversible U05 defaults. */
export function repairOrderPriorityLabel(value: number | null): string {
  return value === 1 ? "Normal" : value === 2 ? "Elevada" : value === 3 ? "Urgente" : value === null ? "" : String(value);
}
