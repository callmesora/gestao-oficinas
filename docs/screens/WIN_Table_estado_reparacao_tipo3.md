# Screen spec — WIN_Table_estado_reparacao_tipo3

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw`, `dossier: WIN_Table_estado_reparacao_tipo3`, `docs/mapping/WIN_Table_estado_reparacao_tipo3.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_estado_reparacao_tipo3.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_estado_reparacao_tipo3.md |

Window properties: {"title": {"PT": "Escolha o tipo de reparaçªo a ser efetuada"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 514, "height": 459}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": true}, "image_file": "images\\WIN_Table_estado_reparacao_tipo3.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-C52946E4-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| RADTitle | 9 | 4 | 365 | 18 | Width | {} |
| BTN_Syst_Restore | 284 | -19 | 14 | 14 | Right | {} |
| SCSystemButtons | 380 | 1 | 128 | 18 | U-C52946E4-01 | {} |
| BTN_UMC | 380 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 414 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 440 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 464 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| TABLE_Estados_reparacao | 19 | 36 | 380 | 402 | Width and height | {} |
| COL_Codigo | 19 | 36 | None | None | <None> | {} |
| COL_Descricao | 19 | 36 | None | None | <None> | {} |
| BTN_selecionar | 405 | 400 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 405 | 356 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_seguinte | 405 | 312 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_anterior | 405 | 268 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_Estados_reparacao | Table | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-C52946E4-012 |
| 3 | BTN_anterior | Button | {"PT": "Anterior"} | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-C52946E4-012 |
| 4 | BTN_seguinte | Button | {"PT": "Seguinte"} | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-C52946E4-012 |
| 5 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-C52946E4-012 |
| 6 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-C52946E4-012 |
| U-C52946E4-01 | BTN_Syst_Restore | Image | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-C52946E4-012 |
| U-C52946E4-01 | RADTitle | Caption | {"PT": "Escolha o tipo de reparaçªo a ser efetuada"} | — | {'PT': '0'} / U-C52946E4-01 | U-C52946E4-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-C52946E4-012 |
| U-C52946E4-01 | SCSystemButtons | None | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C52946E4-012 |
| -1 | SCSystemButtons.BTN_SYST_FERMER | Button | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C52946E4-012 |
| -1 | SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C52946E4-012 |
| -1 | SCSystemButtons.BTN_Syst_Maximize | Button | U-C52946E4-01 | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C52946E4-012 |
| 1 | SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-C52946E4-01 / U-C52946E4-01 | U-C52946E4-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-C52946E4-012 |
| U-C52946E4-01 | TABLE_Estados_reparacao.COL_Codigo | Table column | U-C52946E4-01 | estados_reparacao.Codigo | {'PT': '0'} / {'PT': '0'} | 3 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C52946E4-012 |
| U-C52946E4-01 | TABLE_Estados_reparacao.COL_Descricao | Table column | {"PT": "Tipo de Reparaçªo"} | estados_reparacao.Descricao | {'PT': '0'} / U-C52946E4-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C52946E4-012 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_Estados_reparacao | {"kind": "Table", "tab_order": 2, "browsed_item": "estados_reparacaoID", "anchoring": "Width and height", "x": 19, "y": 36, "width": 380, "height": 402, "row": "Read-onl Memory 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 405, "y": 356, "width": 90, "height": 38, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 284, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| BTN_anterior | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 405, "y": 268, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_seguinte | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 405, "y": 312, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 405, "y": 400, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Escolha o tipo de reparaçªo a ser efetuada"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 365, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 464, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 414, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 440, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 380, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_Estados_reparacao.COL_Codigo", "column_index": 1, "input_size": 3, "input_mask": {"PT": "0"}, "display_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Codigo", "anchoring": "<None>", "width": 47, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_Estados_reparacao.COL_Descricao", "column_index": 2, "title": {"PT": "Tipo de Reparaçªo"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Descricao", "anchoring": "<None>", "width": 311, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SCSystemButtons | {"kind": null, "x": 380, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Cascading input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| TABLE_Estados_reparacao | memory or not extracted / estados_reparacaoID / U-C52946E4-01 | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Codigo | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |
| COL_Descricao | memory or not extracted / U-C52946E4-01 / U-C52946E4-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C52946E4-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-C52946E4-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-C52946E4-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-C52946E4-02 |
| Empty result | No invented fallback or selection; U-C52946E4-02 |
| Keyboard row move | Previous requires current>1; next tests only current<count and requests current+1, with no no-selection/lower-bound guard. Invalid-index/empty-result engine outcome and dependent event order U-C52946E4-02 |
| Other window/user change | No automatic refresh beyond source calls; U-C52946E4-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-C52946E4-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-C52946E4-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-C52946E4-01. Runtime writes must be performed only against a preserved scratch data copy.

## Initial target checkpoint

The target is `src/ui/repair-labor.tsx::RepairLaborStatePicker`, consumed by the actual labor-start continuation. Each opening queries current source choices, retaining exactly tipo3/4/5 in source order; selection returns the actual code, and cancellation resumes without writes. A concurrent choice change is rejected by the prepared write baseline (ADR006); no connection is held while the modal waits. The JPG supplies the Portuguese title accent. Exact executed cases are linked from the per-unit CSV; no-selection/native/visual/U gates remain open. Non-legacy frame helpers use `repair-labor-state-picker-*`.
