import { expect, it } from "vitest";
import { messageClipboardText, writeMessageClipboard } from "./message-clipboard";

it("preserves the source clipboard envelope and leaves message whitespace/line endings unchanged", () => {
  expect(messageClipboardText({ title: "Título", text: "  Açores\nB  " })).toBe("---------------------------\r\nTítulo\r\n---------------------------\r\n  Açores\nB  ");
});

it("reports a rejected platform write as failure rather than an unhandled rejection", async () => {
  expect(await writeMessageClipboard({ title: "", text: "" }, { writeText: async () => { throw new Error("permission denied"); } })).toBe(false);
});
