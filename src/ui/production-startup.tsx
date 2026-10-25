import { useCallback, useEffect, useRef, useState } from "react";
import type { StartupRepository } from "../application/startup";
import type { AuthenticationRepository, AuthenticationStatus } from "../../packages/domain/src/authentication";
import type { UserListRow } from "../../packages/domain/src/users";
import { startupLaunchMode, type LaunchMode } from "../../packages/domain/src/startup";
import { businessAuthenticationRepository, businessStartupRepository, accessUserRepository } from "../infrastructure/authentication";
import { clearBusinessSession, configureBusinessTransport, SESSION_EXPIRED_EVENT } from "../infrastructure/workflow-http";
import { readStartupArguments, terminateApplication } from "../infrastructure/native";
import { additionalWorkshopWindows } from "./workshop-windows";
import { defaultStartupWindows, type StartupWindowDefinition } from "./startup-windows";
import { MenuLaunchers, menuLayout, menuTitle } from "./startup";
import { StartupAccessDialog } from "./startup-access";
import { UserPicker } from "./users";
import { SystemDialog } from "./system";
import { DialogProvider } from "./legacy/dialogs";
import { WdWorkspace } from "./legacy/workspace";
import { WdFrame } from "./legacy/wd";
import "./startup.css";
import { LaunchModeContext } from "./launch-mode";

