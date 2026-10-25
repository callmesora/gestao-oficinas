import { useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import { repairMaterialEditMessage, type RepairMaterialLine, type RepairMaterialProof, type RepairMaterialsDocument, type RepairMaterialsMechanic, type RepairMaterialsOrder } from "../../packages/domain/src/repair-materials";
import { dateTimeEntryDisplay } from "../../packages/domain/src/date-time";
import type { RepairMaterialsRepository } from "../application/repair-materials";
import type { ArticleRepository } from "../application/articles";
import type { MechanicRepository } from "../application/mechanics";
import { isolatedRepairMaterialsRepository } from "../infrastructure/repair-materials";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import sourceListLayout from "./legacy/WIN_Material_Reparacao.layout.json";
import sourceFormLayout from "./legacy/WIN_Material_reparacao_form.layout.json";
import { controlBox, controlOf, type LegacyLayout } from "./legacy/layout";
import { anchoredControl, FrameDeltaContext } from "./legacy/anchors";
import { WdCheckMark } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { decimalMaskDisplay, decimalMaskOf, decimalMaskValue } from "./legacy/decimal-entry";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { ArticlePicker } from "./articles";
import { MechanicPicker } from "./mechanics";
import { RepairMaterialPrompt, type RepairMaterialPromptMode } from "./repair-materials-prompt";

const corrected = (layout: LegacyLayout): LegacyLayout => ({ ...layout, window: { ...layout.window, title: "Materiais de Reparação" }, controls: layout.controls.map(control => ({ ...control,
  ...(control.name === "RADTitle" ? { caption: "Materiais de Reparação" } : control.name === "BTN_Descricao" ? { caption: "Descrição" } : {}),
  ...(control.columns ? { columns: control.columns.map(column => column.name === "COL_Lancado" ? { ...column, title: "Lançado" } : column) } : {}) })) });
const formLayout = corrected(sourceFormLayout), listLayout = corrected(sourceListLayout);
const materialTable = controlOf(formLayout, "TABLE_material"), orderTable = controlOf(listLayout, "TABLE_ordens_reparacao");
const quantityMask = decimalMaskOf(controlOf(formLayout, "EDT_quant").input_mask)!, displayMask = decimalMaskOf("9999999999,999")!;
const sourceRowHeight = Number(materialTable.table_options?.row_height ?? "30") + 1;
type DraftLine = RepairMaterialLine & { key: string };
type Prompt = { mode: RepairMaterialPromptMode; value: string | null; resolve: (value: string | null) => void };

// SysDateTime is read once when Add is accepted; no timezone conversion touches imported dates.
function workstationDateTime() {
  const date = new Date(), pad = (value: number, digits = 2) => String(value).padStart(digits, "0");
  return `${pad(date.getFullYear(), 4)}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`;
}
const linePayload = ({ id, data_hora, mecanico, artigo, descricao_artigo, quantidade, preco, lancado }: RepairMaterialLine) => ({ id, data_hora, mecanico, artigo, descricao_artigo, quantidade, preco, lancado });
function materialDateDisplay(value: string | null) {
  const minute = dateTimeEntryDisplay(value);
  if (value === null || !/^[0-9]{2}\/[0-9]{2}\/[0-9]{4} [0-9]{2}:[0-9]{2}$/.test(minute)) return minute;
  // Dossier column mask JJ/MM/AAAA HH:mm:SS; preserve raw seconds instead of the minute editor projection.
  const seconds = /^[0-9]{14}(?:[0-9]{3})?$/.test(value) ? value.slice(12, 14) : value.slice(17, 19);
  return `${minute}:${seconds}`;
}

function MaterialEditor({ repository, document, articleRepository, mechanicRepository, finish, saveRef }: {
  repository: RepairMaterialsRepository; document: RepairMaterialsDocument; articleRepository?: ArticleRepository; mechanicRepository?: MechanicRepository;
  finish: () => void; saveRef: { current: (() => void) | null };
}) {
  const [rows, setRows] = useState<DraftLine[]>(() => document.rows.map(row => ({ ...row, key: `stored:${row.id}` })));
  const [selected, setSelected] = useState<string | null>(null), [article, setArticle] = useState(""), [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(() => decimalMaskDisplay(quantityMask, "1")), [actor, setActor] = useState<RepairMaterialsMechanic | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null), [picker, setPicker] = useState<"article" | "mechanic" | null>(null);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), alive = useRef(true), counter = useRef(0), proofs = useRef<RepairMaterialProof[]>([]), input = useRef<HTMLInputElement>(null);
  const articleDraft = useRef(""), descriptionDraft = useRef(""), lookupPending = useRef<Promise<void> | null>(null), lookupOwner = useRef(0);
  const setArticleValue = (value: string) => { articleDraft.current = value; setArticle(value); };
  const setDescriptionValue = (value: string) => { descriptionDraft.current = value; setDescription(value); };
  const latestPrompt = useRef<Prompt | null>(null), { message, resource } = useDialogs();
  const settings = useTableLayout(materialTable, "WIN_Material_reparacao_form/TABLE_material"), delta = useContext(FrameDeltaContext);
  useEffect(() => { alive.current = true; return () => { alive.current = false; const current = latestPrompt.current; current?.resolve(current.value); }; }, []);
  const info = (text: string) => message({ title: "Materiais de Reparação", text, type: 0 });
  const ask = (mode: RepairMaterialPromptMode, value: string | null) => new Promise<string | null>(resolve => { const request = { mode, value, resolve }; latestPrompt.current = request; setPrompt(request); });
  const run = async (work: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try { await work(); } catch { if (alive.current) setDiagnostic("transport"); }
    finally { if (alive.current) { pending.current = false; setBusy(false); } }
  };
  const authenticate = async (code: number | null): Promise<RepairMaterialsMechanic | null> => {
    // Source inactive check precedes opening the password dialog.
    const check = await repository.authenticate({ code, password: "" });
    if (!alive.current) return null;
    if (check.kind === "inactive") { await info("Mecânico inativo"); return null; }
    if (check.kind !== "cancelled") { setDiagnostic(check.kind); return null; }
    const password = await ask("password", "");
    if (!alive.current || password === null || password === "") return null;
    const result = await repository.authenticate({ code, password });
    if (!alive.current) return null;
    if (result.kind === "incorrect") { await info("Palavra-passe incorreta"); return null; }
    if (result.kind === "inactive") { await info("Mecânico inativo"); return null; }
    if (result.kind !== "authenticated") { setDiagnostic(result.kind); return null; }
    proofs.current = [...proofs.current.filter(value => value.code !== code), { code, password }];
    setActor(result.mechanic); return result.mechanic;
  };
  const reset = () => { lookupOwner.current++; setArticleValue(""); setDescriptionValue(""); setQuantity(decimalMaskDisplay(quantityMask, "1")); };
  const verifyArticle = async (value: string, barcodeFirst: boolean) => {
    if (value === "") return;
    const owner = ++lookupOwner.current, result = await repository.article({ value, barcodeFirst });
    if (!alive.current || owner !== lookupOwner.current || articleDraft.current !== value) return;
    if (result.kind === "loaded") { setArticleValue(result.article.Codigo ?? ""); setDescriptionValue(result.article.Descricao ?? ""); }
    else if (result.kind === "missing") { await info("Artigo não existente"); if (alive.current && owner === lookupOwner.current) { setArticleValue(""); setDescriptionValue(""); } }
    else setDiagnostic(result.kind);
  };
  const add = () => run(async () => {
    await lookupPending.current;
    const code = articleDraft.current, descriptionValue = descriptionDraft.current;
    if (code === "") return;
    const amount = decimalMaskValue(quantityMask, quantity);
    if (amount === undefined) { input.current?.focus(); return; }
    const mechanic = actor ?? await authenticate(document.mechanic?.Codigo ?? null);
    if (!alive.current || !mechanic) return;
    // Source784–790 re-reads price on Add; a prior lookup is never the price authority.
    const found = await repository.article({ value: code, barcodeFirst: false });
    if (!alive.current) return;
    if (found.kind !== "loaded") { setDiagnostic(found.kind); return; }
    const key = `new:${++counter.current}`;
    setRows(current => [...current, { key, id: null, data_hora: workstationDateTime(), mecanico: mechanic.Codigo, mechanicDescription: mechanic.Descricao,
      artigo: code, descricao_artigo: descriptionValue, quantidade: amount, preco: found.article.preco, lancado: false }]);
    setSelected(key); reset(); input.current?.focus();
  });
  const save = () => run(async () => {
    const result = await repository.save({ orderId: document.orderId, numero: document.numero, baseline: document.baseline, state: document.state,
      rows: rows.map(linePayload), proofs: proofs.current });
    if (!alive.current) return;
    if (result.kind === "saved") { proofs.current = []; finish(); }
    else if (result.kind === "inUse") await info("Ordem de reparação em uso por outro utilizador");
    else if (result.kind === "inactive") await info("Mecânico inativo");
    else if (result.kind === "incorrect") await info("Palavra-passe incorreta");
    else setDiagnostic(result.kind);
  });
  useEffect(() => { saveRef.current = () => { void save(); }; return () => { saveRef.current = null; }; });
  const current = rows.find(row => row.key === selected);
  const edit = (mode: "quantidade" | "preco" | "descricao") => run(async () => {
    if (!current) return;
    const blocked = repairMaterialEditMessage(current.lancado);
    if (blocked) { await info(blocked); return; }
    const field = mode === "descricao" ? "descricao_artigo" : mode;
    const value = await ask(mode, current[field]);
    if (alive.current) setRows(previous => previous.map(row => row.key === current.key ? { ...row, [field]: value, lancado: false } : row));
  });
  const remove = () => run(async () => {
    if (!current) return;
    const blocked = repairMaterialEditMessage(current.lancado, true);
    if (blocked) { await info(blocked); return; }
    const answer = await resource({ title: "Materiais de Reparação", text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }],
      defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
    if (alive.current && answer.result === 1) { setRows(previous => previous.filter(row => row.key !== current.key)); setSelected(null); }
  });
  const move = (direction: -1 | 1) => { const index = rows.findIndex(row => row.key === selected), next = index + direction; if (!pending.current && index >= 0 && next >= 0 && next < rows.length) setSelected(rows[next].key); };
  const bindings: WdRadBinding[] = [
    ...["STC_Viatura", "STC_Mecanico", "STC_Artigo", "STC_Quant"].map(name => ({ name, kind: "caption" as const })),
    { name: "EDT_matricula", kind: "edit", props: { value: document.matricula ?? "", readOnly: true } },
    { name: "EDT_marca_modelo", kind: "edit", props: { value: document.marcamodelo ?? "", readOnly: true } },
    { name: "EDT_mecanico", kind: "edit", props: { value: (actor ?? document.mechanic)?.Descricao ?? "", readOnly: true } },
    { name: "EDT_quant", kind: "edit", props: { value: quantity, decimalMask: true, disabled: busy, onChange: event => setQuantity(event.currentTarget.value) } },
    { name: "EDT_artigo", kind: "edit", props: { ref: input, value: article, disabled: busy, onChange: event => { lookupOwner.current++; setArticleValue(event.currentTarget.value); }, onBlur: event => { if (!pending.current) lookupPending.current = verifyArticle(event.currentTarget.value, true).catch(() => { if (alive.current) setDiagnostic("transport"); }); } } },
    { name: "EDT_artigo_descricao", kind: "edit", props: { value: description, disabled: busy, onChange: event => setDescriptionValue(event.currentTarget.value) } },
    { name: "BTN_Adicionar", kind: "button", props: { disabled: busy, onClick: () => void add() } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: reset } },
    { name: "BTN_Sair", kind: "button", props: { disabled: busy, onClick: () => void save() } },
    { name: "BTN_Quantidade", kind: "button", props: { disabled: busy, onClick: () => void edit("quantidade") } },
    { name: "BTN_Preço", kind: "button", props: { disabled: busy, onClick: () => void edit("preco") } },
    { name: "BTN_Descricao", kind: "button", props: { disabled: busy, onClick: () => void edit("descricao") } },
    { name: "BTN_Eliminar", kind: "button", props: { disabled: busy, onClick: () => void remove() } },
    { name: "BTN_anterior", kind: "button", props: { disabled: busy, onClick: () => move(-1) } },
    { name: "BTN_seguinte", kind: "button", props: { disabled: busy, onClick: () => move(1) } },
    { name: "BTN_NoName1", kind: "button", props: { disabled: busy || !mechanicRepository, onClick: () => setPicker("mechanic") } },
    { name: "BTN_NoName2", kind: "button", props: { disabled: busy || !articleRepository, onClick: () => setPicker("article") } },
    { name: "BTN_Leitor", kind: "button", props: { disabled: true, title: "MIG-9: leitor de códigos de barras" } },
  ];
  return <>
    <WdRadControls layout={formLayout} bindings={bindings} />
    <WdTable control={materialTable} rows={rows} rowId={row => row.key} selectedId={selected} onSelect={key => { if (!pending.current) setSelected(key); }} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      rowHeight={sourceRowHeight * (600 + delta.height) / 600}
      cell={(row, column) => column.name === "COL_data_hora" ? materialDateDisplay(row.data_hora) : column.name === "COL_mecanico_codigo" ? row.mecanico ?? "" : column.name === "COL_mecanico_descricao" ? row.mechanicDescription ?? "" :
        column.name === "COL_codigo_artigo" ? row.artigo ?? "" : column.name === "COL_descricao_artigo" ? row.descricao_artigo ?? "" : column.name === "COL_quant" ? decimalMaskDisplay(displayMask, row.quantidade) : column.name === "COL_preco" ? decimalMaskDisplay(displayMask, row.preco) : column.name === "COL_Lancado" ? <WdCheckMark checked={row.lancado} /> : ""} />
    {prompt && <RepairMaterialPrompt mode={prompt.mode} value={prompt.value} finish={value => { latestPrompt.current = null; setPrompt(null); prompt.resolve(value); }} />}
    {picker === "article" && articleRepository && <ArticlePicker repository={articleRepository} origin={article} finish={value => { setPicker(null); if (value !== "") { setArticleValue(value); void run(() => verifyArticle(value, false)); } }} />}
    {picker === "mechanic" && mechanicRepository && <MechanicPicker repository={mechanicRepository} origin="" finish={value => { setPicker(null); if (value !== "") void run(async () => { const code = typeof value === "number" ? value : Number(value); if (actor?.Codigo === code) return; await authenticate(code); }); }} />}
    {diagnostic && <output data-testid="repair-material-form-diagnostic">{diagnostic}</output>}
  </>;
}

