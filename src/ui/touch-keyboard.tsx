import Decimal from "decimal.js";
import { useEffect, useRef, useState } from "react";
import { alphaKeyboardInitial, alphaKeyboardWrite, numericKeyboardInitial, numericKeyboardResult, numericKeyboardWrite, type AlphaKeyboardOptions, type NumericKeyboardOptions } from "../../packages/domain/src/touch-keyboard";
import { alphaKeyboardButtons, alphaKeyboardButtonForKey, numericKeyboardButtons, numericKeyboardButtonForKey } from "../../packages/domain/src/touch-keyboard-controls";
import alphaSource from "./legacy/WIN_Teclado_Alfa.layout.json";
import numericSource from "./legacy/WIN_Teclado_numerico.layout.json";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import type { LegacyLayout } from "./legacy/layout";
import { useDialogs } from "./legacy/dialogs";
import "./touch-keyboard.css";

// The source keyboards have no title bar. Supply only the shared frame's hidden accessibility title.
function keyboardLayout(source: LegacyLayout): LegacyLayout {
  return { ...source, controls: [...source.controls, { name: "RADTitle", path: "RADTitle", kind: "Caption", x: 0, y: 0, width: 0, height: 0, caption: source.window.title ?? "Teclado", visible: false }] };
}
const alphaCaptions: Record<string, string> = { BTN_c_cedilha: "Ç", BTN_euro: "€", BTN_a_cima: "ª", BTN_o_cima: "º", BTN_acento_grave: "`", BTN_acento_agudo: "´", BTN_acento_circunflexo: "^" };
const alphaLayout = keyboardLayout({ ...alphaSource, controls: alphaSource.controls.map(control => alphaCaptions[control.name] ? { ...control, caption: alphaCaptions[control.name] } : control) }), numericLayout = keyboardLayout(numericSource);

export interface TouchKeyboardOutcome { confirmed: boolean; edited: boolean }
type KeyboardFinish = (value: string, outcome: TouchKeyboardOutcome) => void;

export function AlphaTouchKeyboardDialog({ options, finish }: { options: AlphaKeyboardOptions; finish: KeyboardFinish }) {
  const dialog = useRef<WdModalHandle>(null), manual = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(() => alphaKeyboardInitial(options.value));
  const display = useRef<HTMLInputElement>(null);
  useEffect(() => { display.current?.setSelectionRange(state.text.length, state.text.length); if (display.current) display.current.scrollLeft = display.current.scrollWidth; }, [state.text]);
  const current = useRef(state), edited = useRef(false), closed = useRef(false);
  useEffect(() => { manual.current?.focus(); }, []);
  const close = (value: string, confirmed: boolean) => { if (closed.current) return; closed.current = true; dialog.current?.close(); finish(value, { confirmed, edited: edited.current }); };
  const write = (key: string, returnFocus: boolean) => {
    const next = alphaKeyboardWrite(current.current, key, options);
    if (next.text !== current.current.text || key === "APAGAR_TUDO" || key === "APAGAR_ULTIMO") edited.current = true;
    current.current = next; setState(next); if (returnFocus) manual.current?.focus();
  };
  const activate = (button: string) => {
    const action = alphaKeyboardButtons[button];
    if (action?.kind === "confirm") close(current.current.text, true);
    else if (action?.kind === "cancel") close(options.value, false);
    else if (action?.kind === "write") write(action.value, action.returnFocus);
  };
  const buttonBindings: WdRadBinding[] = alphaLayout.controls.flatMap(control => {
    if (control.kind !== "Button") return [];
    const action = alphaKeyboardButtons[control.name], key = action?.kind === "write" ? action.value : "";
    return [{ name: control.name, kind: "button" as const, props: {
      "aria-label": control.name === "BTN_confirmar" ? "Confirmar" : control.name === "BTN_cancelar" ? "Cancelar" : control.caption || control.name,
      disabled: options.password === "nomepasta" && ["/", "\\", ":", "*", "?", '"'].includes(key),
      style: control.name === "BTN_CapsLock" ? { color: state.caps === 2 ? "darkgreen" : state.caps === 3 ? "lightgreen" : "white" } : undefined,
      onClick: action ? () => activate(control.name) : undefined,
    } }];
  });
  // Preserve source coordinates/assets while replacing runtime caption/mask/password properties.
  const layout: LegacyLayout = { ...alphaLayout, controls: alphaLayout.controls.map(control => control.name === "BTN_Caption" ? { ...control, caption: options.title } : control.name === "EDT_Texto" ? { ...control, input_mask: options.inputMask ?? "0", input_size: options.maxLength ?? 0, flags: { ...control.flags, Password: options.password === true } } : control) };
  const bindings: WdRadBinding[] = [...buttonBindings, { name: "EDT_Texto", kind: "edit", props: { ref: display, value: state.text, readOnly: true, onFocus: () => manual.current?.focus(), "aria-label": options.title } },
  { name: "EDT_input_manual", kind: "edit", props: { ref: manual, value: "", onChange: () => undefined, "aria-label": "Entrada manual" } }];
  return <WdModal ref={dialog} layout={layout} instance="alpha-keyboard-frame" testId="WIN_Teclado_Alfa" restoreTestId="alpha-keyboard-restore" onClose={() => close(options.value, false)} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.key === "Tab") return;
    if (event.target !== manual.current) return;
    const button = alphaKeyboardButtonForKey(event.key); if (button) { event.preventDefault(); activate(button); }
  }}><WdRadControls layout={layout} bindings={bindings} /></WdModal>;
}

