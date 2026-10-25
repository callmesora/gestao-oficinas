import { useEffect, useRef, useState } from "react";
import { repairStateConfirmationPrompt, repairStatePrefixMatches, type RepairStateConfirmationResult } from "../../packages/domain/src/repair-state-confirmation";
import layout from "./legacy/WIN_Mudar_Estado.layout.json";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";

export function RepairStateConfirmationDialog({ state, finish }: {
  state: string | null; finish: (value: RepairStateConfirmationResult) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), input = useRef<HTMLInputElement>(null), pending = useRef(false);
  const [letter, setLetter] = useState(""), [busy, setBusy] = useState(false);
  const { message } = useDialogs();
  // ADR-003 explicit initial-focus default; source native focus remains U-W20AB1F-02.
  useEffect(() => { input.current?.focus(); }, []);
  const close = (value: RepairStateConfirmationResult = 0) => {
    if (pending.current) return;
    dialog.current?.close(); finish(value);
  };
  const confirm = async () => {
    if (pending.current) return;
    if (repairStatePrefixMatches(state, letter)) { close(1); return; }
    pending.current = true; setBusy(true);
    try {
      // WIN_Mudar_Estado198–202; source supplies no title (ADR-003/U-W20AB1F-04).
      await message({ title: "", text: "Verifique o carater de validação", type: 0 });
    } finally { pending.current = false; setBusy(false); }
  };
  // Source Tab2→3→4; both buttons are Normal, with no edit Enter-to-confirm handler.
  const bindings: WdRadBinding[] = [
    { name: "STC_Titulo", kind: "caption", props: { text: repairStateConfirmationPrompt(state) } },
    { name: "EDT_Letra", kind: "edit", props: { ref: input, value: letter, onChange: event => setLetter(event.currentTarget.value), disabled: busy } },
    { name: "BTN_Confirmar", kind: "button", props: { disabled: busy, onClick: () => void confirm() } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => close() } },
  ];
  return <WdModal ref={dialog} layout={layout} instance="repair-confirmation-frame" testId="WIN_Mudar_Estado" restoreTestId="repair-confirmation-restore" onClose={() => close()}>
    <WdRadControls layout={layout} bindings={bindings} />
  </WdModal>;
}

/** Development-only result demonstration; the actual repair caller is a separate migration slice. */
export default function RepairStateConfirmationWorkflow() {
  const [opened, setOpened] = useState(false), [returned, setReturned] = useState<RepairStateConfirmationResult | null>(null);
  const state = new URLSearchParams(window.location.search).get("state") ?? "Em Reparação";
  return <DialogProvider><main className="workspace-fixture">
    <button data-testid="repair-confirmation-open" onClick={() => { setReturned(null); setOpened(true); }}>WIN_Mudar_Estado</button>
    {opened && <RepairStateConfirmationDialog state={state} finish={value => { setReturned(value); setOpened(false); }} />}
    {returned !== null && <><output data-testid="repair-confirmation-returned">{returned}</output><output data-testid="repair-confirmation-returned-kind">{typeof returned}</output></>}
  </main></DialogProvider>;
}
