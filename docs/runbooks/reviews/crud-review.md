# Independent Step 0 review — CRUD windows

Review date: 2026-10-23. Scope: 23 units below, mapped by another agent. This reviewer did not edit the mapping/specification/parity outputs or read mapper handoff/reasoning. Findings refer to the pre-fix snapshot and require mapper/parent correction. No application or legacy runtime was executed.

## Mechanical and newer evidence

All 23 invocations of `scripts/parity_check.py docs/parity/UNIT.csv --seed docs/parity/parity-seed.csv --element UNIT --check-files --note docs/mapping/UNIT.md --note docs/screens/UNIT.md` exited 0. Totals: 152 nonempty blocks, 156 encoded slots, 439 rows. All source seeds are present and each encoded action has an assumed/proposed row (shared IDs may cover repeated system slots).

To respect the one-writer rule for ignored evidence, the reviewer imported `scripts/unit_evidence.py` and called `pack(unit, latest)` entirely in memory. All 23 regenerated structures equal the kept packs. No newer evidence difference exists. Actual legacy source line slices match inspector block code after indentation normalization. All parsed dossier control dictionaries are copied exactly into the complete metadata section of each screen spec. This establishes transcription, not correctness of every English summary.

## Missing rows or events

No missing code block, seed or encoded-action group found. Stage statuses remain specified/unmapped, and proposed action/runtime answers remain assumed. No functionality is claimed implemented.

## Misread rules

### CR-01 — P1: vehicle validation is described as the wrong save algorithm

Where: `docs/mapping/WIN_Form_Viaturas.md:27`, `docs/parity/WIN_Form_Viaturas.csv`, row `SRC-0c045cf25e`.

The verified summary says “NewRecord selects HAdd versus HModify”. Actual `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:34-70` tests `estado="NOVO"`, uses HAdd only for that branch, and otherwise executes a concatenated UPDATE of Cliente, marca, modelo, Ano and mes WHERE matricula equals the original `codigo`. There is no HModify and no NewRecord branch. UPDATE failure is not inspected before ReturnedValue=True. The domain paragraph already says UPDATE, so the documents currently contradict themselves.

Fix: replace the summary and parity legacy_behavior with the exact estado/HAdd/UPDATE paths, original-key behavior, unchecked UPDATE outcome and uppercasing; retain source code and existing U failure coverage. Do not implement a different generic save path.

### CR-02 — P1: vehicle New button is described as edit selected record

Where: `docs/mapping/WIN_Table_Viaturas.md` event 278-284; parity row `SRC-48aefe45e0`.

The summary says “If a row is selected, edit its current record modally”. `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:278-284` instead captures the current registration, calls `Open(WIN_Form_Viaturas,"NOVO","")`, reexecutes the query only when the form returns true, then unconditionally seeks/reselects the old registration. It has no no-selection guard and does not call HReset. A row returning to a filtered-out registration remains an engine edge case, not an edit contract.

Fix: describe create mode, exact parameters, conditional refresh and unconditional restoration attempt; retain a U reference for no-row/failed-seek selection outcomes.

### CR-03 — P2: navigation is invented inside modify/delete summaries

The phrase “Move one row only within the 1-based bounds; do not wrap at either end” appears in the modify and delete rows of all 11 CRUD table windows (22 affected rows). These source events guard selection and edit/delete/refresh; they do not increment/decrement a row. For example, `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:292-295` only guards selection, opens the form and refreshes, whereas its real previous/next operations are 808-810 and 834-836.

Affected table units: WIN_Table_Clientes, WIN_Table_Terminais, WIN_Table_Viaturas, WIN_Table_artigos, WIN_Table_documentos, WIN_Table_estados_descritivos, WIN_Table_estados_reparacao, WIN_Table_mecanicos, WIN_Table_postos, WIN_Table_unidades and WIN_Table_utilizadores.

Fix: remove the navigation sentence from both event-note prose and CSV legacy_behavior for BTN_Modificar and BTN_Delete. Keep refresh/selection behavior exactly as the code states.

### CR-04 — P2: next-row summaries overclaim lower-bound safety

