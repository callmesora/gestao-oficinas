import { expect, it } from "vitest";
import { TerminalFileContext } from "./terminal-file-context";

it("SRC-7bae671f3d captures terminal new-record state once and retains reset across cancelled forms", () => {
  const context = new TerminalFileContext();
  expect(context.snapshot()).toEqual({ kind: "unknown" });
  context.position("9007199254740993");
  context.reset();
  const openingSnapshot = context.snapshot();
  const codeEditableAtOpen = openingSnapshot.kind === "new";
  // Cancelling a terminal create performs no context operation: HReset already happened.
  expect(context.snapshot()).toEqual({ kind: "new" });
  context.position("9007199254740995");
  expect(context.snapshot()).toEqual({ kind: "positioned", id: "9007199254740995" });
  expect(openingSnapshot).toEqual({ kind: "new" });
  expect(codeEditableAtOpen).toBe(true);
});

it("ADR-016 snapshots cannot mutate the context or a later form-opening snapshot", () => {
  const context = new TerminalFileContext();
  context.position("9007199254740993");
  const snapshot = context.snapshot();
  expect(Object.isFrozen(snapshot)).toBe(true);
  expect(Reflect.set(snapshot, "id", "1")).toBe(false);
  expect(Reflect.set(snapshot, "kind", "new")).toBe(false);
  context.reset();
  expect(snapshot).toEqual({ kind: "positioned", id: "9007199254740993" });
  expect(context.snapshot()).toEqual({ kind: "new" });
});

it("U-CDF1C34F-02 deletion invalidates only the explicitly positioned identity and clients remain isolated", () => {
  const first = new TerminalFileContext(), second = new TerminalFileContext();
  first.position("9007199254740993");
  second.reset();
  first.deleted("9007199254740995");
  expect(first.snapshot()).toEqual({ kind: "positioned", id: "9007199254740993" });
  first.deleted("9007199254740993");
  expect(first.snapshot()).toEqual({ kind: "unknown" });
  expect(second.snapshot()).toEqual({ kind: "new" });
  second.deleted("9007199254740993");
  expect(second.snapshot()).toEqual({ kind: "new" });
});
