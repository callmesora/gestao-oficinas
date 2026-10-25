import { isolatedRepairLaborRepository } from "../infrastructure/repair-labor";
import { isolatedRepairMaterialsRepository } from "../infrastructure/repair-materials";
import type { ReactNode } from "react";
import type { LegacyLayout } from "./legacy/layout";
import { TerminalFileContext } from "../application/terminal-file-context";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import { isolatedVehicleRepository } from "../infrastructure/vehicles";
import { isolatedUnitRepository } from "../infrastructure/units";
import { isolatedDescriptiveStateRepository } from "../infrastructure/descriptive-states";
import { isolatedTerminalRepository } from "../infrastructure/terminals";
import { isolatedPostoRepository } from "../infrastructure/postos";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { isolatedRepairStateRepository } from "../infrastructure/repair-states";
import { isolatedDocumentTypeRepository } from "../infrastructure/document-types";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { isolatedUserRepository } from "../infrastructure/users";
import { isolatedRepairOrderRepository } from "../infrastructure/repair-orders";
import { isolatedRepairOrderFormRepository } from "../infrastructure/repair-order-form";
import { CustomerList } from "./customers";
import { VehicleList } from "./vehicles";
import { UnitListScreen } from "./units";
import { DescriptiveStateListScreen } from "./descriptive-states";
import { TerminalListScreen } from "./terminals";
import { PostoListScreen } from "./postos";
import { MechanicListScreen } from "./mechanics";
import { RepairStateListScreen } from "./repair-states";
import { DocumentTypeListScreen } from "./document-types";
import { ArticleListScreen } from "./articles";
import { UserListScreen } from "./users";
import { RepairOrderListScreen } from "./repair-orders";
import customersLayout from "./legacy/WIN_Table_Clientes.layout.json";
import vehiclesLayout from "./legacy/WIN_Table_Viaturas.layout.json";
import unitsLayout from "./legacy/WIN_Table_unidades.layout.json";
import descriptiveStatesLayout from "./legacy/WIN_Table_estados_descritivos.layout.json";
import terminalsLayout from "./legacy/WIN_Table_Terminais.layout.json";
import postosLayout from "./legacy/WIN_Table_postos.layout.json";
import mechanicsLayout from "./legacy/WIN_Table_mecanicos.layout.json";
import repairStatesLayout from "./legacy/WIN_Table_estados_reparacao.layout.json";
import documentsLayout from "./legacy/WIN_Table_documentos.layout.json";
import articlesLayout from "./legacy/WIN_Table_artigos.layout.json";
import usersLayout from "./legacy/WIN_Table_utilizadores.layout.json";
import ordersLayout from "./legacy/WIN_Ordens_Reparacao.layout.json";

export interface StartupWindowDefinition { id: string; label: string; layout: LegacyLayout; content: ReactNode; group: "tables" | "movements" | "reports" | "utilities"; menuControl?: string; toolbarOnly?: boolean; renderDialog?: (finish: () => void) => ReactNode; action?: () => Promise<{ kind: string }>; completedMessage?: string }
// All entries use actual existing business screens/repositories and one shared file-context lifetime.
export async function defaultStartupWindows(): Promise<StartupWindowDefinition[]> {
  const [customers, vehicles, units, descriptiveStates, terminals, postos, mechanics, repairStates, documents, articles, users, orders, form, labor, materials] = await Promise.all([
    isolatedCustomerRepository(), isolatedVehicleRepository(), isolatedUnitRepository(), isolatedDescriptiveStateRepository(), isolatedTerminalRepository(), isolatedPostoRepository(), isolatedMechanicRepository(), isolatedRepairStateRepository(), isolatedDocumentTypeRepository(), isolatedArticleRepository(), isolatedUserRepository(), isolatedRepairOrderRepository(), isolatedRepairOrderFormRepository(), isolatedRepairLaborRepository(), isolatedRepairMaterialsRepository(),
  ]);
  const fileContext = new TerminalFileContext();
  return [
    { id: "customers", label: "Clientes", layout: customersLayout, content: <CustomerList repository={customers} />, group: "tables", menuControl: "OPT_Clientes" },
    { id: "vehicles", label: "Viaturas", layout: vehiclesLayout, content: <VehicleList repositories={{ customers, vehicles }} />, group: "tables", menuControl: "OPT_Viaturas" },
    { id: "units", label: "Unidades", layout: unitsLayout, content: <UnitListScreen repository={units} />, group: "tables", menuControl: "OPT_Unidades" },
    { id: "descriptive-states", label: "Estados descritivos", layout: descriptiveStatesLayout, content: <DescriptiveStateListScreen repository={descriptiveStates} />, group: "tables", menuControl: "OPT_Estados_descritivos" },
    { id: "terminals", label: "Terminais", layout: terminalsLayout, content: <TerminalListScreen repository={terminals} fileContext={fileContext} />, group: "tables", menuControl: "OPT_Terminais" },
    { id: "postos", label: "Postos", layout: postosLayout, content: <PostoListScreen repository={postos} terminalRepository={terminals} fileContext={fileContext} />, group: "utilities", menuControl: "OPT_Postos" },
    { id: "mechanics", label: "Mecânicos", layout: mechanicsLayout, content: <MechanicListScreen repository={mechanics} />, group: "tables", menuControl: "OPT_Mecânicos" },
    { id: "repair-states", label: "Estados de Reparação", layout: repairStatesLayout, content: <RepairStateListScreen repository={repairStates} />, group: "tables", menuControl: "OPT_Estados_de_Reparação" },
    { id: "document-types", label: "Documentos", layout: documentsLayout, content: <DocumentTypeListScreen repository={documents} />, group: "tables", menuControl: "OPT_Documentos" },
    { id: "articles", label: "Artigos", layout: articlesLayout, content: <ArticleListScreen repository={articles} />, group: "tables", menuControl: "OPT_Artigos" },
    { id: "users", label: "Utilizadores", layout: usersLayout, content: <UserListScreen repository={users} />, group: "tables", menuControl: "OPT_Utilizadores" },
    { id: "repair-orders", label: "Ordens de Reparação", layout: ordersLayout, content: <RepairOrderListScreen repositories={{ customers, vehicles, mechanics, users, orders, form, labor, materials, articles }} />, group: "movements", menuControl: "OPT_Ordens_de_Reparação" },
  ];
}
