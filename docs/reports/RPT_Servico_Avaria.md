# Report spec — RPT_Servico_Avaria

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde`, `dossier: RPT_Servico_Avaria`, `docs/mapping/RPT_Servico_Avaria.md`, image `docs/evidence/images/RPT_Servico_Avaria.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:889`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:360`

Destination: WIN_Table_Tempos_materiais_Descricoes explicitly selects preview; WIN_Tempos_Reparacao_Informacao calls iPrintReport without setting a destination. U-R23-02 covers its inherited/default destination.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| A5 paper (148 x 210 mm) | U-R23-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 108.000 | 108.000 / 107.950 / 107.950 | Visible geometry fits nominal printable width; orientation/scale/clipping behavior remains U-R23-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

Nominal portrait printable width is 108.000 mm; widest band / visible control / all-designer right edge are 108.000 / 107.950 / 107.950 mm. The source includes 107.950 mm controls at x=0 (legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:157-162,171-176), within the 108.000 mm band. This nominal design comparison does not settle actual orientation, scaling or clipping, which remain U-R23-01.

## Data source

Type: **No data source**. Named source absent; U-R23-03 applies to embedded SQL.

No automatic row source. Open loads order, vehicle and reception customer using `QRY_select_ordens_reparacao_numero(ordinal)`, `QRY_select_viatura_matricula(order.matricula)`, `QRY_select_cliente_codigo(order.recepcao_cliente)`. The exact copied assignments below define all printed data; missing reads skip assignment.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,108.000,20.000 | STC_Empresa, DOCTITLE, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,108.000,1.000 |  |
| BODY | per source record (visibility U-R23-03) | 0.000,21.000,108.000,84.137 | STC_Contactos_do_cliente, STC_Cliente, STC_Observação, STC_Serviço_Avaria, ITEM_Servico_Avaria, ITEM_Observacao, ITEM_Cliente, ITEM_Contactos, STC_Matricula, ITEM_matricula, STC_Marca_Modelo, ITEM_marca_modelo |
| PAGE_FOOTER | each page | 0.000,105.137,108.000,1.000 |  |
| END_OF_DOCUMENT | once at document end | 0.000,106.137,108.000,10.000 | PoweredWx1 |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R23-03 / U-R23-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,79.748,6.615 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 25.768,6.615,56.465,9.789 | U-R23-01 | U-R23-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 79.748,0.000,28.202,6.615 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Contactos_do_cliente | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,67.204,47.469,7.144 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Cliente | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,56.356,17.306,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Observação | BODY | None | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,38.671,26.458,7.154 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Serviço_Avaria | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,20.902,38.737,7.144 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Servico_Avaria | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,28.098,107.950,6.625 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| ITEM_Observacao | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,45.825,107.950,6.625 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| ITEM_Cliente | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 17.306,56.356,90.644,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| ITEM_Contactos | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,74.390,94.300,6.614 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Matricula | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,0.000,22.333,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_matricula | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 22.333,0.000,85.617,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Marca_Modelo | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 0.000,10.319,31.329,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_marca_modelo | BODY | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 31.329,10.319,76.621,6.879 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx1 | END_OF_DOCUMENT | Caption | U-R23-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R23-01 | 66.940,3.508,41.010,6.282 | U-R23-01 | U-R23-01 | no border row text; U-R23-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Servico_Avaria.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R23-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R23-02: automatic scope; manual source below | U-R23-01 | RULE-R23-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:337-356`, event `327680` on `report/local procedure`. Load the requested repair order, vehicle and reception customer using named queries; set service, observation, contact and customer captions only on successful first-record reads; release declarations.

```wlanguage
procedure MyReport(gNumero_ordem_rep)
STC_Empresa=gsNome_empresa_reports
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gNumero_ordem_rep)
IF HReadFirst(QRY_select_ordens_reparacao_numero)=True THEN
	item_matricula=QRY_select_ordens_reparacao_numero.matricula
	HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)
	IF HReadFirst(QRY_select_viatura_matricula)=True THEN
		ITEM_Marca_Modelo=QRY_select_viatura_matricula.marca+"  "+QRY_select_viatura_matricula.modelo
	END
	HCancelDeclaration(QRY_select_viatura_matricula)
	item_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico
	item_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs
	item_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos
	HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_cliente)
	IF HReadFirst(QRY_select_cliente_codigo)=True THEN
		item_cliente=QRY_select_cliente_codigo.Descricao
	END
	HCancelDeclaration(QRY_select_cliente_codigo)
END
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
```

## Data edge cases

Implemented auto-height follow-through (ADR-005): `ITEM_Servico_Avaria`, `ITEM_Observacao`, `ITEM_Cliente` and `ITEM_Contactos` use CSS intrinsic height with their listed source minimum heights. Source-overlapping controls share a section; later sections retain their original gaps and move below growing text. This source-order flow is an explicit target adaptation pending native output, not a resolved wrapping/anchoring golden. Fixed controls retain their dimensions and clipping. The existing Paged.js engine keeps the body indivisible; content exceeding the actual A5 printable page returns typed unresolved rather than a clipped PDF. Source `NULL`/empty data remains unchanged. `apps/server/src/reports/long-text.test.ts` exercises actual PostgreSQL, offline PDF text/positions, short/empty values and oversized refusal. U-R23-01/02/03 remain open.

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R23-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R23-02 / U-R23-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R23-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R23-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R23-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R23-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R23-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R23-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
