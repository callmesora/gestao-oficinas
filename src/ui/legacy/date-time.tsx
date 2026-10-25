import { useLayoutEffect, useRef, type Ref } from "react";
import { dateCalendarText } from "../../../packages/domain/src/date-entry";
import { dateTimeCalendarChange, dateTimeCalendarValue, dateTimeEntryChange, type DateTimeEntryDraft } from "../../../packages/domain/src/date-time";
import { WdCalendarEdit, type WdCalendarEditHandle } from "./calendar-edit";
import type { LegacyControl } from "./layout";

export type WdDateTimeEditHandle = WdCalendarEditHandle;

/** RULE-W53605A-1021/1022 / ADR-002/003: date-only calendar edits retain the minute draft and hidden precision. */
export function WdDateTimeEdit({ control, draft, onChange, invalid = false, disabled = false, ref }: {
  control: LegacyControl; draft: DateTimeEntryDraft; onChange: (draft: DateTimeEntryDraft) => void;
  invalid?: boolean; disabled?: boolean; ref?: Ref<WdDateTimeEditHandle>;
}) {
  if (control.input_type !== "Date" || control.return_format !== "YYYYMMDDHHmmSS" || control.input_mask !== "DD/MM/YYYY HH:mm"
    || control.calendar_button !== "Yes" || control.blocking_validation !== "Yes") {
    throw new Error(`Date-time metadata unresolved: ${control.path}`);
  }
  // U-W53605A-01/05: literal CalculatorYes does not establish a second behavior or precision conversion.
  const latest = useRef(draft);
  useLayoutEffect(() => { latest.current = draft; }, [draft]);
  return <WdCalendarEdit control={control} value={draft.text} invalid={invalid} disabled={disabled} ref={ref}
    calendarValue={() => dateTimeCalendarValue(latest.current)} isCalendarValue={iso => dateCalendarText(iso) !== null}
    onTextChange={text => onChange(dateTimeEntryChange(latest.current, text))}
    onCalendarEdit={(iso, valid) => onChange(valid ? dateTimeCalendarChange(latest.current, iso) : dateTimeEntryChange(latest.current, latest.current.text))} />;
}
