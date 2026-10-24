# Screen spec — WINDEVMESSAGEBOX

Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw`, `dossier: WINDEVMESSAGEBOX`, `docs/mapping/WINDEVMESSAGEBOX.md`. Step 0 only.

## Contract

Skinned Info/Error/YesNo/Confirm/Warning/OKCancel.

Params title,text,type1,button1. IDOK1,IDCANCEL2,IDYES6,IDNO7. Type0/1OK;type2YesNo close7;type3YesNoCancel close2;type4 warning informationicon;type5 relabelYesNo toOKCancel,but yesreturns1,no/closereturn7. Defaultbutton2 selectsNo,3Cancel(type3). Clipboard copies title/text separators. Widthcap600 editor units,dynamic text height,centerbuttons,system sounds. No business HFSQL.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W36869F-01 |
| window_type | unresolved (encoded); U-W36869F-01 |
| opening_mode | unresolved (encoded); U-W36869F-01 |
| size | width 369, height 217 — legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:15-16; base designer size, before source text resizing |
| close_icon | unresolved (encoded); U-W36869F-01 |
| flags | unresolved (encoded); U-W36869F-01 |

Default/Abort button types below; actual native routing and first focus U-W36869F-02. Saved position versus opening-mode precedence U-W36869F-02.

MIG-5 checkpoint: dialogs.tsx implements awaited results and the source message-size formulas; browser measurement uses the assumed skin font. Appearance/captions use the labeled Q-12 defaults in docs/evidence/message-proposals.json. Non-legacy DEV controls: skin-launcher, skin-message-fixture, skin-message-open, skin-message-queue, skin-message-result, skin-message-long. Remaining controls and the missing visual reference are explicit in ui-check.config.json; font/wrapping/DPI, clipboard, sound and native/framework parity remain pending.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W36869F-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WINDEVMESSAGEBOX | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_OK | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| LIB_INFO | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_OUI | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_NON | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_ANNULER | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| ICON_INFORMATION | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| ICON_QUESTION | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| ICON_ERREUR | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_Copier_caché | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| RADTitle | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| SCSystemButtons | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_UMC | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_SYST_MINIMIZE | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_Syst_Maximize | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_SYST_FERMER | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| BTN_Syst_Restore | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| _Menu | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| RedimensionneDialogue | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| CentreLesBoutons | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |
| AvertissementSonore | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | unresolved (encoded); U-W36869F-01 | {"tab": "unresolved (encoded); U-W36869F-01", "column": "—"} | ["unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01", "unresolved (encoded); U-W36869F-01"] | unresolved (encoded); U-W36869F-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| WINDEVMESSAGEBOX | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1000 |
| BTN_OK | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1001 |
| LIB_INFO | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1002 |
| BTN_OUI | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1003 |
| BTN_NON | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1004 |
| BTN_ANNULER | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1005 |
| ICON_INFORMATION | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1006 |
| ICON_QUESTION | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1007 |
| ICON_ERREUR | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1008 |
| BTN_Copier_caché | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1009 |
| RADTitle | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1010 |
| SCSystemButtons | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1011 |
| BTN_UMC | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1012 |
| BTN_SYST_MINIMIZE | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1013 |
| BTN_Syst_Maximize | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1014 |
| BTN_SYST_FERMER | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1015 |
| BTN_Syst_Restore | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1016 |
| _Menu | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1017 |
| RedimensionneDialogue | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1018 |
| CentreLesBoutons | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1019 |
| AvertissementSonore | unresolved (encoded); U-W36869F-01 | RULE-W36869F-1020 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WINDEVMESSAGEBOX.md. Title/default/Esc/language: U-W36869F-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W36869F-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | U-W36869F-04 |
| Actual field/type edges | U-W36869F-05; text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. |
| Omitted visual metadata | U-W36869F-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W36869F-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W36869F-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W36869F-04 |
