import { useLayoutEffect, useRef, type Ref } from "react";
import { dateCalendarText, dateCalendarValue, dateEntryChange, dateEntryResult, type DateEntryDraft } from "../../../packages/domain/src/date-entry";
import { WdCalendarEdit, type WdCalendarEditHandle } from "./calendar-edit";
import type { LegacyControl } from "./layout";

export type WdDateEditHandle = WdCalendarEditHandle;

/** ADR-002/003: the exact original stays in the draft, independently of the shared native date adapter. */
export function WdDateEdit({ control, draft, onChange, invalid = false, disabled = false, ref }: {
  control: LegacyControl; draft: DateEntryDraft; onChange: (draft: DateEntryDraft) => void;
  invalid?: boolean; disabled?: boolean; ref?: Ref<WdDateEditHandle>;
}) {
  if (control.input_type !== "Date" || control.return_format !== "AAAAMMJJ"
    || control.calendar_button !== "Yes" || control.blocking_validation !== "Yes") {
    throw new Error(`Plain-date metadata unresolved: ${control.path}`);
  }
  // U-W16C5A7-01/05: the literal Calculator button property has no established date-control behavior.
  const latest = useRef(draft);
  useLayoutEffect(() => { latest.current = draft; }, [draft]);
  return <WdCalendarEdit control={control} value={draft.text} invalid={invalid} disabled={disabled} ref={ref}
    calendarValue={() => {
      const result = dateEntryResult(latest.current);
      return dateCalendarValue(result.kind === "valid" ? result.value : null);
    }} isCalendarValue={iso => dateCalendarText(iso) !== null}
    onTextChange={text => onChange(dateEntryChange(latest.current, text))}
    onCalendarEdit={(iso, valid) => onChange(dateEntryChange(latest.current, valid ? dateCalendarText(iso)! : iso || latest.current.text))} />;
}
