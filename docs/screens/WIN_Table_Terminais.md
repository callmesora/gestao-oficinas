# Screen spec — WIN_Table_Terminais

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw`, `dossier: WIN_Table_Terminais`, `docs/mapping/WIN_Table_Terminais.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_Terminais.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_Terminais.md |

Window properties: {"title": {"PT": "Tabela de terminais de recolha de dados"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 592, "height": 354}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_Terminais.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-C33B299B-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_Terminais | 14 | 31 | 466 | 310 | Width and height | {} |
| COL_Codigo | 14 | 31 | None | None | <None> | {} |
| COL_Descricao | 14 | 31 | None | None | <None> | {} |
| BTN_Fechar | 486 | 120 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 486 | 31 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 486 | 61 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 486 | 90 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 357 | 18 | Width | {} |
| SC_SCSystemButtons | 458 | 1 | 128 | 18 | U-C33B299B-01 | {} |
| BTN_UMC | 458 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 492 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 518 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 542 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 359 | -19 | 14 | 14 | Right | {} |
| BTN_selecionar | 486 | 317 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_Terminais | Table | {"PT": "Terminais Table"} | Terminais | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-C33B299B-016 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| 6 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| 7 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| U-C33B299B-01 | IMG_BTN_Syst_Restore | Image | U-C33B299B-01 | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-C33B299B-016 |
| U-C33B299B-01 | RADTitle | Caption | {"PT": "Tabela de terminais de recolha de dados"} | — | {'PT': '0'} / U-C33B299B-01 | U-C33B299B-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-C33B299B-016 |
| U-C33B299B-01 | SC_SCSystemButtons | None | U-C33B299B-01 | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C33B299B-016 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-C33B299B-01 | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C33B299B-016 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-C33B299B-01 | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C33B299B-016 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-C33B299B-01 | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C33B299B-016 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-C33B299B-01 / U-C33B299B-01 | U-C33B299B-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-C33B299B-016 |
| U-C33B299B-01 | TABLE_Terminais.COL_Codigo | Table column | {"PT": "Código"} | Terminais.Codigo | {'PT': '0'} / U-C33B299B-01 | 3 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C33B299B-016 |
| U-C33B299B-01 | TABLE_Terminais.COL_Descricao | Table column | {"PT": "Descriçªo"} | Terminais.Descricao | {'PT': '0'} / U-C33B299B-01 | 30 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C33B299B-016 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_Terminais | {"kind": "Table", "caption": {"PT": "Terminais Table"}, "tab_order": 2, "browsed_file": "Terminais", "browsed_item": "Codigo", "stored_item": "Codigo", "anchoring": "Width and height", "x": 14, "y": 31, "width": 466, "height": 310, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 486, "y": 90, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 486, "y": 120, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 486, "y": 61, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 486, "y": 317, "width": 90, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 486, "y": 31, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 359, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de terminais de recolha de dados"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 357, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 542, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 492, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 518, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 458, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_Terminais.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 3, "input_mask": {"PT": "0"}, "linked_item": "Terminais.Codigo", "anchoring": "<None>", "width": 73, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_Terminais.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo"}, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "Terminais.Descricao", "anchoring": "<None>", "width": 374, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 458, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_Terminais | Terminais / Codigo / Codigo | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| TABLE_Terminais | Terminais / Codigo / Codigo | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Codigo | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |
| COL_Descricao | memory or not extracted / U-C33B299B-01 / U-C33B299B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C33B299B-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-C33B299B-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-C33B299B-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-C33B299B-02 |
| Empty result | No invented fallback or selection; U-C33B299B-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-C33B299B-02 |
| Other window/user change | No automatic refresh beyond source calls; U-C33B299B-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-C33B299B-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-C33B299B-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-C33B299B-01. Runtime writes must be performed only against a preserved scratch data copy.
