import { controlOf, type LegacyLayout } from "./layout";

export type TextMeasure = (text: string, width?: number) => { width: number; height: number };

/** Browser measurement replaces TexteLargeur/TexteHauteur; font/raster parity remains unresolved. */
export function browserMeasure(font: string): TextMeasure {
  return (text, width) => {
    const element = document.createElement("span");
    Object.assign(element.style, { position: "fixed", visibility: "hidden", display: "inline-block", font,
      whiteSpace: width == null ? "pre" : "pre-wrap", overflowWrap: "break-word", maxWidth: width == null ? "none" : `${width}px`, left: "0", top: "0" });
    element.textContent = text;
    document.body.append(element);
    try { const box = element.getBoundingClientRect(); return { width: Math.ceil(box.width), height: Math.ceil(box.height) }; }
    finally { element.remove(); }
  };
}

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:511-587.
export function messageGeometry(layout: LegacyLayout, text: string, count: number, measure: TextMeasure) {
  const size = layout.window.size!;
  const body = controlOf(layout, "LIB_INFO"), button = controlOf(layout, "BTN_OK"), icon = controlOf(layout, "ICON_INFORMATION");
  const textWidth = Math.min(measure(text).width + 10, 600);
  const textHeight = Math.max(measure(text, textWidth).height, icon.height!);
  const total = button.width! * count + 6 * (count - 1);
  const width = Math.max(textWidth + size.width - body.width!, total + 20);
  const height = size.height + textHeight - body.height!;
  return { width, height, textWidth, textHeight, total, buttonY: button.y + height - size.height };
}

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:550-656,738-804.
export function resourceButtonGeometry(labels: string[], title: string, measure: TextMeasure, viewport: number) {
  const widths = labels.map(label => Math.max(80, measure(label).width + 24));
  const total = widths.reduce((sum, width) => sum + width, 0) + (widths.length - 1) * 12;
  const width = Math.min(Math.max(400, total + 100, measure(title).width + 100), Math.min(4000, viewport - 16));
  return { widths, total, width };
}
