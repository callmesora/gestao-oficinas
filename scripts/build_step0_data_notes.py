"""Write source-backed query/table inventories; no application or database migration code."""
import csv
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
COLS = 'id kind element context event evidence confidence legacy_behavior target_behavior implemented_in test decision status'.split()

QUERY_BEHAVIOR = {
    'QRY_insert_material_reparacao': 'Inserts nine material fields into material_reparacao, including order number, mechanic, article, quantity, timestamp, state, price and lancado flag. It does not adjust stock in this SQL; callers own those mutations.',
    'QRY_insert_ordens_reparacao': 'Inserts 26 repair-order fields, including customer/third party, service and contact memos, totals, invoice and payment date. It does not create material/time rows or allocate the next order number.',
    'QRY_update_ordens_reparacao': 'Updates 26 repair-order fields selected by the old order number ParamNumero_antigo. The new numero can differ. The SQL does not cascade that rename into material/time rows.',
    'QRY_select_cliente_codigo': 'Exact customer business-code lookup. Returns contact and address fields, not an automatic-ID lookup.',
    'QRY_select_mecanicos_codigo': 'Exact mechanic Codigo lookup, including inactive and password fields. Never expose actual password values in documentation or UI previews.',
    'QRY_select_viatura_matricula': 'Exact registration lookup returning vehicle ownership and descriptive fields. No customer join here.',
    'QRY_select_viaturas': 'Inner joins vehicles to customer business codes and orders registration ascending. Vehicles without matching customer are absent from this result.',
    'QRY_select_cab_stocks': 'Inner joins stock headers with document codes and returns document stock direction and mechanic requirement. No explicit ORDER BY in dossier SQL.',
    'QRY_select_lin_stocks': 'Filters document number AND document code, returns stock lines and orders by document number only. Does not establish line-number ordering within a document.',
    'QRY_select_cab_lin_stocks': 'Joins header and lines on BOTH document number and code, adds document stock direction, restricts timestamp and article inclusive ranges, sorts article then date ascending.',
    'QRY_select_consumo_material_viatura': 'Inner joins materials, articles, orders, mechanics and vehicles. Filters material timestamp, article and registration inclusive ranges, sorts registration then order reception time. Missing join partners suppress rows.',
    'QRY_select_material_ordem_Reparacao': 'Joins material rows to orders, uses order reception time rather than material timestamp for date filtering, emits constant stock=2, sorts article then reception date.',
    'QRY_select_material_reparacao': 'Filters material rows by order number and sorts material timestamp ascending. Includes per-line mechanic, state, price and lancado.',
    'QRY_select_ordens_reparacao': 'General order list with vehicle/state/customer joins, optional mechanic via RIGHT OUTER join and third-party customer via LEFT OUTER join. Mandatory joins may hide orphaned orders. Orders numero descending.',
    'QRY_select_ordens_reparacao_data_entrega': 'Filters expected delivery date inclusively and state IN list, joins vehicle owner customer, sorts expected delivery date descending.',
    'QRY_select_ordens_reparacao_data_pag': 'Filters payment date inclusively and state IN list, joins vehicle owner customer. Dossier SQL has no explicit ORDER BY.',
    'QRY_select_ordens_reparacao_matricula': 'Despite its name, SQL has no registration parameter. It filters state type IN ParamTipo and lancar_material=ParamLancarMat, joins vehicles and optional mechanics, orders numero ascending.',
    'QRY_select_ordens_reparacao_numero': 'Single-order lookup by numero returning the base order fields without vehicle/customer joins. Caller supplies ParamOrdem.',
    'QRY_select_ordens_reparacao_tempos': 'Selects order state types 3,2,6,4,5 through OR predicates, with vehicle/state joins and optional mechanic. Orders numero ascending.',
    'QRY_select_tempos_Reparacao_numero_mecanico': 'Filters labor by order AND mechanic, sorts automatic time-row ID ascending. No explicit open/closed time predicate.',
    'QRY_select_tempos_reparacao_ordem': 'Finds open labor rows for an order using exact all-zero 17-character fim sentinel and a mechanic join. SQL does not compare NULL or empty string.',
    'QRY_tempos_ordem_reparacao': 'Joins orders, vehicles, labor and mechanics. Filters order number and labor-start timestamp inclusive ranges, sorts order number ascending.',
    'QRY_tempos_ordem_reparacao_matricula': 'Same labor joins, filters vehicle registration and labor-start timestamp inclusive ranges; sorts registration then order number.',
    'QRY_tempos_ordem_reparacao_mecanico': 'Same labor joins, filters mechanic code and labor-start timestamp inclusive ranges; sorts mechanic then order reception timestamp.',
    'QRY_union_extrato_artigos': 'UNION ALL preserves duplicate movement rows: document movements joined on BOTH code and number, plus order material movements with constant stock=2 and order reception date. Sorts article then date.',
    'QRY_union_extrato_artigos_calcular_total': 'Dossier SQL is the same UNION ALL movement shape, not an SQL SUM aggregate. Opening-balance arithmetic is performed by the caller, and inclusive cutoff can affect boundary rows.',
    'QRY_union_lin_stocks': 'Selects stock document exits (documentos.stock=2), article and header timestamp ranges plus description LIKE. Header-to-line join uses document number without document code, unlike the ledger query, so same-number documents can duplicate/mix results.',
    'QRY_union_material_reparacao': 'Selects order material exits joined to articles/order and the order assigned mechanic (reparacao_mecanico), not the material row mechanic. Filters article and material timestamp; no description parameter.',
    'QRY_Union_lin_stocks_material_reparacao': 'UNION ALL of document exits and repair material exits. Description LIKE applies only to document branch. Header join lacks document code; repair branch uses order assigned mechanic. Sorts article then date.',
}

