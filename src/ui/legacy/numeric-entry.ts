/** The bounded integer masks currently evidenced in the customer/vehicle/terminal forms. */
export interface IntegerMask {
  readonly source: string;
  readonly capacity: number;
  readonly separators: readonly { rightDigits: number; text: string }[];
}

/** Source 9 characters are digit slots; only literal ASCII grouping spaces are supported. */
export function integerMaskOf(source: string | undefined): IntegerMask | null {
  if (!source || /[^9 ]/.test(source) || !/^9+(?: +9+)*$/.test(source)) return null;
  const capacity = source.replaceAll(" ", "").length;
  const separators = Array.from(source.matchAll(/ +/g), match => ({
    rightDigits: source.slice(match.index + match[0].length).replaceAll(" ", "").length,
    text: match[0],
  }));
  return { source, capacity, separators };
}

/** No numeric conversion: leading zeroes and values above the JS integer range stay exact. */
export function integerMaskDigits(mask: IntegerMask, value: string): string | undefined {
  const invalid = mask.separators.length ? /[^0-9 ]/.test(value) : /[^0-9]/.test(value);
  return invalid ? undefined : value.replaceAll(" ", "");
}

function grouped(mask: IntegerMask, digits: string): string {
  let result = "";
  for (let index = 0; index < digits.length; index++) {
    const separator = index > 0 && mask.separators.find(value => value.rightDigits === digits.length - index);
    result += `${separator ? separator.text : ""}${digits[index]}`;
  }
  return result;
}

/** Render only supported in-mask values; loading never truncates or repairs original values. */
export function integerMaskDisplay(mask: IntegerMask, value: string): string {
  const digits = integerMaskDigits(mask, value);
  return digits !== undefined && digits.length <= mask.capacity ? grouped(mask, digits) : value;
}

function digitOffset(value: string, position: number): number {
  return value.slice(0, position).replaceAll(" ", "").length;
}

function caretPosition(value: string, digits: number): number {
  if (digits === 0) return 0;
  let seen = 0;
  for (let index = 0; index < value.length; index++) if (value[index] !== " " && ++seen === digits) return index + 1;
  return value.length;
}

export interface IntegerEdit {
  value: string;
  start: number;
  end: number;
}

/** Reject the complete invalid edit. The caller restores the prior DOM value and selection. */
export function integerMaskEdit(mask: IntegerMask, previous: string, candidate: string, start = candidate.length, end = start): IntegerEdit | null {
  if (candidate === previous) return { value: previous, start, end };
  const digits = integerMaskDigits(mask, candidate);
  if (digits === undefined) return null;
  if (digits.length > mask.capacity) {
    const priorDigits = integerMaskDigits(mask, previous);
    // ADR-003 reversible default: imported oversized values permit only strictly shorter edits.
    if (priorDigits === undefined || digits.length >= priorDigits.length) return null;
    return { value: candidate, start, end };
  }
  const value = grouped(mask, digits);
  return { value, start: caretPosition(value, digitOffset(candidate, start)), end: caretPosition(value, digitOffset(candidate, end)) };
}

/** Delete an adjacent digit together with its grouping space, rather than reinsert the space. */
export function integerMaskDeletionRange(value: string, start: number, end: number, backwards: boolean): { start: number; end: number } | null {
  if (start !== end) return null;
  if (backwards && value[start - 1] === " ") {
    let from = start - 1;
    while (from > 0 && value[from] === " ") from--;
    return { start: from, end };
  }
  if (!backwards && value[end] === " ") {
    let to = end;
    while (to < value.length && value[to] === " ") to++;
    return { start, end: Math.min(to + 1, value.length) };
  }
  return null;
}
