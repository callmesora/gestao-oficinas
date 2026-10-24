import { useEffect, useRef, useState } from "react";
import type { TableLayout, TableLayoutStore } from "../../application/table-layout";
import { tableLayoutStore } from "../../infrastructure/table-layout";
import type { LegacyColumn, LegacyControl } from "./layout";

/** ADR-003/U-SKIN-05: current source columns and movement barriers take precedence over stale settings. */
export function reconcileTableLayout(saved: TableLayout | null, columns: LegacyColumn[]): TableLayout {
  const visible = columns.filter(column => column.flags?.Visible !== false), allowed = new Set(visible.map(column => column.path));
  const widths = Object.fromEntries(Object.entries(saved?.widths ?? {}).filter(([key]) => allowed.has(key)));
  const rank = new Map((saved?.order ?? []).map((key, index) => [key, index]));
  const order: string[] = [], segment: LegacyColumn[] = [];
  const flush = () => {
    segment.sort((a, b) => (rank.get(a.path) ?? Infinity) - (rank.get(b.path) ?? Infinity));
    order.push(...segment.map(column => column.path)); segment.length = 0;
  };
  for (const column of visible) {
    if (column.flags?.Movable === true && column.flags?.["Fixed left"] !== true) segment.push(column);
    else { flush(); order.push(column.path); }
  }
  flush();
  return { widths, order };
}

/** Mount with a stable owner/window/table key; recreating the owner loads its saved layout. */
export function useTableLayout(control: LegacyControl, settingsKey: string, store: TableLayoutStore = tableLayoutStore) {
  if (!settingsKey || !control.columns) throw new Error("Table layout requires a qualified settings key and source columns");
  const enabled = control.flags?.["Saves col. config."] === true;
  const [layout, setLayout] = useState(() => reconcileTableLayout(enabled ? store.load(settingsKey) : null, control.columns!));
  const dirty = useRef(false);
  useEffect(() => { if (enabled && dirty.current) store.save(settingsKey, layout); }, [enabled, layout, settingsKey, store]);
  return {
    columnWidths: layout.widths, columnOrder: layout.order,
    onColumnWidthsChange: (widths: Record<string, number>) => { dirty.current = true; setLayout(previous => ({ ...previous, widths })); },
    onColumnOrderChange: (order: string[]) => { dirty.current = true; setLayout(previous => ({ ...previous, order })); },
    resetLayout: () => { dirty.current = true; setLayout(reconcileTableLayout(null, control.columns!)); },
  };
}
