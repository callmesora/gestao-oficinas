import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import { dateCalendarText, dateCalendarValue, dateEntryChange, dateEntryResult, type DateEntryDraft } from "../../../packages/domain/src/date-entry";
import type { LegacyControl } from "./layout";
import { WdEdit } from "./wd";
import "./date.css";

export interface WdDateEditHandle { focus(): void; dismissCalendar(): boolean; validateCalendar(): boolean }

const calendarState = (node: HTMLInputElement) => JSON.stringify([
  node.value, node.validity.badInput, node.validity.rangeUnderflow, node.validity.rangeOverflow,
]);

/** ADR-002/003: the original remains in the text draft; native date is only an explicit calendar adapter. */
export function WdDateEdit({ control, draft, onChange, invalid = false, ref }: {
  control: LegacyControl; draft: DateEntryDraft; onChange: (draft: DateEntryDraft) => void;
  invalid?: boolean; ref?: Ref<WdDateEditHandle>;
}) {
  if (control.input_type !== "Date" || control.return_format !== "AAAAMMJJ"
    || control.calendar_button !== "Yes" || control.blocking_validation !== "Yes") {
    throw new Error(`Plain-date metadata unresolved: ${control.path}`);
  }
  // U-W16C5A7-01/05: the literal Calculator button property has no established date-control behavior.
  const text = useRef<HTMLInputElement>(null), calendar = useRef<HTMLInputElement>(null);
  const [calendarMode, setCalendarMode] = useState(false), [calendarInvalid, setCalendarInvalid] = useState(false);
  const active = useRef(false), nativeInvalid = useRef(false), latest = useRef(draft);
  const keyboardBefore = useRef<string | null>(null);
  useLayoutEffect(() => { latest.current = draft; }, [draft]);
  const retainNativeInvalid = () => {
    const node = calendar.current;
    if (active.current && node && (node.validity.badInput || node.validity.rangeUnderflow || node.validity.rangeOverflow) && !nativeInvalid.current) {
      nativeInvalid.current = true;
      // Segmented editing can change validity without emitting input/change while the value stays empty.
      onChange(dateEntryChange(latest.current, node.value || latest.current.text));
    }
    return nativeInvalid.current;
  };
  const dismissCalendar = () => {
    if (!active.current) return false;
    const invalidNative = retainNativeInvalid();
    active.current = false;
    flushSync(() => { setCalendarMode(false); setCalendarInvalid(invalidNative); });
    text.current?.focus();
    return true;
  };
  useImperativeHandle(ref, () => ({
    focus() { if (!dismissCalendar()) text.current?.focus(); }, dismissCalendar,
    validateCalendar() {
      if (!retainNativeInvalid()) return true;
      active.current = true;
      flushSync(() => { setCalendarMode(true); setCalendarInvalid(true); });
      calendar.current?.focus();
      return false;
    },
  }));
  const openCalendar = () => {
    const result = dateEntryResult(latest.current);
    active.current = true;
    keyboardBefore.current = null;
    // Remain in a usable visible adapter mode even when this engine has no popup API.
    flushSync(() => setCalendarMode(true));
    const node = calendar.current;
    if (!node) return;
    // Initialize this mutable projection only on explicit entry, never on a React rerender.
    if (!nativeInvalid.current) node.value = dateCalendarValue(result.kind === "valid" ? result.value : null);
    node.focus();
    try { node.showPicker?.(); } catch { /* The mounted native input remains available for manual entry. */ }
  };
  const changeCalendar = (node: HTMLInputElement) => {
    const localized = dateCalendarText(node.value);
    nativeInvalid.current = node.validity.badInput || node.validity.rangeUnderflow || node.validity.rangeOverflow || localized === null;
    setCalendarInvalid(nativeInvalid.current);
    // Partial native segments expose no text value. Latch the actual edit and retain their native invalid state.
    // No replacement sentinel or browser validation message is copied into the source value.
    onChange(dateEntryChange(latest.current, nativeInvalid.current ? node.value || latest.current.text : localized!));
  };
  const captionWidth = control.caption_width ?? 0;
  return <WdEdit control={control} ref={text} value={draft.text} aria-invalid={invalid || calendarInvalid || undefined}
    aria-hidden={calendarMode || undefined} tabIndex={calendarMode ? -1 : undefined}
    onChange={event => { nativeInvalid.current = false; setCalendarInvalid(false); onChange(dateEntryChange(latest.current, event.currentTarget.value)); }}
    onKeyDown={event => {
      if (event.altKey && event.key === "ArrowDown" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault(); event.stopPropagation(); openCalendar();
      } else if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); }
    }} adornment={{ width: 20, content: <>
      <button type="button" className="wd-date-calendar-button" data-testid={`${control.name}__calendar`}
        aria-label="Calendário" tabIndex={-1} onPointerDown={event => event.preventDefault()}
        onClick={openCalendar}><span className="wd-date-calendar-icon" aria-hidden="true" /></button>
      <input ref={calendar} type="date" min="0001-01-01" max="9999-12-31"
        className="wd-date-calendar-input" data-testid={`${control.name}__calendar-input`} aria-label="Calendário"
        hidden={!calendarMode} tabIndex={calendarMode ? 0 : -1} aria-invalid={calendarInvalid || undefined}
        style={{ left: captionWidth, width: `calc(100% - ${captionWidth}px)` }}
        onInput={event => changeCalendar(event.currentTarget)} onChange={event => changeCalendar(event.currentTarget)}
        onBlur={() => { if (retainNativeInvalid()) setCalendarInvalid(true); }} onKeyDown={event => {
          keyboardBefore.current = calendarState(event.currentTarget);
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismissCalendar(); }
          else if (event.key === "Enter") event.stopPropagation();
        }} onKeyUp={event => {
          // Some engines emit no input/change for partial segments, including clearing them back to empty.
          // Observe an actual widget-state change; opening, focus and navigation alone never mark an edit.
          if (keyboardBefore.current !== null && keyboardBefore.current !== calendarState(event.currentTarget)) changeCalendar(event.currentTarget);
          keyboardBefore.current = null;
        }} />
    </> }} />;
}
