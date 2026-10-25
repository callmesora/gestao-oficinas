# Screen spec — WIN_Table_artigos

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw`, `dossier: WIN_Table_artigos`, `docs/mapping/WIN_Table_artigos.md`. Source specification; bounded implementation contract below.

## Contract

MIG-7K.1 ordinary core uses real authenticated API/PostgreSQL list/save/check-delete/delete and the shared table/selection/RAD primitives. Initialization is active-only; each mode click clears ALL effective filters and search text/focuses search while visible Ativo/Inativo flags remain unchanged. Only real term/checkbox changes reapply flags; todos ignores text, bothtrue includesNULL, active-onlyfalse/inactive-onlytrue. Turning one off forces the other on. Header sort/search retains the current effective filter independently from visible controls. Typed source artigosID/preco sort occurs before exact text transport; price seek uses raw canonical decimal strings and Boolean0/1/empty under ADR012/U02 defaults.

Existing source six widths89/170/148/109/92/49, price Right/checkbox Center, no-touch options, source row sizing, saved column configuration and explicit Tab sequence remain authoritative. JPG-backed Descrição/Ativo/Inativo and Pesquisar por descrição overrides keep generated evidence intact. Cached edit opens immediately, then refreshes after every return; new cancellation does not refresh. Description assistance uses the actual loaded list. Stale list results/failures and detached unit options cannot replace newer state/drafts.

Delete prechecks selected Codigo against material_reparacao.artigo first then lin_stocks.artigo before source Sim1/Não2 confirmation, then rechecks with transaction locks; exact messages and safe Não default remain ADR006/011/U. No quantity/date/sign restriction, header-ID guard or stock movement is invented. Ordinary selector hides CRUD/print, uses30px rows/closeY503×38/arrows/focus, returns exact selected string and retains exact origin on cancellation; literal navigation predicates do not wrap. Invalid native request0/NULL cursor coupling stays U02.

The t/m virtual keyboard, complete source initializer/DOMAIN coverage, both real caller rows, reports and both UMC actions remain specified, with all six U rows unmapped. Material caller retains old code on empty return and reloads description only; stock caller overwrites code before checking and reloads description/price. Neither is implemented by the development selector. Movement/reconstruction/report quirks remain owning-stage work. No full parent/window completion or runtime/native/Windows/HFSQL/human acceptance claim.

Non-legacy instrumentation: articles-launcher/open/select-open/returned are development route/result controls; article-picker/frame/restore and resize handles belong to shared modal geometry, and article-list-diagnostic is developer-only. Exact checks are ui-check/articles.flows.spec.ts, operations/articles.test.ts and GS-ARTICLES-001; source captions/images/control checks remain ui-check.config.json without weakened floors.

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_artigos.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_artigos.md |

Window properties: {"title": {"PT": "Tabela de artigos"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 800, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_artigos.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-C7738076-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Reviewed caller return contract

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778-788`: WIN_Table_Lin_Stocks assigns the modal article selector result directly to EDT_codigo before checking nonempty. A nonempty result runs SELECT by Codigo, HReadFirst, then copies descricao to EDT_descricao_Artigo and preco to EDT_preco; SetFocus(EDT_codigo) runs afterward. The query declaration is not canceled in this event.

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:701-712`: WIN_Material_reparacao_form first stores selector return in sArtigo; only a nonempty return overwrites EDT_artigo and reloads its description by SELECT/HReadFirst. It cancels the query declaration after copying descricao and does not copy the article price in this event. An empty return leaves the existing article code untouched.

The direct-assignment stock-line caller and guarded material-form caller have different empty-return behavior. Query/read and money conversion edge cases remain U-C7738076-03. Price is legacy 8-byte real (see `docs/schema/schema-draft.md`); preserve its input/display mask without asserting a decimal storage type.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_artigos | 14 | 117 | 678 | 468 | Width and height | {} |
| COL_Codigo | 14 | 117 | None | None | <None> | {} |
| COL_Descricao | 14 | 117 | None | None | <None> | {} |
| COL_Codbarras | 14 | 117 | None | None | <None> | {} |
| COL_Unidade | 14 | 117 | None | None | <None> | {} |
| COL_Preco | 14 | 117 | None | None | <None> | {} |
| COL_Inativo | 14 | 117 | None | None | <None> | {} |
| BTN_Fechar | 698 | 236 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 698 | 117 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 698 | 147 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 698 | 176 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 698 | 206 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 568 | 18 | Width | {} |
| SC_SCSystemButtons | 666 | 1 | 128 | 18 | U-C7738076-01 | {} |
| BTN_UMC | 666 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 700 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 726 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 750 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 570 | -19 | 14 | 14 | Right | {} |
| BTN_todos | 14 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| EDT_termo_pesquisa | 14 | 87 | 678 | 24 | Width | {} |
| BTN_codigo | 102 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_descricao | 189 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_codigobarras | 277 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_selecionar | 698 | 547 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_anterior | 698 | 415 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_seguinte | 698 | 459 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| CBOX_ativo | 375 | 31 | 97 | 23 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| CBOX_inativo | 375 | 58 | 97 | 23 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_artigos | Table | {"PT": "RADFileB Table"} | artigos | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-C7738076-030 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 7 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 8 | BTN_todos | Button | {"PT": "Ver Todos"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 9 | EDT_termo_pesquisa | Edit control | U-C7738076-01 | — | {'PT': '0'} / U-C7738076-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C7738076-030 |
| 10 | BTN_codigo | Button | {"PT": "Pesquisar por código"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 11 | BTN_descricao | Button | {"PT": "Pesquisar por descriçªo"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 12 | BTN_codigobarras | Button | {"PT": "Pesquisar por código barras"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| 13 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-C7738076-030 |
| 14 | BTN_anterior | Button | {"PT": "Anterior"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-C7738076-030 |
| 15 | BTN_seguinte | Button | {"PT": "Seguinte"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-C7738076-030 |
| 16 | CBOX_ativo | Check Box | {"PT": "I&nterruptor"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-C7738076-030 |
| 17 | CBOX_inativo | Check Box | {"PT": "I&nterruptor"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-C7738076-030 |
| U-C7738076-01 | IMG_BTN_Syst_Restore | Image | U-C7738076-01 | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-C7738076-030 |
| U-C7738076-01 | RADTitle | Caption | {"PT": "Tabela de artigos"} | — | {'PT': '0'} / U-C7738076-01 | U-C7738076-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-C7738076-030 |
| U-C7738076-01 | SC_SCSystemButtons | None | U-C7738076-01 | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C7738076-030 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-C7738076-01 | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C7738076-030 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-C7738076-01 | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C7738076-030 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-C7738076-01 | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C7738076-030 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-C7738076-01 / U-C7738076-01 | U-C7738076-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Codbarras | Table column | {"PT": "Código de barras"} | artigos.codbarras | {'PT': '0'} / U-C7738076-01 | 30 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Codigo | Table column | {"PT": "Código"} | artigos.Codigo | {'PT': '0'} / U-C7738076-01 | 30 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Descricao | Table column | {"PT": "Descriçªo"} | artigos.Descricao | {'PT': '0'} / U-C7738076-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Inativo | Table column | {"PT": "Inativo"} | artigos.inativo | {'PT': '0'} / U-C7738076-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Preco | Table column | {"PT": "Preço"} | artigos.preco | {'PT': '+999 999 999,99'} / U-C7738076-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C7738076-030 |
| U-C7738076-01 | TABLE_artigos.COL_Unidade | Table column | {"PT": "Código unidades"} | artigos.unidade | U-C7738076-01 / U-C7738076-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C7738076-030 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_artigos | {"kind": "Table", "caption": {"PT": "RADFileB Table"}, "tab_order": 2, "browsed_file": "artigos", "browsed_item": "artigosID", "stored_item": "artigosID", "anchoring": "Width and height", "x": 14, "y": 117, "width": 678, "height": 468, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 176, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 236, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 206, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 147, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_anterior | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 14, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 415, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_codigo | {"kind": "Button", "caption": {"PT": "Pesquisar por código"}, "tab_order": 10, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 102, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_codigobarras | {"kind": "Button", "caption": {"PT": "Pesquisar por código barras"}, "tab_order": 12, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 277, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_descricao | {"kind": "Button", "caption": {"PT": "Pesquisar por descriçªo"}, "tab_order": 11, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 189, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_seguinte | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 15, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 459, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 13, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 547, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_todos | {"kind": "Button", "caption": {"PT": "Ver Todos"}, "tab_order": 8, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 14, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 117, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| CBOX_ativo | {"kind": "Check Box", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 16, "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 375, "y": 31, "width": 97, "height": 23, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| CBOX_inativo | {"kind": "Check Box", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 17, "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 375, "y": 58, "width": 97, "height": 23, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| EDT_termo_pesquisa | {"kind": "Edit control", "tab_order": 9, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 14, "y": 87, "width": 678, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de artigos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 568, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_artigos.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "artigos.Codigo", "anchoring": "<None>", "width": 89, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_artigos.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "artigos.Descricao", "anchoring": "<None>", "width": 170, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Codbarras | {"kind": "Table column", "path": "TABLE_artigos.COL_Codbarras", "column_index": 3, "title": {"PT": "Código de barras"}, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "artigos.codbarras", "anchoring": "<None>", "width": 148, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Unidade | {"kind": "Table column", "path": "TABLE_artigos.COL_Unidade", "column_index": 4, "title": {"PT": "Código unidades"}, "input_size": 0, "linked_item": "artigos.unidade", "anchoring": "<None>", "width": 109, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Preco | {"kind": "Table column", "path": "TABLE_artigos.COL_Preco", "column_index": 5, "title": {"PT": "Preço"}, "input_size": 0, "input_mask": {"PT": "+999 999 999,99"}, "linked_item": "artigos.preco", "anchoring": "<None>", "width": 92, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Inativo | {"kind": "Table column", "path": "TABLE_artigos.COL_Inativo", "column_index": 6, "title": {"PT": "Inativo"}, "input_size": 0, "input_mask": {"PT": "0"}, "linked_item": "artigos.inativo", "anchoring": "<None>", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}, "width": 49, "state": "Active", "h_align": "Center", "v_align": "Center"} |
| SC_SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_artigos | artigos / artigosID / artigosID | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| TABLE_artigos | artigos / artigosID / artigosID | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codigo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Descricao | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Codbarras | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Unidade | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Preco | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |
| COL_Inativo | memory or not extracted / U-C7738076-01 / U-C7738076-01 | File assisted input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C7738076-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-C7738076-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-C7738076-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-C7738076-02 |
| Empty result | No invented fallback or selection; U-C7738076-02 |
| Keyboard row move | Previous requires current>1; next tests only current<count and requests current+1, with no no-selection/lower-bound guard. Invalid-index/empty-result engine outcome and dependent event order U-C7738076-02 |
| Other window/user change | No automatic refresh beyond source calls; U-C7738076-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-C7738076-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:327 | Info("Artigo usado em ordens de reparação, não pode ser eliminado") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:338 | Info("Artigo usado em documentos, não pode ser eliminado") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-C7738076-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-C7738076-01. Runtime writes must be performed only against a preserved scratch data copy.