TABLE_ROLES = {
    'Clientes': 'Customer master and contacts. Business links use Codigo; ClientesID is a distinct automatic identifier.',
    'Viaturas': 'Vehicle master keyed for workflows by matricula; Cliente references customer Codigo.',
    'mecanicos': 'Mechanic code/name, inactive flag and legacy password field. Used for labor/material authorizations and reporting.',
    'artigos': 'Article master with code, description, barcode, unit, price, inactive flag and stock quantity. Stock is maintained by workflow code.',
    'ordem_reparacao': 'Repair order header, reception/service memos, workflow states, customer/third party, money totals, invoice and payment information. Workflows link by numero.',
    'tempos_reparacao': 'Labor time rows linked by repair numero and mechanic Codigo; empty/open finish sentinel and duration rounding matter.',
    'material_reparacao': 'Material consumption per repair numero, article business code, quantity, price, mechanic and timestamp. Save/delete code also changes article stock.',
    'utilizadores': 'Legacy application users and password field; no new permission model is chosen during Step 0.',
    'unidades': 'Unit-code lookup used by article master.',
    'documentos': 'Document-code master; stock direction and obriga_macanico control stock-entry workflows.',
    'cab_stocks': 'Stock document header. Its business identity includes document code and number; generated ID/link fields are not interchangeable with those keys.',
    'lin_stocks': 'Stock document lines. Composite business identity involves document code, document number and line number; the driver also exposes a generated composite/link column.',
    'estados_reparacao': 'Repair state master with type, colors and flags controlling material launch and delivery/payment prompts.',
    'estados_descritivos': 'Descriptive repair state lookup.',
    'Terminais': 'Barcode terminal configuration, including barcode start/finish positions and input filenames/directories.',
    'sistema': 'Application system thresholds/time configuration and start date, distinct from per-user runtime state.',
    'postos': 'Workstation/terminal association lookup; source form new-record check references Terminais instead of postos.',
}


def dump_csv(path, rows):
    with path.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=COLS)
        writer.writeheader()
        writer.writerows(rows)


