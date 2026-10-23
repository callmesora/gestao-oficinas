# Mapping — WINDEVMESSAGEBOX

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw`; designer `dossier: WINDEVMESSAGEBOX`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Skinned Info/Error/YesNo/Confirm/Warning/OKCancel.

## Entry and exit

No explicit Open caller in pack; framework/project routing: U-W36869F-01.

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: U-W36869F-01. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Params title,text,type1,button1. IDOK1,IDCANCEL2,IDYES6,IDNO7. Type0/1OK;type2YesNo close7;type3YesNoCancel close2;type4 warning informationicon;type5 relabelYesNo toOKCancel,but yesreturns1,no/closereturn7. Defaultbutton2 selectsNo,3Cancel(type3). Clipboard copies title/text separators. Widthcap600 editor units,dynamic text height,centerbuttons,system sounds. No business HFSQL.

Evidence: `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw` exact event locations below; `dossier: WINDEVMESSAGEBOX/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-3de5fd35ff — WINDEVMESSAGEBOX/BTN_OK

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:33-35`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ferme("", IDOK). Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-3de5fd35ff.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
ferme("", IDOK)
```

### SRC-6baeb84790 — WINDEVMESSAGEBOX/BTN_OUI

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:68-75`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: si nType=5 alors; ferme("", IDOK); ferme("", IDYES). Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-6baeb84790.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
si nType=5 alors
ferme("", IDOK)
FIN
ferme("", IDYES)
```

### SRC-a24996f102 — WINDEVMESSAGEBOX/BTN_NON

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:95-96`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ferme("", IDNO). Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-a24996f102.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
ferme("", IDNO)
```

### SRC-864e1ee8bf — WINDEVMESSAGEBOX/BTN_ANNULER

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:116-120`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ferme("", IDCANCEL ). Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-864e1ee8bf.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
ferme("", IDCANCEL )
```

### SRC-31b3e7b956 — WINDEVMESSAGEBOX/BTN_Copier_caché

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:179-181`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sSEP est chaine = "---------------------------"; VersPressePapier( sSEP + rc + MaFenêtre..Titre + rc + sSEP + RC + LIB_INFO ). Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-31b3e7b956.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
sSEP est chaine = "---------------------------"
VersPressePapier( sSEP + rc + MaFenêtre..Titre + rc + sSEP + RC + LIB_INFO )
```

