# Mapping — WIN_Leitor_cod_barras

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw`; designer `dossier: WIN_Leitor_cod_barras`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Partition scanner rows into recognized/unrecognized barcodes.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:929 (Open in WIN_Material_reparacao_form)`
```wlanguage
END

IF Open(WIN_leitor_cod_barras)<>"fechou" THEN
FOR EACH {"conhecidos"}
TableAddLine(TABLE_material,SysDateTime(),gsMecanico_ativo,EDT_mecanico,{"conhecidos.codartigo"},{"conhecidos.descricao"},{"conhecidos.quantidade"},{"conhecidos.preco"},false)
END
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Reads postos key1 then configured Terminais. Opens folder+filename. Failure message A leitura do ficheiro falhou, verifique o caminho returns fechou. Reads to EOT or first empty line; Middle is1-based and third parameter is length, despite codbarras_fim/quant_fim names; NoSpace strips spaces. Confirm creates conhecidos/desconhecidos HFSQL scratch files; all fields text30. SQL lookup barcode maps known code/description/quantity/price or unrecognized barcode/quantity. Success empty result; cancel/default fechou. Caller accesses dynamic files. No explicit text-file close.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw` exact event locations below; `dossier: WIN_Leitor_cod_barras/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-10a0a79c42 — WIN_Leitor_cod_barras/BTN_Cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:305-305`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Close(WIN_Leitor_cod_barras). Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras.md under SRC-10a0a79c42.

HFSQL: none in this block.

Other calls: Close(WIN_Leitor_cod_barras).

Exact executable branch/assignment ledger:
```wlanguage
Close(WIN_Leitor_cod_barras)
```

### SRC-43303c5e91 — WIN_Leitor_cod_barras/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:329-390`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: AFile1 is File Description; AnItem1 is Item Description; conhecidos is Data Source; AFile1..Name = "conhecidos"; AFile1..Type = hFileNormal; AFile1..FicCryptMethod = hCryptStandard; AnItem1..Name = "codartigo"; AnItem1..Type = hItemText; AnItem1..Size = 30; HDescribeItem(AFile1, AnItem1); AnItem1..Name = "descricao"; AnItem1..Type = hItemText; AnItem1..Size = 30; HDescribeItem(AFile1, AnItem1); AnItem1..Name = "quantidade"; AnItem1..Type = hItemText; AnItem1..Size = 30; HDescribeItem(AFile1, AnItem1); AnItem1..Name = "preco"; AnItem1..Type = hItemText; AnItem1..Size = 30; HDescribeItem(AFile1, AnItem1); HDescribeFile(AFile1); HCreation(conhecidos); AFile is File Description; AnItem is Item Description; desconhecidos is Data Source; AFile..Name = "desconhecidos"; AFile..Type = hFileNormal; AFile..FicCryptMethod = hCryptStandard; AnItem..Name = "CodBarras"; AnItem..Type = hItemText; AnItem..Size = 30; HDescribeItem(AFile, AnItem); AnItem..Name = "Quantidade"; AnItem..Type = hItemText; AnItem..Size = 30; HDescribeItem(AFile, AnItem); HDescribeFile(AFile); HCreation(desconhecidos); FOR EACH ROW OF TABLE_Leitura; sQuery is string; sQuery="select * from artigos where codbarras='"+TABLE_L. Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras.md under SRC-43303c5e91.

HFSQL: HReadFirst(Qry_select_cod_barras); HExecuteSQLQuery(Qry_select_cod_barras); HAdd(conhecidos); HAdd(desconhecidos).

Other calls: Close(WIN_Leitor_cod_barras).

Exact executable branch/assignment ledger:
```wlanguage
AFile1 is File Description
AnItem1 is Item Description
conhecidos is Data Source
AFile1..Name = "conhecidos"
AFile1..Type = hFileNormal
AFile1..FicCryptMethod = hCryptStandard
AnItem1..Name = "codartigo"
AnItem1..Type = hItemText
AnItem1..Size = 30
HDescribeItem(AFile1, AnItem1)
AnItem1..Name = "descricao"
AnItem1..Type = hItemText
AnItem1..Size = 30
HDescribeItem(AFile1, AnItem1)
AnItem1..Name = "quantidade"
AnItem1..Type = hItemText
AnItem1..Size = 30
HDescribeItem(AFile1, AnItem1)
AnItem1..Name = "preco"
AnItem1..Type = hItemText
AnItem1..Size = 30
HDescribeItem(AFile1, AnItem1)
HDescribeFile(AFile1)
HCreation(conhecidos)
AFile is File Description
AnItem is Item Description
desconhecidos is Data Source
AFile..Name = "desconhecidos"
AFile..Type = hFileNormal
AFile..FicCryptMethod = hCryptStandard
AnItem..Name = "CodBarras"
AnItem..Type = hItemText
AnItem..Size = 30
HDescribeItem(AFile, AnItem)
AnItem..Name = "Quantidade"
AnItem..Type = hItemText
AnItem..Size = 30
HDescribeItem(AFile, AnItem)
HDescribeFile(AFile)
HCreation(desconhecidos)
FOR EACH ROW OF TABLE_Leitura
sQuery is string
sQuery="select * from artigos where codbarras='"+TABLE_Leitura.COL_cod_barras+"'"
Qry_select_cod_barras is data source
HExecuteSQLQuery(Qry_select_cod_barras,hQueryDefault,sQuery)
IF HReadFirst(Qry_select_cod_barras)=True THEN
conhecidos.codartigo=Qry_select_cod_barras.codigo
conhecidos.descricao=Qry_select_cod_barras.descricao
conhecidos.quantidade=TABLE_Leitura.COL_quantidade
conhecidos.preco=Qry_select_cod_barras.preco
HAdd(conhecidos)
ELSE
desconhecidos.codbarras=TABLE_Leitura.COL_cod_barras
desconhecidos.quantidade=TABLE_Leitura.COL_quantidade
HAdd(desconhecidos)
END
END
Close(WIN_Leitor_cod_barras,"")
```

