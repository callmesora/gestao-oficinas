#!/usr/bin/env python3
"""Reproduce the report geometry projection; never execute or rewrite legacy evidence.

python scripts/report-layouts.py --check
Defaults use analysis-local/latest.json; explicit --legacy/--dossier support isolated worktrees.
Coordinates come from text sources, flags/bindings from the dossier, literal captions from
the committed report specs (including their image-observed/inferred associations).
Queries, event formulas and unresolved captions are deliberately not synthesized.
"""
import argparse
import json
from pathlib import Path
import re

from inspect_windev import control_layout

ROOT = Path(__file__).resolve().parents[1]


def build(legacy, dossier):
    output = {}
    for spec_path in sorted((ROOT / 'docs/reports').glob('RPT_*.md')):
        name = spec_path.stem
        spec = spec_path.read_text(encoding='utf-8')
        details = json.loads((dossier / 'report' / f'{name}.json').read_text(encoding='utf-8'))
        evidence = re.search(r'`legacy/([^`]+\.wde)`', spec)
        if not evidence:
            raise ValueError(f'Report source citation required: {name}')
        raw = (legacy / evidence[1]).read_bytes()
        text = raw.decode('utf-16' if raw.startswith((b'\xff\xfe', b'\xfe\xff')) else 'utf-8-sig')
        geometry = control_layout(text)
        literals = {}
        for line in spec.splitlines():
            cells = [cell.strip() for cell in line.split('|')[1:-1]] if line.startswith('|') else []
            if len(cells) == 10 and cells[3].startswith('"') and cells[3].endswith('"'):
                literals[cells[0]] = json.loads(cells[3])
        bands = []
        for item in geometry:
            if item['kind'] == 'band':
                bands.append({'name': item['name'], 'width': item['width'], 'height': item['height'], 'controls': []})
                continue
            if item.get('band') is None:
                continue
            source = details['controls'].get(item['name'], {})
            flags = source.get('flags', {})
            control = {'name': item['name'], 'kind': str(source.get('kind', 'Caption')),
                       **{key: item[key] for key in ('x', 'y', 'width', 'height')},
                       'visible': flags.get('Visible', True), 'auto': flags.get('Auto.Resiz', False),
                       'divisible': flags.get('Divisible', False)}
            for key in ('item', 'preset'):
                if source.get(key):
                    control[key] = source[key]
            # Only counters are interpreted by fixed-layout.ts; sums/formulas stay explicit in families.ts.
            calculation = source.get('calculation', '')
            if calculation.startswith(('Counter', 'Programmatically')):
                control['calculation'] = calculation
            if item['name'] in literals:
                control['literal'] = literals[item['name']]
            border = re.search(r'(?:^|\s)([TBLR-]{4})(?:\s|$)', source.get('row', ''))
            if border:
                control['border'] = border[1]
            next(band for band in bands if band['name'] == item['band'])['controls'].append(control)
        named = re.search(r'Named source: `([^`]+)`', spec)
        page = details['page_format']
        paper = 'A4' if page.startswith('A4') else 'A5' if page.startswith('A5') else 'Letter' if page.startswith('US Letter') else None
        if paper is None:
            raise ValueError(f'Unrecognized source paper: {name}')
        output[name] = {'sourceSpec': spec_path.relative_to(ROOT).as_posix(), 'paper': paper,
                        'sourceKind': details['data_source'], 'sourceName': named[1] if named else '',
                        # Shared fidelity/engine/data categories; complete per-report gaps remain in the spec.
                        'unresolved': re.findall(r'^- (U-R\d{2}-0[123]):', spec, re.M), 'bands': bands}
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--legacy', type=Path)
    parser.add_argument('--dossier', type=Path)
    parser.add_argument('--out', type=Path, default=ROOT / 'apps/server/src/reports/layouts.json')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    latest_path = ROOT / 'analysis-local/latest.json'
    latest = json.loads(latest_path.read_text(encoding='utf-8')) if latest_path.exists() else {}
    legacy = args.legacy or ROOT / latest.get('legacy', 'legacy')
    dossier = args.dossier or ROOT / latest.get('dossier', 'analysis-local/dossier')
    generated = build(legacy.resolve(), dossier.resolve())
    if args.check:
        current = json.loads(args.out.read_text(encoding='utf-8'))
        if generated != current:
            changed = [name for name in sorted(set(generated) | set(current)) if generated.get(name) != current.get(name)]
            raise SystemExit('Report layout projection differs: ' + ', '.join(changed))
    else:
        args.out.write_text(json.dumps(generated, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(generated)} reports, {sum(len(band["controls"]) for report in generated.values() for band in report["bands"])} controls; projection ' + ('matches' if args.check else 'written'))


if __name__ == '__main__':
    main()
