export type TerminalFileSnapshot = Readonly<
  { kind: "unknown" } | { kind: "new" } | { kind: "positioned"; id: string }
>;

// ADR-016: only the actual Postos cross-file dependency is shared between windows.
// Drafts, save buffers and unresolved implicit HFSQL cursor effects remain local.
export class TerminalFileContext {
  private current: TerminalFileSnapshot = Object.freeze({ kind: "unknown" });

  snapshot(): TerminalFileSnapshot { return this.current; }

  // WIN_Table_Terminais.wdw:180 resets before opening; cancellation does not undo it.
  reset(): void { this.current = Object.freeze({ kind: "new" }); }

  // Explicit edit/selection/save is a translation default; found folder seek is source-backed.
  position(id: string): void { this.current = Object.freeze({ kind: "positioned", id }); }

  // U-CDF1C34F-02: do not invent an implicit next record after deleting this position.
  deleted(id: string): void {
    if (this.current.kind === "positioned" && this.current.id === id) {
      this.current = Object.freeze({ kind: "unknown" });
    }
  }
}
