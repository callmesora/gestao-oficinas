import { useState } from "react";
import { readNativeInfo } from "./infrastructure/native";
import type { NativeInfo } from "./bindings/native";
import "./App.css";
import SkinFixtures from "./ui/legacy/skin-fixtures";
import WorkspaceFixture from "./ui/legacy/workspace-fixture";

export default function App({ preview }: { preview: boolean }) {
  const [info, setInfo] = useState<NativeInfo | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function inspect() {
    if (pending) return;
    setPending(true); setFailed(false); setInfo(null);
    try { setInfo(await readNativeInfo()); } catch { setFailed(true); }
    finally { setPending(false); }
  }
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("skin") === "controls") return <SkinFixtures />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("skin") === "workspace") return <WorkspaceFixture />;
  return <main>
    {preview && <aside role="status" data-testid="foundation-preview">Browser preview — dados simulados; não verifica o ambiente nativo.</aside>}
    <h1>Gestão de Oficinas</h1>
    <p>Preparação do ambiente. Funcionalidades da aplicação ainda não migradas.</p>
    {import.meta.env.DEV && <p><a data-testid="skin-launcher" href="/?skin=controls">Testar componentes da pele</a></p>}
    {import.meta.env.DEV && <p><a data-testid="workspace-launcher" href="/?skin=workspace">Testar espaço de trabalho</a></p>}
    <button data-testid="foundation-inspect" aria-disabled={pending} aria-busy={pending} onClick={() => void inspect()}>Verificar ambiente</button>
    {pending && <p role="status">A verificar…</p>}
    {failed && <p role="alert">Não foi possível verificar o ambiente. Tente novamente.</p>}
    {info && <output data-testid="foundation-info">{info.appVersion} · {info.platform}</output>}
  </main>;
}
