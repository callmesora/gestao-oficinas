# Screen spec — WIN_Form_estados_reparacao

## Target image-backed presentation and non-legacy identifiers (MIG-7I)

`WIN_Form_estados_reparacao.jpg` supplies visible title “Estados Reparação”, “Descrição”, eight radio options in order Recepção/Aguardar início reparação/Em reparação/Teste/Lavagem/Reparação suspensa/Reparação finalizada/Orçamento and checkbox labels Selecionar por defeito/Permite lançar material/Pedir confirmação na mudança do estado/Pedir data de entrega/Pedir data de pagamento. These scoped presentation overrides do not edit generated metadata. Radio keys, nullable-state preservation, Cor draft/preview independence, white fallback and pointer-transparent source shape follow ADR-003; exact native drawing/keys stay U-CE554DEA-01/03.

The actual form uses the reusable `WdRadControls` renderer with explicitly ordered typed bindings and source kind/path validation. It renders source geometry/flags through existing primitives; business handlers, values and required rules remain explicit. Non-legacy identifiers: `repair-state-form-frame`, `repair-state-form-restore`, its `-resize-*` handles and `repair-state-form-diagnostic`. Radio options retain source group `RADIO_NoName1` and add non-legacy `data-radio-value` values for accessible target interaction; captions are JPG evidence, not decoded option metadata.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw`, `dossier: WIN_Form_estados_reparacao`, `docs/mapping/WIN_Form_estados_reparacao.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_estados_reparacao.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_estados_reparacao.md |

