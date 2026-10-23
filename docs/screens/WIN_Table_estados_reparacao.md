# Screen spec — WIN_Table_estados_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw`, `dossier: WIN_Table_estados_reparacao`, `docs/mapping/WIN_Table_estados_reparacao.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_estados_reparacao.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_estados_reparacao.md |

Window properties: {"title": {"PT": "Tabela de Estados de Reparaçªo"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 634, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_estados_reparacao.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CEBED898-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_estados_reparacao | 14 | 31 | 507 | 557 | Width and height | {} |
| COL_Codigo | 14 | 31 | None | None | <None> | {} |
| COL_Descricao | 14 | 31 | None | None | <None> | {} |
| COL_Tipo | 14 | 31 | None | None | <None> | {} |
| BTN_Fechar | 527 | 150 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 527 | 31 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 527 | 61 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 527 | 90 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 527 | 120 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 398 | 18 | Width | {} |
| SC_SCSystemButtons | 500 | 1 | 128 | 18 | U-CEBED898-01 | {} |
| BTN_UMC | 500 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 534 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 560 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 584 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 400 | -19 | 14 | 14 | Right | {} |
| BTN_selecionar | 527 | 564 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_estados_reparacao | Table | {"PT": "RADFileB Table"} | estados_reparacao | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-CEBED898-016 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| 7 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| 8 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| U-CEBED898-01 | IMG_BTN_Syst_Restore | Image | U-CEBED898-01 | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CEBED898-016 |
| U-CEBED898-01 | RADTitle | Caption | {"PT": "Tabela de Estados de Reparaçªo"} | — | {'PT': '0'} / U-CEBED898-01 | U-CEBED898-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CEBED898-016 |
| U-CEBED898-01 | SC_SCSystemButtons | None | U-CEBED898-01 | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CEBED898-016 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CEBED898-01 | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CEBED898-016 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CEBED898-01 | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CEBED898-016 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CEBED898-01 | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CEBED898-016 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CEBED898-01 / U-CEBED898-01 | U-CEBED898-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CEBED898-016 |
| U-CEBED898-01 | TABLE_estados_reparacao.COL_Codigo | Table column | {"PT": "Código"} | estados_reparacao.Codigo | {'PT': '0'} / {'PT': '0'} | 3 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CEBED898-016 |
| U-CEBED898-01 | TABLE_estados_reparacao.COL_Descricao | Table column | {"PT": "Descriçªo"} | estados_reparacao.Descricao | {'PT': '0'} / U-CEBED898-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CEBED898-016 |
| U-CEBED898-01 | TABLE_estados_reparacao.COL_Tipo | Table column | {"PT": "Tipo"} | estados_reparacao.tipo | U-CEBED898-01 / {'PT': '0'} | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CEBED898-016 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_estados_reparacao | {"kind": "Table", "caption": {"PT": "RADFileB Table"}, "tab_order": 2, "browsed_file": "estados_reparacao", "browsed_item": "estados_reparacaoID", "stored_item": "estados_reparacaoID", "anchoring": "Width and height", "x": 14, "y": 31, "width": 507, "height": 557, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 90, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 150, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 120, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 61, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 564, "width": 90, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 527, "y": 31, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 400, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de Estados de Reparaçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 398, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 584, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 534, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 560, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 500, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_estados_reparacao.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 3, "input_mask": {"PT": "0"}, "display_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Codigo", "anchoring": "<None>", "width": 69, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_estados_reparacao.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Descricao", "anchoring": "<None>", "width": 273, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Tipo | {"kind": "Table column", "path": "TABLE_estados_reparacao.COL_Tipo", "column_index": 3, "title": {"PT": "Tipo"}, "input_size": 0, "display_mask": {"PT": "0"}, "linked_item": "estados_reparacao.tipo", "anchoring": "<None>", "width": 145, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 500, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| TABLE_estados_reparacao | estados_reparacao / estados_reparacaoID / estados_reparacaoID | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Codigo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Descricao | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |
| COL_Tipo | memory or not extracted / U-CEBED898-01 / U-CEBED898-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CEBED898-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CEBED898-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CEBED898-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CEBED898-02 |
| Empty result | No invented fallback or selection; U-CEBED898-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CEBED898-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CEBED898-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CEBED898-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:297 | Info("Estado de reparação associado a ordens de reparação, não pode ser eliminado") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CEBED898-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CEBED898-01. Runtime writes must be performed only against a preserved scratch data copy.
