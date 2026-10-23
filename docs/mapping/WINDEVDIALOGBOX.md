# Mapping — WINDEVDIALOGBOX

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw`; designer `dossier: WINDEVDIALOGBOX`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Skinned dynamic resource dialog/input.

## Entry and exit

No explicit Open caller in pack; framework/project routing: U-W0075A5-01.

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: U-W0075A5-01. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Variant supplies title/message/buttons/default/cancel/icon/input. Clone BTN_1 per1-based index;label/tab/Note=explicit val or index;min button80. Cancel compared with index sets Abort;default Validate. BTN_ESC executes prefix+cancelindex then returns Note;window default close returns raw cancelindex,possibly different from explicit val. Resource-to-variant wiring still needs confirmation. Input mutates variant by reference. Desktop minwidth400,cap screen-minus16;iterative text fitting max10 passes;mobile prefixes/margins/stacking. No business HFSQL.

Evidence: `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw` exact event locations below; `dossier: WINDEVDIALOGBOX/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-926dc834f3 — WINDEVDIALOGBOX/BTN_ESC

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:96-96`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ExécuteTraitement(gsNomBoutonAnnulation,trtClic). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-926dc834f3.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
ExécuteTraitement(gsNomBoutonAnnulation,trtClic)
```

### SRC-d1e0d97a2b — WINDEVDIALOGBOX/SAI_1

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:156-159`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: <compile si TypeConfiguration<>UniversalWindowsApp>; MoiMême..RetraitDroit  = 2; <fin>. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-d1e0d97a2b.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
<compile si TypeConfiguration<>UniversalWindowsApp>
MoiMême..RetraitDroit  = 2
<fin>
```