Window properties: {"title": {"PT": "Estados Reparaçªo"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 500, "height": 455}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_estados_reparacao.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CE554DEA-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 386 | 418 | U-CE554DEA-01 | {} |
| EDT_Codigo | 14 | 31 | 94 | 25 | Width | {} |
| EDT_Descricao | 14 | 62 | 306 | 25 | Width | {} |
| STC_Tipo | 14 | 124 | 100 | 20 | <None> | {} |
| RADIO_NoName1 | 31 | 141 | 212 | 160 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Radio_Anim.gif"} |
| EDT_Cor | 14 | 94 | 121 | 24 | <None> | {} |
| SHA_cor | 72 | 94 | 67 | 23 | <None> | {} |
| BTN_VISION | 141 | 93 | 42 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| CBOX_NoName1 | 14 | 305 | 148 | 27 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| CBOX_NoName2 | 14 | 333 | 148 | 27 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| CBOX_NoName3 | 14 | 361 | 255 | 27 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| CBOX_NoName4 | 14 | 389 | 255 | 27 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| CBOX_NoName5 | 14 | 417 | 255 | 27 | <None> | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| RADTitle | 9 | 4 | 351 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-CE554DEA-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 570 | -19 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CE554DEA-011 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | IMG_BTN_Syst_Restore | Image | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | RADTitle | Caption | {"PT": "Estados Reparaçªo"} | — | {'PT': '0'} / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | SC_Form | None | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | SC_SCSystemButtons | None | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CE554DEA-011 |
| 1 | SC_Form.EDT_Codigo | Edit control | {"PT": "Código"} | estados_reparacao.Codigo | {'PT': '0'} / {'PT': '0'} | 3 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": true, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CE554DEA-011 |
| 2 | SC_Form.EDT_Descricao | Edit control | {"PT": "Descriçªo"} | estados_reparacao.Descricao | {'PT': '0'} / U-CE554DEA-01 | 50 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CE554DEA-011 |
| 3 | SC_Form.RADIO_NoName1 | RadioButton | {"PT": "&Selector"} | estados_reparacao.tipo | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": false, "Three states": false} | RULE-CE554DEA-011 |
| 4 | SC_Form.EDT_Cor | Edit control | {"PT": "Cor"} | estados_reparacao.Cor | {'PT': '999999999'} / U-CE554DEA-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CE554DEA-011 |
| 5 | SC_Form.BTN_VISION | Button | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CE554DEA-011 |
| 5 | SC_Form.CBOX_NoName1 | Check Box | {"PT": "I&nterruptor"} | estados_reparacao.lancar_defa | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CE554DEA-011 |
| 6 | SC_Form.CBOX_NoName2 | Check Box | {"PT": "I&nterruptor"} | estados_reparacao.lancar_material | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CE554DEA-011 |
| 7 | SC_Form.CBOX_NoName3 | Check Box | {"PT": "I&nterruptor"} | estados_reparacao.confirmacao | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CE554DEA-011 |
| 8 | SC_Form.CBOX_NoName4 | Check Box | {"PT": "I&nterruptor"} | estados_reparacao.pedir_data_entrega | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CE554DEA-011 |
| 9 | SC_Form.CBOX_NoName5 | Check Box | {"PT": "I&nterruptor"} | estados_reparacao.pedir_data_pag | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | SC_Form.SHA_cor | Shape | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "TAB Key": false} | RULE-CE554DEA-011 |
| U-CE554DEA-01 | SC_Form.STC_Tipo | Caption | {"PT": "Tipo"} | — | {'PT': '0'} / U-CE554DEA-01 | U-CE554DEA-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CE554DEA-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CE554DEA-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CE554DEA-011 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CE554DEA-01 | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CE554DEA-011 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CE554DEA-01 / U-CE554DEA-01 | U-CE554DEA-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CE554DEA-011 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Estados Reparaçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 351, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_VISION | {"kind": "Button", "path": "SC_Form.BTN_VISION", "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 141, "y": 93, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| CBOX_NoName1 | {"kind": "Check Box", "path": "SC_Form.CBOX_NoName1", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 5, "linked_item": "estados_reparacao.lancar_defa", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 14, "y": 305, "width": 148, "height": 27, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| CBOX_NoName2 | {"kind": "Check Box", "path": "SC_Form.CBOX_NoName2", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 6, "linked_item": "estados_reparacao.lancar_material", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 14, "y": 333, "width": 148, "height": 27, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| CBOX_NoName3 | {"kind": "Check Box", "path": "SC_Form.CBOX_NoName3", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 7, "linked_item": "estados_reparacao.confirmacao", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 14, "y": 361, "width": 255, "height": 27, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| CBOX_NoName4 | {"kind": "Check Box", "path": "SC_Form.CBOX_NoName4", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 8, "linked_item": "estados_reparacao.pedir_data_entrega", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 14, "y": 389, "width": 255, "height": 27, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| CBOX_NoName5 | {"kind": "Check Box", "path": "SC_Form.CBOX_NoName5", "caption": {"PT": "I&nterruptor"}, "initial_value": "0", "tab_order": 9, "linked_item": "estados_reparacao.pedir_data_pag", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "<None>", "x": 14, "y": 417, "width": 255, "height": 27, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| EDT_Codigo | {"kind": "Edit control", "path": "SC_Form.EDT_Codigo", "caption": {"PT": "Código"}, "tab_order": 1, "input_size": 3, "input_mask": {"PT": "0"}, "display_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Codigo", "anchoring": "Width", "x": 14, "y": 31, "width": 94, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": true, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Cor | {"kind": "Edit control", "path": "SC_Form.EDT_Cor", "caption": {"PT": "Cor"}, "tab_order": 4, "input_size": 0, "input_mask": {"PT": "999999999"}, "linked_item": "estados_reparacao.Cor", "anchoring": "<None>", "x": 14, "y": 94, "width": 121, "height": 24, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Descricao | {"kind": "Edit control", "path": "SC_Form.EDT_Descricao", "caption": {"PT": "Descriçªo"}, "tab_order": 2, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "estados_reparacao.Descricao", "anchoring": "Width", "x": 14, "y": 62, "width": 306, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| RADIO_NoName1 | {"kind": "RadioButton", "path": "SC_Form.RADIO_NoName1", "caption": {"PT": "&Selector"}, "initial_value": "1", "tab_order": 3, "linked_item": "estados_reparacao.tipo", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Radio_Anim.gif", "anchoring": "<None>", "x": 31, "y": 141, "width": 212, "height": 160, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": false, "Three states": false}} |
| SHA_cor | {"kind": "Shape", "path": "SC_Form.SHA_cor", "anchoring": "<None>", "x": 72, "y": 94, "width": 67, "height": 23, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": false}} |
| STC_Tipo | {"kind": "Caption", "path": "SC_Form.STC_Tipo", "caption": {"PT": "Tipo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 14, "y": 124, "width": 100, "height": 20, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 386, "height": 418, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CE554DEA-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CE554DEA-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CE554DEA-02 |
| Empty result | No invented fallback or selection; U-CE554DEA-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CE554DEA-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CE554DEA-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CE554DEA-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:39 | Info("Falta indicar o código") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:49 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"estados_reparacao." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:59 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"estados_reparacao." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CE554DEA-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CE554DEA-01. Runtime writes must be performed only against a preserved scratch data copy.
