# Screen spec — WIN_Table_utilizadores

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw`, `dossier: WIN_Table_utilizadores`, `docs/mapping/WIN_Table_utilizadores.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_utilizadores.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_utilizadores.md |

Window properties: {"title": {"PT": "Tabela de utilizadores"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 712, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_utilizadores.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CD9683DC-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_utilizadores | 14 | 31 | 585 | 557 | Width and height | {} |
| COL_Codigo | 14 | 31 | None | None | <None> | {} |
| COL_Descricao | 14 | 31 | None | None | <None> | {} |
| BTN_Fechar | 605 | 150 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 605 | 31 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 605 | 61 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 605 | 90 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 605 | 120 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 476 | 18 | Width | {} |
| SC_SCSystemButtons | 578 | 1 | 128 | 18 | U-CD9683DC-01 | {} |
| BTN_UMC | 578 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 612 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 638 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 662 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 478 | -19 | 14 | 14 | Right | {} |
| BTN_selecionar | 605 | 550 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_seguinte | 605 | 462 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_anterior | 605 | 418 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_utilizadores | Table | {"PT": "RADFileB Table"} | utilizadores | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-CD9683DC-017 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| 7 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CD9683DC-017 |
| 8 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| 9 | BTN_seguinte | Button | {"PT": "Seguinte"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CD9683DC-017 |
| 10 | BTN_anterior | Button | {"PT": "Anterior"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CD9683DC-017 |
| U-CD9683DC-01 | IMG_BTN_Syst_Restore | Image | U-CD9683DC-01 | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CD9683DC-017 |
| U-CD9683DC-01 | RADTitle | Caption | {"PT": "Tabela de utilizadores"} | — | {'PT': '0'} / U-CD9683DC-01 | U-CD9683DC-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CD9683DC-017 |
| U-CD9683DC-01 | SC_SCSystemButtons | None | U-CD9683DC-01 | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CD9683DC-017 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CD9683DC-01 | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD9683DC-017 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CD9683DC-01 | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD9683DC-017 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CD9683DC-01 | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD9683DC-017 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CD9683DC-01 / U-CD9683DC-01 | U-CD9683DC-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CD9683DC-017 |
| U-CD9683DC-01 | TABLE_utilizadores.COL_Codigo | Table column | {"PT": "Código"} | utilizadores.Codigo | {'PT': '99'} / U-CD9683DC-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CD9683DC-017 |
| U-CD9683DC-01 | TABLE_utilizadores.COL_Descricao | Table column | {"PT": "Nome"} | utilizadores.Descricao | {'PT': '0'} / U-CD9683DC-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CD9683DC-017 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_utilizadores | {"kind": "Table", "caption": {"PT": "RADFileB Table"}, "tab_order": 2, "browsed_file": "utilizadores", "browsed_item": "utilizadoresID", "stored_item": "utilizadoresID", "anchoring": "Width and height", "x": 14, "y": 31, "width": 585, "height": 557, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 90, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 150, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 120, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 61, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_anterior | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 10, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 418, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_seguinte | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 9, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 462, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 550, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 605, "y": 31, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 478, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de utilizadores"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 476, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 662, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 612, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 638, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 578, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_utilizadores.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "utilizadores.Codigo", "anchoring": "<None>", "width": 76, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_utilizadores.COL_Descricao", "column_index": 2, "title": {"PT": "Nome"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "utilizadores.Descricao", "anchoring": "<None>", "width": 489, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 578, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| TABLE_utilizadores | utilizadores / utilizadoresID / utilizadoresID | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Codigo | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |
| COL_Descricao | memory or not extracted / U-CD9683DC-01 / U-CD9683DC-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CD9683DC-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CD9683DC-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CD9683DC-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CD9683DC-02 |
| Empty result | No invented fallback or selection; U-CD9683DC-02 |
| Keyboard row move | Previous requires current>1; next tests only current<count and requests current+1, with no no-selection/lower-bound guard. Invalid-index/empty-result engine outcome and dependent event order U-CD9683DC-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CD9683DC-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CD9683DC-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CD9683DC-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CD9683DC-01. Runtime writes must be performed only against a preserved scratch data copy.
