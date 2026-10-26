# ROADMAP — Gestao Oficinas

Current local work: strict proof reconciliation (MIG-14V), main over be60dfe; no push. Strict verification840/2,273(37.0%), +76 after exact-assertion review and67 fresh witnesses; strict completion890/2,273(39.2%). Source confidence is unchanged;48 new verified rows retain accepted assumptions. Functional227/227(100.0%),53/53 screens and28/28 reports remain verified against unchanged app/tests. Built2,200(96.8%),23 unmapped,50 exclusions and481 source questions remain. Native deployment, other-host acceptance and import reconciliation stay separate; see the handoff and progress report.

Order follows templates/ROADMAP.template.md and accepted ADR-007. Step 0 commits: 7d3a5c7 and 637fc6b. Framing must close before foundation. The database/import and shared UI foundations and a usable customer workflow exist. Customer designer/native/report parity remains open; its core delivery and follow-up are tracked separately below.

## Trajectory guardrails

- The customer workflow established the real UI/API/database path after MIG-5b.1. Subsequent leaves and prerequisites follow their bounded dependencies below; historical delivery does not close native/whole-parent gates.
- MIG-6 is a query/helper backlog, not a gate to the first screen. Implement only the specific query/helper behavior a workflow needs, at its first consuming workflow, and record the concrete pattern in `docs/porting.md`. Do not port all 30 query units before a screen just to complete a foundation stage.
- After MIG-5b.1 closes, do not add more generic launcher/workspace/skin capabilities unless a cited customer parity row proves they block the customer workflow. Log other foundation gaps and handle them when a later screen needs them or at native acceptance.
- Every workflow stage must end with a user-visible route to the real screen, real data/actions for its stated scope, and parity rows/tests that prove those actions. Synthetic fixtures and rendered layouts are not screen implementation.
- Keep one workflow per brief. Do not build speculative shared abstractions; extract a pattern at the cleanup checkpoint only after at least two real workflows use it. Keep print/report behavior assigned to MIG-13 unless a brief explicitly includes its report and evidence.

Each group below must be split into bounded stage briefs for individual workflows before coding; a group is Done only when every owned unit meets the guide gates. Only the 50 hidden macro-editor actions are excluded by owner approval (ADR-007). Review/fix remains part of each slice.