def row(seed, **updates):
    result = {key: seed.get(key, '') for key in COLS}
    result.update(implemented_in='', test='', decision='')
    result.update(updates)
    return result


def report_consumers(dossier, query):
    """Designer bindings are evidence of use even without a literal query code hit."""
    result = []
    for path in sorted((dossier / 'report').glob('*.json')):
        parsed = json.loads(path.read_text(encoding='utf-8'))
        if parsed.get('data_source') == 'Query' and any(
            line.strip().lower() == ('Source name ' + query).lower()
            for line in parsed.get('lines', []) if isinstance(line, str)
        ):
            result.append(path.stem)
    return result


def profile_finding(table, column, finding, code):
    """Keep observed aggregates; attach interpretation questions to existing U items."""
    if 'check the code before mapping it' in finding:
        if table == 'mecanicos' and column == 'palavra_passe':
            finding = ('one value in every row; this does not mean unused. Password comparisons are present in '
                       'legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:298,770,914; '
                       'the form field is documented in docs/screens/WIN_Form_mecanicos.md. '
                       'Meaning/treatment of the uniform snapshot remains open')
        elif table == 'estados_reparacao' and column in ('pedir_data_entrega', 'pedir_data_pag'):
            finding = ('one value in every row; the flag is read by '
                       'legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1033-1039. '
                       'Uniform snapshot values do not establish that the flag is unused')
        elif table == 'lin_stocks':
            finding = ('one driver representation in every row; generated/link semantics remain '
                       f'U-{code}-03. This is not evidence of an unused business component')
        else:
            finding = ('one value in every row; uniformity alone does not establish unused/default semantics. '
                       'Confirm historical/default meaning and any additional consumers before changing representation')
    if '?' in finding or 'one value in every row' in finding or 'one driver representation' in finding:
        finding += f' [U-{code}-02]'
    return finding