### SRC-bd5274ab50 — WINDEVMESSAGEBOX [WINDEVMESSAGEBOX]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:372-491`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: procedure WINDEVMESSAGEBOX( szTitre="Test", szLibelle="", nType=1, nNumBouton=1); global; nLargeurBtn est entier = 0; constant MARGEBORDS  = 20; constant MARGEINTERBTN  = 6; CONSTANT IDOK     =           1; CONSTANT IDCANCEL =  	      2; CONSTANT IDABORT  =           3; CONSTANT IDRETRY  =           4; CONSTANT IDIGNORE =           5; CONSTANT IDYES    =           6; CONSTANT IDNO     =           7; LIB_INFO = szLibelle; moimeme..Titre = szTitre; selon nType; cas 0 : // Info; BTN_OK..Visible = VRAI; ICON_INFORMATION..Visible = VRAI; nLargeurBtn = BTN_OK..Largeur; moimeme..ValeurRenvoyée = IDOK; cas 1 : // Erreur; BTN_OK..Visible = VRAI; ICON_ERREUR..Visible = VRAI; nLargeurBtn =  BTN_OK..Largeur; moimeme..ValeurRenvoyée = IDOK; cas 2 : // OuiNon; BTN_OUI..Visible = VRAI; BTN_NON..Visible = VRAI; ICON_QUESTION..Visible = VRAI; nLargeurBtn = BTN_OUI..Largeur *2 + MARGEINTERBTN; SI nNumBouton=2 alors EcranPremier(BTN_NON); moimeme..ValeurRenvoyée = IDNO; cas 3 : // Confirmer; BTN_OUI..Visible = VRAI; BTN_NON..Visible = VRAI; BTN_ANNULER..Visible = VRAI; ICON_QUESTION..Visible = VRAI; nLargeurBtn =  BTN_OUI..Largeur *3 + MARGEINTERBTN*2; SI nNumBouton=2 alors EcranPremier(BTN_NON); SI. Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-bd5274ab50.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
procedure WINDEVMESSAGEBOX( szTitre="Test", szLibelle="", nType=1, nNumBouton=1)
global
nLargeurBtn est entier = 0
constant MARGEBORDS  = 20
constant MARGEINTERBTN  = 6
CONSTANT IDOK     =           1
CONSTANT IDCANCEL =  	      2
CONSTANT IDABORT  =           3
CONSTANT IDRETRY  =           4
CONSTANT IDIGNORE =           5
CONSTANT IDYES    =           6
CONSTANT IDNO     =           7
LIB_INFO = szLibelle
moimeme..Titre = szTitre
selon nType
cas 0 : // Info
BTN_OK..Visible = VRAI
ICON_INFORMATION..Visible = VRAI
nLargeurBtn = BTN_OK..Largeur
moimeme..ValeurRenvoyée = IDOK
cas 1 : // Erreur
BTN_OK..Visible = VRAI
ICON_ERREUR..Visible = VRAI
nLargeurBtn =  BTN_OK..Largeur
moimeme..ValeurRenvoyée = IDOK
cas 2 : // OuiNon
BTN_OUI..Visible = VRAI
BTN_NON..Visible = VRAI
ICON_QUESTION..Visible = VRAI
nLargeurBtn = BTN_OUI..Largeur *2 + MARGEINTERBTN
SI nNumBouton=2 alors EcranPremier(BTN_NON)
moimeme..ValeurRenvoyée = IDNO
cas 3 : // Confirmer
BTN_OUI..Visible = VRAI
BTN_NON..Visible = VRAI
BTN_ANNULER..Visible = VRAI
ICON_QUESTION..Visible = VRAI
nLargeurBtn =  BTN_OUI..Largeur *3 + MARGEINTERBTN*2
SI nNumBouton=2 alors EcranPremier(BTN_NON)
SI nNumBouton=3 alors EcranPremier(BTN_ANNULER)
moimeme..ValeurRenvoyée = IDCANCEL
cas 4 : // Avertissement
BTN_OK..Visible = VRAI
ICON_INFORMATION..Visible = VRAI
nLargeurBtn = BTN_OK..Largeur
moimeme..ValeurRenvoyée = IDOK
cas 5 : // OuiNon
BTN_OUI..Visible = VRAI
BTN_NON..Visible = VRAI
ICON_QUESTION..Visible = VRAI
BTN_OUI..Libellé = BTN_OK..libellé
BTN_NON..Libellé = BTN_ANNULER..Libellé
nLargeurBtn = BTN_OUI..Largeur *2 + MARGEINTERBTN
SI nNumBouton=2 alors EcranPremier(BTN_NON)
moimeme..ValeurRenvoyée = IDNO
FIN
RedimensionneDialogue()
CentreLesBoutons()
AvertissementSonore()
```

### SRC-74bfd4bb3b — WINDEVMESSAGEBOX [RedimensionneDialogue]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:511-558`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure RedimensionneDialogue(); nLargeurMin est entier = nLargeurBtn +  MARGEBORDS; nLargeurMaxLibelle est entier = CoordonnéeEditeurVersEcran(600); nLargeurTexte est entier = Textelargeur(LIB_INFO, szLibelle) + 10; si nLargeurTexte > nLargeurMaxLibelle alors; nLargeurTexte = nLargeurMaxLibelle; LIB_INFO..Largeur = nLargeurTexte; nHauteurTexte est entier = TexteHauteur(LIB_INFO, szLibelle, tMultiLigne); si nHauteurTexte< ICON_INFORMATION..Hauteur alors nHauteurTexte =  ICON_INFORMATION..Hauteur; LIB_INFO..CadrageVertical = cvMilieu; nLargeurFen est entier = nLargeurTexte +  mafenetre..largeur - LIB_INFO..LargeurInitiale; si nLargeurFen < nLargeurMin alors; nLargeurFen = nLargeurMin; nHauteurFen est entier = mafenetre..Hauteur + nHauteurTexte - LIB_INFO..HauteurInitiale; mafenetre..X -= ( nLargeurFen - mafenetre..largeur  )/2; mafenetre..Y -= ( nHauteurFen - mafenetre..Hauteur  )/2; FenTaille("", nLargeurFen, nHauteurFen); LIB_INFO..Largeur = nLargeurTexte; LIB_INFO..Hauteur = nHauteurTexte; LIB_INFO = szLibelle. Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-74bfd4bb3b.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure RedimensionneDialogue()
nLargeurMin est entier = nLargeurBtn +  MARGEBORDS
nLargeurMaxLibelle est entier = CoordonnéeEditeurVersEcran(600)
nLargeurTexte est entier = Textelargeur(LIB_INFO, szLibelle) + 10
si nLargeurTexte > nLargeurMaxLibelle alors
nLargeurTexte = nLargeurMaxLibelle
FIN
LIB_INFO..Largeur = nLargeurTexte
nHauteurTexte est entier = TexteHauteur(LIB_INFO, szLibelle, tMultiLigne)
si nHauteurTexte< ICON_INFORMATION..Hauteur alors nHauteurTexte =  ICON_INFORMATION..Hauteur
LIB_INFO..CadrageVertical = cvMilieu
nLargeurFen est entier = nLargeurTexte +  mafenetre..largeur - LIB_INFO..LargeurInitiale
si nLargeurFen < nLargeurMin alors
nLargeurFen = nLargeurMin
FIN
nHauteurFen est entier = mafenetre..Hauteur + nHauteurTexte - LIB_INFO..HauteurInitiale
mafenetre..X -= ( nLargeurFen - mafenetre..largeur  )/2
mafenetre..Y -= ( nHauteurFen - mafenetre..Hauteur  )/2
FenTaille("", nLargeurFen, nHauteurFen)
LIB_INFO..Largeur = nLargeurTexte
LIB_INFO..Hauteur = nHauteurTexte
LIB_INFO = szLibelle
```

### SRC-1e105b63a7 — WINDEVMESSAGEBOX [CentreLesBoutons]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:565-587`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure CentreLesBoutons(); xStart est entier =  (FenIntLarg() - nLargeurBtn) / 2; BTN_OK..X = xStart; BTN_OUI..x = xStart; BTN_NON..X = xStart + BTN_OUI..Largeur + MARGEINTERBTN; BTN_ANNULER..x = BTN_NON..X + BTN_NON..Largeur + MARGEINTERBTN; ICON_INFORMATION..y = LIB_INFO..Y + (LIB_INFO..Hauteur - ICON_INFORMATION..Hauteur) / 2; ICON_QUESTION..y = ICON_INFORMATION..y; ICON_ERREUR..y =   ICON_INFORMATION..y. Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-1e105b63a7.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure CentreLesBoutons()
xStart est entier =  (FenIntLarg() - nLargeurBtn) / 2
BTN_OK..X = xStart
BTN_OUI..x = xStart
BTN_NON..X = xStart + BTN_OUI..Largeur + MARGEINTERBTN
BTN_ANNULER..x = BTN_NON..X + BTN_NON..Largeur + MARGEINTERBTN
ICON_INFORMATION..y = LIB_INFO..Y + (LIB_INFO..Hauteur - ICON_INFORMATION..Hauteur) / 2
ICON_QUESTION..y = ICON_INFORMATION..y
ICON_ERREUR..y =   ICON_INFORMATION..y
```

### SRC-80c92cd813 — WINDEVMESSAGEBOX [AvertissementSonore]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:594-621`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure AvertissementSonore(); <si CibleExécution=ApplicationWindows>; SELON nType; CAS 0 : // Info; Son(sonSystèmeAstérisque); CAS 1 : // Erreur; Son(sonSystèmeArrêtCritique); CAS 2 : // OuiNon; Son(sonSystèmeQuestion); CAS 3 : // Confirmer; Son(sonSystèmeQuestion); CAS 4 : // Avertissement; Son(sonSystèmeAstérisque); CAS 5 : // OKAnnuler; Son(sonSystèmeQuestion); <sinon si CibleExécution=Java>; bip(); <fin>. Authoritative exact branch ledger: docs/mapping/WINDEVMESSAGEBOX.md under SRC-80c92cd813.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure AvertissementSonore()
<si CibleExécution=ApplicationWindows>
SELON nType
CAS 0 : // Info
Son(sonSystèmeAstérisque)
CAS 1 : // Erreur
Son(sonSystèmeArrêtCritique)
CAS 2 : // OuiNon
Son(sonSystèmeQuestion)
CAS 3 : // Confirmer
Son(sonSystèmeQuestion)
CAS 4 : // Avertissement
Son(sonSystèmeAstérisque)
CAS 5 : // OKAnnuler
Son(sonSystèmeQuestion)
FIN
<sinon si CibleExécution=Java>
bip()
<fin>
```

### SRC-63760bb08b — WINDEVMESSAGEBOX/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:224; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-74ead9e736 — WINDEVMESSAGEBOX/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:248; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-c9ff64b882 — WINDEVMESSAGEBOX/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:274; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-0469b4e4d0 — WINDEVMESSAGEBOX/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVMESSAGEBOX.wdw:300; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W36869F-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- Explicit message/resource shell outcomes: U-W36869F-04.
- Actual field/mask/type boundaries: U-W36869F-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W36869F-01** — No explicit source caller is indexed; resolve the framework/launch entry route separately from the known procedure parameters and event order. Missing designer fields require designer/raw dossier/image inspection. Blocks the missing routing/visual details only; interim default: preserve extracted fields and procedure contract, none for absent properties.
- **U-W36869F-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W36869F-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W36869F-02. This is source inspection, not a runtime parity claim.
- **U-W36869F-04** — Framework routing from application resources/calls to this variant/type and runtime language/default/Esc appearance remains open. Explicit button-index/value algorithms are already source facts. Resolve resource-to-framework wiring and runtime appearance; blocks that wiring/appearance only; interim default: source result algorithms, no invented safe destructive choice.
- **U-W36869F-05** — Golden boundary outcomes for text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

9/9 blocks; 4/4 encoded-only slots retained; 39 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WINDEVMESSAGEBOX.wdw:12`