export function RepairMaterialsDialog({ repository, orderId, numero, articleRepository, mechanicRepository, finish }: {
  repository: RepairMaterialsRepository; orderId?: string; numero?: string; articleRepository?: ArticleRepository; mechanicRepository?: MechanicRepository; finish: (saved: boolean) => void;
}) {
  const modal = useRef<WdModalHandle>(null), save = useRef<(() => void) | null>(null);
  const [document, setDocument] = useState<RepairMaterialsDocument | null>(null), [diagnostic, setDiagnostic] = useState("");
  useEffect(() => { let active = true;
    void repository.read(orderId ? { orderId } : { numero: numero ?? "" }).then(result => { if (!active) return; if (result.kind === "loaded") setDocument(result.document); else setDiagnostic(result.kind); }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, orderId, numero]);
  return <WdModal ref={modal} layout={formLayout} instance="repair-material-form-frame" testId="WIN_Material_reparacao_form" restoreTestId="repair-material-form-restore"
    onClose={() => { if (document) save.current?.(); else { modal.current?.close(); finish(false); } }}
    onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); } }}>
    {document && <MaterialEditor repository={repository} document={document} articleRepository={articleRepository} mechanicRepository={mechanicRepository} saveRef={save} finish={() => { modal.current?.close(); finish(true); }} />}
    {diagnostic && <output data-testid="repair-material-form-load-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

function MaterialsList({ repository, articleRepository, mechanicRepository, restricted }: {
  repository: RepairMaterialsRepository; articleRepository: ArticleRepository; mechanicRepository: MechanicRepository; restricted: boolean;
}) {
  const close = useWorkspaceClose(), { message } = useDialogs(), delta = useContext(FrameDeltaContext);
  const [orders, setOrders] = useState<RepairMaterialsOrder[]>([]), [mechanics, setMechanics] = useState<RepairMaterialsMechanic[]>([]);
  const [mechanic, setMechanic] = useState<number | null | undefined>(undefined), [selected, setSelected] = useState<string | null>(null), [form, setForm] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(""), [tick, setTick] = useState(0), pending = useRef(false);
  const [timer, setTimer] = useState<string | null | undefined>(undefined), reading = useRef(false), timerMessage = useRef(message);
  useEffect(() => { timerMessage.current = message; }, [message]);
  const selectedNumber = useRef<string | null>(null), listSettings = useTableLayout(orderTable, "WIN_Material_Reparacao/TABLE_ordens_reparacao");
  useEffect(() => { let active = true; reading.current = true;
    void repository.list({ restricted, ...(mechanic === undefined ? {} : { mechanic }) }).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setOrders(result.orders); setMechanics(result.mechanics); setTimer(result.timer); setDiagnostic("");
      // Source refresh seeks the prior business key after selecting the last row. Unknown initial selection stays U02.
      setSelected(previous => result.orders.find(row => row.id === previous)?.id ?? (selectedNumber.current !== null ? result.orders.find(row => row.numero === selectedNumber.current)?.id ?? result.orders.at(-1)?.id ?? null : null));
    }).catch(() => { if (active) setDiagnostic("transport"); }).finally(() => { if (active) reading.current = false; });
    return () => { active = false; };
  }, [repository, restricted, mechanic, tick]);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>, active = true;
    const schedule = (remaining: bigint, duration: bigint) => { const chunk = remaining > 2147483647n ? 2147483647n : remaining;
      timeout = setTimeout(() => { if (!active) return; if (remaining > chunk) schedule(remaining - chunk, duration); else { if (!pending.current && !reading.current) setTick(value => value + 1); schedule(duration, duration); } }, Number(chunk)); };
    if (timer !== undefined) {
      if (timer !== null && /^[0-9]+$/.test(timer) && BigInt(timer) > 0n) { const duration = BigInt(timer) * 1000n; schedule(duration, duration); }
      else void timerMessage.current({ title: "Materiais de Reparação", text: "Erro ao criar timer de atualização", type: 1 });
    }
    return () => { active = false; clearTimeout(timeout); };
  }, [timer]);
  const open = async () => {
    const current = orders.find(row => row.id === selected);
    if (!current || pending.current) return;
    pending.current = true;
    try {
      const result = await repository.list({ restricted, ...(mechanic === undefined ? {} : { mechanic }) });
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setOrders(result.orders);
      const available = result.orders.find(row => row.numero === current.numero);
      if (!available) { await message({ title: "Materiais de Reparação", text: "A ordem já não está disponível", type: 0 }); return; }
      setSelected(available.id); setForm(available.orderId);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; }
  };
  const move = (step: -1 | 1) => { const index = orders.findIndex(row => row.id === selected), next = index + step; if (!pending.current && index >= 0 && next >= 0 && next < orders.length) { setSelected(orders[next].id); selectedNumber.current = orders[next].numero; } };
  const moveMechanic = (step: -1 | 1) => { const index = mechanics.findIndex(value => value.Codigo === mechanic), next = index + step; if (index >= 0 && next >= 0 && next < mechanics.length) setMechanic(mechanics[next].Codigo); };
  const mechanicControl = anchoredControl(controlOf(listLayout, "LIST_mecanicos"), delta);
  const bindings: WdRadBinding[] = [
    { name: "STC_Ordens_de_Reparacao", kind: "caption", props: { text: "Ordens de Reparação" } },
    { name: "STC_filtro_atual", kind: "caption", props: { text: mechanic === undefined ? "Todos" : mechanics.find(value => value.Codigo === mechanic)?.Descricao ?? "" } },
    { name: "BTN_todos", kind: "button", props: { onClick: () => setMechanic(undefined) } },
    { name: "BTN_Material", kind: "button", props: { onClick: () => void open() } },
    { name: "BTN_anterior", kind: "button", props: { onClick: () => move(-1) } },
    { name: "BTN_seguinte", kind: "button", props: { onClick: () => move(1) } },
    { name: "BTN_anterior1", kind: "button", props: { onClick: () => moveMechanic(-1) } },
    { name: "BTN_seguinte1", kind: "button", props: { onClick: () => moveMechanic(1) } },
    { name: "BTN_Fechar", kind: "button", props: { onClick: close } },
  ];
  return <>
    <WdRadControls layout={listLayout} bindings={bindings} />
    <select data-testid="LIST_mecanicos" size={15} aria-label="Mecânicos" value={mechanic === undefined ? "none" : String(mechanic)}
      style={controlBox(mechanicControl)} onChange={event => setMechanic(event.currentTarget.value === "null" ? null : Number(event.currentTarget.value))}>
      {mechanics.map((value, index) => <option key={`${value.Codigo}:${index}`} value={String(value.Codigo)}>{value.Descricao ?? ""}</option>)}
    </select>
    <WdTable control={orderTable} rows={orders} rowId={row => row.id} selectedId={selected} onSelect={id => { const row = orders.find(value => value.id === id); setSelected(id); selectedNumber.current = row?.numero ?? null; }} onActivate={() => void open()} {...listSettings} configureColumns designerOptions onResetColumns={listSettings.resetLayout}
      cell={(row, column) => column.name === "COL_Numero" ? row.numero ?? "" : column.name === "COL_Matricula" ? <span style={{ fontSize: 12, fontWeight: "bold" }}>{row.matricula ?? ""}</span> : column.name === "COL_Marca_Modelo" ? row.marcamodelo ?? "" : ""} />
    {form && <RepairMaterialsDialog repository={repository} orderId={form} articleRepository={articleRepository} mechanicRepository={mechanicRepository} finish={() => { setForm(null); setTick(value => value + 1); }} />}
    {diagnostic && <output data-testid="repair-materials-list-diagnostic">{diagnostic}</output>}
  </>;
}

function MaterialsLauncher(props: { repository: RepairMaterialsRepository; articleRepository: ArticleRepository; mechanicRepository: MechanicRepository; restricted: boolean }) {
  const { open } = useWorkspace();
  return <button data-testid="repair-materials-open" onClick={() => open({ layout: listLayout, content: <MaterialsList {...props} /> })}>Materiais de Reparação</button>;
}
export default function RepairMaterialsWorkflow() {
  const [repositories, setRepositories] = useState<{ repository: RepairMaterialsRepository; articleRepository: ArticleRepository; mechanicRepository: MechanicRepository } | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void Promise.all([isolatedRepairMaterialsRepository(), isolatedArticleRepository(), isolatedMechanicRepository()]).then(([repository, articleRepository, mechanicRepository]) => { if (active) setRepositories({ repository, articleRepository, mechanicRepository }); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": "600px" } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repositories && <MaterialsLauncher {...repositories} restricted={new URLSearchParams(window.location.search).get("restricted") === "1"} />}</WdWorkspace>
  </main></DialogProvider>;
}
