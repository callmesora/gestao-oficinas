# Event codes (derived from the compile folder)

Evidence from 79 elements (windows and reports): compiled event labels paired with raw codes of the text sources where unambiguous. Codes without evidence stay `inferred` until confirmed.

| Code | Event | Evidence | Conflicts |
|---|---|---|---|
| 18 | Click | 293 | — |
| none | Global declarations | 51 | — |
| 327680 | Open | 28 | — |
| 458752 | Local procedure | 19 | — |
| 327693 | After printing | 18 | — |
| 34 | End of initialization | 15 | — |
| 327692 | Before printing | 15 | — |
| 14 | Initialization | 12 | — |
| 17 | Whenever modifying | 11 | — |
| 66049 | Left button down | 7 | — |
| 2 | Close | 7 | — |
| 21 | Display a row | 6 | — |
| 16 | Exit | 4 | — |
| 33 | Select a row | 3 | — |
| 66050 | Left button up | 2 | — |
| 65794 | Key pressed | 2 | — |
| 19 | Enter input mode in a row | 2 | — |
| 15 | Entry | 1 | — |
| 13 | Resize | 1 | — |
| 116 | Open the drop-down list | 1 | — |
| 20 | Exit from a row | 1 | — |

## Embedded report queries (items selected, from the compiled reports)

Item names and captions only: selection conditions and sort are not in the compiled file.

- **RPT_List_artigos**: `Codigo` (Código), `Descricao` (Descrição), `codbarras` (Código de barras), `unidade` (unidade), `preco` (Preço), `inativo` (inativo)
- **RPT_List_Clientes**: `Codigo` (Código), `Descricao` (Descrição), `Morada1` (Morada 1), `Morada2` (Morada2), `codpostal` (Código Postal), `Telefone1` (Telefone 1), `Telemovel` (Telemóvel), `observacao` (Observação)
- **RPT_List_documentos**: `Codigo` (Codigo), `Descricao` (Descrição), `stock` (stock), `obriga_macanico` (obriga_macanico)
- **RPT_List_estados_descritivos**: `Codigo` (Código), `Descricao` (Descrição)
- **RPT_List_estados_reparacao**: `Codigo` (Código), `Descricao` (Descrição), `tipo` (tipo)
- **RPT_List_mecanicos**: `Codigo` (Código), `Descricao` (Descrição), `palavra_passe` (palavra-passe)
- **RPT_List_unidades**: `Codigo` (Código), `Descricao` (Descrição)
- **RPT_List_utilizadores**: `Codigo` (Código), `Descricao` (Nome), `palavra_passe` (palavra-passe)
- **RPT_List_Viaturas**: `matricula` (Matricula), `Cliente` (Cliente), `marca` (Marca), `modelo` (Modelo), `Ano` (Ano), `mes` (mes)
