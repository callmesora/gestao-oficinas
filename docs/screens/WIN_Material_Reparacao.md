# Screen spec — WIN_Material_Reparacao

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw`, `dossier: WIN_Material_Reparacao`, `docs/mapping/WIN_Material_Reparacao.md`. Step 0 only.

## Contract

Choose order/material editor.

ParamLancarMat true; nonempty gsValor_entrada types3;5;2 (initialization trailing semicolon),else1..8. Todos removes mechanic filter; mechanic click filters reparacao_mecanico. Material action reexecutes then seeks selected order key, rejects unavailable; write-locks order; rejects matching details window when material table has rows; Open editor modal. Early returns after lock may skip unlock. Timer sistema.Tempo_materiais*100; refresh preserves key and reapplies filter. Close removes filter/query.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Materiais de Reparaçªo"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 800, "height": 600} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-WE6E1AD-02. Saved position versus opening-mode precedence U-WE6E1AD-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-WE6E1AD-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE_ordens_reparacao | Table | unresolved (encoded); U-WE6E1AD-01 | {"browsed_file": "QRY_select_ordens_reparacao_matricula", "browsed_item": "numero"} | unresolved (encoded); U-WE6E1AD-01 | {"tab": 4, "column": "—"} | [195, 72, 474, 507] | {"anchoring": "Right and bottom, height and width", "state": "Read-only"} |
| BTN_Fechar | Button | {"PT": "Fechar"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 2, "column": "—"} | [675, 36, 106, 30] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_Material | Button | {"PT": "Material"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 5, "column": "—"} | [675, 72, 106, 46] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": "—"} | [570, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| BTN_anterior | Button | {"PT": "Anterior"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 7, "column": "—"} | [675, 497, 106, 38] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Validate"} |
| BTN_anterior1 | Button | {"PT": "Anterior"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 8, "column": "—"} | [19, 534, 82, 45] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Validate"} |
| BTN_seguinte | Button | {"PT": "Seguinte"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 10, "column": "—"} | [675, 541, 106, 38] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Validate"} |
| BTN_seguinte1 | Button | {"PT": "Seguinte"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 9, "column": "—"} | [107, 534, 82, 45] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Validate"} |
| BTN_todos | Button | {"PT": "Todos"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 3, "column": "—"} | [19, 72, 170, 28] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Normal"} |
| LIST_mecanicos | List Box | unresolved (encoded); U-WE6E1AD-01 | {"browsed_file": "mecanicos", "browsed_item": "Codigo"} | unresolved (encoded); U-WE6E1AD-01 | {"tab": 6, "column": "—"} | [19, 106, 170, 422] | {"anchoring": "Bottom, height and width", "state": "Active"} |
| RADTitle | Caption | {"PT": "Materiais de Reparaçªo"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": "—"} | [9, 4, 651, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Ordens_de_Reparacao | Caption | {"PT": "Ordens de Reparaçªo"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": "—"} | [19, 36, 170, 30] | {"anchoring": "Bottom, height and width", "state": "Active"} |
| STC_filtro_atual | Caption | {"PT": "Todos"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": "—"} | [195, 36, 170, 30] | {"anchoring": "Right, height and width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": "-1", "column": "—"} | [750, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": "-1", "column": "—"} | [700, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": "-1", "column": "—"} | [726, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": 1, "column": "—"} | [666, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TABLE_ordens_reparacao.COL_Numero | Table column | {"PT": "Nœmero"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": 1} | ["unresolved (encoded); U-WE6E1AD-01", "unresolved (encoded); U-WE6E1AD-01", 107, "unresolved (encoded); U-WE6E1AD-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| TABLE_ordens_reparacao.COL_Matricula | Table column | {"PT": "Matricula"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 15} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": 2} | ["unresolved (encoded); U-WE6E1AD-01", "unresolved (encoded); U-WE6E1AD-01", 127, "unresolved (encoded); U-WE6E1AD-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Left", "v_align": "Center"} |
| TABLE_ordens_reparacao.COL_Marca_Modelo | Table column | {"PT": "Marca/Modelo"} | unresolved (encoded); U-WE6E1AD-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": 3} | ["unresolved (encoded); U-WE6E1AD-01", "unresolved (encoded); U-WE6E1AD-01", 219, "unresolved (encoded); U-WE6E1AD-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Left", "v_align": "Center"} |
| SCSystemButtons | None | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | unresolved (encoded); U-WE6E1AD-01 | {"tab": "unresolved (encoded); U-WE6E1AD-01", "column": "—"} | [666, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TABLE_ordens_reparacao | {"kind": "Table", "tab_order": 4, "browsed_file": "QRY_select_ordens_reparacao_matricula", "browsed_item": "numero", "anchoring": "Right and bottom, height and width", "x": 195, "y": 72, "width": 474, "height": 507, "row": "Read-onl File loa 3", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": false, "Anchored column": false, "5.5-compatible": false}} | RULE-WE6E1AD-1000 |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 2, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 675, "y": 36, "width": 106, "height": 30, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1001 |
| BTN_Material | {"kind": "Button", "caption": {"PT": "Material"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\raw_material_32.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 675, "y": 72, "width": 106, "height": 46, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1002 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-WE6E1AD-1003 |
| BTN_anterior | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 675, "y": 497, "width": 106, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1004 |
| BTN_anterior1 | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom, height and width", "x": 19, "y": 534, "width": 82, "height": 45, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1005 |
| BTN_seguinte | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 10, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 675, "y": 541, "width": 106, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1006 |
| BTN_seguinte1 | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 9, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 107, "y": 534, "width": 82, "height": 45, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1007 |
| BTN_todos | {"kind": "Button", "caption": {"PT": "Todos"}, "tab_order": 3, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom, height and width", "x": 19, "y": 72, "width": 170, "height": 28, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1008 |
| LIST_mecanicos | {"kind": "List Box", "tab_order": 6, "browsed_file": "mecanicos", "browsed_item": "Codigo", "displayed_item": "Descricao", "stored_item": "Codigo", "anchoring": "Bottom, height and width", "x": 19, "y": 106, "width": 170, "height": 422, "row": "Active File loa 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "Multi-selection": false, "Scrollbar tooltip": false, "Display/Scrollbar": false}} | RULE-WE6E1AD-1009 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Materiais de Reparaçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 651, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WE6E1AD-1010 |
| STC_Ordens_de_Reparacao | {"kind": "Caption", "caption": {"PT": "Ordens de Reparaçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Bottom, height and width", "x": 19, "y": 36, "width": 170, "height": 30, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WE6E1AD-1011 |
| STC_filtro_atual | {"kind": "Caption", "caption": {"PT": "Todos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Right, height and width", "x": 195, "y": 36, "width": 170, "height": 30, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WE6E1AD-1012 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WE6E1AD-1013 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WE6E1AD-1014 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WE6E1AD-1015 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-WE6E1AD-1016 |
| TABLE_ordens_reparacao.COL_Numero | {"kind": "Table column", "path": "TABLE_ordens_reparacao.COL_Numero", "column_index": 1, "title": {"PT": "Nœmero"}, "input_size": 0, "input_mask": {"PT": "9999999999"}, "linked_item": "QRY_select_ordens_reparacao_matricula.numero", "anchoring": "<None>", "width": 107, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} | RULE-WE6E1AD-1017 |
| TABLE_ordens_reparacao.COL_Matricula | {"kind": "Table column", "path": "TABLE_ordens_reparacao.COL_Matricula", "column_index": 2, "title": {"PT": "Matricula"}, "input_size": 15, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_ordens_reparacao_matricula.matricula", "anchoring": "<None>", "width": 127, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} | RULE-WE6E1AD-1018 |
| TABLE_ordens_reparacao.COL_Marca_Modelo | {"kind": "Table column", "path": "TABLE_ordens_reparacao.COL_Marca_Modelo", "column_index": 3, "title": {"PT": "Marca/Modelo"}, "input_size": 0, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_ordens_reparacao_matricula.marcamodelo", "anchoring": "<None>", "width": 219, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-WE6E1AD-1019 |
| SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WE6E1AD-1020 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Material_Reparacao.md. Title/default/Esc/language: U-WE6E1AD-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-WE6E1AD-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | U-WE6E1AD-02 |
| Data/timer/lock/write-failure scope | U-WE6E1AD-03 |
| Local message shell/resource wiring | U-WE6E1AD-04 |
| Actual field/type edges | U-WE6E1AD-05; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-WE6E1AD-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-WE6E1AD-02. Include first/last/empty grid rows and native headers.
- Compare baseline/resized designer image and missing visual properties under U-WE6E1AD-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:682 | "Erro ao criar timer de atualização" | Error | U-WE6E1AD-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:477 | "A ordem já não está disponível" | Info | U-WE6E1AD-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:489 | "Ordem de reparação em uso por outro utilizador" | Info | U-WE6E1AD-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:497 | "Documento em edição, por favor feche a janela" | Info | U-WE6E1AD-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:510 | "Ordem de reparação em uso por outro utilizador" | Info | U-WE6E1AD-04; exact branch result in mapping event ledger |
