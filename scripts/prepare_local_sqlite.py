#!/usr/bin/env python3
"""Project an existing SQLite snapshot into the development import contract.

This is NOT an HFSQL export or proof of legacy parity. Reads the snapshot without
modifying it; retains mapped cells exactly and records omitted columns/metadata.
The existing importer quarantines unsupported values, including text where the
authoritative mapping requires binary. The explicit stock-development derivative
is restricted to one fingerprint/count/typed-hash proof under ADR-017; it is not
a generic text-to-binary conversion or an official HFSQL export.
"""
import argparse
from contextlib import closing, ExitStack
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).parent / 'windows'))
from convert_hfsql_ansi import update_typed_hash

# ADR-017: finite-snapshot proof, deliberately not configurable at the CLI.
_STOCK_SOURCE_SHA256 = '5efd4f6b843d8a7b9f1e5453d4a1ae4c6e61fb6271373119413d68d455bd39af'
_STOCK_ROWS = 23615
_STOCK_LINK = 'Documento_codigodocumento_numero'
_STOCK_BEFORE_SHA256 = '227e497972dced00384f64ee7a8af5cbcc9d1c53a171f94cf61ae7e43f5217ea'
_STOCK_AFTER_SHA256 = '65778d26bac2d4b20c2c291700109e7fc4110e1cf2df675dcbab4b0757412fbd'


def quote(name):
    return '"' + name.replace('"', '""') + '"'


def _stock_derivative_proof(original, projection):
    candidates = [entry for entry in projection if entry[0] == 'lin_stocks']
    if len(candidates) != 1 or candidates[0][2].count(_STOCK_LINK) != 1:
        raise ValueError('Stock derivative requires the exact mapped stock link column')
    _, source_name, selected, source_columns = candidates[0]
    index = selected.index(_STOCK_LINK)
    before, after, count = hashlib.sha256(), hashlib.sha256(), 0
    statement = 'SELECT ' + ','.join(quote(c) for c in source_columns) + ' FROM ' + quote(source_name) + ' ORDER BY rowid'
    for row in original.execute(statement):
        if type(row[index]) is not str or row[index] != '':
            raise ValueError('Stock derivative requires every link cell to be empty TEXT')
        update_typed_hash(before, row)
        update_typed_hash(after, row[:index] + (b'',) + row[index + 1:])
        count += 1
    if count != _STOCK_ROWS:
        raise ValueError('Stock derivative row-count proof mismatch')
    if before.hexdigest() != _STOCK_BEFORE_SHA256:
        raise ValueError('Stock derivative before typed-hash proof mismatch')
    if after.hexdigest() != _STOCK_AFTER_SHA256:
        raise ValueError('Stock derivative after typed-hash proof mismatch')
    return {
        'decision': 'ADR-017', 'kind': 'provisional-stock-development-derivative',
        'table': 'lin_stocks', 'column': _STOCK_LINK,
        'operation': 'empty TEXT to empty BLOB only', 'changed_cells': count,
        'source_table_sha256_typed_rows': before.hexdigest(),
        'derivative_table_sha256_typed_rows': after.hexdigest(),
        'historical_driver_table_sha256_typed_rows': _STOCK_AFTER_SHA256,
        'note': 'Finite snapshot proof only. Not official full-database fidelity or production migration. No composite keys decoded.',
    }


