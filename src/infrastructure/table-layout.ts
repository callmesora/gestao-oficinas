import type { TableLayout, TableLayoutStore } from "../application/table-layout";

const prefix = "gestao-oficinas:table-layout:v1:";
type LayoutStorage = Pick<Storage, "getItem" | "setItem">;

function valid(value: unknown): value is TableLayout {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return !!data.widths && typeof data.widths === "object" && !Array.isArray(data.widths) &&
    Object.entries(data.widths).every(([key, width]) => key.length > 0 && typeof width === "number" && Number.isFinite(width) && width > 0) &&
    Array.isArray(data.order) && data.order.every(key => typeof key === "string" && key.length > 0) && new Set(data.order).size === data.order.length &&
    (data.hidden === undefined || Array.isArray(data.hidden) && data.hidden.every(key => typeof key === "string" && key.length > 0) && new Set(data.hidden).size === data.hidden.length);
}

function layoutOnly(value: TableLayout): TableLayout { return { widths: { ...value.widths }, order: [...value.order], ...(value.hidden?.length ? { hidden: [...value.hidden] } : {}) }; }

export function createTableLayoutStore(storage?: LayoutStorage): TableLayoutStore {
  return {
    load(key) {
      try {
        const value: unknown = JSON.parse((storage ?? window.localStorage).getItem(prefix + encodeURIComponent(key)) ?? "null");
        return valid(value) && (value as TableLayout & { version?: unknown }).version === 1 ? layoutOnly(value) : null;
      } catch { return null; }
    },
    save(key, layout) {
      if (!valid(layout)) return false;
      try {
        (storage ?? window.localStorage).setItem(prefix + encodeURIComponent(key), JSON.stringify({ version: 1, ...layoutOnly(layout) }));
        return true;
      } catch { return false; }
    },
  };
}

export const tableLayoutStore = createTableLayoutStore();
