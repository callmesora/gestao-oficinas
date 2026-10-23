# Event meanings not established by compiler labels

These meanings are inferred from source structure and call contents. They are separate from the compiler-backed legend in event-codes.md; raw numeric codes are preserved in the source seed and unit maps.

| Raw code | Proposed meaning | Evidence | Confidence |
|---|---|---|---|
| 32 | Menu-option activation | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:486-487,497-498,508-509,527-534,544-551 and the other MENU__Menu option blocks. These blocks open/activate the selected table/workflow, print-filter route, exit, or run the named utility. | inferred; not compiler-backed |
| 196608 | Project startup/initialization | legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:697-774. The project-scoped block declares shared globals, performs the act.txt update branch, reads server settings and conditionally opens/replaces the HFSQL connection. | inferred event meaning; code and raw type are directly readable |

U-EVT-01: confirm the exact WINDEV 28 event labels from its editor/compiler output before promoting either meaning to compiler-verified. Interim: retain raw codes and source order, with inferred meaning only. No runtime event was executed to test these interpretations.

All other nonempty extracted block event codes are covered by the compiler-derived legend. This separate note was missing from the first Step 0 handoff even though the menu map already labeled code 32 as inferred; it was added during the completeness recheck.
