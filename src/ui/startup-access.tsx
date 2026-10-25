import { useEffect, useRef, useState } from "react";
import { userUppercase, type UserListRow } from "../../packages/domain/src/users";
import type { StartupRepository } from "../application/startup";
import type { UserRepository } from "../application/users";
import sourceLayout from "./legacy/WIN_Acesso.layout.json";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { UserPicker } from "./users";
import { AlphaTouchKeyboardDialog } from "./touch-keyboard";
import { useDialogs } from "./legacy/dialogs";

export function StartupAccessDialog({ repository, users, touch = false, finish }: { repository: StartupRepository; users: UserRepository; touch?: boolean; finish: (result: "continuar" | "cancelar", user?: UserListRow) => void }) {
  const dialog = useRef<WdModalHandle>(null), input = useRef<HTMLInputElement>(null), active = useRef(true), pending = useRef(false), focusPending = useRef(false), { message } = useDialogs();
  const [code, setCode] = useState(0), [description, setDescription] = useState(""), [password, setPassword] = useState("");
  const [picker, setPicker] = useState(false), [keyboard, setKeyboard] = useState(false), [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  useEffect(() => { active.current = true; input.current?.focus(); return () => { active.current = false; }; }, []);
  useEffect(() => { if (focusPending.current && !busy && !picker && !keyboard) { focusPending.current = false; input.current?.focus(); } }, [busy, picker, keyboard]);
  const close = (result: "continuar" | "cancelar", user?: UserListRow) => { if (pending.current) return; dialog.current?.close(); setPassword(""); finish(result, user); };
  const confirm = async () => {
    if (pending.current || picker || keyboard) return;
    const submitted = userUppercase(password); setPassword(submitted); pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const result = await repository.access({ code, password: submitted }); if (!active.current) return;
      if (result.kind === "continuar") { pending.current = false; close("continuar", result.user); }
      else if (result.kind === "incorrect") await message({ type: 0, title: "", text: result.message });
      else if (result.kind !== "missing") setDiagnostic(result.kind === "resetRequired" ? "A conta precisa de uma nova palavra-passe. Contacte o responsável pela configuração." : result.kind === "throttled" ? "Demasiadas tentativas. Aguarde um minuto e tente novamente." : result.kind === "unavailable" ? "Acesso indisponível." : result.kind);
    } catch { if (active.current) setDiagnostic("transport"); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const bindings: WdRadBinding[] = [
    { name: "STC_NoName1", kind: "caption" }, { name: "STC_NoName2", kind: "caption" },
    { name: "EDT_utilizador", kind: "edit", props: { value: description, readOnly: true, "aria-label": "Utilizador" } },
    { name: "EDT_palavra_passe", kind: "edit", props: { ref: input, value: password, passwordReveal: true, disabled: busy, "aria-label": "Palavra-passe", onChange: event => setPassword(event.target.value), onPointerDown: () => { if (touch && !busy) setKeyboard(true); } } },
    { name: "BTN_NoName1", kind: "button", props: { disabled: busy, onClick: () => setPicker(true) } },
    { name: "BTN_Confirmar", kind: "button", props: { disabled: busy, onClick: () => void confirm() } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => close("cancelar") } },
  ];
  return <WdModal ref={dialog} layout={sourceLayout} instance="startup-access-frame" testId="WIN_Acesso" restoreTestId="startup-access-restore" onClose={() => close("cancelar")} onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void confirm(); } }}>
    <WdRadControls layout={sourceLayout} bindings={bindings} />
    {picker && <UserPicker repository={users} origin={code} finish={selected => {
      setPicker(false); const next = typeof selected === "number" ? selected : Number(selected); setCode(next);
      if (next !== 0) { focusPending.current = true; pending.current = true; setBusy(true); void users.list({}).then(result => { if (!active.current) return; if (result.kind === "loaded") { const found = result.users.find(user => user.Codigo === next); if (found) setDescription(found.Descricao ?? ""); } else setDiagnostic(result.kind); }).catch(() => { if (active.current) setDiagnostic("transport"); }).finally(() => { pending.current = false; if (active.current) { setBusy(false); } }); }
    }} />}
    {keyboard && <AlphaTouchKeyboardDialog options={{ title: "Palavra Passe", value: password, inputMask: "0", maxLength: 15, password: true }} finish={value => { setPassword(value); setKeyboard(false); input.current?.focus(); }} />}
    {diagnostic && <output data-testid="startup-access-diagnostic">{diagnostic}</output>}
  </WdModal>;
}
