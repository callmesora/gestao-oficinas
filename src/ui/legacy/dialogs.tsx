import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import layout from "./WINDEVMESSAGEBOX.layout.json";
import proposals from "../../../docs/evidence/message-proposals.json";
import { controlBox, controlOf, skinImage } from "./layout";
import { MessageController, type PendingMessage } from "./message-state";
import { WdButton } from "./wd";
import { ResourceBox } from "./resource-dialog";

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
  return <dialog ref={ref} className="wd-dialog-host" data-testid="WINDEVMESSAGEBOX" aria-label={request.title} aria-describedby={textId}
    onCancel={event => { event.preventDefault(); finish(); }}>
    <section className="wd-frame" style={{ ...frameSkin, width: size.width, height: size.height }}>
      <div className="wd-client">
        <div className="wd-title" data-testid={title.name} style={controlBox(title)}>{request.title}</div>
        <WdButton chrome aria-label="Fechar" control={{ ...controlOf(layout, "BTN_SYST_FERMER"), background_image: proposals.closeBackground, image: proposals.closeIcon }}
          onClick={() => finish()} />
        <span aria-hidden="true" data-testid={icon.name} className={`wd-message-icon ${model.icon === "ICON_ERREUR" ? "error" : "info"}`}
          style={{ ...controlBox(icon), top: body.y + ((body.height ?? 0) - (icon.height ?? 0)) / 2 }}>
          {model.icon === "ICON_ERREUR" ? "×" : model.icon === "ICON_QUESTION" ? "?" : "i"}
        </span>
        <div id={textId} data-testid={body.name} className="wd-message-text" style={controlBox(body)}>{request.text}</div>
        <div className="wd-message-actions">
          {model.buttons.map((button, index) => <WdButton key={button.name} control={{ ...controlOf(layout, button.name),
            caption: proposals.captions[button.caption], background_image: proposals.button }}
            style={{ left: (size.width - total) / 2 + index * (width + 6) }} onClick={() => finish(button.name)} />)}
        </div>
      </div>
    </section>
  </dialog>;
}
