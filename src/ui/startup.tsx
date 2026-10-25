import { useEffect, useRef, useState } from "react";
import { startupLaunchMode, type LaunchMode } from "../../packages/domain/src/startup";
import type { StartupRepository } from "../application/startup";
import type { UserRepository } from "../application/users";
import { isolatedStartupRepository } from "../infrastructure/startup";
import { isolatedUserRepository } from "../infrastructure/users";
import { StartupAccessDialog } from "./startup-access";
import { SystemDialog } from "./system";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace } from "./legacy/workspace";
import { WdButton, WdFrame } from "./legacy/wd";
import { controlOf, type LegacyLayout } from "./legacy/layout";
import sourceMenu from "./legacy/WIN_MENU.layout.json";
import { defaultStartupWindows, type StartupWindowDefinition } from "./startup-windows";
import "./startup.css";

export const menuTitle = "Golfinho Software - Gestão de ordens de reparação oficinas auto.    Versão: 2024.01.000";
export const menuLayout: LegacyLayout = { ...sourceMenu, window: { ...sourceMenu.window, title: menuTitle }, controls: sourceMenu.controls.map(control => control.name === "RADTitle" ? { ...control, caption: menuTitle } : control.name === "BTN_Ordens_reparacao" ? { ...control, caption: "Ordens de reparação" } : control) };
const quick = [ ["BTN_Clientes", "customers"], ["BTN_Viaturas", "vehicles"], ["BTN_Ordens_reparacao", "repair-orders"], ["BTN_Artigos", "articles"], ["BTN_movimentos_stock", "stock-documents"], ["BTN_tempos", "repair-labor"], ["BTN_material", "repair-materials"] ] as const;
const noAdditionalWindows = async () => [];

export function MenuLaunchers({ windows, mode, system, terminate }: { windows: StartupWindowDefinition[]; mode: LaunchMode; system: () => void; terminate: () => void }) {
  const { open } = useWorkspace(), openedModule = useRef(false), actionPending = useRef(false), { message } = useDialogs();
  const [actionBusy, setActionBusy] = useState(false), [actionDiagnostic, setActionDiagnostic] = useState("");
  const [dialog, setDialog] = useState<StartupWindowDefinition | null>(null);
  const launch = async (definition: StartupWindowDefinition) => {
    if (actionPending.current) return;
    if (definition.action) {
      actionPending.current = true; setActionBusy(true); setActionDiagnostic("");
      try { const result = await definition.action(); if (result.kind === "completed" && definition.completedMessage) await message({ type: 0, title: "", text: definition.completedMessage }); else if (result.kind !== "completed") setActionDiagnostic(result.kind); }
      catch { setActionDiagnostic("transport"); }
      finally { actionPending.current = false; setActionBusy(false); }
      return;
    }
    if (definition.renderDialog) { setDialog(definition); return; }
    open({ key: definition.id, layout: definition.layout, content: definition.content, onClose: mode === "labor" || mode === "materials" ? terminate : undefined });
  };
  useEffect(() => {
    if (openedModule.current || (mode !== "labor" && mode !== "materials")) return;
    const definition = windows.find(item => item.id === (mode === "labor" ? "repair-labor" : "repair-materials"));
    if (definition) { openedModule.current = true; open({ key: definition.id, layout: definition.layout, content: definition.content, onClose: terminate }); }
  }, [windows, mode, open, terminate]);
  if (mode === "labor" || mode === "materials") return windows.some(item => item.id === (mode === "labor" ? "repair-labor" : "repair-materials")) ? null : <output data-testid="startup-module-unavailable">Módulo indisponível nesta versão de desenvolvimento.</output>;
  const tab = controlOf(menuLayout, "TAB_NoName1"), group = controlOf(menuLayout, "TAB_NoName1.LAYOUT_NoName1");
  return <><div data-testid="WIN_MENU" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {mode !== "articles" && <nav className="startup-menu-bar" aria-label="Menu principal">
      <details><summary>Menu</summary><div><button disabled={actionBusy} data-testid="OPT_Postos" onClick={() => { const definition = windows.find(item => item.id === "postos"); if (definition) launch(definition); }}>Postos</button><button disabled={actionBusy} data-testid="OPT_Sistema" onClick={system}>Sistema</button><button disabled={actionBusy} data-testid="MENU_OPT_Exit" onClick={terminate}>Sair</button></div></details>
      {([["tables", "Tabelas"], ["movements", "Movimentos"], ["reports", "Mapas"], ["utilities", "Utilitários"]] as const).map(([group, label]) => <details key={group}><summary>{label}</summary><div>{windows.filter(item => item.group === group && item.id !== "postos" && !item.toolbarOnly).map(item => <button key={item.id} disabled={actionBusy} data-testid={item.menuControl ?? `menu-${item.id}`} onClick={() => launch(item)}>{item.label}</button>)}</div></details>)}
    </nav>}
    <div className="startup-quick-bar" data-testid={tab.name} data-control-path={tab.path}
      role="group" aria-label={tab.caption?.replace("&", "")} hidden={tab.visible === false || tab.flags?.Visible === false}
      style={{ top: mode === "articles" ? 27 : tab.y, height: tab.height ?? 79 }}>
      <div data-testid={group.name} data-control-path={group.path} hidden={group.visible === false || group.flags?.Visible === false}
        style={{ position: "absolute", left: group.x - tab.x, top: group.y - tab.y, width: group.width ?? 770, height: group.height ?? 72 }}>
      {quick.filter(([, key]) => mode !== "articles" || key === "articles" || key === "stock-documents").map(([name, key], index) => ({ name, key, index, control: controlOf(menuLayout, name) })).sort((left, right) => Number(left.control.tab_order) - Number(right.control.tab_order)).map(({ name, key, index, control }) => {
        const definition = windows.find(item => item.id === key);
        // Dossier/JPG lays the seven buttons horizontally; the extracted Layout children overlap.
        return <WdButton key={name} control={{ ...control, x: 6 + index * 83 - (group.x - tab.x), y: 6 - (group.y - tab.y) }} disabled={!definition || actionBusy} title={definition ? undefined : "Migração em curso"} onClick={() => { if (definition) launch(definition); }} />;
      })}
      </div>
    </div>
  </div>{dialog?.renderDialog?.(() => setDialog(null))}{actionDiagnostic && <output data-testid="menu-action-diagnostic">{actionDiagnostic}</output>}</>;
}