def prepare(source, output, mapping, *, stock_development_derivative=False):
    source, output = Path(source).resolve(), Path(output).resolve()
    if output.exists():
        raise FileExistsError('Output already exists: ' + str(output))
    fingerprint = hashlib.sha256(source.read_bytes()).hexdigest()
    if stock_development_derivative and fingerprint != _STOCK_SOURCE_SHA256:
        raise ValueError('Stock derivative requires the exact ADR-017 source fingerprint')
    manifest = {
        'prepared_at': datetime.now(timezone.utc).isoformat(),
        'provenance': 'existing-sqlite-snapshot-not-a-verified-hfsql-export',
        'source_sha256': fingerprint,
        'mapping_version': mapping['version'],
        'tables': {}, 'omitted_columns': {}, 'omitted_tables': [],
        'note': 'Mapped cells preserved as stored. Encoding/NULL fidelity to HFSQL is unverified. Use only for local development.',
    }
    with ExitStack() as lifetime, closing(sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)) as original:
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
        if stock_development_derivative:
            manifest['development_repair'] = _stock_derivative_proof(original, projection)
            manifest['provenance'] = 'provisional-stock-development-derivative-not-a-verified-hfsql-export'
            manifest['note'] = 'Only the recorded empty stock link TEXT cells become empty BLOB. Other mapped cells remain exact; encoding/NULL fidelity to HFSQL is unverified. Local development only.'
            output.parent.mkdir(parents=True, exist_ok=True)
            staging = Path(lifetime.enter_context(tempfile.TemporaryDirectory(prefix='.stock-development-', dir=output.parent)))
        else:
            output.mkdir(parents=True, exist_ok=False)
            staging = output
        with closing(sqlite3.connect(staging / 'data.sqlite')) as target, target:
            for name, source_name, selected, source_columns in projection:
                target.execute('CREATE TABLE ' + quote(name) + ' (' + ','.join(quote(c) for c in selected) + ')')
                insert = 'INSERT INTO ' + quote(name) + ' VALUES (' + ','.join('?' for _ in selected) + ')'
                typed, count = hashlib.sha256(), 0
                nulls, binary, storage = [0] * len(selected), [0] * len(selected), [set() for _ in selected]
                statement = 'SELECT ' + ','.join(quote(c) for c in source_columns) + ' FROM ' + quote(source_name) + ' ORDER BY rowid'
                for row in original.execute(statement):
                    if stock_development_derivative and name == 'lin_stocks':
                        index = selected.index(_STOCK_LINK)
                        if type(row[index]) is not str or row[index] != '':
                            raise ValueError('Stock derivative requires every link cell to be empty TEXT')
                        row = row[:index] + (b'',) + row[index + 1:]
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
                if stock_development_derivative and name == 'lin_stocks' and (count != _STOCK_ROWS or typed.hexdigest() != _STOCK_AFTER_SHA256):
                    raise ValueError('Stock derivative output typed-hash proof mismatch')
            if hashlib.sha256(source.read_bytes()).hexdigest() != fingerprint:
                raise ValueError('Source changed during preparation')
            target.execute('CREATE TABLE __export (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
            target.execute('INSERT INTO __export VALUES (?,?)', ('manifest', json.dumps(manifest, ensure_ascii=False)))
        (staging / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        if stock_development_derivative:
            # Exclusive fresh directory prevents replacing even an empty existing output.
            # Both completed files are moved only after every source/count/hash gate passed.
            output.mkdir(exist_ok=False)
            (staging / 'data.sqlite').rename(output / 'data.sqlite')
            (staging / 'manifest.json').rename(output / 'manifest.json')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--out', type=Path, required=True, help='Fresh directory inside analysis-local/')
    parser.add_argument('--stock-development-derivative', action='store_true', help='Opt in to the exact ADR-017 snapshot-only empty stock-link type repair; fresh provisional development output only')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    scratch = (root / 'analysis-local').resolve()
    destination = args.out.resolve()
    if scratch not in destination.parents:
        parser.error('--out must be a fresh subdirectory of this repository\'s analysis-local/')
    mapping = json.loads((root / 'apps/server/src/db/column-mapping.v1.json').read_text(encoding='utf-8'))
    report = prepare(args.source, destination, mapping, stock_development_derivative=args.stock_development_derivative)
    print(json.dumps({'tables': len(report['tables']), 'rows': sum(t['rows'] for t in report['tables'].values()),
                      'source_unchanged': True, 'provenance': report['provenance'], 'out': str(destination)}, indent=2))


if __name__ == '__main__':
    main()
