import { useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type ClipboardEvent, type ComponentPropsWithRef, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from "react";
import { buttonSkin, controlBox, controlOf, skinImage, type LegacyControl, type LegacyLayout } from "./layout";
import "./skin.css";
import { activateMnemonic, mnemonicCaption } from "./mnemonics";
import { FrameDeltaContext, useAnchoredControl } from "./anchors";
import { useInputSelection } from "./input-selection";
import { integerMaskDeletionRange, integerMaskDisplay, integerMaskEdit, integerMaskOf, type IntegerMask } from "./numeric-entry";
import { decimalMaskEdit, decimalMaskOf, type DecimalMask } from "./decimal-entry";
import { useInputSuggestions } from "./input-suggestions";

type ButtonProps = { control: LegacyControl; chrome?: boolean; interpretAmpersand?: boolean; style?: CSSProperties } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">;
export function WdButton({ control: source, chrome = false, interpretAmpersand = true, style, className = "", tabIndex, ...props }: ButtonProps) {
  const control = useAnchoredControl(source);
  const caption = mnemonicCaption(interpretAmpersand && !chrome ? control.caption ?? "" : "");
  return <button {...props} type="button" data-testid={control.name} data-control-path={control.path}
    data-wd-mnemonic={caption.letter ? caption.letter.toLocaleLowerCase("pt-PT") : undefined}
    aria-keyshortcuts={props["aria-keyshortcuts"] ?? (caption.letter ? `Alt+${caption.letter}` : undefined)}
    hidden={props.hidden ?? control.visible === false} tabIndex={String(control.tab_order) === "-1" ? -1 : tabIndex}
    className={`wd-button ${chrome ? "wd-chrome-button" : ""} ${className}`}
    style={{ ...controlBox(control), ...buttonSkin(control), ...style }}>
    {!chrome && <span>{!interpretAmpersand ? control.caption : <>{caption.before}{caption.letter && <u>{caption.letter}</u>}{caption.after}</>}</span>}
    {control.image && <span className="wd-button-icon" aria-hidden="true" />}
  </button>;
}

// ADR-003/U-C17FCA03-01: supplied 13px sprite cells; exact native state mapping remains assumed.
// The owning table cell supplies accessible read-only semantics; this mark cannot receive input.
export function WdCheckMark({ checked }: { checked: boolean | null }) {
  return <span className="wd-check-mark" aria-hidden="true" data-checked={checked === true}
    style={{ backgroundImage: `url("${skinImage("MediaPlayer_Cbox_Anim.gif")}")` }} />;
}

export function WdCheckbox({ control: source, checked, onChange, disabled }: {
  control: LegacyControl; checked: boolean | null; onChange: (value: boolean) => void; disabled?: boolean;
}) {
  const control = useAnchoredControl(source);
  return <label className="wd-checkbox" hidden={control.visible === false || control.flags?.Visible === false}
    data-control-path={control.path} style={controlBox(control)}>
    <input type="checkbox" data-testid={control.name} checked={checked === true} disabled={disabled}
      aria-label={control.caption || control.name}
      tabIndex={control.flags?.["TAB Key"] === false || String(control.tab_order) === "-1" ? -1 : undefined}
      onChange={event => onChange(event.currentTarget.checked)} />
    <WdCheckMark checked={checked} /><span>{control.caption}</span>
  </label>;
}

export interface WdRadioOption { value: number; label: string }
/** ADR-003: keep unknown/NULL stored values until an explicit selection. */
export function WdRadio({ control: source, options, value, onChange, disabled, label }: {
  control: LegacyControl; options: readonly WdRadioOption[]; value: number | null;
  onChange: (value: number) => void; disabled?: boolean; label: string;
}) {
  const control = useAnchoredControl(source), buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.findIndex(option => option.value === value);
  const tabStop = selected < 0 ? 0 : selected;
  return <div role="radiogroup" aria-label={label} data-testid={control.name} data-control-path={control.path}
    hidden={control.visible === false || control.flags?.Visible === false} className="wd-radio" style={controlBox(control)}>
    {options.map((option, index) => <button key={option.value} ref={node => { buttons.current[index] = node; }} type="button" role="radio"
      aria-checked={selected === index} disabled={disabled} data-radio-value={option.value}
      tabIndex={control.flags?.["TAB Key"] === false || String(control.tab_order) === "-1" || index !== tabStop ? -1 : 0}
      onClick={() => onChange(option.value)} onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault(); event.stopPropagation(); if (event.key === " ") onChange(option.value); return;
        }
        const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
        if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault(); event.stopPropagation();
        // UNRESOLVED U01: reversible clamped target movement; native wrapping remains unclaimed.
        const next = Math.max(0, Math.min(options.length - 1, index + direction));
        onChange(options[next].value); buttons.current[next]?.focus();
      }}>
      <span className="wd-radio-mark" aria-hidden="true" style={{ backgroundImage: `url("${skinImage(control.image ?? "MediaPlayer_Radio_Anim.gif")}")` }} />
      <span>{option.label}</span>
    </button>)}
  </div>;
}

