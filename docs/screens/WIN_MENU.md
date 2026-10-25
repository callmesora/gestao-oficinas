# Screen spec — WIN_MENU

Evidence `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw`, `dossier: WIN_MENU`, `docs/mapping/WIN_MENU.md`. Step 0 only.

## Contract

Initialize, authenticate and navigate.

Empty sistema creates refresh15/15/15,lookback7,closure times030000 twice. Empty utilizadores creates administrator; credential values omitted. Login cancelar ends program. Master/workflow actions Restore/TopActive existing Active or OpenChild NotFound; other statuses no case. Report filters OpenChild mode parameters. Inventory sequentially Open reconstruction then inventory regardless result. Utility updates order reception client from current vehicle owner, shows Terminado. artigos=1 removes menus and hides nonarticle buttons; modulo t/m hides menu, opens time/material modally then ends program.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Golfinho Software - Gestªo de ordens de reparaçªo oficinas auto.    Versªo: 2024.01.000"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 800, "height": 600} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-WCB13D1-02. Saved position versus opening-mode precedence U-WCB13D1-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-WCB13D1-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TAB_NoName1.LAYOUT_NoName1.BTN_Artigos | Button | {"PT": "Artigos"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 8, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_Clientes | Button | {"PT": "Clientes"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 5, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_Ordens_reparacao | Button | {"PT": "Ordens de reparaçªo"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 7, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_Viaturas | Button | {"PT": "Viaturas"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 6, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_material | Button | {"PT": "Material"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 9, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_movimentos_stock | Button | {"PT": "Movimentos de stock"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 3, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TAB_NoName1.LAYOUT_NoName1.BTN_tempos | Button | {"PT": "Tempos"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 4, "column": "—"} | [4, 3, 77, 66] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| IMG_BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "unresolved (encoded); U-WCB13D1-01", "column": "—"} | [562, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| TAB_NoName1.LAYOUT_NoName1 | Layout | {"PT": "Layout"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 1, "column": "—"} | [12, 56, 770, 72] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | {"PT": "Golfinho Software - Gestªo de ordens de reparaçªo oficinas auto.    Versªo: 2024.01.000"} | unresolved (encoded); U-WCB13D1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WCB13D1-01", "column": "—"} | [9, 4, 651, 18] | {"anchoring": "Width", "state": "Active"} |
| TAB_NoName1 | Tab | {"PT": "&Pasta"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": 1, "column": "—"} | [10, 53, 780, 79] | {"anchoring": "Width", "state": "Active"} |
| SC_SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "-1", "column": "—"} | [750, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "-1", "column": "—"} | [700, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SC_SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "-1", "column": "—"} | [726, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "-1", "column": "—"} | [666, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SC_SCSystemButtons | None | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | unresolved (encoded); U-WCB13D1-01 | {"tab": "unresolved (encoded); U-WCB13D1-01", "column": "—"} | [666, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TAB_NoName1.LAYOUT_NoName1.BTN_Artigos | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_Artigos", "caption": {"PT": "Artigos"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\barcode_48.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1000 |
| TAB_NoName1.LAYOUT_NoName1.BTN_Clientes | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_Clientes", "caption": {"PT": "Clientes"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\clients_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1001 |
| TAB_NoName1.LAYOUT_NoName1.BTN_Ordens_reparacao | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_Ordens_reparacao", "caption": {"PT": "Ordens de reparaçªo"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\tool_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1002 |
| TAB_NoName1.LAYOUT_NoName1.BTN_Viaturas | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_Viaturas", "caption": {"PT": "Viaturas"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\plan_3_a_48.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1003 |
| TAB_NoName1.LAYOUT_NoName1.BTN_material | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_material", "caption": {"PT": "Material"}, "tab_order": 9, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\raw_material_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1004 |
| TAB_NoName1.LAYOUT_NoName1.BTN_movimentos_stock | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_movimentos_stock", "caption": {"PT": "Movimentos de stock"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\inventory_categories_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1005 |
| TAB_NoName1.LAYOUT_NoName1.BTN_tempos | {"kind": "Button", "path": "TAB_NoName1.LAYOUT_NoName1.BTN_tempos", "caption": {"PT": "Tempos"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\time_frame_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 4, "y": 3, "width": 77, "height": 66, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1006 |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 562, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-WCB13D1-1007 |
| TAB_NoName1.LAYOUT_NoName1 | {"kind": "Layout", "path": "TAB_NoName1.LAYOUT_NoName1", "caption": {"PT": "Layout"}, "tab_order": 1, "anchoring": "<None>", "x": 12, "y": 56, "width": 770, "height": 72, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1008 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Golfinho Software - Gestªo de ordens de reparaçªo oficinas auto.    Versªo: 2024.01.000"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 651, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WCB13D1-1009 |
| TAB_NoName1 | {"kind": "Tab", "caption": {"PT": "&Pasta"}, "initial_value": "1", "tab_order": 1, "anchoring": "Width", "x": 10, "y": 53, "width": 780, "height": 79, "row": "Active Top 0", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional tabs": true}} | RULE-WCB13D1-1010 |
| SC_SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WCB13D1-1011 |
| SC_SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WCB13D1-1012 |
| SC_SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WCB13D1-1013 |
| SC_SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": false}} | RULE-WCB13D1-1014 |
| SC_SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WCB13D1-1015 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_MENU.md. Title/default/Esc/language: U-WCB13D1-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-WCB13D1-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-WCB13D1-03 |
| Local message shell/resource wiring | U-WCB13D1-04 |
| Actual field/type edges | U-WCB13D1-05; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-WCB13D1-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-WCB13D1-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-WCB13D1-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:911 | "Terminado" | Info | U-WCB13D1-04; exact branch result in mapping event ledger |

## Initial implementation checkpoint

MIG12 initial development implementation: `src/ui/startup.tsx` and `startup-windows.tsx` open the actual existing list/form workflows in one shared workspace; keyed opens restore the same mounted instance. Explicit `artigos=1` and `modulo=t/m` query launch adapters preserve source presentation precedence; native command-line integration remains U01/U02. Source toolbar child layout positions use the JPG's horizontal arrangement because extracted Layout children overlap. Optional root integration supplies material/labor/stock/report definitions. `initialiseStartup` creates only source system defaults; an empty user file reports bootstrapRequired and never copies the source embedded credential. A separate labelled development entry uses the existing authorized ADR009 identity, with no successful source-login claim. Production bootstrap/credential transition, updater/INI/remote connection, native process termination and menu drag/resize/geometry acceptance remain open; source customer-reassignment utility and inventory reconstruction→inventory sequence are not implemented here. No parity promotion from this checkpoint.

Follow-through adds narrow Rust `read_startup_arguments` and `terminate_application` commands/generated adapters (ADR005), with parser, boundary and real-handler/mock-runtime tests. Business caller integration and actual Windows/macOS argument/exit checks remain separate; no native parity promotion.