type Prepared = { authentication: AuthenticationRepository; startup: StartupRepository; status: AuthenticationStatus; mode: LaunchMode };
function Enrollment({ authentication, emptyUsers, accepted, cancel }: { authentication: AuthenticationRepository; emptyUsers: boolean; accepted: (user: UserListRow, expiresAt: string) => void; cancel: () => void }) {
  const [code, setCode] = useState(emptyUsers ? 1 : 0), [description, setDescription] = useState(emptyUsers ? "Administrador" : ""), [token, setToken] = useState(""), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState(""), [picker, setPicker] = useState(false);
  const pending = useRef(false), active = useRef(true), users = accessUserRepository(authentication);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const submit = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try { const result = await authentication.enroll({ code, password, token }); if (!active.current) return; if (result.kind === "continuar") { setToken(""); setPassword(""); accepted(result.user, result.session.expiresAt); } else setDiagnostic(result.kind === "throttled" ? "Demasiadas tentativas. Aguarde um minuto." : result.kind === "unavailable" ? "Código de configuração inválido ou já utilizado." : "Não foi possível definir o acesso. Verifique os campos e tente novamente."); }
    catch { if (active.current) setDiagnostic("Serviço indisponível. Tente novamente."); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  };
  return <section data-testid="authentication-enrollment" className="startup-enrollment"><h2>Definir acesso</h2><p>Use o código de configuração fornecido pelo responsável pelo serviço e escolha uma nova palavra-passe.</p>
    <form onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label>Utilizador <input aria-label="Utilizador de configuração" value={description} readOnly /></label>{!emptyUsers && <button type="button" data-testid="enrollment-user-picker" disabled={busy} onClick={() => setPicker(true)}>Selecionar</button>}
      <label>Código de configuração <input aria-label="Código de configuração" type="password" autoComplete="off" value={token} maxLength={64} disabled={busy} onChange={event => setToken(event.target.value)} /></label>
      <label>Nova palavra-passe <input aria-label="Nova palavra-passe" type="password" autoComplete="new-password" value={password} maxLength={15} disabled={busy} onChange={event => setPassword(event.target.value)} /></label>
      <button data-testid="enrollment-confirm" disabled={busy || !code || !password || token.length !== 64}>Definir acesso</button><button type="button" disabled={busy} onClick={cancel}>Cancelar</button>
    </form>{diagnostic && <output role="status">{diagnostic}</output>}
    {picker && <UserPicker repository={users} origin={code} finish={selected => { setPicker(false); const next = Number(selected); setCode(next); if (next) void authentication.users({}).then(result => { if (active.current && result.kind === "loaded") setDescription(result.users.find(row => row.Codigo === next)?.Descricao ?? ""); }).catch(() => { if (active.current) setDiagnostic("Serviço indisponível. Tente novamente."); }); }} />}
  </section>;
}
export default function ProductionStartup({ native }: { native: boolean }) {
  const [prepared, setPrepared] = useState<Prepared | null>(null), [phase, setPhase] = useState<"loading" | "access" | "setup" | "desktop" | "terminated" | "unavailable">("loading"), [user, setUser] = useState<UserListRow | null>(null), [expiresAt, setExpiresAt] = useState("");
  const [windows, setWindows] = useState<StartupWindowDefinition[] | null>(null), [system, setSystem] = useState(false), [diagnostic, setDiagnostic] = useState(""), [busy, setBusy] = useState(false), [minimized, setMinimized] = useState(false), [maximized, setMaximized] = useState(true), [extent, setExtent] = useState({ width: window.innerWidth, height: window.innerHeight });
  const initial = useRef<Promise<Prepared> | null>(null), active = useRef(true), pending = useRef(false);
  useEffect(() => {
    active.current = true;
    if (!initial.current) initial.current = (async () => {
      configureBusinessTransport(import.meta.env.VITE_WORKSHOP_API_BASE ?? (native ? "http://127.0.0.1:3210" : ""));
      const authentication = businessAuthenticationRepository(), startup = await businessStartupRepository(authentication, setExpiresAt);
      const query = new URLSearchParams(window.location.search), arguments_ = native ? await readStartupArguments() : { modulo: query.get("modulo"), artigos: query.get("artigos") };
      return { authentication, startup, status: await authentication.status(), mode: startupLaunchMode(arguments_) };
    })();
    void initial.current.then(result => { if (!active.current) return; setPrepared(result); setPhase(result.status.kind !== "ready" ? "unavailable" : result.status.setupRequired ? "setup" : "access"); }).catch(() => { if (active.current) setPhase("unavailable"); });
    return () => { active.current = false; };
  }, [native]);
  useEffect(() => { const resize = () => setExtent({ width: window.innerWidth, height: window.innerHeight }); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize); }, []);
  const expire = useCallback(() => { clearBusinessSession(); setWindows(null); setSystem(false); setUser(null); setExpiresAt(""); setPhase("access"); setDiagnostic("A sessão terminou. Volte a indicar o utilizador e a palavra-passe."); }, []);
  useEffect(() => { window.addEventListener(SESSION_EXPIRED_EVENT, expire); return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire); }, [expire]);
  useEffect(() => { if (!expiresAt) return; const timer = window.setTimeout(expire, Math.max(0, Date.parse(expiresAt) - Date.now())); return () => window.clearTimeout(timer); }, [expiresAt, expire]);
  useEffect(() => {
    if (phase !== "desktop" || !prepared) return;
    let current = true;
    void Promise.all([prepared.startup.initialise(), defaultStartupWindows(), additionalWorkshopWindows({ restrictedMaterials: prepared.mode === "labor" || prepared.mode === "materials" })]).then(([result, defaults, additional]) => { if (!current) return; if (result.kind === "ready") setWindows([...defaults, ...additional]); else setDiagnostic("Não foi possível abrir a aplicação. Tente novamente."); }).catch(() => { if (current) setDiagnostic("Serviço indisponível. Tente novamente."); });
    return () => { current = false; };
  }, [phase, prepared]);
  const leave = useCallback(async (terminate: boolean) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try { if (user && prepared) await prepared.authentication.logout(); clearBusinessSession(); setWindows(null); setUser(null); setExpiresAt(""); setSystem(false); setPhase(terminate ? "terminated" : "access"); if (terminate && native) await terminateApplication(); }
    catch { if (active.current) setDiagnostic("Não foi possível terminar a sessão. Tente novamente."); }
    finally { pending.current = false; if (active.current) setBusy(false); }
  }, [native, prepared, user]);
  const terminate = useCallback(() => { void leave(true); }, [leave]);
  const accepted = (selected: UserListRow, expiry?: string) => { setUser(selected); if (expiry) setExpiresAt(expiry); setDiagnostic(""); setPhase("desktop"); };
  const mode = prepared?.mode ?? "menu", module = mode === "labor" || mode === "materials";
  const desktop = <div className={`startup-desktop ${module ? "startup-module" : ""}`}><WdWorkspace>{windows ? <MenuLaunchers windows={windows} mode={mode} system={() => setSystem(true)} terminate={terminate} /> : <output>A abrir…</output>}</WdWorkspace></div>;
  return <LaunchModeContext value={mode === "labor" ? "t" : mode === "materials" ? "m" : null}><DialogProvider><main className="startup-workflow" data-testid="business-startup">
    {phase === "loading" && <p role="status">A ligar ao serviço…</p>}
    {phase === "unavailable" && <section><h1>Gestão de Oficinas</h1><p role="alert">Não foi possível ligar ao serviço configurado.</p><button onClick={() => window.location.reload()}>Tentar novamente</button><button onClick={terminate}>Sair</button></section>}
    {phase === "setup" && prepared && (prepared.status.kind === "ready" && prepared.status.setupAvailable ? <Enrollment authentication={prepared.authentication} emptyUsers={prepared.status.emptyUsers} accepted={accepted} cancel={terminate} /> : <section><h1>Gestão de Oficinas</h1><p role="status">O acesso precisa de ser configurado pelo responsável pelo serviço.</p><button onClick={terminate}>Sair</button></section>)}
    {phase === "access" && prepared && <StartupAccessDialog repository={prepared.startup} users={accessUserRepository(prepared.authentication)} touch={module} finish={(result, selected) => { if (result === "continuar" && selected) accepted(selected); else terminate(); }} />}
    {phase === "desktop" && <><aside className="startup-session"><span data-testid="business-session-user">{user?.Descricao}</span><button data-testid="business-logout" disabled={busy} onClick={() => void leave(false)}>Terminar sessão</button></aside>{module ? <div className="startup-module-host">{desktop}</div> : <><div hidden={minimized}><WdFrame layout={menuLayout} instance="startup-menu-frame" width={maximized ? Math.max(800, extent.width - 24) : 800} height={maximized ? Math.max(600, extent.height - 52) : 600} onClose={terminate} onMinimize={() => setMinimized(true)} onToggleMaximize={() => setMaximized(previous => !previous)}>{desktop}</WdFrame></div>{minimized && <button onClick={() => setMinimized(false)}>{menuTitle}</button>}</>}</>}
    {prepared && system && <SystemDialog repository={prepared.startup} finish={() => setSystem(false)} />}
    {phase === "terminated" && <p data-testid="startup-terminated">Aplicação terminada.</p>}
    {diagnostic && <output data-testid="startup-diagnostic" role="status">{diagnostic}</output>}
  </main></DialogProvider></LaunchModeContext>;
}
