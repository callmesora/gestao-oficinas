# Screen spec — WIN_Mapa_Vendas

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw`, `dossier: WIN_Mapa_Vendas`, `docs/mapping/WIN_Mapa_Vendas.md`. Source contract; initial implementation below.

## Contract

Preview sales/receipts.

vendas selects states pedir_data_entrega=1 and delivery report; other modes pedir_data_pag=1/payment. Initially all selected. Codes joined with trailing semicolon. Dates SysDateTime without day expansion. Empty selected list query behavior needs golden case.

Initial implementation: `src/ui/report-filters.tsx` reads source-flag states through protected `POST /api/report-filters/states`, preserving duplicates/NULL rows; checked rows remain local to each window. Explicit target fallback orders initial rows by internal identity (source SQL has no ORDER BY; U-W7DB489-03), supports local checkbox/sort/seek and retains the current row order in the source semicolon dispatch. Date controls return Date8 despite SysDateTime initial assignments; no day expansion. Empty selection reaches the engine as `[]`, never a disabled predicate; selected NULL codes stay unresolved (U-W7DB489-05). Scoped dossier overlays supply missing preview-button/caption-width metadata without editing generated layouts. Non-legacy helpers: `TABLE_Estados.COL_checkbox:<row-id>`, `report-filter-diagnostic`, `report-filters-launcher`, `report-filter-sales-*`. Actual PostgreSQL/installed-Chrome/PDF checks cover both modes and empty selection. Native checkbox/keyboard/printing and source goldens remain open; no parity completion claim.

Focused PostgreSQL checks in `apps/server/src/operations/report-filters.test.ts` assert the exact mode flag, all checked defaults and preservation of duplicate/NULL rows. The actual sales/receipts browser path reaches PDF with the checked source codes and an empty selection. Query-buffer failure/ordering, selected NULL codes and native Date initialization remain U-W7DB489-03/05, so these compound initialization/dispatch events remain implemented.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W7DB489-01 |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 345, "height": 395} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W7DB489-02. Saved position versus opening-mode precedence U-W7DB489-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W7DB489-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE_Estados | Table | {"PT": "Tabela"} | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": 4, "column": "—"} | [19, 141, 307, 186] | {"anchoring": "<None>", "state": "Active"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "unresolved (encoded); U-W7DB489-01", "column": "—"} | [115, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| BTN_Visualizar_impressªo1 | Button | {"PT": "Visualizar impressªo"} | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": 5, "column": "—"} | [83, 342, 179, 37] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| EDT_A_data | Edit control | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 3, "column": "—"} | [19, 73, 208, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Da_data | Edit control | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 2, "column": "—"} | [19, 40, 208, 24] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7DB489-01", "column": "—"} | [9, 4, 196, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Titulo_Tabela | Caption | {"PT": "Etiqueta"} | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7DB489-01", "column": "—"} | [19, 108, 301, 26] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "-1", "column": "—"} | [295, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "-1", "column": "—"} | [245, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "-1", "column": "—"} | [271, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": 1, "column": "—"} | [211, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TABLE_Estados.COL_checkbox | Table column | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "0"}, "input_size": 0} | {"tab": "unresolved (encoded); U-W7DB489-01", "column": 1} | ["unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01"] | {"anchoring": "<None>"} |
| TABLE_Estados.COL_Descricao | Table column | {"PT": "Estado"} | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-W7DB489-01", "column": 2} | ["unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", 237, "unresolved (encoded); U-W7DB489-01"] | {"anchoring": "<None>", "state": "Read-onl", "h_align": "Left", "v_align": "Center"} |
| TABLE_Estados.COL_codigo | Table column | {"PT": "codigo"} | unresolved (encoded); U-W7DB489-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-W7DB489-01", "column": 3} | ["unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", 100, "unresolved (encoded); U-W7DB489-01"] | {"anchoring": "<None>", "state": "Read-onl", "h_align": "Left", "v_align": "Center"} |
| SCSystemButtons | None | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "unresolved (encoded); U-W7DB489-01", "column": "—"} | [211, 1, 128, 18] | {"state": "Active"} |
| BTN_Visualizar_impressão1 | None | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | unresolved (encoded); U-W7DB489-01 | {"tab": "unresolved (encoded); U-W7DB489-01", "column": "—"} | ["unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01", "unresolved (encoded); U-W7DB489-01"] | unresolved (encoded); U-W7DB489-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TABLE_Estados | {"kind": "Table", "caption": {"PT": "Tabela"}, "tab_order": 4, "anchoring": "<None>", "x": 19, "y": 141, "width": 307, "height": 186, "row": "Active Memory 0", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} | RULE-W7DB489-1000 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 115, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W7DB489-1001 |
| BTN_Visualizar_impressªo1 | {"kind": "Button", "caption": {"PT": "Visualizar impressªo"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 83, "y": 342, "width": 179, "height": 37, "row": "Active Normal", "state": "Active", "button_type": "Normal"} | RULE-W7DB489-1002 |
| EDT_A_data | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 19, "y": 73, "width": 208, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7DB489-1003 |
| EDT_Da_data | {"kind": "Edit control", "tab_order": 2, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 19, "y": 40, "width": 208, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7DB489-1004 |
| RADTitle | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 196, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7DB489-1005 |
| STC_Titulo_Tabela | {"kind": "Caption", "caption": {"PT": "Etiqueta"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 108, "width": 301, "height": 26, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7DB489-1006 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 295, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB489-1007 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 245, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB489-1008 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 271, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB489-1009 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 211, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W7DB489-1010 |
| TABLE_Estados.COL_checkbox | {"kind": "Table column", "path": "TABLE_Estados.COL_checkbox", "column_index": 1, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}, "width": 49, "state": "Active", "h_align": "Center", "v_align": "Center"} | RULE-W7DB489-1011 |
| TABLE_Estados.COL_Descricao | {"kind": "Table column", "path": "TABLE_Estados.COL_Descricao", "column_index": 2, "title": {"PT": "Estado"}, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "width": 237, "state": "Read-onl", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7DB489-1012 |
| TABLE_Estados.COL_codigo | {"kind": "Table column", "path": "TABLE_Estados.COL_codigo", "column_index": 3, "title": {"PT": "codigo"}, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "width": 100, "state": "Read-onl", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": false, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7DB489-1013 |
| SCSystemButtons | {"kind": null, "x": 211, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7DB489-1014 |
| BTN_Visualizar_impressão1 | {"kind": null, "flags": {"Visible": true, "TAB Key": true}} | RULE-W7DB489-1015 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Mapa_Vendas.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W7DB489-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W7DB489-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | U-W7DB489-02 |
| Data/timer/lock/write-failure scope | U-W7DB489-03 |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W7DB489-02. |
| Actual field/type edges | U-W7DB489-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W7DB489-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W7DB489-02. Include first/last/empty grid rows and native headers.
- Compare baseline/resized designer image and missing visual properties under U-W7DB489-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W7DB489-04 |