The same phrase overstates the actual next-row condition in WIN_Table_artigos, WIN_Table_documentos, WIN_Table_estado_reparacao_tipo3, WIN_Table_estados_descritivos, WIN_Table_mecanicos and WIN_Table_utilizadores. Example: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:834-836` checks only `TableSelect()<TableCount()` before selecting `current+1`. It does not require current>=1. If no-selection is -1 and count=0, the arithmetic requests index 0; what the engine then does belongs to the existing empty-selection U item.

Fix: describe the exact upper-bound-only guard and requested index; do not claim full 1-based safety. Reference existing empty/no-selection U coverage for the engine outcome. Real previous handlers do guard current>1.

### CR-05 — P2: color initialization summary invents a color chooser call

Where: `docs/mapping/WIN_Form_estados_reparacao.md:87`, its parity row for 528-536.

The end-of-initialization summary includes “SelectColor mutates the integer argument by reference”. `legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:528-536` contains FileToScreen, RADIO_NoName1=1 for new records, existing-record brush assignment, and ReturnedValue=False, but no SelectColor. The color chooser is a separate button event at 237-240.

Fix: remove the chooser/by-reference claim from initialization only; explicitly state the new-radio/existing-brush branches. Keep the chooser contract on its actual button event.

## Wrong confidence labels

CR-06 — The unsupported summary clauses in CR-01 through CR-05 are currently marked verified. Their source transcriptions are verified, but transcription does not validate an incorrect English interpretation. Correct the claims rather than merely downgrading everything; preserve evidence confidence for the code-supported parts. Counted as one systemic labeling finding; its concrete affected rows are specified above.

## Unresolved items evidence settles or narrows

No additional independently counted unresolved finding. The existing U01/U02/U03 items correctly leave visual approval, no-row/current-buffer/concurrency outcomes, SQL quoting and unhandled failures pending. Known customer max+1, barcode checks, postos' erroneous Terminais.NewRecord guard, selector return descriptions/codes and unchecked nonduplicate failures are already identified. Source code settles the erroneous summaries above; those are corrections, not new runtime questions.

## Implementer blockers

CR-07 — P2: important selector caller continuations are clipped rather than described.

Where: `docs/mapping/WIN_Table_artigos.md`, Direct caller context entries for `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778` and `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:702`.

The included snippets end before the result-loading code. In the first caller, lines 778-788 assign Open's result directly to EDT_codigo (even before testing empty), then on nonempty return execute a query, HReadFirst, copy description and price from the current query buffer, and focus the code input. In the second caller, lines 701-712 only replace the article code when the returned string is nonempty, then requery and load description and cancel the declaration. These different cancel/update/price contracts are important to article selection and money and cannot be inferred from the clipped snippets alone.

Fix: add concise explicit caller continuations and full durable line ranges to the selector entry/exit contract, or link directly to the reviewed caller event specifications plus summarize the cancel distinction and price read. Keep unchecked HReadFirst/failure outcomes in the existing U03. The vehicle picker has a similarly substantial caller continuation in `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454`; state that the caller reloads vehicle/customer/contact information rather than treating picker return as the complete form state.

## Unit coverage and adversarial checks

Every unit's note, screen, CSV, kept/current evidence, source code and designer metadata were inspected. All masks/flags/geometry dictionaries were compared exactly. Source code for all 152 blocks was read; the following shows the principal unit-specific checks. Images were independently inspected for article form/table and vehicle form/table.

| Unit | Source-specific checks | Result |
|---|---|---|
| WIN_Form_Clientes | max Codigo+1 scan, HReset, new/edit code enablement, default false, duplicate/nonduplicate save paths | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_Terminais | required code/description; folder seek mutates shared buffer; chooser assigns returned folder directly | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_Viaturas | estado save branch, original matricula key, uppercase, customer picker, unchecked update | Mechanical/current-evidence/metadata pass; CR-01/06 |
| WIN_Form_artigos | nonempty barcode duplicate exclusion on edit, required unit, price/stock bindings and masks; price is 8-byte real in schema and stock decimal | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_documentos | code-only validation; new stock radio value 1 after FileToScreen | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_estados_descritivos | code-only validation, disabled existing code, default false | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_estados_reparacao | new radio=1 versus existing color; chooser integer mutation; save branches | Mechanical/current-evidence/metadata pass; CR-05/06 |
| WIN_Form_mecanicos | required code/description/password; no user-form uppercase normalization; no secret values copied | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_postos | checks Terminais.NewRecord rather than postos.NewRecord; direct terminal picker assignment | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_unidades | code-only validation, disabled existing code, default false | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Form_utilizadores | required code/name/password; uppercase before ScreenToFile; false cancel/default | Mechanical/current-evidence/metadata pass; no additional finding |
| WIN_Table_Clientes | customer selection code/return origem; observation after row display; vehicle relationship delete guard | Mechanical/current-evidence/metadata pass; CR-03/06 |
| WIN_Table_Terminais | double-click mode, direct selection code, guarded delete/refresh without relationship query | Mechanical/current-evidence/metadata pass; CR-03/06 |
| WIN_Table_Viaturas | create/edit/restore registration, repair-order delete guard, SQL delete, query filters | Mechanical/current-evidence/metadata pass; CR-02/03/06/07 |
| WIN_Table_artigos | active/inactive combinations; at least one forced on; material-then-stock delete guards; selector layout/keyboard; price-loading caller | Mechanical/current-evidence/metadata pass; CR-03/06, CR-04/06, CR-07 |
| WIN_Table_documentos | stock 1/2 labels, cab_stocks relationship delete guard, code return, selector layout | Mechanical/current-evidence/metadata pass; CR-03/06, CR-04/06 |
| WIN_Table_estado_reparacao_tipo3 | types 3 OR 4 OR 5 sorted tipo; initial cancelar; displayed code return without empty guard | Mechanical/current-evidence/metadata pass; CR-04/06 |
| WIN_Table_estados_descritivos | returns Descricao rather than Codigo; selector layout; no relationship delete guard | Mechanical/current-evidence/metadata pass; CR-03/06, CR-04/06 |
| WIN_Table_estados_reparacao | all eight literal type labels; order relationship guard; code return | Mechanical/current-evidence/metadata pass; CR-03/06 |
| WIN_Table_mecanicos | sort col_inativo on init/CRUD; origem on close; selector layout; no relationship delete guard | Mechanical/current-evidence/metadata pass; CR-03/06, CR-04/06 |
| WIN_Table_postos | new-row GR_ACTION gray/active; create reset; edit current display; no relationship delete guard | Mechanical/current-evidence/metadata pass; CR-03/06 |
| WIN_Table_unidades | artigos.unidade relationship delete guard; new-row GR_ACTION changes | Mechanical/current-evidence/metadata pass; CR-03/06 |
| WIN_Table_utilizadores | origem default and selected code; selector layout; no relationship delete guard | Mechanical/current-evidence/metadata pass; CR-03/06, CR-04/06 |

## Counts and disposition

| Category | Findings |
|---|---:|
| Mechanical | 0 |
| Newer evidence | 0 |
| Missing rows/events | 0 |
| Misread rules | 5 |
| Wrong confidence | 1 systemic (overlaps corrections above) |
| Unresolved settled/narrowed | 0 additional |
| Implementer blockers | 1 |

Seven finding groups in total; six distinct corrections plus the overlapping labeling issue. Mechanical completeness passes for all23, but semantic approval is conditional on these corrections. Remaining U items still need runtime/designer evidence before their implementation; they do not authorize architecture or application coding. This review is read-only except for this report.

## Fix verification

The parent subsequently authorized this reviewer to act as the single fixer for the 23 CRUD units. The original findings above describe the pre-fix snapshot; this section records the follow-up edits. No legacy/source/application file, unrelated mapping, shared index or consolidated parity was changed.

Corrected source interpretations retain confidence=verified only for the actual code-supported claims; runtime/encoded proposals remain assumed and existing U items remain unresolved.

| Unit | Corrected / added parity IDs |
|---|---|
| WIN_Form_Viaturas | SRC-0c045cf25e |
| WIN_Form_estados_reparacao | SRC-a1521d6320 |
| WIN_Table_Clientes | SRC-b25815b4ba, SRC-0bb0e89335 |
| WIN_Table_Terminais | SRC-03e7cd854a, SRC-3ee5a8fb54 |
| WIN_Table_Viaturas | SRC-48aefe45e0, SRC-8523ffdea4, SRC-626e614259, RULE-C039C545-CALLER01 |
| WIN_Table_artigos | SRC-361896d316, SRC-1ad16daf34, SRC-466dbdec8c, RULE-C7738076-CALLER01, RULE-C7738076-CALLER02 |
| WIN_Table_documentos | SRC-3d9a9e304c, SRC-76449c8749, SRC-768b206713 |
| WIN_Table_estado_reparacao_tipo3 | SRC-cba41fdb9c |
| WIN_Table_estados_descritivos | SRC-15f5980a65, SRC-ed234689af, SRC-b4f27ecae7 |
| WIN_Table_estados_reparacao | SRC-c662b89f30, SRC-0981321613 |
| WIN_Table_mecanicos | SRC-934dda9b58, SRC-c47339c9bf, SRC-8f0a1d3e8c |
| WIN_Table_postos | SRC-f5f266e00c, SRC-55285e57c4 |
| WIN_Table_unidades | SRC-1d9610dd46, SRC-226f5f62f3 |
| WIN_Table_utilizadores | SRC-de66ef2034, SRC-68776c0653, SRC-351eb00915 |

CR-01: vehicle save now states estado/HAdd versus unchecked UPDATE. CR-02: vehicle New now states creation, conditional refresh and unconditional restoration. CR-03: removed the fabricated navigation clause from modify/delete in all 11 CRUD tables. CR-04: all six next handlers now state the upper-bound-only condition; their screen keyboard contracts distinguish the missing lower bound. CR-05: color initialization describes only FileToScreen/radio/brush/default-return, with the chooser left on its button event. CR-06: corrected unsupported verified claims rather than treating their prior wording as evidence. CR-07: added three verified caller-contract rows, detailed article price/description/cancel differences and vehicle/customer/contact continuation, and mirrored the contracts in the screen specs.

Validation completed: all 23 scoped parity checks exited 0 with --element, --check-files and both mapping/screen --note lints. All 152 original code blocks and 156 encoded slots remain covered. There are now 442 parity rows (439 retained plus three verified caller rules). A targeted semantic check confirms no modify/delete/next CSV keeps the fabricated full-bound navigation phrase and the vehicle save row states estado/UPDATE. Existing visual approval, no-selection/invalid-index engine behavior, shared buffer/filter concurrency, locale/coercion and failed read/write outcomes still require their declared U evidence. No runtime correctness or completed functionality is claimed.
