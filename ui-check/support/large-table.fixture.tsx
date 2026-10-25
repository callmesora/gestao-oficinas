import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { WdTable } from "../../src/ui/legacy/table";
import { FrameDeltaContext } from "../../src/ui/legacy/anchors";
import { controlOf, type LegacyColumn, type LegacyLayout } from "../../src/ui/legacy/layout";
import { useTableLayout } from "../../src/ui/legacy/table-layout";
import { WdWorkspace, useWorkspace } from "../../src/ui/legacy/workspace";
import articles from "../../src/ui/legacy/WIN_Table_artigos.layout.json";
import customers from "../../src/ui/legacy/WIN_Table_Clientes.layout.json";
import orders from "../../src/ui/legacy/WIN_Ordens_Reparacao.layout.json";

const definitions = {
  articles: { layout: articles, table: "TABLE_artigos", count: 15558, height: undefined },
  customers: { layout: customers, table: "TABLE_Clientes", count: 2165, height: undefined },
  orders: { layout: orders, table: "TABLE_QRY_select_ordens_reparacao", count: 15000, height: 30 },
};
type Family = keyof typeof definitions;
type Entry = { id: string; number: number; description: string };
const parameters = new URLSearchParams(location.search);

function LargeTable({ family, workspace = false }: { family: Family; workspace?: boolean }) {
  const definition = definitions[family], layout = definition.layout as LegacyLayout;
  const control = controlOf(layout, definition.table);
  const [allRows] = useState<Entry[]>(() => Array.from({ length: definition.count }, (_, index) => ({
    id: String(9007199254740993n + BigInt(index)), number: index + 1,
    description: `  ${family} ${String(index + 1).padStart(5, "0")} ação d'Água  `,
  })));
  const initialLimit = parameters.get("count");
  const [rows, setRows] = useState(() => initialLimit === "500" || initialLimit === "501" ? allRows.slice(0, Number(initialLimit)) : allRows);
  const [selectedId, onSelect] = useState<string | null>(() => parameters.get("selected") === "last" ? rows.at(-1)?.id ?? null : null), [activated, setActivated] = useState("");
  const [sort, setSort] = useState(""), [search, setSearch] = useState("");
  const [snapshot, setSnapshot] = useState(""), [expanded, setExpanded] = useState(false), [headers, setHeaders] = useState(true);
  const [rowScale, setRowScale] = useState("source");
  const settings = useTableLayout(control, `large-table-fixture/${family}`);
  const value = (row: Entry, column: LegacyColumn) => column.name === "COL_Codigo" || column.name === "COL_Numero" ? String(row.number)
    : column.name === "COL_Descricao" || column.name === "COL_Cliente" ? row.description : `${column.name} ${row.number}`;
  const actions = <div style={workspace ? { position: "absolute", left: 14, top: 30, width: 760 } : undefined}>
      <button data-testid="select-last" onClick={() => onSelect(rows.at(-1)?.id ?? null)}>Selecionar último</button>
      <button data-testid="reverse" onClick={() => setRows(previous => [...previous].reverse())}>Inverter</button>
      <button data-testid="limit-500" onClick={() => setRows(allRows.slice(0, 500))}>500</button>
      <button data-testid="limit-501" onClick={() => setRows(allRows.slice(0, 501))}>501</button>
      <button data-testid="all" onClick={() => setRows(allRows)}>Todos</button>
      <button data-testid="resize" onClick={() => setExpanded(previous => !previous)}>Redimensionar</button>
      <button data-testid="headers" onClick={() => setHeaders(previous => !previous)}>Cabeçalhos</button>
      <select aria-label="Altura das linhas" value={rowScale} onChange={event => setRowScale(event.target.value)}>
        <option value="source">Origem</option><option value="31">31</option><option value="material">31 × 680/600</option>
      </select>
      <button data-testid="snapshot" onClick={() => setSnapshot(JSON.stringify({ count: rows.length, first: rows[0]?.id, last: rows.at(-1)?.id, selectedId }))}>Snapshot</button>
    </div>;
  const outputs = <div style={workspace ? { position: "absolute", left: 14, top: 88 } : undefined}>
    <output data-testid="selection">{selectedId}</output>
    <output data-testid="activation">{activated}</output>
    <output data-testid="sort">{sort}</output>
    <output data-testid="search">{search}</output>
    <output data-testid="snapshot-result">{snapshot}</output>
    </div>;
  const table = <WdTable control={control} rows={rows} rowId={row => row.id} cell={value} selectedId={selectedId} onSelect={onSelect}
          onActivate={setActivated} rowHeight={rowScale === "31" ? 31 : rowScale === "material" ? 31 * (680 / 600) : definition.height} showHeaders={headers} designerOptions configureColumns
          {...settings} onResetColumns={settings.resetLayout}
          onSort={column => { setSort(column.path); setRows(previous => [...previous].reverse()); }}
          onColumnSearch={(column, term) => {
            setSearch(JSON.stringify({ column: column.path, term }));
            if (term) onSelect(rows.find(row => value(row, column).trimStart().startsWith(term))?.id ?? null);
          }} />;
  if (workspace) return <section data-testid={`large-${family}`}>{actions}{outputs}{table}</section>;
  return <section data-testid={`large-${family}`}>
    <h1>{family}</h1>{actions}{outputs}
    <div style={{ position: "relative", background: "#eef3fa", width: layout.window.size!.width + (expanded ? 120 : 0), height: layout.window.size!.height + (expanded ? 80 : 0) }}>
      <FrameDeltaContext value={{ width: expanded ? 120 : 0, height: expanded ? 80 : 0 }}>
        {table}
      </FrameDeltaContext>
    </div>
  </section>;
}

function WorkspaceLauncher() {
  const { open } = useWorkspace();
  return <button data-testid="large-workspace-open" onClick={() => open({ layout: articles, content: <LargeTable family="articles" workspace /> })}>Abrir artigos</button>;
}

const requested = parameters.get("family") ?? "articles";
const families = requested === "all" ? Object.keys(definitions) as Family[] : [requested as Family];
if (families.some(family => !Object.hasOwn(definitions, family))) throw new Error("Unknown synthetic table family");
createRoot(document.getElementById("root")!).render(<StrictMode>{parameters.get("workspace") === "1"
  ? <><style>{".wd-workspace-canvas{height:700px}"}</style><WdWorkspace><WorkspaceLauncher /></WdWorkspace></>
  : families.map(family => <LargeTable family={family} key={family} />)}</StrictMode>);
