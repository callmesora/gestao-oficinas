/** ADR-012 target default: seek displayed text in server order, preserving explicit identity otherwise. */
export function selectAfterTableRead<Row extends { id: string }>(
  rows: readonly Row[],
  previous: string | null,
  search?: { term: string; value: (row: Row) => string },
): string | null {
  if (search && search.term !== "") {
    const prefix = search.term.toLocaleLowerCase("pt-PT");
    const match = rows.find(row => search.value(row).toLocaleLowerCase("pt-PT").startsWith(prefix));
    if (match) return match.id;
  }
  return rows.some(row => row.id === previous) ? previous : null;
}
