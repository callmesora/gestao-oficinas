/** WIN_sistema: untouched file values remain raw; only deliberate supported time input is converted (ADR002). */
export function systemTimeDisplay(value: string | null): string {
  return value !== null && /^\d{6}$/.test(value) ? `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}` : value ?? "";
}
export function systemTimeEntry(text: string): { kind: "valid"; value: string } | { kind: "invalid" } {
  if (text === "") return { kind: "valid", value: "" };
  if (!/^(?:(?:[01]\d|2[0-3])[0-5]\d[0-5]\d|(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d)$/.test(text)) return { kind: "invalid" };
  return { kind: "valid", value: text.replaceAll(":", "") };
}
