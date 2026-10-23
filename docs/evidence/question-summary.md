# Questions and unresolved evidence

Counts rechecked from the generated evidence and consolidated parity matrix on 23 October 2026.

| Count | Meaning | Where |
|---|---|---|
| 12 | Generated runtime questions: dialog Escape/default behavior, validate/select navigation and message-box appearance | [Runtime questions](encoded-actions.md) |
| 17 | Encoded-action groups whose proposals need confirmation; one group can cover many controls/windows | [Encoded actions](encoded-actions.md) |
| 481 | Unmapped parity rows recording outstanding runtime, designer, binary-template, literal and import evidence | [Parity matrix](../parity/parity.csv) |
| 425 | Distinct U identifiers referenced by those 481 rows; multiple rows can refer to the same issue | [Unit mapping notes](../mapping/README.md) |
| 326 | Assumed-confidence rows citing explicit proposals rather than confirmed observations | [Parity matrix](../parity/parity.csv) |

These counts overlap and must not be added into a grand total. The 481 technical rows are not 481 separate questions for the business owner. Some can be settled from further source/designer evidence or targeted tests; others need the legacy app or an owner decision.

No runtime Answer cells have been confirmed by executing the old application in this task. The answer sheet's Proposed values remain proposals. In particular the safe Escape proposal is not proof of the legacy dialog result.

The extraction and mapping deliverables are complete with these gaps tracked; they do not establish that every legacy behavior is already understood or tested. The completeness recheck found a missing separate inferred-event note; [event-codes-inferred.md](../mapping/event-codes-inferred.md) now records codes 32 and 196608 separately from the compiler-backed legend, and verify_step0.py checks for any uncovered raw code.
