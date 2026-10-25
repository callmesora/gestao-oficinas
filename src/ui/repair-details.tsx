import { useReportPreview } from "./reports";
import { reportContext } from "./report-callers";
import { useEffect, useRef, useState } from "react";
import type { RepairLaborRepository } from "../application/repair-labor";
import type { RepairMaterialsRepository } from "../application/repair-materials";
import type { ArticleRepository } from "../application/articles";
import type { MechanicRepository } from "../application/mechanics";
import { RepairDescriptionsDialog } from "./repair-labor";
import { RepairMaterialsDialog } from "./repair-materials";

/** Compose the actual source dialogs without holding a database connection across them. */
export function RepairDetailsDialog({ repositories, numero, finish }: {
  repositories: { labor: RepairLaborRepository; materials: RepairMaterialsRepository; articles: ArticleRepository; mechanics: MechanicRepository };
  numero: string; finish: () => void;
}) {
  const reports = useReportPreview();
  const [material, setMaterial] = useState<{ orderId: string; resolve: () => void } | null>(null);
  const pending = useRef<(() => void) | null>(null);
  useEffect(() => () => { pending.current?.(); pending.current = null; }, []);
  return <>
    <RepairDescriptionsDialog repository={repositories.labor} numero={numero} finish={finish}
      printService={number => { void reports.preview({ reportId: "RPT_Servico_Avaria", context: reportContext(), source: { kind: "programmatic", orderNumber: number } }); }}
      printMaterials={(number, total, rows) => { void reports.preview({ reportId: "RPT_Materiais", context: reportContext(), source: { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: number, formattedTotal: total,
        rows: rows.map(row => ({ COL_cod_art: row.artigo, COL_desc_artigo: row.descricao_artigo, COL_quant: row.quantidade, COL_preco: row.preco, COL_extra: row.extra === null ? null : row.extra ? "1" : "0", COL_lancado: row.lancado === null ? null : row.lancado ? "1" : "0", COL_datahora: row.data_hora })) } }); }}
      onMaterial={order => new Promise<void>(resolve => { pending.current = resolve; setMaterial({ orderId: order.id, resolve }); })} />
    {material && <RepairMaterialsDialog repository={repositories.materials} orderId={material.orderId}
      articleRepository={repositories.articles} mechanicRepository={repositories.mechanics}
      finish={() => { pending.current = null; setMaterial(null); material.resolve(); }} />}
    {reports.element}
  </>;
}
