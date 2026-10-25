# Screen spec — WIN_Acesso

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw`, `dossier: WIN_Acesso`, `docs/mapping/WIN_Acesso.md`. Source inventory plus scoped target implementation proof.

## Contract

Authenticate selected user.

Confirm uppercases typed password and compares selected utilizadores buffer; success returns continuar and closes. Default cancelar. Missing user has no explicit error. Touch keyboard only for modulo t/m. Credential values are omitted.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Acesso"} |
| window_type | Free window |
| opening_mode | Centered in the screen |
| size | {"x": 0, "y": 0, "width": 380, "height": 292} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W9D7053-02. Saved position versus opening-mode precedence U-W9D7053-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W9D7053-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": 6, "column": "—"} | [192, 229, 158, 42] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Confirmar | Button | {"PT": "Confirmar"} | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": 5, "column": "—"} | [28, 229, 158, 42] | {"anchoring": "<None>", "state": "Active", "button_type": "Validate"} |
| BTN_NoName1 | Button | {"PT": "..."} | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": 2, "column": "—"} | [290, 74, 60, 40] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": "unresolved (encoded); U-W9D7053-01", "column": "—"} | [150, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_palavra_passe | Edit control | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 15} | {"tab": 4, "column": "—"} | [28, 167, 322, 40] | {"anchoring": "<None>", "state": "Active"} |
| EDT_utilizador | Edit control | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 3, "column": "—"} | [28, 75, 256, 40] | {"anchoring": "<None>", "state": "Read-only"} |
| RADTitle | Caption | {"PT": "Acesso"} | unresolved (encoded); U-W9D7053-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W9D7053-01", "column": "—"} | [9, 4, 231, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_NoName1 | Caption | {"PT": "Utilizador"} | unresolved (encoded); U-W9D7053-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W9D7053-01", "column": "—"} | [28, 43, 192, 26] | {"anchoring": "<None>", "state": "Active"} |
| STC_NoName2 | Caption | {"PT": "Palavra-passe"} | unresolved (encoded); U-W9D7053-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W9D7053-01", "column": "—"} | [28, 135, 192, 26] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": "-1", "column": "—"} | [330, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Abort"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": "-1", "column": "—"} | [280, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": "-1", "column": "—"} | [306, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": 1, "column": "—"} | [246, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | unresolved (encoded); U-W9D7053-01 | {"tab": "unresolved (encoded); U-W9D7053-01", "column": "—"} | [246, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 192, "y": 229, "width": 158, "height": 42, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W9D7053-1000 |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Confirmar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 28, "y": 229, "width": 158, "height": 42, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-W9D7053-1001 |
| BTN_NoName1 | {"kind": "Button", "caption": {"PT": "..."}, "tab_order": 2, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 290, "y": 74, "width": 60, "height": 40, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W9D7053-1002 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 150, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W9D7053-1003 |
| EDT_palavra_passe | {"kind": "Edit control", "tab_order": 4, "input_size": 15, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 28, "y": 167, "width": 322, "height": 40, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": true, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W9D7053-1004 |
| EDT_utilizador | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 28, "y": 75, "width": 256, "height": 40, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W9D7053-1005 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Acesso"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 231, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W9D7053-1006 |
| STC_NoName1 | {"kind": "Caption", "caption": {"PT": "Utilizador"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 28, "y": 43, "width": 192, "height": 26, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W9D7053-1007 |
| STC_NoName2 | {"kind": "Caption", "caption": {"PT": "Palavra-passe"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 28, "y": 135, "width": 192, "height": 26, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W9D7053-1008 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 330, "y": 0, "width": 44, "height": 19, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": false}} | RULE-W9D7053-1009 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 280, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W9D7053-1010 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 306, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W9D7053-1011 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 246, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W9D7053-1012 |
| SCSystemButtons | {"kind": null, "x": 246, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W9D7053-1013 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Acesso.md. Title/default/Esc/language: U-W9D7053-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W9D7053-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-W9D7053-03 |
| Local message shell/resource wiring | U-W9D7053-04 |
| Actual field/type edges | U-W9D7053-05; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W9D7053-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W9D7053-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W9D7053-01.
- Resolve only the applicable U-items above before claiming runtime parity; executed target checks below do not resolve the remaining native/source U items.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:378 | "Utilizador e/ou palavra-passe incorreto(s)" | Info | U-W9D7053-04; exact branch result in mapping event ledger |

## Current implementation and executed proof

Default business entry now uses `ProductionStartup`, the actual `StartupAccessDialog` and public user picker, and persistent authenticated transport (ADR004/017). `SRC-0ca1dfb2e6` is verified for selected Codigo→exact description→password focus after the real picker closes. Focus waits for the enabled input to commit; the actual ordinary production browser path caught and then passed this lifecycle correction. The public picker uses stable local row identities across sorting; only Codigo/Descricao crosses the pre-login boundary.

`SRC-7891e7fd29` is verified for the supported managed-account path: selection is required, Confirm visibly uppercases the submitted draft, the exact source incorrect-password Info is awaited, missing selection is silent, and successful access closes into the actual menu. Production uses explicitly reset scrypt credentials and RAM client sessions under ADR004, rather than copied legacy passwords. Enrollment, hashing, expiry, revocation and direct API denial are accepted target security behavior, not newly discovered legacy rules. Explicit isolated DEV access still has its separately tested synthetic source comparison; it creates no production session.

The root's macOS working-tree run passed all nine `ui-check/authentication.flows.spec.ts` cases, including selected-user/focus, wrong/lowercase/success, browser reload/Cancel, explicit imported-account reset, managed maintenance/self-reset, external revocation and captured module entry. Real PostgreSQL/API security tests cover selected identities, session lifecycle, reset/delete invalidation and coordinated reset/login locking. `ui-check/startup.flows.spec.ts` retains the actual synthetic DEV comparison and touch-keyboard return/cancel checks. Source touch title/mask/size/password arguments are implemented but not all individually asserted; `SRC-c9144a3e08` stays implemented. Constructor defaults/captured mode are implemented; no encoded action or designer row is promoted.

The actual macOS WKWebView business scenario also enrolled, saved one synthetic customer, logged out and logged in again; database effects were one customer, zero remaining sessions and zero DEV-session requests. This is a limited executed Mac path, not Windows, legacy runtime, native keyboard or full-window acceptance. U01/U02/U03/U04/U05 retain their original scopes, including native traversal/message shell and Unicode/NULL/shared-buffer boundaries. No credential value is evidence or fixture here.

`authentication-enrollment`, `business-logout`, `business-session-user`, `startup-terminated`, `startup-diagnostic` and helper names are target-only identities, not legacy controls. Original WIN_Acesso control test IDs remain unchanged. The five AGENTS criteria were checked against the named assertions and actual paths; relevant current ADRs were re-read at this stage end.