export function WdFrame({ layout, instance, children, width, height, onClose, onMinimize, onToggleMaximize }: {
  layout: LegacyLayout; instance: string; children: ReactNode; width?: number; height?: number;
  onClose: () => void; onMinimize: () => void; onToggleMaximize: () => void;
}) {
  const size = layout.window.size;
  if (!size || !layout.window.background_image) throw new Error(`Frame metadata unresolved: ${layout.window.name}`);
  const title = controlOf(layout, "RADTitle");
  const buttons = [
    { name: "BTN_SYST_MINIMIZE", label: "Minimizar", action: onMinimize },
    { name: "BTN_Syst_Maximize", label: "Maximizar/restaurar", action: onToggleMaximize },
    { name: "BTN_SYST_FERMER", label: "Fechar", action: onClose },
  ];
  const frameWidth = width ?? size.width;
  const frameHeight = height ?? size.height;
  const skin = { "--wd-frame": `url("${skinImage(layout.window.background_image)}")` } as CSSProperties;
  return <section data-testid={instance} data-layout={layout.window.name} aria-label={title.caption ?? layout.window.title ?? undefined}
    data-wd-keyboard-scope="" tabIndex={-1} onKeyDown={activateMnemonic}
    className="wd-frame" style={{ ...skin, width: frameWidth, height: frameHeight }}>
    <div className="wd-client">
      <div className="wd-title" data-testid={title.name} style={{ ...controlBox(title), width: (title.width ?? 0) + frameWidth - size.width }}>{title.caption}</div>
      {buttons.map(button => {
        const control = controlOf(layout, button.name);
        return <WdButton key={control.path} control={control} chrome aria-label={button.label} onClick={button.action}
          style={{ left: undefined, right: size.width - control.x - (control.width ?? 0) }} />;
      })}
      <FrameDeltaContext.Provider value={{ width: frameWidth - size.width, height: frameHeight - size.height }}>{children}</FrameDeltaContext.Provider>
    </div>
  </section>;
}

type EditInputProps = Omit<ComponentPropsWithRef<"input">, "type" | "style" | "className" | "id">;

