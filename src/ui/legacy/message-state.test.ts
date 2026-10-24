import { expect, it } from "vitest";
import { MessageController, messageModel, type MessageType } from "./message-state";

it("retains the source's distinct MessageBox click and close values, especially OKCancel's 7", () => {
  const expected = [[1], [1], [6, 7], [6, 7, 2], [1], [1, 7]];
  for (let type = 0; type <= 5; type++) {
    const model = messageModel({ title: "Teste", text: "  Açores\n  ", type: type as MessageType });
    expect(model.buttons.map(button => button.result)).toEqual(expected[type]);
    expect(model.closeResult).toBe([1, 1, 7, 2, 1, 7][type]);
  }
  const okCancel = messageModel({ title: "", text: "", type: 5, defaultButton: 2 });
  expect(okCancel.buttons.map(button => button.caption)).toEqual(["BTN_OK", "BTN_ANNULER"]);
  expect(okCancel.focus).toBe(1);
  expect(messageModel({ title: "", text: "", type: 3, defaultButton: 3 }).focus).toBe(2);
});

it("keeps concurrent awaited callers ordered, ignores stale completion and settles each once", async () => {
  const controller = new MessageController();
  const first = controller.open({ title: "Primeiro", text: "", type: 2 });
  const id = controller.getSnapshot()!.id;
  const second = controller.open({ title: "Segundo", text: "", type: 5 });
  expect(controller.getSnapshot()!.request.title).toBe("Primeiro");
  controller.finish(id, "BTN_OUI");
  expect(await first).toBe(6);
  controller.finish(id, "BTN_NON");
  expect(controller.getSnapshot()!.request.title).toBe("Segundo");
  controller.cancelAll();
  expect(await second).toBe(7);
  expect(controller.getSnapshot()).toBeNull();
});

it("does not mutate caller arguments and cannot resolve an invisible button", async () => {
  const controller = new MessageController();
  const request = { title: "Original", text: "  A\nB  ", type: 0 as const };
  const result = controller.open(request);
  request.title = "Changed";
  const current = controller.getSnapshot()!;
  expect(current.request).toMatchObject({ title: "Original", text: "  A\nB  " });
  expect(() => controller.finish(current.id, "BTN_NON")).toThrow("not present");
  controller.finish(current.id, "BTN_OK");
  expect(await result).toBe(1);
});
