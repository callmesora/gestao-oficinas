import { useRef, useState } from "react";
import form from "./WIN_Form_Clientes.layout.json";
import list from "./WIN_Table_Clientes.layout.json";
import mechanics from "./WIN_Form_mecanicos.layout.json";
import { controlOf } from "./layout";
import { FrameDeltaContext } from "./anchors";
import { useTableLayout } from "./table-layout";
import { WdButton, WdEdit, WdFrame, WdMemo } from "./wd";
import { WdTable } from "./table";
import { DialogProvider, useDialogs } from "./dialogs";
import { WdModal, type WdModalHandle } from "./modal";
import type { ResourceInput } from "./resource-state";

function MessageFixture() {
  const { message, resource } = useDialogs();
  const [result, setResult] = useState("");
  const [resourceIcon, setResourceIcon] = useState("32");
  const [typedInput, setTypedInput] = useState("numeric");
  const typedInputs: Record<string, ResourceInput> = {
    numeric: { kind: "text", inputType: "numeric", value: "9007199254740993.125", inputMask: "+99999999999999999999,999", calculator: true },
    wideNumeric: { kind: "text", inputType: "numeric", value: "9".repeat(96) + ".125", inputMask: "+99999999999999999999,999", calculator: true },
    currency: { kind: "text", inputType: "currency", value: "12.50", inputMask: "+999 999 999,99", calculator: true },
    date: { kind: "text", inputType: "date", value: "20261025", inputMask: "DD/MM/YYYY", returnFormat: "AAAAMMJJ" },
    time: { kind: "text", inputType: "time", value: "23595812", inputMask: "HH:mm:SS,CC", returnFormat: "HHmmSSCC" },
    null: { kind: "text", inputType: "numeric", value: null, inputMask: "+999,99" },
    raw: { kind: "text", inputType: "date", value: "original opaque", returnFormat: "unknown" },
    checkboxNull: { kind: "checkbox", value: null, label: "Opção" },
  };
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
    <label>Entrada de teste <select data-testid="skin-resource-type" value={typedInput} onChange={event => setTypedInput(event.currentTarget.value)}>
      {Object.keys(typedInputs).map(value => <option key={value}>{value}</option>)}
    </select></label>
    <button data-testid="skin-resource-typed" onClick={async () => {
      const value = await resource({ title: "Entrada tipada", text: "Valor de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: typedInputs[typedInput] });
      setResult(JSON.stringify(value));
    }}>Testar entrada tipada</button>
    <button data-testid="skin-message-long" onClick={async () => {
      setResult(String(await message({ title: "Texto longo", text: "Linha de teste com acentos: Açores. ".repeat(90), type: 0 })));
    }}>Testar mensagem longa</button>
    <button data-testid="skin-resource-long" onClick={async () => {
      const value = await resource({ title: "Recurso", text: "Botões de teste", buttons: [{ label: "Aceitar este texto de teste mais comprido" }, { label: "Cancelar" }], defaultIndex: 1, cancelIndex: 2 });
      setResult(JSON.stringify(value));
    }}>Testar botão longo</button>
    <button data-testid="skin-resource-long-text" onClick={async () => {
      const value = await resource({ title: "Texto e entrada", text: "Texto longo com acentos: Açores. ".repeat(30),
        buttons: [{ label: "Aceitar" }, { label: "Cancelar" }], defaultIndex: 1, cancelIndex: 2,
        input: { kind: "text", value: "Um\r\nDois\r\nTrês\r\nQuatro\r\nCinco\r\nSeis" } });
      setResult(JSON.stringify(value));
    }}>Testar recurso longo</button>
    <button data-testid="skin-resource-open" onClick={async () => {
      const value = await resource({ title: "Recurso", text: "Valor de teste", buttons: [{ label: "Aceitar", value: 11 }, { label: "Cancelar", value: 27 }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "  original  " }, icon: { flags: Number(resourceIcon), image: resourceIcon === "0" ? "note.png" : undefined } });
      setResult(JSON.stringify(value));
    }}>Testar recurso</button>
    <label>Ícone de teste <select data-testid="skin-resource-icon" value={resourceIcon} onChange={event => setResourceIcon(event.target.value)}>
      <option value="32">Pergunta</option><option value="48">Erro da origem</option><option value="64">Informação</option><option value="0">Imagem do projeto</option>
    </select></label>
    <button data-testid="skin-resource-mnemonic" onClick={async () => {
      const value = await resource({ title: "Teclado", text: "Texto de teste", buttons: [{ label: "&Validar", value: 11 }, { label: "&Cancelar", value: 27 }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "original" } });
      setResult(JSON.stringify(value));
    }}>Testar letras no diálogo</button>
    <button data-testid="skin-resource-input-flags" onClick={async () => {
      const value = await resource({ title: "Entrada de teste", text: "Texto de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "  original  ", maxLength: 15, password: true, automaticErase: true } });
      setResult(JSON.stringify(value));
    }}>Testar propriedades de entrada</button>
    <button data-testid="skin-resource-sized" onClick={async () => {
      const value = await resource({ title: "Entrada limitada", text: "Texto de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "ABC", maxLength: 5, adaptWidth: true } });
      setResult(JSON.stringify(value));
    }}>Testar largura limitada</button>
    <button data-testid="skin-resource-wide" onClick={async () => {
      const value = await resource({ title: "Entrada larga", text: "Texto de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "W".repeat(55) + "\r\nFim" } });
      setResult(JSON.stringify(value));
    }}>Testar largura multilinha</button>
    <button data-testid="skin-resource-checkbox" onClick={async () => {
      const value = await resource({ title: "Opção", text: "Opção de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "checkbox", value: false, label: "Opção" } });
      setResult(JSON.stringify(value));
    }}>Testar opção</button>
    <button data-testid="skin-resource-multiline" onClick={async () => {
      const value = await resource({ title: "Texto", text: "Texto de teste", buttons: [{ label: "Aceitar" }, { label: "Cancelar" }],
        defaultIndex: 1, cancelIndex: 2, input: { kind: "text", value: "A\r\nB" } });
      setResult(JSON.stringify(value));
    }}>Testar texto</button>
  </div>;
}

/** Target-only fixture exercises native dialog focus primitives without API replacements. */
function FocusFixture() {
  const [open, setOpen] = useState(false), [nested, setNested] = useState(false), [visible, setVisible] = useState(false);
  const ref = useRef<WdModalHandle>(null), child = useRef<WdModalHandle>(null);
  return <div>
    <button data-testid="focus-open" onClick={() => setOpen(true)}>Testar foco modal</button>
    {open && <WdModal ref={ref} layout={form} instance="focus-frame" testId="focus-dialog" restoreTestId="focus-restore"
      onClose={() => { ref.current?.close(); setOpen(false); }}>
      <div style={{ position: "absolute", left: 24, top: 50, display: "grid", gap: 10 }}>
        <input data-testid="focus-third" tabIndex={3} aria-label="Terceiro" />
        <input data-testid="focus-first" tabIndex={1} aria-label="Primeiro" />
        <input data-testid="focus-disabled" disabled aria-label="Desativado" />
        <label><input data-testid="focus-radio-a" type="radio" name="focus-choice" />A</label>
        <label><input data-testid="focus-radio-b" type="radio" name="focus-choice" defaultChecked />B</label>
        <div inert><button>Inerte</button></div>
        <button data-testid="focus-nested-open" onClick={() => setNested(true)}>Abrir diálogo</button>
        <button data-testid="focus-last" onClick={() => { ref.current?.close(); setOpen(false); }}>Fechar</button>
        <WdButton control={{ ...controlOf(form, "BTN_Validar"), name: "focus-runtime-visible", path: "target/focus-runtime-visible", x: 0, y: 220, visible,
          flags: { ...controlOf(form, "BTN_Validar").flags, Visible: false } }} onClick={() => setVisible(false)} />
        <button data-testid="focus-show-runtime" onClick={() => setVisible(true)}>Mostrar controlo</button>
      </div>
      {nested && <WdModal ref={child} layout={form} instance="focus-child-frame" testId="focus-child" restoreTestId="focus-child-restore"
        onClose={() => { child.current?.close(); setNested(false); }}>
        <button data-testid="focus-child-close" style={{ position: "absolute", left: 24, top: 80 }} onClick={() => { child.current?.close(); setNested(false); }}>Fechar</button>
      </WdModal>}
    </WdModal>}
  </div>;
}

const fixtureRows = [
  { id: "9007199254740993", code: "9007199254740993", description: "  Açores  " },
  { id: "9007199254740994", code: "9007199254740994", description: "Oficina" },
];

function TableFixture() {
  const [rows, setRows] = useState(fixtureRows);
  const baseTable = controlOf(list, "TABLE_Clientes");
  const tableControl = { ...baseTable, flags: { ...baseTable.flags, ...(new URLSearchParams(window.location.search).get("columns") === "unsaved" ? { "Saves col. config.": false } : {}) } };
  const { columnWidths, columnOrder, onColumnWidthsChange: setColumnWidths, onColumnOrderChange: setColumnOrder, resetLayout } = useTableLayout(tableControl, `${list.window.name}/${baseTable.path}`);
  const [locked, setLocked] = useState(false);
  const [movement, setMovement] = useState("free");
  const [resized, setResized] = useState(false);
  const [selectedId, select] = useState<string | null>(null);
  const [activated, activate] = useState("");
  const [sorted, sort] = useState("");
  return <div data-testid="skin-table-fixture">
    <p>Tabela isolada — linhas sintéticas, sem consulta ou gravação.</p>
    <label><input data-testid="skin-table-resize" type="checkbox" checked={resized} onChange={event => setResized(event.target.checked)} />Testar ancoragem da tabela</label>
    <button data-testid="skin-empty" onClick={() => { setRows([]); select(null); }}>Esvaziar</button>
    <button data-testid="skin-reverse" onClick={() => setRows(value => [...value].reverse())}>Inverter linhas de teste</button>
    <label><input data-testid="skin-column-lock" type="checkbox" checked={locked} onChange={event => setLocked(event.target.checked)} />Bloquear largura de teste</label>
    <a data-testid="skin-column-unsaved" href="/?skin=controls&columns=unsaved">Testar sem configuração guardada</a>
    <button data-testid="skin-column-layout-reset" onClick={resetLayout}>Repor configuração de teste</button>
    <button data-testid="skin-column-reset" onClick={() => setColumnWidths({})}>Repor larguras de teste</button>
    <label>Movimento de teste <select data-testid="skin-column-movement" value={movement} onChange={event => setMovement(event.target.value)}><option value="free">Livre</option><option value="fixed">Fixa à esquerda</option><option value="locked">Imóvel</option></select></label>
    <button data-testid="skin-column-order-reset" onClick={() => setColumnOrder([])}>Repor ordem de teste</button>
    <output data-testid="skin-column-order">{JSON.stringify(columnOrder)}</output>
    <output data-testid="skin-column-widths">{JSON.stringify(columnWidths)}</output>
    <output data-testid="skin-selection">{selectedId ?? ""}</output>
    <output data-testid="skin-activation">{activated}</output>
    <output data-testid="skin-sort">{sorted}</output>
    <div className="wd-component-canvas" data-testid="skin-table-canvas" style={{ width: list.window.size.width + (resized ? 120 : 0), height: list.window.size.height + (resized ? 60 : 0) }}>
      <FrameDeltaContext.Provider value={{ width: resized ? 120 : 0, height: resized ? 60 : 0 }}>
      <WdTable control={{ ...tableControl, columns: tableControl.columns!.map((column, index) => index === 0 ? { ...column, flags: { ...column.flags, ...(locked ? { "Adjustable width": false } : {}), ...(movement === "fixed" ? { "Fixed left": true } : {}), ...(movement === "locked" ? { Movable: false } : {}) } } : column) }} rows={rows} rowId={row => row.id} selectedId={selectedId}
        onSelect={select} onActivate={activate} onSort={column => sort(column.path)} columnWidths={columnWidths} onColumnWidthsChange={setColumnWidths} columnOrder={columnOrder} onColumnOrderChange={setColumnOrder}
        cell={(row, column) => column.name === "COL_Codigo" ? row.code : column.name === "COL_Descricao" ? row.description : ""} />
      <WdMemo control={controlOf(list, "EDT_Observacao")} value="" />
      </FrameDeltaContext.Provider>
    </div>
  </div>;
}

function InputFixture() {
  const [value, setValue] = useState("teste"), [automatic, setAutomatic] = useState(true), [override, setOverride] = useState(false);
  const [focusCount, focused] = useState(0);
  return <div data-testid="skin-input-fixture">
    <p>Propriedades de entrada — valores sintéticos, sem autenticação.</p>
    <label><input data-testid="skin-input-auto-erase" type="checkbox" checked={automatic} onChange={event => setAutomatic(event.target.checked)} />Seleção de entrada de teste</label>
    <label><input data-testid="skin-input-selection-override" type="checkbox" checked={override} onChange={event => setOverride(event.target.checked)} />Seleção explícita de teste</label>
    <button data-testid="skin-input-oversized" onClick={() => setValue("X".repeat(20))}>Carregar valor longo de teste</button>
    <output data-testid="skin-input-focus-callback">{focusCount}</output>
    <button data-testid="skin-input-before">Antes da entrada</button>
    <div className="wd-component-canvas" style={{ width: 500, height: 150 }}>
      <WdEdit control={{ ...controlOf(form, "EDT_Codigo"), name: "skin-input-no-tab", path: "skin-input-no-tab", tab_order: -1,
        flags: { ...controlOf(form, "EDT_Codigo").flags, "TAB Key": false } }} value="9007199254740993" readOnly />
      <WdEdit control={controlOf(mechanics, "EDT_Palavra_passe")} value={value} automaticErase={automatic} onChange={event => setValue(event.target.value)}
        onFocus={event => { focused(count => count + 1); if (override) event.currentTarget.setSelectionRange(1, 3); }} />
    </div>
    <button data-testid="skin-input-after">Depois da entrada</button>
  </div>;
}

function FrameFixture({ instance }: { instance: string }) {
  const [closed, close] = useState(false), [minimized, minimize] = useState(false), [maximized, maximize] = useState(false);
  const [text, setText] = useState("");
  const [memo, setMemo] = useState("");
  const [disabled, disable] = useState(false);
  const [clicks, clicked] = useState(0);
  const [mnemonics, setMnemonics] = useState(false), [duplicate, setDuplicate] = useState(false);
  return <div data-testid={`skin-fixture-${instance}`}>
    <p>Instância {instance} — componentes isolados, sem gravação.</p>
    <button data-testid="skin-reopen" onClick={() => { close(false); minimize(false); }}>Mostrar</button>
    <label><input data-testid="skin-disable" type="checkbox" checked={disabled} onChange={event => disable(event.target.checked)} />Desativar botão de teste</label>
    <label><input data-testid="skin-mnemonics" type="checkbox" checked={mnemonics} onChange={event => setMnemonics(event.target.checked)} />Testar letras de chamada</label>
    <label><input data-testid="skin-mnemonic-duplicate" type="checkbox" checked={duplicate} onChange={event => setDuplicate(event.target.checked)} />Testar letra duplicada</label>
    <output data-testid="skin-clicks">{clicks}</output>
    {!closed && !minimized && <WdFrame layout={form} instance={`skin-frame-${instance}`} width={maximized ? 640 : undefined}
      height={maximized ? 480 : undefined} onClose={() => close(true)} onMinimize={() => minimize(true)} onToggleMaximize={() => maximize(value => !value)}>
      <WdButton control={{ ...controlOf(form, "BTN_Validar"), ...(mnemonics ? { caption: "&Validar && manter" } : {}) }} disabled={disabled} onClick={() => clicked(value => value + 1)} />
      {mnemonics && <WdButton control={{ ...controlOf(form, "BTN_Validar"), name: "skin-mnemonic-hidden", caption: "&Validar", visible: false }} onClick={() => clicked(value => value + 100)} />}
      {mnemonics && <WdButton interpretAmpersand={false} control={{ ...controlOf(form, "BTN_Validar"), name: "skin-mnemonic-literal", caption: "&Validar" }} style={{ top: 350 }} onClick={() => clicked(value => value + 1000)} />}
      {mnemonics && duplicate && <WdButton control={{ ...controlOf(form, "BTN_Validar"), name: "skin-mnemonic-other", caption: "&Validar" }} style={{ top: 400 }} onClick={() => clicked(value => value + 10)} />}
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
    <FrameFixture instance="A" /><FrameFixture instance="B" /><TableFixture /><MessageFixture /><InputFixture /><FocusFixture />
  </main></DialogProvider>;
}