def main():
    latest = json.loads(Path('analysis-local/latest.json').read_text())
    inventory = json.loads((Path(latest['inspect']) / 'inventory.json').read_text())
    sources = [json.loads(p.read_text(encoding='utf-8')) for p in (Path(latest['inspect']) / 'code').rglob('*.json')]
    seeds = list(csv.DictReader(Path('docs/parity/parity-seed.csv').open(encoding='utf-8')))
    dossier = Path(latest['dossier'])
    summaries = []
    for item in inventory['files']:
        if item['kind'] != 'query' or item['status'] == 'duplicate':
            continue
        name = Path(item['path']).stem
        code = 'Q' + str(len(summaries) + 1).zfill(2)
        found = next((p for p in (dossier / 'query').glob('*.json') if p.stem.lower() == name.lower()), None)
        parsed = json.loads(found.read_text()) if found else {}
        sql = parsed.get('sql', '')
        params = list(dict.fromkeys(re.findall(r'\{(\w+)\}', sql)))
        consumers = report_consumers(dossier, name)
        callers = []
        for source in sources:
            for block in source['blocks']:
                for offset, line in enumerate(block['code'].splitlines()):
                    if re.search(r'(?<!\w)' + re.escape(name) + r'(?!\w)', line, re.I):
                        callers.append((source['name'], source['path'], block['start_line'] + offset, line.strip()))
        description = QUERY_BEHAVIOR.get(name, f'U-{code}-01: Binary query has no dossier SQL; behavior cannot be established. No exclusion is assumed.')
        ev = 'legacy/' + item['path']
        unitseeds = [s for s in seeds if s['element'].lower() == name.lower()]
        assert len(unitseeds) == 1, (name, len(unitseeds))
        mainrow = row(unitseeds[0], evidence=ev + (f'; dossier: {name}/sql' if sql else ''), confidence='verified' if sql else 'unresolved',
                      legacy_behavior=description, target_behavior='Preserve legacy SQL semantics' if sql else '', status='specified' if sql else 'unmapped')
        rows = [mainrow]
        text = [f'# Query mapping — {name}', '', f'Evidence: `{ev}`' + (f'; `dossier: {name}/sql`.' if sql else '.'), '',
                '## Purpose and rules', '', description, '', '## SQL from the dossier', '', '```sql', sql or '-- U-'+code+'-01: no SQL in dossier', '```', '',
                'This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.', '',
                '## Parameters and callers', '', f'Placeholders read directly from SQL: {", ".join(params) or "none extracted"}.',
                f'Dossier parameter-table parser returned {len(parsed.get("parameters", []))}; SQL placeholders above take precedence for inventory completeness.', '',
                '| Caller | Source | Matching line |', '|---|---|---|']
        for caller, path, line, statement in callers:
            text.append(f'| {caller} | legacy/{path}:{line} | `{statement.replace("|", "&#124;")}` |')
        if not callers and not consumers:
            text.append(f'| U-{code}-02 | No literal code caller found | Dynamic/designer usage requires review; do not silently exclude. |')
        elif not callers:
            text.append('| Designer-bound paths below | No literal query-name code caller found | Report binding and report initialization establish the listed paths. |')
        if consumers:
            text += ['', '### Designer-bound report consumers', '',
                     'These named source bindings establish report reachability independently of literal query-name matches. '
                     'Arguments below are in caller order, not the parameter parser order.', '',
                     '| Report | Source binding and contract |', '|---|---|']
            for report in consumers:
                text.append(f'| {report} | dossier: {report}/lines; docs/reports/{report}.md; docs/mapping/{report}.md |')
            text += ['', '| Printing caller | Source | Exact initialization/print statement |', '|---|---|---|']
            for source in sources:
                for block in source['blocks']:
                    for offset, statement in enumerate(block['code'].splitlines()):
                        if re.search(r'i(?:InitReportQuery|PrintReport)\s*\(', statement, re.I) and any(
                            re.search(r'(?<!\w)' + re.escape(report) + r'(?!\w)', statement, re.I) for report in consumers
                        ):
                            text.append(f'| {source["name"]} | legacy/{source["path"]}:{block["start_line"] + offset} | `{statement.strip()}` |')
            if any(report.startswith('RPT_Consumo_Material_') and 'Viatura' not in report for report in consumers):
                text += ['', 'The article-report caller sets da_data from EDT_Da_data to hour/minute/second 00/00/00 and a_data '
                         'from EDT_a_data to 23/59/59 (legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-355); '
                         'no explicit subsecond reset appears. tipo_report selects resumo/descriminado, CBOX_doc[1]/[2] '
                         'select order-only, both, or exit-only branches, and each selected branch calls iPreview before initialization/printing '
                         '(legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:356-393). Summary uses EDT_Do_artigo/EDT_Ao_artigo '
                         'and four arguments; detailed uses EDT_Do_artigo2/EDT_Ao_artigo2 plus fifth EDT_Descrição. '
                         'The summary exit/combined calls omit the description argument; omitted is not empty text.']
            if name == 'QRY_union_material_reparacao':
                text += ['', 'U-R01-07 in docs/mapping/RPT_Consumo_Material_Descriminado_Ordens.md records the detailed initializer '
                         'passing five arguments while this SQL has four placeholders and no description predicate. Preserve both pieces of evidence; '
                         'do not invent a fifth SQL parameter or assume how WINDEV handles the extra argument.']
            if name in ('QRY_select_ordens_reparacao_data_entrega', 'QRY_select_ordens_reparacao_data_pag'):
                text += ['', 'WIN_Mapa_Vendas builds lista_estados by appending each checked TABLE_Estados.COL_codigo plus a semicolon '
                         '(legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-434), selects preview, then prints the delivery report '
                         'when tipo="vendas", otherwise the payment report (lines 435-442). Preserve the distinct EDT_À_data versus EDT_A_data '
                         'argument spellings and the positional date/date/list contract.']
        text += ['', '## Data and behavior checklist', '',
                 '- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.',
                 '- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.',
                 '- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.', '',
                 '## Unresolved and proposed changes', '',
                 f'- U-{code}-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.',
                 f'- U-{code}-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.']
        if not sql:
            text.append(f'- U-{code}-01: Export this query from WINDEV or identify its SQL/callers. Interim: no invented query; blocks this query implementation only.')
        if consumers:
            text.append(f'- U-{code}-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.')
        elif not callers:
            text.append(f'- U-{code}-02: Establish reachability from project/designer before excluding; interim: retain parity row.')
        for number, detail in [(3, 'Query runtime omission/null/collation and PDF literal validation'), (4, 'Caller error/empty-result contract')]:
            rows.append(row({}, id=f'RULE-{code}-{number:03}', kind='rule', element=name, context=name,
                            evidence=ev, confidence='unresolved', legacy_behavior=f'U-{code}-{number:02}: {detail}', status='unmapped'))
        Path(f'docs/mapping/{name}.md').write_text('\n'.join(text)+'\n', encoding='utf-8')
        dump_csv(Path(f'docs/parity/{name}.csv'), rows)
        summaries.append((name,len(params),len(callers),bool(sql)))
    schema = json.loads(Path('docs/schema/schema-draft.json').read_text())
    profile = json.loads(Path('docs/data/profile.json').read_text())
    manifest = json.loads(Path('legacy/data/manifest.json').read_text())
    for index, table in enumerate(schema['tables'],1):
        name=table['table']; code='T'+str(index).zfill(2)
        seed=next(s for s in seeds if s['kind']=='table' and s['element']==name)
        stats=profile['tables'].get(name,{}); actual=manifest['tables'].get(name,{})
        text=[f'# Table mapping — {name}', '', TABLE_ROLES[name], '',
              f'Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#{name}`.', '',
              f'Export rows read and source count: {actual.get("rows")} / {actual.get("count")}. No source or imported data was repaired.', '',
              '## Columns', '', '| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |', '|---|---|---|---|---|---|---|']
        for column in table['columns']:
            displayed = dict(column)
            if not displayed.get('type') and displayed.get('code') is not None:
                displayed['type'] = f'code {displayed["code"]} (generated/link representation; semantics unresolved under U-{code}-03)'
            if displayed.get('decision'):
                displayed['decision'] = f'Proposal for later framing, U-{code}-02: ' + displayed['decision']
            text.append('| '+ ' | '.join(str(displayed.get(k,'')) for k in ('name','type','size','key','nullable','default','decision'))+' |')
        text += ['', '## Keys', ''] + [f'- {k["name"]}: {k["key"]}; columns {", ".join(k["columns"])}.' for k in table['keys']]
        text += ['', '## Data findings', '']
        for column, stat in stats.get('columns',{}).items():
            for finding in stat.get('findings',[]):
                text.append(f'- {column}: {profile_finding(name, column, finding, code)}')
        for finding in profile['keys']:
            if finding.get('table') == name:
                text.append('- Key profile: '+json.dumps(finding,ensure_ascii=False))
        for finding in profile['links']:
            if finding.get('table') == name or str(finding.get('from','')).startswith(name+'.'):
                text.append('- Link profile (candidate/explicit-ref comparison, not a declared constraint): '+json.dumps(finding,ensure_ascii=False))
        text += ['', 'Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column '
                 'unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. '
                 'Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result '
                 f'does not prove target identity or enforced integrity (U-{code}-01).']
        if name == 'cab_stocks':
            text += ['', 'Business relationships: dossier: QRY_union_lin_stocks/sql joins cab_stocks.mecanico to mecanicos.Codigo, '
                     'not mecanicosID; cab_stocks.documento_codigo joins documentos.Codigo (also dossier: QRY_select_cab_stocks/sql). '
                     'The profiled mecanico, DocumentosID and MecanicosID fields are all zero in this snapshot. The generated ID fields '
                     'are not the join fields in those SQL bodies; this does not prove they are globally unused. The mechanic inner join '
                     'can suppress zero/unmatched codes even though the heuristic mecanicosID comparison reports zero orphans. '
                     'The code/number pair is the ledger header-to-line relationship in dossier: QRY_select_cab_lin_stocks/sql; '
                     'the consumption query joins number alone, with the mixing/duplicate caveat in docs/mapping/QRY_union_lin_stocks.md. U-T11-01 retains enforcement/collation uncertainty.']
        if name == 'ordem_reparacao':
            text += ['', 'Business relationships: dossier: QRY_select_ordens_reparacao/sql joins reparacao_estado to estados_reparacao.Codigo '
                     'and matricula to Viaturas.matricula, both mandatory; recepcao_cliente joins Clientes.Codigo, '
                     'reparacao_mecanico optionally joins mecanicos.Codigo, and recepcao_terceiro optionally joins the customer alias Codigo. '
                     'Estados_reparacaoID is all zero in the profile and is not the state join field in this SQL. The profile reports 52 order '
                     'rows / 36 registration values without a matching vehicle; the mandatory vehicle join suppresses those rows in that query. '
                     'These joins establish business usage, not referential enforcement (U-T05-01).']
        if name == 'lin_stocks':
            text += ['', 'The 8 profiled article-orphan rows (2 article values) can be suppressed by the mandatory article join '
                     'in dossier: QRY_union_lin_stocks/sql. U-T12-01 retains enforcement uncertainty. '
                     'The code-28 column is separate from the unique three-component key documento_codigo/documento_numero/linha; '
                     'docs/data/export-verification.json records 23615 binary driver values overall; the attribution to this column '
                     'is recorded in docs/runbooks/reviews/data-query-project-review.md (RQ-03). Their storage meaning '
                     'remains U-T12-03; do not decode the FIC or substitute generated bytes for component identity.']
        if name == 'material_reparacao':
            text += ['', 'The 54 profiled article-orphan rows can be suppressed by the mandatory article join in '
                     'dossier: QRY_union_material_reparacao/sql. U-T07-01 retains enforcement uncertainty.']
        text += ['', '## Source usage and implicit contract', '']
        for source in sources:
            hits=[b for b in source['blocks'] if re.search(r'(?<!\w)'+re.escape(name)+r'(?!\w)',b['code'],re.I)]
            if hits:
                text.append(f'- {source["name"]}: '+ '; '.join(f'legacy/{source["path"]}:{b["start_line"]}-{b["end_line"]}' for b in hits))
        text += ['', '## Unresolved and framing inputs', '',
                 f'- U-{code}-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.',
                 f'- U-{code}-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.',
                 f'- U-{code}-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.']
        Path(f'docs/mapping/{name}.md').write_text('\n'.join(text)+'\n',encoding='utf-8')
        rows=[row(seed,evidence='legacy/'+seed['evidence']+'; docs/schema/schema-draft.md; export: docs/data/profile.md#'+name,
                  confidence='verified',legacy_behavior=TABLE_ROLES[name]+f' Export counts {actual.get("rows")}/{actual.get("count")}.',target_behavior='Preserve table values and evidenced business keys; import decisions deferred',status='specified')]
        for n in range(1,4):
            rows.append(row({},id=f'RULE-{code}-{n:03}',kind='rule',element=name,context=name,evidence='docs/schema/schema-draft.md; export: docs/data/profile.md#'+name,
                            confidence='unresolved',legacy_behavior=f'U-{code}-{n:02}: '+['Runtime integrity/collation enforcement','Import representation and existing anomalies','Driver-generated key fidelity'][n-1],status='unmapped'))
        dump_csv(Path(f'docs/parity/{name}.csv'),rows)
    print(f'Wrote {len(summaries)} query maps and {len(schema["tables"])} table maps.')


if __name__ == '__main__':
    main()