### SRC-156565898f — WINDEVDIALOGBOX/BTN_1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:213-213`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: FermeDialogue(MoiMême..Note). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-77dc6d45c8.. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-156565898f.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
FermeDialogue(MoiMême..Note)
```

### SRC-77dc6d45c8 — WINDEVDIALOGBOX/BTN_MOBILE_1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:240-240`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: FermeDialogue(MoiMême..Note). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-77dc6d45c8.. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-156565898f.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
FermeDialogue(MoiMême..Note)
```

### SRC-fffc1491f7 — WINDEVDIALOGBOX [WINDEVDIALOGBOX]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:439-467`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: Procédure WINDEVDIALOGBOX( gParamDial  ); GLOBAL; gnLargeurBtn 			est un entier  			// Largeur pour les boutons du dialogue.; gnNbBouton 				est un entier  = 1; gnMargeBordBtn			est un entier  = 100	// Marge en plus des boutons pour la LargeurMin; gnLargeurMinFen			est un entier  = 200	// Largeur mini de la fenêtre; gnMargeinterBtnX  		est un entier  = 12 	// Marge entre les boutons; gnMargeinterBtny 		est un entier  = 2; gbEmpileSiDépasse 		est un booléen = faux 	// indique si on empile les boutons en Y si ils dépassent en largeur; gbBoutonEmpile 			est un booléen = faux 	// indique si il faut empiler les bouton les un sur les autres  (pour mobile); gnLargeurMaxFen 	    est un entier  = 4000  	// largeur Max de la fenêtre. sera mis a jour selon la taille de l'écran; gsPrefixeBouton			est chaine     = "BTN_" 	// préfixe du nom du bouton a  clone. pour différentier le look Mobile/Win32; gsNomBoutonAnnulation 	est chaine	   = BTN_1..Nom /// nom du bouton annulation; gsChampSaisie 			est une chaine 			// initialisé dans le cas de la fonction Saisie(). Laissé a "" pour Dialogue(); InitDialogue( ). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-fffc1491f7.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure WINDEVDIALOGBOX( gParamDial  )
GLOBAL
gnLargeurBtn 			est un entier  			// Largeur pour les boutons du dialogue.
gnNbBouton 				est un entier  = 1
gnMargeBordBtn			est un entier  = 100	// Marge en plus des boutons pour la LargeurMin
gnLargeurMinFen			est un entier  = 200	// Largeur mini de la fenêtre
gnMargeinterBtnX  		est un entier  = 12 	// Marge entre les boutons
gnMargeinterBtny 		est un entier  = 2
gbEmpileSiDépasse 		est un booléen = faux 	// indique si on empile les boutons en Y si ils dépassent en largeur
gbBoutonEmpile 			est un booléen = faux 	// indique si il faut empiler les bouton les un sur les autres  (pour mobile)
gnLargeurMaxFen 	    est un entier  = 4000  	// largeur Max de la fenêtre. sera mis a jour selon la taille de l'écran
gsPrefixeBouton			est chaine     = "BTN_" 	// préfixe du nom du bouton a  clone. pour différentier le look Mobile/Win32
gsNomBoutonAnnulation 	est chaine	   = BTN_1..Nom /// nom du bouton annulation
gsChampSaisie 			est une chaine 			// initialisé dans le cas de la fonction Saisie(). Laissé a "" pour Dialogue()
InitDialogue( )
```

### SRC-945909dc14 — WINDEVDIALOGBOX [__bBitPresent]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:536-543`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure __bBitPresent(dwFlag est entier, dwPOWOF2 est entier); si dwFlag = dwPOWOF2 alors renvoyer vrai; nRes est entier = dwFlag & dwPOWOF2; renvoyer nRes<>0. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-945909dc14.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure __bBitPresent(dwFlag est entier, dwPOWOF2 est entier)
si dwFlag = dwPOWOF2 alors renvoyer vrai
nRes est entier = dwFlag & dwPOWOF2
renvoyer nRes<>0
```

### SRC-318c693490 — WINDEVDIALOGBOX [AfficherBoutons]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:550-656`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure AfficherBoutons(tabBouton, local nBoutonDefaut entier, local nBoutonAnnulation entier <utile>, local nDelaiAvantFermeture entier); gnLargeurBtn=0; nLargeurBtnMax est un entier=0; nNbParamParBouton est un entier=1; gnNbBouton = tabBouton..Occurrence; si nDelaiAvantFermeture > 0 _et_ nBoutonDefaut <= 0 ALORS; nBoutonDefaut = 1;; i est un entier; sNomBouton est une chaine; pour i=1 _a_ gnNbBouton; sLib est une chaine= tabBouton[i].lib; sNomBouton  = gsPrefixeBouton+i; si i>1 alors; si pas ChampExiste(sNomBouton); ChampClone(gsPrefixeBouton + "1",sNomBouton); <compile si TypeConfiguration<>iOS _et_ TypeConfiguration<>Android>; {sNomBouton,indChamp}..NumTAB=i; <fin>; SI _bModeMobile()  ALORS; sLib = Remplace(sLib,"&",""); {sNomBouton,indChamp}..Libellé=sLib; nValeurRetour est entier = i; si tabBouton[i].val..existe alors  nValeurRetour = tabBouton[i].val; {sNomBouton,indChamp}..Note=nValeurRetour// utilisé dans le code de clic du bouton; sTexteMax est une chaine; si nDelaiAvantFermeture > 0 _et_ i = nBoutonDefaut ALORS; sTexteMax = {sNomBouton,indChamp}..Libellé +" ("+NumériqueVersChaine(nDelaiAvantFermeture, "d")+" s)"; sTexteMax = {sNomBouton,indChamp}..Libellé; nLargeurMINB. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-318c693490.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure AfficherBoutons(tabBouton, local nBoutonDefaut entier, local nBoutonAnnulation entier <utile>, local nDelaiAvantFermeture entier)
gnLargeurBtn=0
nLargeurBtnMax est un entier=0
nNbParamParBouton est un entier=1
gnNbBouton = tabBouton..Occurrence
si nDelaiAvantFermeture > 0 _et_ nBoutonDefaut <= 0 ALORS
nBoutonDefaut = 1;
FIN
i est un entier
sNomBouton est une chaine
pour i=1 _a_ gnNbBouton
sLib est une chaine= tabBouton[i].lib
sNomBouton  = gsPrefixeBouton+i
si i>1 alors
si pas ChampExiste(sNomBouton)
ChampClone(gsPrefixeBouton + "1",sNomBouton)
fin
fin
<compile si TypeConfiguration<>iOS _et_ TypeConfiguration<>Android>
{sNomBouton,indChamp}..NumTAB=i
<fin>
SI _bModeMobile()  ALORS
sLib = Remplace(sLib,"&","")
FIN
{sNomBouton,indChamp}..Libellé=sLib
nValeurRetour est entier = i
si tabBouton[i].val..existe alors  nValeurRetour = tabBouton[i].val
{sNomBouton,indChamp}..Note=nValeurRetour// utilisé dans le code de clic du bouton
sTexteMax est une chaine
si nDelaiAvantFermeture > 0 _et_ i = nBoutonDefaut ALORS
sTexteMax = {sNomBouton,indChamp}..Libellé +" ("+NumériqueVersChaine(nDelaiAvantFermeture, "d")+" s)"
sinon
sTexteMax = {sNomBouton,indChamp}..Libellé
FIN
nLargeurMINBTN est entier = 80
nMARGE est entier = 2*gnMargeinterBtnX
nLargeurBnI est entier = max(nLargeurMINBTN, TexteLargeur({sNomBouton,indChamp}, sTexteMax,tMonoligne)+nMARGE)
si nLargeurBnI > nLargeurBtnMax ALORS
nLargeurBtnMax = nLargeurBnI; // nouveau Max
FIN
{sNomBouton,indChamp}..largeur= nLargeurBnI;
gnLargeurBtn += {sNomBouton,indChamp}..largeur
fin
<COMPILE SI TypeConfiguration<>Android>
POUR i=1 _À_ gnNbBouton
sNomBouton  = gsPrefixeBouton+i
SI i = nBoutonAnnulation ALORS
{sNomBouton,indChamp}..TypeBouton= btnAbandon
FIN
SI i = nBoutonDefaut ALORS
{sNomBouton,indChamp}..TypeBouton= btnValidation
FIN
fin
<FIN>
MaFenêtre..valeurrenvoyee=gParamDial.boutonAnnulation
gsNomBoutonAnnulation = gsPrefixeBouton + gParamDial.boutonAnnulation
gnLargeurBtn+=(gnNbBouton-1)*gnMargeinterBtnX
si gbEmpileSiDépasse _et_ gnLargeurBtn >= gnLargeurMaxFen-gnMargeinterBtnX ALORS
gnLargeurBtn = nLargeurBtnMax
gbBoutonEmpile = vrai
FIN
```

### SRC-dd80105690 — WINDEVDIALOGBOX [AfficherImage]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:663-697`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure AfficherImage(local nFlagImage entier, local sImage chaine ); SI nFlagImage<>0 ALORS; SI 	EnModeiOS()				  _OU_; EnModeAndroid()			  ALORS; ICONE..Visible = faux; LIB_TITRE..x 	   -= ICONE..Largeur; LIB_TITRE..Largeur += ICONE..Largeur; si LIB_TITRE = "" alors; LIB_TITRE..Visible = faux; LIB_INFO..Y -= LIB_TITRE..Hauteur; SI __bBitPresent(nFlagImage , 0x20) _ET_ __bBitPresent(nFlagImage , 0x10)  ALORS; ICONE = ICON_ERREUR; SINON SI __bBitPresent(nFlagImage,0x20) ALORS; ICONE = ICON_QUESTION; SINON SI __bBitPresent(nFlagImage,0x00000040) ALORS; ICONE  = ICON_INFORMATION; ICONE = sImage. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-dd80105690.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure AfficherImage(local nFlagImage entier, local sImage chaine )
SI nFlagImage<>0 ALORS
SI 	EnModeiOS()				  _OU_
EnModeAndroid()			  ALORS
ICONE..Visible = faux
LIB_TITRE..x 	   -= ICONE..Largeur
LIB_TITRE..Largeur += ICONE..Largeur
si LIB_TITRE = "" alors
LIB_TITRE..Visible = faux
LIB_INFO..Y -= LIB_TITRE..Hauteur
FIN
fin
SI __bBitPresent(nFlagImage , 0x20) _ET_ __bBitPresent(nFlagImage , 0x10)  ALORS
ICONE = ICON_ERREUR
SINON SI __bBitPresent(nFlagImage,0x20) ALORS
ICONE = ICON_QUESTION
SINON SI __bBitPresent(nFlagImage,0x00000040) ALORS
ICONE  = ICON_INFORMATION
FIN
SINON
ICONE = sImage
FIN
```

### SRC-68b3592e69 — WINDEVDIALOGBOX [EmpileBoutons]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:704-727`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure EmpileBoutons(); nPosX est entier = 0; nPosY est entier = 	MaFenêtre..Hauteur - (({gsPrefixeBouton + "1",indChamp}..Hauteur + gnMargeinterBtny) * (gnNbBouton)); nPosY -= gnMargeBordBtn/2; nPosX = (MaFenêtre..largeur - gnLargeurBtn) / 2; i est un entier; pour i=1 _a_ gnNbBouton; sNomBouton est une chaine= gsPrefixeBouton+i; {sNomBouton,indChamp}..X = nPosX; {sNomBouton,indChamp}..Y = nPosY; {sNomBouton,indChamp}..Ancrage = 0; {sNomBouton,indChamp}..Largeur = gnLargeurBtn; nPosY+={sNomBouton,indChamp}..Hauteur+gnMargeinterBtny // bouton suivant. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-68b3592e69.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure EmpileBoutons()
nPosX est entier = 0
nPosY est entier = 	MaFenêtre..Hauteur - (({gsPrefixeBouton + "1",indChamp}..Hauteur + gnMargeinterBtny) * (gnNbBouton))
nPosY -= gnMargeBordBtn/2
nPosX = (MaFenêtre..largeur - gnLargeurBtn) / 2
i est un entier
pour i=1 _a_ gnNbBouton
sNomBouton est une chaine= gsPrefixeBouton+i
{sNomBouton,indChamp}..X = nPosX
{sNomBouton,indChamp}..Y = nPosY
{sNomBouton,indChamp}..Ancrage = 0
{sNomBouton,indChamp}..Largeur = gnLargeurBtn
nPosY+={sNomBouton,indChamp}..Hauteur+gnMargeinterBtny // bouton suivant
FIN
```

### SRC-054ccb378d — WINDEVDIALOGBOX [CentrerBoutons]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:734-760`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure CentrerBoutons(); nPosDébut est entier = 0; nMargeBas est entier = 5; nPosY est entier = MaFenêtre..Hauteur - BTN_1..Hauteur - nMargeBas; nPosDébut = (MaFenêtre..largeur - gnLargeurBtn) / 2; si EnModeAndroid() ALORS; nPosDébut = MaFenêtre..Largeur - gnLargeurBtn - gnMargeBordBtn/2; i est un entier; pour i=1 _a_ gnNbBouton; sNomBouton est une chaine= gsPrefixeBouton+i; {sNomBouton,indChamp}..X = nPosDébut; SI _bModeMobile() alors; {sNomBouton,indChamp}..Y = nPosY; nPosDébut+={sNomBouton,indChamp}..Largeur+gnMargeinterBtnX. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-054ccb378d.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure CentrerBoutons()
nPosDébut est entier = 0
nMargeBas est entier = 5
nPosY est entier = MaFenêtre..Hauteur - BTN_1..Hauteur - nMargeBas
nPosDébut = (MaFenêtre..largeur - gnLargeurBtn) / 2
si EnModeAndroid() ALORS
nPosDébut = MaFenêtre..Largeur - gnLargeurBtn - gnMargeBordBtn/2
FIN
i est un entier
pour i=1 _a_ gnNbBouton
sNomBouton est une chaine= gsPrefixeBouton+i
{sNomBouton,indChamp}..X = nPosDébut
SI _bModeMobile() alors
{sNomBouton,indChamp}..Y = nPosY
fin
nPosDébut+={sNomBouton,indChamp}..Largeur+gnMargeinterBtnX
FIN
```

### SRC-2e0e702cf2 — WINDEVDIALOGBOX [RedimensionnerFenêtre]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:767-890`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure RedimensionnerFenêtre(szLibelleParam); szLibelle est chaine = szLibelleParam // contournement si UNICODE; nLargeurMin 	est entier = 0; nLargeurTexte 	est entier = 0; nHauteurTexte 	est entier = 0; nLargeurFen 	est entier = 0; nHauteurFen 	est entier = 0; nHauteurMinFen  est entier = MaFenêtre..HauteurInitiale; nLargeurMin = gnLargeurBtn + gnMargeBordBtn; SI nLargeurMin< 400 _et_ pas _bModeMobile() ALORS; nLargeurMin = 400; nLargeurTitre est un entier; si FenAgencementEnCours() =1 ALORS; nLargeurTitre=TexteLargeur(LIB_INFO, MoiMême..Titre, tMonoligne); nLargeurTitre=textelargeur(LIB_TITRE, moimeme..titre, tMonoligne); si nLargeurMin < nLargeurTitre+ gnMargeBordBtn alors; nLargeurMin = nLargeurTitre+ gnMargeBordBtn; si nLargeurMin < gnLargeurMinFen alors nLargeurMin = gnLargeurMinFen; CalculeMeilleureDimensionTexte(nLargeurTexte, nHauteurTexte,szLibelle); nHauteurSaisie est un entier=0; si ChampExiste(gsChampSaisie) ALORS; nHauteurSaisie={gsChampSaisie,indChamp}..Hauteur; nLargeurTexte=max(nLargeurTexte, {gsChampSaisie,indChamp}..Largeur + 10); si nHauteurTexte +nHauteurSaisie +6 < ICONE..Hauteur alors; nHauteurTexte = ICONE..Hauteur - nHauteurSaisie - 6; nLargeurFen = nLar. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-2e0e702cf2.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure RedimensionnerFenêtre(szLibelleParam)
szLibelle est chaine = szLibelleParam // contournement si UNICODE
nLargeurMin 	est entier = 0
nLargeurTexte 	est entier = 0
nHauteurTexte 	est entier = 0
nLargeurFen 	est entier = 0
nHauteurFen 	est entier = 0
nHauteurMinFen  est entier = MaFenêtre..HauteurInitiale
nLargeurMin = gnLargeurBtn + gnMargeBordBtn
SI nLargeurMin< 400 _et_ pas _bModeMobile() ALORS
nLargeurMin = 400
FIN
nLargeurTitre est un entier
si FenAgencementEnCours() =1 ALORS
nLargeurTitre=TexteLargeur(LIB_INFO, MoiMême..Titre, tMonoligne)
sinon
nLargeurTitre=textelargeur(LIB_TITRE, moimeme..titre, tMonoligne)
fin
si nLargeurMin < nLargeurTitre+ gnMargeBordBtn alors
nLargeurMin = nLargeurTitre+ gnMargeBordBtn
FIN
si nLargeurMin < gnLargeurMinFen alors nLargeurMin = gnLargeurMinFen
CalculeMeilleureDimensionTexte(nLargeurTexte, nHauteurTexte,szLibelle)
nHauteurSaisie est un entier=0
si ChampExiste(gsChampSaisie) ALORS
nHauteurSaisie={gsChampSaisie,indChamp}..Hauteur
nLargeurTexte=max(nLargeurTexte, {gsChampSaisie,indChamp}..Largeur + 10)
FIN
si nHauteurTexte +nHauteurSaisie +6 < ICONE..Hauteur alors
nHauteurTexte = ICONE..Hauteur - nHauteurSaisie - 6
FIN
nLargeurFen = nLargeurTexte + MaFenêtre..largeur - LIB_INFO..largeur
si nLargeurFen < nLargeurMin alors nLargeurFen = nLargeurMin
si nLargeurFen > gnLargeurMaxFen alors
nLargeurFen = gnLargeurMaxFen
FIN
nHauteurFen = MaFenêtre..HauteurInitiale + nHauteurTexte + nHauteurSaisie - LIB_INFO..Hauteur
si nHauteurSaisie>0 ALORS
nHauteurFen+=6
FIN
si gbBoutonEmpile ALORS
nHauteurFen += ({ gsPrefixeBouton +"1",indChamp}..Hauteur + gnMargeinterBtnY) * (gnNbBouton-1)
FIN
si nHauteurFen<nHauteurMinFen ALORS
nHauteurFen = nHauteurMinFen
FIN
FenTaille("", nLargeurFen, nHauteurFen)
LIB_INFO..Hauteur = nHauteurTexte
LIB_INFO = szLibelle
nEspaceH est un entier = (nLargeurFen - (ICONE..largeur + LIB_INFO..largeur)) / 3
SI _bModeMobile() ALORS
nEspaceH = ICONE..X // ne pas déplacer.
FIN
ICONE..x 	 = nEspaceH
SI pas _bModeMobile() ALOrs //QW#189203
LIB_INFO..X = 2*nEspaceH + ICONE..Largeur
fin
si ChampExiste(gsChampSaisie) ALORS
{gsChampSaisie,indChamp}..X = LIB_INFO..X
nLargeurPourAlignSai est entier = nLargeurFen - LIB_INFO..X  - 16 // 16 : marge
{gsChampSaisie,indChamp}..Largeur = nLargeurPourAlignSai
SI gParamDial.saisie.adapteLargeur ALORS
AdapteLargeurSaisie()
FIN
{gsChampSaisie,indChamp}..y=LIB_INFO..Y+nHauteurTexte-6
fin
nEspaceV est un entier = (nHauteurTexte - ICONE..Hauteur) / 2
si nEspaceV<0 ALORS
nEspaceV=0
FIN
si _bModeMobile() ALORS
nEspaceV = 0
FIN
ICONE..Y 	 +=  nEspaceV
si pas gbBoutonEmpile alors
i est entier
pour i=2 _à_ gnNbBouton
{gsPrefixeBouton +i,indChamp}..Y={gsPrefixeBouton +  "1",indChamp}..Y
FIN
fin
```

### SRC-2c90b06247 — WINDEVDIALOGBOX [CalculeMeilleureDimensionTexte]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:897-947`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure CalculeMeilleureDimensionTexte(nLargeurTexte est entier, nHauteurTexte est un entier,szLibelle est une chaine); nLargeurInfoInit est un entier= LIB_INFO..largeur; nHauteurInfoInit est un entier= LIB_INFO..Hauteur; LIB_INFO..largeur=1000; nLargeur0 est un entier= Textelargeur(LIB_INFO, szLibelle, tMultiligne ) + 40; nHauteur0 est un entier= TexteHauteur(LIB_INFO, szLibelle, tMultiligne ) + 20; nLargeurTexte=nLargeur0; nHauteurTexte=nHauteur0; rRapport est un numérique=nLargeurTexte/nHauteurTexte; nbPasse est un entier=0; tantque rRapport>2 _et_ (nbPasse<10); si nLargeurTexte>100 alors; LIB_INFO..largeur=nLargeurTexte-100; LIB_INFO..largeur=nLargeurTexte-50; nLargeur0 = Textelargeur(LIB_INFO, szLibelle, tMultiligne ) + 40; nHauteur0 = TexteHauteur(LIB_INFO, szLibelle, tMultiligne ) + 20; rRapport=nLargeur0/nHauteur0; si rRapport <1.4 ALORS; sortir; si nLargeurTexte=nLargeur0 ALORS; sortir; nLargeurTexte=nLargeur0; nHauteurTexte=nHauteur0; nbPasse++ //sécurité anti boucle infini; LIB_INFO..largeur=nLargeurInfoInit; LIB_INFO..Hauteur=nHauteurInfoInit. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-2c90b06247.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure CalculeMeilleureDimensionTexte(nLargeurTexte est entier, nHauteurTexte est un entier,szLibelle est une chaine)
nLargeurInfoInit est un entier= LIB_INFO..largeur
nHauteurInfoInit est un entier= LIB_INFO..Hauteur
LIB_INFO..largeur=1000
nLargeur0 est un entier= Textelargeur(LIB_INFO, szLibelle, tMultiligne ) + 40
nHauteur0 est un entier= TexteHauteur(LIB_INFO, szLibelle, tMultiligne ) + 20
nLargeurTexte=nLargeur0
nHauteurTexte=nHauteur0
rRapport est un numérique=nLargeurTexte/nHauteurTexte
nbPasse est un entier=0
tantque rRapport>2 _et_ (nbPasse<10)
si nLargeurTexte>100 alors
LIB_INFO..largeur=nLargeurTexte-100
sinon
LIB_INFO..largeur=nLargeurTexte-50
fin
nLargeur0 = Textelargeur(LIB_INFO, szLibelle, tMultiligne ) + 40
nHauteur0 = TexteHauteur(LIB_INFO, szLibelle, tMultiligne ) + 20
rRapport=nLargeur0/nHauteur0
si rRapport <1.4 ALORS
sortir
FIN
si nLargeurTexte=nLargeur0 ALORS
sortir
FIN
nLargeurTexte=nLargeur0
nHauteurTexte=nHauteur0
nbPasse++ //sécurité anti boucle infini
FIN
LIB_INFO..largeur=nLargeurInfoInit
LIB_INFO..Hauteur=nHauteurInfoInit
```

### SRC-2ddc0d2054 — WINDEVDIALOGBOX [FermeDialogue]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:954-966`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure FermeDialogue(local ValeurRet est un entier); si gParamDial.saisie.valeur..Existe _et_ gsChampSaisie<>"" ALORS; gParamDial.saisie.valeur = {gsChampSaisie, indChamp}..Valeur; Ferme("", ValeurRet). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-2ddc0d2054.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure FermeDialogue(local ValeurRet est un entier)
si gParamDial.saisie.valeur..Existe _et_ gsChampSaisie<>"" ALORS
gParamDial.saisie.valeur = {gsChampSaisie, indChamp}..Valeur
FIN
Ferme("", ValeurRet)
```

### SRC-ecee91c52c — WINDEVDIALOGBOX [InitDialogue]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:973-1020`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: Procédure InitDialogue( ); InitSiMobile(); si EnModeLinux() ALORS; FenChangeAgencement(1) // comme Windows; InitLargeurMaxFen(); MoiMême..titre = gParamDial.titre; LIB_TITRE	   = gParamDial.titre; LIB_INFO	   = gParamDial.message; InitChampSaisieOuInterrupteur(gParamDial.saisie ); AfficherBoutons(gParamDial.tabBouton, gParamDial.boutonParDefaut, gParamDial.boutonAnnulation, gParamDial.delaisAvantFermeture); AfficherImage(gParamDial.type, gParamDial.image); RedimensionnerFenêtre(gParamDial.message); si gbBoutonEmpile alors; EmpileBoutons(); CentrerBoutons(); si ChampExiste(gsChampSaisie) ALORS; DonneFocus(gsChampSaisie); DonneFocus(gsPrefixeBouton+gParamDial.boutonParDefaut). Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-ecee91c52c.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Procédure InitDialogue( )
InitSiMobile()
si EnModeLinux() ALORS
FenChangeAgencement(1) // comme Windows
FIN
InitLargeurMaxFen()
MoiMême..titre = gParamDial.titre
LIB_TITRE	   = gParamDial.titre
LIB_INFO	   = gParamDial.message
InitChampSaisieOuInterrupteur(gParamDial.saisie )
AfficherBoutons(gParamDial.tabBouton, gParamDial.boutonParDefaut, gParamDial.boutonAnnulation, gParamDial.delaisAvantFermeture)
AfficherImage(gParamDial.type, gParamDial.image)
RedimensionnerFenêtre(gParamDial.message)
si gbBoutonEmpile alors
EmpileBoutons()
sinon
CentrerBoutons()
fin
si ChampExiste(gsChampSaisie) ALORS
DonneFocus(gsChampSaisie)
sinon
DonneFocus(gsPrefixeBouton+gParamDial.boutonParDefaut)
FIN
```

### SRC-68a9e0c43f — WINDEVDIALOGBOX [InitChampSaisieOuInterrupteur]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1027-1114`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE InitChampSaisieOuInterrupteur( varSaisie ); si pas varSaisie.type..existe ALORS; retour; si  varSaisie.type = typInterr ALORS; INT_1..Visible = vrai; gsChampSaisie = MaFenêtre..Nom + "." + INT_1..Nom; INT_1[1]..Libellé =	varSaisie.libelleOptionnel; INT_1 = varSaisie.valeur; retour; gsChampSaisie = MaFenêtre..Nom + "." + SAI_1..Nom; SAI_1..TypeSaisie = varSaisie.type; si varSaisie.masqueSaisie..existe alors; SAI_1..MasqueSaisie = varSaisie.masqueSaisie; <COMPILE SI TypeConfiguration<>Android>; si varSaisie.effacementAutomatique..Existe ALORS; SAI_1..EffacementAutomatique = varSaisie.effacementAutomatique; <FIN>; <COMPILE SI TypeConfiguration<>iOS>; SI varSaisie.formatMemorise..Existe ALORS; SAI_1..FormatMémorisé = varSaisie.formatMemorise; SI varSaisie.motDePasse..Existe ALORS; SAI_1..MotDePasse = varSaisie.motDePasse; <FIN>; SI varSaisie.tailleSaisie..Existe ALORS; SAI_1..Taille = varSaisie.tailleSaisie; <COMPILE SI TypeConfiguration<>iOS>; si  _bEstNumriqueOuDateOuHeure( varSaisie.type ) alors; SAI_1..CadrageHorizontal = chDroite; <FIN>; sValeurInitiale est chaine = varSaisie.valeur; SI varSaisie.type = typSaisieTexte _ET_ Position(sValeurInitiale,RC)>0 ALORS; {gsChampSa. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-68a9e0c43f.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE InitChampSaisieOuInterrupteur( varSaisie )
si pas varSaisie.type..existe ALORS
retour
FIN
si  varSaisie.type = typInterr ALORS
INT_1..Visible = vrai
gsChampSaisie = MaFenêtre..Nom + "." + INT_1..Nom
INT_1[1]..Libellé =	varSaisie.libelleOptionnel
INT_1 = varSaisie.valeur
retour
FIN
gsChampSaisie = MaFenêtre..Nom + "." + SAI_1..Nom
SAI_1..TypeSaisie = varSaisie.type
si varSaisie.masqueSaisie..existe alors
SAI_1..MasqueSaisie = varSaisie.masqueSaisie
fin
<COMPILE SI TypeConfiguration<>Android>
si varSaisie.effacementAutomatique..Existe ALORS
SAI_1..EffacementAutomatique = varSaisie.effacementAutomatique
FIN
<FIN>
<COMPILE SI TypeConfiguration<>iOS>
SI varSaisie.formatMemorise..Existe ALORS
SAI_1..FormatMémorisé = varSaisie.formatMemorise
FIN
SI varSaisie.motDePasse..Existe ALORS
SAI_1..MotDePasse = varSaisie.motDePasse
FIN
<FIN>
SI varSaisie.tailleSaisie..Existe ALORS
SAI_1..Taille = varSaisie.tailleSaisie
FIN
<COMPILE SI TypeConfiguration<>iOS>
si  _bEstNumriqueOuDateOuHeure( varSaisie.type ) alors
SAI_1..CadrageHorizontal = chDroite
fin
<FIN>
sValeurInitiale est chaine = varSaisie.valeur
SI varSaisie.type = typSaisieTexte _ET_ Position(sValeurInitiale,RC)>0 ALORS
{gsChampSaisie, indChamp}..Multiligne = Vrai
nLargeurCur  est entier = {gsChampSaisie, indChamp}..Largeur // Max pour ne pas descendre a 0.
{gsChampSaisie, indChamp}..Largeur	  = Max(nLargeurCur, TexteLargeur(SAI_1, sValeurInitiale,tMultiligne))
{gsChampSaisie, indChamp}..hauteur    = TexteHauteur(SAI_1, sValeurInitiale,tMultiligne)
FIN
<COMPILE SI TypeConfiguration<>Android ET TypeConfiguration<>iOS >
si varSaisie.boutonCalculatrice ALORS
SAI_1..BoutonCalculatrice = vrai
FIN
<FIN>
si _bModeMobile() ALORS
SAI_1..PoliceTaille  = LIB_INFO..PoliceTaille
FIN
SAI_1..Visible = vrai
SAI_1 = sValeurInitiale
```

### SRC-542811c19e — WINDEVDIALOGBOX [AdapteLargeurSaisie]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1121-1162`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE AdapteLargeurSaisie(); nNbCharMax est un entier; nlargeurMax1Char est un entier; nlargeurMax1Char = TexteLargeur(SAI_1,"W" ); si SAI_1..TypeSaisie = typSaisieTexte ALORS; nNbCharMax = SAI_1..Taille; si nNbCharMax= 0 ALORS; retour // ne rien faire, pas de max; nNbCharMax = Taille(SAI_1..MasqueSaisie); SI  _bEstNumriqueOuDateOuHeure( SAI_1..TypeSaisie ) ALORS; nlargeurMax1Char = TexteLargeur(SAI_1, "0" ); nMarges est entier = 8; nLargeurNécessaire est entier = nNbCharMax *nlargeurMax1Char + nMarges; SAI_1..Largeur = nLargeurNécessaire. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-542811c19e.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE AdapteLargeurSaisie()
nNbCharMax est un entier
nlargeurMax1Char est un entier
nlargeurMax1Char = TexteLargeur(SAI_1,"W" )
si SAI_1..TypeSaisie = typSaisieTexte ALORS
nNbCharMax = SAI_1..Taille
si nNbCharMax= 0 ALORS
retour // ne rien faire, pas de max
FIN
sinon
nNbCharMax = Taille(SAI_1..MasqueSaisie)
FIN
SI  _bEstNumriqueOuDateOuHeure( SAI_1..TypeSaisie ) ALORS
nlargeurMax1Char = TexteLargeur(SAI_1, "0" )
FIN
nMarges est entier = 8
nLargeurNécessaire est entier = nNbCharMax *nlargeurMax1Char + nMarges
SAI_1..Largeur = nLargeurNécessaire
```

### SRC-bf610621ed — WINDEVDIALOGBOX [_bEstNumriqueOuDateOuHeure]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1169-1183`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE _bEstNumriqueOuDateOuHeure(local type entier); SI  type = typSaisieNum			  	_OU_; type = typSaisieMonétaire		_OU_; type = typSaisieDate			_ou_; type = typSaisieheure				 ALORS; renvoyer vrai; renvoyer faux. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-bf610621ed.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE _bEstNumriqueOuDateOuHeure(local type entier)
SI  type = typSaisieNum			  	_OU_
type = typSaisieMonétaire		_OU_
type = typSaisieDate			_ou_
type = typSaisieheure				 ALORS
renvoyer vrai
FIN
renvoyer faux
```

### SRC-cb774e37cc — WINDEVDIALOGBOX [InitLargeurMaxFen]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1190-1210`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE InitLargeurMaxFen(); si EnModeLinux() ALORS; retour // SysXRes() non dispo en linux; nMarge			est un entier	= 8; nLargeurEcran	est entier; <COMPILE si TypeConfiguration<>ApplicationLinux>; nLargeurEcran    = SysXRes() - nMarge*2; <fin>; SI gnLargeurMaxFen > nLargeurEcran ALORS; gnLargeurMaxFen = nLargeurEcran. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-cb774e37cc.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE InitLargeurMaxFen()
si EnModeLinux() ALORS
retour // SysXRes() non dispo en linux
FIN
nMarge			est un entier	= 8
nLargeurEcran	est entier
<COMPILE si TypeConfiguration<>ApplicationLinux>
nLargeurEcran    = SysXRes() - nMarge*2
<fin>
SI gnLargeurMaxFen > nLargeurEcran ALORS
gnLargeurMaxFen = nLargeurEcran
FIN
```

### SRC-4550a4dc45 — WINDEVDIALOGBOX [InitSiMobile]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1217-1233`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE InitSiMobile(); SI _bModeMobile()  ALORS; gnMargeinterBtnX = 5; gnMargeBordBtn   = 20; gbEmpileSiDépasse = Vrai; gsPrefixeBouton   = "BTN_MOBILE_" // ex BTN_MOBILE_1; BTN_1..Visible = Faux// pour ne pas superposer. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-4550a4dc45.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE InitSiMobile()
SI _bModeMobile()  ALORS
gnMargeinterBtnX = 5
gnMargeBordBtn   = 20
gbEmpileSiDépasse = Vrai
gsPrefixeBouton   = "BTN_MOBILE_" // ex BTN_MOBILE_1
BTN_1..Visible = Faux// pour ne pas superposer
FIN
```

### SRC-0fded8bfe1 — WINDEVDIALOGBOX [_bModeMobile]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:1240-1254`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE _bModeMobile(); SI  EnModeSimulateurAndroid() _OU_; EnModeAndroid()			  _OU_; EnModeSimulateuriOS() 	  _OU_; EnModeSimulateurPocket()  _OU_; EnModeiOS()				  ALORS; renvoyer vrai; RENVOYER faux. Authoritative exact branch ledger: docs/mapping/WINDEVDIALOGBOX.md under SRC-0fded8bfe1.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE _bModeMobile()
SI  EnModeSimulateurAndroid() _OU_
EnModeAndroid()			  _OU_
EnModeSimulateuriOS() 	  _OU_
EnModeSimulateurPocket()  _OU_
EnModeiOS()				  ALORS
renvoyer vrai
fin
RENVOYER faux
```

### SRC-6d9acccbda — WINDEVDIALOGBOX/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:283; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-a9e498fb99 — WINDEVDIALOGBOX/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:307; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-39f86893de — WINDEVDIALOGBOX/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:333; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-9592dd4f26 — WINDEVDIALOGBOX/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WDFAA/WINDEVDIALOGBOX.wdw:359; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W0075A5-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- Explicit message/resource shell outcomes: U-W0075A5-04.
- Actual field/mask/type boundaries: U-W0075A5-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W0075A5-01** — No explicit source caller is indexed; resolve the framework/launch entry route separately from the known procedure parameters and event order. Missing designer fields require designer/raw dossier/image inspection. Blocks the missing routing/visual details only; interim default: preserve extracted fields and procedure contract, none for absent properties.
- **U-W0075A5-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W0075A5-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W0075A5-02. This is source inspection, not a runtime parity claim.
- **U-W0075A5-04** — Framework routing from application resources/calls to this variant/type and runtime language/default/Esc appearance remains open. Explicit button-index/value algorithms are already source facts. Resolve resource-to-framework wiring and runtime appearance; blocks that wiring/appearance only; interim default: source result algorithms, no invented safe destructive choice.
- **U-W0075A5-05** — Golden boundary outcomes for text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

20/20 blocks; 4/4 encoded-only slots retained; 64 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WINDEVDIALOGBOX.wdw:13`