function useNumericEntry(mask: IntegerMask | null, props: EditInputProps, decimal: DecimalMask | null) {
  const input = useRef<HTMLInputElement | null>(null);
  const accepted = useRef({ value: "", start: 0, end: 0 });
  // Decimal callers supply localized drafts; only initial display is padded outside this hook.
  const display = useCallback((value: string) => mask && !decimal ? integerMaskDisplay(mask, value) : value, [mask, decimal]);
  const editValue = useCallback((previous: string, candidate: string, start?: number, end?: number) =>
    decimal ? decimalMaskEdit(decimal, previous, candidate, start, end) : mask ? integerMaskEdit(mask, previous, candidate, start, end) : null, [mask, decimal]);
  const capture = useCallback((node: HTMLInputElement) => {
    accepted.current = { value: node.value, start: node.selectionStart ?? 0, end: node.selectionEnd ?? 0 };
  }, []);
  const ref = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
    if (!node) return;
    const beforeInput = (event: InputEvent) => {
      if (!mask) return;
      capture(node); // Includes a recent programmatic setValue before the actual user edit.
      if (node.disabled || node.readOnly) { event.preventDefault(); return; }
      let start = node.selectionStart ?? 0, end = node.selectionEnd ?? start;
      if (mask.separators.length && (event.inputType === "deleteContentBackward" || event.inputType === "deleteContentForward")) {
        const range = integerMaskDeletionRange(node.value, start, end, event.inputType === "deleteContentBackward");
        if (range) { start = range.start; end = range.end; node.setSelectionRange(start, end); }
      }
      if (event.inputType.startsWith("insert") && event.data !== null) {
        const candidate = node.value.slice(0, start) + event.data + node.value.slice(end);
        if (!editValue(node.value, candidate)) event.preventDefault();
      }
    };
    if (mask) {
      const value = display(node.value);
      if (value !== node.value) node.value = value;
      capture(node);
      node.addEventListener("beforeinput", beforeInput);
    }
    return () => {
      node.removeEventListener("beforeinput", beforeInput);
      input.current = null;
    };
  }, [mask, capture, display, editValue]);
  // React owns callback/object-ref assignment and cleanup; expose the actual input to RHF.
  useImperativeHandle(mask ? props.ref : undefined, () => input.current!, []);
  useLayoutEffect(() => {
    if (mask && input.current) {
      const value = display(input.current.value);
      if (value !== input.current.value) input.current.value = value;
      capture(input.current);
    }
  });
  return !mask ? { ref: props.ref, onFocus: props.onFocus, onKeyDown: props.onKeyDown, onPaste: props.onPaste, onChange: props.onChange } : {
    ref,
    onFocus: (event: FocusEvent<HTMLInputElement>) => {
      if (mask) capture(event.currentTarget);
      props.onFocus?.(event);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(event);
      if (!mask || event.defaultPrevented || event.currentTarget.readOnly || event.currentTarget.disabled) return;
      const node = event.currentTarget;
      capture(node);
      if (mask.separators.length && !event.ctrlKey && !event.altKey && !event.metaKey && (event.key === "Backspace" || event.key === "Delete")) {
        const range = integerMaskDeletionRange(node.value, node.selectionStart ?? 0, node.selectionEnd ?? 0, event.key === "Backspace");
        if (range) node.setSelectionRange(range.start, range.end);
      }
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      props.onPaste?.(event);
      if (event.defaultPrevented) return;
      const node = event.currentTarget;
      capture(node);
      const start = node.selectionStart ?? 0, end = node.selectionEnd ?? start;
      // Check the original paste before the browser's text-input newline removal.
      const candidate = node.value.slice(0, start) + event.clipboardData.getData("text") + node.value.slice(end);
      if (node.readOnly || node.disabled || !editValue(node.value, candidate)) event.preventDefault();
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (!mask) { props.onChange?.(event); return; }
      const node = event.currentTarget;
      const edit = !node.readOnly && !node.disabled && editValue(accepted.current.value, node.value, node.selectionStart ?? node.value.length, node.selectionEnd ?? node.value.length);
      const next = edit || accepted.current;
      node.value = next.value;
      node.setSelectionRange(next.start, next.end);
      if (!edit) return;
      capture(node);
      props.onChange?.(event);
    },
  };
}

