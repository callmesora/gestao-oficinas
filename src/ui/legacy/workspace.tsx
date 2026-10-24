import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WdFrame } from "./wd";
import type { LegacyLayout } from "./layout";

interface WindowSpec { layout: LegacyLayout; content: ReactNode }
interface WindowEntry extends WindowSpec { id: string; x: number; y: number; z: number; minimized: boolean; maximized: boolean }
type OpenWindow = (spec: WindowSpec) => void;
const WorkspaceContext = createContext<OpenWindow | null>(null);

export function useWorkspace() {
  const open = useContext(WorkspaceContext);
  if (!open) throw new Error("WdWorkspace is required");
  return { open };
}

/** Independent in-app windows; geometry/focus defaults are explicit in ADR-003. */
export function WdWorkspace({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowEntry[]>([]);
  const [extent, setExtent] = useState({ width: 0, height: 0 });
  const [focusRequest, requestFocus] = useState(0);
  const canvas = useRef<HTMLDivElement>(null), launcher = useRef<HTMLDivElement>(null), sequence = useRef(0), stack = useRef(0);
  const roots = useRef(new Map<string, HTMLDivElement>()), focused = useRef(new Map<string, HTMLElement>());
  const drag = useRef<{ id: string; pointer: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const active = windows.filter(entry => !entry.minimized).reduce<WindowEntry | null>((top, entry) => !top || entry.z > top.z ? entry : top, null);
  const activeId = active?.id;
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
    const x = Math.max(0, Math.min((area.clientWidth - size.width) / 2 + offset, area.clientWidth - 80));
    const y = Math.max(0, Math.min((area.clientHeight - size.height) / 2 + offset, area.clientHeight - 25));
    setWindows(previous => [...previous, { ...spec, id, z, x, y, minimized: false, maximized: false }]);
  };
  const close = (id: string) => {
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
            drag.current = { id: entry.id, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, x: entry.x, y: entry.y };
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start || start.id !== entry.id || start.pointer !== event.pointerId) return;
            const area = canvas.current!;
            const x = Math.max(0, Math.min(start.x + event.clientX - start.startX, area.clientWidth - 80));
            const y = Math.max(0, Math.min(start.y + event.clientY - start.startY, area.clientHeight - 25));
            setWindows(previous => previous.map(item => item.id === entry.id ? { ...item, x, y } : item));
          }}
          onPointerUp={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
          <WdFrame layout={entry.layout} instance={`${entry.id}-frame`}
            width={entry.maximized ? Math.max(size.width, extent.width) : undefined}
            height={entry.maximized ? Math.max(size.height, extent.height) : undefined}
            onClose={() => close(entry.id)} onMinimize={() => minimize(entry.id)}
            onToggleMaximize={() => setWindows(previous => previous.map(item => item.id === entry.id ? { ...item, maximized: !item.maximized } : item))}>
            {entry.content}
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
