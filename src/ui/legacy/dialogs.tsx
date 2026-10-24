import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import layout from "./WINDEVMESSAGEBOX.layout.json";
import proposals from "../../../docs/evidence/message-proposals.json";
import { controlBox, controlOf, skinImage } from "./layout";
import { MessageController, type PendingMessage } from "./message-state";
import { WdButton } from "./wd";
import { ResourceBox } from "./resource-dialog";
import { browserMeasure, messageGeometry } from "./dialog-metrics";

type DialogService = Pick<MessageController, "open" | "resource">;
const MessageContext = createContext<DialogService | null>(null);

export function useDialogs() {
  const service = useContext(MessageContext);
  if (!service) throw new Error("DialogProvider is required");
  return { message: service.open, resource: service.resource };
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => new MessageController());
  const current = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  useEffect(() => () => controller.cancelAll(), [controller]);
  return <MessageContext.Provider value={controller}>
    {children}
    {current?.kind === "message" && <MessageBox key={current.id} current={current} controller={controller} />}
    {current?.kind === "resource" && <ResourceBox key={current.id} current={current} controller={controller} />}
  </MessageContext.Provider>;
}

function MessageBox({ current, controller }: { current: PendingMessage; controller: MessageController }) {
  const ref = useRef<HTMLDialogElement>(null), textId = useId();
  const { request, model, id } = current;
  const size = layout.window.size;
  if (!size) throw new Error("Message base geometry unresolved");
  const body = controlOf(layout, "LIB_INFO"), title = controlOf(layout, "RADTitle");
  const icon = controlOf(layout, model.icon);
  const width = controlOf(layout, "BTN_OK").width!;
  // Source CentreLesBoutons: total button width, 6px gaps, centered in the frame.
  const total = width * model.buttons.length + 6 * (model.buttons.length - 1);
  const [fit, setFit] = useState<ReturnType<typeof messageGeometry> | null>(null);
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      if (!active || !ref.current) return;
      const font = getComputedStyle(ref.current.querySelector(".wd-frame")!).font;
      setFit(messageGeometry(layout, request.text, model.buttons.length, browserMeasure(font)));
    });
    return () => { active = false; };
  }, [request.text, model.buttons.length]);
  const frameWidth = fit?.width ?? size.width, frameHeight = fit?.height ?? size.height;
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    dialog.querySelectorAll<HTMLButtonElement>(".wd-message-actions button")[model.focus]?.focus();
    return () => { dialog.close(); };
  }, [model.focus]);
  const finish = (button?: Parameters<MessageController["finish"]>[1]) => {
    // Close while still connected so the browser restores the opener's focus.
    ref.current?.close();
    controller.finish(id, button);
  };
  const frameSkin = { "--wd-frame": `url("${skinImage(proposals.frame)}")` } as CSSProperties;
  // UNRESOLVED U-W36869F-01: minimum title geometry is unavailable; keep its width nonnegative.
  return <dialog ref={ref} className="wd-dialog-host" data-testid="WINDEVMESSAGEBOX" aria-label={request.title} aria-describedby={textId}
    onCancel={event => { event.preventDefault(); finish(); }}>
    <section className="wd-frame" style={{ ...frameSkin, width: frameWidth, height: frameHeight }}>
      <div className="wd-client">
        <div className="wd-title" data-testid={title.name} style={{ ...controlBox(title), width: Math.max(0, title.width! + frameWidth - size.width) }}>{request.title}</div>
        <WdButton chrome aria-label="Fechar" control={{ ...controlOf(layout, "BTN_SYST_FERMER"), background_image: proposals.closeBackground, image: proposals.closeIcon }}
          style={{ left: undefined, right: size.width - controlOf(layout, "BTN_SYST_FERMER").x - controlOf(layout, "BTN_SYST_FERMER").width! }} onClick={() => finish()} />
        <span aria-hidden="true" data-testid={icon.name} className={`wd-message-icon ${model.icon === "ICON_ERREUR" ? "error" : "info"}`}
          style={{ ...controlBox(icon), top: body.y + ((fit?.textHeight ?? body.height!) - icon.height!) / 2 }}>
          {model.icon === "ICON_ERREUR" ? "×" : model.icon === "ICON_QUESTION" ? "?" : "i"}
        </span>
        <div id={textId} data-testid={body.name} className="wd-message-text" style={{ ...controlBox(body), width: fit?.textWidth ?? body.width!, height: fit?.textHeight ?? body.height! }}>{request.text}</div>
        <div className="wd-message-actions">
          {model.buttons.map((button, index) => <WdButton key={button.name} control={{ ...controlOf(layout, button.name),
            caption: proposals.captions[button.caption], background_image: proposals.button }}
            style={{ left: (frameWidth - total) / 2 + index * (width + 6), top: fit?.buttonY ?? controlOf(layout, button.name).y }} onClick={() => finish(button.name)} />)}
        </div>
      </div>
    </section>
  </dialog>;
}
