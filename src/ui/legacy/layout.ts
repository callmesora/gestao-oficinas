import type { CSSProperties } from "react";
import inputs from "../../../docs/evidence/ui-inputs.json";

export interface LegacyColumn {
  name: string; path: string; title: string | null; width: number | null;
  h_align: string | null; flags?: Record<string, boolean> | null;
}

export interface LegacyControl {
  name: string; path: string; kind: string; x: number; y: number;
  width?: number | null; height?: number | null; caption?: string | null;
  caption_width?: number; visible?: boolean; state?: string;
  tab_order?: number | string; image?: string; background_image?: string;
  input_size?: number; input_type?: string; input_mask?: string;
  h_align?: string;
  flags?: Partial<Record<string, boolean>>;
  anchoring?: string;
  anchorRates?: { right?: number; bottom?: number; width?: number; height?: number };
  columns?: LegacyColumn[];
  table_options?: Record<string, string>;
}
export interface LegacyLayout {
  window: { name: string; title: string | null; size: { width: number; height: number } | null; background_image: string | null; flags?: Record<string, boolean> };
  controls: LegacyControl[];
}

export function controlOf(layout: LegacyLayout, key: string): LegacyControl {
  const exact = layout.controls.find(control => control.path === key);
  if (exact) return exact;
  const matches = layout.controls.filter(control => control.name === key);
  if (matches.length !== 1) throw new Error(`Control needs an unambiguous qualified path: ${key}`);
  return matches[0];
}

export function controlBox(control: LegacyControl): CSSProperties {
  if (control.width == null || control.height == null) throw new Error(`Control geometry unresolved: ${control.path}`);
  return { left: control.x, top: control.y, width: control.width, height: control.height };
}

const assets = new Map(Object.entries(inputs.source_assets).map(([name, asset]) => [name.toLowerCase(), asset]));
export function skinSourceImage(name: string): string {
  const asset = assets.get(name.toLowerCase());
  if (!asset) throw new Error(`Skin image absent from checked inventory: ${name}`);
  return `/skin/${encodeURIComponent(asset.outputs[0])}`;
}
export function skinImage(name: string, state = 0): string {
  if (!Number.isInteger(state) || state < 0) throw new Error("Invalid skin state index");
  const asset = assets.get(name.toLowerCase());
  if (!asset) throw new Error(`Skin image absent from checked inventory: ${name}`);
  const index = asset.states === 1 ? 0 : state;
  if (index < 0 || index >= asset.states) throw new Error(`Undeclared skin state: ${name}/${state}`);
  return `/skin/${encodeURIComponent(asset.outputs[asset.states === 1 ? 0 : index + 1])}`;
}

export function buttonSkin(control: LegacyControl): CSSProperties {
  const result: Record<string, string> = {};
  for (const [prefix, asset] of [["background", control.background_image], ["icon", control.image]] as const) {
    if (!asset) continue;
    for (let state = 0; state < 5; state++) result[`--wd-${prefix}-${state}`] = `url("${skinImage(asset, state)}")`;
  }
  return result as CSSProperties;
}