| # | Phase | Slice | Ticket | Parity rows | Owner | Brief/evidence | Deliverable | Depends on | Status |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Mapping | Full inventory, extraction and reviewed mapping | STEP0 | all SRC seeds | implementer/reviewers | templates/mapping-prompt.md | 143 maps; evidence; 2,273 parity rows | — | Done |
| 1 | Framing | Guide/template alignment and accepted framing | MIG-2 | no parity moves | planner | docs/migration-history.md#stage-1 | AGENTS, ADRs, architecture/data contract and roadmap | 0 | Done |
| 2 | Foundation | Scaffold, verification, generated contracts, preview and CI | MIG-3 | foundation tests; no business parity | implementer | docs/migration-history.md#stage-2 | verify green; bindings drift check; native health command; UI harness | 1 | In progress |
| 2a | Foundation | Core verification and Windows build | MIG-3 | no business parity | implementer | docs/migration-history.md#stage-2 | full verify/build pass locally and hosted; actual native IPC passes locally | 1 | Done |
| 2b | Verification follow-up | Hosted native WebView2 automation | MIG-3 | no business parity | implementer | docs/migration-history.md#stage-2 | resolve hosted CDP startup failure; keep existing test intact | 2a | To do |
| 3 | Foundation | Every table/field, schema v1, fixtures and import dry run | MIG-4 | table rows | implementer + 2 reviews | docs/migration-history.md#stage-3 | column mappings; real PostgreSQL import/reconciliation/restore tests | 2a | Done |
| 3b | Foundation | Skin primitives, every generated layout and skin assets | MIG-5 | template/dialog rows | implementer/reviewer | docs/migration-history.md#stage-4 | skin kit; scored windows; asset inventory; temporary launcher | 2a | In progress |
| 3b.1 | Foundation | Generated layouts and referenced skin images | MIG-5a | no behavior status moves | implementer/reviewer | docs/migration-history.md#stage-4 | 53 reproducible layouts; checked image/state inventory | 2a | Done |
| 3b.2 | Foundation | Shared primitives, temporary launcher and visual/keyboard checks | MIG-5b | template/dialog rows | implementer/reviewer | docs/migration-history.md#stage-4 | shared controls, table base, awaited dialogs and text/input sizing including optional character-limit width checked; scoped caption shortcuts and temporary workspace launcher checked; shared anchor defaults checked; column width/order persistence, manual resize/saved geometry and edit password/length/Tab/selection defaults checked; remaining table/dialog features, native limits/lifetime and full-window gates pending | 3b.1 | In progress |
| 3b.2a | Foundation | Shared screen prerequisite | MIG-5b.1 | no parity moves | implementer/reviewer | docs/migration-history.md#stage-4 | existing generated controls, table, workspace and awaited dialogs pass foundation verification | 3b.1 | Done |
| 3b.2b | Consumer verification | Full windows and evidenced table/form behavior | MIG-5b.2 | consumer rows, first RULE-C286277B-011 and RULE-CC16AB27-028 | implementer/reviewer | docs/migration-history.md#stage-4 | implement/check with each real workflow; first consumer MIG-7A | 3b.2a | To do |
| 3b.2c | Native acceptance follow-up | Remaining shared native and unresolved skin behavior | MIG-5b.3 | existing dialog/template/U rows retained | implementer + owner | docs/migration-history.md#stage-4 | U-SKIN-01..06, native dialog/chrome/clipboard/appearance accepted under MIG-15 | 13 | To do |
| 4 | Slice backlog | Query semantics and shared WLanguage helpers, implemented with their first consuming workflow | MIG-6 | QRY rows; named helper rules | implementer/reviewer | templates/prompt-stage.md | bounded query/helper behavior with real consumer-path evidence; this group is not a prerequisite for the first customer screen | 3 | To do — incremental, not a screen gate |
| 5 | Slice | First real workflow: customer list and form | MIG-7A | `docs/parity/WIN_Table_Clientes.csv`; `docs/parity/WIN_Form_Clientes.csv` | implementer/reviewer | docs/migration-history.md#stage-5 | real customer list/form, customer data path, add/edit/search/select/delete behavior in scope, visible app route and parity evidence | 3, 3b.2a | In progress |
| 5.1 | Slice delivery | Usable customer list/form core | MIG-7A.1 | tested customer business rows; designer/U/report rows retained | implementer + 2 reviews | docs/migration-history.md#stage-5 | real customer/session/API/PostgreSQL, imported replay, golden and UI checks | 3, 3b.2a | Done |
| 5.2 | Consumer follow-up | Customer designer/table features and caller audit | MIG-7A.2 | RULE-CC16AB27-028; RULE-C286277B-011; existing customer U rows | implementer + 2 reviews | docs/migration-history.md#stage-5-followup | column search/config/scrollbars, masks/keys and real vehicle caller coupling | 6 | In progress |
| 5.2a | Bounded consumer delivery | Customer header search and saved visibility | MIG-7A.2a | RULE-CC16AB27-028 remains implemented | implementer + 2 reviews | docs/migration-history.md#stage-5-table-details | real API prefix seek/observation/return; visibility/width/order/reset; 70 TS/DB, 58 browser, native metadata; parent remainder retained | 6 | Done |
| 5.2b | Bounded consumer delivery | Source table options, visible scrollbar and truncated tooltip | MIG-7A.2b | RULE-CC16AB27-028 remains implemented | implementer + 2 reviews | docs/migration-history.md#stage-5-designer-audit | reproducible metadata; actual scroll/tooltip/context/keys/picker checks; final 20 browser and native pass; full parent retained under ADR-014 | 5.2a | Done |
| 5a | Slice | Vehicle list and form | MIG-7B | WIN_Table_Viaturas and WIN_Form_Viaturas CSVs | implementer/reviewer | docs/migration-history.md#stage-6-vehicles | real vehicle workflow after customers, required helpers only | 3, 3b.2a, 5.1 | In progress |
| 5a.1 | Slice delivery | Usable vehicle list/form and actual customer picker | MIG-7B.1 | tested vehicle events; designer/U/report/caller retained | implementer + 2 reviews | docs/migration-history.md#stage-6-vehicles | real API/PostgreSQL, imported replay, golden, browser/visual/native metadata checks | 3, 3b.2a, 5.1 | Done |
| 5a.2 | Consumer follow-up | Vehicle designer/table and caller audit | MIG-7B.2 | RULE-C039C545-025; RULE-C9675195-013; existing U rows | implementer + 2 reviews | docs/migration-history.md#stage-6-vehicles-followup | masks/keys/table/config/scrollbars/coupling; repair-order continuation with MIG-8 | 6 | To do |
| 5b | Slice | Unidades: simplest independent lookup list/form | MIG-7D | WIN_Table_unidades and WIN_Form_unidades CSVs | implementer + 2 reviews | docs/migration-history.md#stage-7-units | third real workflow; two text fields, no picker/query dependency, article-protected delete | 5a.1 | In progress |
| 5b.1 | Slice delivery | Usable unit list/form core | MIG-7D.1 | implemented unit business rows; designer/U/report retained | implementer + 2 reviews | docs/migration-history.md#stage-7-units | real API/PostgreSQL, article-safe delete, imported/golden/browser/visual gates | 5a.1 | Done |
| 5b.2 | Consumer follow-up | Units designer/table and keyboard audit | MIG-7D.2 | RULE-CCB16084-014; RULE-C77806F9-010; existing U/input-row rows | implementer + 2 reviews | docs/migration-history.md#stage-7-units-followup | source-enabled search/config/scrollbars and exact key/context obligations | 6 | To do |
| 6 | Cleanup | Cleanup checkpoint after the first 2–3 real workflows | MIG-7C | existing customer/vehicle/unit rows; no status promotion | implementer + 2 reviews | docs/migration-history.md#stage-8-cleanup | signed source ID exhaustion guarded/tested; three-consumer HTTP/connection extraction; architecture/porting current; 69 TS/DB + 56 browser + native metadata checks | 5.1, 5a.1, 5b.1 | Done |
| 6a | Slice | Remaining leaf lookups and list/form workflows | MIG-7 | assigned units below, excluding completed pairs | implementer/reviewer | templates/prompt-stage.md | one bounded workflow brief per pair; pull only its required query/helper units | 6, 5.2a, bounded 5.2b delivery (ADR-014) | In progress |
| 6a.1 | Slice | Estados descritivos list/form and description picker | MIG-7E | WIN_Table_estados_descritivos; WIN_Form_estados_descritivos | implementer + 2 reviews | docs/migration-history.md#stage-9-descriptive-states | real text-key writes and source description-returning selector; full evidence first | 6, bounded 5.2b delivery | In progress |
| 6a.1a | Slice delivery | Usable descriptive-state core and actual selector mode | MIG-7E.1 | 20 source/event/designer rows implemented; no verified promotion | implementer + 2 reviews | docs/migration-history.md#stage-9-descriptive-states | real API/PostgreSQL/list/form/selector; 78 TS/DB + 67 browser + native metadata; five imported projections; full parent obligations retained | bounded 5.2b delivery | Done |
| 6a.1b | Consumer follow-up | Descriptive-state designer and real labor caller | MIG-7E.2 | retained U/designer/report/caller obligations | implementer + owner | docs/migration-history.md#stage-9-descriptive-states-followup | known modal/input work at C2, actual labor continuation MIG-10 and report MIG-13; exact native/runtime U gates | 6a.1a | To do |
| 6a.2 | Slice | Terminais list/form and code selector | MIG-7F | WIN_Table_Terminais; WIN_Form_Terminais | implementer + 2 reviews | docs/migration-history.md#stage-10-terminals | real terminal core delivered; full retained designer/caller obligations remain | 6a.1a | In progress |
| 6a.2a | Slice delivery | Usable terminal list/form, selector and actual native folder | MIG-7F.1 | 22 event/designer rows implemented; U rows retained | implementer + 2 reviews | docs/migration-history.md#stage-10-terminals | 87 TS/DB, 71 browser, 3 Rust, metadata native plus actual WebView2/API/DB/native folder save; original terminal copy empty | 6a.1a | Done |
| 6a.2b | Consumer follow-up | Terminal designer and actual postos caller | MIG-7F.2 | retained terminal designer/U/caller rows | implementer + owner | docs/migration-history.md#stage-10-terminals-followup | C2 masks/geometry and actual Postos caller delivered; precise native/runtime U gates retained | 6a.2a | In progress |
| 6a.C2 | Scheduled cleanup | Designer/caller checkpoint after two additional leaf workflows | MIG-7C2 | retained customer/vehicle/unit/descriptive-state/terminal designer/U rows | implementer + 2 reviews | docs/runbooks/stage-11-designer-checkpoint.md | modal geometry, numeric entry, exact menu/scrollbar tooltip and caller/context work; full parents remain open | 6a.1a and 6a.2a | Done — scheduled target work; full parents/U gates remain open |
| 6a.C2.1 | Bounded checkpoint | Real modal geometry and key ownership | MIG-7C2.1 | eight broad designer rows retained implemented | Codex root + 2 independent reviewers, macOS arm64 | docs/runbooks/stage-11-designer-checkpoint.md | five forms/three pickers, mounted drafts, source anchors, saved geometry and vehicle intra-container Tab order; native U gates retained | 6a.1a and 6a.2a | Done |
| 6a.C2.2 | Bounded checkpoint | Live numeric masks and safe vehicle conversion | MIG-7C2.2 | customer/vehicle/terminal designer rows remain implemented | root integration + isolated implementer + 2 independent reviewers, macOS arm64 | docs/runbooks/stage-11-designer-checkpoint.md | seven real numeric fields, exact strings/loaded overflow/NULL preservation, ordered required checks and no NaN-to-null transport | 6a.C2.1 | Done |
| 6a.C2.3 | Bounded checkpoint | Real vehicle/unit table designer options | MIG-7C2.3 | vehicle/unit/terminal broad designer rows remain implemented | root + 2 independent reviewers, macOS arm64 | docs/runbooks/stage-11-designer-checkpoint.md | fixed header seek with effective filter, saved columns, source scrolling/row height/truncation and positive terminal audit | 6a.C2.2 | Done |
| 6a.C2.4 | Bounded checkpoint | Eligible text-key assistance and actual customer caller | MIG-7C2.4 | four form designer rows and three actual vehicle caller events retain status | root + isolated implementers + 2 independent reviewers, macOS arm64 | docs/runbooks/stage-11-designer-checkpoint.md | exact filtered candidates/dirty acceptance/local keys; real edit/select/cancel refresh, stale result/failure ownership and positive registration reselect | 6a.C2.3 | Done |
| 6a.3 | Slice | Postos list/form and actual terminal caller | MIG-7G | WIN_Table_postos; WIN_Form_postos | root + isolated implementers + 2 independent reviews | docs/migration-history.md#stage-12-postos | selected numeric key writes, hidden field preservation, captured terminal NewRecord context and actual nested picker | 6a.C2 | In progress |
| 6a.3a | Slice delivery | Usable Postos core and actual terminal caller | MIG-7G.1 | 22 event/designer/domain rows implemented; U/UMC/raw new-line retained | root + isolated implementers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-12-postos | 118 TS/DB, 3 Rust, 104 browser; sixth spec-derived golden; visual checks and debug macOS bundle | 6a.C2 | Done |
| 6a.3b | Consumer follow-up | Postos native/runtime and hardware caller | MIG-7G.2 | retained U/designer/raw new-line/UMC obligations | implementer + owner | docs/migration-history.md#stage-12-postos | exact HFSQL/NewRecord/native behavior and later hardware consumer; no exclusions | 6a.3a | To do |
| 6a.4 | Slice | Mecânicos list/form and code selector | MIG-7H | WIN_Table_mecanicos; WIN_Form_mecanicos | root + isolated implementers + 2 independent reviews | docs/migration-history.md#stage-13-mechanics | actual protected persistence, nullable inactive checkbox, masked selected-record read and source selector/refresh/sort | 6a.3a | In progress |
| 6a.4a | Slice delivery | Usable Mecânicos core and selector | MIG-7H.1 | 28 event/designer/domain rows implemented; U/report/UMC retained | root + isolated implementers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-13-mechanics | 133 TS/DB,3 Rust,112 browser, seventh spec-derived golden; original11 public projection, visual checks and debug macOS bundle | 6a.3a | Done |
| 6a.4b | Consumer follow-up | Mecânicos actual callers, authorization and native/runtime | MIG-7H.2 | retained U/designer/report/query/caller obligations | implementer + owner | docs/migration-history.md#stage-13-mechanics | repair/material/labor/stock/report-filter callers at consuming stages; query/access and report/native gates retained | 6a.4a | To do |
| 6a.C3 | Cleanup | Operation lifecycle and source selector predicates | MIG-7C3 | existing workflow failure/descriptive-selector rows; no status promotion | root + isolated writer + 2 independent reviews | docs/migration-history.md#stage-14-reliability-checkpoint | real lost-connection-after-write rollback/API evidence, narrow client lifecycle and known source navigation predicates | 6a.3a,6a.4a | Done — bounded cleanup; native/runtime gates retained |
| 6a.5 | Slice | Ordinary repair-state list/form and color chooser | MIG-7I | WIN_Table_estados_reparacao; WIN_Form_estados_reparacao | root + isolated domain/UI/native implementers + 2 independent reviews | docs/migration-history.md#stage-15-repair-states | protected text-key persistence, nullable flags/unsigned32 Cor, source preview/chooser continuation and reusable RAD/radio controls | 6a.C3 | In progress |
| 6a.5a | Slice delivery | Usable repair-state core, ordinary selector and RAD controls | MIG-7I.1 | 26 existing event/designer/domain rows implemented; U/report/UMC retained | root + isolated implementers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-15-repair-states | 194 TS/DB,9 Rust,122 browser, eighth spec-derived golden; original11 projection/guard/title, visual checks, debug Mac bundle and actual zero-daemon shutdown | 6a.C3 | Done |
| 6a.5b | Consumer follow-up | Repair-state time caller, native chooser and runtime | MIG-7I.2 | retained U/designer/report/UMC and distinct tipo3 selector | implementer + owner | docs/migration-history.md#stage-15-repair-states | actual time caller/types3/4/5, Windows/shared build and interactive native chooser/lifetime; exact HFSQL/print/UMC obligations retained | 6a.5a | To do |
| 6a.6p | Bounded prerequisite | Recover literal checkbox/image column metadata | MIG-7J.0 | existing designer rows; no status promotion | root + isolated parser writer + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-16-column-metadata | 15 Python pass/1 existing Windows skip; source reproduction, nine layouts/ten columns, actual Mecânicos63px/Center,194 TS/DB,9 Rust,122 browser and debug Mac bundle | 6a.5a | Done |
| 6a.6 | Slice | Documentos list/form and stock-type selector | MIG-7J | WIN_Table_documentos; WIN_Form_documentos | root + isolated domain/UI implementers + 2 independent reviews | docs/migration-history.md#stage-17-document-types | second RAD/radio consumer, exact text-key/nullable stock flag writes, cab_stocks code guard and source selector/refresh contract | 6a.6p | In progress |
| 6a.6a | Slice delivery | Usable Documentos core and exact string selector | MIG-7J.1 | 31 existing window rows implemented; U/report/UMC retained | root + isolated implementers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-17-document-types | 213 TS/DB,9 Rust,130 browser, ninth spec-derived golden; original4 projection/guard, visual checks, debug Mac bundle and zero-daemon shutdown | 6a.6p | Done |
| 6a.6b | Consumer follow-up | Documentos stock callers and native/runtime | MIG-7J.2 | retained U/designer/report/UMC and stock/menu caller obligations | implementer + owner | docs/migration-history.md#stage-17-document-types | actual stock selection continuation/filter, native/Windows/HFSQL/runtime/report and human acceptance | 6a.6a | To do |
| 6a.C4 | Cleanup | Two-consumer table selection policy and evidence audit | MIG-7C4 | existing repair-state/Documentos designer/U rows unchanged | root + isolated writer + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-18-selection-checkpoint | pure displayed-prefix/identity retention, real delayed-result/failure proofs and separate platform visual progress;217 TS/DB,9 Rust,132 browser,18 Python pass/1 existing Windows skip, debug Mac bundle | 6a.5a,6a.6a | Done — bounded cleanup; native/runtime gates retained |
| 6a.C4.3 | Bounded prerequisite | Numeric source ordering before string transport | MIG-7C4.3 | existing five list contracts; no status promotion | root + read-only audit + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-19-typed-order | six actual baseline failures→pass, real header-selection proof;223 TS/DB,9Rust,133browser,nine existing goldens, debug Mac bundle and zero-daemon shutdown | 6a.C4 | Done — numeric source types restored; runtime gates retained |
| 6a.7 | Slice | Artigos list/form and ordinary code selector | MIG-7K | WIN_Table_artigos; WIN_Form_artigos | root + isolated domain/UI/controls writers + 2 independent reviews | docs/migration-history.md#stage-20-articles | reusable decimal entry/display and unit combo, exact source filters/barcode/guard/stock contract | 6a.C4.3,5b.1 | In progress |
| 6a.7a | Slice delivery | Usable Artigos core and exact string selector | MIG-7K.1 | 36 stable window rows implemented; U/virtual keyboard/callers/report/UMC retained | root + isolated writers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-20-articles | 257 TS/DB,9Rust,145browser, tenth spec-derived golden; original15558 projection/guard, visual checks, debug Mac bundle and owned zero-daemon shutdown | 6a.C4.3,5b.1 | Done — local core; native/runtime gates retained |
| 6a.7b | Consumer follow-up | Artigos material/stock callers and native/runtime | MIG-7K.2 | retained virtual-keyboard/init/whole-list domain/callers/U/report/UMC obligations | implementer + owner | docs/migration-history.md#stage-20-articles | actual distinct material/stock continuation, movement/reconstruction, source virtual keyboard, native/Windows/HFSQL/runtime and human acceptance | 6a.7a | To do |
| 6a.8 | Slice | Utilizadores list/form and ordinary code selector | MIG-7L | WIN_Table_utilizadores; WIN_Form_utilizadores | root + isolated domain/UI writers + 2 independent reviews | docs/migration-history.md#stage-21-users | existing RAD controls, protected public/selected credential boundary, source unconditional uppercase and exact selector/refresh | 6a.7a | In progress |
| 6a.8a | Slice delivery | Usable Utilizadores core and numeric selector | MIG-7L.1 | 27 stable window rows implemented; U/actual callers/access/report/UMC retained | root + isolated writers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-21-users | 280 TS/DB,9Rust,155browser, eleventh spec-derived public golden; original1public projection/0credential reads, actual synthetic lowercase/NULL smoke, visual checks and zero-daemon shutdown | 6a.7a | Done — local core; native/runtime gates retained |
| 6a.8b | Consumer follow-up | Utilizadores actual repair/access/menu callers and native/runtime | MIG-7L.2 | retained U/report/UMC and real caller/access obligations | implementer + owner | docs/migration-history.md#stage-21-users | unconditional repair combo continuation, actual access/bootstrap/session behavior, native/Windows/HFSQL/runtime/human acceptance | 6a.8a | To do |
| 6a.9 | Pulled-forward prerequisite | Repair-state confirmation dialog and source caption alignment | MIG-10P.1 | 16 stable rows implemented; WIN_Mudar_Estado retains MIG10 ownership/U/UMC/caller gates | root + isolated UI/metadata writers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-22-state-confirmation | 283TS/DB,9Rust,165browser; actual2Center regressions, strict96caption/49layout audit, standalone UI golden, visual and debug Mac bundle/zero-daemon checks | 6a.8a,6a.5a | Done — local prerequisite; native/runtime gates retained |
| 6a.10 | Dialog prerequisite | WIN_Data plain-date prompt and reusable calendar entry | MIG-7M.1 | 7 stable rows implemented; existing MIG7 ownership/U/offcanvas/caller gates retained | root + isolated domain/metadata/UI writers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-23-date-prompt | 292TS/DB,9Rust,182browser; actual native popup/partial/NULL-clear regressions, exact20Date/10layout audit, UI golden/visual and debug Mac build/zero-daemon checks | 6a.9 | Done — local prerequisite; native/runtime gates retained |
| 7 | Slice | Repair order list/form and caller contracts | MIG-8 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | complete workflow; persistence; concurrent/failure paths | 6, 6a | In progress |
| 7a | Bounded slice | Repair list, source filters and state defaults | MIG-8.1 | 18 source rows implemented; U/native/full-form gates retained | root + isolated writers + 2 independent reviews, macOS arm64 | docs/migration-history.md#stage-24-repair-list | real PG/API, DateTime/RAD/qualified metadata, golden, original read-only projection, browser/visual/full checks | 6a.10 | Done — local implementation; external acceptance retained |
| 7a.C1 | Cleanup | Consolidate migration documentation | MIG-8.C1 | no behavior/parity changes | root + independent review | docs/runbooks/current-stage.md | rolling handoff, one concise history ledger, repaired references and preserved source/evidence/operational procedures | 7a | Done — documentation only |
| 7b | Next slice | Full repair form and actual New/Edit/Delete continuations | MIG-8.2 | remaining repair form/list callers | root + isolated writers + 2 independent reviews | templates/prompt-stage.md | source validation and Date prompts, captured customer, current-value preservation, atomic save/delete and actual callers | 7a.C1 | Done — local implementation/checks; Information/native/runtime gates retained |
| 8 | Slice | Repair materials and quantity/password workflows | MIG-9 | assigned units below | implementer + coordinator integration | templates/prompt-stage.md | material writes, stock effects and caller results | 7 | Initial implementation delivered — source/native gaps retained |
| 9 | Slice | Labor timers, state transitions and descriptions | MIG-10 | assigned units below | implementer + coordinator integration | templates/prompt-stage.md | clock/state/locking workflows and duration checks | 7, 8 | Initial implementation delivered — source/native gaps retained |
| 9.C1 | Cleanup | Consolidate repeated repair workflow patterns | MIG-10C1 | existing rows; no automatic promotions | root + independent review | templates/prompt-stage.md | bounded cleanup after integrated repair form/materials/labor; retain behavior and reuse active brief | 8, 9 | Done — initial caller composition/CalendarNo reuse; focused checks, broader consolidation after breadth |
| 10 | Slice | Stock documents, scanners, inventory and reconstruction | MIG-11 | assigned units below | isolated implementer + coordinator | templates/prompt-stage.md | real document CRUD/stock effects, inventory/rebuild and selected-file scanner | 8, 9 | Configured native file reader delivered — physical device/charset/other-host and U gates retained |
| 11 | Slice | Startup, access, system, menu and launch modes | MIG-12 | assigned units below | isolated implementer + coordinator | templates/prompt-stage.md | persistent user access/menu, configuration save, launch modes and shared touch keyboards | 5, 7, 8, 9, 10 | Local persistent/native startup and explicit mechanic credentials delivered — updater/INI/other-host gates retained |
| 12 | Slice | Every report/filter and print destination | MIG-13 | assigned units below | isolated implementer + coordinator | templates/prompt-stage.md | 28 initial data/render paths, three filter screens, offline Paged.js/Chromium preview/PDF and actual callers | 7, 8, 9, 10, 11 | Offline runtime pins, source flow/margins/totals/company delivered — legacy fidelity, host packaging/native printing retained |
| 13 | Cleanup | Resolve remaining U items and review all parity claims | MIG-14 | all remaining rows | coordinator + isolated writers | docs/runbooks/current-stage.md | exact source-event proofs, concrete fixes, no silent exclusions; assumed choices traced to proposals/ADRs | 12 | In progress — 840/2,273 verified (+76 this pass), 2,200 built; 23 unmapped and 481 source questions remain; native acceptance retained |
| 13.F | Functional verification | Required workshop workflows across every screen/report | MIG-14F | separate functional inventory; strict statuses unchanged | root + scope workers + independent check | docs/functional-acceptance.json | explicit workflows, exact executed tests/OS/compatible commit and visible remaining checks | 12 | 227/227 verified;53/53 screens,28/28 reports; platform/source gates separate |
| 14 | Acceptance | Installer, upgrade, restore, devices and full reconciliation | MIG-15 | all plus platform rows | implementer + owner | templates/prompt-stage.md | native Windows acceptance and data reconciliation artifacts | 13 | Local fresh-profile recovery prerequisite delivered; full acceptance to do |
| 15 | Cutover | Rehearsal and explicit production transition plan | MIG-16 | all | owner + implementer | 08-data-migration.md | complete gate; freeze/rollback plan; owner acceptance | 14 | To do |

