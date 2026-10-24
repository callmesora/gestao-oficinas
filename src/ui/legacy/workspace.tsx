import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WdFrame } from "./wd";
import type { LegacyLayout } from "./layout";
import type { WindowGeometryStore } from "../../application/window-geometry";
import { windowGeometryStore } from "../../infrastructure/window-geometry";

interface WindowSpec { layout: LegacyLayout; content: ReactNode }
interface WindowEntry extends WindowSpec { id: string; x: number; y: number; width: number; height: number; z: number; minimized: boolean; maximized: boolean }
type ResizeEdge = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";
const resizeEdges: ResizeEdge[] = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];
type OpenWindow = (spec: WindowSpec) => void;
const WorkspaceContext = createContext<OpenWindow | null>(null);
const WorkspaceCloseContext = createContext<(() => void) | null>(null);

// SRC-e0b6683735: a real list's Fechar action closes its own workspace instance.
export function useWorkspaceClose(override?: () => void) {
  // SRC-a29b466a64: the real vehicle caller owns its awaited customer picker lifetime.
  const close = useContext(WorkspaceCloseContext);
  if (override) return override;
  if (!close) throw new Error("Workspace instance is required");
  return close;
}

function saveGeometry(store: WindowGeometryStore, entry: WindowEntry) {
  if (entry.layout.window.flags?.["Save position"] !== true) return;
  store.save(entry.layout.window.name, { x: entry.x, y: entry.y, width: entry.width, height: entry.height, maximized: entry.maximized });
}

export function useWorkspace() {
  const open = useContext(WorkspaceContext);
  if (!open) throw new Error("WdWorkspace is required");
  return { open };
}

