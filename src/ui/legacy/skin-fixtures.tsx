import { useState } from "react";
import form from "./WIN_Form_Clientes.layout.json";
import { controlOf } from "./layout";
import { WdButton, WdEdit, WdFrame } from "./wd";

function FrameFixture({ instance }: { instance: string }) {
  const [closed, close] = useState(false), [minimized, minimize] = useState(false), [maximized, maximize] = useState(false);
  const [text, setText] = useState("");
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
    </WdFrame>}
  </div>;
}

export default function SkinFixtures() {
  return <main className="skin-fixtures">
    <aside>Teste de componentes — não é o formulário de clientes nem verifica os seus comportamentos.</aside>
    <h1>Pele MediaPlayer</h1>
    <a href="/">Voltar à verificação do ambiente</a>
    <FrameFixture instance="A" /><FrameFixture instance="B" />
  </main>;
}
