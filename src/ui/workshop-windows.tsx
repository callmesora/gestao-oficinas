import { isolatedStartupUtilityRepository } from "../infrastructure/startup-utilities";
import menuSource from "./legacy/WIN_MENU.layout.json";
import { useState, type ReactNode } from "react";
import type { FamilyReportRequest, ReportContext } from "../../packages/domain/src/reports";
import type { MaterialReportMode, LaborReportMode, SalesReportMode } from "../../packages/domain/src/report-filters";
import type { StockRepository } from "../application/stock";
import { isolatedRepairLaborRepository } from "../infrastructure/repair-labor";
import { isolatedRepairMaterialsRepository } from "../infrastructure/repair-materials";
import { isolatedStockRepository } from "../infrastructure/stock";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { isolatedDocumentTypeRepository } from "../infrastructure/document-types";
import { isolatedDescriptiveStateRepository } from "../infrastructure/descriptive-states";
import { isolatedVehicleRepository } from "../infrastructure/vehicles";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import { isolatedReportFilterRepository } from "../infrastructure/report-filters";
import { RepairLaborScreen } from "./repair-labor";
import { MaterialsList } from "./repair-materials";
import { StockListScreen, StockStatementDialog, StockInventoryDialog, StockReconstructionDialog } from "./stock";
import { MaterialReportFilter, LaborReportFilter, SalesReportFilter } from "./report-filters";
import { materialReportFilterLayout, laborReportFilterLayout, salesReportFilterLayout } from "./report-filters-layouts";
import { reportContext } from "./report-callers";
import { useReportPreview, useStockReportPreview } from "./reports";
import type { StartupWindowDefinition } from "./startup-windows";
import type { LegacyLayout } from "./legacy/layout";
import laborLayout from "./legacy/WIN_Tempos_Reparacao.layout.json";
import materialsLayout from "./legacy/WIN_Material_Reparacao.layout.json";
import stockLayout from "./legacy/WIN_Table_cab_stocks.layout.json";
import statementLayout from "./legacy/WIN_Extrato_Artigos.layout.json";
import inventoryLayout from "./legacy/WIN_Inventario.layout.json";
import rebuildLayout from "./legacy/WIN_Reconstrucao_Stocks.layout.json";

function titled(source: LegacyLayout, title: string): LegacyLayout {
  return { ...source, window: { ...source.window, title }, controls: source.controls.map(control => control.name === "RADTitle" ? { ...control, caption: title } : control) };
}

/** Each real caller owns one instance of the shared PDF/HTML preview hook. */
function FilterPreviewWindow({ children }: { children: (preview: (request: FamilyReportRequest) => Promise<void>) => ReactNode }) {
  const reports = useReportPreview();
  return <>{children(reports.preview)}{reports.element}</>;
}
type StockServices = Parameters<typeof StockStatementDialog>[0]["services"];
function StatementMenuDialog({ services, context, finish }: { services: StockServices; context: ReportContext; finish: () => void }) {
  const reports = useStockReportPreview(context);
  return <><StockStatementDialog services={services} onPreview={reports.onPreview} finish={finish} />{reports.element}</>;
}
/** WIN_MENU802–803 continues into inventory after every reconstruction-dialog result. */
function InventoryMenuSequence({ repository, context, finish }: { repository: StockRepository; context: ReportContext; finish: () => void }) {
  const [phase, setPhase] = useState<"reconstruction" | "inventory">("reconstruction"), reports = useStockReportPreview(context);
  return <>{phase === "reconstruction" ? <StockReconstructionDialog repository={repository} inventory finish={() => setPhase("inventory")} />
    : <StockInventoryDialog repository={repository} onPreview={reports.onPreview} finish={finish} />}{reports.element}</>;
}

