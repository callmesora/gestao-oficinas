# Screen spec — WINDEVDIALOGBOX

Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw`, `dossier: WINDEVDIALOGBOX`, `docs/mapping/WINDEVDIALOGBOX.md`. Step 0 only.

## Contract

Skinned dynamic resource dialog/input.

Variant supplies title/message/buttons/default/cancel/icon/input. Clone BTN_1 per1-based index;label/tab/Note=explicit val or index;min button80. Cancel compared with index sets Abort;default Validate. BTN_ESC executes prefix+cancelindex then returns Note;window default close returns raw cancelindex,possibly different from explicit val. Resource-to-variant wiring still needs confirmation. Input mutates variant by reference. Desktop minwidth400,cap screen-minus16;iterative text fitting max10 passes;mobile prefixes/margins/stacking. No business HFSQL.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

MIG-5 checkpoint: useDialogs().resource returns explicit result/input through the shared queue and retains source click/Esc/close distinctions. DEV identifiers skin-resource-open, skin-resource-checkbox, skin-resource-multiline, skin-resource-long, skin-resource-long-text, skin-resource-icon, skin-resource-sized, skin-resource-wide and skin-resource-mnemonic use synthetic data; BTN_2 and later names are source-defined clones. Dialog metrics follow source button widths/gaps, bounded text fitting and input-height reservation; label width-stretch remains a U-W0075A5-01 fallback. Initial multiline width/height and optional text width adaptation follow source :1094–1155; zero/absent maximum keeps the aligned width. Captions come from requests; skin/font defaults are assumed under Q-12. Typed masks/coercion, optional input flags, invalid/absent indexes, calculator, external/file images and native/visual acceptance remain pending; ui-check.config.json records the missing reference and controls.

Desktop button caption mnemonics now route to the real button result/current input in the dialog scope; escaping, collision and underline policy are ADR-003 defaults, not recovered custom keyboard metadata.

Windows icon selection follows source :663–697, including 0x30 selecting ICON_ERREUR. Checked custom project images use the complete exported image. Symbols and image stretching remain assumed under Q-12; the encoded initial image for other flags remains U-W0075A5-01.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W0075A5-01 |
| window_type | unresolved (encoded); U-W0075A5-01 |
| opening_mode | unresolved (encoded); U-W0075A5-01 |
| size | width 261, height 121 — legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:15-16; base designer size, before source runtime resizing |
| close_icon | unresolved (encoded); U-W0075A5-01 |
| flags | unresolved (encoded); U-W0075A5-01 |

Default/Abort button types below; actual native routing and first focus U-W0075A5-02. Saved position versus opening-mode precedence U-W0075A5-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W0075A5-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WINDEVDIALOGBOX | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| ICON_Question | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| ICON_INFORMATION | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| ICON_ERREUR | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| LIB_INFO | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_ESC | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| ICONE | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| LIB_TITRE | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| SAI_1 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| INT_1 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_1 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_MOBILE_1 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| RADTitle | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| SCSystemButtons | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_UMC | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_SYST_MINIMIZE | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_Syst_Maximize | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_SYST_FERMER | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| BTN_Syst_Restore | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| _Menu | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| __bBitPresent | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| AfficherBoutons | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| AfficherImage | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| EmpileBoutons | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| CentrerBoutons | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| RedimensionnerFenêtre | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| CalculeMeilleureDimensionTexte | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| FermeDialogue | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| InitDialogue | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| InitChampSaisieOuInterrupteur | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| AdapteLargeurSaisie | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| _bEstNumriqueOuDateOuHeure | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| InitLargeurMaxFen | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| InitSiMobile | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |
| _bModeMobile | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | unresolved (encoded); U-W0075A5-01 | {"tab": "unresolved (encoded); U-W0075A5-01", "column": "—"} | ["unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01", "unresolved (encoded); U-W0075A5-01"] | unresolved (encoded); U-W0075A5-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| WINDEVDIALOGBOX | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1000 |
| ICON_Question | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1001 |
| ICON_INFORMATION | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1002 |
| ICON_ERREUR | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1003 |
| LIB_INFO | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1004 |
| BTN_ESC | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1005 |
| ICONE | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1006 |
| LIB_TITRE | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1007 |
| SAI_1 | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1008 |
| INT_1 | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1009 |
| BTN_1 | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1010 |
| BTN_MOBILE_1 | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1011 |
| RADTitle | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1012 |
| SCSystemButtons | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1013 |
| BTN_UMC | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1014 |
| BTN_SYST_MINIMIZE | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1015 |
| BTN_Syst_Maximize | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1016 |
| BTN_SYST_FERMER | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1017 |
| BTN_Syst_Restore | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1018 |
| _Menu | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1019 |
| __bBitPresent | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1020 |
| AfficherBoutons | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1021 |
| AfficherImage | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1022 |
| EmpileBoutons | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1023 |
| CentrerBoutons | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1024 |
| RedimensionnerFenêtre | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1025 |
| CalculeMeilleureDimensionTexte | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1026 |
| FermeDialogue | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1027 |
| InitDialogue | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1028 |
| InitChampSaisieOuInterrupteur | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1029 |
| AdapteLargeurSaisie | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1030 |
| _bEstNumriqueOuDateOuHeure | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1031 |
| InitLargeurMaxFen | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1032 |
| InitSiMobile | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1033 |
| _bModeMobile | unresolved (encoded); U-W0075A5-01 | RULE-W0075A5-1034 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WINDEVDIALOGBOX.md. Title/default/Esc/language: U-W0075A5-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W0075A5-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | U-W0075A5-04 |
| Actual field/type edges | U-W0075A5-05; text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. |
| Omitted visual metadata | U-W0075A5-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W0075A5-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W0075A5-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W0075A5-04 |
