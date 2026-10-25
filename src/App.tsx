import { useState } from "react";
import { readNativeInfo } from "./infrastructure/native";
import type { NativeInfo } from "./bindings/native";
import "./App.css";
import SkinFixtures from "./ui/legacy/skin-fixtures";
import WorkspaceFixture from "./ui/legacy/workspace-fixture";
import CustomersWorkflow from "./ui/customers";
import VehiclesWorkflow from "./ui/vehicles";
import DescriptiveStatesWorkflow from "./ui/descriptive-states";
import TerminalsWorkflow from "./ui/terminals";
import UnitsWorkflow from "./ui/units";
import PostosWorkflow from "./ui/postos";
import MechanicsWorkflow from "./ui/mechanics";
import RepairStatesWorkflow from "./ui/repair-states";
import DocumentTypesWorkflow from "./ui/document-types";
import ArticlesWorkflow from "./ui/articles";
import UsersWorkflow from "./ui/users";

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
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "customers") return <CustomersWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "vehicles") return <VehiclesWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "units") return <UnitsWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "descriptive-states") return <DescriptiveStatesWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "terminals") return <TerminalsWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "postos") return <PostosWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "mechanics") return <MechanicsWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "repair-states") return <RepairStatesWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "document-types") return <DocumentTypesWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "articles") return <ArticlesWorkflow />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("workflow") === "users") return <UsersWorkflow />;
  return <main>
    {preview && <aside role="status" data-testid="foundation-preview">Browser preview — dados simulados; não verifica o ambiente nativo.</aside>}
    <h1>Gestão de Oficinas</h1>
    <p>Preparação do ambiente. Funcionalidades da aplicação ainda não migradas.</p>
    {import.meta.env.DEV && <p><a data-testid="skin-launcher" href="/?skin=controls">Testar componentes da pele</a></p>}
    {import.meta.env.DEV && <p><a data-testid="workspace-launcher" href="/?skin=workspace">Testar espaço de trabalho</a></p>}
    {import.meta.env.DEV && <p><a data-testid="customers-launcher" href="/?workflow=customers">Clientes</a></p>}
    {import.meta.env.DEV && <p><a data-testid="vehicles-launcher" href="/?workflow=vehicles">Viaturas</a></p>}
    {import.meta.env.DEV && <p><a data-testid="units-launcher" href="/?workflow=units">Unidades</a></p>}
    {import.meta.env.DEV && <p><a data-testid="descriptive-states-launcher" href="/?workflow=descriptive-states">Estados descritivos</a></p>}
    {import.meta.env.DEV && <p><a data-testid="terminals-launcher" href="/?workflow=terminals">Terminais</a></p>}
    {import.meta.env.DEV && <p><a data-testid="postos-launcher" href="/?workflow=postos">Postos</a></p>}
    {import.meta.env.DEV && <p><a data-testid="mechanics-launcher" href="/?workflow=mechanics">Mecânicos</a></p>}
    {import.meta.env.DEV && <p><a data-testid="repair-states-launcher" href="/?workflow=repair-states">Estados de Reparação</a></p>}
    {import.meta.env.DEV && <p><a data-testid="document-types-launcher" href="/?workflow=document-types">Documentos</a></p>}
    {import.meta.env.DEV && <p><a data-testid="articles-launcher" href="/?workflow=articles">Artigos</a></p>}
    {import.meta.env.DEV && <p><a data-testid="users-launcher" href="/?workflow=users">Utilizadores</a></p>}
    <button data-testid="foundation-inspect" aria-disabled={pending} aria-busy={pending} onClick={() => void inspect()}>Verificar ambiente</button>
    {pending && <p role="status">A verificar…</p>}
    {failed && <p role="alert">Não foi possível verificar o ambiente. Tente novamente.</p>}
    {info && <output data-testid="foundation-info">{info.appVersion} · {info.platform}</output>}
  </main>;
}
