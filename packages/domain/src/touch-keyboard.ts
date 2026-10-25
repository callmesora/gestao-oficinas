import Decimal from "decimal.js";
import { alphaKeyboardButtons, alphaKeyboardButtonForKey, numericKeyboardButtons, numericKeyboardButtonForKey } from "./touch-keyboard-controls";

const Exact = Decimal.clone({ precision: 100 });
export interface AlphaKeyboardOptions { title: string; value: string; maxLength?: number; inputMask?: string; password?: boolean | "nomepasta" }
export interface AlphaKeyboardState { text: string; caps: 1 | 2 | 3; accent: string }
export function alphaKeyboardInitial(value: string): AlphaKeyboardState { return { text: value, caps: 1, accent: "" }; }

// WIN_WIN_Teclado1819–1979: source deliberately has only A/E/I accent branches (tilde only A).
export function alphaKeyboardWrite(state: AlphaKeyboardState, key: string, options: Pick<AlphaKeyboardOptions, "maxLength" | "password"> = {}): AlphaKeyboardState {
  if (key === "CAPS") return { ...state, caps: state.caps === 1 ? 2 : state.caps === 2 ? 3 : 1 };
  if (key === "APAGAR_TUDO") return { ...state, text: "" };
  if (key === "APAGAR_ULTIMO") return { ...state, text: state.text.slice(0, -1) };
  if (["`", "´", "/\\", "~"].includes(key)) return { ...state, accent: key };
  if (options.password === "nomepasta" && ["/", "\\", ":", "*", "?", '"'].includes(key)) return state;
  const accents: Record<string, Record<string, string>> = { "`": { A: "à", E: "è", I: "ì" }, "´": { A: "á", E: "é", I: "í" }, "~": { A: "ã" }, "/\\": { A: "â", E: "ê", I: "î" } };
  const base = accents[state.accent]?.[key] ?? key;
  const appended = state.caps === 1 ? base.toLocaleLowerCase("pt-PT") : base.toLocaleUpperCase("pt-PT");
  // U05: constrain new characters; retain an oversized programmatic original untouched.
  const next = state.text + appended;
  return { text: options.maxLength && next.length > options.maxLength ? state.text : next, accent: "", caps: state.caps === 2 ? 1 : state.caps };
}

/** Modern key names route the same source button action; comma intentionally routes semicolon. */
export function alphaKeyboardKey(key: string): string | null {
  const button = alphaKeyboardButtonForKey(key), action = button ? alphaKeyboardButtons[button] : undefined;
  return action?.kind === "write" ? action.value : null;
}

export interface NumericKeyboardOptions { title: string; value: string; decimals: number; lower: string; upper: string }
export interface NumericKeyboardState { text: string; first: boolean; fractional: boolean }
export function numericKeyboardInitial(options: NumericKeyboardOptions): NumericKeyboardState {
  // U05: exact half-up presentation default for source NumToString(16.<decimals>f).
  return { text: new Exact(options.value).toFixed(options.decimals, Decimal.ROUND_HALF_UP).padStart(16, " "), first: true, fractional: false };
}
export function numericKeyboardWrite(state: NumericKeyboardState, key: string, options: NumericKeyboardOptions): NumericKeyboardState {
  let text = state.first ? "0." : state.text;
  const next = { text, first: false, fractional: state.fractional };
  if (key === ".") return { ...next, fractional: true };
  if (key === "C") return { text: "0.", first: false, fractional: false };
  text = text.replaceAll(" ", "");
  let candidate: string;
  if (key === "-") candidate = text.startsWith("-") ? text.slice(1) : `-${text}`;
  else if (/^[0-9]$/.test(key)) {
    let [left, right = ""] = text.split(".");
    if (state.fractional) { if (right.length < options.decimals) right += key; }
    else { if (left === "0") left = ""; left += key; }
    candidate = `${left}.${right}`;
  } else return next;
  const number = new Exact(candidate);
  if (number.gte(options.lower) && number.lte(options.upper)) next.text = candidate;
  return next;
}
export function numericKeyboardResult(state: NumericKeyboardState, options: NumericKeyboardOptions): { kind: "accepted"; value: string } | { kind: "outside"; message: string } {
  const value = new Exact(state.text.trim());
  return value.gte(options.lower) && value.lte(options.upper) ? { kind: "accepted", value: value.toFixed() }
    : { kind: "outside", message: `Valor fora dos limites (${options.lower} - ${options.upper})` };
}
export function numericKeyboardKey(key: string): string | null {
  const button = numericKeyboardButtonForKey(key), action = button ? numericKeyboardButtons[button] : undefined;
  return action?.kind === "write" ? action.value : null;
}
