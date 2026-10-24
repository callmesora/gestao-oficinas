import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import layout from "./WINDEVDIALOGBOX.layout.json";
import proposals from "../../../docs/evidence/message-proposals.json";
import { controlBox, controlOf, skinImage } from "./layout";
import type { MessageController, PendingResource } from "./message-state";
import { WdButton } from "./wd";
import { browserMeasure, resourceGeometry, resourceTextInputGeometry } from "./dialog-metrics";
import { activateMnemonic } from "./mnemonics";

export function ResourceBox({ current, controller }: { current: PendingResource; controller: MessageController }) {
  const { id, request, model } = current;
  const ref = useRef<HTMLDialogElement>(null), inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null), textId = useId();
  const [input, setInput] = useState<string | boolean>(request.input?.value ?? "");
  const size = layout.window.size!;
  const body = controlOf(layout, "LIB_INFO"), title = controlOf(layout, "RADTitle"), button = controlOf(layout, "BTN_1");
  const field = controlOf(layout, request.input?.kind === "checkbox" ? "INT_1" : "SAI_1");
  const close = controlOf(layout, "BTN_SYST_FERMER");
  const icon = controlOf(layout, "ICONE");
  const multiline = request.input?.kind === "text" && !request.input.password && request.input.value.includes("\r\n");
  // Source RedimensionnerFenêtre: desktop minimum 400 and extra height for input.
  const [fit, setFit] = useState<ReturnType<typeof resourceGeometry> | null>(null);
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      if (!active || !ref.current) return;
      const font = getComputedStyle(ref.current.querySelector(".wd-frame")!).font;
      const measure = browserMeasure(font);
      // UNRESOLVED U-W0075A5-05: native text-height insets are unknown; reserve the target edit's measured insets.
      const style = inputRef.current ? getComputedStyle(inputRef.current) : null;
      const inset = style ? [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth].reduce((sum, value) => sum + parseFloat(value || "0"), 0) : 0;
      const inputSize = request.input?.kind === "text"
        ? resourceTextInputGeometry(request.input, { width: field.width!, height: field.height! }, measure, inset, multiline)
        : request.input ? { width: field.width!, height: field.height! } : undefined;
      setFit(resourceGeometry(layout, request.text, request.title, model.buttons.map(item => item.caption), measure, window.innerWidth,
        inputSize));
    });
    return () => { active = false; };
  }, [model.buttons, request.title, request.text, request.input, multiline, field.width, field.height]);
  const width = fit?.width ?? Math.max(400, size.width), extra = request.input ? field.height! : 0, height = fit?.height ?? size.height + extra;
  const total = fit?.total ?? model.buttons.length * button.width! + (model.buttons.length - 1) * 12;
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    if (request.input) inputRef.current?.focus();
    else dialog.querySelectorAll<HTMLButtonElement>(".wd-resource-actions button")[model.focus]?.focus();
    return () => dialog.close();
  }, [model.focus, request.input]);
  const finish = (name?: string, reason: "close" | "escape" = "close") => {
    ref.current?.close(); controller.finish(id, name, reason, input);
  };
  const skin = { "--wd-frame": `url("${skinImage(proposals.frame)}")` } as CSSProperties;
  return <dialog ref={ref} className="wd-dialog-host" data-testid="WINDEVDIALOGBOX" data-wd-keyboard-scope="" aria-label={request.title} aria-describedby={textId}
    onCancel={event => { event.preventDefault(); finish(undefined, "escape"); }}
    onKeyDown={event => {
      activateMnemonic(event);
      if (event.defaultPrevented) return;
      if (event.key === "Enter" && !multiline && event.target === inputRef.current && model.buttons[model.focus]) {
        event.preventDefault(); finish(model.buttons[model.focus].name);
      }
    }}>
    <section className="wd-frame" style={{ ...skin, width, height }}>
      <div className="wd-client">
        <div className="wd-title" data-testid={title.name} style={{ ...controlBox(title), width: title.width! + width - size.width }}>{request.title}</div>
        <WdButton chrome aria-label="Fechar" control={{ ...close, image: proposals.closeIcon, background_image: proposals.closeBackground }}
          style={{ left: undefined, right: size.width - close.x - close.width! }} onClick={() => finish()} />
        <span data-testid="ICONE" data-control-path={icon.path} data-icon={model.icon?.kind === "standard" ? model.icon.name : model.icon?.kind ?? ""}
          aria-hidden="true" className="wd-resource-icon" style={{ ...controlBox(icon), left: fit?.iconX ?? icon.x, top: fit?.iconY ?? icon.y }}>
          {model.icon?.kind === "custom" ? <img src={model.icon.url} alt="" /> : model.icon?.kind === "standard" &&
            <span className={`wd-message-icon ${model.icon.name === "ICON_ERREUR" ? "error" : "info"}`}>
              {model.icon.name === "ICON_ERREUR" ? "×" : model.icon.name === "ICON_Question" ? "?" : "i"}
            </span>}
        </span>
        <div id={textId} className="wd-message-text" data-testid={body.name} style={{ ...controlBox(body), left: fit?.bodyX ?? body.x,
          width: fit?.bodyWidth ?? body.width! + width - size.width, height: fit?.textHeight ?? body.height! }}>{request.text}</div>
        {request.input && <div className="wd-resource-input" style={{ left: fit?.bodyX ?? body.x, top: fit?.inputY ?? body.y + body.height! - 6,
          width: fit?.inputWidth ?? width - body.x - 16, height: fit?.inputHeight ?? field.height! }}>
          {request.input.kind === "checkbox" ? <label>
            <input ref={node => { inputRef.current = node; }} data-testid="INT_1" type="checkbox" checked={Boolean(input)} onChange={event => setInput(event.target.checked)} />{request.input.label}
          </label> : multiline ? <textarea ref={node => { inputRef.current = node; }} className="wd-resource-edit" data-testid="SAI_1" aria-labelledby={textId}
            maxLength={request.input.maxLength || undefined} value={String(input)} onChange={event => setInput(event.target.value.replace(/\r?\n/g, "\r\n"))} />
          : <input ref={node => { inputRef.current = node; }} className="wd-resource-edit" data-testid="SAI_1" aria-labelledby={textId}
            type={request.input.password ? "password" : "text"} maxLength={request.input.maxLength || undefined} value={String(input)} onChange={event => setInput(event.target.value)} />}
        </div>}
        <div className="wd-resource-actions">
          {model.buttons.map((item, index) => <WdButton key={item.name} control={{ ...button, name: item.name, path: item.name,
            caption: item.caption, background_image: proposals.button }} style={{ left: (width - total) / 2 + (fit?.widths.slice(0, index).reduce((sum, value) => sum + value, 0) ?? index * button.width!) + index * 12,
              width: fit?.widths[index] ?? button.width!, top: fit?.buttonY ?? button.y + extra }}
            onClick={() => finish(item.name)} />)}
        </div>
      </div>
    </section>
  </dialog>;
}
