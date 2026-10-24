import { expect, it } from "vitest";
import { resourceModel, resourceResult, type ResourceRequest } from "./resource-state";
import { MessageController } from "./message-state";

const request: ResourceRequest = { title: "Teste", text: "Valor", buttons: [{ label: "Um", value: 11 }, { label: "Dois", value: 27 }], defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "  original  " } };

it("preserves resource indexes versus explicit button values and copies input only through FermeDialogue", () => {
  const model = resourceModel(request);
  expect(resourceResult(request, model, "BTN_1", "close", "  Açores\n  ")).toEqual({ result: 11, input: "  Açores\n  " });
  expect(resourceResult(request, model, undefined, "escape", "alterado")).toEqual({ result: 27, input: "alterado" });
  expect(resourceResult(request, model, undefined, "close", "alterado")).toEqual({ result: 2, input: "  original  " });
  expect(resourceModel({ ...request, buttons: [{ label: "A" }, { label: "B", value: 0 }] }).buttons.map(button => button.result)).toEqual([1, 0]);
});

it("shares one modal queue between message and resource callers and leaves caller input immutable", async () => {
  const controller = new MessageController();
  const first = controller.open({ title: "Mensagem", text: "", type: 0 });
  const resource = controller.resource(request);
  const firstId = controller.getSnapshot()!.id;
  controller.finish(firstId, "BTN_OK");
  expect(await first).toBe(1);
  expect(controller.getSnapshot()!.kind).toBe("resource");
  controller.finish(controller.getSnapshot()!.id, "BTN_2", "close", "novo");
  expect(await resource).toEqual({ result: 27, input: "novo" });
  expect(request.input!.value).toBe("  original  ");
});