### SRC-cf3590524a — WIN_Leitor_cod_barras [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:412-427`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); hreadseek(postos,Codigo,1); hreadseek(Terminais,Codigo,postos.terminal); dados1,dados2 is string; txt is int=fOpen(Terminais.pasta_localizacao+"\"+Terminais.nome_ficheiro); IF txt=-1 THEN; Info("A leitura do ficheiro falhou, verifique o caminho"); Close(MySelf,"fechou"); sLinha is string=freadline(txt); WHILE sLinha<>EOT AND sLinha<>""; dados1=NoSpace(Middle(sLinha,Terminais.codbarras_inicio,Terminais.codbarras_fim)); dados2=NoSpace(Middle(sLinha,terminais.quant_inicio,Terminais.quant_fim)); TableAddLine(TABLE_Leitura,dados1,dados2); sLinha=fReadLine(txt). Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras.md under SRC-cf3590524a.

HFSQL: HReadSeek(postos); HReadSeek(Terminais).

Other calls: Info("A leitura do ficheiro falhou, verifique o caminho"); Close(MySelf); fOpen(Terminais.pasta_localizacao+"\"+Terminais.nome_ficheiro).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
hreadseek(postos,Codigo,1)
hreadseek(Terminais,Codigo,postos.terminal)
dados1,dados2 is string
txt is int=fOpen(Terminais.pasta_localizacao+"\"+Terminais.nome_ficheiro)
IF txt=-1 THEN
Info("A leitura do ficheiro falhou, verifique o caminho")
Close(MySelf,"fechou")
END
sLinha is string=freadline(txt)
WHILE sLinha<>EOT AND sLinha<>""
dados1=NoSpace(Middle(sLinha,Terminais.codbarras_inicio,Terminais.codbarras_fim))
dados2=NoSpace(Middle(sLinha,terminais.quant_inicio,Terminais.quant_fim))
TableAddLine(TABLE_Leitura,dados1,dados2)
sLinha=fReadLine(txt)
END
```

### SRC-fe937f11cf — WIN_Leitor_cod_barras

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:430-430`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: mywindow..ReturnedValue="fechou". Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras.md under SRC-fe937f11cf.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
mywindow..ReturnedValue="fechou"
```

### SRC-aba0b3fc67 — WIN_Leitor_cod_barras/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-f7100eda47 — WIN_Leitor_cod_barras/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-b5c1104bc0 — WIN_Leitor_cod_barras/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-d4ea31773d — WIN_Leitor_cod_barras/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `Qry_select_cod_barras` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:378`.
- HExecuteSQLQuery: `Qry_select_cod_barras` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:377`.
- HReadSeek: `postos` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:413`; `Terminais` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:414`.
- HAdd: `conhecidos` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:383`; `desconhecidos` at `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:387`.

## Behavior checklist

- Open and native keyboard: U-WAFCFDF-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-WAFCFDF-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-WAFCFDF-03.
- Explicit message/resource shell outcomes: U-WAFCFDF-04.
- Actual field/mask/type boundaries: U-WAFCFDF-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WAFCFDF-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WAFCFDF-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Leitura; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WAFCFDF-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HAdd, HCreation, HDescribeFile, HDescribeItem, HExecuteSQLQuery, HReadFirst, hreadseek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-WAFCFDF-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-WAFCFDF-05** — Golden boundary outcomes for quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

4/4 blocks; 4/4 encoded-only slots retained; 26 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:11`; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:197`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:929`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:943`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Leitor_cod_barras.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Leitor_cod_barras.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Leitor_cod_barras.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Leitor_cod_barras.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Leitor_cod_barras_desconhecidos.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:533`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:536`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:539`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:542`