export function WdEdit({ control: source, automaticErase, integerMask = false, decimalMask = false, passwordReveal = false, suggestions, onSuggestion, ...props }: {
  control: LegacyControl; automaticErase?: boolean; integerMask?: boolean; decimalMask?: boolean; passwordReveal?: boolean;
  suggestions?: readonly string[]; onSuggestion?: (value: string) => void;
} & EditInputProps) {
  const control = useAnchoredControl(source);
  const decimal = useMemo(() => decimalMask ? decimalMaskOf(control.input_mask) : null, [decimalMask, control.input_mask]);
  const mask = useMemo(() => integerMask ? integerMaskOf(control.input_mask) : decimal?.integer ?? null, [integerMask, control.input_mask, decimal]);
  const numeric = useNumericEntry(mask, props, decimal);
  const field = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const revealSelection = useRef<{ start: number; end: number; direction: "forward" | "backward" | "none" } | null>(null);
  const revealEnabled = passwordReveal && control.flags?.Password === true;
  useLayoutEffect(() => {
    const input = field.current?.querySelector("input"), saved = revealSelection.current;
    if (input && saved) {
      input.setSelectionRange(saved.start, saved.end, saved.direction);
      revealSelection.current = null;
    }
  }, [revealed]);
  const toggleReveal = () => {
    const input = field.current?.querySelector("input");
    if (!input || input.disabled || !revealEnabled) return;
    revealSelection.current = { start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0, direction: input.selectionDirection ?? "none" };
    setRevealed(previous => !previous);
  };
  const id = useId();
  const maxLength = props.maxLength ?? (control.input_type === "Text" && (control.input_size ?? 0) > 0 ? control.input_size : undefined);
  const readOnly = props.readOnly ?? control.state === "Read-only";
  const assistance = useInputSuggestions({ enabled: !mask && control.input_type === "Text" && control.flags?.["File assisted input"] === true
    && suggestions !== undefined && onSuggestion !== undefined && !readOnly && !props.disabled && !(props.hidden ?? control.visible === false),
    values: suggestions, maxLength, onSuggestion, handlers: { ...numeric, onBlur: props.onBlur }, id,
    testId: `${control.name}__suggestions`, label: props["aria-label"] ?? control.caption ?? control.name });
  const selection = useInputSelection(automaticErase ?? control.flags?.["Automatic erase"], { ...props, onFocus: assistance.onFocus });
  const captionWidth = control.caption_width ?? 0;
  return <div ref={field} className="wd-field" hidden={props.hidden ?? control.visible === false} data-control-path={control.path} style={controlBox(control)}>
    {captionWidth > 0 && <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>}
    <input {...props} {...numeric} {...selection} {...assistance.attributes} onChange={assistance.onChange} onBlur={assistance.onBlur} onKeyDown={assistance.onKeyDown}
      id={id} type={control.flags?.Password === true && !(revealEnabled && revealed) ? "password" : "text"}
      inputMode={decimal ? "decimal" : mask ? "numeric" : props.inputMode}
      value={mask && !decimal && props.value !== undefined ? integerMaskDisplay(mask, String(props.value)) : props.value}
      defaultValue={mask && !decimal && props.defaultValue !== undefined ? integerMaskDisplay(mask, String(props.defaultValue)) : props.defaultValue}
      maxLength={maxLength}
      tabIndex={props.tabIndex ?? (control.flags?.["TAB Key"] === false || String(control.tab_order) === "-1" ? -1 : undefined)} data-testid={control.name} className="wd-edit"
      readOnly={readOnly}
      aria-label={captionWidth ? undefined : props["aria-label"] ?? control.caption ?? control.name}
      style={{ left: captionWidth, width: (control.width ?? 0) - captionWidth, textAlign: control.h_align === "Right" ? "right" : "left", paddingRight: revealEnabled ? 23 : undefined } as CSSProperties} />
    {revealEnabled && <button type="button" className="wd-password-reveal" data-testid={`${control.name}__reveal`}
      aria-label={revealed ? "Ocultar palavra-passe" : "Mostrar palavra-passe"} aria-pressed={revealed} aria-controls={id}
      disabled={props.disabled} tabIndex={-1}
      onPointerDown={event => event.preventDefault()}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") event.stopPropagation(); }} onClick={toggleReveal}>
      <span className="wd-password-eye" aria-hidden="true" />
    </button>}
    {assistance.popup}
  </div>;
}

export function WdMemo({ control: source, automaticErase, ...props }: { control: LegacyControl; automaticErase?: boolean } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "className" | "id">) {
  const control = useAnchoredControl(source);
  const selection = useInputSelection(automaticErase ?? control.flags?.["Automatic erase"], props);
  const id = useId();
  const captionWidth = control.caption_width ?? 0;
  return <div className="wd-field wd-memo-field" hidden={props.hidden ?? control.visible === false} data-control-path={control.path} style={controlBox(control)}>
    {captionWidth > 0 && <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>}
    <textarea {...props} {...selection} id={id}
      maxLength={props.maxLength ?? (control.input_type === "Text" && (control.input_size ?? 0) > 0 ? control.input_size : undefined)}
      tabIndex={props.tabIndex ?? (control.flags?.["TAB Key"] === false || String(control.tab_order) === "-1" ? -1 : undefined)} data-testid={control.name} className="wd-edit wd-memo"
      readOnly={props.readOnly ?? control.state === "Read-only"}
      aria-label={captionWidth ? undefined : props["aria-label"] ?? control.caption ?? control.name}
      style={{ left: captionWidth, width: (control.width ?? 0) - captionWidth }} />
  </div>;
}
