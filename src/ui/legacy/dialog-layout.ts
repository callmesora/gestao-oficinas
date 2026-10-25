import proposals from "../../../docs/evidence/message-proposals.json";
import chrome from "./WIN_Inserir_quantidade_password.layout.json";
import type { LegacyLayout } from "./layout";

/** ADR-003/Q12: inherited dialog skin is a target default; preserve extracted geometry. */
export function dialogLayout(source: LegacyLayout, title: string): LegacyLayout {
  return { ...source, window: { ...source.window, title, background_image: proposals.frame },
    controls: source.controls.map(control => {
      if (control.name === "RADTitle") return { ...control, caption: title };
      const skin = chrome.controls.find(item => item.name === control.name);
      if (!skin) return control;
      return { ...control, visible: skin.visible, flags: skin.flags, image: skin.image, background_image: skin.background_image,
        tab_order: skin.tab_order, anchoring: skin.anchoring };
    }) };
}
