# MIG-7A.2b — recovered designer mapping review

Separate sequential self-review using map-element/review-mapping under ADR-007 owner authorization; no fresh-context independence claim. Complete list map/spec/parity was read in the preceding customer slice and the exact appended claims rechecked against the unchanged raw dossier before implementation. Preserved before/reviewed unit packs under analysis-local; these paths are not published evidence references.

- Mechanical/new evidence: element gate PASS, 32 rows (4 verified, 23 implemented, 2 specified, 3 unmapped), zero missing U IDs. Raw source contains the exact named options, not new events/actions. No seed/status changed.
- Missing rows/events: none added; existing RULE-CC16AB27-028 owns complete designer controls. Existing event/action coverage is unchanged.
- Misread rules: parsed Display/Scrollbar=false must not be read as absence of vertical scrollbar. Raw Horz. scrollbar=Automatic and Vert. scrollbar=Always visible are separate properties. Corrected in spec/map before implementation.
- Confidence: exact named values are source-verified; native drawing/timing, locale, no-match/shared context and exact menu commands remain U-CC16AB27-01/02. No runtime target verification follows from this mapping correction.
- Narrowed unresolved: scrollbar modes, Search magnifier mode, truncated tooltip, pixel/touch scrolling and remember-sort/filter settings are known. Column context menu Yes alone does not enumerate its enabled commands.
- Implementer action: regenerate named options from raw evidence; use exact values rather than generic browser defaults. Keep remaining designer/native/caller obligations visible.

Counts: mechanical errors 0; missing events 0; misread-rule finding 1 corrected; wrong labels 0; unresolved categories narrowed 1; concrete implementation obligation recorded 1.