## Complete unit ownership

All 143 per-unit CSVs retain their seed IDs. This assignment is a scheduling index, not a claim of implementation or a blanket dependency. MIG-6 rows stay assigned to MIG-6, but each is implemented alongside its first real consumer; the first customer brief may cover only the behaviors it needs. Shared dialogs/helpers remain dependencies of their callers; authentication/authorization must guard protected server operations before exposure even though full access-screen parity comes later. The first leaf slices are customer, vehicle and simple lookup list/form pairs; later briefs state exact IDs from their CSVs.

| Unit | Ticket |
|---|---|
| Clientes | MIG-4 |
| MediaPlayer_0_D | MIG-5 |
| MediaPlayer_1 | MIG-5 |
| MediaPlayer_13 | MIG-5 |
| MediaPlayer_22 | MIG-5 |
| MediaPlayer_23 | MIG-5 |
| MediaPlayer_24 | MIG-5 |
| MediaPlayer_Etiquette | MIG-5 |
| MediaPlayer_Fiche | MIG-5 |
| MediaPlayer_Form | MIG-5 |
| MediaPlayer_Label | MIG-5 |
| MediaPlayer_Mailing | MIG-5 |
| MediaPlayer_MailingUS | MIG-5 |
| MediaPlayer_Table | MIG-5 |
| MediaPlayer_TableUS | MIG-5 |
| My_GestaoOficinas | MIG-12 |
| QRY_Union_lin_stocks_material_reparacao | MIG-6 |
| QRY_insert_material_reparacao | MIG-6 |
| QRY_insert_ordens_reparacao | MIG-6 |
| QRY_noname | MIG-6 |
| QRY_select_cab_lin_stocks | MIG-6 |
| QRY_select_cab_stocks | MIG-6 |
| QRY_select_cliente_codigo | MIG-6 |
| QRY_select_consumo_material_viatura | MIG-6 |
| QRY_select_lin_stocks | MIG-6 |
| QRY_select_material_ordem_Reparacao | MIG-6 |
| QRY_select_material_reparacao | MIG-6 |
| QRY_select_mecanicos_codigo | MIG-6 |
| QRY_select_ordens_reparacao | MIG-6 |
| QRY_select_ordens_reparacao_data_entrega | MIG-6 |
| QRY_select_ordens_reparacao_data_pag | MIG-6 |
| QRY_select_ordens_reparacao_matricula | MIG-6 |
| QRY_select_ordens_reparacao_numero | MIG-6 |
| QRY_select_ordens_reparacao_tempos | MIG-6 |
| QRY_select_tempos_Reparacao_numero_mecanico | MIG-6 |
| QRY_select_tempos_reparacao_ordem | MIG-6 |
| QRY_select_viatura_matricula | MIG-6 |
| QRY_select_viaturas | MIG-6 |
| QRY_tempos_ordem_reparacao | MIG-6 |
| QRY_tempos_ordem_reparacao_matricula | MIG-6 |
| QRY_tempos_ordem_reparacao_mecanico | MIG-6 |
| QRY_union_extrato_artigos | MIG-6 |
| QRY_union_extrato_artigos_calcular_total | MIG-6 |
| QRY_union_lin_stocks | MIG-6 |
| QRY_union_material_reparacao | MIG-6 |
| QRY_update_ordens_reparacao | MIG-6 |
| RPT_Consumo_Material_Descriminado_Ordens | MIG-13 |
| RPT_Consumo_Material_Descriminado_Saidas | MIG-13 |
| RPT_Consumo_Material_Descriminado_ordens_saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_Saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_ordem_saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_ordens | MIG-13 |
| RPT_Consumo_Material_Viatura_Descriminado | MIG-13 |
| RPT_Consumo_Material_Viatura_Resumo | MIG-13 |
| RPT_Extrato_artigos | MIG-13 |
| RPT_List_Clientes | MIG-13 |
| RPT_List_Viaturas | MIG-13 |
| RPT_List_artigos | MIG-13 |
| RPT_List_documentos | MIG-13 |
| RPT_List_estados_descritivos | MIG-13 |
| RPT_List_estados_reparacao | MIG-13 |
| RPT_List_mecanicos | MIG-13 |
| RPT_List_unidades | MIG-13 |
| RPT_List_utilizadores | MIG-13 |
| RPT_Materiais | MIG-13 |
| RPT_Ordens_Reparacao | MIG-13 |
| RPT_Ordens_Reparacao_DataEntrega | MIG-13 |
| RPT_Ordens_Reparacao_DataPag | MIG-13 |
| RPT_Servico_Avaria | MIG-13 |
| RPT_Tempos_Ordem_Reparacao | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_Mecanico | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_viatura | MIG-13 |
| RPT_inventario | MIG-13 |
| Terminais | MIG-4 |
| Viaturas | MIG-4 |
| WINDEVDIALOGBOX | MIG-5 |
| WINDEVMESSAGEBOX | MIG-5 |
| WIN_Acesso | MIG-12 |
| WIN_Data | MIG-7 |
| WIN_Extrato_Artigos | MIG-11 |
| WIN_Filtro_Mapas_Artigos | MIG-13 |
| WIN_Filtro_Mapas_Tempos | MIG-10 |
| WIN_Form_Clientes | MIG-7 |
| WIN_Form_Terminais | MIG-7 |
| WIN_Form_Viaturas | MIG-7 |
| WIN_Form_artigos | MIG-7 |
| WIN_Form_documentos | MIG-7 |
| WIN_Form_estados_descritivos | MIG-7 |
| WIN_Form_estados_reparacao | MIG-7 |
| WIN_Form_mecanicos | MIG-7H |
| WIN_Form_postos | MIG-7G |
| WIN_Form_unidades | MIG-7 |
| WIN_Form_utilizadores | MIG-7 |
| WIN_Inserir_quantidade_password | MIG-7 |
| WIN_Inventario | MIG-11 |
| WIN_Inventario_Reconstrucao | MIG-11 |
| WIN_Leitor_cod_barras | MIG-11 |
| WIN_Leitor_cod_barras_desconhecidos | MIG-11 |
| WIN_MENU | MIG-12 |
| WIN_Mapa_Vendas | MIG-13 |
| WIN_Material_Reparacao | MIG-9 |
| WIN_Material_reparacao_form | MIG-9 |
| WIN_Mudar_Estado | MIG-10 |
| WIN_Ordens_Reparacao | MIG-8 |
| WIN_Ordens_Reparacao_Form | MIG-8 |
| WIN_Reconstrucao_Stocks | MIG-11 |
| WIN_Table_Clientes | MIG-7 |
| WIN_Table_Lin_Stocks | MIG-11 |
| WIN_Table_Tempos_materiais_Descricoes | MIG-10 |
| WIN_Table_Terminais | MIG-7 |
| WIN_Table_Viaturas | MIG-7 |
| WIN_Table_artigos | MIG-7 |
| WIN_Table_cab_stocks | MIG-11 |
| WIN_Table_documentos | MIG-7 |
| WIN_Table_estado_reparacao_tipo3 | MIG-7 |
| WIN_Table_estados_descritivos | MIG-7 |
| WIN_Table_estados_reparacao | MIG-7 |
| WIN_Table_mecanicos | MIG-7H |
| WIN_Table_postos | MIG-7G |
| WIN_Table_unidades | MIG-7 |
| WIN_Table_utilizadores | MIG-7 |
| WIN_Teclado_Alfa | MIG-7 |
| WIN_Teclado_numerico | MIG-7 |
| WIN_Tempos_Reparacao | MIG-10 |
| WIN_Tempos_Reparacao_Estado | MIG-10 |
| WIN_Tempos_Reparacao_Informacao | MIG-10 |
| WIN_Tempos_Reparacao_Tempo | MIG-10 |
| WIN_sistema | MIG-12 |
| artigos | MIG-4 |
| cab_stocks | MIG-4 |
| documentos | MIG-4 |
| estados_descritivos | MIG-4 |
| estados_reparacao | MIG-4 |
| lin_stocks | MIG-4 |
| material_reparacao | MIG-4 |
| mecanicos | MIG-4 |
| ordem_reparacao | MIG-4 |
| postos | MIG-4 |
| sistema | MIG-4 |
| tempos_reparacao | MIG-4 |
| unidades | MIG-4 |
| utilizadores | MIG-4 |