export function NumericTouchKeyboardDialog({ options, finish }: { options: NumericKeyboardOptions; finish: KeyboardFinish }) {
  const dialog = useRef<WdModalHandle>(null), manual = useRef<HTMLInputElement>(null), pending = useRef(false);
  const [state, setState] = useState(() => numericKeyboardInitial(options)), { message } = useDialogs();
  const current = useRef(state), edited = useRef(false), closed = useRef(false);
  useEffect(() => { manual.current?.focus(); }, []);
  const close = (value: string, confirmed: boolean) => { if (closed.current) return; closed.current = true; dialog.current?.close(); finish(value, { confirmed, edited: edited.current }); };
  const write = (key: string, returnFocus: boolean) => {
    if (pending.current) return;
    const next = numericKeyboardWrite(current.current, key, options);
    if (next.text !== current.current.text || key === "C") edited.current = true;
    current.current = next; setState(next); if (returnFocus) manual.current?.focus();
  };
  const confirm = async () => {
    if (pending.current) return;
    const result = numericKeyboardResult(current.current, options);
    if (result.kind === "accepted") { close(result.value, true); return; }
    pending.current = true;
    try { await message({ type: 0, text: result.message, title: "Teclado" }); }
    finally { pending.current = false; manual.current?.focus(); }
  };
  const activate = (button: string) => {
    const action = numericKeyboardButtons[button];
    if (action?.kind === "confirm") void confirm();
    else if (action?.kind === "cancel") close(options.value, false);
    else if (action?.kind === "write" && !(button === "BTN_menos" && new Decimal(options.lower).gt(0))) write(action.value, action.returnFocus);
  };
  const layout = { ...numericLayout, controls: numericLayout.controls.map(control => control.name === "BTN_Caption" ? { ...control, caption: options.title } : control) };
  const buttonBindings: WdRadBinding[] = layout.controls.flatMap(control => control.kind !== "Button" ? [] : [{ name: control.name, kind: "button" as const, props: {
    disabled: control.name === "BTN_menos" && new Decimal(options.lower).gt(0),
    "aria-label": control.name === "BTN_confirmar" ? "Confirmar" : control.name === "BTN_cancelar" ? "Cancelar" : control.caption || control.name,
    onClick: numericKeyboardButtons[control.name] ? () => activate(control.name) : undefined,
  } }]);
  const bindings: WdRadBinding[] = [...buttonBindings, { name: "EDT_Texto", kind: "edit", props: { value: state.text, readOnly: true, onFocus: () => manual.current?.focus(), "aria-label": options.title } },
  { name: "EDT_input_manual", kind: "edit", props: { ref: manual, value: "", onChange: () => undefined, "aria-label": "Entrada manual" } }];
  return <WdModal ref={dialog} layout={layout} instance="numeric-keyboard-frame" testId="WIN_Teclado_numerico" restoreTestId="numeric-keyboard-restore" onClose={() => close(options.value, false)} onKeyDown={event => {
    if (pending.current || event.altKey || event.ctrlKey || event.metaKey || event.key === "Tab") return;
    if (event.target !== manual.current) return;
    const button = numericKeyboardButtonForKey(event.key); if (button) { event.preventDefault(); activate(button); }
  }}><WdRadControls layout={layout} bindings={bindings} /></WdModal>;
}

export type TouchKeyboardRequest = { kind: "alpha"; options: AlphaKeyboardOptions } | { kind: "numeric"; options: NumericKeyboardOptions };
export function TouchKeyboardDialog({ request, finish }: { request: TouchKeyboardRequest; finish: KeyboardFinish }) {
  return request.kind === "alpha" ? <AlphaTouchKeyboardDialog options={request.options} finish={finish} /> : <NumericTouchKeyboardDialog options={request.options} finish={finish} />;
}

/** Direct development harness for callers' real returned-value contract. */
export function TouchKeyboardWorkflow() {
  const [opened, setOpened] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<TouchKeyboardOutcome | null>(null);
  const query = new URLSearchParams(window.location.search), original = query.get("value") ?? "12.5";
  const request: TouchKeyboardRequest = query.get("kind") === "alpha" ? { kind: "alpha", options: { title: "Texto", value: original, maxLength: Number(query.get("maxLength") ?? 100), inputMask: "0", password: query.get("password") === "nomepasta" ? "nomepasta" : query.get("password") === "true" } }
    : { kind: "numeric", options: { title: "Quantidade", value: original, decimals: Number(query.get("decimals") ?? 3), lower: query.get("lower") ?? "-99999999999999999", upper: query.get("upper") ?? "99999999999999999" } };
  return <><button data-testid="touch-keyboard-open" onClick={() => setOpened(true)}>Teclado</button>{opened && <TouchKeyboardDialog request={request} finish={(value, result) => { setReturned(value); setOutcome(result); setOpened(false); }} />}{returned !== null && <output data-testid="touch-keyboard-returned" data-confirmed={outcome?.confirmed} data-edited={outcome?.edited}>{returned}</output>}</>;
}
