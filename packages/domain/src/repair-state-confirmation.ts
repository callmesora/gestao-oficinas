/** WIN_Mudar_Estado283–284: source prompt; NULL display follows ADR-006/U-W20AB1F-05. */
export function repairStateConfirmationPrompt(state: string | null): string {
  return `Mudar estado da reparação para '${state ?? ""}'?`;
}

export type RepairStateConfirmationResult = 0 | 1;

/** WIN_Mudar_Estado198–202: compare the beginning without changing the supplied draft. */
export function repairStatePrefixMatches(state: string | null, letter: string): boolean {
  // UNRESOLVED U-W20AB1F-05: ADR-006 conservatively refuses empty/NULL, pending native evidence.
  if (state === null || letter === "") return false;
  return state.toLocaleLowerCase("pt-PT").startsWith(letter.toLocaleLowerCase("pt-PT"));
}
