import Decimal from "decimal.js";
import { dateTimeComparisonKey, isDateTimeBound } from "./date-time";

export const OPEN_LABOR_FINISH = "00000000000000000";
const Exact = Decimal.clone({ precision: 80 });

/** WIN_Table_Tempos_materiais_Descricoes1090–1107 / ADR002: no timezone conversion. */
export function laborDateTimeMilliseconds(raw: string | null): bigint | null {
  if (raw === null || raw === "" || !isDateTimeBound(raw)) return null;
  const key = dateTimeComparisonKey(raw);
  if (key === null || key === OPEN_LABOR_FINISH || !/^[0-9]{17}$/.test(key)) return null;
  const year = Number(key.slice(0, 4)), month = Number(key.slice(4, 6)), day = Number(key.slice(6, 8));
  const previous = year - 1;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const months = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const days = previous * 365 + Math.floor(previous / 4) - Math.floor(previous / 100) + Math.floor(previous / 400)
    + months.slice(0, month - 1).reduce((sum, value) => sum + value, 0) + day - 1;
  return BigInt(days) * 86400000n + BigInt(key.slice(8, 10)) * 3600000n + BigInt(key.slice(10, 12)) * 60000n
    + BigInt(key.slice(12, 14)) * 1000n + BigInt(key.slice(14, 17));
}
export type LaborDuration = { count: string; unit: "milliseconds" };
export function laborDuration(start: string | null, end: string | null): LaborDuration | null {
  const first = laborDateTimeMilliseconds(start), last = laborDateTimeMilliseconds(end);
  return first === null || last === null ? null : { count: (last - first).toString(), unit: "milliseconds" };
}
function two(value: string) { return value.startsWith("-") ? `-${value.slice(1).padStart(1, "0")}` : value.padStart(2, "0"); }
/** Exact source decimal formula, including its nonstandard factor and independent per-row rounding. */
export function laborDurationDisplay(duration: LaborDuration | null): string {
  if (duration === null) return "";
  const hours = new Exact(duration.count).div(3600000), integral = hours.trunc();
  const minutes = hours.minus(integral).times("59.99999999999").div("0.99999999999999").ceil();
  return `${two(integral.toFixed(0))}:${two(minutes.toFixed(0))}`;
}
/** Source1114–1141 / RPT_Tempos_Ordem_Reparacao582–596: each call parses
 * the full hour prefix but only two minute characters from BOTH rendered strings.
 * ADR002 retains the source negative-prefix truncation and one carry per call.
 */
export function laborSumHours(values: readonly string[]): string {
  let total = "00:00";
  for (const value of values) {
    const match = /^(-?[0-9]+):(-?[0-9]+)$/.exec(value);
    if (!match) continue;
    const previous = /^(-?[0-9]+):(-?[0-9]+)$/.exec(total)!;
    let hours = BigInt(previous[1]) + BigInt(match[1]);
    let minutes = BigInt(previous[2].slice(0, 2)) + BigInt(match[2].slice(0, 2));
    if (minutes >= 60n) { hours += 1n; minutes -= 60n; }
    total = `${two(hours.toString())}:${two(minutes.toString())}`;
  }
  return total;
}
/** Source353–358: cached history and exact four-space/date/CR concatenation. NULL stays unresolved. */
export function laborStateHistory(history: string | null, when: string, state: string | null, description: string | null): string | null {
  if (history === null || state === null || description === null) return null;
  const key = dateTimeComparisonKey(when);
  if (key === null || !/^[0-9]{17}$/.test(key) || key === OPEN_LABOR_FINISH) return null;
  const line = `${key.slice(6, 8)}/${key.slice(4, 6)}/${key.slice(0, 4)} ${key.slice(8, 10)}:${key.slice(10, 12)}    ${state}\r\n${description}`;
  return history === "" ? line : `${history}\r\n\r\n${line}`;
}
/** Source1429–1487 compares Time values after adding30 minutes, with day wrap. */
export function laborWithinClosure(now: string, first: string | null, second: string | null): boolean {
  const key = dateTimeComparisonKey(now);
  if (!key || laborDateTimeMilliseconds(now) === null) return false;
  const current = BigInt(key.slice(8, 10)) * 3600000n + BigInt(key.slice(10, 12)) * 60000n + BigInt(key.slice(12, 14)) * 1000n + BigInt(key.slice(14, 17));
  return [first, second].some(raw => {
    if (raw === null || !/^[0-9]{6}(?:[0-9]{2}|[0-9]{3})?$/.test(raw)) return false;
    const hour = BigInt(raw.slice(0, 2)), minute = BigInt(raw.slice(2, 4)), seconds = BigInt(raw.slice(4, 6));
    if (hour > 23n || minute > 59n || seconds > 59n) return false;
    const tail = raw.slice(6), fraction = tail.length === 2 ? BigInt(tail) * 10n : BigInt(tail || "0");
    const start = hour * 3600000n + minute * 60000n + seconds * 1000n + fraction;
    const end = (start + 1800000n) % 86400000n;
    return current >= start && current <= end;
  });
}
