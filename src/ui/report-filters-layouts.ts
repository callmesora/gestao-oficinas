import materialSource from "./legacy/WIN_Filtro_Mapas_Artigos.layout.json";
import laborSource from "./legacy/WIN_Filtro_Mapas_Tempos.layout.json";
import salesSource from "./legacy/WIN_Mapa_Vendas.layout.json";
import { materialReportTitles, laborReportTitles, type MaterialReportMode, type LaborReportMode, type SalesReportMode } from "../../packages/domain/src/report-filters";
import type { LegacyControl, LegacyLayout } from "./legacy/layout";

const preview = (control: LegacyControl, tab: number): LegacyControl => ({ ...control, kind: "Button", caption: "Visualizar impressão", tab_order: tab,
  image: "Btn_OK.gif", background_image: "MediaPlayer_Btn_anim.gif" });
/** Scoped source overlays, not generated-file edits: dossier matching typo aliases carry the metadata;
 * exact accented source names supply identity/geometry (U-WCD4890-01/U-WA6D3FA-01/U-W7DB489-01). */
function titled(source: LegacyLayout, title: string, adapt: (control: LegacyControl) => LegacyControl): LegacyLayout {
  return { window: { ...source.window, title }, controls: source.controls.map(control => adapt(control.name === "RADTitle" ? { ...control, caption: title } : control)) };
}
export function materialReportFilterLayout(mode: MaterialReportMode): LegacyLayout {
  return titled(materialSource, materialReportTitles[mode], control => {
    if (control.name.startsWith("BTN_Visualizar_impressão")) return preview(control, control.name.endsWith("1") ? 20 : 9);
    if (["EDT_Da_data", "EDT_a_data"].includes(control.name)) return { ...control, input_type: "Date", return_format: "AAAAMMJJ", calendar_button: "Yes", calculator_button: "Yes", blocking_validation: "Yes" };
    if (control.name === "EDT_Descrição") return { ...control, kind: "Edit control", caption: "Descrição", tab_order: 25, caption_width: 57, input_type: "Text", input_size: 30, h_align: "Left" };
    return control;
  });
}
export function laborReportFilterLayout(mode: LaborReportMode): LegacyLayout {
  return titled(laborSource, laborReportTitles[mode], control => control.name === "BTN_Visualizar_impressão" ? preview(control, 4) : control);
}
export function salesReportFilterLayout(mode: SalesReportMode): LegacyLayout {
  const delivery = mode === "vendas", suffix = delivery ? "entrega" : "pagamento";
  return titled(salesSource, delivery ? "Mapa de Vendas" : "Mapa de Recebimentos", control => {
    if (control.name === "BTN_Visualizar_impressão1") return preview(control, 5);
    if (control.name === "EDT_Da_data" || control.name === "EDT_A_data") return { ...control, caption_width: 123, caption: `${control.name === "EDT_Da_data" ? "Da" : "À"} data de ${suffix}` };
    if (control.name === "STC_Titulo_Tabela") return { ...control, caption: `Estados de reparação que pedem data de ${suffix}` };
    return control;
  });
}
