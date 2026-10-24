export type MessageType = 0 | 1 | 2 | 3 | 4 | 5;
export type MessageButton = "BTN_OK" | "BTN_OUI" | "BTN_NON" | "BTN_ANNULER";
export interface MessageRequest { title: string; text: string; type?: MessageType; defaultButton?: number; destructive?: boolean }

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:33-120,372-491.
export function messageModel(request: MessageRequest) {
  const type = request.type ?? 1;
  if (![0, 1, 2, 3, 4, 5].includes(type) || typeof request.title !== "string" || typeof request.text !== "string") throw new Error("Invalid message request");
  const buttons: { name: MessageButton; result: number; caption: MessageButton }[] = type === 2 || type === 3 || type === 5
    ? [{ name: "BTN_OUI", result: type === 5 ? 1 : 6, caption: type === 5 ? "BTN_OK" : "BTN_OUI" },
      { name: "BTN_NON", result: 7, caption: type === 5 ? "BTN_ANNULER" : "BTN_NON" },
      ...(type === 3 ? [{ name: "BTN_ANNULER" as const, result: 2, caption: "BTN_ANNULER" as const }] : [])]
    : [{ name: "BTN_OK", result: 1, caption: "BTN_OK" }];
  const closeResult = type === 3 ? 2 : type === 2 || type === 5 ? 7 : 1;
  let focus = request.defaultButton === 2 && buttons.length > 1 ? 1 : request.defaultButton === 3 && type === 3 ? 2 : 0;
  // proposed: Q-12; ADR-006: destructive unknown defaults choose the non-mutating result.
  if (request.destructive) focus = buttons.findIndex(button => button.result === closeResult);
  return { type, buttons, closeResult, focus, icon: type === 1 ? "ICON_ERREUR" : type === 2 || type === 3 || type === 5 ? "ICON_QUESTION" : "ICON_INFORMATION" };
}

export interface PendingMessage { id: number; request: MessageRequest; model: ReturnType<typeof messageModel> }

/** One awaited result per request; concurrent callers queue without replacing each other's dialog. */
export class MessageController {
  private sequence = 0;
  private queue: { value: PendingMessage; resolve: (result: number) => void }[] = [];
  private listeners = new Set<() => void>();
  getSnapshot = () => this.queue[0]?.value ?? null;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private emit() { this.listeners.forEach(listener => listener()); }
  open = (request: MessageRequest): Promise<number> => {
    const copy = { ...request }, model = messageModel(copy);
    return new Promise(resolve => { this.queue.push({ value: { id: ++this.sequence, request: copy, model }, resolve }); this.emit(); });
  };
  finish(id: number, button?: MessageButton) {
    const current = this.queue[0];
    if (!current || current.value.id !== id) return;
    const selected = button ? current.value.model.buttons.find(item => item.name === button) : null;
    if (button && !selected) throw new Error("Button is not present in this message");
    this.queue.shift(); this.emit();
    current.resolve(selected?.result ?? current.value.model.closeResult);
  }
  cancelAll() {
    const pending = this.queue; this.queue = []; this.emit();
    pending.forEach(item => item.resolve(item.value.model.closeResult));
  }
}