/** Independent in-app windows; geometry/focus defaults are explicit in ADR-003. */
export function WdWorkspace({ children, geometryStore = windowGeometryStore }: { children: ReactNode; geometryStore?: WindowGeometryStore }) {
  const [windows, setWindows] = useState<WindowEntry[]>([]);
  const [extent, setExtent] = useState({ width: 0, height: 0 });
  const [focusRequest, requestFocus] = useState(0);
  const canvas = useRef<HTMLDivElement>(null), launcher = useRef<HTMLDivElement>(null), sequence = useRef(0), stack = useRef(0);
  const roots = useRef(new Map<string, HTMLDivElement>()), focused = useRef(new Map<string, HTMLElement>());
  const drag = useRef<{ id: string; pointer: number; mode: "move" | "resize"; edge?: ResizeEdge; startX: number; startY: number; x: number; y: number; width: number; height: number } | null>(null);
  const active = windows.filter(entry => !entry.minimized).reduce<WindowEntry | null>((top, entry) => !top || entry.z > top.z ? entry : top, null);
  const activeId = active?.id;
  useEffect(() => {
    const saveOpen = () => [...windows].sort((a, b) => a.z - b.z).forEach(entry => saveGeometry(geometryStore, entry));
    window.addEventListener("pagehide", saveOpen);
    return () => window.removeEventListener("pagehide", saveOpen);
  }, [windows, geometryStore]);
  useEffect(() => {
    const element = canvas.current!;
    const update = () => {
      const width = element.clientWidth, height = element.clientHeight;
      setExtent({ width, height });
      setWindows(previous => previous.map(entry => ({ ...entry, x: Math.max(0, Math.min(entry.x, width - 80)), y: Math.max(0, Math.min(entry.y, height - 25)) })));
    };
    const observer = new ResizeObserver(update);
    update(); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!activeId) {
      if (focusRequest) launcher.current?.querySelector<HTMLElement>("button")?.focus();
      return;
    }
    const remembered = focused.current.get(activeId);
    if (remembered?.isConnected && !remembered.matches(":disabled") && remembered.getClientRects().length) remembered.focus();
    else roots.current.get(activeId)?.querySelector<HTMLElement>(".wd-frame")?.focus();
  }, [activeId, focusRequest]);
  const activate = (id: string) => {
    if (activeId === id) return;
    const z = ++stack.current;
    setWindows(previous => previous.map(entry => entry.id === id ? { ...entry, z } : entry));
  };
  const open: OpenWindow = spec => {
    if (!spec.layout.window.size) throw new Error("Workspace window size unresolved");
    const size = spec.layout.window.size, area = canvas.current!;
    const id = `workspace-window-${++sequence.current}`, z = ++stack.current;
    const offset = windows.length % 4 * 24;
    const saved = spec.layout.window.flags?.["Save position"] === true ? geometryStore.load(spec.layout.window.name) : null;
    const resizable = spec.layout.window.flags?.Resizable === true;
    const width = saved && resizable ? Math.max(size.width, Math.min(saved.width, area.clientWidth)) : size.width;
    const height = saved && resizable ? Math.max(size.height, Math.min(saved.height, area.clientHeight)) : size.height;
    const x = Math.max(0, Math.min((saved?.x ?? (area.clientWidth - size.width) / 2) + offset, saved ? area.clientWidth - width : area.clientWidth - 80));
    const y = Math.max(0, Math.min((saved?.y ?? (area.clientHeight - size.height) / 2) + offset, saved ? area.clientHeight - height : area.clientHeight - 25));
    const maximized = saved?.maximized === true && spec.layout.window.flags?.["Maximize icon"] === true;
    setWindows(previous => [...previous, { ...spec, id, z, x, y, width, height, minimized: false, maximized }]);
  };
  const close = (id: string) => {
    const entry = windows.find(item => item.id === id);
    if (entry) saveGeometry(geometryStore, entry);
    focused.current.delete(id);
    setWindows(previous => previous.filter(entry => entry.id !== id));
    requestFocus(value => value + 1);
  };
  const minimize = (id: string) => {
    setWindows(previous => previous.map(entry => entry.id === id ? { ...entry, minimized: true } : entry));
    requestFocus(value => value + 1);
  };
  const restore = (id: string) => {
    const z = ++stack.current;
    setWindows(previous => previous.map(entry => entry.id === id ? { ...entry, minimized: false, z } : entry));
    requestFocus(value => value + 1);
  };
  return <WorkspaceContext.Provider value={open}><div className="wd-workspace" data-testid="workspace">
    <div ref={launcher} className="wd-workspace-launcher">{children}</div>
    <div ref={canvas} className="wd-workspace-canvas" data-testid="workspace-canvas">
      {windows.map(entry => {
        const size = entry.layout.window.size!;
        return <div key={entry.id} ref={element => { if (element) roots.current.set(entry.id, element); else roots.current.delete(entry.id); }}
          className="wd-workspace-window" hidden={entry.minimized} data-testid={entry.id} data-active={activeId === entry.id}
          style={{ left: entry.maximized ? 0 : entry.x, top: entry.maximized ? 0 : entry.y, zIndex: entry.z }}
          onFocusCapture={event => {
            if (event.target instanceof HTMLElement && !event.target.closest(".wd-chrome-button")) focused.current.set(entry.id, event.target);
            activate(entry.id);
          }}
          onPointerDownCapture={() => activate(entry.id)}
          onPointerDown={event => {
            if (entry.maximized || event.button !== 0 || !(event.target instanceof Element) || !event.target.closest(".wd-title")) return;
            event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { id: entry.id, mode: "move", width: entry.width, height: entry.height, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, x: entry.x, y: entry.y };
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start || start.id !== entry.id || start.pointer !== event.pointerId) return;
            if (start.mode === "resize") {
              const edge = start.edge!, dx = event.clientX - start.startX, dy = event.clientY - start.startY;
              let width = start.width, height = start.height, x = start.x, y = start.y;
              if (edge.includes("e")) width = Math.max(size.width, start.width + dx);
              if (edge.includes("s")) height = Math.max(size.height, start.height + dy);
              if (edge.includes("w")) { width = Math.min(start.x + start.width, Math.max(size.width, start.width - dx)); x = start.x + start.width - width; }
              if (edge.includes("n")) { height = Math.min(start.y + start.height, Math.max(size.height, start.height - dy)); y = start.y + start.height - height; }
              setWindows(previous => previous.map(item => item.id === entry.id ? { ...item, x, y, width, height } : item));
              return;
            }
            const area = canvas.current!;
            const x = Math.max(0, Math.min(start.x + event.clientX - start.startX, area.clientWidth - 80));
            const y = Math.max(0, Math.min(start.y + event.clientY - start.startY, area.clientHeight - 25));
            setWindows(previous => previous.map(item => item.id === entry.id ? { ...item, x, y } : item));
          }}
          onPointerUp={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
          onPointerCancel={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}
          onLostPointerCapture={event => { if (drag.current?.pointer === event.pointerId) drag.current = null; }}>
          <WdFrame layout={entry.layout} instance={`${entry.id}-frame`}
            width={entry.maximized ? Math.max(size.width, extent.width) : entry.width}
            height={entry.maximized ? Math.max(size.height, extent.height) : entry.height}
            onClose={() => close(entry.id)} onMinimize={() => minimize(entry.id)}
            onToggleMaximize={() => setWindows(previous => previous.map(item => item.id === entry.id ? { ...item, maximized: !item.maximized } : item))}>
            <WorkspaceCloseContext.Provider value={() => close(entry.id)}>{entry.content}</WorkspaceCloseContext.Provider>
            {entry.layout.window.flags?.Resizable === true && !entry.maximized && resizeEdges.map(edge =>
              <button key={edge} type="button" tabIndex={edge === "se" ? 0 : -1}
                className={`wd-workspace-edge wd-workspace-edge-${edge}${edge === "se" && entry.layout.window.flags?.["With grip"] === true ? " wd-workspace-grip" : ""}`}
                data-testid={edge === "se" ? `${entry.id}-resize` : `${entry.id}-resize-${edge}`} aria-label={`Redimensionar janela (${edge})`}
                onPointerDown={event => {
                  if (event.button !== 0) return;
                  event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = { id: entry.id, mode: "resize", edge, pointer: event.pointerId, startX: event.clientX, startY: event.clientY,
                    x: entry.x, y: entry.y, width: entry.width, height: entry.height };
                }}
                onKeyDown={event => {
                  if (edge !== "se" || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
                  event.preventDefault();
                  const step = event.shiftKey ? 1 : 8;
                  const dx = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
                  const dy = event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0;
                  setWindows(previous => previous.map(item => item.id === entry.id ? { ...item,
                    width: Math.max(size.width, item.width + dx), height: Math.max(size.height, item.height + dy) } : item));
                }} />)}
          </WdFrame>
        </div>;
      })}
    </div>
    <nav className="wd-workspace-tasks" aria-label="Janelas abertas" data-testid="workspace-tasks">
      {windows.map(entry => <button key={entry.id} type="button" data-testid={`${entry.id}-task`} aria-pressed={activeId === entry.id}
        onClick={() => restore(entry.id)}>{entry.layout.window.title ?? entry.layout.window.name} · {entry.id.replace("workspace-window-", "")}{entry.minimized ? " (minimizada)" : ""}</button>)}
    </nav>
  </div></WorkspaceContext.Provider>;
}
