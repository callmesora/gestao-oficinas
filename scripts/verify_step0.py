"""Validate the Step0 handoff, source coverage and local export without migrating an application."""
import base64
import csv
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import xml.etree.ElementTree as ET
from PIL import Image

from parity_check import check, lint_note

sys.path.insert(0, str(Path(__file__).parent / 'windows'))
from convert_hfsql_ansi import update_typed_hash


def main():
    root = Path(__file__).resolve().parents[1]
    if Path.cwd() != root:
        raise SystemExit('Run from the application repository root.')
    errors, summary = check('docs/parity/parity.csv', 'docs/parity/parity-seed.csv', check_files=True)
    unit_count = 0
    for path in sorted(Path('docs/parity').glob('*.csv')):
        if path.name in ('parity.csv', 'parity-seed.csv'):
            continue
        unit_count += 1
        mapping = Path('docs/mapping', path.stem + '.md')
        if not mapping.exists():
            errors.append(f'Missing unit map: {mapping}')
            continue
        errors += lint_note(mapping)
        with path.open(encoding='utf-8-sig', newline='') as handle:
            units = sorted({row['element'] for row in csv.DictReader(handle)})
        scoped, _ = check(path, 'docs/parity/parity-seed.csv', element=','.join(units), check_files=True)
        errors += scoped
        for kind in ('screens', 'reports'):
            spec = Path('docs', kind, path.stem + '.md')
            if spec.exists():
                errors += lint_note(spec)
    assert summary['statuses']['implemented'] == summary['statuses']['verified'] == summary['statuses']['excluded'] == 0
    manifest = json.loads(Path('legacy/data/manifest.json').read_text(encoding='utf-8'))
    expected = {table.get('Nom') for table in ET.parse('legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd').getroot().findall('FICHIER')}
    if expected != set(manifest['tables']):
        errors.append('Export table inventory differs from XDD')
    connection = sqlite3.connect(Path('legacy/data/data.sqlite').resolve().as_uri() + '?mode=ro', uri=True)
    try:
        for name, table in manifest['tables'].items():
            digest, typed, count = hashlib.sha256(), hashlib.sha256(), 0
            nulls, blobs = [0] * len(table['columns']), [0] * len(table['columns'])
            quote = '"' + name.replace('"', '""') + '"'
            for row in connection.execute('SELECT * FROM ' + quote):
                update_typed_hash(typed, row)
                values = ['' if v is None else 'base64:' + base64.b64encode(v).decode('ascii') if isinstance(v, bytes) else v for v in row]
                digest.update('\x1f'.join(values).encode('utf-8'))
                for index, value in enumerate(row):
                    nulls[index] += value is None
                    blobs[index] += isinstance(value, bytes)
                count += 1
            if count != table['rows'] or count != table['count'] or digest.hexdigest() != table['sha256_rows'] or typed.hexdigest() != table['sha256_typed_rows']:
                errors.append(f'{name}: SQLite count/hash mismatch')
            if nulls != [c['nulls'] for c in table['columns']] or blobs != [c['binary'] for c in table['columns']]:
                errors.append(f'{name}: NULL/BLOB count mismatch')
            with Path('legacy/data', name + '.csv').open(encoding='utf-8', newline='') as handle:
                if sum(1 for _ in csv.reader(handle)) - 1 != count:
                    errors.append(f'{name}: parsed CSV row count mismatch')
    finally:
        connection.close()
    inventory = json.loads(Path('docs/source-manifest.json').read_text(encoding='utf-8'))
    for item in inventory['files']:
        source = Path('legacy', item['path'])
        if hashlib.sha256(source.read_bytes()).hexdigest() != item['sha256']:
            errors.append('Source fingerprint changed: ' + item['path'])
    draft = sqlite3.connect(':memory:')
    try:
        draft.executescript(Path('docs/schema/schema-draft.sql').read_text(encoding='utf-8'))
        if len(draft.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()) != len(expected):
            errors.append('Draft DDL table count mismatch')
    finally:
        draft.close()
    raster_count, layout_count = 0, 0
    for artifact in Path('docs/evidence/images').iterdir():
        if artifact.suffix.lower() in ('.jpg', '.jpeg', '.png'):
            with Image.open(artifact) as image:
                image.verify()
            raster_count += 1
        elif artifact.suffix.lower() == '.svg':
            ET.parse(artifact)
            layout_count += 1
    result = {'passed': not errors, 'units_checked': unit_count, 'parity': summary,
              'export_tables': len(expected), 'export_rows': sum(t['rows'] for t in manifest['tables'].values()),
              'fingerprinted_source_files': len(inventory['files']),
              'mapping_notes': len(list(Path('docs/mapping').glob('*.md'))),
              'screen_specs': len(list(Path('docs/screens').glob('*.md'))),
              'report_specs': len(list(Path('docs/reports').glob('*.md'))),
              'valid_dossier_images': raster_count, 'valid_source_layouts': layout_count,
              'draft_sql_loads_in_memory': True, 'errors': errors}
    Path('docs/runbooks/step0-validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
    raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
