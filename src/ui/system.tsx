import { useEffect, useRef, useState } from "react";
import { systemValuesSchema, type SystemValues } from "../../packages/domain/src/startup";
import type { StartupRepository } from "../application/startup";
import sourceLayout from "./legacy/WIN_sistema.layout.json";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import type { LegacyLayout } from "./legacy/layout";

const captions: Record<string, string> = { EDT_Atualizacao_ordens_reparacao: "Atualização ordens de reparação (segundos)", EDT_Atualizacao_materiais: "Atualização materiais (segundos)", EDT_Atualizacao_tempos: "Atualização tempos (segundos)", EDT_Data_inicio: "Mostrar movimentos até dias anteriores" };
const layout: LegacyLayout = { ...sourceLayout, controls: sourceLayout.controls.map(control => captions[control.name] ? { ...control, caption: captions[control.name] } : control) };
const fields = { EDT_Atualizacao_ordens_reparacao: "Tempo_ordem_reparacao", EDT_Atualizacao_materiais: "Tempo_materiais", EDT_Atualizacao_tempos: "Tempo_tempos", EDT_Data_inicio: "Data_inicio", EDT_encerrar_tempos_1: "encerrar_tempos1", EDT_encerrar_tempos_2: "encerrar_tempos2" } as const;
type Field = keyof typeof fields;
const blank: SystemValues = { Tempo_ordem_reparacao: "0", Tempo_materiais: "0", Tempo_tempos: "0", Data_inicio: 0, encerrar_tempos1: "", encerrar_tempos2: "" };
function displayTime(value: string | null): string { return value && /^\d{6}$/.test(value) ? `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}` : value ?? ""; }
export function SystemDialog({ repository, finish }: { repository: StartupRepository; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), active = useRef(true), pending = useRef(false);
  const [initial, setInitial] = useState<SystemValues | null>(null), [draft, setDraft] = useState<Partial<Record<Field, string>>>({}), [diagnostic, setDiagnostic] = useState("");
  const [busy, setBusy] = useState(false), [invalid, setInvalid] = useState<Field | null>(null);
  useEffect(() => { active.current = true; void repository.readSystem().then(result => { if (!active.current) return; if (result.kind === "loaded") setInitial(result.system ? Object.fromEntries(Object.keys(blank).map(key => [key, result.system![key as keyof SystemValues]])) as SystemValues : blank); else setDiagnostic(result.kind); }).catch(() => { if (active.current) setDiagnostic("transport"); }); return () => { active.current = false; }; }, [repository]);
  const close = (saved = false) => { if (pending.current) return; dialog.current?.close(); finish(saved); };
  const save = async () => {
    if (!initial || pending.current) return;
    const values = { ...initial };
    for (const [name, key] of Object.entries(fields) as [Field, keyof SystemValues][]) {
      const text = draft[name]; if (text === undefined) continue;
      let value: string | number = text;
      if (key === "Data_inicio") { if (!/^-?\d+$/.test(text)) { setInvalid(name); return; } value = Number(text); }
      else if (key.startsWith("encerrar_tempos")) {
        if (text !== "" && !/^(?:[01]\d|2[0-3]):?[0-5]\d:?[0-5]\d$/.test(text)) { setInvalid(name); return; }
        value = text.replaceAll(":", "");
      }
      Object.assign(values, { [key]: value });
      if (!systemValuesSchema.shape[key].safeParse(value).success) { setInvalid(name); return; }
    }
    pending.current = true; setBusy(true); setDiagnostic("");
    try { const result = await repository.saveSystem(values); if (!active.current) return; if (result.kind === "saved") { pending.current = false; close(true); } else setDiagnostic(result.kind); }
    catch { if (active.current) setDiagnostic("transport"); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const editBindings: WdRadBinding[] = (Object.entries(fields) as [Field, keyof SystemValues][]).map(([name, key]) => ({ name, kind: "edit", props: {
    integerMask: !key.startsWith("encerrar_tempos"), value: draft[name] ?? (key.startsWith("encerrar_tempos") ? displayTime(initial?.[key] as string | null) : String(initial?.[key] ?? "")), disabled: !initial || busy, "aria-invalid": invalid === name,
    onChange: event => { setDraft(previous => ({ ...previous, [name]: event.target.value })); setInvalid(null); },
  } }));
  const bindings: WdRadBinding[] = [...editBindings, { name: "STC_Encerrar_tempos_automaticamente_a", kind: "caption" }, { name: "STC_E", kind: "caption" }, { name: "BTN_Guardar", kind: "button", props: { disabled: !initial || busy, onClick: () => void save() } }, { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => close() } }];
  return <WdModal ref={dialog} layout={layout} instance="system-frame" testId="WIN_sistema" restoreTestId="system-restore" onClose={() => close()}><WdRadControls layout={layout} bindings={bindings} />{diagnostic && <output data-testid="system-diagnostic">{diagnostic}</output>}</WdModal>;
}
