import { useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";
import type { WindowGeometry } from "../../application/window-geometry";
import { windowGeometryStore } from "../../infrastructure/window-geometry";
import { trapDialogTab } from "./dialog-keyboard";
import { controlOf, type LegacyLayout } from "./layout";
import { WdFrame } from "./wd";

export interface WdModalHandle { close(): void }
type Edge = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";
const edges: Edge[] = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

/** The real forms/pickers share ADR-003 geometry; business state remains with each caller. */
export function WdModal({ ref, layout, instance, testId, restoreTestId, onClose, onKeyDown, children }: {
  ref: Ref<WdModalHandle>; layout: LegacyLayout; instance: string; testId: string; restoreTestId: string;
  onClose: () => void; onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void; children: ReactNode;
}) {
  const size = layout.window.size;
  if (!size) throw new Error(`Modal geometry unresolved: ${layout.window.name}`);
  const resizable = layout.window.flags?.Resizable === true;
  const title = controlOf(layout, "RADTitle").caption ?? layout.window.title ?? undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const [geometry, setGeometry] = useState<WindowGeometry>(() => {
    const saved = layout.window.flags?.["Save position"] === true ? windowGeometryStore.load(layout.window.name) : null;
    const width = resizable && saved ? Math.max(size.width, Math.min(saved.width, innerWidth - 16)) : size.width;
    const height = resizable && saved ? Math.max(size.height, Math.min(saved.height, innerHeight - 16)) : size.height;
    return { width, height, x: Math.max(0, Math.min(saved?.x ?? (innerWidth - width) / 2, innerWidth - width)),
      y: Math.max(0, Math.min(saved?.y ?? (innerHeight - height) / 2, innerHeight - height)),
      maximized: saved?.maximized === true && layout.window.flags?.["Maximize icon"] === true };
  });
  const [extent, setExtent] = useState({ width: innerWidth, height: innerHeight });
  const [minimized, setMinimized] = useState(false);
  const latest = useRef(geometry), focused = useRef<HTMLElement | null>(null), restoreFocus = useRef(false);
  const drag = useRef<{ pointer: number; edge?: Edge; clientX: number; clientY: number; bounds: WindowGeometry } | null>(null);
  useEffect(() => { latest.current = geometry; }, [geometry]);
  const persist = () => {
    if (layout.window.flags?.["Save position"] === true) windowGeometryStore.save(layout.window.name, latest.current);
  };
  useImperativeHandle(ref, () => ({ close() { persist(); dialog.current?.close(); } }));
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    const save = () => {
      if (layout.window.flags?.["Save position"] === true) windowGeometryStore.save(layout.window.name, latest.current);
    };
    const resize = () => {
      setExtent({ width: innerWidth, height: innerHeight });
      setGeometry(previous => ({ ...previous, x: Math.max(0, Math.min(previous.x, innerWidth - 80)), y: Math.max(0, Math.min(previous.y, innerHeight - 25)) }));
    };
    window.addEventListener("pagehide", save); window.addEventListener("resize", resize);
    return () => { window.removeEventListener("pagehide", save); window.removeEventListener("resize", resize); };
  }, [layout]);
  useEffect(() => {
    if (!minimized && restoreFocus.current) {
      restoreFocus.current = false;
      if (focused.current?.isConnected) focused.current.focus();
      else dialog.current?.querySelector<HTMLElement>(".wd-frame")?.focus();
    }
  }, [minimized]);
  const width = geometry.maximized ? Math.max(size.width, extent.width - 40) : geometry.width;
  const height = geometry.maximized ? Math.max(size.height, extent.height - 40) : geometry.height;
  return <dialog ref={dialog} className="wd-dialog-host wd-modal" data-testid={testId} aria-label={title}
    style={{ left: geometry.maximized ? 20 : geometry.x, top: geometry.maximized ? 20 : geometry.y }}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={event => {
      if (event.target instanceof Element && event.target.closest("dialog") !== event.currentTarget) return;
      trapDialogTab(event); onKeyDown?.(event);
    }}
    onFocusCapture={event => {
      if (event.target instanceof HTMLElement && event.target.closest("dialog") === dialog.current && event.target.closest(".wd-frame")?.closest("dialog") === dialog.current && !event.target.closest(".wd-chrome-button,.wd-workspace-edge")) focused.current = event.target;
    }}
    onPointerDown={event => {
      if (event.button !== 0 || !(event.target instanceof Element) || event.target.closest("dialog") !== event.currentTarget || !event.target.closest(".wd-title")) return;
      event.preventDefault(); event.stopPropagation();
      if (geometry.maximized) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { pointer: event.pointerId, clientX: event.clientX, clientY: event.clientY, bounds: geometry };
    }}
    onPointerMove={event => {
      const start = drag.current;
      if (!start || start.pointer !== event.pointerId) return;
      const dx = event.clientX - start.clientX, dy = event.clientY - start.clientY, prior = start.bounds;
      let { x, y, width, height } = prior;
      if (!start.edge) { x = Math.max(0, Math.min(prior.x + dx, extent.width - 80)); y = Math.max(0, Math.min(prior.y + dy, extent.height - 25)); }
      else {
        if (start.edge.includes("e")) width = Math.max(size.width, prior.width + dx);
        if (start.edge.includes("s")) height = Math.max(size.height, prior.height + dy);
        if (start.edge.includes("w")) { width = Math.min(prior.x + prior.width, Math.max(size.width, prior.width - dx)); x = prior.x + prior.width - width; }
        if (start.edge.includes("n")) { height = Math.min(prior.y + prior.height, Math.max(size.height, prior.height - dy)); y = prior.y + prior.height - height; }
      }
      setGeometry({ ...prior, x, y, width, height });
    }}
    onPointerUp={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
    onPointerCancel={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
    onLostPointerCapture={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}>
    {minimized && <button data-testid={restoreTestId} onClick={() => { restoreFocus.current = true; setMinimized(false); }}>{title}</button>}
    <div hidden={minimized}><WdFrame layout={layout} instance={instance} width={width} height={height}
      onClose={onClose} onMinimize={() => setMinimized(true)} onToggleMaximize={() => setGeometry(previous => ({ ...previous, maximized: !previous.maximized }))}>
      {children}
      {resizable && !geometry.maximized && edges.map(edge => <button key={edge} type="button" tabIndex={-1}
        className={`wd-workspace-edge wd-workspace-edge-${edge}${edge === "se" && layout.window.flags?.["With grip"] === true ? " wd-workspace-grip" : ""}`}
        data-testid={`${instance}-resize-${edge}`} aria-label={`Redimensionar janela (${edge})`}
        onPointerDown={event => {
          if (event.button !== 0) return;
          event.preventDefault(); event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { pointer: event.pointerId, edge, clientX: event.clientX, clientY: event.clientY, bounds: geometry };
        }}
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
          event.preventDefault(); event.stopPropagation();
          const step = event.shiftKey ? 1 : 8;
          setGeometry(previous => ({ ...previous, width: Math.max(size.width, previous.width + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0)),
            height: Math.max(size.height, previous.height + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0)) }));
        }} />)}
    </WdFrame></div>
  </dialog>;
}