/** Additional real source menu windows for StartupWorkflow's existing isolated-development entry. */
export async function additionalWorkshopWindows(options: { context?: ReportContext; today?: string; restrictedMaterials?: boolean } = {}): Promise<StartupWindowDefinition[]> {
  const [labor, materials, stock, articles, mechanics, documents, descriptions, vehicles, customers, filters, startupUtilities] = await Promise.all([
    isolatedRepairLaborRepository(), isolatedRepairMaterialsRepository(), isolatedStockRepository(), isolatedArticleRepository(), isolatedMechanicRepository(), isolatedDocumentTypeRepository(), isolatedDescriptiveStateRepository(), isolatedVehicleRepository(), isolatedCustomerRepository(), isolatedReportFilterRepository(), isolatedStartupUtilityRepository(),
  ]);
  const context = options.context ?? reportContext(), now = new Date();
  const today = options.today ?? `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const restricted = options.restrictedMaterials ?? Boolean(new URLSearchParams(window.location.search).get("modulo"));
  const services = { stock, articles, documents, mechanics };
  const definitions: StartupWindowDefinition[] = [
    { id: "repair-labor", label: "Tempos de reparação", group: "movements", toolbarOnly: true, layout: titled(laborLayout, "Tempos de Reparação"), content: <RepairLaborScreen repositories={{ labor, mechanics, descriptions }} /> },
    { id: "repair-materials", label: "Material de reparação", group: "movements", toolbarOnly: true, layout: titled(materialsLayout, "Materiais de Reparação"), content: <MaterialsList repository={materials} articleRepository={articles} mechanicRepository={mechanics} restricted={restricted} /> },
    { id: "stock-documents", label: "Entradas e Saídas de Stock", menuControl: "OPT_Entradas_e_Saídas_de_Stock", group: "movements", layout: stockLayout, content: <StockListScreen services={services} /> },
  ];
  const materialModes: [MaterialReportMode, string, string][] = [
    ["resumo", "Consumo material resumo", "OPT_Consumo_material_resumo"],
    ["descriminado", "Consumo material descriminado", "OPT_Consumo_material_descriminado"],
    ["resumo_viatura", "Consumo material por viatura resumo", "OPT_Consumo_material_por_viatura_resumo"],
    ["descriminado_viatura", "Consumo material por viatura descriminado", "OPT_Consumo_material_por_viatura_descriminado"],
  ];
  for (const [mode, label, menuControl] of materialModes) definitions.push({ id: `material-report-${mode}`, label, menuControl, group: "reports", layout: materialReportFilterLayout(mode), content:
    <FilterPreviewWindow>{onPreview => <MaterialReportFilter mode={mode} repositories={{ articles, vehicles, customers }} context={context} today={today} onPreview={onPreview} />}</FilterPreviewWindow> });
  definitions.push(
    { id: "stock-statement", label: "Extrato de artigos", menuControl: "OPT_Extrato_de_artigos", group: "reports", layout: statementLayout, content: null, renderDialog: finish => <StatementMenuDialog services={services} context={context} finish={finish} /> },
    { id: "stock-inventory", label: "Inventário", menuControl: "OPT_Inventário1", group: "reports", layout: inventoryLayout, content: null, renderDialog: finish => <InventoryMenuSequence repository={stock} context={context} finish={finish} /> },
  );
  const laborModes: [LaborReportMode, string, string][] = [
    ["ordem_reparacao", "Tempos de reparação por ordem", "OPT_Tempos_de_reparação_por_ordem"],
    ["mecanico_resumo", "Tempos de reparação por mecânico resumo", "OPT_Tempos_de_reparação_por_mecânico_resumo"],
    ["mecanico_descriminado", "Tempos de reparação por mecânico descriminado", "OPT_Tempos_de_reparação_por_mecânico_descriminado"],
    ["viatura", "Tempos de reparação por viatura", "OPT_Tempos_de_reparação_por_viatura"],
  ];
  for (const [mode, label, menuControl] of laborModes) definitions.push({ id: `labor-report-${mode}`, label, menuControl, group: "reports", layout: laborReportFilterLayout(mode), content:
    <FilterPreviewWindow>{onPreview => <LaborReportFilter mode={mode} repositories={{ mechanics, vehicles, customers }} context={context} today={today} onPreview={onPreview} />}</FilterPreviewWindow> });
  for (const mode of ["vendas", "recebimentos"] as SalesReportMode[]) definitions.push({ id: `sales-report-${mode}`, label: mode === "vendas" ? "Vendas" : "Recebimentos", menuControl: mode === "vendas" ? "OPT_Vendas" : "OPT_Recebimentos", group: "reports", layout: salesReportFilterLayout(mode), content:
    <FilterPreviewWindow>{onPreview => <SalesReportFilter mode={mode} repository={filters} context={context} today={today} onPreview={onPreview} />}</FilterPreviewWindow> });
  definitions.push({ id: "stock-rebuild", label: "Reconstrução de Stocks", menuControl: "OPT_Reconstrução_de_Stocks", group: "utilities", layout: rebuildLayout, content: null, renderDialog: finish => <StockReconstructionDialog repository={stock} finish={finish} /> });
  definitions.push({ id: "reassign-reception-customers", label: "Clientes Reparação", menuControl: "OPT_Clientes_Reparação", group: "utilities", layout: menuSource, content: null, action: () => startupUtilities.reassignReceptionCustomers(), completedMessage: "Terminado" });
  return definitions;
}
