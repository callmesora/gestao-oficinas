import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import "./migration-wizard.css";

type Selection = { kind: "legacy" | "sqlite" | "empty"; name: string; path: string; analysis: string | null };
type Stage = "choose" | "copy" | "convert" | "database" | "done" | "error";
const labels: Record<Exclude<Stage, "choose" | "error">, string> = {
  copy: "Copiar e verificar os dados antigos",
  convert: "Preparar os dados para importação",
  database: "Criar e verificar a nova base de dados",
  done: "Migração concluída",
};

export default function MigrationWizard() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    let updates = 0;
    void listen<string>("migration-progress", event => {
      if (!active || !["copy", "convert", "database", "done", "error"].includes(event.payload)) return;
      updates++;
      const next = event.payload as Stage;
      setStage(next); setBusy(next !== "done" && next !== "error");
      if (next === "error") setError("Não foi possível concluir a preparação. Verifique se o programa antigo está fechado, se o driver HFSQL 28 de 32 bits está instalado e se as portas locais estão livres. Os dados existentes foram preservados.");
    }).then(async unlisten => {
      if (!active) { unlisten(); return; }
      dispose = unlisten;
      const seen = updates;
      const status = await invoke<{ stage: Stage; selection: Selection | null }>("wizard_status");
      if (!active) return;
      setSelection(status.selection);
      if (updates === seen) {
        setStage(status.stage);
        setBusy(status.stage === "copy" || status.stage === "convert" || status.stage === "database");
        if (status.stage === "error") setError("Não foi possível concluir a preparação. Verifique o driver e as portas locais. Os dados existentes foram preservados.");
      }
      setReady(true);
    }).catch(() => { if (active) setError("Não foi possível iniciar a preparação. Feche e abra a aplicação novamente."); });
    return () => { active = false; dispose?.(); };
  }, []);
  const choose = async (kind: Selection["kind"]) => {
    setBusy(true); setError("");
    try { const result = await invoke<Selection | null>("wizard_select", { kind }); if (result) { setSelection(result); setStage("choose"); } }
    catch { setError("Não foi possível selecionar os dados. Tente novamente."); }
    finally { setBusy(false); }
  };
  const start = async () => {
    setBusy(true); setError("");
    try { await invoke("wizard_start"); }
    catch { setBusy(false); setError("Não foi possível iniciar a preparação. Os dados existentes foram preservados."); }
  };
  const running = stage === "copy" || stage === "convert" || stage === "database";
  return <main className="migration-main"><div className="migration-shell">
    <header className="migration-header"><div className="migration-mark" aria-hidden="true">GO</div><div><span className="migration-eyebrow">GESTÃO DE OFICINAS</span><h1>Preparar a aplicação</h1><p>Traga os seus dados antigos para este computador.</p></div></header>
    <div className="migration-steps" aria-label="Etapas"><span className={stage === "choose" || stage === "error" ? "active" : "complete"}>1 <b>Escolher dados</b></span><span className={running ? "active" : stage === "done" ? "complete" : ""}>2 <b>Preparar</b></span><span className={stage === "done" ? "active" : ""}>3 <b>Começar</b></span></div>
    {(stage === "choose" || stage === "error") && <section className="migration-card"><h2>De onde vêm os seus dados?</h2><p>Selecione a pasta do programa antigo. Procuramos os ficheiros necessários por si.</p>
      <div className="migration-choice"><div className="migration-icon" aria-hidden="true">▤</div><div><strong>Programa antigo WINDEV</strong><small>Selecionar a pasta do programa ou dos dados</small></div><button type="button" disabled={!ready || busy} onClick={() => void choose("legacy")}>Escolher pasta</button></div>
      {selection && <div className="migration-selected"><span className="migration-selected-label">SELECIONADO</span><strong>{selection.name}</strong><span className="migration-path">{selection.path || "Sem importação"}</span>{selection.analysis && <small>Análise: {selection.analysis}</small>}</div>}
      <div className="migration-alternatives"><button type="button" disabled={!ready || busy} onClick={() => void choose("sqlite")}>Usar exportação SQLite</button><button type="button" disabled={!ready || busy} onClick={() => void choose("empty")}>Começar sem dados</button></div>
      <div className="migration-note"><strong>Antes de continuar</strong><span>Feche o programa antigo e mantenha uma cópia de segurança. Para WINDEV, é necessário o driver ODBC HFSQL 28 de 32 bits.</span></div>
      {error && <p className="migration-error" role="alert">{error}</p>}
      <footer><button className="migration-secondary" type="button" disabled={busy} onClick={() => void invoke("wizard_cancel")}>Cancelar</button><button className="migration-primary" type="button" disabled={!ready || busy || !selection} onClick={() => void start()}>{selection?.kind === "empty" ? "Criar base de dados" : "Migrar dados"} <span aria-hidden="true">→</span></button></footer></section>}
    {running && <section className="migration-card migration-progress"><div className="migration-spinner" aria-hidden="true" /><h2>A preparar os seus dados</h2><p>Não desligue o computador nem feche a aplicação. Esta operação pode demorar vários minutos.</p><div className="migration-progress-bar" role="progressbar" aria-label="Preparação em curso"><span /></div><div className="migration-current" role="status">{labels[stage]}</div><div className="migration-stage-list">{(selection?.kind === "legacy" ? ["copy", "convert", "database"] as const : ["database"] as const).map((item, index) => <div key={item} className={item === stage ? "current" : ""}><span>{index + 1}</span>{labels[item]}</div>)}</div></section>}
    {stage === "done" && <section className="migration-card migration-success"><div className="migration-check" aria-hidden="true">✓</div><h2>Está tudo preparado</h2><p>A base de dados foi criada e verificada. Pode agora definir o acesso à aplicação.</p><button className="migration-primary" type="button" onClick={() => void invoke("wizard_continue")}>Continuar para a aplicação <span aria-hidden="true">→</span></button></section>}
  </div></main>;
}
