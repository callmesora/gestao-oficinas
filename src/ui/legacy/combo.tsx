import { useId } from "react";
import { useAnchoredControl } from "./anchors";
import { controlBox, type LegacyControl } from "./layout";

export interface WdComboOption { value: string; label: string }

/** Noneditable source combo. Its caller owns option order, blank/orphan values and all reads. */
export function WdCombo({ control: source, options, value, onChange, disabled }: {
  control: LegacyControl; options: readonly WdComboOption[]; value: string;
  onChange: (value: string) => void; disabled?: boolean;
}) {
  const control = useAnchoredControl(source), id = useId();
  const captionWidth = control.caption_width ?? 0;
  return <div className="wd-field wd-combo-field" hidden={control.visible === false || control.flags?.Visible === false}
    data-control-path={control.path} style={controlBox(control)}>
    {captionWidth > 0 && <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>}
    <select id={id} data-testid={control.name} className="wd-edit wd-combo" value={value} disabled={disabled}
      aria-label={captionWidth ? undefined : control.caption ?? control.name}
      tabIndex={control.flags?.["TAB Key"] === false || String(control.tab_order) === "-1" ? -1 : undefined}
      onChange={event => onChange(event.currentTarget.value)}
      onKeyDown={event => {
        // ADR-003/U01: while focused, keep native select keys/Escape inside this control.
        // This does not infer whether an OS popup is currently open.
        if (event.key === "Escape") event.preventDefault();
        if (["Enter", " ", "Escape", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) event.stopPropagation();
      }} style={{ left: captionWidth + 4, width: Math.max(0, (control.width ?? 0) - captionWidth - 8) }}>
      {options.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
    </select>
  </div>;
}
