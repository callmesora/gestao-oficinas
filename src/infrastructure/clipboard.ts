/** WebView clipboard boundary. Callers decide whether a failed write needs a message. */
export async function writeClipboardText(text: string, clipboard: Pick<Clipboard, "writeText"> = navigator.clipboard): Promise<boolean> {
  try { await clipboard.writeText(text); return true; }
  catch { return false; }
}
