# ADR-015 — Descriptive state identity and writes

- Date: 2026-10-25
- Status: Accepted by delegated evidence/default decision
- Rows: SRC-0a8d1af823, SRC-ed234689af; no parity promotion

WIN_Form_estados_descritivos.wdw:38–66 requires only nonempty Codigo, then HAdd/HModify with duplicate item/value messages. Lines 336–348 disable code on edit and initialize false return. WIN_Table_estados_descritivos.wdw:202–238 uses selected records and modal refresh; 263–280 deletes the selected record without a relationship check. The schema/column mapping establishes Codigo text3, Descricao text100 nullable, signed automatic estados_descritivosID and an internal _row_id. Existing committed schema is unchanged.

Use exact string _row_id for selected writes/deletes; preserve source ID/provenance and untouched nullable text. Create under a table write lock, reject exact existing Codigo using source duplicate text and allocate max(existing positive ID,0)+1 only through signed maximum 9223372036854775807. No trim, uppercase, numeric coercion, mandatory description, relation guard, migration or anomaly repair. Exact text equality is an assumed reversible collation default under U-CB7C31CC-03. Imported duplicate codes remain individually editable/deletable.

One save/delete = one operation/transaction and committed success only. Ambiguous nonduplicate failure fallthrough becomes rollback/typed failure with the form open and no invented user text, following ADR-008/011. Default list order follows source estados_descritivosID with internal identity as deterministic interim tie. No guessed initial/after-delete selection; preserve explicit existing selection only. Whitelisted source-column sorting and header seek use ADR-012 defaults; unknown no-match/locale/native details remain U. Destructive cancellation remains ADR-006, never default Sim.

Selector returns Descricao (source line 484), not Codigo; cancel restores origem. Selector hides CRUD/printing, sets row height30, Fechar y506/height38 and shows previous/next (571–585). Valid selected-row movement follows source bounds. No-selection/invalid index/shared HFSQL context remain U-CC5618D6-02 and are not pinned by tests. The actual labor caller at WIN_Tempos_Reparacao_Estado.wdw:416 remains required with that workflow, not a synthetic caller verification claim.

Committed designer JPGs visibly show Código and Descrição. Screen-specific presentation overrides may use those visible labels where extraction contains replacement characters, retaining generated layout/source geometry. This is inferred image evidence pending human visual acceptance U-*-01, not an original file edit or blanket caption normalization. Development route/session follows ADR-009; production navigation/authentication and printing remain MIG-12/13. Applicable real database/API/browser/golden and native gates plus two sequential reviews precede slice closure.