## Stage closure

Follow templates/prompt-stage.md: read handoff/instructions/ADRs; synchronize safely; bounded behavior and evidence; implement; actual verify/UI/golden/native checks; independent review/fixes (two for risky slices); update parity, roadmap, handoff and progress; commit explicit files locally. Do not push or overwrite a dirty checkout to synchronize. Continue the next ready slice without routine approval (ADR-007).

Functional readiness closes only the declared required workflow checks; strict migration and host acceptance keep their existing gates. Update the canonical acceptance inventory alongside relevant tests; changed application/test inputs require fresh evidence.


## Recurring cleanup checkpoints

Within MIG-7, close the customer pair and the vehicle pair and simplest independent lookup pair, run MIG-7C, then continue the remaining leaf stages. Its dependency is those completed sub-stages rather than the entire group; group completion includes this checkpoint. The group-level table is a summary, not permission to postpone cleanup.

After every next 2–3 bounded workflows across MIG-8 through MIG-13, insert a numbered cleanup brief owned by that group's ticket (suffix C1, C2…). Extract only patterns repeated by completed workflows, keep behavior unchanged, update docs/porting.md and run the existing relevant tests. The next dependent workflow waits for that cleanup/review checkpoint. Record each checkpoint in this roadmap as its concrete sub-slices are scheduled.
