import { getCoreRowModel, useReactTable, type ColumnSizingState } from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { controlBox, type LegacyColumn, type LegacyControl } from "./layout";
import "./skin.css";
import { useAnchoredControl } from "./anchors";

export function WdTable<T>({ control: sourceControl, rows, rowId, cell, selectedId, onSelect, onActivate, onSort, columnWidths, onColumnWidthsChange, columnOrder, onColumnOrderChange }: {
  control: LegacyControl; rows: T[]; rowId: (row: T) => string;
  cell: (row: T, column: LegacyColumn) => ReactNode;
  selectedId: string | null; onSelect: (id: string) => void;
  onActivate?: (id: string) => void; onSort?: (column: LegacyColumn) => void;
  columnWidths?: ColumnSizingState; onColumnWidthsChange?: (widths: ColumnSizingState) => void;
  columnOrder?: string[]; onColumnOrderChange?: (order: string[]) => void;
}) {
  const [localWidths, setLocalWidths] = useState<ColumnSizingState>({});
  const widths = columnWidths ?? localWidths;
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const order = columnOrder ?? localOrder;
  const draggedColumn = useRef<string | null>(null), keyboardFocus = useRef<HTMLElement | null>(null);
  useEffect(() => { keyboardFocus.current?.focus(); keyboardFocus.current = null; }, [order]);
  if ((columnOrder == null) !== (onColumnOrderChange == null)) throw new Error("Controlled column order requires both state and callback");
  if ((columnWidths == null) !== (onColumnWidthsChange == null)) throw new Error("Controlled column widths require both state and callback");
  const control = useAnchoredControl(sourceControl);
  if (!control.columns) throw new Error(`Table columns unresolved: ${control.path}`);
  const sourceColumns = control.columns;
  const container = useRef<HTMLDivElement>(null);
  const ids = rows.map(rowId);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate table row identity: ${control.path}`);
  const columns = useMemo(() => sourceColumns.filter(column => column.flags?.Visible !== false).map(column => {
    if (column.width == null) throw new Error(`Column width unresolved: ${column.path}`);
    return { id: column.path, size: column.width, minSize: Math.min(24, column.width),
      maxSize: Number.MAX_SAFE_INTEGER, enableResizing: column.flags?.["Adjustable width"] === true };
  }), [sourceColumns]);
  const table = useReactTable({ data: rows, columns, getRowId: rowId, getCoreRowModel: getCoreRowModel(),
    manualSorting: true, autoResetAll: false, enableRowSelection: false, columnResizeMode: "onChange", state: { columnSizing: widths, columnOrder: order },
    onColumnOrderChange: update => {
      if (onColumnOrderChange) onColumnOrderChange(typeof update === "function" ? update(order) : update);
      else setLocalOrder(update);
    },
    onColumnSizingChange: update => {
      if (onColumnWidthsChange) onColumnWidthsChange(typeof update === "function" ? update(widths) : update);
      else setLocalWidths(update);
    } });
  const displayed = table.getRowModel().rows;
  const columnOf = (id: string) => sourceColumns.find(column => column.path === id)!;
  const moveColumn = (from: string, to: string) => {
    const next = table.getAllLeafColumns().map(column => column.id), start = next.indexOf(from), end = next.indexOf(to);
    if (start < 0 || end < 0 || start === end) return false;
    if (next.slice(Math.min(start, end), Math.max(start, end) + 1).some(id => columnOf(id).flags?.Movable !== true || columnOf(id).flags?.["Fixed left"] === true)) return false;
    next.splice(start, 1); next.splice(end, 0, from); table.setColumnOrder(next); return true;
  };
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
      <thead>{table.getHeaderGroups().map(group => <tr key={group.id}>{group.headers.map(header => {
        const column = header.column;
        const source = columnOf(column.id);
        const movable = source.flags?.Movable === true && source.flags?.["Fixed left"] !== true;
        const captionProps = { draggable: movable,
          onDragStart: (event: DragEvent<HTMLElement>) => { draggedColumn.current = column.id; event.dataTransfer.setData("text/plain", column.id); event.dataTransfer.effectAllowed = "move"; },
          onDragEnd: () => { draggedColumn.current = null; } };
        return <th key={column.id} scope="col" data-testid={source.name} data-control-path={source.path}
          onDragOver={event => { if (draggedColumn.current) event.preventDefault(); }}
          onDrop={event => { event.preventDefault(); if (draggedColumn.current) moveColumn(draggedColumn.current, column.id); draggedColumn.current = null; }}
          onKeyDown={event => {
            if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault(); event.stopPropagation();
            const ids = table.getAllLeafColumns().map(item => item.id), index = ids.indexOf(column.id);
            const target = ids[index + (event.key === "ArrowLeft" ? -1 : 1)];
            keyboardFocus.current = null;
            if (target && moveColumn(column.id, target)) keyboardFocus.current = event.target as HTMLElement;
          }}>
          {onSort && source.flags?.["Sortable column"] === true
            ? <button {...captionProps} type="button" onClick={() => onSort(source)}>{source.title}</button> : <span {...captionProps} tabIndex={movable ? 0 : undefined} className="wd-column-caption">{source.title}</span>}
          {column.getCanResize() && <span role="separator" aria-orientation="vertical" aria-label={source.title ?? source.name}
            aria-valuenow={column.getSize()} aria-valuemin={Math.min(24, source.width!)} aria-valuemax={Number.MAX_SAFE_INTEGER} aria-valuetext={`${column.getSize()} px`} tabIndex={0} data-testid={`${source.name}__resize`} className="wd-column-resize"
            onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
            onKeyDown={event => {
              if (!["ArrowLeft", "ArrowRight"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
              event.preventDefault(); event.stopPropagation();
              const delta = (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 1 : 8);
              table.setColumnSizing(previous => ({ ...previous, [column.id]: Math.max(Math.min(24, source.width!), column.getSize() + delta) }));
            }} />}
        </th>;
      })}</tr>)}</thead>
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
