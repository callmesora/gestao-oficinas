import Decimal from "decimal.js";
import { dateTimeComparisonKey } from "./date-time";

export type RepairLaborTableValue = { kind: "number" | "date" | "text"; value: string | null };

/** ADR012: memory-table sorts act on current drafts, retaining exact decimals/date representations. */
export function repairLaborMemorySort<Row>(rows: readonly Row[], value: (row: Row) => RepairLaborTableValue, descending = false): Row[] {
  return rows.map((row, index) => ({ row, index, field: value(row) })).sort((left, right) => {
    const a = left.field.value, b = right.field.value;
    if (a === null || b === null) return a === b ? left.index - right.index : a === null ? 1 : -1;
    let order: number;
    if (left.field.kind === "number" && /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(a) && /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(b)) order = new Decimal(a).comparedTo(b);
    else if (left.field.kind === "date") { const x = dateTimeComparisonKey(a) ?? a, y = dateTimeComparisonKey(b) ?? b; order = x < y ? -1 : x > y ? 1 : 0; }
    else order = a.localeCompare(b, "pt-PT");
    return (descending ? -order : order) || left.index - right.index;
  }).map(entry => entry.row);
}
