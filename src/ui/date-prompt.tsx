import { useEffect, useRef, useState } from "react";
import { dateEntryInitial, dateEntryResult, type DatePromptValue } from "../../packages/domain/src/date-entry";
import layout from "./legacy/WIN_Data.layout.json";
import type { WdDateEditHandle } from "./legacy/date";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";

export function DatePromptDialog({ title, value, finish }: {
  title: string; value: DatePromptValue; finish: (value: DatePromptValue) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), input = useRef<WdDateEditHandle>(null);
  const [draft, setDraft] = useState(() => dateEntryInitial(value)), [invalid, setInvalid] = useState(false);
  // ADR-003/U-W16C5A7-02 explicit target focus default, not captured native routing.
  useEffect(() => { input.current?.focus(); }, []);
  const close = (returned: DatePromptValue) => { dialog.current?.close(); finish(returned); };
  const cancel = () => {
    if (input.current?.dismissCalendar()) return;
    // WIN_Data123–126: cancellation retains the exact entry result, even after a deliberate edit.
    close(draft.original);
  };
  const confirm = () => {
    if (!input.current?.validateCalendar()) return;
    const result = dateEntryResult(draft);
    if (result.kind === "invalid") { setInvalid(true); input.current?.focus(); return; }
    close(result.value);
  };
  const bindings: WdRadBinding[] = [
    { name: "STC_Data", kind: "caption", props: { text: title } },
    { name: "EDT_Data", kind: "date", props: { ref: input, draft, invalid, onChange: next => { setDraft(next); setInvalid(false); } } },
    { name: "BTN_Confirmar", kind: "button", props: { onClick: confirm } },
  ];
  return <WdModal ref={dialog} layout={layout} instance="date-prompt-frame" testId="WIN_Data" restoreTestId="date-prompt-restore" onClose={cancel}>
    <WdRadControls layout={layout} bindings={bindings} />
  </WdModal>;
}

/** Development-only result demonstration; repair save continuation belongs to its consuming stage. */
export default function DatePromptWorkflow() {
  const query = new URLSearchParams(window.location.search);
  const title = query.get("title") ?? "Data de entrega";
  const value = query.get("kind") === "null" ? null : query.get("value") ?? "20240228";
  const [opened, setOpened] = useState(false), [returned, setReturned] = useState<{ value: DatePromptValue } | null>(null);
  return <main className="workspace-fixture">
    <button data-testid="date-prompt-open" onClick={() => { setReturned(null); setOpened(true); }}>WIN_Data</button>
    {opened && <DatePromptDialog title={title} value={value} finish={result => { setReturned({ value: result }); setOpened(false); }} />}
    {returned !== null && <><output data-testid="date-prompt-returned">{returned.value}</output><output data-testid="date-prompt-returned-kind">{returned.value === null ? "null" : typeof returned.value}</output></>}
  </main>;
}
