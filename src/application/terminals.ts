import type { TerminalList, TerminalListResult, TerminalSave, TerminalSaveResult, TerminalDeleteResult, TerminalFolderResult } from "../../packages/domain/src/terminals";
export interface TerminalRepository {
  list(input: TerminalList): Promise<TerminalListResult>;
  save(command: TerminalSave): Promise<TerminalSaveResult>;
  remove(id: string): Promise<TerminalDeleteResult>;
  prepareFolder(code: string): Promise<TerminalFolderResult>;
}
