export type ResourceInput = { kind: "text"; value: string; maxLength?: number; password?: boolean }
  | { kind: "checkbox"; value: boolean; label: string };
export interface ResourceRequest {
  title: string; text: string; buttons: { label: string; value?: number }[];
  defaultIndex: number; cancelIndex: number; input?: ResourceInput;
  destructive?: boolean; safeIndex?: number;
}
export interface ResourceResult { result: number; input?: string | boolean }

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:550-656,954-966: indexes and explicit Note values are distinct.
export function resourceModel(request: ResourceRequest) {
  if (!request.buttons.length || !Number.isInteger(request.cancelIndex) || request.cancelIndex < 1 || request.cancelIndex > request.buttons.length) throw new Error("Resource requires a valid cancel index");
  if (request.destructive && (!Number.isInteger(request.safeIndex) || !request.safeIndex || request.safeIndex < 1 || request.safeIndex > request.buttons.length)) throw new Error("Destructive resource requires an explicit safe index");
  const buttons = request.buttons.map((button, index) => {
    const result = button.value ?? index + 1;
    if (!Number.isSafeInteger(result)) throw new Error("Resource result must be an exact integer");
    return { name: `BTN_${index + 1}`, caption: button.label, result };
  });
  // ADR-006: unresolved destructive dismissal uses the caller's explicit non-mutating choice.
  const cancel = request.destructive ? request.safeIndex! : request.cancelIndex;
  return { buttons, focus: request.destructive ? cancel - 1 : request.defaultIndex - 1,
    escapeResult: buttons[cancel - 1].result,
    closeResult: request.destructive ? buttons[cancel - 1].result : request.cancelIndex };
}

export function resourceResult(request: ResourceRequest, model: ReturnType<typeof resourceModel>, button?: string, reason: "close" | "escape" = "close", input?: string | boolean): ResourceResult {
  const selected = button ? model.buttons.find(item => item.name === button) : null;
  if (button && !selected) throw new Error("Button is not present in this resource");
  // FermeDialogue copies input on click/Esc. Closing the window directly uses its raw default value.
  const changed = !!button || reason === "escape";
  return { result: selected?.result ?? (reason === "escape" ? model.escapeResult : model.closeResult),
    ...(request.input ? { input: changed ? input ?? request.input.value : request.input.value } : {}) };
}
