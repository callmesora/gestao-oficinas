import { useRef, useState } from "react";
import sourceLayout from "./legacy/WIN_Inserir_quantidade_password.layout.json";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { decimalMaskDisplay, decimalMaskOf, decimalMaskValue } from "./legacy/decimal-entry";

export type RepairMaterialPromptMode = "quantidade" | "preco" | "password" | "descricao";

/** Source383–414/267–274. Encoded close is proposed A-d61aa1; cancel retains the initial result. */
export function RepairMaterialPrompt({ mode, value, finish }: {
  mode: RepairMaterialPromptMode; value: string | null; finish: (value: string | null) => void;
}) {
  const numeric = mode === "quantidade" || mode === "preco";
  const inputMask = mode === "preco" ? "9999999999,99" : "999999,999", mask = decimalMaskOf(inputMask)!;
  const title = { quantidade: "Alterar quantidade", preco: "Alterar preço", password: "Inserir palavra-passe", descricao: "Alterar descrição" }[mode];
  const name = numeric ? "EDT_quantidade" : mode === "password" ? "EDT_password" : "EDT_descricao";
  const caption = { quantidade: "Quantidade", preco: "Preç", password: "Palavra-passe", descricao: "Descrição" }[mode];
  const layout = { ...sourceLayout, window: { ...sourceLayout.window, title, size: { ...sourceLayout.window.size, width: sourceLayout.window.size.width + (mode === "descricao" ? 200 : 0) } },
    controls: sourceLayout.controls.map(control => control.name === name ? { ...control, visible: true, caption, ...(numeric ? { input_mask: inputMask } : {}),
      ...(mode === "descricao" ? { width: control.width! + 200 } : {}) } : control.name === "RADTitle" ? { ...control, caption: title } : control.name === "BTN_Cancelar" && mode === "descricao" ? { ...control, x: control.x! + 200 } : control) };
  const modal = useRef<WdModalHandle>(null), input = useRef<HTMLInputElement>(null), edited = useRef(false);
  const [draft, setDraft] = useState(() => mode === "password" ? "" : numeric ? decimalMaskDisplay(mask, value) : value ?? "");
  const [invalid, setInvalid] = useState(false);
  const close = (result: string | null) => { modal.current?.close(); finish(result); };
  const confirm = () => {
    // ADR-002: untouched NULL/precision stays distinct from an accepted edit.
    const result = !edited.current && mode !== "password" ? value : numeric ? decimalMaskValue(mask, draft) : draft;
    if (result === undefined) { setInvalid(true); input.current?.focus(); return; }
    close(result);
  };
  const bindings: WdRadBinding[] = [
    { name, kind: "edit", props: { ref: input, value: draft, decimalMask: numeric, "aria-invalid": invalid, onChange: event => { edited.current = true; setInvalid(false); setDraft(event.currentTarget.value); } } },
    { name: "BTN_Confirmar", kind: "button", props: { onClick: confirm } },
    { name: "BTN_Cancelar", kind: "button", props: { onClick: () => close(value) } },
  ];
  return <WdModal ref={modal} layout={layout} instance={`repair-material-${mode}-prompt`} testId="WIN_Inserir_quantidade_password" restoreTestId="repair-material-prompt-restore"
    onClose={() => close(value)} onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); confirm(); } }}>
    <WdRadControls layout={layout} bindings={bindings} />
    {/* UNRESOLVED U-W7DB208-02: separate source touch keyboards remain an owning workflow. */}
  </WdModal>;
}
