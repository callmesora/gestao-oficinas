#!/usr/bin/env python3
"""Project an existing SQLite snapshot into the development import contract.

This is NOT an HFSQL export or proof of legacy parity. Reads the snapshot without
modifying it; retains mapped cells exactly and records omitted columns/metadata.
The existing importer quarantines unsupported values, including text where the
authoritative mapping requires binary. Never guess an encoding for those cells.
"""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3
import sys

sys.path.insert(0, str(Path(__file__).parent / 'windows'))
from convert_hfsql_ansi import update_typed_hash


def quote(name):
    return '"' + name.replace('"', '""') + '"'


def prepare(source, output, mapping):
    source, output = Path(source).resolve(), Path(output).resolve()
    fingerprint = hashlib.sha256(source.read_bytes()).hexdigest()
    manifest = {
        'prepared_at': datetime.now(timezone.utc).isoformat(),
        'provenance': 'existing-sqlite-snapshot-not-a-verified-hfsql-export',
        'source_sha256': fingerprint,
        'mapping_version': mapping['version'],
        'tables': {}, 'omitted_columns': {}, 'omitted_tables': [],
        'note': 'Mapped cells preserved as stored. Encoding/NULL fidelity to HFSQL is unverified. Use only for local development.',
    }
    with closing(sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)) as original:
        original.execute('BEGIN')
        if original.execute('PRAGMA quick_check').fetchone()[0] != 'ok':
            raise ValueError('Source SQLite integrity check failed')
        actual = {name.casefold(): name for name, in original.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        expected = {table['name'].casefold() for table in mapping['tables']}
        manifest['omitted_tables'] = sorted(name for key, name in actual.items() if key not in expected)
        # Validate all required schema before creating any output.
        projection = []
        for table in mapping['tables']:
            name = table['name']
            if name.casefold() not in actual:
                raise ValueError('Missing required table: ' + name)
            source_name = actual[name.casefold()]
            columns = [row[1] for row in original.execute('PRAGMA table_info(' + quote(source_name) + ')')]
            by_name = {column.casefold(): column for column in columns}
            selected = [column['sourceName'] for column in table['columns']]
            if any(column.casefold() not in by_name for column in selected):
                raise ValueError('Missing required column in ' + name)
            manifest['omitted_columns'][name] = [column for column in columns if column.casefold() not in {s.casefold() for s in selected}]
            projection.append((name, source_name, selected, [by_name[column.casefold()] for column in selected]))
        output.mkdir(parents=True, exist_ok=False)
        with closing(sqlite3.connect(output / 'data.sqlite')) as target, target:
            for name, source_name, selected, source_columns in projection:
                target.execute('CREATE TABLE ' + quote(name) + ' (' + ','.join(quote(c) for c in selected) + ')')
                insert = 'INSERT INTO ' + quote(name) + ' VALUES (' + ','.join('?' for _ in selected) + ')'
                typed, count = hashlib.sha256(), 0
                nulls, binary, storage = [0] * len(selected), [0] * len(selected), [set() for _ in selected]
                statement = 'SELECT ' + ','.join(quote(c) for c in source_columns) + ' FROM ' + quote(source_name) + ' ORDER BY rowid'
                for row in original.execute(statement):
                    if any(value is not None and not isinstance(value, (str, bytes)) for value in row):
                        raise ValueError('Source contains numeric storage; lossless conversion requires an explicit decision: ' + name)
                    target.execute(insert, row)
                    update_typed_hash(typed, row)
                    count += 1
                    for index, value in enumerate(row):
                        nulls[index] += value is None
                        binary[index] += isinstance(value, bytes)
                        storage[index].add('null' if value is None else 'blob' if isinstance(value, bytes) else 'text')
                if count != original.execute('SELECT count(*) FROM ' + quote(source_name)).fetchone()[0]:
                    raise ValueError('Source count changed: ' + name)
                manifest['tables'][name] = {
                    'rows': count, 'sha256_typed_rows': typed.hexdigest(),
                    'columns': [{'name': c, 'nulls': nulls[i], 'binary': binary[i], 'storage': sorted(storage[i])} for i, c in enumerate(selected)],
                }
            if hashlib.sha256(source.read_bytes()).hexdigest() != fingerprint:
                raise ValueError('Source changed during preparation')
            target.execute('CREATE TABLE __export (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
            target.execute('INSERT INTO __export VALUES (?,?)', ('manifest', json.dumps(manifest, ensure_ascii=False)))
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--out', type=Path, required=True, help='Fresh directory inside analysis-local/')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    scratch = (root / 'analysis-local').resolve()
    destination = args.out.resolve()
    if scratch not in destination.parents:
        parser.error('--out must be a fresh subdirectory of this repository\'s analysis-local/')
    mapping = json.loads((root / 'apps/server/src/db/column-mapping.v1.json').read_text(encoding='utf-8'))
    report = prepare(args.source, destination, mapping)
    print(json.dumps({'tables': len(report['tables']), 'rows': sum(t['rows'] for t in report['tables'].values()),
                      'source_unchanged': True, 'provenance': report['provenance'], 'out': str(destination)}, indent=2))


if __name__ == '__main__':
    main()
