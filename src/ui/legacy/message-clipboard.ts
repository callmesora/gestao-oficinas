import type { MessageRequest } from "./message-state";
import { writeClipboardText } from "../../infrastructure/clipboard";

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:179-181; source fact.
export function messageClipboardText(request: Pick<MessageRequest, "title" | "text">): string {
  const separator = "---------------------------";
  return `${separator}\r\n${request.title}\r\n${separator}\r\n${request.text}`;
}

export function writeMessageClipboard(request: Pick<MessageRequest, "title" | "text">, clipboard?: Pick<Clipboard, "writeText">): Promise<boolean> {
  // VersPressePapier's result is ignored by this source event; keep the message open on failure.
  return writeClipboardText(messageClipboardText(request), clipboard);
}
