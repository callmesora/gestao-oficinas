import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useRef, type ReactNode } from "react";
import { controlBox, type LegacyColumn, type LegacyControl } from "./layout";
import "./skin.css";
import { useAnchoredControl } from "./anchors";

export function WdTable<T>({ control: sourceControl, rows, rowId, cell, selectedId, onSelect, onActivate, onSort }: {
  control: LegacyControl; rows: T[]; rowId: (row: T) => string;
  cell: (row: T, column: LegacyColumn) => ReactNode;
  selectedId: string | null; onSelect: (id: string) => void;
  onActivate?: (id: string) => void; onSort?: (column: LegacyColumn) => void;
}) {
  const control = useAnchoredControl(sourceControl);
  if (!control.columns) throw new Error(`Table columns unresolved: ${control.path}`);
  const sourceColumns = control.columns;
  const container = useRef<HTMLDivElement>(null);
  const ids = rows.map(rowId);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate table row identity: ${control.path}`);
  const columns = useMemo(() => sourceColumns.filter(column => column.flags?.Visible !== false).map(column => {
    if (column.width == null) throw new Error(`Column width unresolved: ${column.path}`);
    return { id: column.path, size: column.width, minSize: column.width, maxSize: column.width };
  }), [sourceColumns]);
  const table = useReactTable({ data: rows, columns, getRowId: rowId, getCoreRowModel: getCoreRowModel(),
    manualSorting: true, autoResetAll: false, enableRowSelection: false });
  const displayed = table.getRowModel().rows;
  const columnOf = (id: string) => sourceColumns.find(column => column.path === id)!;
  return <div ref={container} data-testid={control.name} data-control-path={control.path} className="wd-table"
    hidden={control.visible === false} style={controlBox(control)} tabIndex={String(control.tab_order) === "-1" ? -1 : 0}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      const index = displayed.findIndex(row => row.id === selectedId);
      if (event.key === "Enter" && index >= 0 && onActivate) { event.preventDefault(); onActivate(displayed[index].id); }
      // UNRESOLVED U-CC16AB27-02: no implicit first selection or wrap at a boundary.
      const next = index + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0);
      if (index >= 0 && next !== index && next >= 0 && next < displayed.length) {
        event.preventDefault(); onSelect(displayed[next].id);
      }
    }}>
    <div className="wd-table-grid" aria-hidden="true" style={{ width: table.getTotalSize() }}>
      {table.getAllLeafColumns().map(column => <span key={column.id} style={{ width: column.getSize() }} />)}
    </div>
    <table aria-label={control.caption ?? control.name} style={{ width: table.getTotalSize() }}>
      <colgroup>{table.getAllLeafColumns().map(column => <col key={column.id} style={{ width: column.getSize() }} />)}</colgroup>
      <thead><tr>{table.getAllLeafColumns().map(column => {
        const source = columnOf(column.id);
        return <th key={column.id} scope="col" data-testid={source.name} data-control-path={source.path}>
          {onSort && source.flags?.["Sortable column"] === true
            ? <button type="button" onClick={() => onSort(source)}>{source.title}</button> : source.title}
        </th>;
      })}</tr></thead>
      <tbody>{displayed.map(row => <tr key={row.id} aria-selected={row.id === selectedId}
        onClick={() => { container.current?.focus(); onSelect(row.id); }} onDoubleClick={() => onActivate?.(row.id)}>
        {row.getAllCells().map(value => {
          const source = columnOf(value.column.id);
          return <td key={value.id} style={{ textAlign: source.h_align === "Right" ? "right" : "left" }}>{cell(row.original, source)}</td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}
