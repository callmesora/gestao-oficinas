import { useState } from "react";
import form from "./WIN_Form_Clientes.layout.json";
import list from "./WIN_Table_Clientes.layout.json";
import { controlOf } from "./layout";
import { WdButton, WdEdit, WdFrame, WdMemo } from "./wd";
import { WdTable } from "./table";
import { DialogProvider, useDialogs } from "./dialogs";

function MessageFixture() {
  const { message } = useDialogs();
  const [result, setResult] = useState("");
  return <div data-testid="skin-message-fixture">
    <p>Mensagens — retorno de teste, sem operação de negócio.</p>
    <button data-testid="skin-message-open" onClick={async () => {
      setResult("a aguardar");
      const value = await message({ title: "Teste", text: "  Açores\nSegunda linha  ", type: 5, defaultButton: 2 });
      setResult(String(value));
    }}>Testar OK/Cancelar</button>
    <button data-testid="skin-message-queue" onClick={() => {
      setResult("a aguardar");
      const first = message({ title: "Primeiro", text: "Primeiro", type: 0 });
      const second = message({ title: "Segundo", text: "Segundo", type: 3, defaultButton: 3 });
      void Promise.all([first, second]).then(values => setResult(values.join(",")));
    }}>Testar sequência</button>
    <output data-testid="skin-message-result">{result}</output>
  </div>;
}

const fixtureRows = [
  { id: "9007199254740993", code: "9007199254740993", description: "  Açores  " },
  { id: "9007199254740994", code: "9007199254740994", description: "Oficina" },
];

function TableFixture() {
  const [rows, setRows] = useState(fixtureRows);
  const [selectedId, select] = useState<string | null>(null);
  const [activated, activate] = useState("");
  const [sorted, sort] = useState("");
  return <div data-testid="skin-table-fixture">
    <p>Tabela isolada — linhas sintéticas, sem consulta ou gravação.</p>
    <button data-testid="skin-empty" onClick={() => { setRows([]); select(null); }}>Esvaziar</button>
    <button data-testid="skin-reverse" onClick={() => setRows(value => [...value].reverse())}>Inverter linhas de teste</button>
    <output data-testid="skin-selection">{selectedId ?? ""}</output>
    <output data-testid="skin-activation">{activated}</output>
    <output data-testid="skin-sort">{sorted}</output>
    <div className="wd-component-canvas" data-testid="skin-table-canvas" style={{ width: list.window.size.width, height: list.window.size.height }}>
      <WdTable control={controlOf(list, "TABLE_Clientes")} rows={rows} rowId={row => row.id} selectedId={selectedId}
        onSelect={select} onActivate={activate} onSort={column => sort(column.path)}
        cell={(row, column) => column.name === "COL_Codigo" ? row.code : column.name === "COL_Descricao" ? row.description : ""} />
      <WdMemo control={controlOf(list, "EDT_Observacao")} value="" />
    </div>
  </div>;
}

function FrameFixture({ instance }: { instance: string }) {
  const [closed, close] = useState(false), [minimized, minimize] = useState(false), [maximized, maximize] = useState(false);
  const [text, setText] = useState("");
  const [memo, setMemo] = useState("");
  const [disabled, disable] = useState(false);
  const [clicks, clicked] = useState(0);
  return <div data-testid={`skin-fixture-${instance}`}>
    <p>Instância {instance} — componentes isolados, sem gravação.</p>
    <button data-testid="skin-reopen" onClick={() => { close(false); minimize(false); }}>Mostrar</button>
    <label><input data-testid="skin-disable" type="checkbox" checked={disabled} onChange={event => disable(event.target.checked)} />Desativar botão de teste</label>
    <output data-testid="skin-clicks">{clicks}</output>
    {!closed && !minimized && <WdFrame layout={form} instance={`skin-frame-${instance}`} width={maximized ? 640 : undefined}
      height={maximized ? 480 : undefined} onClose={() => close(true)} onMinimize={() => minimize(true)} onToggleMaximize={() => maximize(value => !value)}>
      <WdButton control={controlOf(form, "BTN_Validar")} disabled={disabled} onClick={() => clicked(value => value + 1)} />
      <WdButton control={controlOf(form, "BTN_Cancelar")} onClick={() => setText("")} />
      <WdEdit control={controlOf(form, "EDT_Codigo")} value="18446744073709551615" readOnly />
      <WdEdit control={controlOf(form, "EDT_Descricao")} value={text} onChange={event => setText(event.target.value)} />
      <WdMemo control={controlOf(form, "EDT_Observacao")} value={memo} onChange={event => setMemo(event.target.value)} />
    </WdFrame>}
  </div>;
}

export default function SkinFixtures() {
  return <DialogProvider><main className="skin-fixtures">
    <aside>Teste de componentes — não é o formulário de clientes nem verifica os seus comportamentos.</aside>
    <h1>Pele MediaPlayer</h1>
    <a href="/">Voltar à verificação do ambiente</a>
    <FrameFixture instance="A" /><FrameFixture instance="B" /><TableFixture /><MessageFixture />
  </main></DialogProvider>;
}
