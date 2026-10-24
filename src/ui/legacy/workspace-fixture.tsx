import { useState } from "react";
import form from "./WIN_Form_Clientes.layout.json";
import { controlOf } from "./layout";
import { WdButton, WdEdit, WdMemo } from "./wd";
import { WdWorkspace, useWorkspace } from "./workspace";
import { DialogProvider, useDialogs } from "./dialogs";

function FixtureFields() {
  const [text, setText] = useState(""), [memo, setMemo] = useState(""), [result, setResult] = useState("");
  const { message } = useDialogs();
  return <>
    <WdEdit control={controlOf(form, "EDT_Codigo")} value="9007199254740993" readOnly />
    <WdEdit control={controlOf(form, "EDT_Descricao")} value={text} onChange={event => setText(event.target.value)} />
    <WdMemo control={controlOf(form, "EDT_Observacao")} value={memo} onChange={event => setMemo(event.target.value)} />
    <WdButton control={controlOf(form, "BTN_Validar")} onClick={async () => {
      setResult(String(await message({ title: "Teste do espaço de trabalho", text: text || "Teste", type: 3, defaultButton: 3 })));
    }} />
    <WdButton control={controlOf(form, "BTN_Cancelar")} onClick={() => setText("")} />
    <output data-testid="workspace-result" style={{ position: "absolute", left: 180, top: 31, padding: 0 }}>{result}</output>
  </>;
}

function Launcher() {
  const { open } = useWorkspace();
  return <><button data-testid="workspace-open" onClick={() => open({ layout: form, content: <FixtureFields /> })}>
    Abrir instância de teste
  </button>
    <button data-testid="workspace-open-unsaved" onClick={() => open({ layout: { ...form, window: { ...form.window, flags: { ...form.window.flags, "Save position": false } } }, content: <FixtureFields /> })}>Testar sem posição guardada</button>
    <button data-testid="workspace-open-fixed" onClick={() => open({ layout: { ...form, window: { ...form.window, flags: { ...form.window.flags, Resizable: false } } }, content: <FixtureFields /> })}>Testar tamanho fixo</button>
    <button data-testid="workspace-open-no-grip" onClick={() => open({ layout: { ...form, window: { ...form.window, flags: { ...form.window.flags, "With grip": false } } }, content: <FixtureFields /> })}>Testar sem pega</button>
  </>;
}

export default function WorkspaceFixture() {
  return <DialogProvider><main className="workspace-fixture">
    <aside>Teste do espaço de trabalho — instâncias com dados sintéticos, sem consultas ou gravações.</aside>
    <a href="/">Voltar à verificação do ambiente</a>
    <WdWorkspace><Launcher /></WdWorkspace>
  </main></DialogProvider>;
}