/** Explicit development shell. Production updater, identity transition and persistent entry remain gates. */
export default function StartupWorkflow({ additionalWindows = noAdditionalWindows }: { additionalWindows?: () => Promise<StartupWindowDefinition[]> }) {
  const [repositories, setRepositories] = useState<{ startup: StartupRepository; users: UserRepository } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const [windows, setWindows] = useState<StartupWindowDefinition[] | null>(null), [access, setAccess] = useState(false), [entered, setEntered] = useState(false), [terminated, setTerminated] = useState(false);
  const [system, setSystem] = useState(false), [bootstrapRequired, setBootstrapRequired] = useState(false), [busy, setBusy] = useState(false);
  const [minimized, setMinimized] = useState(false), [maximized, setMaximized] = useState(true);
  const [extent, setExtent] = useState({ width: window.innerWidth, height: window.innerHeight });
  const active = useRef(true), pending = useRef(false);
  const query = new URLSearchParams(window.location.search), mode = startupLaunchMode({ modulo: query.get("modulo"), artigos: query.get("artigos") });
  useEffect(() => {
    active.current = true;
    void Promise.all([isolatedStartupRepository(), isolatedUserRepository()]).then(([startup, users]) => { if (active.current) setRepositories({ startup, users }); }).catch(() => { if (active.current) setDiagnostic("dev:workflows indisponível"); });
    return () => { active.current = false; };
  }, []);
  useEffect(() => { const resize = () => setExtent({ width: window.innerWidth, height: window.innerHeight }); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, []);
  useEffect(() => {
    if (!entered) return;
    let current = true;
    void Promise.all([defaultStartupWindows(), additionalWindows()]).then(([defaults, extra]) => { if (current) setWindows([...defaults, ...extra]); }).catch(() => { if (current) setDiagnostic("transport"); });
    return () => { current = false; };
  }, [entered, additionalWindows]);
  const begin = async (development: boolean) => {
    if (!repositories || pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try { const result = await repositories.startup.initialise(); if (!active.current) return; if (result.kind === "ready") { setBootstrapRequired(result.bootstrapRequired); if (development) setEntered(true); else setAccess(true); } else setDiagnostic(result.kind); }
    catch { if (active.current) setDiagnostic("transport"); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const terminate = () => { setEntered(false); setAccess(false); setSystem(false); setWindows(null); setTerminated(true); };
  const desktop = <div className={`startup-desktop ${mode === "labor" || mode === "materials" ? "startup-module" : ""}`}><WdWorkspace>{windows ? <MenuLaunchers windows={windows} mode={mode} system={() => setSystem(true)} terminate={terminate} /> : <output>…</output>}</WdWorkspace></div>;
  return <DialogProvider><main className="startup-workflow">
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. Acesso de produção e arranque persistente pendentes.</aside>
    {terminated ? <p data-testid="startup-terminated">Aplicação terminada. <button onClick={() => setTerminated(false)}>Reabrir</button></p> : !entered ? <section className="startup-entry"><h1>Gestão de Oficinas</h1><button data-testid="startup-access-open" disabled={!repositories || busy} onClick={() => void begin(false)}>Acesso</button><button data-testid="startup-development-open" disabled={!repositories || busy} onClick={() => void begin(true)}>Abrir ambiente de desenvolvimento</button>
      {bootstrapRequired && <p data-testid="startup-bootstrap-required">Não existem utilizadores. Crie uma conta em Tabelas → Utilizadores no ambiente de desenvolvimento; a configuração de credenciais de produção está pendente.</p>}
    </section> : mode === "labor" || mode === "materials" ? <div className="startup-module-host">{desktop}</div> : <><div hidden={minimized}><WdFrame layout={menuLayout} instance="startup-menu-frame" width={maximized ? Math.max(800, extent.width - 24) : 800} height={maximized ? Math.max(600, extent.height - 52) : 600} onClose={terminate} onMinimize={() => setMinimized(true)} onToggleMaximize={() => setMaximized(previous => !previous)}>{desktop}</WdFrame></div>{minimized && <button data-testid="startup-menu-restore" onClick={() => setMinimized(false)}>{menuTitle}</button>}</>}
    {repositories && access && <StartupAccessDialog repository={repositories.startup} users={repositories.users} touch={mode === "labor" || mode === "materials"} finish={result => { setAccess(false); if (result === "continuar") setEntered(true); else terminate(); }} />}
    {repositories && system && <SystemDialog repository={repositories.startup} finish={() => setSystem(false)} />}
    {diagnostic && <output role="status" data-testid="startup-diagnostic">{diagnostic}</output>}
  </main></DialogProvider>;
}
