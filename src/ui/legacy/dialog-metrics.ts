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

// legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:738-947.
export function resourceGeometry(layout: LegacyLayout, text: string, title: string, labels: string[], measure: TextMeasure, viewport: number, input?: { width: number; height: number }) {
  const size = layout.window.size!, body = controlOf(layout, "LIB_INFO"), icon = controlOf(layout, "ICONE"), button = controlOf(layout, "BTN_1");
  const buttons = resourceButtonGeometry(labels, title, measure, viewport);
  const initial = measure(text, 1000);
  let textWidth = initial.width + 40, textHeight = initial.height + 20, passes = 0;
  while (textWidth / textHeight > 2 && passes < 10) {
    const measured = measure(text, textWidth - (textWidth > 100 ? 100 : 50));
    const nextWidth = measured.width + 40, nextHeight = measured.height + 20;
    if (nextWidth / nextHeight < 1.4 || nextWidth === textWidth) break;
    textWidth = nextWidth; textHeight = nextHeight; passes++;
  }
  const inputHeight = input?.height ?? 0;
  if (input) textWidth = Math.max(textWidth, input.width + 10);
  textHeight = Math.max(textHeight, icon.height! - inputHeight - 6);
  const width = Math.min(Math.max(buttons.width, textWidth + size.width - body.width!), Math.min(4000, viewport - 16));
  const height = Math.max(size.height, size.height + textHeight + inputHeight - body.height! + (inputHeight > 0 ? 6 : 0));
  // UNRESOLVED U-W0075A5-01: designer anchoring is encoded; use the skin's width-stretch proposal.
  const bodyWidth = body.width! + width - size.width;
  const space = (width - icon.width! - bodyWidth) / 3;
  const bodyX = 2 * space + icon.width!;
  return { ...buttons, width, height, textHeight, bodyWidth, bodyX, passes,
    inputY: body.y + textHeight - 6, inputHeight, inputWidth: width - bodyX - 16,
    buttonY: button.y + height - size.height };
}
