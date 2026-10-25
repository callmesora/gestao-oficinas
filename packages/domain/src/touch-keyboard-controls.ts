/** Literal source control actions, separate from platform key names.
 * Evidence: WIN_WIN_Teclado.wdw35–1441/1541–1748; WIN_Teclado_numerico.wdw31–457.
 * The caption's write-seven event deliberately has no SetFocus continuation.
 */
export type TouchKeyboardButtonAction =
  | { kind: "write"; value: string; returnFocus: boolean }
  | { kind: "confirm" | "cancel" };
const write = (value: string, returnFocus = true): TouchKeyboardButtonAction => ({ kind: "write", value, returnFocus });
export const alphaKeyboardButtons: Readonly<Record<string, TouchKeyboardButtonAction>> = {
  ...Object.fromEntries("abcdefghijklmnopqrstuvwxyz".split("").map(letter => [`BTN_${letter}`, write(letter.toUpperCase())])),
  ...Object.fromEntries("0123456789".split("").map(digit => [`BTN_${digit}`, write(digit)])),
  BTN_confirmar: { kind: "confirm" }, BTN_cancelar: { kind: "cancel" }, BTN_Caption: write("7", false),
  BTN_CapsLock: write("CAPS"), BTN_c_cedilha: write("Ç"), BTN_acento_grave: write("`"), BTN_acento_agudo: write("´"), BTN_acento_til: write("~"), BTN_acento_circunflexo: write("/\\"),
  BTN_apagar_tudo: write("APAGAR_TUDO"), BTN_apagar_ultimo: write("APAGAR_ULTIMO"), BTN_espaco: write(" "),
  BTN_asterisco: write("*"), BTN_mais: write("+"), BTN_menos: write("-"), BTN_under_score: write("_"), BTN_barra_esquerda: write("\\"), BTN_barra_direita: write("/"),
  BTN_ponto: write("."), BTN_virgula: write(","), BTN_ponto_virgula: write(";"), BTN_dois_pontos: write(":"), BTN_parentesis_esquerda: write("("), BTN_parentesis_direita: write(")"),
  BTN_arroba: write("@"), BTN_euro: write("€"), BTN_percentagem: write("%"), BTN_ponto_interrogacao: write("?"), BTN_a_cima: write("ª"), BTN_o_cima: write("º"), BTN_i_comercial: write("&"), BTN_aspas: write('"'), BTN_igual: write("="), BTN_cardinal: write("#"),
};
export const numericKeyboardButtons: Readonly<Record<string, TouchKeyboardButtonAction>> = {
  BTN_um: write("1"), BTN_dois: write("2"), BTN_tres: write("3"), BTN_quatro: write("4"), BTN_cinco: write("5"), BTN_seis: write("6"), BTN_sete: write("7"), BTN_oito: write("8"), BTN_nove: write("9"), BTN_zero: write("0"),
  BTN_ponto: write("."), BTN_menos: write("-"), BTN_limpar: write("C"), BTN_Caption: write("7", false), BTN_confirmar: { kind: "confirm" }, BTN_cancelar: { kind: "cancel" },
};
const alphaCodes: Readonly<Record<number, string>> = {
  96: "BTN_acento_grave", 94: "BTN_acento_circunflexo", 126: "BTN_acento_til", 171: "BTN_acento_agudo", 219: "BTN_euro", 187: "BTN_a_cima", 188: "BTN_o_cima", 130: "BTN_c_cedilha", 141: "BTN_c_cedilha",
  43: "BTN_mais", 37: "BTN_percentagem", 63: "BTN_ponto_interrogacao", 61: "BTN_igual", 35: "BTN_cardinal", 34: "BTN_aspas", 38: "BTN_i_comercial", 64: "BTN_arroba", 40: "BTN_parentesis_esquerda", 41: "BTN_parentesis_direita", 59: "BTN_ponto_virgula", 58: "BTN_dois_pontos", 44: "BTN_ponto_virgula", 92: "BTN_barra_esquerda", 47: "BTN_barra_direita", 95: "BTN_under_score", 42: "BTN_asterisco", 46: "BTN_ponto", 45: "BTN_menos", 32: "BTN_espaco", 8: "BTN_apagar_ultimo", 13: "BTN_confirmar", 27: "BTN_cancelar",
};
/** Actual source _EVE.wParam dispatch; encoded values are not Unicode assumptions. */
export function alphaKeyboardButtonForCode(code: number): string | null {
  if (code >= 65 && code <= 90 || code >= 97 && code <= 122) return `BTN_${String.fromCharCode(code).toLowerCase()}`;
  if (code >= 48 && code <= 57) return `BTN_${String.fromCharCode(code)}`;
  return alphaCodes[code] ?? null;
}
export function numericKeyboardButtonForCode(code: number): string | null {
  const digits = ["BTN_zero", "BTN_um", "BTN_dois", "BTN_tres", "BTN_quatro", "BTN_cinco", "BTN_seis", "BTN_sete", "BTN_oito", "BTN_nove"];
  if (code >= 48 && code <= 57) return digits[code - 48];
  return ({ 67: "BTN_limpar", 99: "BTN_limpar", 8: "BTN_limpar", 46: "BTN_ponto", 45: "BTN_menos", 13: "BTN_confirmar", 27: "BTN_cancelar" } as Record<number, string>)[code] ?? null;
}
/** Browser bridge for the known source glyphs. Native encoded/IME equivalence remains U02. */
export function alphaKeyboardButtonForKey(key: string): string | null {
  const aliases: Record<string, number> = { Backspace: 8, Enter: 13, Escape: 27, "´": 171, "€": 219, "ª": 187, "º": 188, "Ç": 130, "ç": 141 };
  return aliases[key] !== undefined ? alphaKeyboardButtonForCode(aliases[key]) : key.length === 1 ? alphaKeyboardButtonForCode(key.charCodeAt(0)) : null;
}
export function numericKeyboardButtonForKey(key: string): string | null {
  const aliases: Record<string, number> = { Backspace: 8, Enter: 13, Escape: 27 };
  return aliases[key] !== undefined ? numericKeyboardButtonForCode(aliases[key]) : key.length === 1 ? numericKeyboardButtonForCode(key.charCodeAt(0)) : null;
}
